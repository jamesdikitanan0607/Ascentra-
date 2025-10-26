-- Run this in your Supabase Dashboard SQL Editor
-- These policies will fix the "new row violates row-level security policy" error

-- 1️⃣ Allow authenticated users to INSERT (upload) to the "media" bucket
CREATE POLICY "Allow authenticated upload to media bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- 2️⃣ Allow users to SELECT (read) their own uploaded files
CREATE POLICY "Allow users to read own media files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'media' AND auth.uid() = owner);

-- 3️⃣ Allow users to UPDATE their own media files
CREATE POLICY "Allow users to update own media files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND auth.uid() = owner);

-- 4️⃣ Allow users to DELETE their own media files
CREATE POLICY "Allow users to delete own media files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND auth.uid() = owner);

-- 5️⃣ (OPTIONAL) Uncomment for public read access
/*
CREATE POLICY "Allow public read access to media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');
*/