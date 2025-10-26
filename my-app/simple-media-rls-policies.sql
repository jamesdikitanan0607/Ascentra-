-- Simple Media Storage RLS Policies
-- Core policies to fix "new row violates row-level security policy" error

-- NOTE: RLS is already enabled on storage.objects in Supabase by default
-- You don't need to enable it manually

-- 1️⃣ Allow authenticated users to upload to the "media" bucket
CREATE POLICY "Allow authenticated users to upload media" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'media'
);

-- 2️⃣ Allow users to read their own uploaded files
CREATE POLICY "Allow users to read their own media" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'media'
  AND auth.uid() = owner
);

-- 3️⃣ Allow users to update their own media files
CREATE POLICY "Allow users to update their own media" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'media'
  AND auth.uid() = owner
);

-- 4️⃣ Allow users to delete their own media files
CREATE POLICY "Allow users to delete their own media" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'media'
  AND auth.uid() = owner
);

-- 5️⃣ (OPTIONAL) Allow public read access to all media files
-- Uncomment this if you want public read access later
/*
CREATE POLICY "Allow public read access to media" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'media');
*/

-- 4️⃣ Policy for post_media table (if it exists)
-- This allows users to link media to posts they own
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'post_media') THEN
    ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Allow post owner to attach media" 
    ON public.post_media 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM posts 
        WHERE posts.id = post_media.post_id 
        AND posts.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Create the media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', false)
ON CONFLICT (id) DO NOTHING;