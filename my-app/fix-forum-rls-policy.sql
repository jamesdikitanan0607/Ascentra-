-- Fix forum_posts RLS policy to allow authenticated users to create posts
-- This addresses the "new row violates row-level security policy" error

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can create forum posts" ON forum_posts;

-- Create a more permissive policy for inserting forum posts
CREATE POLICY "Authenticated users can create forum posts" ON forum_posts
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Also ensure the policy for selecting forum posts is correct
DROP POLICY IF EXISTS "Forum posts viewable by all" ON forum_posts;
CREATE POLICY "Forum posts viewable by all" ON forum_posts
    FOR SELECT 
    USING (visibility = 'public' OR auth.uid() = user_id);

-- Add policy for updating own posts
DROP POLICY IF EXISTS "Users can update their own forum posts" ON forum_posts;
CREATE POLICY "Users can update their own forum posts" ON forum_posts
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Add policy for deleting own posts
DROP POLICY IF EXISTS "Users can delete their own forum posts" ON forum_posts;
CREATE POLICY "Users can delete their own forum posts" ON forum_posts
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Also fix forum_post_media table policies
ALTER TABLE forum_post_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Forum post media viewable by all" ON forum_post_media;
CREATE POLICY "Forum post media viewable by all" ON forum_post_media
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Users can add media to their posts" ON forum_post_media;
CREATE POLICY "Users can add media to their posts" ON forum_post_media
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM forum_posts 
            WHERE forum_posts.id = forum_post_media.forum_post_id 
            AND forum_posts.user_id = auth.uid()
        )
    );

-- Fix forum_likes table policies
ALTER TABLE forum_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Forum likes viewable by all" ON forum_likes;
CREATE POLICY "Forum likes viewable by all" ON forum_likes
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Users can manage their own forum likes" ON forum_likes;
CREATE POLICY "Users can manage their own forum likes" ON forum_likes
    FOR ALL 
    USING (auth.uid() = user_id);

-- Fix forum_comments table policies
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Forum comments viewable by all" ON forum_comments;
CREATE POLICY "Forum comments viewable by all" ON forum_comments
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Users can manage their own forum comments" ON forum_comments;
CREATE POLICY "Users can manage their own forum comments" ON forum_comments
    FOR ALL 
    USING (auth.uid() = user_id);

-- Verify the policies are working
SELECT 'Forum RLS policies updated successfully!' as status;