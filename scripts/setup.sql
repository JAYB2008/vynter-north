-- VYNTER NORTH — FULL DATABASE SCHEMA
-- Run in the Supabase SQL editor. No dependency on Supabase Auth.

create extension if not exists pgcrypto;
create extension if not exists citext;
create sequence if not exists cvr_seq start 1;

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  username citext unique not null check (username ~ '^[A-Za-z0-9_]{3,24}$'),
  display_name text not null,
  password_hash text not null,
  recovery_hash text not null,
  bio text,
  avatar_url text,
  website text,
  has_creator boolean not null default false,
  has_studio boolean not null default false,
  active_mode text check (active_mode in ('creator','studio')),
  onboarding_step int not null default 0,
  onboarding_done boolean not null default false,
  plan text not null default 'free' check (plan in ('free','starter','creator','studio')),
  creator_specialties text[] default '{}',
  studio_name text,
  studio_type text,
  studio_focus text[] default '{}',
  studio_pledge_accepted boolean not null default false,
  verification_status text not null default 'none' check (verification_status in ('none','pending','verified','rejected')),
  verification_link text,
  verification_doc_path text,
  account_key text unique not null default encode(gen_random_bytes(24),'hex'),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create table if not exists login_attempts (
  id bigserial primary key,
  username text,
  ip text,
  ok boolean,
  created_at timestamptz default now()
);

