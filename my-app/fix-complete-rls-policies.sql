-- Complete RLS Policy Fix for forum_post_media
-- This addresses all RLS issues and ensures proper media access

-- Enable RLS on both tables
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_media ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start clean
DROP POLICY IF EXISTS "Users can view all forum post media" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can insert forum post media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can delete forum post media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Forum post media viewable by all" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can add media to their posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can insert media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can update media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can delete media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Authenticated users can view media" ON public.forum_post_media;

-- Drop forum_posts policies
DROP POLICY IF EXISTS "Users can view all forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can insert own forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can update own forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can delete own forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Authenticated users can insert forum posts" ON public.forum_posts;

-- CREATE FORUM_POSTS POLICIES
-- Allow all authenticated users to view posts
CREATE POLICY "Authenticated users can view forum posts" ON public.forum_posts
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert their own posts
CREATE POLICY "Users can insert own forum posts" ON public.forum_posts
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Allow users to update their own posts
CREATE POLICY "Users can update own forum posts" ON public.forum_posts
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete own forum posts" ON public.forum_posts
    FOR DELETE 
    USING (auth.uid() = user_id);

-- CREATE FORUM_POST_MEDIA POLICIES
-- Policy 1: Allow all authenticated users to view media (CRITICAL for MediaViewerScreen)
CREATE POLICY "Authenticated users can view media" ON public.forum_post_media
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- Policy 2: Allow users to insert media for their own posts (CRITICAL for uploads)
CREATE POLICY "Users can insert media for own posts" ON public.forum_post_media
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        auth.uid() = (SELECT user_id FROM public.forum_posts WHERE id = post_id)
    );

-- Policy 3: Allow users to update media for their own posts
CREATE POLICY "Users can update media for own posts" ON public.forum_post_media
    FOR UPDATE 
    USING (
        auth.uid() IS NOT NULL AND 
        auth.uid() = (SELECT user_id FROM public.forum_posts WHERE id = post_id)
    );

-- Policy 4: Allow users to delete media for their own posts
CREATE POLICY "Users can delete media for own posts" ON public.forum_post_media
    FOR DELETE 
    USING (
        auth.uid() IS NOT NULL AND 
        auth.uid() = (SELECT user_id FROM public.forum_posts WHERE id = post_id)
    );

-- Verify policies were created
SELECT 'RLS policies created successfully!' as status;

-- Show the policies for verification
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename IN ('forum_posts', 'forum_post_media')
ORDER BY tablename, policyname;