# Forum Media RLS Policy Migration Guide

## Issue
You're getting this error when running the migration:
```
ERROR: 42710: policy "Users can insert media for own posts" for table "forum_post_media" already exists
```

This happens because policies with the same name already exist in your database.

## Step-by-Step Fix

### Step 1: Diagnose Current Structure
First, run the diagnostic script to understand your current table structure:

```sql
-- Run this in your Supabase SQL editor
\i my-app/diagnose-forum-table-structure.sql
```

This will show you:
- Current table structure
- Existing RLS policies
- Column names (post_id vs forum_post_id)
- Foreign key constraints

### Step 2: Apply Safe Migration
Run the safe migration script that handles existing policies:

```sql
-- Run this in your Supabase SQL editor
\i my-app/fix-forum-media-rls-policies-safe.sql
```

This script:
- ✅ Safely drops existing policies without errors
- ✅ Detects whether you use `post_id` or `forum_post_id`
- ✅ Creates new policies with correct column references
- ✅ Provides verification output

### Step 3: Verify the Fix
After running the migration, you should see output like:
```
NOTICE: Using column: post_id (or forum_post_id)
NOTICE: Successfully created RLS policies for forum_post_media using column: post_id
NOTICE: Successfully created RLS policies for forum_posts
```

### Step 4: Test Media Upload
Try uploading media to a forum post in your app to verify the fix works.

## Alternative: Manual Policy Cleanup

If you prefer to clean up manually first:

```sql
-- Drop all existing policies for forum_post_media
DROP POLICY IF EXISTS "Users can view all forum post media" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can insert forum post media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can delete forum post media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Forum post media viewable by all" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can add media to their posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can insert media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can update media for own posts" ON public.forum_post_media;
DROP POLICY IF EXISTS "Users can delete media for own posts" ON public.forum_post_media;

-- Then run the safe migration
\i my-app/fix-forum-media-rls-policies-safe.sql
```

## What the Fix Does

### RLS Policies Created:
1. **"Forum post media viewable by all"** - Allows anyone to view media
2. **"Users can insert media for own posts"** - Allows users to add media only to their own posts
3. **"Users can update media for own posts"** - Allows users to update their own media
4. **"Users can delete media for own posts"** - Allows users to delete their own media

### Key Features:
- **Dynamic column detection**: Works with both `post_id` and `forum_post_id` column names
- **Proper ownership checks**: Ensures users can only manage media for posts they own
- **Safe execution**: Won't fail if policies already exist

## Troubleshooting

### If you still get errors:
1. Check that you have the necessary permissions in Supabase
2. Make sure you're running the script as a database admin
3. Verify the table exists: `SELECT * FROM information_schema.tables WHERE table_name = 'forum_post_media';`

### If media upload still fails:
1. Check the browser console for specific error messages
2. Look at the Supabase logs in your dashboard
3. Run the test script: `node my-app/test-forum-media-rls.js`

## Files to Use:
- `diagnose-forum-table-structure.sql` - Check current state
- `fix-forum-media-rls-policies-safe.sql` - Apply the fix
- `test-forum-media-rls.js` - Test the implementation

The safe migration script should resolve the policy conflict error you encountered.