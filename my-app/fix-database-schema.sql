-- =====================================================
-- COMPREHENSIVE DATABASE SCHEMA FIX
-- =====================================================
-- This script fixes all database issues:
-- 1. Standardizes column names (hiking_spot_id)
-- 2. Uses INTEGER for primary keys (not UUID)
-- 3. Fixes foreign key relationships
-- 4. Creates proper reviews table

-- =====================================================
-- 1. DROP EXISTING TABLES (CASCADE to handle dependencies)
-- =====================================================
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS trail_routes CASCADE;
DROP TABLE IF EXISTS hiking_spots CASCADE;

-- =====================================================
-- 2. CREATE HIKING_SPOTS TABLE (INTEGER PRIMARY KEY)
-- =====================================================
CREATE TABLE hiking_spots (
  hiking_spot_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  coordinates POINT,
  description TEXT,
  cover_image_url TEXT,
  average_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5),
  number_of_reviews INTEGER DEFAULT 0,
  difficulty TEXT CHECK (difficulty IN ('Easy','Moderate','Hard','Advanced')),
  elevation INTEGER,
  trail_length DECIMAL(5,2),
  estimated_duration INTEGER,
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  amenities TEXT[],
  best_season TEXT[],
  created_by UUID REFERENCES auth.users(id),
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  location_text TEXT,
  elevation_m INTEGER,
  trail_length_km DECIMAL(5,2),
  estimated_duration_min INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_hiking_spots_name ON hiking_spots (name);
CREATE INDEX idx_hiking_spots_difficulty ON hiking_spots (difficulty);
CREATE INDEX idx_hiking_spots_rating ON hiking_spots (average_rating DESC);
CREATE INDEX idx_hiking_spots_location ON hiking_spots (latitude, longitude);

-- =====================================================
-- 3. CREATE TRAIL_ROUTES TABLE (INTEGER FOREIGN KEY)
-- =====================================================
CREATE TABLE trail_routes (
  route_id SERIAL PRIMARY KEY,
  hiking_spot_id INTEGER NOT NULL REFERENCES hiking_spots(hiking_spot_id) ON DELETE CASCADE,
  route_name TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Moderate', 'Hard', 'Advanced')),
  start_coordinates POINT NOT NULL,
  end_coordinates POINT,
  route_coordinates JSONB,
  distance_km DECIMAL(5,2) NOT NULL,
  elevation_gain_m INTEGER NOT NULL,
  estimated_duration_hr DECIMAL(4,2) NOT NULL,
  highlights TEXT NOT NULL,
  geojson_path JSONB NOT NULL,
  route_color TEXT DEFAULT '#FF0000',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_trail_routes_hiking_spot_id ON trail_routes (hiking_spot_id);
CREATE INDEX idx_trail_routes_difficulty ON trail_routes (difficulty);
CREATE INDEX idx_trail_routes_start_coordinates ON trail_routes USING GIST (start_coordinates);

-- =====================================================
-- 4. CREATE REVIEWS TABLE (PROPER FOREIGN KEYS)
-- =====================================================
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hiking_spot_id INTEGER NOT NULL REFERENCES hiking_spots(hiking_spot_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL CHECK (length(comment) >= 10 AND length(comment) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, hiking_spot_id)
);

-- Create indexes
CREATE INDEX idx_reviews_hiking_spot_id ON reviews(hiking_spot_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE hiking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE trail_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES
-- =====================================================

-- Hiking spots policies
CREATE POLICY "Allow read access to hiking spots" ON hiking_spots
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to modify hiking spots" ON hiking_spots
  FOR ALL USING (auth.role() = 'authenticated');

-- Trail routes policies
CREATE POLICY "Allow read access to trail routes" ON trail_routes
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to modify trail routes" ON trail_routes
  FOR ALL USING (auth.role() = 'authenticated');

-- Reviews policies
CREATE POLICY "Allow read access to all reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Allow users to insert their own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 7. CREATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_hiking_spots_updated_at
  BEFORE UPDATE ON hiking_spots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trail_routes_updated_at
  BEFORE UPDATE ON trail_routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update hiking spot ratings when reviews change
CREATE OR REPLACE FUNCTION update_hiking_spot_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the hiking spot's average rating and review count
  UPDATE hiking_spots 
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews 
      WHERE hiking_spot_id = COALESCE(NEW.hiking_spot_id, OLD.hiking_spot_id)
    ),
    number_of_reviews = (
      SELECT COUNT(*)
      FROM reviews 
      WHERE hiking_spot_id = COALESCE(NEW.hiking_spot_id, OLD.hiking_spot_id)
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews 
      WHERE hiking_spot_id = COALESCE(NEW.hiking_spot_id, OLD.hiking_spot_id)
    )
  WHERE hiking_spot_id = COALESCE(NEW.hiking_spot_id, OLD.hiking_spot_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for rating updates
CREATE TRIGGER update_rating_on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_hiking_spot_rating();

CREATE TRIGGER update_rating_on_review_update
  AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_hiking_spot_rating();

CREATE TRIGGER update_rating_on_review_delete
  AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_hiking_spot_rating();

-- =====================================================
-- 8. INSERT SAMPLE DATA
-- =====================================================

-- Insert hiking spots with INTEGER IDs
INSERT INTO hiking_spots (
  name, description, difficulty, elevation_m, trail_length_km, estimated_duration_min,
  cover_image_url, images, amenities, best_season, is_verified,
  average_rating, number_of_reviews, latitude, longitude
) VALUES
('Mount Babag', 'A popular hiking destination with stunning views of Cebu City and surrounding areas.', 'Moderate', 800, 3.5, 150, 'https://example.com/mount-babag.jpg', '[]'::jsonb, ARRAY['Parking', 'Restrooms', 'Trail markers'], ARRAY['Dry season', 'November to April'], true, 4.5, 120, 10.3157, 123.8854),
('Mount Kan-irag / Sirao Peak', 'A scenic mountain peak offering panoramic views of Cebu City and surrounding areas.', 'Moderate', 900, 4.0, 210, 'https://example.com/mount-kan-irag.jpg', '[]'::jsonb, ARRAY['Trail markers', 'Scenic viewpoints'], ARRAY['Dry season', 'November to April'], true, 4.6, 95, 10.3440, 123.8695),
('Mount Naupa', 'A beautiful mountain with lush vegetation and scenic hiking trails.', 'Moderate', 750, 3.0, 150, 'https://example.com/mount-naupa.jpg', '[]'::jsonb, ARRAY['Trail markers', 'Natural springs'], ARRAY['Dry season', 'November to April'], true, 4.3, 78, 10.2167, 123.7667),
('Mount Manunggal', 'A historic mountain with significant cultural importance and memorial sites.', 'Moderate', 1000, 5.0, 240, 'https://example.com/mount-manunggal.jpg', '[]'::jsonb, ARRAY['Memorial sites', 'Historical significance', 'Trail markers'], ARRAY['Dry season', 'November to April'], true, 4.7, 156, 10.4667, 123.7833),
('Mount Mago', 'A challenging mountain offering rewarding views for experienced hikers.', 'Hard', 1200, 6.0, 300, 'https://example.com/mount-mago.jpg', '[]'::jsonb, ARRAY['Challenging trails', 'Experienced hikers only', 'Stunning views'], ARRAY['Dry season', 'November to April'], true, 4.4, 89, 10.5500, 123.9000);

SELECT 'Database schema fixed successfully!' as status;
SELECT 'Tables created: hiking_spots, trail_routes, reviews' as tables;
SELECT 'All foreign key relationships established correctly' as relationships;
SELECT 'Sample data inserted' as data_status;