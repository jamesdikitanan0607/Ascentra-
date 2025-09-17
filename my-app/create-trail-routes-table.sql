-- Create trail_routes table
CREATE TABLE IF NOT EXISTS trail_routes (
    route_id SERIAL PRIMARY KEY,
    hiking_spot_id INTEGER NOT NULL REFERENCES hiking_spots(hiking_spot_id) ON DELETE CASCADE,
    route_name VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('Easy', 'Moderate', 'Hard', 'Advanced')),
    start_coordinates POINT NOT NULL,
    distance_km DECIMAL(5,2) NOT NULL,
    elevation_gain_m INTEGER NOT NULL,
    estimated_duration_hr DECIMAL(4,2) NOT NULL,
    highlights TEXT NOT NULL,
    geojson_path JSONB NOT NULL, -- Store GeoJSON LineString coordinates
    route_color VARCHAR(7) DEFAULT '#FF0000', -- Hex color for map display
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on hiking_spot_id for efficient joins
CREATE INDEX IF NOT EXISTS idx_trail_routes_hiking_spot_id ON trail_routes (hiking_spot_id);

-- Create index on difficulty for filtering
CREATE INDEX IF NOT EXISTS idx_trail_routes_difficulty ON trail_routes (difficulty);

-- Create index on start_coordinates for spatial queries
CREATE INDEX IF NOT EXISTS idx_trail_routes_start_coordinates ON trail_routes USING GIST (start_coordinates);

-- Enable Row Level Security
ALTER TABLE trail_routes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all users
CREATE POLICY "Allow read access to trail routes" ON trail_routes
    FOR SELECT USING (true);

-- Create policy to allow authenticated users to insert/update
CREATE POLICY "Allow authenticated users to modify trail routes" ON trail_routes
    FOR ALL USING (auth.role() = 'authenticated');