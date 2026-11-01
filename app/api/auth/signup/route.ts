import { NextRequest, NextResponse } from "next/server";
import {
  hashPassword,
  generateRecoveryCode,
  hashRecoveryCode,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";
import { createAccount, getAccountByUsername } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      username,
      display_name,
      password,
      role = "creator",
      bio,
      creator_specialties,
      studio_name,
      studio_type,
      studio_focus,
      studio_pledge_accepted,
    } = body;

    // Validate inputs
    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_USERNAME", message: "Username is required." } },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(cleanUsername)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_USERNAME_FORMAT",
            message: "Username must be 3–24 letters, numbers, or underscores.",
          },
        },
        { status: 400 }
      );
    }

    if (!display_name || typeof display_name !== "string" || display_name.trim().length < 2) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "INVALID_DISPLAY_NAME", message: "Display name must be at least 2 characters." },
        },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "WEAK_PASSWORD", message: "Password must be at least 8 characters long." },
        },
        { status: 400 }
      );
    }

    // Check availability
    const existing = await getAccountByUsername(cleanUsername);
    if (existing) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "USERNAME_TAKEN", message: "That username is already taken. Choose another." },
        },
        { status: 409 }
      );
    }

    // Hash password and generate recovery code
    const password_hash = await hashPassword(password);
    const recoveryCode = generateRecoveryCode();
    const recovery_hash = await hashRecoveryCode(recoveryCode);

    const isCreator = role === "creator";
    const isStudio = role === "studio";

    const account = await createAccount({
      username: cleanUsername,
      display_name: display_name.trim(),
      password_hash,
      recovery_hash,
      has_creator: isCreator,
      has_studio: isStudio,
      active_mode: isCreator ? "creator" : "studio",
      onboarding_step: 3,
      onboarding_done: false,
      bio: bio || null,
      creator_specialties: Array.isArray(creator_specialties) ? creator_specialties : [],
      studio_name: studio_name || null,
      studio_type: studio_type || null,
      studio_focus: Array.isArray(studio_focus) ? studio_focus : [],
      studio_pledge_accepted: Boolean(studio_pledge_accepted),
    });

    // Sign session token and set httpOnly cookie
    const token = await createSessionToken(account.id);
    await setSessionCookie(token);

    const { password_hash: _p, recovery_hash: _r, ...safeAccount } = account;

    return NextResponse.json({
      ok: true,
      data: {
        account: safeAccount,
        recovery_code: recoveryCode,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "SIGNUP_FAILED",
          message: error.message || "Failed to create account. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
