export interface EnrichmentBehaviorBreakdown {
  facial_expression: string;
  body_language: string;
  emotional_state: string;
  dialogue_direction: string;
}

export interface EnrichmentResponse {
  facial_expression: string;
  body_language: string;
  emotional_state: string;
  dialogue_direction: string;
  enriched_prompt: string;
  // Convenience aliases for camelCase consumers
  enrichedPrompt?: string;
  behaviorBreakdown?: EnrichmentBehaviorBreakdown;
  characterName?: string;
  modelUsed?: string;
}

export const VALID_ACCOUNT_KEY = "vn-test-key-001";

export const CAIRO_PROFILE = {
  characterId: "cairo-001",
  characterName: "Cairo",
  skills: {
    core_trait: "Overconfident but genuinely skilled",
    movement: "Sideways lean, plants feet wide, very deliberate stops",
    stress_reaction: "Gets louder and more performative when scared",
    hidden_quality: "Goes completely quiet and competent when someone else is in danger",
    speaking_pace: "Fast when performing, slow when serious",
    voice: "Smooth but cracks under real stress",
  },
  skillText: `Character Name: Cairo
Core Trait: Overconfident but genuinely skilled
Movement: Sideways lean, plants feet wide, very deliberate stops
Stress Reaction: Gets louder and more performative when scared
Hidden Quality: Goes completely quiet and competent when someone else is in danger
Speaking Pace: Fast when performing, slow when serious
Voice: Smooth but cracks under real stress`,
};

export const ENRICHMENT_SYSTEM_PROMPT = `You are a Character Intelligence Layer for an AI video 
platform. Your job is to read a scene description and a 
character's skill profile, then rewrite the scene as a 
detailed behavioral prompt for a video generator.

RULES:
1. Never break character. The skill profile is absolute.
2. Add specific facial expressions, body language, emotional 
   state, and dialogue direction based on the character's traits.
3. If the scene creates tension with the personality, show 
   how that tension manifests — never ignore either.
4. Output ONLY a JSON object with these fields:
   {
     'facial_expression': string,
     'body_language': string, 
     'emotional_state': string,
     'dialogue_direction': string,
     'enriched_prompt': string
   }
5. The enriched_prompt must read like natural film direction.
6. No preamble. No explanation. JSON only.`;

export function cleanAndParseJSON(raw: string): Record<string, string> {
  let cleaned = raw.trim();

  // Strip markdown code fences if wrapped in ```json ... ``` or ``` ... ```
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    // If extra text surrounds the JSON block, slice between the first { and last }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const extracted = cleaned.slice(firstBrace, lastBrace + 1);
      return JSON.parse(extracted);
    }
    throw new Error(`Model returned non-JSON output: ${raw.slice(0, 150)}...`);
  }
}

/**
 * Core enrichment function that calls NVIDIA NIM API (meta/llama-3.1-8b-instruct)
 */
export async function enrichSceneWithNvidia({
  scene,
  characterId: _characterId,
  accountKey,
}: {
  scene: string;
  characterId?: string;
  accountKey: string;
}): Promise<EnrichmentResponse> {
  // 1. Account Key Validation
  if (!accountKey || accountKey.trim() !== VALID_ACCOUNT_KEY) {
    throw new Error("Invalid or unauthorized accountKey. Expected registered test key 'vn-test-key-001'.");
  }

  // 2. Scene validation
  if (!scene || typeof scene !== "string" || !scene.trim()) {
    throw new Error("Scene description is required.");
  }

  // 3. Check for NVIDIA API Key
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "NVIDIA_API_KEY is not configured in environment variables. Please add your NVIDIA API key to .env.local."
    );
  }

  const userMessage = `CHARACTER PROFILE:\n${CAIRO_PROFILE.skillText}\n\nSCENE:\n${scene.trim()}`;

  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-8b-instruct",
      messages: [
        {
          role: "system",
          content: ENRICHMENT_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorDetail = errorBody;
    try {
      const parsed = JSON.parse(errorBody);
      errorDetail = parsed.error?.message || parsed.message || errorBody;
    } catch {
      // Keep raw body
    }
    throw new Error(`NVIDIA NIM API Error (${response.status}): ${errorDetail}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error("NVIDIA NIM returned an empty response.");
  }

  const parsed = cleanAndParseJSON(rawContent);

  return {
    facial_expression: parsed.facial_expression || "",
    body_language: parsed.body_language || "",
    emotional_state: parsed.emotional_state || "",
    dialogue_direction: parsed.dialogue_direction || "",
    enriched_prompt: parsed.enriched_prompt || "",
    enrichedPrompt: parsed.enriched_prompt || "",
    behaviorBreakdown: {
      facial_expression: parsed.facial_expression || "",
      body_language: parsed.body_language || "",
      emotional_state: parsed.emotional_state || "",
      dialogue_direction: parsed.dialogue_direction || "",
    },
    characterName: CAIRO_PROFILE.characterName,
    modelUsed: "meta/llama-3.1-8b-instruct",
  };
}
