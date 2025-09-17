-- Fix for Supabase schema errors
-- Run this in Supabase SQL Editor to fix missing table and column issues

-- 1. Add missing skill_level column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'skill_level'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN skill_level TEXT DEFAULT 'rookie_rambler' 
        CHECK (skill_level IN ('rookie_rambler', 'climb_chaser', 'rock_scrambler', 'summit_strider', 'earth_roamer'));
    END IF;
END $$;

-- 2. Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    spot_id UUID REFERENCES public.hiking_spots(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, spot_id)
);

-- 3. Enable Row Level Security on favorites table
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 4. Create policy for users to manage their own favorites
DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.favorites;
CREATE POLICY "Users can manage their own favorites" ON public.favorites
    FOR ALL USING (auth.uid() = user_id);

-- 5. Grant necessary permissions
GRANT ALL ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;

-- 6. Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- 7. Verify fixes
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'skill_level'
        ) THEN 'skill_level column exists ✓'
        ELSE 'skill_level column missing ✗'
    END as skill_level_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'favorites'
        ) THEN 'favorites table exists ✓'
        ELSE 'favorites table missing ✗'
    END as favorites_table_status;