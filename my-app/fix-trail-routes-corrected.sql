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
CREATE POLICY "Enable insert for all users" ON trail_routes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON trail_routes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON trail_routes FOR DELETE USING (auth.role() = 'authenticated');