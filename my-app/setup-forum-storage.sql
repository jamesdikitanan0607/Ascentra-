-- Create storage buckets for forum functionality
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('forum-images', 'forum-images', true),
  ('forum-attachments', 'forum-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for forum-images bucket
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access forum-images') THEN
        CREATE POLICY "Public Access forum-images" ON storage.objects FOR SELECT USING (bucket_id = 'forum-images');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload forum-images') THEN
        CREATE POLICY "Authenticated users can upload forum-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'forum-images' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can update own forum-images') THEN
        CREATE POLICY "Users can update own forum-images" ON storage.objects FOR UPDATE USING (bucket_id = 'forum-images' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete own forum-images') THEN
        CREATE POLICY "Users can delete own forum-images" ON storage.objects FOR DELETE USING (bucket_id = 'forum-images' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;

-- Set up storage policies for forum-attachments bucket
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated Access forum-attachments') THEN
        CREATE POLICY "Authenticated Access forum-attachments" ON storage.objects FOR SELECT USING (bucket_id = 'forum-attachments' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload forum-attachments') THEN
        CREATE POLICY "Authenticated users can upload forum-attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'forum-attachments' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can update own forum-attachments') THEN
        CREATE POLICY "Users can update own forum-attachments" ON storage.objects FOR UPDATE USING (bucket_id = 'forum-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete own forum-attachments') THEN
        CREATE POLICY "Users can delete own forum-attachments" ON storage.objects FOR DELETE USING (bucket_id = 'forum-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;