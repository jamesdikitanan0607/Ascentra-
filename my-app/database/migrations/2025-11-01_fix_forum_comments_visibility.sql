-- Enable RLS on forum_comments if not already enabled
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$
BEGIN
  -- Drop select policies
  DROP POLICY IF EXISTS "Enable read access for all users" ON public.forum_comments;
  DROP POLICY IF EXISTS "Enable read access to all users" ON public.forum_comments;
  
  -- Drop insert policies
  DROP POLICY IF EXISTS "Users can insert their own comments" ON public.forum_comments;
  
  -- Drop update policies
  DROP POLICY IF EXISTS "Users can update their own comments" ON public.forum_comments;
  
  -- Drop delete policies
  DROP POLICY IF EXISTS "Users can delete their own comments" ON public.forum_comments;
  DROP POLICY IF EXISTS "Admins can delete any comment" ON public.forum_comments;
END
$$;

-- Create select policy to allow all users to read all comments
CREATE POLICY "Enable read access for all users"
ON public.forum_comments
FOR SELECT
TO authenticated, anon
USING (true);

-- Create insert policy to allow authenticated users to create comments
CREATE POLICY "Users can insert their own comments"
ON public.forum_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create update policy to allow users to update their own comments
CREATE POLICY "Users can update their own comments"
ON public.forum_comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create delete policy to allow users to delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.forum_comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow admins to perform any action
CREATE POLICY "Admins can perform any action on comments"
ON public.forum_comments
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Create a view that includes user profiles for easier querying
CREATE OR REPLACE VIEW public.forum_comments_with_profiles AS
SELECT 
  fc.*,
  p.username,
  p.avatar_url,
  p.full_name
FROM 
  public.forum_comments fc
  LEFT JOIN public.profiles p ON fc.user_id = p.id;

-- Grant permissions on the view
GRANT SELECT ON public.forum_comments_with_profiles TO authenticated, anon;

-- Create a function to get all comments for a post with user info
CREATE OR REPLACE FUNCTION public.get_post_comments(post_id_param UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  full_name TEXT,
  parent_comment_id UUID,
  forum_post_id UUID,
  post_id UUID
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
    p.avatar_url,
    p.full_name,
    c.parent_comment_id,
    c.forum_post_id,
    c.post_id
  FROM 
    public.forum_comments c
    LEFT JOIN public.profiles p ON c.user_id = p.id
  WHERE 
    (c.forum_post_id = post_id_param OR c.post_id = post_id_param)
  ORDER BY 
    c.created_at ASC;
$$;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION public.get_post_comments(UUID) TO authenticated, anon;
