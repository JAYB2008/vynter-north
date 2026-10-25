import { supabaseServer, isSupabaseServerConfigured } from "./supabase-server";
import { Character, CharacterSkill, CharacterWithSkills, GenerationLog } from "./types";
import { randomUUID } from "crypto";

// Fallback in-memory/filesystem store for when Supabase is not yet connected
const defaultDemoCharacters: Array<{ character: Character; skills: CharacterSkill }> = [
  {
    character: {
      id: "c001-james",
      name: "James",
      description: "A brilliant, high-performing academy standout who hides crushing imposter syndrome and extreme anxiety behind a shield of rigid composure.",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    skills: {
      id: "s001-james",
      character_id: "c001-james",
      resting_expression: "Serious",
      movement_style: "Stiff posture, walks with measured footsteps, avoids sudden movements unless startled",
      signature_gesture: "Smooths down jacket lapels or kit collar; repeatedly checks watch or cuffs",
      stress_reaction: "Freezes for half a second, face flushes, then overcorrects with sudden urgent movement and forced confidence",
      core_trait: "Anxious",
      secondary_trait: "Perfectionist, deeply competitive",
      handles_danger: "Freezes then overcorrects with forced confidence and reckless overachievement",
      what_makes_laugh: "Awkward absurdities when someone else breaks an overly formal rule",
      what_makes_angry: "Being pitied or patronized; having his competence openly questioned",
      hidden_quality: "Deeply proud and cannot admit failure or weakness to anyone",
      speaking_pace: "Fast when nervous; normally deliberate and formal",
      language_mixing: "Occasional Latin or tactical academy terminology under stress",
      humor_style: "Dry/Sarcastic",
      catchphrase: "Standard operational procedure. Let's not make a spectacle.",
      vibe_summary: "High-strung perfectionist who overcompensates for acute anxiety with hyper-rigidity.",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  },
  {
    character: {
      id: "c002-aria",
      name: "Aria Vance",
      description: "An elite cyber-intelligence operative who analyzes every conversation like a high-stakes chess match.",
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    skills: {
      id: "s002-aria",
      character_id: "c002-aria",
      resting_expression: "Calculating",
      movement_style: "Silent, gliding, completely economical movements without wasted energy",
      signature_gesture: "Tilts head 5 degrees to the right while making unbroken eye contact",
      stress_reaction: "Heart rate slows; voice drops an octave; micro-analyzes exit routes",
      core_trait: "Calculating",
      secondary_trait: "Unforgivingly pragmatic",
      handles_danger: "Calculates mathematical odds and exploits the opponent's emotional vulnerability",
      what_makes_laugh: "When an arrogant opponent walks into a trap they designed themselves",
      what_makes_angry: "Incompetence disguised as loyalty",
      hidden_quality: "Harbors a secret regret over a partner she sacrificed for mission success",
      speaking_pace: "Deliberate",
      language_mixing: "Mixes subtle German technical idioms into concise statements",
      humor_style: "Dark",
      catchphrase: "Every variable has an expiration date.",
      vibe_summary: "Ice-cold tactical strategist who treats reality as an optimization problem.",
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  },
  {
    character: {
      id: "c003-marcus",
      name: "Marcus Drake",
      description: "A battle-hardened scout captain with a boisterous laugh and a fiercely protective moral compass.",
      created_at: new Date().toISOString(),
    },
    skills: {
      id: "s003-marcus",
      character_id: "c003-marcus",
      resting_expression: "Warm",
      movement_style: "Broad strides, heavy boots, always slightly leaning toward companions like a human shield",
      signature_gesture: "Slaps his broad thighs or claps people on the shoulder with disarming warmth",
      stress_reaction: "Steps directly between danger and his allies, grinning defiantly",
      core_trait: "Protective",
      secondary_trait: "Warm and fiercely loyal",
      handles_danger: "Charges forward to draw fire, laughing off fear to calm his squad",
      what_makes_laugh: "Campfire banter, bad puns, self-deprecating military jokes",
      what_makes_angry: "Bullies harming civilians or someone abandoning their post",
      hidden_quality: "Carries severe insomnia and writes tender letters to fallen comrades' families",
      speaking_pace: "Normal",
      language_mixing: "Rough frontier slang and old naval expressions",
      humor_style: "Self-deprecating",
      catchphrase: "Nobody bleeds today on my watch.",
      vibe_summary: "Protective guardian whose jovial exterior conceals unbreakable resolve.",
      created_at: new Date().toISOString(),
    },
  },
];

// In-memory memory storage singleton for non-Supabase dev mode
declare global {
  // eslint-disable-next-line no-var
  var __vynterLocalCharacters: Array<{ character: Character; skills: CharacterSkill }> | undefined;
  // eslint-disable-next-line no-var
  var __vynterLocalLogs: GenerationLog[] | undefined;
}

if (!global.__vynterLocalCharacters) {
  global.__vynterLocalCharacters = [...defaultDemoCharacters];
}

if (!global.__vynterLocalLogs) {
  global.__vynterLocalLogs = [
    {
      id: "log-seed-1",
      character_id: "c001-james",
      original_prompt: "James trips and falls during football practice in front of the whole team.",
      enriched_prompt: "James trips and falls hard during football practice. His face flushes red before he controls it, eyes darting sideways to count who is watching. He scrambles up too fast — quicker than he needs to — and immediately straightens his kit with tense, precise movements. His jaw is set tight. He stands too straight, shoulders back, forcing composure. He does not look at his teammates.",
      video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
  ];
}

export async function getAllCharacters(): Promise<CharacterWithSkills[]> {
  if (isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabaseServer
        .from("characters")
        .select("*, character_skills(*)")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase characters fetch warning, using local store:", error.message);
      } else if (data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          created_at: item.created_at,
          skills: Array.isArray(item.character_skills)
            ? item.character_skills[0] || null
            : item.character_skills || null,
        }));
      }
    } catch (err) {
      console.warn("Supabase query failed, falling back to local memory:", err);
    }
  }

  // Fallback to local store
  return global.__vynterLocalCharacters!.map((item) => ({
    ...item.character,
    skills: item.skills,
  }));
}

