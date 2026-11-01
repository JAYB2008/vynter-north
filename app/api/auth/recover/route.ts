import { NextRequest, NextResponse } from "next/server";
import {
  hashPassword,
  verifyRecoveryCode,
  generateRecoveryCode,
  hashRecoveryCode,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";
import { getAccountByUsername, updateAccount } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, recovery_code, new_password } = body;

    if (!username || !recovery_code || !new_password) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "MISSING_FIELDS",
            message: "Username, recovery code, and new password are required.",
          },
        },
        { status: 400 }
      );
    }

    if (new_password.length < 8) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "WEAK_PASSWORD",
            message: "New password must be at least 8 characters long.",
          },
        },
        { status: 400 }
      );
    }

    let cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.includes("@")) {
      cleanUsername = cleanUsername.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
    }
    const account = await getAccountByUsername(cleanUsername);

    if (!account) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "ACCOUNT_NOT_FOUND",
            message: "Account not found or invalid recovery code.",
          },
        },
        { status: 404 }
      );
    }

    const isValidCode = await verifyRecoveryCode(
      recovery_code,
      account.recovery_hash
    );

    if (!isValidCode) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_RECOVERY_CODE",
            message: "The recovery code entered does not match our records.",
          },
        },
        { status: 401 }
      );
    }

    // Hash new password and generate a replacement recovery code
    const newPasswordHash = await hashPassword(new_password);
    const newRecoveryCode = generateRecoveryCode();
    const newRecoveryHash = await hashRecoveryCode(newRecoveryCode);

    const updated = await updateAccount(account.id, {
      password_hash: newPasswordHash,
      recovery_hash: newRecoveryHash,
    });

    if (!updated) {
      throw new Error("Failed to update account credentials.");
    }

    // Automatically sign in with new session
    const token = await createSessionToken(updated.id);
    await setSessionCookie(token);

    const { password_hash: _p, recovery_hash: _r, ...safeAccount } = updated;

    return NextResponse.json({
      ok: true,
      data: {
        message: "Password reset successfully. A new recovery code has been issued.",
        new_recovery_code: newRecoveryCode,
        account: safeAccount,
      },
    });
  } catch (error: any) {
    console.error("Recovery error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "RECOVERY_FAILED",
          message: error.message || "Failed to reset password. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
