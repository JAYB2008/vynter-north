import { NextRequest, NextResponse } from "next/server";
import { getCharacterById, createGenerationLog } from "@/lib/db";
import { enrichScenePrompt } from "@/lib/characterIntelligence";
import { BehaviorSettings } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterId, scenePrompt, settings } = body as {
      characterId?: string;
      scenePrompt?: string;
      settings?: BehaviorSettings;
    };

    if (!characterId) {
      return NextResponse.json({ error: "characterId is required" }, { status: 400 });
    }

    if (!scenePrompt || scenePrompt.trim() === "") {
      return NextResponse.json({ error: "scenePrompt is required" }, { status: 400 });
    }

    // 1. Fetch character and skills
    const character = await getCharacterById(characterId);
    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    if (!character.skills) {
      return NextResponse.json(
        { error: `Character "${character.name}" has no registered skill profile.` },
        { status: 422 }
      );
    }

    // 2. Enrich the scene prompt using Character Intelligence Layer
    const { enrichedPrompt, behaviorBreakdown, modelUsed } = await enrichScenePrompt(
      scenePrompt.trim(),
      character.skills,
      character.name,
      settings
    );

    // 3. Save generation log
    const log = await createGenerationLog({
      character_id: character.id,
      original_prompt: scenePrompt.trim(),
      enriched_prompt: enrichedPrompt,
    });

    return NextResponse.json({
      success: true,
      enrichedPrompt,
      behaviorBreakdown,
      generationLogId: log.id,
      modelUsed,
      character: {
        id: character.id,
        name: character.name,
        vibe_summary: character.skills.vibe_summary,
      },
    });
  } catch (error: unknown) {
    console.error("Error in /api/intelligence/enrich:", error);
    const message = error instanceof Error ? error.message : "Character Intelligence enrichment failed";
    return NextResponse.json(
      {
        error: message,
        fallbackMessage: "Could not enrich scene with character intelligence.",
      },
      { status: 500 }
    );
  }
}
