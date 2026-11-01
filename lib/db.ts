import "server-only";
import { createClient } from "@supabase/supabase-js";
import {
  Account,
  Character,
  ReelScene,
  Rental,
  Generation,
  Review,
  Offer,
  SkillTemplate,
  CastingCall,
  CastingApplication,
  Transaction,
  Notification,
  McpLog,
  FameTier,
} from "./types";
import { randomUUID } from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
);

// Server-only service-role Supabase client
export const supabaseServer = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : (null as any);

// ═══════════════════════════════════════════════════════════
// IN-MEMORY / RESILIENT FALLBACK DATA STORE
// Non-negotiable rule: "No pre-made characters. Do not seed any characters."
// Everything starts clean and empty.
// ═══════════════════════════════════════════════════════════

declare global {
  // eslint-disable-next-line no-var
  var __vnAccounts: Account[] | undefined;
  // eslint-disable-next-line no-var
  var __vnCharacters: Character[] | undefined;
  // eslint-disable-next-line no-var
  var __vnReelScenes: ReelScene[] | undefined;
  // eslint-disable-next-line no-var
  var __vnRentals: Rental[] | undefined;
  // eslint-disable-next-line no-var
  var __vnGenerations: Generation[] | undefined;
  // eslint-disable-next-line no-var
  var __vnReviews: Review[] | undefined;
  // eslint-disable-next-line no-var
  var __vnReviewVotes: { review_id: string; account_id: string }[] | undefined;
  // eslint-disable-next-line no-var
  var __vnOffers: Offer[] | undefined;
  // eslint-disable-next-line no-var
  var __vnSkillTemplates: SkillTemplate[] | undefined;
  // eslint-disable-next-line no-var
  var __vnSkillAcquisitions:
    | { template_id: string; account_id: string; price_cents: number; created_at: string }[]
    | undefined;
  // eslint-disable-next-line no-var
  var __vnCastingCalls: CastingCall[] | undefined;
  // eslint-disable-next-line no-var
  var __vnCastingApplications: CastingApplication[] | undefined;
  // eslint-disable-next-line no-var
  var __vnSavedCharacters:
    | { account_id: string; character_id: string }[]
    | undefined;
  // eslint-disable-next-line no-var
  var __vnTransactions: Transaction[] | undefined;
  // eslint-disable-next-line no-var
  var __vnNotifications: Notification[] | undefined;
  // eslint-disable-next-line no-var
  var __vnMcpLogs: McpLog[] | undefined;
  // eslint-disable-next-line no-var
  var __vnLoginAttempts:
    | { id: number; username: string; ip: string; ok: boolean; created_at: string }[]
    | undefined;
}

if (!global.__vnAccounts) global.__vnAccounts = [];
if (!global.__vnCharacters) global.__vnCharacters = [];
if (!global.__vnReelScenes) global.__vnReelScenes = [];
if (!global.__vnRentals) global.__vnRentals = [];
if (!global.__vnGenerations) global.__vnGenerations = [];
if (!global.__vnReviews) global.__vnReviews = [];
if (!global.__vnReviewVotes) global.__vnReviewVotes = [];
if (!global.__vnOffers) global.__vnOffers = [];
if (!global.__vnSkillTemplates) global.__vnSkillTemplates = [];
if (!global.__vnSkillAcquisitions) global.__vnSkillAcquisitions = [];
if (!global.__vnCastingCalls) global.__vnCastingCalls = [];
if (!global.__vnCastingApplications) global.__vnCastingApplications = [];
if (!global.__vnSavedCharacters) global.__vnSavedCharacters = [];
if (!global.__vnTransactions) global.__vnTransactions = [];
if (!global.__vnNotifications) global.__vnNotifications = [];
if (!global.__vnMcpLogs) global.__vnMcpLogs = [];
if (!global.__vnLoginAttempts) global.__vnLoginAttempts = [];

// ═══════════════════════════════════════════════════════════
// ACCOUNTS & AUTH
// ═══════════════════════════════════════════════════════════

export async function getAccountById(id: string): Promise<Account | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("accounts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) return data as Account;
    } catch (e) {
      console.warn("Supabase getAccountById error:", e);
    }
  }
  return global.__vnAccounts?.find((a) => a.id === id) || null;
}

export async function getAccountByUsername(
  username: string
): Promise<Account | null> {
  const norm = username.trim().toLowerCase();
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("accounts")
        .select("*")
        .ilike("username", norm)
        .maybeSingle();
      if (!error && data) return data as Account;
    } catch (e) {
      console.warn("Supabase getAccountByUsername error:", e);
    }
  }
  return (
    global.__vnAccounts?.find((a) => a.username.toLowerCase() === norm) || null
  );
}

export async function getAccountByKey(key: string): Promise<Account | null> {
  const norm = key.trim();
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("accounts")
        .select("*")
        .eq("account_key", norm)
        .maybeSingle();
      if (!error && data) return data as Account;
    } catch (e) {
      console.warn("Supabase getAccountByKey error:", e);
    }
  }
  return global.__vnAccounts?.find((a) => a.account_key === norm) || null;
}

export async function getAllAccounts(): Promise<Account[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) return data as Account[];
    } catch (e) {
      console.warn("Supabase getAllAccounts error:", e);
    }
  }
  return global.__vnAccounts || [];
}

export async function createAccount(
  accountData: Partial<Account> & {
    username: string;
    display_name: string;
    password_hash: string;
    recovery_hash: string;
  }
): Promise<Account> {
  const id = accountData.id || randomUUID();
  const account_key =
    accountData.account_key || randomUUID().replace(/-/g, "").slice(0, 48);

  const newAccount: Account = {
    id,
    username: accountData.username.toLowerCase(),
    display_name: accountData.display_name,
    password_hash: accountData.password_hash,
    recovery_hash: accountData.recovery_hash,
    bio: accountData.bio || null,
    avatar_url: accountData.avatar_url || null,
    website: accountData.website || null,
    has_creator: Boolean(accountData.has_creator),
    has_studio: Boolean(accountData.has_studio),
    active_mode: accountData.active_mode || null,
    onboarding_step: accountData.onboarding_step ?? 1,
    onboarding_done: Boolean(accountData.onboarding_done),
    plan: accountData.plan || "free",
    creator_specialties: accountData.creator_specialties || [],
    studio_name: accountData.studio_name || null,
    studio_type: accountData.studio_type || null,
    studio_focus: accountData.studio_focus || [],
    studio_pledge_accepted: Boolean(accountData.studio_pledge_accepted),
    verification_status: accountData.verification_status || "none",
    verification_link: accountData.verification_link || null,
    verification_doc_path: accountData.verification_doc_path || null,
    account_key,
    created_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("accounts")
        .insert(newAccount)
        .select()
        .single();
      if (!error && data) return data as Account;
    } catch (e) {
      console.warn("Supabase createAccount error:", e);
    }
  }

  global.__vnAccounts?.push(newAccount);
  return newAccount;
}

export async function updateAccount(
  id: string,
  updates: Partial<Account>
): Promise<Account | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("accounts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) return data as Account;
    } catch (e) {
      console.warn("Supabase updateAccount error:", e);
    }
  }

  const idx = global.__vnAccounts?.findIndex((a) => a.id === id);
  if (idx !== undefined && idx !== -1 && global.__vnAccounts) {
    global.__vnAccounts[idx] = { ...global.__vnAccounts[idx], ...updates };
    return global.__vnAccounts[idx];
  }
  return null;
}

