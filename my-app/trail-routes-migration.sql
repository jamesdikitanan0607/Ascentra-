
-- Fix trail_routes table schema
-- Run this SQL in Supabase SQL Editor

-- First, backup existing data if any
CREATE TABLE IF NOT EXISTS trail_routes_backup AS SELECT * FROM trail_routes;

-- Drop the existing table
DROP TABLE IF EXISTS trail_routes CASCADE;

-- Create the corrected trail_routes table with all required columns
CREATE TABLE trail_routes (
    id BIGSERIAL PRIMARY KEY,
    route_id INTEGER UNIQUE,
    hiking_spot_id INTEGER NOT NULL,
    route_name VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('Easy', 'Moderate', 'Hard', 'Advanced')),
    start_coordinates POINT NOT NULL,
    end_coordinates POINT,
    route_coordinates JSONB,
    distance_km DECIMAL(5,2) NOT NULL,
    elevation_gain_m INTEGER NOT NULL,
    estimated_duration_hr DECIMAL(4,2) NOT NULL,
    highlights TEXT NOT NULL,
    geojson_path JSONB NOT NULL,
    route_color VARCHAR(7) DEFAULT '#FF0000',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_trail_routes_hiking_spot_id ON trail_routes (hiking_spot_id);
CREATE INDEX idx_trail_routes_route_id ON trail_routes (route_id);
CREATE INDEX idx_trail_routes_difficulty ON trail_routes (difficulty);

-- Enable Row Level Security
ALTER TABLE trail_routes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON trail_routes FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON trail_routes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON trail_routes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON trail_routes FOR DELETE USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trail_routes_updated_at BEFORE UPDATE ON trail_routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
