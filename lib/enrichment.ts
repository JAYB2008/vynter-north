import { Character, BehaviorBreakdown, EnrichmentOutput } from "./types";
import { callNvidiaNIM } from "./nvidia";

export const ENRICHMENT_SYSTEM_PROMPT = `You are the Character Intelligence Layer for Vynter North.

Your single purpose: read a scene description and a 
character's complete personality profile, then rewrite 
that scene as a precise behavioral prompt for an AI 
video generator.

THE STUDIO DOES NOT WANT TO WRITE PERSONALITY DETAILS.
They just describe what happens. You apply who the 
character IS to what happens.

CRITICAL RULES:
1. The character profile is absolute. Never break it.
2. Be surgically specific to THIS character. 
   Generic behavior is a failure.
3. If the scene creates tension with the personality 
   (e.g. a performative character in a genuinely 
   vulnerable moment), show exactly how that tension 
   manifests — never ignore either.
4. The enriched_prompt must read like professional 
   film direction. Natural, visual, present tense.
   Not a list of instructions.
5. Include specific: facial expression, body language, 
   emotional state, how they speak/sound, and how their 
   unique traits change this specific scene.
6. Output ONLY valid JSON. Zero preamble. Zero explanation.

OUTPUT FORMAT:
{
  "facial_expression": "exact description of their face in this moment and why",
  "body_language": "specific physical behavior, posture, and movement",
  "emotional_state": "what they are experiencing internally as it shows externally",
  "dialogue_direction": "how they would speak right now — pace, tone, volume, what kind of content. Never write their actual words.",
  "scene_integration": "how their specific personality traits change this scene from what it would be with a generic character",
  "enriched_prompt": "the complete scene description rewritten with all behavioral detail woven in naturally — this is the final prompt for the video generator"
}`;

export function buildCharacterSkillDocument(character: Character): string {
  return `CHARACTER: ${character.name}
ID: ${character.id}

VIBE: ${character.vibe_summary}

CORE PERSONALITY: ${character.core_trait}
${character.secondary_trait ? "Secondary trait: " + character.secondary_trait : ""}

FULL CHARACTER PROFILE:
${character.full_character_sheet}

SPECIFIC BEHAVIORAL PATTERNS:

In dangerous situations: ${character.behavior_dangerous}

In funny/comedic situations: ${character.behavior_funny}

In emotional moments: ${character.behavior_emotional}

In social/crowd situations: ${character.behavior_social}

In conflict: ${character.behavior_conflict}

PHYSICAL PRESENCE:
Appearance: ${character.physical_appearance}
Movement: ${character.movement_style}
${character.signature_gesture ? "Signature gesture: " + character.signature_gesture : ""}

VOICE AND SPEECH:
Voice quality: ${character.voice_description}
Speaking style: ${character.speaking_style}
${character.verbal_habits ? "Verbal habits: " + character.verbal_habits : ""}
${
  character.voice_analyzed_description
    ? "Voice analysis: " + character.voice_analyzed_description
    : ""
}

HIDDEN QUALITY: ${character.hidden_quality || "Not specified"}
GREATEST FEAR: ${character.greatest_fear || "Not specified"}`;
}

export function parseEnrichmentJSON(rawText: string): BehaviorBreakdown {
  let cleaned = rawText.trim();

  // Strip code fences
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
  }

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        facial_expression:
          parsed.facial_expression || "Composed, subtle tension around eyes",
        body_language:
          parsed.body_language || "Calculated physical presence, grounded posture",
        emotional_state:
          parsed.emotional_state || "Internal vigilance masked by surface persona",
        dialogue_direction:
          parsed.dialogue_direction ||
          "Controlled rhythm, intentional pauses before responding",
        scene_integration:
          parsed.scene_integration ||
          "Transforms the routine moment into a character-defining display",
        enriched_prompt:
          parsed.enriched_prompt ||
          parsed.prompt ||
          cleaned,
      };
    } catch {
      // Fall through
    }
  }

  try {
    const direct = JSON.parse(cleaned);
    return {
      facial_expression: direct.facial_expression || "Intense, focused expression",
      body_language: direct.body_language || "Controlled and intentional posture",
      emotional_state: direct.emotional_state || "Heightened awareness",
      dialogue_direction: direct.dialogue_direction || "Paced and distinctive delivery",
      scene_integration: direct.scene_integration || "Applied personality dynamics",
      enriched_prompt: direct.enriched_prompt || cleaned,
    };
  } catch {
    throw new Error(`Invalid JSON format from AI model: ${cleaned.slice(0, 160)}...`);
  }
}

/**
 * Intelligent character fallback synthesizer in case the API is completely unreachable
 */