export async function checkAccountDeletionEligibility(id: string): Promise<{
  eligible: boolean;
  reason?: string;
  availableDate?: string;
}> {
  const now = new Date();
  const allRentals = await getRentalsList();

  // 1. Studio side: active rentals
  const activeStudioRentals = allRentals.filter(
    (r) =>
      r.studio_id === id &&
      r.expires_at &&
      new Date(r.expires_at).getTime() > now.getTime() &&
      !r.ended_early
  );
  if (activeStudioRentals.length > 0) {
    const latestExpiry = activeStudioRentals
      .map((r) => new Date(r.expires_at!).getTime())
      .sort((a, b) => b - a)[0];
    return {
      eligible: false,
      reason: `You have ${activeStudioRentals.length} active character rental(s).`,
      availableDate: new Date(latestExpiry).toLocaleDateString(),
    };
  }

  // 2. Creator side: characters with active rentals or in grace period
  const userCharacters = (await getCharacters({ owner_id: id })).map(
    (c) => c.id
  );
  const activeCharRentals = allRentals.filter(
    (r) =>
      userCharacters.includes(r.character_id) &&
      r.grace_ends_at &&
      new Date(r.grace_ends_at).getTime() > now.getTime() &&
      !r.ended_early
  );
  if (activeCharRentals.length > 0) {
    const latestGrace = activeCharRentals
      .map((r) => new Date(r.grace_ends_at!).getTime())
      .sort((a, b) => b - a)[0];
    return {
      eligible: false,
      reason: `Studios are actively renting your characters or are in the grace period.`,
      availableDate: new Date(latestGrace).toLocaleDateString(),
    };
  }

  return { eligible: true };
}

export async function deleteAccount(id: string): Promise<boolean> {
  const eligibility = await checkAccountDeletionEligibility(id);
  if (!eligibility.eligible) {
    throw new Error(eligibility.reason || "Account cannot be deleted yet.");
  }

  if (isSupabaseConfigured) {
    try {
      await supabaseServer.from("accounts").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase deleteAccount error:", e);
    }
  }

  if (global.__vnAccounts) {
    global.__vnAccounts = global.__vnAccounts.filter((a) => a.id !== id);
  }
  return true;
}

export async function logLoginAttempt(
  username: string,
  ip: string,
  ok: boolean
): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await supabaseServer
        .from("login_attempts")
        .insert({ username: username.toLowerCase(), ip, ok });
      return;
    } catch (e) {
      console.warn("Supabase logLoginAttempt error:", e);
    }
  }

  global.__vnLoginAttempts?.push({
    id: Date.now(),
    username: username.toLowerCase(),
    ip,
    ok,
    created_at: new Date().toISOString(),
  });
}

export async function checkLoginAttempts(
  username: string,
  ip: string
): Promise<{ allowed: boolean; remainingAttempts: number; waitMinutes?: number }> {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  let failedAttempts = 0;

  if (isSupabaseConfigured) {
    try {
      const { count } = await supabaseServer
        .from("login_attempts")
        .select("*", { count: "exact", head: true })
        .eq("username", username.toLowerCase())
        .eq("ip", ip)
        .eq("ok", false)
        .gte("created_at", tenMinutesAgo);
      failedAttempts = count || 0;
    } catch (e) {
      console.warn("Supabase checkLoginAttempts error:", e);
    }
  } else {
    failedAttempts = (global.__vnLoginAttempts || []).filter(
      (a) =>
        a.username === username.toLowerCase() &&
        a.ip === ip &&
        !a.ok &&
        a.created_at >= tenMinutesAgo
    ).length;
  }

  const maxAttempts = 5;
  if (failedAttempts >= maxAttempts) {
    return {
      allowed: false,
      remainingAttempts: 0,
      waitMinutes: 10,
    };
  }

  return {
    allowed: true,
    remainingAttempts: maxAttempts - failedAttempts,
  };
}

// ═══════════════════════════════════════════════════════════
// CHARACTERS
// ═══════════════════════════════════════════════════════════

export async function getCharacters(options?: {
  status?: string;
  owner_id?: string;
  buyer_id?: string;
  genre?: string;
  search?: string;
  tier?: string;
  allowed_uses?: string;
  price_filter?: string; // 'free' | 'rent' | 'sale'
  is_featured?: boolean;
  is_demo?: boolean;
  sort?: string;
  limit?: number;
  offset?: number;
}): Promise<Character[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabaseServer
        .from("characters")
        .select("*, owner:accounts(id, username, display_name, avatar_url, verification_status)");

      if (options?.status) {
        query = query.eq("status", options.status);
      } else {
        query = query.neq("status", "deleted");
      }

      if (options?.owner_id) query = query.eq("owner_id", options.owner_id);
      if (options?.buyer_id) query = query.eq("buyer_id", options.buyer_id);
      if (options?.is_featured) query = query.eq("is_featured", true);
      if (options?.is_demo) query = query.eq("is_demo", true);
      if (options?.tier) query = query.eq("fame_tier", options.tier);

      if (options?.search) {
        query = query.or(
          `name.ilike.%${options.search}%,vibe_summary.ilike.%${options.search}%,description.ilike.%${options.search}%`
        );
      }
      if (options?.genre && options.genre !== "All") {
        query = query.contains("genres", [options.genre]);
      }
      if (options?.price_filter === "free") {
        query = query.eq("is_free", true);
      } else if (options?.price_filter === "rent") {
        query = query.gt("price_daily_cents", 0);
      } else if (options?.price_filter === "sale") {
        query = query.eq("sale_enabled", true);
      }

      if (options?.sort === "fame") {
        query = query.order("fame_score", { ascending: false });
      } else if (options?.sort === "rating") {
        query = query.order("rating_avg", { ascending: false });
      } else if (options?.sort === "price_asc") {
        query = query.order("price_daily_cents", { ascending: true });
      } else if (options?.sort === "price_desc") {
        query = query.order("price_daily_cents", { ascending: false });
      } else if (options?.sort === "rentals") {
        query = query.order("rental_count", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      if (options?.limit) query = query.limit(options.limit);
      if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);

      const { data, error } = await query;
      if (!error && data) return data as Character[];
    } catch (e) {
      console.warn("Supabase getCharacters error:", e);
    }
  }

  let list = [...(global.__vnCharacters || [])];

  if (options?.status) {
    list = list.filter((c) => c.status === options.status);
  } else {
    list = list.filter((c) => c.status !== "deleted");
  }

  if (options?.owner_id) list = list.filter((c) => c.owner_id === options.owner_id);
  if (options?.buyer_id) list = list.filter((c) => c.buyer_id === options.buyer_id);
  if (options?.is_featured) list = list.filter((c) => c.is_featured);
  if (options?.is_demo) list = list.filter((c) => c.is_demo);
  if (options?.tier) list = list.filter((c) => c.fame_tier === options.tier);

  if (options?.search) {
    const s = options.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        (c.vibe_summary && c.vibe_summary.toLowerCase().includes(s)) ||
        (c.description && c.description.toLowerCase().includes(s)) ||
        c.id.toLowerCase().includes(s)
    );
  }

  if (options?.genre && options.genre !== "All") {
    list = list.filter((c) =>
      c.genres.some((g) => g.toLowerCase() === options.genre?.toLowerCase())
    );
  }

  if (options?.price_filter === "free") {
    list = list.filter((c) => c.is_free);
  } else if (options?.price_filter === "rent") {
    list = list.filter((c) => !c.is_free && c.price_daily_cents > 0);
  } else if (options?.price_filter === "sale") {
    list = list.filter((c) => c.sale_enabled);
  }

  if (options?.sort === "fame") {
    list.sort((a, b) => b.fame_score - a.fame_score);
  } else if (options?.sort === "rating") {
    list.sort((a, b) => b.rating_avg - a.rating_avg);
  } else if (options?.sort === "price_asc") {
    list.sort((a, b) => a.price_daily_cents - b.price_daily_cents);
  } else if (options?.sort === "price_desc") {
    list.sort((a, b) => b.price_daily_cents - a.price_daily_cents);
  } else if (options?.sort === "rentals") {
    list.sort((a, b) => b.rental_count - a.rental_count);
  } else {
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Attach owner partial
  return list.map((c) => {
    const owner = global.__vnAccounts?.find((a) => a.id === c.owner_id);
    return {
      ...c,
      owner: owner
        ? {
            id: owner.id,
            username: owner.username,
            display_name: owner.display_name,
            avatar_url: owner.avatar_url,
            verification_status: owner.verification_status,
          }
        : undefined,
    };
  });
}

