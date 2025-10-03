-- =====================================================
-- FIX TRAIL_ROUTES TABLE SCHEMA TO MATCH SERVICE EXPECTATIONS
-- =====================================================

-- Drop existing table and recreate with correct schema
DROP TABLE IF EXISTS public.trail_routes CASCADE;

-- Create trail_routes table with correct field names
CREATE TABLE IF NOT EXISTS public.trail_routes (
  route_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hiking_spot_id INTEGER NOT NULL REFERENCES public.hiking_spots(hiking_spot_id) ON DELETE CASCADE,
  route_name TEXT NOT NULL,
  route_description TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('Easy','Moderate','Hard','Advanced')),
  difficulty TEXT,
  distance_km DECIMAL(5,2),
  elevation_gain_m INTEGER,
  estimated_duration_hr DECIMAL(3,1),
  estimated_duration TEXT,
  highlights TEXT,
  waypoints JSONB DEFAULT '[]'::jsonb,
  start_coordinates POINT,
  end_coordinates POINT,
  route_coordinates JSONB DEFAULT '[]'::jsonb,
  geojson_path JSONB,
  route_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trail_routes_hiking_spot ON public.trail_routes(hiking_spot_id);
CREATE INDEX IF NOT EXISTS idx_trail_routes_difficulty ON public.trail_routes(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_trail_routes_route_name ON public.trail_routes(route_name);

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

CREATE POLICY "Authenticated users can update trail routes" ON public.trail_routes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete trail routes" ON public.trail_routes
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON public.trail_routes TO anon;
GRANT ALL ON public.trail_routes TO authenticated;

-- Create function to convert POINT to coordinates object
CREATE OR REPLACE FUNCTION point_to_coordinates(p POINT)
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'latitude', ST_Y(p),
    'longitude', ST_X(p)
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to convert coordinates object to POINT
CREATE OR REPLACE FUNCTION coordinates_to_point(coords JSONB)
RETURNS POINT AS $$
BEGIN
  RETURN POINT(coords->>'longitude', coords->>'latitude');
END;
$$ LANGUAGE plpgsql;
