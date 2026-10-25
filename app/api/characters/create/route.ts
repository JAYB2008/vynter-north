import { NextRequest, NextResponse } from "next/server";
import { createCharacterWithSkills, checkCharacterNameAvailable } from "@/lib/db";
import { CharacterCreationFormData } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CharacterCreationFormData;

    if (!body.name || body.name.trim() === "") {
      return NextResponse.json({ error: "Character name is required" }, { status: 400 });
    }

    const isAvailable = await checkCharacterNameAvailable(body.name);
    if (!isAvailable) {
      return NextResponse.json(
        { error: `The name "${body.name}" is already taken. Please choose another.` },
        { status: 409 }
      );
    }

    // Compose vibe summary if omitted
    const vibe =
      body.vibe_summary ||
      `${body.core_trait || "Distinctive"} character characterized by a ${body.resting_expression?.toLowerCase() || "measured"} presence and ${body.speaking_pace?.toLowerCase() || "deliberate"} speech.`;

    const newCharacter = await createCharacterWithSkills({
      character: {
        name: body.name.trim(),
        description: body.description || "",
      },
      skills: {
        resting_expression: body.resting_expression || null,
        movement_style: body.movement_style || null,
        signature_gesture: body.signature_gesture || null,
        stress_reaction: body.stress_reaction || null,
        core_trait: body.core_trait || null,
        secondary_trait: body.secondary_trait || null,
        handles_danger: body.handles_danger || null,
        what_makes_laugh: body.what_makes_laugh || null,
        what_makes_angry: body.what_makes_angry || null,
        hidden_quality: body.hidden_quality || null,
        speaking_pace: body.speaking_pace || null,
        language_mixing: body.language_mixing || null,
        humor_style: body.humor_style || null,
        catchphrase: body.catchphrase || null,
        vibe_summary: vibe,
      },
    });

    return NextResponse.json({
      success: true,
      character: newCharacter,
      message: "Character and skills created successfully",
    });
  } catch (error: unknown) {
    console.error("Error creating character:", error);
    const message = error instanceof Error ? error.message : "Failed to create character";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