export async function getCharacterById(id: string): Promise<CharacterWithSkills | null> {
  if (isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabaseServer
        .from("characters")
        .select("*, character_skills(*)")
        .eq("id", id)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          description: data.description,
          created_at: data.created_at,
          skills: Array.isArray(data.character_skills)
            ? data.character_skills[0] || null
            : data.character_skills || null,
        };
      }
    } catch (err) {
      console.warn("Supabase character fetch failed, fallback:", err);
    }
  }

  const found = global.__vynterLocalCharacters!.find((c) => c.character.id === id);
  if (!found) return null;
  return {
    ...found.character,
    skills: found.skills,
  };
}

export async function checkCharacterNameAvailable(name: string): Promise<boolean> {
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) return true;

  if (isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabaseServer
        .from("characters")
        .select("id")
        .ilike("name", trimmed);

      if (!error && data) {
        return data.length === 0;
      }
    } catch (err) {
      console.warn("Supabase name check fallback:", err);
    }
  }

  return !global.__vynterLocalCharacters!.some(
    (c) => c.character.name.toLowerCase() === trimmed
  );
}

export async function createCharacterWithSkills(payload: {
  character: { name: string; description?: string };
  skills: Omit<CharacterSkill, "id" | "character_id" | "created_at">;
}): Promise<CharacterWithSkills> {
  const characterId = randomUUID();
  const skillId = randomUUID();
  const now = new Date().toISOString();

  const newChar: Character = {
    id: characterId,
    name: payload.character.name.trim(),
    description: payload.character.description || null,
    created_at: now,
  };

  const newSkills: CharacterSkill = {
    id: skillId,
    character_id: characterId,
    resting_expression: payload.skills.resting_expression || null,
    movement_style: payload.skills.movement_style || null,
    signature_gesture: payload.skills.signature_gesture || null,
    stress_reaction: payload.skills.stress_reaction || null,
    core_trait: payload.skills.core_trait || null,
    secondary_trait: payload.skills.secondary_trait || null,
    handles_danger: payload.skills.handles_danger || null,
    what_makes_laugh: payload.skills.what_makes_laugh || null,
    what_makes_angry: payload.skills.what_makes_angry || null,
    hidden_quality: payload.skills.hidden_quality || null,
    speaking_pace: payload.skills.speaking_pace || null,
    language_mixing: payload.skills.language_mixing || null,
    humor_style: payload.skills.humor_style || null,
    catchphrase: payload.skills.catchphrase || null,
    vibe_summary:
      payload.skills.vibe_summary ||
      `${payload.skills.core_trait || "Dynamic"} character defined by ${payload.skills.resting_expression || "distinct"} posture and ${payload.skills.speaking_pace || "natural"} dialogue.`,
    created_at: now,
  };

  if (isSupabaseServerConfigured()) {
    try {
      const { error: charError } = await supabaseServer
        .from("characters")
        .insert([newChar]);

      if (charError) {
        throw new Error(`Failed to insert character: ${charError.message}`);
      }

      const { error: skillError } = await supabaseServer
        .from("character_skills")
        .insert([newSkills]);

      if (skillError) {
        throw new Error(`Failed to insert character skills: ${skillError.message}`);
      }
    } catch (err) {
      console.warn("Supabase insert encountered error, storing in local fallback:", err);
      // fallback store
      global.__vynterLocalCharacters!.unshift({
        character: newChar,
        skills: newSkills,
      });
      return { ...newChar, skills: newSkills };
    }
  }

  // Always keep in local store for rapid local reads
  global.__vynterLocalCharacters!.unshift({
    character: newChar,
    skills: newSkills,
  });

  return {
    ...newChar,
    skills: newSkills,
  };
}

