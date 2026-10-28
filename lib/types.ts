export type UserRole = "creator" | "studio";

export interface Profile {
  id: string;
  display_name: string;
  username?: string | null;
  role: UserRole;
  bio: string | null;
  avatar_url: string | null;
  website?: string | null;
  studio_name?: string | null;
  studio_verified?: boolean;
  studio_verification_docs?: string[] | null;
  studio_type?: string | null;
  creator_speciality?: string[] | null;
  account_key: string;
  total_earnings: number;
  total_spent?: number;
  onboarding_completed?: boolean;
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type CharacterStatus = "active" | "paused" | "sold" | "deleted";

export interface Character {
  id: string;
  owner_id: string;
  name: string;
  status: CharacterStatus;
  
  // Visual identity
  avatar_url: string | null;
  reference_images: string[];
  
  // Basic info
  vibe_summary: string;
  description: string;
  
  // Full character sheet (skill profile)
  full_character_sheet: string;
  
  // Specific situation responses
  behavior_dangerous: string;
  behavior_funny: string;
  behavior_emotional: string;
  behavior_social: string;
  behavior_conflict: string;
  
  // Appearance & movement
  physical_appearance: string;
  movement_style: string;
  signature_gesture: string | null;
  
  // Personality traits
  core_trait: string;
  secondary_trait: string | null;
  hidden_quality: string | null;
  greatest_fear: string | null;
  
  // Voice & speech
  voice_description: string;
  speaking_style: string;
  verbal_habits: string | null;
  voice_sample_url: string | null;
  voice_analyzed_description: string | null;
  
  // Marketplace settings
  genres: string[];
  allowed_uses: string[];
  
  // Pricing
  rental_price_daily: number;
  rental_price_weekly: number;
  rental_price_monthly: number;
  purchase_price: number | null;
  is_free: boolean;
  
  // Stats
  fame_score: number;
  total_rentals: number;
  total_views: number;
  
  created_at: string;
  updated_at: string;

  // Joined relations
  owner?: Profile;
  skills?: any;
}

export type RentalType = "daily" | "weekly" | "monthly" | "purchase" | "free";
export type RentalStatus = "active" | "expired" | "cancelled";

export interface Rental {
  id: string;
  character_id: string;
  studio_id: string;
  rental_type: RentalType;
  status: RentalStatus;
  mcp_token: string;
  generation_credits: number;
  credits_used: number;
  price_paid: number;
  starts_at: string;
  expires_at: string | null;
  created_at: string;

  // Joined character
  character?: Character;
}

export type SkillCategory =
  | "personality"
  | "movement"
  | "dialogue"
  | "genre"
  | "full_template";

export interface SkillTemplate {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  category: SkillCategory;
  content: string;
  price: number;
  is_free: boolean;
  purchases: number;
  created_at: string;

  creator?: Profile;
}

export interface Review {
  id: string;
  character_id: string;
  reviewer_id: string;
  rental_id?: string | null;
  rating: number;
  review_text: string | null;
  created_at: string;

  reviewer?: Profile;
}

export interface GenerationLog {
  id: string;
  rental_id: string | null;
  character_id: string;
  original_prompt: string;
  enriched_prompt: string;
  original_word_count: number;
  enriched_word_count: number;
  status: "preview" | "kept" | "discarded" | "succeeded" | "failed" | "processing";
  video_url?: string | null;
  character?: Character | null;
  created_at: string;
}

export interface BehaviorBreakdown {
  facial_expression: string;
  body_language: string;
  emotional_state: string;
  dialogue_direction: string;
  scene_integration: string;
  enriched_prompt: string;
}

export interface CharacterSkill {
  id?: string;
  character_id?: string;
  resting_expression?: string | null;
  movement_style?: string | null;
  signature_gesture?: string | null;
  stress_reaction?: string | null;
  core_trait?: string | null;
  secondary_trait?: string | null;
  handles_danger?: string | null;
  what_makes_laugh?: string | null;
  what_makes_angry?: string | null;
  hidden_quality?: string | null;
  speaking_pace?: string | null;
  language_mixing?: string | null;
  humor_style?: string | null;
  catchphrase?: string | null;
  vibe_summary?: string | null;
  created_at?: string;
}

export type CharacterWithSkills = Character & {
  skills?: CharacterSkill;
};

export interface BehaviorSettings {
  personalityInjection?: boolean;
  physicalBehavior?: boolean;
  dialogueDirection?: boolean;
}

export interface CharacterCreationFormData {
  name: string;
  description?: string;
  vibe_summary?: string;
  core_trait?: string;
  secondary_trait?: string;
  resting_expression?: string;
  movement_style?: string;
  signature_gesture?: string;
  stress_reaction?: string;
  handles_danger?: string;
  what_makes_laugh?: string;
  what_makes_angry?: string;
  hidden_quality?: string;
  speaking_pace?: string;
  language_mixing?: string;
  humor_style?: string;
  catchphrase?: string;
}

export interface EnrichmentOutput {
  success: boolean;
  character: {
    id: string;
    name: string;
    vibe_summary: string;
  };
  original_prompt: string;
  enriched_prompt: string;
  behavior_breakdown: BehaviorBreakdown;
  word_count: {
    original: number;
    enriched: number;
    multiplier: string;
  };
  model_used?: string;
}