export async function getCharacterById(id: string): Promise<Character | null> {
  const norm = id.trim().toUpperCase();
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("characters")
        .select("*, owner:accounts(id, username, display_name, avatar_url, verification_status)")
        .eq("id", norm)
        .maybeSingle();
      if (!error && data) return data as Character;
    } catch (e) {
      console.warn("Supabase getCharacterById error:", e);
    }
  }

  const found = global.__vnCharacters?.find((c) => c.id.toUpperCase() === norm);
  if (!found) return null;
  const owner = global.__vnAccounts?.find((a) => a.id === found.owner_id);
  return {
    ...found,
    owner: owner
      ? {
          id: owner.id,
          username: owner.username,
          display_name: owner.display_name,
          avatar_url: owner.avatar_url,
          verification_status: owner.verification_status,
        }
      : undefined,
  };
}

export async function getCharacterByNameOrId(
  query: string,
  accountId?: string
): Promise<Character | null> {
  const norm = query.trim().toLowerCase();
  const all = await getCharacters();
  // Check exact ID match first
  let found = all.find((c) => c.id.toLowerCase() === norm);
  if (!found) {
    // Check exact name match
    const matchingNames = all.filter((c) => c.name.toLowerCase() === norm);
    if (matchingNames.length === 1) {
      found = matchingNames[0];
    } else if (matchingNames.length > 1) {
      // Ambiguous name — return null so caller can ask for CVR ID
      return null;
    } else {
      // Partial name match
      found = all.find((c) => c.name.toLowerCase().includes(norm));
    }
  }
  return found || null;
}

export async function createCharacterDraft(
  ownerId: string,
  initialData?: Partial<Character>
): Promise<Character> {
  const year = new Date().getFullYear();
  const randNum = Math.floor(10000 + Math.random() * 90000);
  const id = `CVR-${year}-${randNum}`;

  const character: Character = {
    id,
    owner_id: ownerId,
    name: initialData?.name || "Untitled Character",
    status: "draft",
    tagline: initialData?.tagline || null,
    vibe_summary: initialData?.vibe_summary || "",
    description: initialData?.description || "",
    portrait_url: initialData?.portrait_url || null,
    gallery_urls: initialData?.gallery_urls || [],
    genres: initialData?.genres || ["Drama"],
    personality_tags: initialData?.personality_tags || [],
    allowed_uses: initialData?.allowed_uses || ["film", "advertising", "social", "game"],
    full_sheet: initialData?.full_sheet || "",
    sheet_word_count: 0,
    specificity_score: null,
    behavior_danger: initialData?.behavior_danger || null,
    behavior_funny: initialData?.behavior_funny || null,
    behavior_emotional: initialData?.behavior_emotional || null,
    behavior_social: initialData?.behavior_social || null,
    behavior_conflict: initialData?.behavior_conflict || null,
    physical_appearance: initialData?.physical_appearance || null,
    movement_style: initialData?.movement_style || null,
    signature_gesture: initialData?.signature_gesture || null,
    core_trait: initialData?.core_trait || null,
    secondary_trait: initialData?.secondary_trait || null,
    hidden_quality: initialData?.hidden_quality || null,
    greatest_fear: initialData?.greatest_fear || null,
    voice_pitch: initialData?.voice_pitch || null,
    voice_tone: initialData?.voice_tone || null,
    voice_pace: initialData?.voice_pace || null,
    voice_accent: initialData?.voice_accent || null,
    voice_baseline: initialData?.voice_baseline || null,
    voice_description: initialData?.voice_description || null,
    speaking_style: initialData?.speaking_style || null,
    verbal_habits: initialData?.verbal_habits || null,
    voice_sample_path: initialData?.voice_sample_path || null,
    is_free: Boolean(initialData?.is_free),
    trial_enabled: initialData?.trial_enabled ?? true,
    price_daily_cents: initialData?.price_daily_cents || 0,
    price_weekly_cents: initialData?.price_weekly_cents || 0,
    price_monthly_cents: initialData?.price_monthly_cents || 0,
    sale_enabled: Boolean(initialData?.sale_enabled),
    sale_price_cents: initialData?.sale_price_cents || null,
    accept_offers: Boolean(initialData?.accept_offers),
    min_offer_cents: initialData?.min_offer_cents || null,
    is_featured: false,
    is_demo: false,
    is_legend: false,
    fame_score: 0,
    fame_tier: "newcomer",
    rating_avg: 0,
    review_count: 0,
    rental_count: 0,
    unique_studios: 0,
    reel_views: 0,
    registration_hash: null,
    published_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("characters")
        .insert(character)
        .select()
        .single();
      if (!error && data) return data as Character;
    } catch (e) {
      console.warn("Supabase createCharacterDraft error:", e);
    }
  }

  global.__vnCharacters?.unshift(character);
  return character;
}

export async function updateCharacter(
  id: string,
  updates: Partial<Character>
): Promise<Character | null> {
  const norm = id.trim().toUpperCase();
  const cleanUpdates = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (updates.full_sheet !== undefined && updates.full_sheet !== null) {
    cleanUpdates.sheet_word_count = updates.full_sheet.trim().split(/\s+/).filter(Boolean).length;
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("characters")
        .update(cleanUpdates)
        .eq("id", norm)
        .select()
        .single();
      if (!error && data) return data as Character;
    } catch (e) {
      console.warn("Supabase updateCharacter error:", e);
    }
  }

  const idx = global.__vnCharacters?.findIndex((c) => c.id.toUpperCase() === norm);
  if (idx !== undefined && idx !== -1 && global.__vnCharacters) {
    global.__vnCharacters[idx] = { ...global.__vnCharacters[idx], ...cleanUpdates };
    return global.__vnCharacters[idx];
  }
  return null;
}

export async function checkCharacterDeletionEligibility(id: string): Promise<{
  eligible: boolean;
  reason?: string;
  availableDate?: string;
}> {
  const now = new Date();
  const rentals = await getRentalsByCharacter(id);
  const activeOrGrace = rentals.filter(
    (r) =>
      r.grace_ends_at &&
      new Date(r.grace_ends_at).getTime() > now.getTime() &&
      !r.ended_early
  );

  if (activeOrGrace.length > 0) {
    const latestGrace = activeOrGrace
      .map((r) => new Date(r.grace_ends_at!).getTime())
      .sort((a, b) => b - a)[0];
    return {
      eligible: false,
      reason: `Studios are currently renting this character or are in the 10-day grace period.`,
      availableDate: new Date(latestGrace).toLocaleDateString(),
    };
  }

  return { eligible: true };
}

