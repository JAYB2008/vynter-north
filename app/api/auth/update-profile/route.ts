import { NextRequest, NextResponse } from "next/server";
import { requireAccount } from "@/lib/auth";
import { updateAccount } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const account = await requireAccount();
    const body = await req.json();
    const { display_name, bio, avatar_url, website } = body;

    const updates: any = {};
    if (typeof display_name === "string" && display_name.trim().length >= 2) {
      updates.display_name = display_name.trim();
    }
    if (typeof bio === "string") updates.bio = bio.trim();
    if (typeof avatar_url === "string") updates.avatar_url = avatar_url.trim() || null;
    if (typeof website === "string") updates.website = website.trim() || null;

    const updated = await updateAccount(account.id, updates);
    if (!updated) {
      throw new Error("Failed to update profile.");
    }

    const { password_hash: _p, recovery_hash: _r, ...safeAccount } = updated;
    return NextResponse.json({ ok: true, data: safeAccount });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "UPDATE_PROFILE_FAILED", message: error.message || "Failed to update profile." },
      },
      { status: 500 }
    );
  }
}
