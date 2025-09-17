-- =====================================================
-- STEP 5: CREATE HIKE_RECORDS TABLE
-- =====================================================
-- Run this in your Supabase SQL Editor

-- Create hike_records table
CREATE TABLE IF NOT EXISTS public.hike_records (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hiking_spot_id INTEGER REFERENCES public.hiking_spots(hiking_spot_id) ON DELETE SET NULL,
  trail_route_id INTEGER REFERENCES public.trail_routes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration INTEGER, -- in minutes
  distance DECIMAL(10,2), -- in kilometers
  elevation_gain INTEGER, -- in meters
  max_elevation INTEGER, -- in meters
  average_pace DECIMAL(5,2), -- minutes per kilometer
  calories_burned INTEGER,
  gps_track JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  weather_data JSONB,
  difficulty_experienced TEXT CHECK (difficulty_experienced IN ('Easy','Moderate','Hard','Advanced')),
  notes TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hike_records_user ON public.hike_records(user_id);
CREATE INDEX IF NOT EXISTS idx_hike_records_hiking_spot ON public.hike_records(hiking_spot_id);
CREATE INDEX IF NOT EXISTS idx_hike_records_date ON public.hike_records(start_time DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_hike_records_updated_at ON public.hike_records;
CREATE TRIGGER trigger_update_hike_records_updated_at
  BEFORE UPDATE ON public.hike_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.hike_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public hike records are viewable by everyone" ON public.hike_records
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own hike records" ON public.hike_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hike records" ON public.hike_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hike records" ON public.hike_records
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON public.hike_records TO anon;
GRANT ALL ON public.hike_records TO authenticated;
GRANT USAGE ON SEQUENCE hike_records_id_seq TO authenticated;