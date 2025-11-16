-- 1. Add user_id column if it doesn't exist
DO $$
BEGIN
  -- Add user_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'forum_comments' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.forum_comments 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added user_id column to forum_comments table';
  END IF;
  
  -- Create an index on user_id for better performance
  CREATE INDEX IF NOT EXISTS idx_forum_comments_user_id 
  ON public.forum_comments(user_id);
  
  -- Create an index on forum_post_id for better query performance
  CREATE INDEX IF NOT EXISTS idx_forum_comments_forum_post_id 
  ON public.forum_comments(forum_post_id);
  
  -- Enable RLS if not already enabled
  ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
  
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Enable read access for all users" ON public.forum_comments;
  DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.forum_comments;
  DROP POLICY IF EXISTS "Enable update for comment owners" ON public.forum_comments;
  DROP POLICY IF EXISTS "Enable delete for comment owners" ON public.forum_comments;
  DROP POLICY IF EXISTS "Enable all for admins" ON public.forum_comments;
  
  -- Create RLS policies
  -- Allow anyone to read comments
  CREATE POLICY "Enable read access for all users"
  ON public.forum_comments
  FOR SELECT
  USING (true);
  
  -- Allow authenticated users to insert their own comments
  CREATE POLICY "Enable insert for authenticated users"
  ON public.forum_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
  
  -- Allow users to update their own comments
  CREATE POLICY "Enable update for comment owners"
  ON public.forum_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
  
  -- Allow users to delete their own comments
  CREATE POLICY "Enable delete for comment owners"
  ON public.forum_comments
  FOR DELETE
  USING (auth.uid() = user_id);
  
  -- Allow admins to do anything
  CREATE POLICY "Enable all for admins"
  ON public.forum_comments
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));
  
  RAISE NOTICE 'Created necessary indexes and RLS policies for forum_comments';
  
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Error setting up forum_comments schema: %', SQLERRM;
END;
$$;

-- 2. Create a view that joins comments with user profiles
CREATE OR REPLACE VIEW public.comments_with_profiles AS
SELECT 
  c.*,
  p.username,
  p.full_name,
  p.avatar_url,
  p.role
FROM 
  public.forum_comments c
  LEFT JOIN public.profiles p ON c.user_id = p.id;

-- 3. Create a function to get comments with user data
CREATE OR REPLACE FUNCTION public.get_comments_for_post(post_id_param UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT,
  parent_comment_id UUID,
  forum_post_id UUID
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id,
    c.content,
    c.created_at,
    c.updated_at,
    c.user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.role,
    c.parent_comment_id,
    c.forum_post_id
  FROM 
    public.forum_comments c
    LEFT JOIN public.profiles p ON c.user_id = p.id
  WHERE 
    c.forum_post_id = post_id_param
  ORDER BY 
    c.created_at ASC;
$$;

-- Grant necessary permissions
GRANT SELECT ON public.comments_with_profiles TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_comments_for_post(UUID) TO authenticated, anon;
