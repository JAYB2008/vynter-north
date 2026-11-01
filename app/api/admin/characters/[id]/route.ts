import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { getCharacterById, updateCharacter } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session)) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Admin access required." } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const character = await getCharacterById(id);
    if (!character) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Character not found." } },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const updates: any = {};

    if (typeof body.is_featured === "boolean") updates.is_featured = body.is_featured;
    if (typeof body.is_demo === "boolean") updates.is_demo = body.is_demo;
    if (typeof body.is_legend === "boolean") {
      updates.is_legend = body.is_legend;
      if (body.is_legend) updates.fame_tier = "legend";
    }
    if (body.suspend === true) {
      updates.status = "suspended";
    } else if (body.suspend === false && character.status === "suspended") {
      updates.status = "active";
    }

    const updated = await updateCharacter(id, updates);

    return NextResponse.json({
      ok: true,
      data: { character: updated },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "UPDATE_FAILED", message: err.message || "Failed to update character admin flags." } },
      { status: 500 }
    );
  }
}
