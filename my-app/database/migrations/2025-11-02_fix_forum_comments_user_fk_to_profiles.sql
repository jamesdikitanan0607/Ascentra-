-- Ensure forum_comments.user_id exists and references public.profiles(id) for PostgREST embedding
ALTER TABLE public.forum_comments
  ADD COLUMN IF NOT EXISTS user_id UUID;

DO $$
DECLARE
  ref_table text;
BEGIN
  -- Detect current referenced table for forum_comments_user_id_fkey (if present)
  SELECT c.confrelid::regclass::text INTO ref_table
  FROM pg_constraint c
  WHERE c.conname = 'forum_comments_user_id_fkey'
    AND c.conrelid = 'public.forum_comments'::regclass
    AND c.contype = 'f';

  -- If it exists and doesn't point to public.profiles, drop it
  IF ref_table IS NOT NULL AND ref_table <> 'public.profiles' THEN
    EXECUTE 'ALTER TABLE public.forum_comments DROP CONSTRAINT forum_comments_user_id_fkey';
  END IF;

  -- If no FK to profiles exists, create it
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    WHERE c.conrelid = 'public.forum_comments'::regclass
      AND c.contype = 'f'
      AND c.confrelid = 'public.profiles'::regclass
  ) THEN
    EXECUTE 'ALTER TABLE public.forum_comments
      ADD CONSTRAINT forum_comments_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE';
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_forum_comments_user_id ON public.forum_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_forum_post_id ON public.forum_comments(forum_post_id);

-- Basic read policy to allow clients to fetch comments
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.forum_comments';
  EXECUTE 'CREATE POLICY "Enable read access for all users" ON public.forum_comments FOR SELECT USING (true)';
END $$;
