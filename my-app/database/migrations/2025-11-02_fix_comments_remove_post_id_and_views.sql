-- Safe fixes for forum_comments schema and helpers
-- 1) Ensure user_id column exists and has FK to auth.users (for PostgREST embedding via user_id(*))
ALTER TABLE public.forum_comments
  ADD COLUMN IF NOT EXISTS user_id UUID;

DO $$
BEGIN
  -- Add/ensure FK -> auth.users(id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'forum_comments'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.constraint_name = 'forum_comments_user_id_fkey'
  ) THEN
    ALTER TABLE public.forum_comments
      ADD CONSTRAINT forum_comments_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE;
  END IF;
END$$;

-- 2) Helpful indexes (guarded)
CREATE INDEX IF NOT EXISTS idx_forum_comments_user_id ON public.forum_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_forum_post_id ON public.forum_comments(forum_post_id);

-- 3) Recreate helper VIEW without referencing legacy post_id
DROP VIEW IF EXISTS public.forum_comments_with_profiles CASCADE;
CREATE VIEW public.forum_comments_with_profiles AS
SELECT 
  fc.id,
  fc.content,
  fc.created_at,
  fc.updated_at,
  fc.user_id,
  fc.parent_comment_id,
  fc.forum_post_id,
  p.username,
  p.avatar_url,
  p.full_name
FROM public.forum_comments fc
LEFT JOIN public.profiles p ON p.id = fc.user_id;

GRANT SELECT ON public.forum_comments_with_profiles TO authenticated, anon;

-- 4) Recreate RPC using only forum_post_id
DROP FUNCTION IF EXISTS public.get_post_comments(UUID);
CREATE FUNCTION public.get_post_comments(post_id_param UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_id UUID,
  parent_comment_id UUID,
  forum_post_id UUID,
  username TEXT,
  avatar_url TEXT,
  full_name TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public AS $$
  SELECT 
    fc.id,
    fc.content,
    fc.created_at,
    fc.updated_at,
    fc.user_id,
    fc.parent_comment_id,
    fc.forum_post_id,
    p.username,
    p.avatar_url,
    p.full_name
  FROM public.forum_comments fc
  LEFT JOIN public.profiles p ON p.id = fc.user_id
  WHERE fc.forum_post_id = post_id_param
  ORDER BY fc.created_at ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_post_comments(UUID) TO authenticated, anon;

-- 5) RLS sanity: allow public read unless you intend otherwise
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  -- Drop conflicting policies if any
  EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.forum_comments';
  -- Create permissive read policy
  EXECUTE 'CREATE POLICY "Enable read access for all users" ON public.forum_comments FOR SELECT USING (true)';
END$$;
