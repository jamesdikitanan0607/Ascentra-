-- Fix forum_posts table structure to match the schema
-- Add missing columns that are expected by the application

-- Add missing columns to forum_posts table
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to have proper defaults
UPDATE forum_posts 
SET 
  category = COALESCE(category, 'General'),
  visibility = COALESCE(visibility, 'public'),
  is_pinned = COALESCE(is_pinned, false),
  is_locked = COALESCE(is_locked, false),
  view_count = COALESCE(view_count, 0),
  updated_at = COALESCE(updated_at, created_at)
WHERE category IS NULL OR visibility IS NULL OR is_pinned IS NULL OR is_locked IS NULL OR view_count IS NULL OR updated_at IS NULL;

-- Add the updated_at trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_forum_posts_updated_at ON forum_posts;
CREATE TRIGGER trigger_forum_posts_updated_at
    BEFORE UPDATE ON forum_posts
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Fix the tags column to be TEXT[] instead of just array
-- First check if we need to convert the column type
DO $$ 
BEGIN
    -- Check if tags column exists and what type it is
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'forum_posts' 
        AND column_name = 'tags' 
        AND data_type != 'ARRAY'
    ) THEN
        -- Convert tags to TEXT[] if it's not already
        ALTER TABLE forum_posts ALTER COLUMN tags TYPE TEXT[] USING tags::TEXT[];
    END IF;
END $$;

-- Ensure RLS is enabled and policies are correct
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies with correct logic
DROP POLICY IF EXISTS "Forum posts viewable by all" ON forum_posts;
CREATE POLICY "Forum posts viewable by all" ON forum_posts
    FOR SELECT 
    USING (visibility = 'public' OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can create forum posts" ON forum_posts;
CREATE POLICY "Authenticated users can create forum posts" ON forum_posts
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own forum posts" ON forum_posts;
CREATE POLICY "Users can update their own forum posts" ON forum_posts
    FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own forum posts" ON forum_posts;
CREATE POLICY "Users can delete their own forum posts" ON forum_posts
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_visibility ON forum_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_is_pinned ON forum_posts(is_pinned) WHERE is_pinned = true;

SELECT 'Forum posts table structure updated successfully!' as status;