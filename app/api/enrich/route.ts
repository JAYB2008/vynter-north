import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getCharacterById,
  getRentalsByStudio,
  createGeneration,
  getGenerationsBySceneGroup,
  incrementRentalCreditsUsed,
} from "@/lib/db";
import { enrichScene } from "@/lib/enrichment";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      character_id,
      scene,
      scene_group = randomUUID(),
      source = "web",
      also_present = [],
    } = body;

    if (!scene || typeof scene !== "string" || !scene.trim()) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "SCENE_REQUIRED",
            message: "Scene text is required.",
          },
        },
        { status: 400 }
      );
    }

    if (!character_id) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "CHARACTER_REQUIRED",
            message: "Please select a character.",
          },
        },
        { status: 400 }
      );
    }

    const character = await getCharacterById(character_id);
    if (!character) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "NOT_FOUND", message: "Character not found." },
        },
        { status: 404 }
      );
    }

    if (character.status === "suspended") {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "CHARACTER_SUSPENDED",
            message: "This character is currently suspended by administration.",
          },
        },
        { status: 403 }
      );
    }

    const session = await getSession();
    let rental: any = null;
    let accessType: string = "denied";

    // Access Check (Section 11)
    if (session && session.id === character.owner_id) {
      accessType = "owner_test";
    } else if (character.is_demo) {
      accessType = "demo";
    } else if (session) {
      const myRentals = await getRentalsByStudio(session.id);
      const activeOrGrace = myRentals.find(
        (r) =>
          r.character_id.toUpperCase() === character.id.toUpperCase() &&
          !r.ended_early
      );

      if (activeOrGrace) {
        const now = Date.now();
        const expiresAt = activeOrGrace.expires_at
          ? new Date(activeOrGrace.expires_at).getTime()
          : Infinity;
        const graceAt = activeOrGrace.grace_ends_at
          ? new Date(activeOrGrace.grace_ends_at).getTime()
          : Infinity;

        if (now < expiresAt) {
          rental = activeOrGrace;
          accessType = activeOrGrace.kind;
        } else if (now < graceAt) {
          return NextResponse.json(
            {
              ok: false,
              error: {
                code: "RENTAL_IN_GRACE",
                message: `${character.name}'s rental period has ended. It is in the 10-day grace period — renew in your library to continue enriching scenes.`,
              },
            },
            { status: 403 }
          );
        } else {
          return NextResponse.json(
            {
              ok: false,
              error: {
                code: "RENTAL_EXPIRED",
                message: `${character.name}'s rental and grace period have expired.`,
              },
            },
            { status: 403 }
          );
        }
      }
    }

    if (accessType === "denied" && !character.is_demo) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "ACCESS_DENIED",
            message: `You do not have an active rental for ${character.name}. Start a free 3-day trial or rental to enrich scenes.`,
          },
        },
        { status: 403 }
      );
    }

    // Check credits if applicable
    if (rental) {
      const creditsRemaining = rental.credits_total - rental.credits_used;
      if (creditsRemaining <= 0) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "NO_CREDITS",
              message: "Your credit balance is exhausted. Top up credits or renew your term in your library.",
            },
          },
          { status: 402 }
        );
      }
    }

    // Check scene group retries count (Section 9.2: up to 10 free previews per group)
    const existingInGroup = await getGenerationsBySceneGroup(scene_group);
    const previewCount = existingInGroup.length;
    let autoCharge = false;
    if (previewCount >= 10 && rental) {
      autoCharge = true;
      await incrementRentalCreditsUsed(rental.id, 1);
    }

    // Call Character Intelligence Layer
    const result = await enrichScene({
      character,
      scene,
      behavior_settings: rental?.settings,
      also_present,
    });

    // Save generation log with status "preview" (Section 9.2)
    const generation = await createGeneration({
      rental_id: rental?.id || null,
      character_id: character.id,
      account_id: session?.id || null,
      scene_group,
      source: source as any,
      scene_text: scene,
      enriched_prompt: result.enriched_prompt,
      breakdown: {
        facial_expression: result.facial_expression,
        body_language: result.body_language,
        emotional_state: result.emotional_state,
        dialogue_direction: result.dialogue_direction,
        scene_integration: result.scene_integration,
      },
      analysis: result.scene_analysis,
      status: "preview",
      charged: autoCharge,
    });

    return NextResponse.json({
      ok: true,
      data: {
        generation_id: generation.id,
        scene_group,
        preview_index: previewCount + 1,
        free_previews_remaining: Math.max(0, 10 - previewCount),
        charged_immediately: autoCharge,
        is_trial: accessType === "trial",
        ...result,
      },
    });
  } catch (err: any) {
    console.error("Enrichment API error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "ENRICHMENT_FAILED",
          message:
            err.message ||
            "Intelligence engine was unable to enrich this scene. Check your inputs and try again.",
        },
      },
      { status: 500 }
    );
  }
}
