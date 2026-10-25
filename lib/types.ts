export interface Character {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface CharacterSkill {
  id: string;
  character_id: string;
  
  // Physical Style
  resting_expression: string | null;
  movement_style: string | null;
  signature_gesture: string | null;
  stress_reaction: string | null;
  
  // Personality
  core_trait: string | null;
  secondary_trait: string | null;
  handles_danger: string | null;
  what_makes_laugh: string | null;
  what_makes_angry: string | null;
  hidden_quality: string | null;
  
  // Dialogue Style
  speaking_pace: string | null;
  language_mixing: string | null;
  humor_style: string | null;
  catchphrase: string | null;
  
  // Summary
  vibe_summary: string | null;
  
  created_at: string;
}

export interface CharacterWithSkills extends Character {
  skills?: CharacterSkill | null;
}

export interface GenerationLog {
  id: string;
  character_id: string;
  original_prompt: string;
  enriched_prompt: string;
  video_url: string | null;
  created_at: string;
  character?: Character | null;
}

export interface BehaviorBreakdown {
  facial_expression: string;
  body_language: string;
  emotional_state: string;
  dialogue_direction: string;
  scene_integration: string;
  enriched_prompt: string;
}

export interface BehaviorSettings {
  personalityInjection: boolean;
  physicalBehavior: boolean;
  dialogueDirection: boolean;
}

export interface CharacterCreationFormData {
  name: string;
  description?: string;
  
  // Physical Style
  resting_expression?: string;
  movement_style?: string;
  signature_gesture?: string;
  stress_reaction?: string;
  
  // Personality
  core_trait?: string;
  secondary_trait?: string;
  handles_danger?: string;
  what_makes_laugh?: string;
  what_makes_angry?: string;
  hidden_quality?: string;
  
  // Dialogue Style
  speaking_pace?: string;
  language_mixing?: string;
  humor_style?: string;
  catchphrase?: string;
  
  // Summary
  vibe_summary?: string;
}
