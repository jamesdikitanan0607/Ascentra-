-- =====================================================
-- CREATE HIKING SPOT ROUTES TABLE
-- =====================================================
-- This script creates the hiking_spot_routes table to store
-- trail routes for each hiking spot

CREATE TABLE IF NOT EXISTS public.hiking_spot_routes (
  id SERIAL PRIMARY KEY,
  hiking_spot_id INT NOT NULL REFERENCES public.hiking_spots(id) ON DELETE CASCADE,
  route_name TEXT NOT NULL,
  start_point geography(POINT, 4326) NOT NULL,
  end_point geography(POINT, 4326) NOT NULL,
  coordinates geography(LINESTRING, 4326) NOT NULL,
  difficulty TEXT,
  distance DECIMAL(10,2),
  elevation_gain INT,
  estimated_duration INT,
  route_features TEXT,
  route_description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_hiking_spot_routes_updated_at ON public.hiking_spot_routes;
CREATE TRIGGER update_hiking_spot_routes_updated_at
BEFORE UPDATE ON public.hiking_spot_routes
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

SELECT 'Hiking spot routes table created successfully!' as status;
