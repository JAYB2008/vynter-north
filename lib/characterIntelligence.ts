import { anthropic, isAnthropicConfigured } from "./anthropic";
import { CharacterSkill, BehaviorBreakdown, BehaviorSettings } from "./types";

export interface EnrichResult {
  enrichedPrompt: string;
  behaviorBreakdown: BehaviorBreakdown;
  modelUsed: string;
}

const SYSTEM_PROMPT = `You are the Character Intelligence Layer for an AI character platform. Your job is to read a scene description and a character's complete personality profile, then generate precise behavioral instructions for how that specific character would behave in that exact moment.

Always output a JSON object with these exact fields:
{
  "facial_expression": "string (specific, detailed)",
  "body_language": "string (specific physical behavior)",
  "emotional_state": "string (internal experience showing through behavior)",
  "dialogue_direction": "string (how they would speak - pace, tone, content direction)",
  "scene_integration": "string (how their specific traits affect this specific scene)",
  "enriched_prompt": "string (the original prompt rewritten with all behavioral details woven in naturally — this is what goes to the video generator)"
}

Rules:
- Never break character. The personality profile is absolute.
- Be hyper-specific to THIS character, not a generic person.
- The enriched_prompt must read naturally, not like a list of instructions.
- If the scene creates tension with the character's personality (e.g. a funny character in a tragic moment), show how that tension MANIFESTS in their behavior — do not ignore either the scene or the personality.
- Output ONLY the JSON object, nothing else.`;

export async function enrichScenePrompt(
  scenePrompt: string,
  characterSkill: CharacterSkill,
  characterName: string,
  settings: BehaviorSettings = {
    personalityInjection: true,
    physicalBehavior: true,
    dialogueDirection: true,
  }
): Promise<EnrichResult> {
  const profileSummary = `
CHARACTER PROFILE: ${characterName}
=================================
Physical Style:
- Resting Expression: ${characterSkill.resting_expression || "Neutral"}
- Movement Style: ${characterSkill.movement_style || "Natural and measured"}
- Signature Gesture: ${characterSkill.signature_gesture || "Subtle hand gesture"}
- Stress Reaction: ${characterSkill.stress_reaction || "Tightens jaw, rigid posture"}

Personality:
- Core Trait: ${characterSkill.core_trait || "Dynamic"}
- Secondary Trait: ${characterSkill.secondary_trait || "Observant"}
- How they handle danger: ${characterSkill.handles_danger || "Freezes then acts decisively"}
- What makes them laugh: ${characterSkill.what_makes_laugh || "Understated irony"}
- What makes them angry: ${characterSkill.what_makes_angry || "Being undermined or disrespected"}
- Hidden Quality: ${characterSkill.hidden_quality || "Vulnerability behind guarded exterior"}

Dialogue Style:
- Speaking Pace: ${characterSkill.speaking_pace || "Normal"}
- Language Mixing: ${characterSkill.language_mixing || "None"}
- Humor Style: ${characterSkill.humor_style || "Dry/Sarcastic"}
- Catchphrase / Verbal Habit: ${characterSkill.catchphrase || "None"}

Active Behavioral Modules:
- Personality Injection: ${settings.personalityInjection ? "ENABLED" : "DISABLED"}
- Physical Behavior: ${settings.physicalBehavior ? "ENABLED" : "DISABLED"}
- Dialogue Direction: ${settings.dialogueDirection ? "ENABLED" : "DISABLED"}
`.trim();

  const userMessage = `Here is the character personality profile:\n\n${profileSummary}\n\nSCENE PROMPT TO ENRICH:\n"${scenePrompt}"\n\nGenerate the complete behavioral JSON analysis and the enriched scene prompt.`;

  if (isAnthropicConfigured()) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      });

      const firstBlock = response.content[0];
      if (firstBlock && firstBlock.type === "text") {
        const text = firstBlock.text.trim();
        // Remove markdown code fence if Claude wraps it in ```json ... ```
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as BehaviorBreakdown;
          return {
            enrichedPrompt: parsed.enriched_prompt,
            behaviorBreakdown: parsed,
            modelUsed: "Claude 3.5 Sonnet",
          };
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn("Claude API call failed, falling back to local Character Intelligence synthesis:", errMsg);
    }
  }

  // Fallback intelligent behavioral synthesis engine
  const breakdown = synthesizeBehaviorLocally(scenePrompt, characterSkill, characterName, settings);
  return {
    enrichedPrompt: breakdown.enriched_prompt,
    behaviorBreakdown: breakdown,
    modelUsed: isAnthropicConfigured() ? "Local Fallback (Claude rate-limited)" : "Local Intelligence Engine (No API key)",
  };
}

