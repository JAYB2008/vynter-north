import { NextRequest, NextResponse } from "next/server";
import { requireAccount } from "@/lib/auth";
import {
  getCharacterById,
  getCharacters,
  updateCharacter,
  recalculateCharacterFame,
} from "@/lib/db";
import { compute5WordShingles, computeJaccardSimilarity } from "@/lib/similarity";
import { createHash } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const account = await requireAccount();
    const { id } = await context.params;

    const character = await getCharacterById(id);
    if (!character) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Character not found." } },
        { status: 404 }
      );
    }

    if (character.owner_id !== account.id) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "You do not own this character." } },
        { status: 403 }
      );
    }

    // 1. Validation checks
    const minWords = parseInt(process.env.MIN_SHEET_WORDS || "1000", 10);
    const sheetText = character.full_sheet || character.full_character_sheet || "";
    const sheetWordCount = sheetText.trim().split(/\s+/).filter(Boolean).length;

    if (!character.name || character.name.trim().length < 2) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_NAME", message: "Character name is required." } },
        { status: 400 }
      );
    }

    if (!character.portrait_url && !character.avatar_url) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_PORTRAIT", message: "Character portrait image is required." } },
        { status: 400 }
      );
    }

    if (!character.core_trait) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_CORE_TRAIT", message: "Core trait is required." } },
        { status: 400 }
      );
    }

    if (sheetWordCount < minWords) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "SHEET_TOO_SHORT",
            message: `Personality sheet must contain at least ${minWords} words (current: ${sheetWordCount}).`,
          },
        },
        { status: 400 }
      );
    }

    // 2. Plan Limit Check
    const planLimits: Record<string, number> = {
      free: 1,
      starter: 3,
      creator: 10,
      studio: 99999,
    };
    const maxAllowed = planLimits[account.plan || "free"] || 1;
    const existingActive = await getCharacters({
      owner_id: account.id,
      status: "active",
    });

    if (existingActive.length >= maxAllowed && character.status !== "active") {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "PLAN_LIMIT_REACHED",
            message: `Your current ${account.plan} plan allows up to ${maxAllowed} active character(s). Upgrade your plan to publish more.`,
          },
        },
        { status: 403 }
      );
    }

    // 3. Similarity check (5-word-shingle Jaccard)
    const thisCombinedText = `${character.core_trait} ${sheetText}`;
    const thisShingles = compute5WordShingles(thisCombinedText);

    const otherCharacters = (await getCharacters({ status: "active" })).filter(
      (c) => c.id !== character.id
    );

    let maxSimilarity = 0;
    for (const other of otherCharacters) {
      const otherCombined = `${other.core_trait || ""} ${other.full_sheet || other.full_character_sheet || ""}`;
      const otherShingles = compute5WordShingles(otherCombined);
      const similarity = computeJaccardSimilarity(thisShingles, otherShingles);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
      }
    }

    if (maxSimilarity >= 0.7) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "SIMILARITY_TOO_HIGH",
            message:
              "This sheet is too close to an existing character. Change the personality, history and reactions so it stands apart.",
          },
        },
        { status: 409 }
      );
    }

    // 4. Compute registration hash
    const sheetHash = createHash("sha256").update(sheetText).digest("hex");
    const rawFingerprint = `${character.id}:${character.name}:${account.id}:${sheetHash}:${(
      character.gallery_urls || []
    ).join(",")}`;
    const registration_hash = createHash("sha256").update(rawFingerprint).digest("hex");

    const now = new Date().toISOString();
    const updated = await updateCharacter(character.id, {
      status: "active",
      published_at: now,
      registration_hash,
      sheet_word_count: sheetWordCount,
    });

    await recalculateCharacterFame(character.id);

    return NextResponse.json({
      ok: true,
      data: {
        character: updated,
        registration_hash,
        similarity_warning: maxSimilarity >= 0.5 ? "Similarity between 0.50 and 0.69 detected." : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "PUBLISH_FAILED", message: error.message || "Failed to publish character." },
      },
      { status: 500 }
    );
  }
}
