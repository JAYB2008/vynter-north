import { NextRequest, NextResponse } from "next/server";
import {
  getCharacterById,
  updateCharacter,
  getReviewsByCharacterId,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const character = await getCharacterById(id);
    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }
    const reviews = await getReviewsByCharacterId(character.id);
    return NextResponse.json({ character, reviews });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch character" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const updated = await updateCharacter(id, body);
    if (!updated) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, character: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update character" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updated = await updateCharacter(id, { status: "deleted" });
    return NextResponse.json({ success: true, message: "Character deleted" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete character" },
      { status: 500 }
    );
  }
}
