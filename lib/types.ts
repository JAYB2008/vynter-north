// ═══════════════════════════════════════════════════════════
// VYNTER NORTH — CORE SYSTEM TYPES
// Matched strictly to scripts/setup.sql and specification
// ═══════════════════════════════════════════════════════════

export type UserPlan = "free" | "starter" | "creator" | "studio";
export type UserMode = "creator" | "studio";
export type UserRole = "creator" | "studio";
export type VerificationStatus = "none" | "pending" | "verified" | "rejected";

export interface Account {
  id: string;
  username: string;
  display_name: string;
  password_hash: string;
  recovery_hash: string;
  bio?: string | null;
  avatar_url?: string | null;
  website?: string | null;
  has_creator: boolean;
  has_studio: boolean;
  active_mode: UserMode | null;
  onboarding_step: number;
  onboarding_done: boolean;
  plan: UserPlan;
  creator_specialties: string[];
  studio_name?: string | null;
  studio_type?: string | null;
  studio_focus: string[];
  studio_pledge_accepted: boolean;
  verification_status: VerificationStatus;
  verification_link?: string | null;
  verification_doc_path?: string | null;
  account_key: string;
  created_at: string;
  last_seen_at?: string | null;

  // Backward compatibility aliases
  role?: UserRole;
  total_earnings?: number;
  total_spent?: number;
  studio_verified?: boolean;
  onboarding_completed?: boolean;
}

// Backward compatibility alias for Account
export type Profile = Account;

export type CharacterStatus =
  | "draft"
  | "active"
  | "closed"
  | "sold"
  | "deleted"
  | "suspended"
  | "paused";

export type FameTier =
  | "newcomer"
  | "rising"
  | "established"
  | "veteran"
  | "legend";

export interface Character {
  id: string; // CVR-YYYY-XXXXX
  owner_id: string;
  buyer_id?: string | null;
  name: string;
  status: CharacterStatus;
  tagline?: string | null;
  vibe_summary?: string | null;
  description?: string | null;
  portrait_url?: string | null;
  gallery_urls: string[];
  genres: string[];
  personality_tags: string[];
  allowed_uses: string[];
  full_sheet?: string | null;
  sheet_word_count: number;
  specificity_score?: number | null;
  behavior_danger?: string | null;
  behavior_funny?: string | null;
  behavior_emotional?: string | null;
  behavior_social?: string | null;
  behavior_conflict?: string | null;
  physical_appearance?: string | null;
  movement_style?: string | null;
  signature_gesture?: string | null;
  core_trait?: string | null;
  secondary_trait?: string | null;
  hidden_quality?: string | null;
  greatest_fear?: string | null;
  voice_pitch?: string | null;
  voice_tone?: string | null;
  voice_pace?: string | null;
  voice_accent?: string | null;
  voice_baseline?: string | null;
  voice_description?: string | null;
  speaking_style?: string | null;
  verbal_habits?: string | null;
  voice_sample_path?: string | null;
  is_free: boolean;
  trial_enabled: boolean;
  price_daily_cents: number;
  price_weekly_cents: number;
  price_monthly_cents: number;
  sale_enabled: boolean;
  sale_price_cents?: number | null;
  accept_offers: boolean;
  min_offer_cents?: number | null;
  is_featured: boolean;
  is_demo: boolean;
  is_legend: boolean;
  fame_score: number;
  fame_tier: FameTier;
  rating_avg: number;
  review_count: number;
  rental_count: number;
  unique_studios: number;
  reel_views: number;
  registration_hash?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  owner?: Partial<Account>;

  // Backward compatibility aliases
  avatar_url?: string | null;
  reference_images?: string[];
  full_character_sheet?: string | null;
  behavior_dangerous?: string | null;
  voice_sample_url?: string | null;
  voice_analyzed_description?: string | null;
  rental_price_daily?: number;
  rental_price_weekly?: number;
  rental_price_monthly?: number;
  purchase_price?: number | null;
  total_rentals?: number;
  total_views?: number;
}

export interface CharacterWithSkills extends Character {
  skills?: SkillTemplate[];
}

export interface ReelScene {
  id: string;
  character_id: string;
  category: "danger" | "social" | "emotional" | "light" | "extra";
  title: string;
  scene_text?: string | null;
  video_url?: string | null;
  production_title?: string | null;
  production_link?: string | null;
  views: number;
  position: number;
  created_at: string;
}

export type RentalKind = "trial" | "rental" | "free" | "purchase";
export type RentalPeriod = "3d" | "1d" | "7d" | "30d" | "permanent";
export type RentalType = "daily" | "weekly" | "monthly" | "purchase" | "free" | "trial";

export interface RentalSettings {
  humor: boolean;
  physical: boolean;
  dialogue: boolean;
  mode: "full" | "appearance_only";
}

export interface Rental {
  id: string;
  character_id: string;
  studio_id: string;
  kind: RentalKind;
  period: RentalPeriod;
  pass_code: string;
  starts_at: string;
  expires_at?: string | null;
  grace_ends_at?: string | null;
  credits_total: number;
  credits_used: number;
  settings: RentalSettings;
  price_cents: number;
  ended_early: boolean;
  created_at: string;
  character?: Character;
  studio?: Partial<Account>;