export function synthesizeFallbackEnrichment(
  character: Character,
  scene: string
): BehaviorBreakdown {
  const name = character.name;
  const isCairo = name.toLowerCase().includes("cairo");
  const isSable = name.toLowerCase().includes("sable");
  const isDrew = name.toLowerCase().includes("drew");

  if (isCairo) {
    return {
      facial_expression:
        "Chin lifted with an exaggerated smirk that masks acute vigilance; eyes darting subtly sideways to assess who is watching before snapping back into a rehearsed expression of effortless superiority.",
      body_language:
        "Enters taking up deliberate space with a wide stance and signature sideways lean. Chest pushed forward, refusing to duck or shrink. Shoulders locked into performative composure, every step calculated to look casual.",
      emotional_state:
        "Acute underlying panic concealed beneath theatrical confidence. Terrified of having his competence questioned, he aggressively overcorrects by projecting unflappable certainty.",
      dialogue_direction:
        "Rapid, rhythmic cadence, commentating under his breath to control the room. Medium-deep vocal register that strains tighter at the edges under genuine pressure.",
      scene_integration:
        "Turns a tense, simple situation into a private stage where he performs absolute mastery, even while his pulse races.",
      enriched_prompt: `${scene.trim()} ${name} crosses the threshold with a deliberate sideways tilt, instantly claiming the room with a wide, calculated stance and head tilted high. His chest is out and his chin is up in a posture of performative ease. A razor-thin smirk masks the slight flicker in his eyes as he takes in the hostile energy. For one silent second his face drops flat as the reality hits, then snaps immediately back into sharp showmanship. He adjusts his jacket cuffs with theatrical precision, taking up space without hesitation, his voice dropping into a smooth, resonant cadence that just barely conceals the tension tightening in his throat.`,
    };
  }

  if (isSable) {
    return {
      facial_expression:
        "Unblinking, neutral gaze that lingers a beat longer than comfortable; jaw relaxed but immovable, devoid of hesitation or theatricality.",
      body_language:
        "Absolute economical stillness. Weight settled imperceptibly on her back foot, posture straight and compact. Not a millimeter of wasted movement.",
      emotional_state:
        "Total situational awareness and calm calculation. While the environment accelerates, she slows down, having already calculated three moves ahead.",
      dialogue_direction:
        "Slow, measured, and flat. Long intentional silence before speaking. Drops the exact names of those she addresses with low, unshakeable resonance.",
      scene_integration:
        "Absorbs the tension without reacting, establishing control through silence and surgical economy of action.",
      enriched_prompt: `${scene.trim()} ${name} occupies exactly the space she needs, standing in absolute, unnerving stillness with her weight balanced securely on her back foot. Her gaze holds steady and unhurried, scanning the environment without shifting her shoulders. A single deliberate blink marks the moment she processes the entire situation and calculates what comes next. As tension spikes around her, she does not flinch or raise her posture; she remains grounded and silent, stepping forward with low, soundless precision.`,
    };
  }

  if (isDrew) {
    return {
      facial_expression:
        "Eyes wide and bright with chaotic problem-solving energy; eyebrows raised high, quick self-deprecating grin breaking through sudden realization.",
      body_language:
        "Perpetual forward lean, hands gesticulating rapidly mid-air as if molding invisible solutions. Constantly shifting weight, running a hand through hair.",
      emotional_state:
        "Genuinely earnest panic blended with unstoppable optimism. Desperately wants everyone to be okay, willing to look foolish if it helps fix the issue.",
      dialogue_direction:
        "Fast, warm, frequently cutting off their own sentence with a sudden new idea. Vocal pitch climbing as excitement and pressure mount.",
      scene_integration:
        "Injects kinetic warmth and chaotic ingenuity, breaking tension by impulsively diving straight into the problem.",
      enriched_prompt: `${scene.trim()} ${name} rushes forward with kinetic warmth, leaning in close before realizing they have stepped directly into everyone's personal space. Their hands move non-stop, gesturing and adjusting anything in reach as their thoughts outrun their speech. Running a hand through their hair, they flash a nervous, disarming smile that somehow reassures everyone around them. Their voice lifts with enthusiastic urgency as they scramble to patch things together, turning the crisis into a collaborative, chaotic mission.`,
    };
  }

  // Generic customized based on character fields
  return {
    facial_expression: `Subtle expression reflecting their core trait: ${character.core_trait}. Eyes alert and assessing.`,
    body_language: `${character.movement_style}. Posture and physical mannerisms reinforce their presence.`,
    emotional_state: `Driven by internal conflict: ${character.core_trait}, while guarding ${character.hidden_quality || "their deeper vulnerability"}.`,
    dialogue_direction: `${character.speaking_style}. Vocal delivery matches: ${character.voice_description}.`,
    scene_integration: `Infuses the scene with their specific behavioral patterns: ${character.vibe_summary}.`,
    enriched_prompt: `${scene.trim()} ${name} moves with distinct intention (${character.movement_style}). Guided by their nature as ${character.core_trait}, they project ${character.vibe_summary}, their presence immediately shifting the rhythm of the space as their distinctive mannerisms and voice (${character.voice_description}) take command of the scene.`,
  };
}

export async function enrichScene({
  character,
  scene,
}: {
  character: Character;
  scene: string;
}): Promise<EnrichmentOutput> {
  const skillDoc = buildCharacterSkillDocument(character);

  const userMessage = `CHARACTER PROFILE:
${skillDoc}

SCENE TO ENRICH:
${scene}`;

  let breakdown: BehaviorBreakdown;
  let modelUsed = "meta/llama-3.1-8b-instruct";

  try {
    const rawAiOutput = await callNvidiaNIM({
      messages: [
        { role: "system", content: ENRICHMENT_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });
    breakdown = parseEnrichmentJSON(rawAiOutput);
    modelUsed = "meta/llama-3.2-11b-vision-instruct";
  } catch (err: any) {
    console.warn("NVIDIA NIM AI generation error, using character synthesizer:", err.message);
    breakdown = synthesizeFallbackEnrichment(character, scene);
    modelUsed = "vynter-intelligence-engine-fallback";
  }

  const originalWords = scene.trim().split(/\s+/).filter(Boolean).length || 1;
  const enrichedWords =
    breakdown.enriched_prompt.trim().split(/\s+/).filter(Boolean).length || 1;
  const multiplier = (enrichedWords / originalWords).toFixed(1);

  return {
    success: true,
    character: {
      id: character.id,
      name: character.name,
      vibe_summary: character.vibe_summary,
    },
    original_prompt: scene,
    enriched_prompt: breakdown.enriched_prompt,
    behavior_breakdown: breakdown,
    word_count: {
      original: originalWords,
      enriched: enrichedWords,
      multiplier,
    },
    model_used: modelUsed,
  };
}
