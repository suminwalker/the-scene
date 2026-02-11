-- Enable RLS for venues
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Policies for venues
CREATE POLICY "Venues are viewable by everyone" ON public.venues
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert venues" ON public.venues
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Enable RLS for review_upvotes
ALTER TABLE public.review_upvotes ENABLE ROW LEVEL SECURITY;

-- Policies for review_upvotes
CREATE POLICY "Upvotes are viewable by everyone" ON public.review_upvotes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own upvotes" ON public.review_upvotes
    FOR ALL USING (auth.uid() = user_id);

-- Enable RLS for user_venue_activity
ALTER TABLE public.user_venue_activity ENABLE ROW LEVEL SECURITY;

-- Policies for user_venue_activity
CREATE POLICY "Activity is viewable by everyone" ON public.user_venue_activity
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own activity" ON public.user_venue_activity
    FOR ALL USING (auth.uid() = user_id);

-- Enable RLS for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);
