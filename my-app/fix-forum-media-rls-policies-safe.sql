-- Safe Fix for forum_post_media RLS policies and table structure
-- This addresses the RLS policy violations when inserting media for forum posts
-- This version safely handles existing policies without errors

-- First, let's check the current table structure and identify column names
DO $$
DECLARE
    has_post_id boolean := false;
    has_forum_post_id boolean := false;
    column_to_use text;
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
    
    -- Determine which column to use
    IF has_post_id THEN
        column_to_use := 'post_id';
    ELSIF has_forum_post_id THEN
        column_to_use := 'forum_post_id';
    ELSE
        RAISE EXCEPTION 'Neither post_id nor forum_post_id column found in forum_post_media table';
    END IF;
    
    RAISE NOTICE 'Using column: %', column_to_use;
    
    -- Ensure RLS is enabled
    ALTER TABLE public.forum_post_media ENABLE ROW LEVEL SECURITY;
    
    -- Drop ALL existing policies to start fresh
    DROP POLICY IF EXISTS "Users can view all forum post media" ON public.forum_post_media;
    DROP POLICY IF EXISTS "Users can insert forum post media for own posts" ON public.forum_post_media;
    DROP POLICY IF EXISTS "Users can delete forum post media for own posts" ON public.forum_post_media;
    DROP POLICY IF EXISTS "Forum post media viewable by all" ON public.forum_post_media;
    DROP POLICY IF EXISTS "Users can add media to their posts" ON public.forum_post_media;
    DROP POLICY IF EXISTS "Users can insert media for own posts" ON public.forum_post_media;
    DROP POLICY IF EXISTS "Users can update media for own posts" ON public.forum_post_media;
    DROP POLICY IF EXISTS "Users can delete media for own posts" ON public.forum_post_media;
    
    -- Create new policies with the correct column name
    -- Policy 1: Allow everyone to view forum post media
    EXECUTE format('
        CREATE POLICY "Forum post media viewable by all" ON public.forum_post_media
            FOR SELECT 
            USING (true)
    ');
    
    -- Policy 2: Allow authenticated users to insert media for their own posts
    EXECUTE format('
        CREATE POLICY "Users can insert media for own posts" ON public.forum_post_media
            FOR INSERT 
            WITH CHECK (
                auth.uid() IS NOT NULL AND 
                EXISTS (
                    SELECT 1 FROM public.forum_posts 
                    WHERE public.forum_posts.id = public.forum_post_media.%I 
                    AND public.forum_posts.user_id = auth.uid()
                )
            )
    ', column_to_use);
    
    -- Policy 3: Allow users to update media for their own posts
    EXECUTE format('
        CREATE POLICY "Users can update media for own posts" ON public.forum_post_media
            FOR UPDATE 
            USING (
                auth.uid() IS NOT NULL AND 
                EXISTS (
                    SELECT 1 FROM public.forum_posts 
                    WHERE public.forum_posts.id = public.forum_post_media.%I 
                    AND public.forum_posts.user_id = auth.uid()
                )
            )
    ', column_to_use);
    
    -- Policy 4: Allow users to delete media for their own posts
    EXECUTE format('
        CREATE POLICY "Users can delete media for own posts" ON public.forum_post_media
            FOR DELETE 
            USING (
                auth.uid() IS NOT NULL AND 
                EXISTS (
                    SELECT 1 FROM public.forum_posts 
                    WHERE public.forum_posts.id = public.forum_post_media.%I 
                    AND public.forum_posts.user_id = auth.uid()
                )
            )
    ', column_to_use);
    
    RAISE NOTICE 'Successfully created RLS policies for forum_post_media using column: %', column_to_use;
END $$;

-- Also ensure forum_posts table has proper RLS policies
DO $$
BEGIN
    -- Enable RLS on forum_posts
    ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing forum_posts policies
    DROP POLICY IF EXISTS "Users can view all forum posts" ON public.forum_posts;
    DROP POLICY IF EXISTS "Users can insert own forum posts" ON public.forum_posts;
    DROP POLICY IF EXISTS "Users can update own forum posts" ON public.forum_posts;
    DROP POLICY IF EXISTS "Users can delete own forum posts" ON public.forum_posts;
    DROP POLICY IF EXISTS "Authenticated users can insert forum posts" ON public.forum_posts;
    
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
        
    RAISE NOTICE 'Successfully created RLS policies for forum_posts';
END $$;

-- Verify the policies were created successfully
SELECT 'Forum RLS policies updated successfully!' as status;

-- Show current policies for verification
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd, 
    CASE 
        WHEN length(qual) > 50 THEN left(qual, 50) || '...'
        ELSE qual 
    END as qual_short,
    CASE 
        WHEN length(with_check) > 50 THEN left(with_check, 50) || '...'
        ELSE with_check 
    END as with_check_short
FROM pg_policies 
WHERE tablename IN ('forum_posts', 'forum_post_media')
ORDER BY tablename, policyname;

-- Test if we can query the tables (this should work)
SELECT 
    'forum_post_media' as table_name,
    count(*) as row_count
FROM public.forum_post_media
UNION ALL
SELECT 
    'forum_posts' as table_name,
    count(*) as row_count
FROM public.forum_posts;