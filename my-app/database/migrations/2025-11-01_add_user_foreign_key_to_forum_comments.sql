-- Add foreign key constraint for user_id in forum_comments table
DO $$
BEGIN
  -- Check if the foreign key constraint already exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE 
      tc.constraint_name = 'forum_comments_user_id_fkey' AND 
      tc.table_name = 'forum_comments' AND
      tc.table_schema = 'public'
  ) THEN
    -- Add the foreign key constraint
    ALTER TABLE public.forum_comments
      ADD CONSTRAINT forum_comments_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE;
      
    RAISE NOTICE 'Added foreign key constraint forum_comments_user_id_fkey to forum_comments table';
  ELSE
    RAISE NOTICE 'Foreign key constraint forum_comments_user_id_fkey already exists on forum_comments table';
  END IF;
  
  -- Add index on user_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE 
      indexname = 'idx_forum_comments_user_id' AND
      tablename = 'forum_comments' AND
      schemaname = 'public'
  ) THEN
    CREATE INDEX idx_forum_comments_user_id ON public.forum_comments(user_id);
    RAISE NOTICE 'Added index on user_id column in forum_comments table';
  ELSE
    RAISE NOTICE 'Index on user_id column already exists in forum_comments table';
  END IF;
END $$;
