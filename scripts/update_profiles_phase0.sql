-- Update profiles table for Phase 0

-- 1. Unify handle/username
-- If 'username' exists, we'll use it as 'handle' or rename it. 
-- The inspection showed 'username'. Let's rename it to 'handle' or just treat it as handle.
-- For clarity, we'll add 'handle' if it doesn't match 'username', but renaming is cleaner if empty.
-- However, safe approach: Add columns if missing.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS handle TEXT UNIQUE;
-- If username has data, migrate it to handle (optional manual step if needed, but for now we assume new or compatible)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
        UPDATE profiles SET handle = username WHERE handle IS NULL;
    END IF;
END $$;

-- 2. Add Bio and Socials
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tiktok TEXT;

-- 3. Geographic Constraints (NYC)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_borough TEXT CHECK (home_borough IN ('Manhattan', 'Brooklyn'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_neighborhood TEXT;

-- 4. Privacy & Social
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS activity_visibility TEXT DEFAULT 'friends' CHECK (activity_visibility IN ('public', 'friends', 'private'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS allow_friend_requests BOOLEAN DEFAULT true;

-- 5. Onboarding State
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_data JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- 6. Metadata
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_handle_change TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 7. Create User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  price_range TEXT[], -- ['$', '$$', '$$$', '$$$$']
  preferred_times TEXT[], -- ['daytime', 'happy-hour', 'late-night']
  group_size_preference TEXT[], -- ['solo', 'date', 'small-group', 'large-group']
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_handle ON profiles(handle);
CREATE INDEX IF NOT EXISTS idx_profiles_home_borough ON profiles(home_borough);
