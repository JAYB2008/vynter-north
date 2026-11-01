import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { applyToCastingCall, getCharacterById, createNotification } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Sign in required." } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { character_id, message } = body;

    if (!character_id) {
      return NextResponse.json(
        { ok: false, error: { code: "BAD_REQUEST", message: "character_id is required." } },
        { status: 400 }
      );
    }

    const character = await getCharacterById(character_id);
    if (!character) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Character not found." } },
        { status: 404 }
      );
    }

    const application = await applyToCastingCall(id, character.id, message || "");

    return NextResponse.json({
      ok: true,
      data: { application, message: "Application submitted successfully." },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "APPLICATION_FAILED", message: err.message || "Failed to submit application." } },
      { status: 500 }
    );
  }
}
