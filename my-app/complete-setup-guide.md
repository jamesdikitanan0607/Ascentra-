# Complete Supabase Setup Guide

This guide provides all the necessary steps to fix schema issues and insert required data into your Supabase database.

## 🔧 Schema Fixes Required

### 1. Fix trail_routes Table Schema

**Issue**: The `trail_routes` table references `hiking_spots(hiking_spot_id)` as INTEGER, but the actual `hiking_spots` table uses UUID for the `id` column.

**Solution**: Run the following SQL in Supabase SQL Editor:

```sql
-- Drop existing trail_routes table
DROP TABLE IF EXISTS trail_routes CASCADE;

-- Create corrected trail_routes table
CREATE TABLE trail_routes (
    route_id SERIAL PRIMARY KEY,
    hiking_spot_id UUID NOT NULL REFERENCES hiking_spots(id) ON DELETE CASCADE,
    route_name VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('Easy', 'Moderate', 'Hard', 'Advanced')),
    start_coordinates TEXT NOT NULL,
    distance_km DECIMAL(5,2) NOT NULL,
    elevation_gain_m INTEGER NOT NULL,
    estimated_duration_hr DECIMAL(4,2) NOT NULL,
    highlights TEXT NOT NULL,
    geojson_path JSONB,
    route_color VARCHAR(7) DEFAULT '#FF0000',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_trail_routes_hiking_spot_id ON trail_routes (hiking_spot_id);

-- Enable RLS
ALTER TABLE trail_routes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON trail_routes FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON trail_routes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON trail_routes FOR UPDATE USING (auth.role() = 'authenticated');
```

### 2. Set Up Forum Storage Buckets

Run the following SQL in Supabase SQL Editor:

```sql
-- Create storage buckets for forum functionality
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('forum-images', 'forum-images', true),
  ('forum-attachments', 'forum-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for forum-images bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'forum-images');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'forum-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE USING (bucket_id = 'forum-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (bucket_id = 'forum-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Set up storage policies for forum-attachments bucket
CREATE POLICY "Authenticated Access" ON storage.objects FOR SELECT USING (bucket_id = 'forum-attachments' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'forum-attachments' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own attachments" ON storage.objects FOR UPDATE USING (bucket_id = 'forum-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own attachments" ON storage.objects FOR DELETE USING (bucket_id = 'forum-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 📊 Data Insertion

### Current Status
- ✅ **Hiking Spots**: 10 hiking spots already inserted
- ❌ **Trail Routes**: Pending schema fix
- ❌ **Forum Storage**: Needs manual setup

### After Schema Fix

Once you've run the schema fixes above, execute:

```bash
node insert-corrected-data.cjs
```

This will:
- Insert trail routes for all existing hiking spots
- Create proper relationships between hiking spots and routes
- Set up route colors and GeoJSON data

## 🗂️ Files Created

- `fix-trail-routes-corrected.sql` - Schema fix for trail_routes table
- `insert-corrected-data.cjs` - Data insertion script with corrected schema
- `check-trail-routes.cjs` - Schema verification script
- `complete-setup-guide.md` - This comprehensive guide

## 🔍 Verification

After completing all steps, verify the setup:

```bash
node check-trail-routes.cjs
```

Expected output:
- ✅ trail_routes table exists
- ✅ Current records: [number] (should be > 0)
- No schema mismatch errors

## 📝 Next Steps

1. **Immediate**: Run the SQL fixes in Supabase SQL Editor
2. **Then**: Execute `node insert-corrected-data.cjs`
3. **Verify**: Run `node check-trail-routes.cjs`
4. **Test**: Open the app preview to ensure everything works

## 🚨 Important Notes

- The schema mismatch prevents trail routes from being inserted
- Manual SQL execution is required because RPC functions are not available
- All hiking spots data is already properly inserted
- Forum storage buckets need to be created for full functionality