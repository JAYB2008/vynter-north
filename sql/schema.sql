-- Vynter North Production Schema
-- Run this in the Supabase SQL editor to create all required tables & policies

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('creator', 'studio')),
  bio TEXT,
  avatar_url TEXT,
  account_key TEXT UNIQUE DEFAULT 
    'vn-' || encode(gen_random_bytes(16), 'hex'),
  verified BOOLEAN DEFAULT false,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY 
    DEFAULT 'CVR-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
    LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0'),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' 
    CHECK (status IN ('active', 'paused', 'sold', 'deleted')),
  
  -- Visual identity
  avatar_url TEXT,
  reference_images TEXT[], -- array of image URLs
  
  -- Basic info
  vibe_summary TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Full character sheet (the skill profile)
  -- General personality
  full_character_sheet TEXT NOT NULL,
    -- minimum 1000 characters, this is the main skill document
  
  -- Specific situation responses (structured fields)
  behavior_dangerous TEXT NOT NULL,
    -- How does this character behave in dangerous situations?
  behavior_funny TEXT NOT NULL,
    -- How does this character behave in funny/comedic situations?
  behavior_emotional TEXT NOT NULL,
    -- How does this character behave in emotional/sad situations?
  behavior_social TEXT NOT NULL,
    -- How does this character behave in social/crowd situations?
  behavior_conflict TEXT NOT NULL,
    -- How does this character behave in conflict/arguments?
  
  -- Appearance and movement
  physical_appearance TEXT NOT NULL,
    -- Describe their look, build, distinctive features
  movement_style TEXT NOT NULL,
    -- How do they move, walk, carry themselves?
  signature_gesture TEXT,
    -- One physical habit they always do
  
  -- Personality traits
  core_trait TEXT NOT NULL,
  secondary_trait TEXT,
  hidden_quality TEXT,
    -- Something they hide from others
  greatest_fear TEXT,
  
  -- Voice and speech (text description, no audio model yet)
  voice_description TEXT NOT NULL,
    -- Describe how they sound: pitch, tone, pace, accent
  speaking_style TEXT NOT NULL,
    -- Fast/slow, formal/casual, verbose/minimal
  verbal_habits TEXT,
    -- Catchphrases, verbal tics, language patterns
  
  -- Voice sample analysis (optional)
  voice_sample_url TEXT,
    -- URL to uploaded voice sample
  voice_analyzed_description TEXT,
    -- AI-generated description from analyzing voice sample
  
  -- Marketplace settings
  genres TEXT[] NOT NULL DEFAULT '{}',
  allowed_uses TEXT[] DEFAULT ARRAY[
    'film', 'advertising', 'social_content', 'gaming'
  ],
  
  -- Pricing
  rental_price_daily DECIMAL(10,2) DEFAULT 0,
  rental_price_weekly DECIMAL(10,2) DEFAULT 0,
  rental_price_monthly DECIMAL(10,2) DEFAULT 0,
  purchase_price DECIMAL(10,2),
    -- NULL means not for sale, only for rent
  is_free BOOLEAN DEFAULT false,
    -- If true, anyone can use without payment
  
  -- Stats (calculated)
  fame_score INTEGER DEFAULT 0,
  total_rentals INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character rentals
CREATE TABLE IF NOT EXISTS rentals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id TEXT REFERENCES characters(id),
  studio_id UUID REFERENCES profiles(id),
  
  rental_type TEXT CHECK (rental_type IN (
    'daily', 'weekly', 'monthly', 'purchase', 'free'
  )),
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active', 'expired', 'cancelled'
  )),
  
  -- MCP access
  mcp_token TEXT UNIQUE DEFAULT 
    'VN-' || encode(gen_random_bytes(24), 'hex'),
  
  -- Credits and usage
  generation_credits INTEGER DEFAULT 100,
  credits_used INTEGER DEFAULT 0,
  
  price_paid DECIMAL(10,2) DEFAULT 0,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
    -- NULL for purchases (permanent)
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills marketplace (separate from character skills)
-- Creators can sell skill templates/prompts
CREATE TABLE IF NOT EXISTS skill_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
    -- 'personality', 'movement', 'dialogue', 'genre', 'full_template'
  content TEXT NOT NULL,
    -- The actual skill/prompt template
  price DECIMAL(10,2) DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  purchases INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews on characters
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id TEXT REFERENCES characters(id),
  reviewer_id UUID REFERENCES profiles(id),
  rental_id UUID REFERENCES rentals(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rental_id, reviewer_id)
);

-- Generation logs (track usage)
CREATE TABLE IF NOT EXISTS generation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_id UUID REFERENCES rentals(id),
  character_id TEXT REFERENCES characters(id),
  original_prompt TEXT,
  enriched_prompt TEXT,
  original_word_count INTEGER,
  enriched_word_count INTEGER,
  status TEXT DEFAULT 'kept' 
    CHECK (status IN ('preview', 'kept', 'discarded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if needed
DROP POLICY IF EXISTS "Public profiles visible" ON profiles;
DROP POLICY IF EXISTS "Users manage own profile" ON profiles;
DROP POLICY IF EXISTS "Active characters visible" ON characters;
DROP POLICY IF EXISTS "Owners manage characters" ON characters;
DROP POLICY IF EXISTS "Studios see own rentals" ON rentals;
DROP POLICY IF EXISTS "Studios create rentals" ON rentals;
DROP POLICY IF EXISTS "Skill templates public" ON skill_templates;
DROP POLICY IF EXISTS "Creators manage templates" ON skill_templates;

-- RLS Policies
CREATE POLICY "Public profiles visible" ON profiles 
  FOR SELECT USING (true);
CREATE POLICY "Users manage own profile" ON profiles 
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Active characters visible" ON characters 
  FOR SELECT USING (status != 'deleted');
CREATE POLICY "Owners manage characters" ON characters 
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Studios see own rentals" ON rentals 
  FOR SELECT USING (auth.uid() = studio_id);
CREATE POLICY "Studios create rentals" ON rentals 
  FOR INSERT WITH CHECK (auth.uid() = studio_id);

CREATE POLICY "Skill templates public" ON skill_templates 
  FOR SELECT USING (true);
CREATE POLICY "Creators manage templates" ON skill_templates 
  FOR ALL USING (auth.uid() = creator_id);