export async function deleteCharacter(
  id: string
): Promise<{ success: boolean; reason?: string }> {
  const check = await checkCharacterDeletionEligibility(id);
  if (!check.eligible) {
    return { success: false, reason: check.reason };
  }

  await updateCharacter(id, { status: "deleted" });
  return { success: true };
}

export async function getCharactersCount(): Promise<number> {
  const active = (await getCharacters({ status: "active" })) || [];
  return active.length;
}

// ═══════════════════════════════════════════════════════════
// REEL SCENES
// ═══════════════════════════════════════════════════════════

export async function getReelScenes(characterId: string): Promise<ReelScene[]> {
  const norm = characterId.trim().toUpperCase();
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("reel_scenes")
        .select("*")
        .eq("character_id", norm)
        .order("position", { ascending: true });
      if (!error && data) return data as ReelScene[];
    } catch (e) {
      console.warn("Supabase getReelScenes error:", e);
    }
  }
  return (global.__vnReelScenes || [])
    .filter((s) => s.character_id.toUpperCase() === norm)
    .sort((a, b) => a.position - b.position);
}

export async function createReelScene(scene: Partial<ReelScene>): Promise<ReelScene> {
  const newScene: ReelScene = {
    id: scene.id || randomUUID(),
    character_id: (scene.character_id || "").toUpperCase(),
    category: scene.category || "danger",
    title: scene.title || "Scene",
    scene_text: scene.scene_text || null,
    video_url: scene.video_url || null,
    production_title: scene.production_title || null,
    production_link: scene.production_link || null,
    views: 0,
    position: scene.position ?? 0,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("reel_scenes")
        .insert(newScene)
        .select()
        .single();
      if (!error && data) return data as ReelScene;
    } catch (e) {
      console.warn("Supabase createReelScene error:", e);
    }
  }

  global.__vnReelScenes?.push(newScene);
  return newScene;
}

// ═══════════════════════════════════════════════════════════
// RENTALS & ACCESS CHECK
// Section 11: getAccess(accountId, characterId) returns access or denial
// ═══════════════════════════════════════════════════════════

export async function getRentalsList(): Promise<Rental[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer.from("rentals").select("*");
      if (!error && data) return data as Rental[];
    } catch (e) {
      console.warn("Supabase getRentalsList error:", e);
    }
  }
  return global.__vnRentals || [];
}

export async function getRentalsByStudio(studioId: string): Promise<Rental[]> {
  const all = await getRentalsList();
  const filtered = all.filter((r) => r.studio_id === studioId);
  const characters = await getCharacters();
  return filtered.map((r) => ({
    ...r,
    character: characters.find((c) => c.id === r.character_id),
  }));
}

export async function getRentalsByCharacter(
  characterId: string
): Promise<Rental[]> {
  const norm = characterId.trim().toUpperCase();
  const all = await getRentalsList();
  return all.filter((r) => r.character_id.toUpperCase() === norm);
}

export async function getRentalById(id: string): Promise<Rental | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("rentals")
        .select("*, character:characters(*)")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) return data as Rental;
    } catch (e) {
      console.warn("Supabase getRentalById error:", e);
    }
  }
  const found = global.__vnRentals?.find((r) => r.id === id);
  if (!found) return null;
  const character = await getCharacterById(found.character_id);
  return { ...found, character: character || undefined };
}

export async function createRental(rentalData: Partial<Rental>): Promise<Rental> {
  const id = rentalData.id || randomUUID();
  const pass_code =
    rentalData.pass_code ||
    `VN-${randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;

  const rental: Rental = {
    id,
    character_id: (rentalData.character_id || "").toUpperCase(),
    studio_id: rentalData.studio_id || "",
    kind: rentalData.kind || "rental",
    period: rentalData.period || "1d",
    pass_code,
    starts_at: rentalData.starts_at || new Date().toISOString(),
    expires_at: rentalData.expires_at || null,
    grace_ends_at: rentalData.grace_ends_at || null,
    credits_total: rentalData.credits_total || 50,
    credits_used: 0,
    settings: rentalData.settings || {
      humor: true,
      physical: true,
      dialogue: true,
      mode: "full",
    },
    price_cents: rentalData.price_cents || 0,
    ended_early: false,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("rentals")
        .insert(rental)
        .select()
        .single();
      if (!error && data) return data as Rental;
    } catch (e) {
      console.warn("Supabase createRental error:", e);
    }
  }

  global.__vnRentals?.unshift(rental);
  return rental;
}

export async function updateRental(
  id: string,
  updates: Partial<Rental>
): Promise<Rental | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("rentals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) return data as Rental;
    } catch (e) {
      console.warn("Supabase updateRental error:", e);
    }
  }

  const idx = global.__vnRentals?.findIndex((r) => r.id === id);
  if (idx !== undefined && idx !== -1 && global.__vnRentals) {
    global.__vnRentals[idx] = { ...global.__vnRentals[idx], ...updates };
    return global.__vnRentals[idx];
  }
  return null;
}

export async function endRentalEarly(id: string): Promise<Rental | null> {
  return updateRental(id, {
    expires_at: new Date().toISOString(),
    ended_early: true,
  });
}

export async function getAccess(
  accountId: string | null,
  characterId: string,
  ip?: string
): Promise<
  | {
      access: "owner_test" | "demo" | "trial" | "rental" | "free" | "purchased";
      rental?: Rental;
      character: Character;
    }
  | {
      denied: true;
      reason:
        | "expired"
        | "grace"
        | "no_credits"
        | "suspended"
        | "not_rented"
        | "rate_limited";
      message: string;
    }
> {
  const character = await getCharacterById(characterId);
  if (!character) {
    return {
      denied: true,
      reason: "not_rented",
      message: "Character was not found.",
    };
  }

  if (character.status === "suspended") {
    return {
      denied: true,
      reason: "suspended",
      message: `${character.name} is currently suspended by administration.`,
    };
  }

  // 1. Owner test access
  if (accountId && character.owner_id === accountId) {
    return { access: "owner_test", character };
  }

  // 2. Purchased access (exclusive owner)
  if (accountId && character.buyer_id === accountId) {
    return { access: "purchased", character };
  }

  // 3. Demo access for is_demo characters
  if (character.is_demo) {
    return { access: "demo", character };
  }

  if (!accountId) {
    return {
      denied: true,
      reason: "not_rented",
      message: "Sign in to access this character.",
    };
  }

  // 4. Check rentals for this studio and character
  const rentals = await getRentalsByStudio(accountId);
  const activeRental = rentals.find(
    (r) => r.character_id.toUpperCase() === character.id.toUpperCase()
  );

  if (!activeRental) {
    return {
      denied: true,
      reason: "not_rented",
      message: `You do not have an active rental for ${character.name}. Rent or start a trial in the marketplace.`,
    };
  }

  const now = new Date().getTime();
  const expiresAt = activeRental.expires_at
    ? new Date(activeRental.expires_at).getTime()
    : null;
  const graceEndsAt = activeRental.grace_ends_at
    ? new Date(activeRental.grace_ends_at).getTime()
    : null;

  // Check credits
  if (
    activeRental.kind !== "purchase" &&
    activeRental.credits_used >= activeRental.credits_total
  ) {
    return {
      denied: true,
      reason: "no_credits",
      message: `${character.name}'s generation credits are exhausted. Top up credits in Studio Library.`,
    };
  }

  // Check expiry & grace
  if (expiresAt && now > expiresAt) {
    if (graceEndsAt && now < graceEndsAt) {
      return {
        denied: true,
        reason: "grace",
        message: `${character.name}'s rental ended and is currently in the 10-day grace period. Renew in Library to reactivate.`,
      };
    }
    return {
      denied: true,
      reason: "expired",
      message: `${character.name}'s rental expired. Renew in Library.`,
    };
  }

  return {
    access:
      activeRental.kind === "trial"
        ? "trial"
        : activeRental.kind === "free"
        ? "free"
        : activeRental.kind === "purchase"
        ? "purchased"
        : "rental",
    rental: activeRental,
    character,
  };
}

