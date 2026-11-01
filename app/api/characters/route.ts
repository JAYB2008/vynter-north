import { NextRequest, NextResponse } from "next/server";
import { getCharacters, createCharacterDraft } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const genre = searchParams.get("genre") || undefined;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || "active";
    const sort = searchParams.get("sort") || undefined;
    const tier = searchParams.get("tier") || undefined;
    const price_filter = searchParams.get("price_filter") || undefined;
    const is_featured = searchParams.get("is_featured") === "true" ? true : undefined;
    const is_demo = searchParams.get("is_demo") === "true" ? true : undefined;
    const owner_id = searchParams.get("owner_id") || undefined;

    const session = await getSession();

    // If fetching for creator's own dashboard (owner_id matching session), allow drafts/all statuses
    const filterStatus = owner_id && session && session.id === owner_id ? undefined : status;

    const rawCharacters = await getCharacters({
      genre,
      search,
      status: filterStatus,
      sort,
      tier,
      price_filter,
      is_featured,
      is_demo,
      owner_id,
    });

    // Sanitization rule: Never render full sheet on public catalog
    const characters = rawCharacters.map((c) => {
      const isOwner = session && (session.id === c.owner_id || session.username === "admin");
      if (isOwner) return c;

      // Public view: redact full_sheet and internal behavior fields
      return {
        ...c,
        full_sheet: "", // Private
        behavior_social: null,
        behavior_conflict: null,
      };
    });

    return NextResponse.json({
      ok: true,
      data: { characters },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "CHARACTERS_FETCH_FAILED",
          message: err.message || "Failed to fetch characters",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to create a character.",
          },
        },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const newCharacter = await createCharacterDraft(session.id, body);

    return NextResponse.json({
      ok: true,
      data: { character: newCharacter },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "CHARACTER_CREATION_FAILED",
          message: err.message || "Failed to create character draft.",
        },
      },
      { status: 500 }
    );
  }
}
