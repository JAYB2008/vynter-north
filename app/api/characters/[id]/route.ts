import { NextRequest, NextResponse } from "next/server";
import {
  getCharacterById,
  updateCharacter,
  deleteCharacter,
  getReviewsByCharacterId,
  getReelScenesByCharacter,
} from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function truncateExcerpt(text: string | null | undefined, maxChars = 140): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return trimmed.slice(0, maxChars).trim() + "…";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const character = await getCharacterById(id);
    if (!character) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_FOUND",
            message: "Character not found.",
          },
        },
        { status: 404 }
      );
    }

    const session = await getSession();
    const isOwner =
      session &&
      (session.id === character.owner_id ||
        (process.env.ADMIN_USERNAMES || "")
          .toLowerCase()
          .split(",")
          .map((s) => s.trim())
          .includes(session.username.toLowerCase()));

    // Fetch reel scenes and reviews
    const reviews = await getReviewsByCharacterId(character.id);
    const reelScenes = await getReelScenesByCharacter(character.id);

    // If caller is NOT owner, enforce Section 7.3 privacy rules:
    // "core trait and vibe shown in full; three situation behaviours (danger / funny / emotional)
    // shown as ~140-character excerpts followed by '…' and a lock row: 'Full sheet: 3,420 words'
    // Never render the full sheet or any field beyond the excerpt in HTML, JSON or the network response."
    let sanitizedCharacter = { ...character };
    if (!isOwner) {
      sanitizedCharacter = {
        ...character,
        full_sheet: "", // Strictly redacted
        behavior_danger: truncateExcerpt(character.behavior_danger, 140),
        behavior_funny: truncateExcerpt(character.behavior_funny, 140),
        behavior_emotional: truncateExcerpt(character.behavior_emotional, 140),
        behavior_social: null, // Locked
        behavior_conflict: null, // Locked
      };
    }

    return NextResponse.json({
      ok: true,
      data: {
        character: sanitizedCharacter,
        reviews,
        reelScenes,
        isOwner: Boolean(isOwner),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "CHARACTER_FETCH_FAILED",
          message: err.message || "Failed to fetch character details.",
        },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to update this character.",
          },
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const existing = await getCharacterById(id);
    if (!existing) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "NOT_FOUND", message: "Character not found." },
        },
        { status: 404 }
      );
    }

    const isAdminUser = (process.env.ADMIN_USERNAMES || "")
      .toLowerCase()
      .split(",")
      .map((s) => s.trim())
      .includes(session.username.toLowerCase());

    if (existing.owner_id !== session.id && !isAdminUser) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "FORBIDDEN",
            message: "You do not have permission to edit this character.",
          },
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const updated = await updateCharacter(id, body);

    return NextResponse.json({
      ok: true,
      data: { character: updated },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UPDATE_FAILED",
          message: err.message || "Failed to update character.",
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return PATCH(req, ctx);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to delete this character.",
          },
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const existing = await getCharacterById(id);
    if (!existing) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "NOT_FOUND", message: "Character not found." },
        },
        { status: 404 }
      );
    }

    const isAdminUser = (process.env.ADMIN_USERNAMES || "")
      .toLowerCase()
      .split(",")
      .map((s) => s.trim())
      .includes(session.username.toLowerCase());

    if (existing.owner_id !== session.id && !isAdminUser) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "FORBIDDEN",
            message: "You do not have permission to delete this character.",
          },
        },
        { status: 403 }
      );
    }

    const result = await deleteCharacter(id);
    if (!result.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "DELETION_BLOCKED",
            message:
              result.reason ||
              "Cannot delete character while rentals or grace periods are active.",
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: { message: "Character deleted successfully." },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "DELETION_FAILED",
          message: err.message || "Failed to delete character.",
        },
      },
      { status: 500 }
    );
  }
}
