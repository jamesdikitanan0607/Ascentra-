-- Migration: Fix forum_post_media table structure and ensure consistency
-- This migration ensures the forum_post_media table has the correct structure
-- and column names that match the application code

-- Check current table structure and fix if needed
DO $$
DECLARE
    has_post_id boolean := false;
    has_forum_post_id boolean := false;
BEGIN
    -- Check which column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'forum_post_media' 
        AND column_name = 'post_id'
        AND table_schema = 'public'
    ) INTO has_post_id;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'forum_post_media' 
        AND column_name = 'forum_post_id'
        AND table_schema = 'public'
    ) INTO has_forum_post_id;
    
    -- If we have forum_post_id but not post_id, rename the column
    IF has_forum_post_id AND NOT has_post_id THEN
        RAISE NOTICE 'Renaming forum_post_id to post_id for consistency';
        
        -- Drop existing foreign key constraint
        ALTER TABLE public.forum_post_media 
        DROP CONSTRAINT IF EXISTS forum_post_media_forum_post_id_fkey;
        
        -- Rename the column
        ALTER TABLE public.forum_post_media 
        RENAME COLUMN forum_post_id TO post_id;
        
        -- Recreate the foreign key constraint
        ALTER TABLE public.forum_post_media 
        ADD CONSTRAINT forum_post_media_post_id_fkey 
        FOREIGN KEY (post_id) REFERENCES public.forum_posts(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Column renamed successfully';
    END IF;
    
    -- If neither column exists, create the table properly
    IF NOT has_post_id AND NOT has_forum_post_id THEN
        RAISE NOTICE 'Creating forum_post_media table with correct structure';
        
        CREATE TABLE IF NOT EXISTS public.forum_post_media (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
            media_url TEXT NOT NULL,
            media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
            thumbnail_url TEXT,
            file_size INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Ensure all required columns exist
    -- Add thumbnail_url if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'forum_post_media' 
        AND column_name = 'thumbnail_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.forum_post_media ADD COLUMN thumbnail_url TEXT;
        RAISE NOTICE 'Added thumbnail_url column';
    END IF;
    
    -- Add file_size if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'forum_post_media' 
        AND column_name = 'file_size'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.forum_post_media ADD COLUMN file_size INTEGER;
        RAISE NOTICE 'Added file_size column';
    END IF;
    
    -- Ensure created_at exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'forum_post_media' 
        AND column_name = 'created_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.forum_post_media ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column';
    END IF;
END $$;

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_forum_post_media_post_id ON public.forum_post_media(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_media_media_type ON public.forum_post_media(media_type);
CREATE INDEX IF NOT EXISTS idx_forum_post_media_created_at ON public.forum_post_media(created_at DESC);

-- Enable RLS
ALTER TABLE public.forum_post_media ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view all forum post media" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can insert forum post media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can delete forum post media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Forum post media viewable by all" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can add media to their posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can insert media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can update media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can delete media for own posts" ON public.forum_post_media;

-- Create comprehensive RLS policies
-- Policy 1: Allow everyone to view forum post media
CREATE POLICY "Forum post media viewable by all" ON public.forum_post_media
    FOR SELECT 
    USING (true);

-- Policy 2: Allow authenticated users to insert media for their own posts
CREATE POLICY "Users can insert media for own posts" ON public.forum_post_media
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM public.forum_posts 
            WHERE public.forum_posts.id = public.forum_post_media.post_id 
            AND public.forum_posts.user_id = auth.uid()
        )
    );

-- Policy 3: Allow users to update media for their own posts
CREATE POLICY "Users can update media for own posts" ON public.forum_post_media
    FOR UPDATE 
    USING (
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM public.forum_posts 
            WHERE public.forum_posts.id = public.forum_post_media.post_id 
            AND public.forum_posts.user_id = auth.uid()
        )
    );

-- Policy 4: Allow users to delete media for their own posts
CREATE POLICY "Users can delete media for own posts" ON public.forum_post_media
    FOR DELETE 
    USING (
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM public.forum_posts 
            WHERE public.forum_posts.id = public.forum_post_media.post_id 
            AND public.forum_posts.user_id = auth.uid()
        )
    );

-- Verify the final table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'forum_post_media' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show the policies
SELECT 
    policyname, 
    permissive, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'forum_post_media'
ORDER BY policyname;

SELECT 'Migration completed successfully! forum_post_media table structure and RLS policies updated.' as status;