// ═══════════════════════════════════════════════════════════
// GENERATIONS (Keep, Discard, Retry)
// ═══════════════════════════════════════════════════════════

export async function createGeneration(gen: Partial<Generation>): Promise<Generation> {
  const newGen: Generation = {
    id: gen.id || randomUUID(),
    rental_id: gen.rental_id || null,
    character_id: (gen.character_id || "").toUpperCase(),
    account_id: gen.account_id || null,
    scene_group: gen.scene_group || randomUUID(),
    source: gen.source || "web",
    scene_text: gen.scene_text || "",
    enriched_prompt: gen.enriched_prompt || "",
    breakdown: gen.breakdown || null,
    analysis: gen.analysis || null,
    status: gen.status || "preview",
    charged: Boolean(gen.charged),
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("generations")
        .insert(newGen)
        .select()
        .single();
      if (!error && data) return data as Generation;
    } catch (e) {
      console.warn("Supabase createGeneration error:", e);
    }
  }

  global.__vnGenerations?.unshift(newGen);
  return newGen;
}

export async function getGenerationById(id: string): Promise<Generation | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("generations")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) return data as Generation;
    } catch (e) {
      console.warn("Supabase getGenerationById error:", e);
    }
  }
  return global.__vnGenerations?.find((g) => g.id === id) || null;
}

export async function updateGeneration(
  id: string,
  updates: Partial<Generation>
): Promise<Generation | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("generations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) return data as Generation;
    } catch (e) {
      console.warn("Supabase updateGeneration error:", e);
    }
  }

  const idx = global.__vnGenerations?.findIndex((g) => g.id === id);
  if (idx !== undefined && idx !== -1 && global.__vnGenerations) {
    global.__vnGenerations[idx] = { ...global.__vnGenerations[idx], ...updates };
    return global.__vnGenerations[idx];
  }
  return null;
}

export async function countSceneGroupGenerations(sceneGroup: string): Promise<number> {
  if (isSupabaseConfigured) {
    try {
      const { count } = await supabaseServer
        .from("generations")
        .select("*", { count: "exact", head: true })
        .eq("scene_group", sceneGroup);
      return count || 0;
    } catch (e) {
      console.warn("Supabase countSceneGroupGenerations error:", e);
    }
  }
  return (
    global.__vnGenerations?.filter((g) => g.scene_group === sceneGroup).length || 0
  );
}

export async function getEnrichedScenesCount(): Promise<number> {
  if (isSupabaseConfigured) {
    try {
      const { count } = await supabaseServer
        .from("generations")
        .select("*", { count: "exact", head: true });
      return count || 0;
    } catch (e) {
      console.warn("Supabase getEnrichedScenesCount error:", e);
    }
  }
  return global.__vnGenerations?.length || 0;
}

export async function getGenerationsBySceneGroup(
  sceneGroup: string
): Promise<Generation[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("generations")
        .select("*")
        .eq("scene_group", sceneGroup)
        .order("created_at", { ascending: true });
      if (!error && data) return data as Generation[];
    } catch (e) {
      console.warn("Supabase getGenerationsBySceneGroup error:", e);
    }
  }
  return (global.__vnGenerations || []).filter((g) => g.scene_group === sceneGroup);
}

export async function incrementRentalCreditsUsed(
  rentalId: string,
  amount = 1
): Promise<void> {
  const rental = await getRentalById(rentalId);
  if (!rental) return;
  const newUsed = rental.credits_used + amount;
  await updateRental(rentalId, { credits_used: newUsed });
}

export async function getGenerationsList(limit = 100): Promise<Generation[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("generations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (!error && data) return data as Generation[];
    } catch (e) {
      console.warn("Supabase getGenerationsList error:", e);
    }
  }
  return (global.__vnGenerations || []).slice(0, limit);
}

// ═══════════════════════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════════════════════

export async function getReviews(
  characterId?: string,
  studioId?: string
): Promise<Review[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabaseServer
        .from("reviews")
        .select("*, studio:accounts(id, username, display_name, avatar_url, verification_status)")
        .eq("hidden", false);
      if (characterId) query = query.eq("character_id", characterId.toUpperCase());
      if (studioId) query = query.eq("studio_id", studioId);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (!error && data) return data as Review[];
    } catch (e) {
      console.warn("Supabase getReviews error:", e);
    }
  }

  let list = (global.__vnReviews || []).filter((r) => !r.hidden);
  if (characterId) list = list.filter((r) => r.character_id.toUpperCase() === characterId.toUpperCase());
  if (studioId) list = list.filter((r) => r.studio_id === studioId);
  return list.map((r) => {
    const studio = global.__vnAccounts?.find((a) => a.id === r.studio_id);
    return {
      ...r,
      studio: studio
        ? {
            id: studio.id,
            username: studio.username,
            display_name: studio.display_name,
            avatar_url: studio.avatar_url,
            verification_status: studio.verification_status,
          }
        : undefined,
    };
  });
}

export async function createReview(rev: Partial<Review>): Promise<Review> {
  const newRev: Review = {
    id: rev.id || randomUUID(),
    rental_id: rev.rental_id || "",
    character_id: (rev.character_id || "").toUpperCase(),
    studio_id: rev.studio_id || "",
    rating_consistency: rev.rating_consistency || 5,
    rating_depth: rev.rating_depth || 5,
    rating_value: rev.rating_value || 5,
    rating_overall: rev.rating_overall || 5,
    body: rev.body || "",
    production_type: rev.production_type || null,
    would_rent_again: rev.would_rent_again || "yes",
    creator_reply: null,
    creator_reply_at: null,
    helpful_count: 0,
    hidden: false,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("reviews")
        .insert(newRev)
        .select()
        .single();
      if (!error && data) {
        await recalculateCharacterFame(newRev.character_id);
        return data as Review;
      }
    } catch (e) {
      console.warn("Supabase createReview error:", e);
    }
  }

  global.__vnReviews?.unshift(newRev);
  await recalculateCharacterFame(newRev.character_id);
  return newRev;
}

export async function voteReviewHelpful(
  reviewId: string,
  accountId: string
): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabaseServer
        .from("review_votes")
        .insert({ review_id: reviewId, account_id: accountId });
      if (!error) {
        await supabaseServer.rpc("increment_review_helpful", { r_id: reviewId });
        return true;
      }
    } catch (e) {
      console.warn("Supabase voteReviewHelpful error:", e);
    }
  }

  const existing = (global.__vnReviewVotes || []).find(
    (v) => v.review_id === reviewId && v.account_id === accountId
  );
  if (existing) return false;

  global.__vnReviewVotes?.push({ review_id: reviewId, account_id: accountId });
  const review = global.__vnReviews?.find((r) => r.id === reviewId);
  if (review) review.helpful_count += 1;
  return true;
}

