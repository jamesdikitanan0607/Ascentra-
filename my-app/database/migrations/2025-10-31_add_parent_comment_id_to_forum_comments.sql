-- Add parent_comment_id to forum_comments for threaded replies
ALTER TABLE public.forum_comments
  ADD COLUMN IF NOT EXISTS parent_comment_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_name = 'forum_comments_parent_comment_id_fkey'
      AND tc.table_name = 'forum_comments'
      AND tc.table_schema = 'public'
  ) THEN
    ALTER TABLE public.forum_comments
      ADD CONSTRAINT forum_comments_parent_comment_id_fkey
      FOREIGN KEY (parent_comment_id)
      REFERENCES public.forum_comments(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Index to speed up fetching replies
CREATE INDEX IF NOT EXISTS idx_forum_comments_parent_comment_id
  ON public.forum_comments(parent_comment_id);
