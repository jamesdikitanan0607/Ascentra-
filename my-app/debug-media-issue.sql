-- Debug Media Issue for Post: f2a2d864-62b3-46f0-bdc4-b8cdd1c144dd
-- Run this to identify why MediaViewerScreen shows no media

-- 1. Check if the post exists
SELECT 'POST EXISTS CHECK' as check_type, 
       id, title, user_id, created_at
FROM public.forum_posts 
WHERE id = 'f2a2d864-62b3-46f0-bdc4-b8cdd1c144dd';

-- 2. Check if there's any media linked to this post
SELECT 'MEDIA LINK CHECK' as check_type,
       fpm.*, 
       fp.title as post_title
FROM public.forum_post_media fpm
JOIN public.forum_posts fp ON fp.id = fpm.post_id
WHERE fpm.post_id = 'f2a2d864-62b3-46f0-bdc4-b8cdd1c144dd';

-- 3. Check if there are any media records at all
SELECT 'ALL MEDIA FOR THIS POST' as check_type,
       fpm.*, 
       fp.title as post_title
FROM public.forum_post_media fpm
JOIN public.forum_posts fp ON fp.id = fpm.post_id
WHERE fp.id = 'f2a2d864-62b3-46f0-bdc4-b8cdd1c144dd';

-- 4. Check all media for any post (to see if media exists at all)
SELECT 'ALL MEDIA CHECK' as check_type,
       COUNT(*) as total_media_count
FROM public.forum_post_media;

-- 5. Check storage objects for media bucket
SELECT 'STORAGE OBJECTS CHECK' as check_type,
       COUNT(*) as total_files,
       bucket_id
FROM storage.objects 
WHERE bucket_id = 'media'
GROUP BY bucket_id;

-- 6. Check RLS policies on forum_post_media
SELECT 'RLS POLICIES CHECK' as check_type,
       policyname,
       cmd,
       permissive,
       roles
FROM pg_policies 
WHERE tablename = 'forum_post_media';

-- 7. Test if current user can see forum_post_media (run as authenticated user)
SELECT 'USER ACCESS TEST' as check_type,
       'Can see forum_post_media table' as result,
       COUNT(*) as visible_rows
FROM public.forum_post_media;

-- 8. Check table structure to confirm column names
SELECT 'TABLE STRUCTURE' as check_type,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'forum_post_media' 
AND table_schema = 'public'
ORDER BY ordinal_position;