-- Vynter North POC — Supabase Schema
-- Run this in the Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Characters Table
CREATE TABLE IF NOT EXISTS characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Character Skills Table
CREATE TABLE IF NOT EXISTS character_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  
  -- Physical Style
  resting_expression TEXT,
  movement_style TEXT,
  signature_gesture TEXT,
  stress_reaction TEXT,
  
  -- Personality
  core_trait TEXT,
  secondary_trait TEXT,
  handles_danger TEXT,
  what_makes_laugh TEXT,
  what_makes_angry TEXT,
  hidden_quality TEXT,
  
  -- Dialogue Style
  speaking_pace TEXT,
  language_mixing TEXT,
  humor_style TEXT,
  catchphrase TEXT,
  
  -- Summary
  vibe_summary TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Generation Logs Table
CREATE TABLE IF NOT EXISTS generation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id),
  original_prompt TEXT NOT NULL,
  enriched_prompt TEXT NOT NULL,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Enable Row Level Security (RLS)
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read & write for the POC (can be restricted for production)
CREATE POLICY "Public read characters" ON characters FOR SELECT USING (true);
CREATE POLICY "Public insert characters" ON characters FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update characters" ON characters FOR UPDATE USING (true);

CREATE POLICY "Public read character_skills" ON character_skills FOR SELECT USING (true);
CREATE POLICY "Public insert character_skills" ON character_skills FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update character_skills" ON character_skills FOR UPDATE USING (true);

CREATE POLICY "Public read generation_logs" ON generation_logs FOR SELECT USING (true);
CREATE POLICY "Public insert generation_logs" ON generation_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update generation_logs" ON generation_logs FOR UPDATE USING (true);
