import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ ok: true, data: { message: "Signed out successfully." } });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "SIGNOUT_FAILED", message: error.message || "Failed to sign out." },
      },
      { status: 500 }
    );
  }
}
