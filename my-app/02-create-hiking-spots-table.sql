-- =====================================================
-- STEP 2: CREATE HIKING_SPOTS TABLE
-- =====================================================
-- Run this in your Supabase SQL Editor

-- Enable PostGIS extension for geographic data
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create hiking_spots table
CREATE TABLE IF NOT EXISTS public.hiking_spots (
  hiking_spot_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  coordinates POINT,
  elevation INTEGER,
  difficulty TEXT CHECK (difficulty IN ('Easy','Moderate','Hard','Advanced')),
  trail_length DECIMAL(5,2),
  estimated_duration INTEGER, -- in minutes
  cover_image_url TEXT,
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  amenities TEXT[],
  best_season TEXT[],
  location_text TEXT,
  average_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5),
  number_of_reviews INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hiking_spots_location ON public.hiking_spots USING GIST(coordinates);
CREATE INDEX IF NOT EXISTS idx_hiking_spots_difficulty ON public.hiking_spots(difficulty);
CREATE INDEX IF NOT EXISTS idx_hiking_spots_rating ON public.hiking_spots(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_hiking_spots_created_at ON public.hiking_spots(created_at);

-- Function to update coordinates from lat/lng
CREATE OR REPLACE FUNCTION update_coordinates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.coordinates = POINT(NEW.longitude, NEW.latitude);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update coordinates
DROP TRIGGER IF EXISTS trigger_update_coordinates ON public.hiking_spots;
CREATE TRIGGER trigger_update_coordinates
  BEFORE INSERT OR UPDATE ON public.hiking_spots
  FOR EACH ROW
  EXECUTE FUNCTION update_coordinates();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_hiking_spots_updated_at ON public.hiking_spots;
CREATE TRIGGER trigger_update_hiking_spots_updated_at
  BEFORE UPDATE ON public.hiking_spots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.hiking_spots ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Hiking spots are viewable by everyone" ON public.hiking_spots
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert hiking spots" ON public.hiking_spots
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own hiking spots" ON public.hiking_spots
  FOR UPDATE USING (auth.uid() = created_by);

-- Grant permissions
GRANT SELECT ON public.hiking_spots TO anon;
GRANT ALL ON public.hiking_spots TO authenticated;
GRANT USAGE ON SEQUENCE hiking_spots_hiking_spot_id_seq TO authenticated;