export async function createGenerationLog(entry: {
  character_id: string;
  original_prompt: string;
  enriched_prompt: string;
  video_url?: string | null;
}): Promise<GenerationLog> {
  const logId = randomUUID();
  const now = new Date().toISOString();

  const newLog: GenerationLog = {
    id: logId,
    character_id: entry.character_id,
    original_prompt: entry.original_prompt,
    enriched_prompt: entry.enriched_prompt,
    video_url: entry.video_url || null,
    created_at: now,
  };

  if (isSupabaseServerConfigured()) {
    try {
      await supabaseServer.from("generation_logs").insert([newLog]);
    } catch (err) {
      console.warn("Supabase log insert fallback:", err);
    }
  }

  global.__vynterLocalLogs!.unshift(newLog);
  return newLog;
}

export async function updateGenerationLogVideo(id: string, videoUrl: string): Promise<void> {
  if (isSupabaseServerConfigured()) {
    try {
      await supabaseServer
        .from("generation_logs")
        .update({ video_url: videoUrl })
        .eq("id", id);
    } catch (err) {
      console.warn("Supabase log video update fallback:", err);
    }
  }

  const log = global.__vynterLocalLogs!.find((l) => l.id === id);
  if (log) {
    log.video_url = videoUrl;
  }
}

export async function getAllGenerationLogs(): Promise<GenerationLog[]> {
  if (isSupabaseServerConfigured()) {
    try {
      const { data, error } = await supabaseServer
        .from("generation_logs")
        .select("*, characters(*)")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          character_id: item.character_id,
          original_prompt: item.original_prompt,
          enriched_prompt: item.enriched_prompt,
          video_url: item.video_url,
          created_at: item.created_at,
          character: item.characters || null,
        }));
      }
    } catch (err) {
      console.warn("Supabase logs fetch fallback:", err);
    }
  }

  // Fallback to local logs joined with characters
  return global.__vynterLocalLogs!.map((log) => {
    const char = global.__vynterLocalCharacters!.find((c) => c.character.id === log.character_id);
    return {
      ...log,
      character: char ? char.character : null,
    };
  });
}