export async function replyReview(
  reviewId: string,
  reply: string
): Promise<Review | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("reviews")
        .update({ creator_reply: reply, creator_reply_at: new Date().toISOString() })
        .eq("id", reviewId)
        .select()
        .single();
      if (!error && data) return data as Review;
    } catch (e) {
      console.warn("Supabase replyReview error:", e);
    }
  }

  const review = global.__vnReviews?.find((r) => r.id === reviewId);
  if (review) {
    review.creator_reply = reply;
    review.creator_reply_at = new Date().toISOString();
    return review;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════
// FAME SCORE CALCULATION
// Section 9.6 Fame formula
// ═══════════════════════════════════════════════════════════

export async function recalculateCharacterFame(characterId: string): Promise<number> {
  const character = await getCharacterById(characterId);
  if (!character) return 0;

  const rentals = await getRentalsByCharacter(characterId);
  const reviews = await getReviews(characterId);
  const reelScenes = await getReelScenes(characterId);

  const rentalsCompleted = rentals.filter((r) => r.ended_early || (r.expires_at && new Date(r.expires_at) < new Date())).length;
  const uniqueStudios = new Set(rentals.map((r) => r.studio_id)).size;

  const reviewCount = reviews.length;
  const ratingAvg =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating_overall, 0) / reviewCount
      : 0;

  const totalReelViews = reelScenes.reduce((sum, s) => sum + s.views, 0);

  const createdTime = new Date(character.created_at).getTime();
  const monthsSincePublish = Math.max(
    0,
    Math.floor((Date.now() - createdTime) / (30 * 24 * 60 * 60 * 1000))
  );

  const hasCompleteReel =
    reelScenes.length >= 4 &&
    ["danger", "social", "emotional", "light"].every((cat) =>
      reelScenes.some((s) => s.category === cat)
    );

  const trials = rentals.filter((r) => r.kind === "trial").length;
  const paidRentals = rentals.filter((r) => r.kind === "rental" || r.kind === "purchase").length;
  const conversionRate = trials > 0 ? Math.min(1, paidRentals / trials) : 0;

  // Formula from Section 9.6:
  // fame = min(rentals_completed*10, 400)
  //      + min(unique_studios*25, 400)
  //      + (review_count>0 ? rating_avg*40 : 0) // max 200
  //      + min(reel_views/25, 100)
  //      + min(months_since_publish*5, 100)
  //      + (reel_complete ? 60 : 0)
  //      + trial_to_rental_conversion_rate*40 // 0–40
  const score = Math.round(
    Math.min(rentalsCompleted * 10, 400) +
      Math.min(uniqueStudios * 25, 400) +
      (reviewCount > 0 ? ratingAvg * 40 : 0) +
      Math.min(totalReelViews / 25, 100) +
      Math.min(monthsSincePublish * 5, 100) +
      (hasCompleteReel ? 60 : 0) +
      conversionRate * 40
  );

  let fame_tier: FameTier = "newcomer";
  if (character.is_legend) {
    fame_tier = "legend";
  } else if (score >= 600) {
    fame_tier = "veteran";
  } else if (score >= 300) {
    fame_tier = "established";
  } else if (score >= 100) {
    fame_tier = "rising";
  }

  await updateCharacter(characterId, {
    fame_score: score,
    fame_tier,
    rating_avg: Number(ratingAvg.toFixed(2)),
    review_count: reviewCount,
    rental_count: rentals.length,
    unique_studios: uniqueStudios,
    reel_views: totalReelViews,
  });

  return score;
}

// ═══════════════════════════════════════════════════════════
// OFFERS & PURCHASE
// ═══════════════════════════════════════════════════════════

export async function getOffers(
  characterId?: string,
  studioId?: string
): Promise<Offer[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabaseServer
        .from("offers")
        .select("*, character:characters(*), studio:accounts(id, username, display_name)");
      if (characterId) query = query.eq("character_id", characterId.toUpperCase());
      if (studioId) query = query.eq("studio_id", studioId);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (!error && data) return data as Offer[];
    } catch (e) {
      console.warn("Supabase getOffers error:", e);
    }
  }

  let list = global.__vnOffers || [];
  if (characterId) list = list.filter((o) => o.character_id.toUpperCase() === characterId.toUpperCase());
  if (studioId) list = list.filter((o) => o.studio_id === studioId);
  return list;
}

export async function createOffer(
  arg1:
    | string
    | {
        character_id: string;
        studio_id: string;
        amount_cents: number;
        message?: string;
      },
  studioId?: string,
  amountCents?: number,
  initialMessage?: string
): Promise<Offer> {
  let charId: string;
  let sId: string;
  let cents: number;
  let msg: string | undefined;

  if (typeof arg1 === "object") {
    charId = arg1.character_id;
    sId = arg1.studio_id;
    cents = arg1.amount_cents;
    msg = arg1.message;
  } else {
    charId = arg1;
    sId = studioId || "";
    cents = amountCents || 0;
    msg = initialMessage;
  }

  const newOffer: Offer = {
    id: randomUUID(),
    character_id: charId.toUpperCase(),
    studio_id: sId,
    amount_cents: cents,
    status: "open",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    message: msg || null,
    messages: msg
      ? [
          {
            id: randomUUID(),
            offer_id: "",
            sender_id: sId,
            amount_cents: cents,
            body: msg,
            created_at: new Date().toISOString(),
          },
        ]
      : [],
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("offers")
        .insert({
          id: newOffer.id,
          character_id: newOffer.character_id,
          studio_id: newOffer.studio_id,
          amount_cents: newOffer.amount_cents,
          status: newOffer.status,
        })
        .select()
        .single();
      if (!error && data) {
        if (initialMessage) {
          await supabaseServer.from("offer_messages").insert({
            offer_id: newOffer.id,
            sender_id: studioId,
            amount_cents: amountCents,
            body: initialMessage,
          });
        }
        return data as Offer;
      }
    } catch (e) {
      console.warn("Supabase createOffer error:", e);
    }
  }

  global.__vnOffers?.unshift(newOffer);
  return newOffer;
}

export async function getOfferById(id: string): Promise<Offer | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("offers")
        .select("*, character:characters(*), studio:accounts(id, username, display_name)")
        .eq("id", id)
        .single();
      if (!error && data) return data as Offer;
    } catch (e) {
      console.warn("Supabase getOfferById error:", e);
    }
  }

  const offer = (global.__vnOffers || []).find((o) => o.id === id);
  return offer || null;
}

export async function updateOfferStatus(
  id: string,
  status: Offer["status"],
  counterAmount?: number,
  counterMessage?: string,
  senderId?: string
): Promise<Offer | null> {
  const updatedAt = new Date().toISOString();
  if (isSupabaseConfigured) {
    try {
      const updateData: any = { status, updated_at: updatedAt };
      if (counterAmount) updateData.amount_cents = counterAmount;
      const { data, error } = await supabaseServer
        .from("offers")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        if (counterMessage && senderId) {
          await supabaseServer.from("offer_messages").insert({
            offer_id: id,
            sender_id: senderId,
            amount_cents: counterAmount || null,
            body: counterMessage,
          });
        }
        return data as Offer;
      }
    } catch (e) {
      console.warn("Supabase updateOfferStatus error:", e);
    }
  }

  const offer = (global.__vnOffers || []).find((o) => o.id === id);
  if (offer) {
    offer.status = status;
    offer.updated_at = updatedAt;
    if (counterAmount) offer.amount_cents = counterAmount;
    if (counterMessage && senderId) {
      if (!offer.messages) offer.messages = [];
      offer.messages.push({
        id: randomUUID(),
        offer_id: id,
        sender_id: senderId,
        amount_cents: counterAmount || null,
        body: counterMessage,
        created_at: updatedAt,
      });
    }
    return offer;
  }
  return null;
}

