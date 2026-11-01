import { NextRequest, NextResponse } from "next/server";
import { requireAccount } from "@/lib/auth";
import { updateAccount } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const account = await requireAccount();
    const body = await req.json();
    const {
      role,
      bio,
      creator_specialties,
      studio_name,
      studio_type,
      studio_focus,
      studio_pledge_accepted,
    } = body;

    if (role !== "creator" && role !== "studio") {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_ROLE", message: "Role must be creator or studio." } },
        { status: 400 }
      );
    }

    const updates: any = { active_mode: role };

    if (role === "creator") {
      updates.has_creator = true;
      if (bio) updates.bio = bio;
      if (Array.isArray(creator_specialties)) {
        updates.creator_specialties = creator_specialties;
      }
    } else if (role === "studio") {
      updates.has_studio = true;
      if (studio_name) updates.studio_name = studio_name;
      if (studio_type) updates.studio_type = studio_type;
      if (Array.isArray(studio_focus)) updates.studio_focus = studio_focus;
      if (typeof studio_pledge_accepted === "boolean") {
        updates.studio_pledge_accepted = studio_pledge_accepted;
      }
    }

    const updated = await updateAccount(account.id, updates);
    if (!updated) {
      throw new Error("Failed to add role.");
    }

    const { password_hash: _p, recovery_hash: _r, ...safeAccount } = updated;
    return NextResponse.json({ ok: true, data: safeAccount });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "ADD_ROLE_FAILED", message: error.message || "Failed to add role." },
      },
      { status: 500 }
    );
  }
}
