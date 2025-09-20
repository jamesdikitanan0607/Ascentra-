-- Create missing tables and columns for Hiking App
-- Run this SQL directly in your Supabase SQL Editor

-- 1. Add skill_level column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'skill_level'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN skill_level text;
        RAISE NOTICE 'Added skill_level column to profiles table';
    ELSE
        RAISE NOTICE 'skill_level column already exists in profiles table';
    END IF;
END $$;

-- 2. Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.favorites (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    spot_id uuid NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Enable Row Level Security on favorites table
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist and create new ones
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;

-- Create RLS policies for favorites
CREATE POLICY "Users can manage own favorites" ON public.favorites
    FOR ALL USING (auth.uid() = user_id);

-- 5. Grant permissions
GRANT ALL ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_spot_id ON public.favorites(spot_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_spot ON public.favorites(user_id, spot_id);

-- 7. Verify the changes
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'skill_level'
            AND table_schema = 'public'
        ) THEN 'skill_level column exists ✓'
        ELSE 'skill_level column missing ✗'
    END as skill_level_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'favorites'
            AND table_schema = 'public'
        ) THEN 'favorites table exists ✓'
        ELSE 'favorites table missing ✗'
    END as favorites_table_status;