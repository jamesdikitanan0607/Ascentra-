-- Fix missing tables and columns

-- 1. Add missing tables if they don't exist
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    activity_type TEXT DEFAULT 'Hiking',
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    distance DECIMAL(10,2),
    duration INTEGER,
    elevation DECIMAL(10,2),
    route_data JSONB DEFAULT '{}',
    stats JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    tags TEXT[] DEFAULT '{}',
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add missing column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = 'total_km_traveled') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN total_km_traveled DECIMAL(10,2) DEFAULT 0.0;
    END IF;
END $$;

-- 3. Create necessary indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON public.forum_posts(user_id);

-- 4. Set up RLS (Row Level Security) policies
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for activities
CREATE POLICY "Enable read access for all users" 
ON public.activities 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Enable all for users based on user_id" 
ON public.activities 
FOR ALL 
USING (auth.uid() = user_id);

-- 6. Create policies for forum posts
CREATE POLICY "Enable read access for all users" 
ON public.forum_posts 
FOR SELECT 
USING (visibility = 'public');

CREATE POLICY "Enable all for users based on user_id" 
ON public.forum_posts 
FOR ALL 
USING (auth.uid() = user_id);

-- 7. Create updated_at trigger for activities
CREATE OR REPLACE FUNCTION update_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_activities_updated_at') THEN
        CREATE TRIGGER update_activities_updated_at
        BEFORE UPDATE ON public.activities
        FOR EACH ROW
        EXECUTE FUNCTION update_activities_updated_at();
    END IF;
END $$;

-- 8. Create updated_at trigger for forum_posts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_forum_posts_updated_at') THEN
        CREATE TRIGGER update_forum_posts_updated_at
        BEFORE UPDATE ON public.forum_posts
        FOR EACH ROW
        EXECUTE FUNCTION update_activities_updated_at();
    END IF;
END $$;
