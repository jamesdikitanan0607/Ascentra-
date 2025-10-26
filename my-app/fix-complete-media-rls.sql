-- Complete Fix for Forum Media RLS Policies
-- Addresses: RLS violations, missing media_type, and MediaViewerScreen loading issues

-- Enable RLS on both tables
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_media ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view all forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can insert own forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can update own forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can delete own forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Authenticated users can insert forum posts" ON public.forum_posts;

DROP POLICY IF EXISTS "Users can view all forum post media" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can insert forum post media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can delete forum post media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Forum post media viewable by all" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can add media to their posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can insert media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can update media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can delete media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Authenticated users can view media" ON public.forum_post_media;

-- FORUM_POSTS POLICIES
-- Allow all authenticated users to view forum posts
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

-- FORUM_POST_MEDIA POLICIES
-- Allow all authenticated users to view media (critical for MediaViewerScreen)
CREATE POLICY "Authenticated users can view media" ON public.forum_post_media
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- Allow users to insert media only for their own posts (fixes RLS violation)
CREATE POLICY "Users can insert media for own posts" ON public.forum_post_media
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        auth.uid() = (SELECT user_id FROM public.forum_posts WHERE id = post_id)
    );

-- Allow users to update media for their own posts
CREATE POLICY "Users can update media for own posts" ON public.forum_post_media
    FOR UPDATE 
    USING (
        auth.uid() IS NOT NULL AND 
        auth.uid() = (SELECT user_id FROM public.forum_posts WHERE id = post_id)
    );

-- Allow users to delete media for their own posts
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