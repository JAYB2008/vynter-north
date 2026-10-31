-- ================================================================
-- VYNTER NORTH — COMPLETE DATABASE SCHEMA
-- Run this entire SQL script in your Supabase SQL Editor
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles (extends Supabase auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL,
  username TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('creator', 'studio')),
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  studio_name TEXT,
  studio_verified BOOLEAN DEFAULT false,
  studio_type TEXT,
  creator_specialties TEXT[] DEFAULT '{}',
  account_key TEXT UNIQUE NOT NULL DEFAULT 'vn-' || encode(gen_random_bytes(20), 'hex'),
  total_earnings DECIMAL(10,2) DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Characters
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY DEFAULT 'CVR-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 99999 + 1)::TEXT, 5, '0'),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','paused','sold','deleted')),
  vibe_summary TEXT,
  description TEXT,
  avatar_url TEXT,
  reference_images TEXT[] DEFAULT '{}',
  
  -- Full character sheet (the intelligence source)
  full_character_sheet TEXT,        -- main personality document, min 1000 chars
  behavior_dangerous TEXT,          -- how they act in dangerous situations
  behavior_funny TEXT,              -- how they act in comedic situations
  behavior_emotional TEXT,          -- how they act in emotional moments
  behavior_social TEXT,             -- how they act in social/crowd situations
  behavior_conflict TEXT,           -- how they act in conflict
  physical_appearance TEXT,         -- how they look
  movement_style TEXT,              -- how they move and carry themselves
  signature_gesture TEXT,           -- one physical habit
  core_trait TEXT,
  secondary_trait TEXT,
  hidden_quality TEXT,
  greatest_fear TEXT,
  voice_description TEXT,           -- text description of voice quality
  speaking_style TEXT,              -- fast/slow, formal/casual etc
  verbal_habits TEXT,               -- catchphrases, verbal tics
  voice_sample_url TEXT,            -- uploaded audio sample
  voice_analyzed_description TEXT,  -- AI analysis of voice sample
  
  -- Marketplace
  genres TEXT[] DEFAULT '{}',
  allowed_uses TEXT[] DEFAULT ARRAY['film','advertising','social_content','gaming'],
  rental_price_daily DECIMAL(10,2) DEFAULT 0,
  rental_price_weekly DECIMAL(10,2) DEFAULT 0,
  rental_price_monthly DECIMAL(10,2) DEFAULT 0,
  purchase_price DECIMAL(10,2),
  is_free BOOLEAN DEFAULT false,
  
  -- Stats
  fame_score INTEGER DEFAULT 0,
  total_rentals INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rentals
CREATE TABLE IF NOT EXISTS rentals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id TEXT REFERENCES characters(id) NOT NULL,
  studio_id UUID REFERENCES profiles(id) NOT NULL,
  rental_type TEXT CHECK (rental_type IN ('trial','daily','weekly','monthly','purchase','free')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','expired','cancelled')),
  mcp_token TEXT UNIQUE NOT NULL DEFAULT 'VN-' || encode(gen_random_bytes(24), 'hex'),
  generation_credits INTEGER DEFAULT 100,
  credits_used INTEGER DEFAULT 0,
  price_paid DECIMAL(10,2) DEFAULT 0,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill Templates Marketplace
CREATE TABLE IF NOT EXISTS skill_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('personality','movement','dialogue','genre_pack','full_template')),
  preview_text TEXT NOT NULL,  -- first 200 chars shown publicly
  content TEXT NOT NULL,        -- full content, shown after purchase
  price DECIMAL(10,2) DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  purchases INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id TEXT REFERENCES characters(id) NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) NOT NULL,
  rental_id UUID REFERENCES rentals(id) NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  review_text TEXT,
  would_rent_again BOOLEAN,
  production_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rental_id)
);

-- Generation logs
CREATE TABLE IF NOT EXISTS generation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_id UUID REFERENCES rentals(id),
  character_id TEXT REFERENCES characters(id),
  original_prompt TEXT,
  enriched_prompt TEXT,
  original_word_count INTEGER,
  enriched_word_count INTEGER,
  status TEXT DEFAULT 'kept' CHECK (status IN ('preview','kept','discarded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill template purchases
CREATE TABLE IF NOT EXISTS skill_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES skill_templates(id),
  buyer_id UUID REFERENCES profiles(id),
  price_paid DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, buyer_id)
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_purchases ENABLE ROW LEVEL SECURITY;

-- Drop old policies if existing
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
DROP POLICY IF EXISTS "profiles_owner_all" ON profiles;
DROP POLICY IF EXISTS "characters_public_read" ON characters;
DROP POLICY IF EXISTS "characters_owner_all" ON characters;
DROP POLICY IF EXISTS "rentals_studio_read" ON rentals;
DROP POLICY IF EXISTS "rentals_studio_insert" ON rentals;
DROP POLICY IF EXISTS "skill_templates_public_read" ON skill_templates;
DROP POLICY IF EXISTS "skill_templates_creator_all" ON skill_templates;
DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
DROP POLICY IF EXISTS "reviews_owner_insert" ON reviews;
DROP POLICY IF EXISTS "skill_purchases_buyer_read" ON skill_purchases;
DROP POLICY IF EXISTS "skill_purchases_buyer_insert" ON skill_purchases;

-- RLS Policies
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_owner_all" ON profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "characters_public_read" ON characters FOR SELECT USING (status IN ('active','paused') OR owner_id = auth.uid());
CREATE POLICY "characters_owner_all" ON characters FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "rentals_studio_read" ON rentals FOR SELECT USING (auth.uid() = studio_id);
CREATE POLICY "rentals_studio_insert" ON rentals FOR INSERT WITH CHECK (auth.uid() = studio_id);

CREATE POLICY "skill_templates_public_read" ON skill_templates FOR SELECT USING (true);
CREATE POLICY "skill_templates_creator_all" ON skill_templates FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_owner_insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "skill_purchases_buyer_read" ON skill_purchases FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "skill_purchases_buyer_insert" ON skill_purchases FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'creator')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
