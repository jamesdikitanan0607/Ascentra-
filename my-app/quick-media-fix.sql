-- Quick fix for MediaViewerScreen showing no media
-- This addresses the most common RLS policy issues

-- Enable RLS on both tables
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_media ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Forum posts viewable by all" ON public.forum_posts;
DROP POLICY IF EXISTS "Forum post media viewable by all" ON public.forum_post_media;

-- Create simple, permissive policies for reading
CREATE POLICY "Forum posts viewable by all" 
ON public.forum_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Forum post media viewable by all" 
ON public.forum_post_media 
FOR SELECT 
USING (true);

-- Test query to verify the fix works
-- This should return media for the specific post if it exists
SELECT 
    fp.id as post_id,
    fp.title,
    fpm.id as media_id,
    fpm.file_path,
    fpm.file_type
FROM public.forum_posts fp
LEFT JOIN public.forum_post_media fpm ON fp.id = fpm.post_id
WHERE fp.id = 'f2a2d864-62b3-46f0-bdc4-b8cdd1c144dd';

-- Check what columns actually exist in forum_post_media
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forum_post_media' 
AND table_schema = 'public';