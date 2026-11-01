import { NextRequest, NextResponse } from "next/server";
import { requireAccount, verifyPassword, hashPassword } from "@/lib/auth";
import { updateAccount } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const account = await requireAccount();
    const body = await req.json();
    const { current_password, new_password } = body;

    if (!current_password || !new_password) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_FIELDS", message: "Current and new password are required." } },
        { status: 400 }
      );
    }

    if (new_password.length < 8) {
      return NextResponse.json(
        { ok: false, error: { code: "WEAK_PASSWORD", message: "New password must be at least 8 characters long." } },
        { status: 400 }
      );
    }

    const isValid = await verifyPassword(current_password, account.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_CURRENT_PASSWORD", message: "Current password is incorrect." } },
        { status: 401 }
      );
    }

    const newHash = await hashPassword(new_password);
    await updateAccount(account.id, { password_hash: newHash });

    return NextResponse.json({ ok: true, data: { message: "Password updated successfully." } });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "PASSWORD_CHANGE_FAILED", message: error.message || "Failed to change password." },
      },
      { status: 500 }
    );
  }
}
