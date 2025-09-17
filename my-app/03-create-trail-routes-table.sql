-- =====================================================
-- STEP 3: CREATE TRAIL_ROUTES TABLE
-- =====================================================
-- Run this in your Supabase SQL Editor

-- Create trail_routes table
CREATE TABLE IF NOT EXISTS public.trail_routes (
  id SERIAL PRIMARY KEY,
  route_id INTEGER UNIQUE NOT NULL DEFAULT nextval('trail_routes_id_seq'),
  hiking_spot_id INTEGER NOT NULL REFERENCES public.hiking_spots(hiking_spot_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy','Moderate','Hard','Advanced')),
  length DECIMAL(5,2), -- in kilometers
  elevation_gain INTEGER, -- in meters
  estimated_time INTEGER, -- in minutes
  trail_type TEXT CHECK (trail_type IN ('Loop', 'Out and Back', 'Point to Point')),
  waypoints JSONB DEFAULT '[]'::jsonb,
  gpx_data TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trail_routes_hiking_spot ON public.trail_routes(hiking_spot_id);
CREATE INDEX IF NOT EXISTS idx_trail_routes_difficulty ON public.trail_routes(difficulty);
CREATE INDEX IF NOT EXISTS idx_trail_routes_active ON public.trail_routes(is_active);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_trail_routes_updated_at ON public.trail_routes;
CREATE TRIGGER trigger_update_trail_routes_updated_at
  BEFORE UPDATE ON public.trail_routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.trail_routes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Trail routes are viewable by everyone" ON public.trail_routes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert trail routes" ON public.trail_routes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON public.trail_routes TO anon;
GRANT ALL ON public.trail_routes TO authenticated;
GRANT USAGE ON SEQUENCE trail_routes_id_seq TO authenticated;