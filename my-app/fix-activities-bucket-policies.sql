-- Fix storage policies for the 'activities' bucket (your actual bucket)
-- Run this in Supabase SQL Editor

-- 1️⃣ Allow authenticated users to upload to the "activities" bucket
CREATE POLICY "Allow authenticated upload to activities bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'activities');

-- 2️⃣ Allow users to read their own uploaded files
CREATE POLICY "Allow users to read own activities files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'activities' AND auth.uid() = owner);

-- 3️⃣ Allow users to update their own files
CREATE POLICY "Allow users to update own activities files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'activities' AND auth.uid() = owner);

-- 4️⃣ Allow users to delete their own files
CREATE POLICY "Allow users to delete own activities files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'activities' AND auth.uid() = owner);

-- 5️⃣ (OPTIONAL) Allow public read access
/*
CREATE POLICY "Allow public read access to activities"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'activities');
*/

-- Create the activities bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('activities', 'activities', false)
ON CONFLICT (id) DO NOTHING;