-- Add parent_comment_id column if it doesn't exist
DO $$
BEGIN
    -- Check if parent_comment_id column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'forum_comments' AND column_name = 'parent_comment_id') THEN
        -- Add the column with self-referential foreign key
        ALTER TABLE forum_comments 
        ADD COLUMN parent_comment_id UUID 
        REFERENCES forum_comments(id) 
        ON DELETE CASCADE;
        
        -- Add index for better query performance
        CREATE INDEX IF NOT EXISTS idx_forum_comments_parent_comment_id 
        ON forum_comments(parent_comment_id);
        
        -- Update RLS policy to allow replying to comments
        DROP POLICY IF EXISTS "Users can reply to comments" ON forum_comments;
        CREATE POLICY "Users can reply to comments" ON forum_comments
            FOR INSERT WITH CHECK (true);
            
        RAISE NOTICE 'Added parent_comment_id column to forum_comments table';
    ELSE
        RAISE NOTICE 'parent_comment_id column already exists in forum_comments table';
    END IF;
END
$$;

-- Update the trigger to handle updated_at for forum_comments
CREATE OR REPLACE TRIGGER trigger_forum_comments_updated_at
    BEFORE UPDATE ON forum_comments
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();
