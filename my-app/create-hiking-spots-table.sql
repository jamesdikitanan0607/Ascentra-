-- Create hiking_spots table
CREATE TABLE IF NOT EXISTS hiking_spots (
    hiking_spot_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    coordinates POINT NOT NULL,
    description TEXT,
    cover_image_url VARCHAR(500),
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    number_of_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on coordinates for spatial queries
CREATE INDEX IF NOT EXISTS idx_hiking_spots_coordinates ON hiking_spots USING GIST (coordinates);

-- Create index on average_rating for top rated queries
CREATE INDEX IF NOT EXISTS idx_hiking_spots_rating ON hiking_spots (average_rating DESC);

-- Enable Row Level Security
ALTER TABLE hiking_spots ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all users
CREATE POLICY "Allow read access to hiking spots" ON hiking_spots
    FOR SELECT USING (true);

-- Create policy to allow authenticated users to insert/update
CREATE POLICY "Allow authenticated users to modify hiking spots" ON hiking_spots
    FOR ALL USING (auth.role() = 'authenticated');