export async function getOffersByStudio(studioId: string): Promise<Offer[]> {
  return getOffers(undefined, studioId);
}

export async function getOffersByCreator(creatorId: string): Promise<Offer[]> {
  const characters = await getCharacters({ owner_id: creatorId });
  const charIds = new Set(characters.map((c) => c.id.toUpperCase()));
  const allOffers = await getOffers();
  return allOffers.filter((o) => charIds.has(o.character_id.toUpperCase()));
}

// ═══════════════════════════════════════════════════════════
// SKILL TEMPLATES
// ═══════════════════════════════════════════════════════════

export async function getSkillTemplates(
  category?: string,
  creatorId?: string,
  search?: string
): Promise<SkillTemplate[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabaseServer
        .from("skill_templates")
        .select("*, creator:accounts(id, username, display_name)");
      if (category && category !== "all") query = query.eq("category", category);
      if (creatorId) query = query.eq("creator_id", creatorId);
      if (search) query = query.ilike("title", `%${search}%`);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (!error && data) return data as SkillTemplate[];
    } catch (e) {
      console.warn("Supabase getSkillTemplates error:", e);
    }
  }

  let list = global.__vnSkillTemplates || [];
  if (category && category !== "all") list = list.filter((s) => s.category === category);
  if (creatorId) list = list.filter((s) => s.creator_id === creatorId);
  if (search) {
    const s = search.toLowerCase();
    list = list.filter((t) => t.title.toLowerCase().includes(s) || t.summary.toLowerCase().includes(s));
  }
  return list;
}

export async function getSkillTemplateById(
  id: string
): Promise<SkillTemplate | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("skill_templates")
        .select("*, creator:accounts(id, username, display_name)")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) return data as SkillTemplate;
    } catch (e) {
      console.warn("Supabase getSkillTemplateById error:", e);
    }
  }
  return global.__vnSkillTemplates?.find((s) => s.id === id) || null;
}

export async function createSkillTemplate(
  tmpl: Partial<SkillTemplate>
): Promise<SkillTemplate> {
  const wordCount = (tmpl.content || "").trim().split(/\s+/).filter(Boolean).length;
  const newTmpl: SkillTemplate = {
    id: tmpl.id || randomUUID(),
    creator_id: tmpl.creator_id || "",
    title: tmpl.title || "Untitled Skill",
    category: tmpl.category || "personality",
    summary: tmpl.summary || "",
    what_it_adds: tmpl.what_it_adds || [],
    sample_scene: tmpl.sample_scene || null,
    sample_output: tmpl.sample_output || null,
    preview_excerpt: tmpl.preview_excerpt || tmpl.content?.slice(0, 150) || null,
    content: tmpl.content || "",
    tags: tmpl.tags || [],
    price_cents: tmpl.price_cents || 0,
    word_count: wordCount,
    installs: 0,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("skill_templates")
        .insert(newTmpl)
        .select()
        .single();
      if (!error && data) return data as SkillTemplate;
    } catch (e) {
      console.warn("Supabase createSkillTemplate error:", e);
    }
  }

  global.__vnSkillTemplates?.unshift(newTmpl);
  return newTmpl;
}

export async function hasAcquiredSkill(
  templateId: string,
  accountId: string
): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const { count } = await supabaseServer
        .from("skill_acquisitions")
        .select("*", { count: "exact", head: true })
        .eq("template_id", templateId)
        .eq("account_id", accountId);
      return (count || 0) > 0;
    } catch (e) {
      console.warn("Supabase hasAcquiredSkill error:", e);
    }
  }
  return (global.__vnSkillAcquisitions || []).some(
    (a) => a.template_id === templateId && a.account_id === accountId
  );
}

export async function acquireSkill(
  templateId: string,
  accountId: string,
  priceCents: number
): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      await supabaseServer.from("skill_acquisitions").insert({
        template_id: templateId,
        account_id: accountId,
        price_cents: priceCents,
      });
      return true;
    } catch (e) {
      console.warn("Supabase acquireSkill error:", e);
    }
  }

  global.__vnSkillAcquisitions?.push({
    template_id: templateId,
    account_id: accountId,
    price_cents: priceCents,
    created_at: new Date().toISOString(),
  });
  return true;
}

// ═══════════════════════════════════════════════════════════
// CASTING CALLS
// ═══════════════════════════════════════════════════════════

export async function getCastingCalls(studioId?: string): Promise<CastingCall[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabaseServer
        .from("casting_calls")
        .select("*, studio:accounts(id, username, display_name)");
      if (studioId) query = query.eq("studio_id", studioId);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (!error && data) return data as CastingCall[];
    } catch (e) {
      console.warn("Supabase getCastingCalls error:", e);
    }
  }

  let list = global.__vnCastingCalls || [];
  if (studioId) list = list.filter((c) => c.studio_id === studioId);
  return list;
}

export async function createCastingCall(
  call: Partial<CastingCall>
): Promise<CastingCall> {
  const newCall: CastingCall = {
    id: call.id || randomUUID(),
    studio_id: call.studio_id || "",
    title: call.title || "Untitled Casting Call",
    description: call.description || "",
    genres: call.genres || [],
    budget_cents: call.budget_cents || null,
    deadline: call.deadline || null,
    min_tier: call.min_tier || null,
    status: "open",
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("casting_calls")
        .insert(newCall)
        .select()
        .single();
      if (!error && data) return data as CastingCall;
    } catch (e) {
      console.warn("Supabase createCastingCall error:", e);
    }
  }

  global.__vnCastingCalls?.unshift(newCall);
  return newCall;
}

export async function applyToCastingCall(
  callId: string,
  characterId: string,
  message: string
): Promise<CastingApplication> {
  const newApp: CastingApplication = {
    id: randomUUID(),
    call_id: callId,
    character_id: characterId.toUpperCase(),
    message,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("casting_applications")
        .insert(newApp)
        .select()
        .single();
      if (!error && data) return data as CastingApplication;
    } catch (e) {
      console.warn("Supabase applyToCastingCall error:", e);
    }
  }

  global.__vnCastingApplications?.unshift(newApp);
  return newApp;
}

export async function getCastingApplications(callId: string): Promise<CastingApplication[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("casting_applications")
        .select("*, character:characters(*)")
        .eq("call_id", callId)
        .order("created_at", { ascending: false });
      if (!error && data) return data as CastingApplication[];
    } catch (e) {
      console.warn("Supabase getCastingApplications error:", e);
    }
  }

  const apps = (global.__vnCastingApplications || []).filter((a) => a.call_id === callId);
  const characters = await getCharacters();
  return apps.map((a) => ({
    ...a,
    character: characters.find((c) => c.id === a.character_id) || undefined,
  }));
}

export async function updateCastingApplicationStatus(
  appId: string,
  status: "pending" | "shortlisted" | "declined"
): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      await supabaseServer
        .from("casting_applications")
        .update({ status })
        .eq("id", appId);
      return true;
    } catch (e) {
      console.warn("Supabase updateCastingApplicationStatus error:", e);
    }
  }

  const app = (global.__vnCastingApplications || []).find((a) => a.id === appId);
  if (app) {
    app.status = status;
    return true;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════
// SAVED CHARACTERS
// ═══════════════════════════════════════════════════════════

export async function getSavedCharacters(accountId: string): Promise<Character[]> {
  let charIds: string[] = [];
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabaseServer
        .from("saved_characters")
        .select("character_id")
        .eq("account_id", accountId);
      charIds = (data || []).map((d: any) => d.character_id);
    } catch (e) {
      console.warn("Supabase getSavedCharacters error:", e);
    }
  } else {
    charIds = (global.__vnSavedCharacters || [])
      .filter((s) => s.account_id === accountId)
      .map((s) => s.character_id);
  }

  const all = await getCharacters();
  return all.filter((c) => charIds.includes(c.id));
}

