import { NextRequest, NextResponse } from "next/server";
import { getAllCharacters, createCharacter } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const genre = searchParams.get("genre") || undefined;
    const search = searchParams.get("search") || undefined;
    const type = searchParams.get("type") || undefined;
    const sort = searchParams.get("sort") || undefined;

    const characters = await getAllCharacters({ genre, search, type, sort });
    return NextResponse.json({ characters });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch characters" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!body.name || !body.vibe_summary || !body.full_character_sheet) {
      return NextResponse.json(
        { error: "Character name, vibe summary, and full character sheet are required." },
        { status: 400 }
      );
    }

    const newCharacter = await createCharacter(body);
    return NextResponse.json({ success: true, character: newCharacter });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create character" },
      { status: 500 }
    );
  }
}
