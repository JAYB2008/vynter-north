import { NextRequest, NextResponse } from "next/server";
import { getCharacters } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name")?.trim();
    const currentCharacterId = searchParams.get("character_id")?.trim();

    if (!name) {
      return NextResponse.json({
        ok: true,
        data: { available: true, message: "Provide a character name." },
      });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({
        ok: true,
        data: { available: true, message: "Name is available." },
      });
    }

    // Check against THIS creator's characters (case-insensitive)
    const myCharacters = await getCharacters({ owner_id: session.id });
    const duplicate = myCharacters.find(
      (c) =>
        c.name.trim().toLowerCase() === name.toLowerCase() &&
        c.id !== currentCharacterId &&
        c.status !== "deleted"
    );

    if (duplicate) {
      return NextResponse.json({
        ok: true,
        data: {
          available: false,
          message: "You already have a character with this name in your catalog.",
        },
      });
    }

    // Platform-wide note
    const allCharacters = await getCharacters();
    const platformDuplicate = allCharacters.find(
      (c) =>
        c.name.trim().toLowerCase() === name.toLowerCase() &&
        c.id !== currentCharacterId
    );

    return NextResponse.json({
      ok: true,
      data: {
        available: true,
        note: platformDuplicate
          ? "Another creator uses this name, but your CVR registration ID will make your character unique."
          : null,
        message: "Name is available.",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "NAME_CHECK_FAILED",
          message: error.message || "Failed to check name availability.",
        },
      },
      { status: 500 }
    );
  }
}
