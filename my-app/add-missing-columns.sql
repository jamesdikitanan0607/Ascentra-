-- Add missing columns to hiking_spot_routes table
ALTER TABLE hiking_spot_routes
ADD COLUMN IF NOT EXISTS start_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS start_longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS end_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS end_longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS waypoints JSONB,
ADD COLUMN IF NOT EXISTS route_geom geometry(LineString, 4326);
