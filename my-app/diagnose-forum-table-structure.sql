-- Diagnostic script to check current forum_post_media table structure
-- Run this first to understand your current setup before applying fixes

-- Check if tables exist
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name IN ('forum_posts', 'forum_post_media')
AND table_schema = 'public'
ORDER BY table_name;

-- Check forum_post_media table structure
SELECT 
    'forum_post_media' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'forum_post_media' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check forum_posts table structure
SELECT 
    'forum_posts' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'forum_posts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check current RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    CASE 
        WHEN length(qual) > 100 THEN left(qual, 100) || '...'
        ELSE qual 
    END as condition_summary
FROM pg_policies 
WHERE tablename IN ('forum_posts', 'forum_post_media')
ORDER BY tablename, policyname;

-- Check foreign key constraints
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('forum_post_media')
    AND tc.table_schema = 'public';

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('forum_posts', 'forum_post_media')
AND schemaname = 'public';

-- Sample data check (if any exists)
SELECT 'forum_posts' as table_name, count(*) as row_count FROM public.forum_posts
UNION ALL
SELECT 'forum_post_media' as table_name, count(*) as row_count FROM public.forum_post_media;