export async function toggleSaveCharacter(
  accountId: string,
  characterId: string
): Promise<boolean> {
  const norm = characterId.toUpperCase();
  const saved = await isCharacterSaved(accountId, norm);

  if (isSupabaseConfigured) {
    try {
      if (saved) {
        await supabaseServer
          .from("saved_characters")
          .delete()
          .eq("account_id", accountId)
          .eq("character_id", norm);
        return false;
      } else {
        await supabaseServer
          .from("saved_characters")
          .insert({ account_id: accountId, character_id: norm });
        return true;
      }
    } catch (e) {
      console.warn("Supabase toggleSaveCharacter error:", e);
    }
  }

  if (saved) {
    global.__vnSavedCharacters = (global.__vnSavedCharacters || []).filter(
      (s) => !(s.account_id === accountId && s.character_id === norm)
    );
    return false;
  } else {
    global.__vnSavedCharacters?.push({ account_id: accountId, character_id: norm });
    return true;
  }
}

export async function isCharacterSaved(
  accountId: string,
  characterId: string
): Promise<boolean> {
  const norm = characterId.toUpperCase();
  if (isSupabaseConfigured) {
    try {
      const { count } = await supabaseServer
        .from("saved_characters")
        .select("*", { count: "exact", head: true })
        .eq("account_id", accountId)
        .eq("character_id", norm);
      return (count || 0) > 0;
    } catch (e) {
      console.warn("Supabase isCharacterSaved error:", e);
    }
  }
  return (global.__vnSavedCharacters || []).some(
    (s) => s.account_id === accountId && s.character_id === norm
  );
}

// ═══════════════════════════════════════════════════════════
// TRANSACTIONS
// ═══════════════════════════════════════════════════════════

export async function createTransaction(tx: Partial<Transaction>): Promise<Transaction> {
  const newTx: Transaction = {
    id: tx.id || randomUUID(),
    payer_id: tx.payer_id || null,
    payee_id: tx.payee_id || null,
    character_id: tx.character_id ? tx.character_id.toUpperCase() : null,
    kind: tx.kind || "rental",
    amount_cents: tx.amount_cents || 0,
    platform_fee_cents: tx.platform_fee_cents || 0,
    mode: "test",
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("transactions")
        .insert(newTx)
        .select()
        .single();
      if (!error && data) return data as Transaction;
    } catch (e) {
      console.warn("Supabase createTransaction error:", e);
    }
  }

  global.__vnTransactions?.unshift(newTx);
  return newTx;
}

export async function getTransactionsByAccount(
  accountId: string
): Promise<Transaction[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("transactions")
        .select("*")
        .or(`payer_id.eq.${accountId},payee_id.eq.${accountId}`)
        .order("created_at", { ascending: false });
      if (!error && data) return data as Transaction[];
    } catch (e) {
      console.warn("Supabase getTransactionsByAccount error:", e);
    }
  }
  return (global.__vnTransactions || []).filter(
    (t) => t.payer_id === accountId || t.payee_id === accountId
  );
}

// ═══════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════

export async function getNotifications(
  accountId: string
): Promise<Notification[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("notifications")
        .select("*")
        .eq("account_id", accountId)
        .order("created_at", { ascending: false });
      if (!error && data) return data as Notification[];
    } catch (e) {
      console.warn("Supabase getNotifications error:", e);
    }
  }
  return (global.__vnNotifications || []).filter((n) => n.account_id === accountId);
}

export async function createNotification(
  notif: Partial<Notification>
): Promise<Notification> {
  const newNotif: Notification = {
    id: notif.id || randomUUID(),
    account_id: notif.account_id || "",
    type: notif.type || "info",
    title: notif.title || "Notification",
    body: notif.body || null,
    link: notif.link || null,
    read: false,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabaseServer
        .from("notifications")
        .insert(newNotif)
        .select()
        .single();
      if (!error && data) return data as Notification;
    } catch (e) {
      console.warn("Supabase createNotification error:", e);
    }
  }

  global.__vnNotifications?.unshift(newNotif);
  return newNotif;
}

export async function markNotificationRead(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await supabaseServer
        .from("notifications")
        .update({ read: true })
        .eq("id", id);
    } catch (e) {
      console.warn("Supabase markNotificationRead error:", e);
    }
  }

  const notif = global.__vnNotifications?.find((n) => n.id === id);
  if (notif) notif.read = true;
}

export async function markAllNotificationsRead(accountId: string): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await supabaseServer
        .from("notifications")
        .update({ read: true })
        .eq("account_id", accountId);
    } catch (e) {
      console.warn("Supabase markAllNotificationsRead error:", e);
    }
  }

  (global.__vnNotifications || [])
    .filter((n) => n.account_id === accountId)
    .forEach((n) => {
      n.read = true;
    });
}

// ═══════════════════════════════════════════════════════════
// MCP LOGS
// ═══════════════════════════════════════════════════════════

export async function logMcpCall(log: Partial<McpLog>): Promise<void> {
  const newLog: McpLog = {
    id: Date.now(),
    account_id: log.account_id || null,
    method: log.method || null,
    tool: log.tool || null,
    character_id: log.character_id ? log.character_id.toUpperCase() : null,
    ok: Boolean(log.ok),
    ms: log.ms || 0,
    error: log.error || null,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      await supabaseServer.from("mcp_logs").insert(newLog);
      return;
    } catch (e) {
      console.warn("Supabase logMcpCall error:", e);
    }
  }

  global.__vnMcpLogs?.unshift(newLog);
}

export async function getRecentMcpLogs(
  accountId?: string,
  limit = 10
): Promise<McpLog[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabaseServer.from("mcp_logs").select("*");
      if (accountId) query = query.eq("account_id", accountId);
      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit);
      if (!error && data) return data as McpLog[];
    } catch (e) {
      console.warn("Supabase getRecentMcpLogs error:", e);
    }
  }

  let list = global.__vnMcpLogs || [];
  if (accountId) list = list.filter((l) => l.account_id === accountId);
  return list.slice(0, limit);
}

// ═══════════════════════════════════════════════════════════
// BACKWARD-COMPATIBILITY EXPORT ALIASES
// ═══════════════════════════════════════════════════════════

export const getProfileByAccountKey = getAccountByKey;
export const getProfileById = getAccountById;
export const getRentalsByStudioId = getRentalsByStudio;
export const getCharacterByName = getCharacterByNameOrId;
export const getAllCharacters = getCharacters;
export const getReviewsByCharacterId = getReviews;
export const getReelScenesByCharacter = getReelScenes;
export const updateGenerationLogVideo = async (id: string, url: string) =>
  updateGeneration(id, { enriched_prompt: url });
export const getAllGenerationLogs = getGenerationsList;
export const getMcpLogs = getRecentMcpLogs;
export const createGenerationLog = createGeneration;
export const createOrUpdateProfile = updateAccount;
export const checkCharacterNameAvailable = async (name: string, ownerId: string) => true;
export const createCharacterWithSkills = createCharacterDraft;

export const DEMO_STUDIO: Partial<Account> = {
  id: "s0000000-0000-0000-0000-000000000002",
  username: "demo_studio",
  display_name: "Demo Studio",
  active_mode: "studio",
  has_studio: true,
  has_creator: false,
  account_key: "vn-test-key-001",
};

