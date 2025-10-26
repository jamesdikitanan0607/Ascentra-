-- Fix forum_post_media RLS policies and table structure
-- This addresses the RLS policy violations when inserting media for forum posts

-- First, let's check the current table structure and fix column naming if needed
-- The table should use 'post_id' to match the forum_posts table

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view all forum post media" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can insert forum post media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can delete forum post media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Forum post media viewable by all" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can add media to their posts" ON public.forum_post_media;

-- Ensure RLS is enabled
ALTER TABLE public.forum_post_media ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policies for forum_post_media
-- Policy 1: Allow everyone to view forum post media
CREATE POLICY "Forum post media viewable by all" ON public.forum_post_media
    FOR SELECT 
    USING (true);

-- Policy 2: Allow authenticated users to insert media for their own posts
-- This policy checks that the user owns the forum post they're adding media to
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

-- Verify the table structure - ensure we're using the correct column name
-- If the table uses 'forum_post_id' instead of 'post_id', we need to fix the policies
DO $$
BEGIN
    -- Check if forum_post_id column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'forum_post_media' 
        AND column_name = 'forum_post_id'
        AND table_schema = 'public'
    ) THEN
        -- Drop the policies we just created
        DROP POLICY IF EXISTS "Forum post media viewable by all" ON public.forum_post_media;
        DROP POLICY IF EXISTS "Users can insert media for own posts" ON public.forum_post_media;
        DROP POLICY IF EXISTS "Users can update media for own posts" ON public.forum_post_media;
        DROP POLICY IF EXISTS "Users can delete media for own posts" ON public.forum_post_media;
        
        -- Recreate with correct column name
        CREATE POLICY "Forum post media viewable by all" ON public.forum_post_media
            FOR SELECT 
            USING (true);

        CREATE POLICY "Users can insert media for own posts" ON public.forum_post_media
            FOR INSERT 
            WITH CHECK (
                auth.uid() IS NOT NULL AND 
                EXISTS (
                    SELECT 1 FROM public.forum_posts 
                    WHERE public.forum_posts.id = public.forum_post_media.forum_post_id 
                    AND public.forum_posts.user_id = auth.uid()
                )
            );

        CREATE POLICY "Users can update media for own posts" ON public.forum_post_media
            FOR UPDATE 
            USING (
                auth.uid() IS NOT NULL AND 
                EXISTS (
                    SELECT 1 FROM public.forum_posts 
                    WHERE public.forum_posts.id = public.forum_post_media.forum_post_id 
                    AND public.forum_posts.user_id = auth.uid()
                )
            );

        CREATE POLICY "Users can delete media for own posts" ON public.forum_post_media
            FOR DELETE 
            USING (
                auth.uid() IS NOT NULL AND 
                EXISTS (
                    SELECT 1 FROM public.forum_posts 
                    WHERE public.forum_posts.id = public.forum_post_media.forum_post_id 
                    AND public.forum_posts.user_id = auth.uid()
                )
            );
            
        RAISE NOTICE 'Updated RLS policies for forum_post_media table using forum_post_id column';
    ELSE
        RAISE NOTICE 'Updated RLS policies for forum_post_media table using post_id column';
    END IF;
END $$;

-- Also ensure forum_posts table has proper RLS policies
DROP POLICY IF EXISTS "Users can view all forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can insert own forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can update own forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can delete own forum posts" ON public.forum_posts;

-- Enable RLS on forum_posts
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- Create forum_posts policies
CREATE POLICY "Users can view all forum posts" ON public.forum_posts
    FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can insert forum posts" ON public.forum_posts
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update own forum posts" ON public.forum_posts
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own forum posts" ON public.forum_posts
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Test the policies by attempting a sample operation (this will help verify they work)
SELECT 'Forum RLS policies updated successfully!' as status;

-- Show current policies for verification
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('forum_posts', 'forum_post_media')
ORDER BY tablename, policyname;