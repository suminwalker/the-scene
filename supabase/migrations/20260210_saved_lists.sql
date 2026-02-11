-- Create lists table
CREATE TABLE IF NOT EXISTS public.lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create list_items table
CREATE TABLE IF NOT EXISTS public.list_items (
    list_id UUID REFERENCES public.lists(id) ON DELETE CASCADE NOT NULL,
    venue_id TEXT NOT NULL,
    venue_name TEXT NOT NULL,
    venue_image TEXT,
    venue_location TEXT,
    venue_category TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (list_id, venue_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lists_user_id ON public.lists(user_id);
CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON public.list_items(list_id);

-- RLS
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

-- Policies for lists
CREATE POLICY "Lists are viewable by everyone if public" ON public.lists
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own lists" ON public.lists
    FOR ALL USING (auth.uid() = user_id);

-- Policies for list_items
CREATE POLICY "List items are viewable if list is viewable" ON public.list_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.lists
            WHERE id = list_id AND (is_public = true OR user_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage items in their own lists" ON public.list_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.lists
            WHERE id = list_id AND user_id = auth.uid()
        )
    );
