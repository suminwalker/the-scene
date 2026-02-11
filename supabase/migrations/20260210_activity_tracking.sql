-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    venue_id TEXT NOT NULL,
    venue_name TEXT NOT NULL,
    venue_image TEXT,
    venue_location TEXT,
    venue_category TEXT,
    action_type TEXT NOT NULL CHECK (action_type IN ('check_in', 'rate', 'review', 'list_add')),
    content TEXT,
    rating FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create saved_venues table
CREATE TABLE IF NOT EXISTS public.saved_venues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    venue_id TEXT NOT NULL,
    venue_name TEXT NOT NULL,
    venue_image TEXT,
    venue_location TEXT,
    venue_category TEXT,
    list_type TEXT DEFAULT 'want_to_try' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, venue_id, list_type)
);

-- Create follows table
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Policies for activities
CREATE POLICY "Activities are viewable by everyone" ON public.activities
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own activities" ON public.activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" ON public.activities
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities" ON public.activities
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for saved_venues
CREATE POLICY "Saved venues are viewable by everyone" ON public.saved_venues
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own saved venues" ON public.saved_venues
    FOR ALL USING (auth.uid() = user_id);

-- Policies for follows
CREATE POLICY "Follows are viewable by everyone" ON public.follows
    FOR SELECT USING (true);

CREATE POLICY "Users can manage who they follow" ON public.follows
    FOR ALL USING (auth.uid() = follower_id);

-- Add some indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_venue_id ON public.activities(venue_id);
CREATE INDEX IF NOT EXISTS idx_saved_venues_user_id ON public.saved_venues(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
