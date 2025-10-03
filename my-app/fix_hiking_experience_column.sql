-- Fix hiking_experience column issue in profiles table
-- This script will ensure the profiles table has the correct structure
-- Run this in Supabase SQL Editor

-- First, let's check the current structure of the profiles table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if hiking_experience column exists
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'hiking_experience'
    ) THEN
        -- Add the hiking_experience column if it doesn't exist
        ALTER TABLE public.profiles 
        ADD COLUMN hiking_experience TEXT 
        CHECK (hiking_experience IN ('Beginner', 'Intermediate', 'Advanced', 'Expert'));
        
        RAISE NOTICE 'Added hiking_experience column to profiles table';
    ELSE
        RAISE NOTICE 'hiking_experience column already exists';
    END IF;
END $$;

-- Check if preferred_difficulty column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'preferred_difficulty'
    ) THEN
        -- Add the preferred_difficulty column if it doesn't exist
        ALTER TABLE public.profiles 
        ADD COLUMN preferred_difficulty TEXT 
        CHECK (preferred_difficulty IN ('Easy', 'Moderate', 'Hard', 'Advanced'));
        
        RAISE NOTICE 'Added preferred_difficulty column to profiles table';
    ELSE
        RAISE NOTICE 'preferred_difficulty column already exists';
    END IF;
END $$;

-- Check if total_hikes column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'total_hikes'
    ) THEN
        -- Add the total_hikes column if it doesn't exist
        ALTER TABLE public.profiles 
        ADD COLUMN total_hikes INTEGER DEFAULT 0;
        
        RAISE NOTICE 'Added total_hikes column to profiles table';
    ELSE
        RAISE NOTICE 'total_hikes column already exists';
    END IF;
END $$;

-- Check if total_distance_km column exists (or total_distance)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name IN ('total_distance_km', 'total_distance')
    ) THEN
        -- Add the total_distance_km column if it doesn't exist
        ALTER TABLE public.profiles 
        ADD COLUMN total_distance_km NUMERIC(10,2) DEFAULT 0;
        
        RAISE NOTICE 'Added total_distance_km column to profiles table';
    ELSE
        RAISE NOTICE 'total_distance or total_distance_km column already exists';
    END IF;
END $$;

-- Check if total_elevation_m column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'total_elevation_m'
    ) THEN
        -- Add the total_elevation_m column if it doesn't exist
        ALTER TABLE public.profiles 
        ADD COLUMN total_elevation_m INTEGER DEFAULT 0;
        
        RAISE NOTICE 'Added total_elevation_m column to profiles table';
    ELSE
        RAISE NOTICE 'total_elevation_m column already exists';
    END IF;
END $$;

-- If skill_level exists but hiking_experience doesn't, migrate the data
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'skill_level'
    ) AND EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'hiking_experience'
    ) THEN
        -- Migrate data from skill_level to hiking_experience
        UPDATE public.profiles 
        SET hiking_experience = CASE 
            WHEN skill_level = 'rookie_rambler' THEN 'Beginner'
            WHEN skill_level = 'trail_explorer' THEN 'Intermediate'
            WHEN skill_level = 'mountain_master' THEN 'Advanced'
            WHEN skill_level = 'summit_seeker' THEN 'Expert'
            ELSE 'Beginner'
        END
        WHERE hiking_experience IS NULL;
        
        RAISE NOTICE 'Migrated skill_level data to hiking_experience';
    END IF;
END $$;

-- Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create or replace RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow public viewing of profiles (you can modify this based on your privacy requirements)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_hiking_experience ON public.profiles(hiking_experience);
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_difficulty ON public.profiles(preferred_difficulty);
CREATE INDEX IF NOT EXISTS idx_profiles_total_hikes ON public.profiles(total_hikes);

-- Verify the final structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show success message
SELECT 'Profiles table structure has been fixed successfully!' as status;