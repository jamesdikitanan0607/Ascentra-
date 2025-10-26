# Complete Fix Guide: Supabase RLS and MediaViewerScreen Issues

## 🎯 **Problems Fixed**

1. **RLS Policy Violations** - `forum_post_media` inserts failing with error 42501
2. **Null media_type** - Database constraint violations during media upload
3. **MediaViewerScreen Issues** - Infinite loading, "No media found", HTTP 400 errors

---

## 🚀 **Step-by-Step Implementation**

### **Step 1: Fix Database RLS Policies**

Run this SQL script in your Supabase SQL editor:

```sql
-- Run: my-app/fix-complete-rls-policies.sql
```

**What this fixes:**
- ✅ Allows authenticated users to view all media (fixes MediaViewerScreen loading)
- ✅ Allows users to insert media only for their own posts (fixes upload RLS errors)
- ✅ Proper ownership checks using `auth.uid() = (SELECT user_id FROM forum_posts WHERE id = post_id)`

### **Step 2: Update Backend Upload Logic**

Replace your media upload calls in `ForumPost.js`:

```javascript
// OLD (problematic):
await uploadMediaFilesWithTransaction(supabase, mediaFiles, postData.id, user.id);

// NEW (fixed):
await uploadMediaWithFixedTypes(supabase, mediaFiles, postData.id, user.id);
```

**What this fixes:**
- ✅ Guarantees `media_type` is always populated ('image' or 'video')
- ✅ Validates authentication before upload
- ✅ Proper error handling with user-friendly messages

### **Step 3: Replace MediaViewerScreen**

Replace your current `MediaViewerScreen.js` with `OptimizedMediaViewerScreen.js`:

```javascript
// In your navigation/routing:
import OptimizedMediaViewerScreen from './screens/OptimizedMediaViewerScreen';

// Use the same navigation parameters - it's backward compatible
navigation.navigate('MediaViewer', {
  media: mediaArray,
  post: postData,
  initialIndex: 0
});
```

**What this fixes:**
- ✅ Proper authentication checks before database queries
- ✅ Multiple fallback strategies for media loading
- ✅ Retry logic for failed image loads
- ✅ Clear error states instead of infinite loading
- ✅ Pull-to-refresh functionality

---

## 🔧 **Key Changes Explained**

### **RLS Policies (Critical Fix)**

**Before:**
```sql
-- Restrictive policy that blocked viewing
CREATE POLICY "Users can view own media" ON forum_post_media
FOR SELECT USING (auth.uid() = user_id); -- ❌ Wrong: no user_id column
```

**After:**
```sql
-- Allows all authenticated users to view media
CREATE POLICY "Authenticated users can view media" ON forum_post_media
FOR SELECT USING (auth.uid() IS NOT NULL); -- ✅ Correct

-- Proper ownership check for inserts
CREATE POLICY "Users can insert media for own posts" ON forum_post_media
FOR INSERT WITH CHECK (
  auth.uid() = (SELECT user_id FROM forum_posts WHERE id = post_id)
); -- ✅ Correct ownership check
```

### **Media Type Fix (Backend)**

**Before:**
```javascript
// Could result in null media_type
uploadedMedia.push({
  post_id: postId,
  media_url: mediaUrl,
  media_type: media.type, // ❌ Could be undefined
});
```

**After:**
```javascript
// Guaranteed media_type
const mediaType = media.type || determineMediaType(media.uri, media.mimeType);
if (!['image', 'video'].includes(mediaType)) {
  throw new Error(`Invalid media type: ${mediaType}`);
}

uploadedMedia.push({
  post_id: postId,
  media_url: mediaUrl,
  media_type: mediaType, // ✅ Always 'image' or 'video'
});
```

### **MediaViewerScreen Fix (Frontend)**

**Before:**
```javascript
// No authentication check, poor error handling
const { data, error } = await supabase
  .from('forum_post_media')
  .select('*')
  .eq('post_id', post.id);
// ❌ Could fail with RLS error, no retry logic
```

**After:**
```javascript
// Authentication check + proper error handling
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  throw new Error('Authentication required to view media');
}

const { data, error } = await supabase
  .from('forum_post_media')
  .select('id, media_url, media_type, thumbnail_url')
  .eq('post_id', post.id);

if (error?.code === '42501') {
  throw new Error('You do not have permission to view this media');
}
// ✅ Proper auth check, specific error handling
```

---

## 🧪 **Testing the Fix**

### **1. Test Media Upload**
```javascript
// This should now work without RLS errors:
1. Create a forum post
2. Add images/videos
3. Submit post
4. Check that media appears in forum_post_media table
```

### **2. Test MediaViewerScreen**
```javascript
// This should now load instantly:
1. Navigate to a post with media
2. Tap to open MediaViewerScreen
3. Media should load within 2 seconds
4. No "No media found" or infinite loading
```

### **3. Verify Database**
```sql
-- Check that media_type is populated:
SELECT post_id, media_type, media_url 
FROM forum_post_media 
WHERE media_type IS NOT NULL;

-- Should return all records with 'image' or 'video'
```

---

## 📋 **Files Modified/Created**

### **New Files:**
- `fix-complete-rls-policies.sql` - Database migration
- `fixedMediaUploadService.js` - Enhanced upload service
- `OptimizedMediaViewerScreen.js` - Improved media viewer

### **Modified Files:**
- `ForumPost.js` - Updated to use fixed upload service

---

## 🎉 **Expected Results**

After implementing these fixes:

1. **✅ Media uploads succeed** - No more RLS policy violations
2. **✅ media_type always populated** - No more null constraint violations  
3. **✅ MediaViewerScreen loads instantly** - No more infinite loading
4. **✅ Proper error messages** - Clear feedback instead of technical errors
5. **✅ Retry functionality** - Failed images can be retried
6. **✅ Authentication handled** - Proper auth checks throughout

---

## 🚨 **Important Notes**

1. **Run the SQL migration first** - Database policies must be fixed before testing uploads
2. **Test with authenticated users** - All functionality requires user login
3. **Check Supabase logs** - Monitor for any remaining RLS issues
4. **Backward compatible** - New components work with existing navigation

The fix addresses all three core issues: RLS policies, media_type population, and MediaViewerScreen optimization. Your uploaded media should now appear instantly without errors!