-- =====================================================
-- CREATE UPDATED HIKING_SPOTS TABLE
-- =====================================================
-- This script creates the hiking_spots table with UUID primary keys
-- and proper schema for the 15 hiking spots

-- Drop existing table if it exists
DROP TABLE IF EXISTS hiking_spots CASCADE;

-- Create hiking_spots table with UUID primary key
CREATE TABLE IF NOT EXISTS hiking_spots (
  spot_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  location_text TEXT,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy','Moderate','Hard')),
  elevation_m INT,
  trail_length_km FLOAT,
  estimated_duration_min INT,
  image_url TEXT,
  rating FLOAT DEFAULT 0,
  review_count INT DEFAULT 0,
  amenities TEXT[],
  best_season TEXT[],
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hiking_spots_name ON hiking_spots (name);
CREATE INDEX IF NOT EXISTS idx_hiking_spots_difficulty ON hiking_spots (difficulty);
CREATE INDEX IF NOT EXISTS idx_hiking_spots_rating ON hiking_spots (rating);
CREATE INDEX IF NOT EXISTS idx_hiking_spots_location ON hiking_spots (latitude, longitude);

-- Enable Row Level Security
ALTER TABLE hiking_spots ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all users
CREATE POLICY "Allow read access to hiking spots" ON hiking_spots
    FOR SELECT USING (true);

-- Create policy to allow authenticated users to insert/update
CREATE POLICY "Allow authenticated users to modify hiking spots" ON hiking_spots
    FOR ALL USING (auth.role() = 'authenticated');

SELECT 'Updated hiking_spots table created successfully!' as status;