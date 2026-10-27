import { NextRequest, NextResponse } from "next/server";
import {
  getProfileByAccountKey,
  getRentalByMcpToken,
  getCharacterById,
  getCharacterByName,
  incrementRentalCreditsUsed,
  logGeneration,
} from "@/lib/db";
import { enrichScene } from "@/lib/enrichment";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { scene, characterId, accountKey, mcpToken } = body;

    if (!scene || typeof scene !== "string" || !scene.trim()) {
      return NextResponse.json(
        { error: "Scene description is required." },
        { status: 400 }
      );
    }

    let authenticatedProfile = null;
    let activeRental = null;

    // 1. Validate authorization
    if (mcpToken) {
      activeRental = await getRentalByMcpToken(mcpToken);
      if (!activeRental) {
        return NextResponse.json(
          { error: "Invalid or expired MCP rental token." },
          { status: 401 }
        );
      }
      if (activeRental.status !== "active") {
        return NextResponse.json(
          { error: "Rental is no longer active." },
          { status: 403 }
        );
      }
      if (
        activeRental.expires_at &&
        new Date(activeRental.expires_at).getTime() < Date.now()
      ) {
        return NextResponse.json(
          { error: "Rental period has expired. Please renew your rental." },
          { status: 403 }
        );
      }
      const creditsLeft =
        activeRental.generation_credits - activeRental.credits_used;
      if (creditsLeft <= 0) {
        return NextResponse.json(
          {
            error:
              "Generation credit balance exhausted. Please add credits or upgrade your rental tier.",
            creditsRemaining: 0,
          },
          { status: 402 }
        );
      }
    } else if (accountKey) {
      authenticatedProfile = await getProfileByAccountKey(accountKey);
      if (!authenticatedProfile && accountKey !== "vn-test-key-001") {
        return NextResponse.json(
          { error: "Invalid Vynter North account key." },
          { status: 401 }
        );
      }
    }
    // Note: If called from public demo without auth key, we allow trial enrichment!

    // 2. Find character
    let character = null;
    if (activeRental?.character) {
      character = activeRental.character;
    } else if (characterId) {
      character =
        (await getCharacterById(characterId)) ||
        (await getCharacterByName(characterId));
    } else {
      // Default to Cairo if unspecified
      character = await getCharacterByName("Cairo");
    }

    if (!character) {
      return NextResponse.json(
        { error: `Character not found: ${characterId || "Cairo"}` },
        { status: 404 }
      );
    }

    // 3. Perform Character Enrichment
    const enrichment = await enrichScene({ character, scene });

    // 4. Update usage and log if rental token exists
    if (activeRental) {
      await incrementRentalCreditsUsed(activeRental.id, 1);
      await logGeneration({
        rental_id: activeRental.id,
        character_id: character.id,
        original_prompt: scene,
        enriched_prompt: enrichment.enriched_prompt,
        original_word_count: enrichment.word_count.original,
        enriched_word_count: enrichment.word_count.enriched,
        status: "kept",
      });
    }

    return NextResponse.json({
      success: true,
      character: enrichment.character,
      original_prompt: enrichment.original_prompt,
      enriched_prompt: enrichment.enriched_prompt,
      behavior_breakdown: enrichment.behavior_breakdown,
      word_count: enrichment.word_count,
      model_used: enrichment.model_used,
    });
  } catch (error: any) {
    console.error("Enrichment API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enrich scene." },
      { status: 500 }
    );
  }
}
