-- Profiles table extends Supabase auth
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) 
    ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL,
  username TEXT UNIQUE,
  role TEXT NOT NULL 
    CHECK (role IN ('creator', 'studio')),
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  
  -- Studio specific fields
  studio_name TEXT,
  studio_verified BOOLEAN DEFAULT false,
  studio_verification_docs TEXT[],
  studio_type TEXT, 
    -- 'independent', 'company', 'agency'
  
  -- Creator specific fields  
  creator_speciality TEXT[],
    -- genres they create characters for
  
  -- MCP/API access
  account_key TEXT UNIQUE NOT NULL 
    DEFAULT 'vn-' || 
    encode(gen_random_bytes(20), 'hex'),
  
  -- Stats
  total_earnings DECIMAL(10,2) DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  
  -- Metadata
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Characters table (basic structure for now)
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY 
    DEFAULT 'CVR-' || 
    TO_CHAR(NOW(), 'YYYY') || '-' || 
    LPAD(
      FLOOR(RANDOM() * 99999 + 1)::TEXT, 
      5, '0'
    ),
  owner_id UUID REFERENCES profiles(id) 
    ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' 
    CHECK (status IN (
      'draft','active','paused',
      'sold','deleted'
    )),
  vibe_summary TEXT,
  avatar_url TEXT,
  fame_score INTEGER DEFAULT 0,
  total_rentals INTEGER DEFAULT 0,
  genres TEXT[] DEFAULT '{}',
  rental_price_monthly DECIMAL(10,2) 
    DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles 
  ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters 
  ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Profiles viewable by all" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users manage own profile" 
  ON profiles FOR ALL 
  USING (auth.uid() = id);

CREATE POLICY "Active characters viewable" 
  ON characters FOR SELECT 
  USING (status NOT IN ('deleted','draft') 
    OR owner_id = auth.uid());

CREATE POLICY "Owners manage characters" 
  ON characters FOR ALL 
  USING (auth.uid() = owner_id);

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION 
  handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS 
  on_auth_user_created ON auth.users;
  
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION 
  handle_new_user();
