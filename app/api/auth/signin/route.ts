import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassword,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";
import {
  getAccountByUsername,
  checkLoginAttempts,
  logLoginAttempt,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (!username || !password) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "MISSING_CREDENTIALS", message: "Username and password are required." },
        },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check rate limit throttle: 5 failed attempts per username+IP per 10 minutes
    const throttle = await checkLoginAttempts(cleanUsername, ip);
    if (!throttle.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "THROTTLED",
            message: `Too many failed login attempts. Please wait ${throttle.waitMinutes || 10} minutes before trying again.`,
          },
        },
        { status: 429 }
      );
    }

    const account = await getAccountByUsername(cleanUsername);
    if (!account) {
      await logLoginAttempt(cleanUsername, ip, false);
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Incorrect username or password. Check your details and try again.",
          },
        },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, account.password_hash);
    if (!isValid) {
      await logLoginAttempt(cleanUsername, ip, false);
      const remaining = throttle.remainingAttempts - 1;
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: `Incorrect username or password. ${
              remaining > 0
                ? `${remaining} attempt(s) remaining.`
                : "Account temporarily locked for 10 minutes."
            }`,
          },
        },
        { status: 401 }
      );
    }

    // Success
    await logLoginAttempt(cleanUsername, ip, true);

    const token = await createSessionToken(account.id);
    await setSessionCookie(token);

    const { password_hash: _p, recovery_hash: _r, ...safeAccount } = account;

    return NextResponse.json({
      ok: true,
      data: { account: safeAccount },
    });
  } catch (error: any) {
    console.error("Signin error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "SIGNIN_FAILED",
          message: error.message || "Failed to sign in. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
