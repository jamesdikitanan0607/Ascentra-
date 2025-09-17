-- =====================================================
-- CREATE UPDATED TRAIL_ROUTES TABLE
-- =====================================================
-- This script creates the trail_routes table with the exact schema
-- required by the user specifications

-- Drop existing table if it exists
DROP TABLE IF EXISTS trail_routes CASCADE;

-- Create trail_routes table with user-specified schema
CREATE TABLE IF NOT EXISTS trail_routes (
  route_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spot_id UUID REFERENCES hiking_spots(spot_id) ON DELETE CASCADE,
  route_name TEXT NOT NULL,
  start_point JSONB NOT NULL, -- {lat, lng}
  end_point JSONB NOT NULL,   -- {lat, lng}
  waypoints JSONB[],          -- Array of {lat, lng} objects
  distance_km FLOAT,
  elevation_gain_m INT,
  duration_hours FLOAT,
  difficulty TEXT CHECK (difficulty IN ('Easy','Moderate','Hard')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trail_routes_spot_id ON trail_routes (spot_id);
CREATE INDEX IF NOT EXISTS idx_trail_routes_difficulty ON trail_routes (difficulty);

-- Enable Row Level Security
ALTER TABLE trail_routes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all users
CREATE POLICY "Allow read access to trail routes" ON trail_routes
    FOR SELECT USING (true);

-- Create policy to allow authenticated users to insert/update
CREATE POLICY "Allow authenticated users to modify trail routes" ON trail_routes
    FOR ALL USING (auth.role() = 'authenticated');

SELECT 'Updated trail_routes table created successfully!' as status;