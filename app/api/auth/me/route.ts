import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const account = await getSession();
    if (!account) {
      return NextResponse.json({ ok: true, data: null });
    }

    // Return sanitized account (no password or recovery hash)
    const { password_hash, recovery_hash, ...safeAccount } = account;
    return NextResponse.json({ ok: true, data: safeAccount });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "AUTH_ERROR", message: error.message || "Failed to load session" },
      },
      { status: 500 }
    );
  }
}