create table if not exists characters (
  id text primary key default ('CVR-' || to_char(now(),'YYYY') || '-' || lpad(nextval('cvr_seq')::text,5,'0')),
  owner_id uuid not null references accounts(id) on delete cascade,
  buyer_id uuid references accounts(id),
  name text not null,
  status text not null default 'draft' check (status in ('draft','active','closed','sold','deleted','suspended')),
  tagline text,
  vibe_summary text,
  description text,
  portrait_url text,
  gallery_urls text[] default '{}',
  genres text[] default '{}',
  personality_tags text[] default '{}',
  allowed_uses text[] default '{film,advertising,social,game}',
  full_sheet text,
  sheet_word_count int default 0,
  specificity_score int,
  behavior_danger text,
  behavior_funny text,
  behavior_emotional text,
  behavior_social text,
  behavior_conflict text,
  physical_appearance text,
  movement_style text,
  signature_gesture text,
  core_trait text,
  secondary_trait text,
  hidden_quality text,
  greatest_fear text,
  voice_pitch text,
  voice_tone text,
  voice_pace text,
  voice_accent text,
  voice_baseline text,
  voice_description text,
  speaking_style text,
  verbal_habits text,
  voice_sample_path text,
  is_free boolean default false,
  trial_enabled boolean default true,
  price_daily_cents int default 0,
  price_weekly_cents int default 0,
  price_monthly_cents int default 0,
  sale_enabled boolean default false,
  sale_price_cents int,
  accept_offers boolean default false,
  min_offer_cents int,
  is_featured boolean default false,
  is_demo boolean default false,
  is_legend boolean default false,
  fame_score int default 0,
  fame_tier text default 'newcomer',
  rating_avg numeric(3,2) default 0,
  review_count int default 0,
  rental_count int default 0,
  unique_studios int default 0,
  reel_views int default 0,
  registration_hash text,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists characters_owner_name on characters(owner_id, lower(name)) where status <> 'deleted';
create index if not exists characters_status on characters(status);
create index if not exists characters_fame on characters(fame_score desc);

create table if not exists reel_scenes (
  id uuid primary key default gen_random_uuid(),
  character_id text not null references characters(id) on delete cascade,
  category text not null check (category in ('danger','social','emotional','light','extra')),
  title text not null,
  scene_text text,
  video_url text,
  production_title text,
  production_link text,
  views int default 0,
  position int default 0,
  created_at timestamptz default now()
);

create table if not exists rentals (
  id uuid primary key default gen_random_uuid(),
  character_id text not null references characters(id),
  studio_id uuid not null references accounts(id),
  kind text not null check (kind in ('trial','rental','free','purchase')),
  period text check (period in ('3d','1d','7d','30d','permanent')),
  pass_code text unique not null default ('VN-' || upper(encode(gen_random_bytes(5),'hex'))),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  grace_ends_at timestamptz,
  credits_total int not null default 0,
  credits_used int not null default 0,
  settings jsonb not null default '{"humor":true,"physical":true,"dialogue":true,"mode":"full"}',
  price_cents int not null default 0,
  ended_early boolean default false,
  created_at timestamptz default now()
);
create index if not exists rentals_studio on rentals(studio_id);
create index if not exists rentals_character on rentals(character_id);

create table if not exists generations (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid references rentals(id),
  character_id text not null references characters(id),
  account_id uuid references accounts(id),
  scene_group uuid not null default gen_random_uuid(),
  source text not null default 'web' check (source in ('web','mcp','demo','creator_test')),
  scene_text text not null,
  enriched_prompt text,
  breakdown jsonb,
  analysis jsonb,
  status text not null default 'preview' check (status in ('preview','kept','discarded')),
  charged boolean default false,
  created_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid unique not null references rentals(id),
  character_id text not null references characters(id) on delete cascade,
  studio_id uuid not null references accounts(id),
  rating_consistency int not null check (rating_consistency between 1 and 5),
  rating_depth int not null check (rating_depth between 1 and 5),
  rating_value int not null check (rating_value between 1 and 5),
  rating_overall int not null check (rating_overall between 1 and 5),
  body text not null check (char_length(body) >= 50),
  production_type text,
  would_rent_again text check (would_rent_again in ('yes','no','maybe')),
  creator_reply text,
  creator_reply_at timestamptz,
  helpful_count int default 0,
  hidden boolean default false,
  created_at timestamptz default now()
);

create table if not exists review_votes (
  review_id uuid references reviews(id) on delete cascade,
  account_id uuid references accounts(id) on delete cascade,
  primary key (review_id, account_id)
);

create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  character_id text not null references characters(id) on delete cascade,
  studio_id uuid not null references accounts(id),
  amount_cents int not null,
  status text not null default 'open' check (status in ('open','countered','accepted','declined','withdrawn')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists offer_messages (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references offers(id) on delete cascade,
  sender_id uuid not null references accounts(id),
  amount_cents int,
  body text,
  created_at timestamptz default now()
);

create table if not exists skill_templates (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references accounts(id) on delete cascade,
  title text not null,
  category text not null check (category in ('personality','movement','dialogue','genre_pack','full_template')),
  summary text not null,
  what_it_adds text[] not null default '{}',
  sample_scene text,
  sample_output text,
  preview_excerpt text,
  content text not null,
  tags text[] default '{}',
  price_cents int not null default 0 check (price_cents between 0 and 1500),
  word_count int default 0,
  installs int default 0,
  created_at timestamptz default now()
);

create table if not exists skill_acquisitions (
  template_id uuid references skill_templates(id) on delete cascade,
  account_id uuid references accounts(id) on delete cascade,
  price_cents int default 0,
  created_at timestamptz default now(),
  primary key (template_id, account_id)
);

create table if not exists casting_calls (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references accounts(id) on delete cascade,
  title text not null,
  description text not null,
  genres text[] default '{}',
  budget_cents int,
  deadline date,
  min_tier text,
  status text default 'open' check (status in ('open','closed','filled')),
  created_at timestamptz default now()
);

create table if not exists casting_applications (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references casting_calls(id) on delete cascade,
  character_id text not null references characters(id) on delete cascade,
  message text,
  status text default 'pending' check (status in ('pending','shortlisted','declined')),
  created_at timestamptz default now(),
  unique (call_id, character_id)
);

create table if not exists saved_characters (
  account_id uuid references accounts(id) on delete cascade,
  character_id text references characters(id) on delete cascade,
  primary key (account_id, character_id)
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  payer_id uuid references accounts(id),
  payee_id uuid references accounts(id),
  character_id text references characters(id),
  kind text not null check (kind in ('rental','purchase','topup','skill','plan')),
  amount_cents int not null,
  platform_fee_cents int not null default 0,
  mode text not null default 'test',
  created_at timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read boolean default false,
  created_at timestamptz default now()
);

create table if not exists mcp_logs (
  id bigserial primary key,
  account_id uuid references accounts(id) on delete cascade,
  method text,
  tool text,
  character_id text,
  ok boolean,
  ms int,
  error text,
  created_at timestamptz default now()
);

create table if not exists fame_snapshots (
  character_id text references characters(id) on delete cascade,
  week date not null,
  score int not null,
  rank int,
  primary key (character_id, week)
);

-- Enable RLS on all tables with no policies (defense-in-depth, service-role only)
alter table accounts enable row level security;
alter table login_attempts enable row level security;
alter table characters enable row level security;
alter table reel_scenes enable row level security;
alter table rentals enable row level security;
alter table generations enable row level security;
alter table reviews enable row level security;
alter table review_votes enable row level security;
alter table offers enable row level security;
alter table offer_messages enable row level security;
alter table skill_templates enable row level security;
alter table skill_acquisitions enable row level security;
alter table casting_calls enable row level security;
alter table casting_applications enable row level security;
alter table saved_characters enable row level security;
alter table transactions enable row level security;
alter table notifications enable row level security;
alter table mcp_logs enable row level security;
alter table fame_snapshots enable row level security;