  // Backward compatibility aliases
  status?: "active" | "grace" | "expired" | "ended_early" | string;
  rental_type?: RentalType;
  mcp_token?: string;
  generation_credits?: number;
  price_paid?: number;
}

export interface Generation {
  id: string;
  rental_id?: string | null;
  character_id: string;
  account_id?: string | null;
  scene_group: string;
  source: "web" | "mcp" | "demo" | "creator_test";
  scene_text: string;
  enriched_prompt: string;
  breakdown?: Record<string, unknown> | null;
  analysis?: Record<string, unknown> | null;
  status: "preview" | "kept" | "discarded";
  charged: boolean;
  created_at: string;
}

export type GenerationLog = Generation;

export interface Review {
  id: string;
  rental_id: string;
  character_id: string;
  studio_id: string;
  rating_consistency: number;
  rating_depth: number;
  rating_value: number;
  rating_overall: number;
  body: string;
  production_type?: string | null;
  would_rent_again?: "yes" | "no" | "maybe" | null;
  creator_reply?: string | null;
  creator_reply_at?: string | null;
  helpful_count: number;
  hidden: boolean;
  created_at: string;
  studio?: Partial<Account>;

  // Backward compatibility aliases
  reviewer?: Partial<Account>;
  rating?: number;
  review_text?: string;
}

export interface Offer {
  id: string;
  character_id: string;
  studio_id: string;
  amount_cents: number;
  status: "open" | "countered" | "accepted" | "declined" | "withdrawn";
  created_at: string;
  updated_at: string;
  character?: Character;
  studio?: Partial<Account>;
  message?: string | null;
  messages?: OfferMessage[];
}

export interface OfferMessage {
  id: string;
  offer_id: string;
  sender_id: string;
  amount_cents?: number | null;
  body?: string | null;
  created_at: string;
  sender?: Partial<Account>;
}

export type SkillCategory =
  | "personality"
  | "movement"
  | "dialogue"
  | "genre_pack"
  | "full_template";

export interface SkillTemplate {
  id: string;
  creator_id: string;
  title: string;
  category: SkillCategory;
  summary: string;
  what_it_adds: string[];
  sample_scene?: string | null;
  sample_output?: string | null;
  preview_excerpt?: string | null;
  content: string;
  tags: string[];
  price_cents: number;
  word_count: number;
  installs: number;
  created_at: string;
  creator?: Partial<Account>;

  // Backward compatibility aliases
  description?: string;
  preview_text?: string;
  price?: number;
  is_free?: boolean;
}

export type CharacterSkill = SkillTemplate;

export interface CastingCall {
  id: string;
  studio_id: string;
  title: string;
  description: string;
  genres: string[];
  budget_cents?: number | null;
  deadline?: string | null;
  min_tier?: string | null;
  status: "open" | "closed" | "filled";
  created_at: string;
  studio?: Partial<Account>;
  applications?: CastingApplication[];
}

export interface CastingApplication {
  id: string;
  call_id: string;
  character_id: string;
  message?: string | null;
  status: "pending" | "shortlisted" | "declined";
  created_at: string;
  character?: Character;
}

export interface Transaction {
  id: string;
  payer_id?: string | null;
  payee_id?: string | null;
  character_id?: string | null;
  kind: "rental" | "purchase" | "topup" | "skill" | "plan";
  amount_cents: number;
  platform_fee_cents: number;
  mode: "test";
  created_at: string;
}

export interface Notification {
  id: string;
  account_id: string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  read: boolean;
  created_at: string;
}

export interface McpLog {
  id: number;
  account_id?: string | null;
  method?: string | null;
  tool?: string | null;
  character_id?: string | null;
  ok: boolean;
  ms: number;
  error?: string | null;
  created_at: string;
}

export interface FameSnapshot {
  character_id: string;
  week: string;
  score: number;
  rank?: number | null;
}

export interface BehaviorBreakdown {
  facial_expression: string;
  body_language: string;
  emotional_state: string;
  dialogue_direction: string;
  scene_integration?: string;
}

export interface BehaviorSettings {
  humor?: boolean;
  physical?: boolean;
  dialogue?: boolean;
  mode?: "full" | "appearance_only" | "appearance";
  personalityInjection?: boolean;
  physicalBehavior?: boolean;
  dialogueDirection?: boolean;
}

export interface EnrichmentOutput {
  enriched_prompt: string;
  behavior_breakdown: BehaviorBreakdown;
  character: Character;
  original_prompt: string;
  word_count: {
    original: number;
    enriched: number;
    multiplier: string;
  };
}

export type ApiResponse<T> =
  | { ok: true; data: T; error?: never }
  | { ok: false; error: { code: string; message: string }; data?: never };

export interface CharacterCreationFormData {
  name: string;
  description: string;
  vibe_summary?: string;
  [key: string]: any;
}