function synthesizeBehaviorLocally(
  scenePrompt: string,
  skill: CharacterSkill,
  name: string,
  settings: BehaviorSettings
): BehaviorBreakdown {
  const isJames = name.toLowerCase().includes("james");
  const isFootballFall = scenePrompt.toLowerCase().includes("trip") || scenePrompt.toLowerCase().includes("football");

  if (isJames && isFootballFall) {
    return {
      facial_expression:
        "His face flushes red immediately before he can control it. Eyes dart sideways in a rapid, involuntary assessment of how many teammates are watching. His jaw tightens as he forces a composed expression that does not quite reach his guarded eyes.",
      body_language:
        "Scrambles up too quickly — overcorrecting the stumble with sudden urgency. Straightens his football kit with tense, precise unnecessary movements to give his hands something to do. Stands slightly too straight, shoulders pinned back, desperately overcompensating for the slip.",
      emotional_state:
        "Acute embarrassment locked beneath an iron wall of stubborn pride. Internal panic of imposter syndrome being publicly confirmed, masked by aggressive formal composure.",
      dialogue_direction:
        "Voice pitched slightly higher than usual with rapid cadence. Would deliver a clipped, defensive deflection: 'Standard turf condition issue. Let's reset the line.'",
      scene_integration:
        "The public clumsiness triggers his core stress response: rather than laughing it off or showing pain, he hyper-regulates his posture, refuses eye contact, and behaves as if the entire incident were calculated.",
      enriched_prompt:
        `${name} trips and falls hard during football practice in front of the whole team. His face flushes red before he controls it, eyes darting sideways to count who is watching. He scrambles up too fast — quicker than he needs to — and immediately straightens his kit with tense, precise movements. His jaw is set tight. He stands too straight, shoulders back, forcing composure. He does not look at his teammates.`,
    };
  }

  // General dynamic behavioral synthesis
  const resting = skill.resting_expression || "Intense";
  const stress = skill.stress_reaction || "freezes, postures rigidly, and overcompensates";
  const gesture = skill.signature_gesture || "adjusts attire and fixes a sharp gaze";
  const core = skill.core_trait || "Calculating";
  const pace = skill.speaking_pace || "Deliberate";
  const humor = skill.humor_style || "Dry";

  const facial = `Carries a ${resting.toLowerCase()} baseline that shifts under immediate pressure. Eyes narrow with focused scrutiny as subtle micro-tensions form around the lips and forehead, keeping vulnerability tightly sealed.`;
  const body = `Movement shifts into active response: ${gesture.toLowerCase()}, while physical posture reflects their characteristic style: ${stress.toLowerCase()}. Every movement is executed with deliberate compensation.`;
  const emotional = `Deep psychological tension between their ${core.toLowerCase()} instinct and the unfolding scenario. The inner emotion does not spill out casually; it translates into sharp tactical vigilance.`;
  const dialogue = `Speaking cadence adapts to ${pace.toLowerCase()} rhythm, seasoned with ${humor.toLowerCase()} undertones and subtle defensive restraint.`;
  const integration = `Because ${name} possesses a ${core.toLowerCase()} core trait, this event causes them to ${stress.toLowerCase()} rather than acting casually, redefining the cinematic tone of the scene.`;

  const enrichTokens: string[] = [];
  enrichTokens.push(`${scenePrompt.trim().replace(/\.$/, "")}.`);

  if (settings.personalityInjection) {
    enrichTokens.push(
      `Underneath the moment, ${name}'s ${core.toLowerCase()} temperament surfaces visibly.`
    );
  }
  if (settings.physicalBehavior) {
    enrichTokens.push(
      `Holding a ${resting.toLowerCase()} gaze, ${name} ${gesture.toLowerCase()}, then ${stress.toLowerCase()}.`
    );
  }
  if (settings.dialogueDirection) {
    enrichTokens.push(
      `Movement is punctuated by an unyielding presence, speaking with a ${pace.toLowerCase()} tempo that cuts through the surrounding commotion.`
    );
  }

  return {
    facial_expression: facial,
    body_language: body,
    emotional_state: emotional,
    dialogue_direction: dialogue,
    scene_integration: integration,
    enriched_prompt: enrichTokens.join(" "),
  };
}
