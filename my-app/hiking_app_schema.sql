-- Hiking Mobile App Database Schema
-- Optimized for Supabase/PostgreSQL with proper indexing and relationships

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for geographic data (if needed for advanced mapping)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Create custom types
CREATE TYPE difficulty_level AS ENUM ('Easy', 'Moderate', 'Hard', 'Advanced');
CREATE TYPE trail_type AS ENUM ('Loop', 'Out and Back', 'Point to Point');

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    first_name TEXT,
    last_name TEXT,
    date_of_birth DATE,
    location TEXT,
    hiking_experience TEXT CHECK (hiking_experience IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    preferred_difficulty difficulty_level,
    total_hikes INTEGER DEFAULT 0,
    total_distance_km NUMERIC(10,2) DEFAULT 0,
    total_elevation_m INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_hiking_experience ON profiles(hiking_experience);
CREATE INDEX IF NOT EXISTS idx_profiles_total_hikes ON profiles(total_hikes);

-- =============================================
-- HIKING SPOTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS hiking_spots (
    hiking_spot_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    elevation INTEGER, -- elevation in meters
    difficulty TEXT,
    trail_length NUMERIC(10,2), -- total trail length in km
    estimated_duration INTEGER, -- in minutes
    cover_image_url TEXT,
    image_url TEXT,
    images JSONB, -- array of image URLs
    amenities TEXT[], -- array of amenities
    best_season TEXT[], -- array of best seasons
    location_text TEXT,
    average_rating NUMERIC(3,2) DEFAULT 0,
    number_of_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for hiking spots
CREATE INDEX IF NOT EXISTS idx_hiking_spots_name ON hiking_spots(name);
CREATE INDEX IF NOT EXISTS idx_hiking_spots_location ON hiking_spots(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_hiking_spots_difficulty ON hiking_spots(difficulty);
CREATE INDEX IF NOT EXISTS idx_hiking_spots_rating ON hiking_spots(average_rating);
CREATE INDEX IF NOT EXISTS idx_hiking_spots_is_active ON hiking_spots(is_active);

-- =============================================
-- TRAILS TABLE (Enhanced version)
-- =============================================
CREATE TABLE IF NOT EXISTS trails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hiking_spot_id INTEGER REFERENCES hiking_spots(hiking_spot_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    difficulty difficulty_level NOT NULL DEFAULT 'Moderate',
    distance_km NUMERIC(10,2) NOT NULL,
    elevation_gain_m INTEGER NOT NULL DEFAULT 0,
    estimated_duration_hr NUMERIC(4,2), -- in hours
    trail_type trail_type DEFAULT 'Out and Back',
    cover_image TEXT, -- URL to Supabase storage
    gpx_data TEXT, -- GPX file content or URL
    highlights TEXT,
    route_color TEXT DEFAULT '#FF9800',
    start_latitude DOUBLE PRECISION,
    start_longitude DOUBLE PRECISION,
    end_latitude DOUBLE PRECISION,
    end_longitude DOUBLE PRECISION,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for trails
CREATE INDEX IF NOT EXISTS idx_trails_hiking_spot_id ON trails(hiking_spot_id);
CREATE INDEX IF NOT EXISTS idx_trails_difficulty ON trails(difficulty);
CREATE INDEX IF NOT EXISTS idx_trails_distance ON trails(distance_km);
CREATE INDEX IF NOT EXISTS idx_trails_elevation ON trails(elevation_gain_m);
CREATE INDEX IF NOT EXISTS idx_trails_is_active ON trails(is_active);

-- =============================================
-- TRAIL_POINTS TABLE (for mapping coordinates)
-- =============================================
CREATE TABLE IF NOT EXISTS trail_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trail_id UUID REFERENCES trails(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    elevation_m INTEGER, -- elevation at this point
    order_index INTEGER NOT NULL, -- order of plotting
    point_type TEXT DEFAULT 'waypoint' CHECK (point_type IN ('start', 'waypoint', 'checkpoint', 'end', 'viewpoint', 'rest_area')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for trail points
CREATE INDEX IF NOT EXISTS idx_trail_points_trail_id ON trail_points(trail_id);
CREATE INDEX IF NOT EXISTS idx_trail_points_order ON trail_points(trail_id, order_index);
CREATE INDEX IF NOT EXISTS idx_trail_points_location ON trail_points(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_trail_points_type ON trail_points(point_type);

-- =============================================
-- TRAIL_ROUTES TABLE (Compatibility with existing data)
-- =============================================
CREATE TABLE IF NOT EXISTS trail_routes (
    route_id SERIAL PRIMARY KEY,
    hiking_spot_id INTEGER REFERENCES hiking_spots(hiking_spot_id) ON DELETE CASCADE,
    route_name TEXT NOT NULL,
    description TEXT,
    difficulty TEXT NOT NULL DEFAULT 'Moderate',
    distance_km NUMERIC(10,2) NOT NULL,
    elevation_gain_m INTEGER NOT NULL DEFAULT 0,
    estimated_duration_hr NUMERIC(4,2),
    trail_type TEXT DEFAULT 'Out and Back',
    waypoints TEXT, -- JSON string of waypoints
    gpx_data TEXT,
    highlights TEXT,
    route_color TEXT DEFAULT '#FF9800',
    geojson_path JSONB, -- GeoJSON path data
    start_coordinates TEXT, -- JSON string of start coordinates
    end_coordinates TEXT, -- JSON string of end coordinates
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for trail routes
CREATE INDEX IF NOT EXISTS idx_trail_routes_hiking_spot_id ON trail_routes(hiking_spot_id);
CREATE INDEX IF NOT EXISTS idx_trail_routes_difficulty ON trail_routes(difficulty);
CREATE INDEX IF NOT EXISTS idx_trail_routes_distance ON trail_routes(distance_km);
CREATE INDEX IF NOT EXISTS idx_trail_routes_is_active ON trail_routes(is_active);

-- =============================================
-- CHECK_INS TABLE (user activity logging)
-- =============================================
CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    trail_id UUID REFERENCES trails(id) ON DELETE CASCADE,
    hiking_spot_id INTEGER REFERENCES hiking_spots(hiking_spot_id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    check_out_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER, -- calculated duration
    distance_completed_km NUMERIC(10,2),
    elevation_completed_m INTEGER,
    notes TEXT,
    photos TEXT[], -- array of photo URLs
    weather_conditions TEXT,
    difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
    enjoyment_rating INTEGER CHECK (enjoyment_rating BETWEEN 1 AND 5),
    location_latitude DOUBLE PRECISION,
    location_longitude DOUBLE PRECISION,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for check-ins
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_trail_id ON check_ins(trail_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_hiking_spot_id ON check_ins(hiking_spot_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_check_in_time ON check_ins(check_in_time);
CREATE INDEX IF NOT EXISTS idx_check_ins_is_completed ON check_ins(is_completed);

-- =============================================
-- FAVORITES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    hiking_spot_id INTEGER REFERENCES hiking_spots(hiking_spot_id) ON DELETE CASCADE,
    trail_id UUID REFERENCES trails(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_hiking_spot_id ON favorites(hiking_spot_id);
CREATE INDEX IF NOT EXISTS idx_favorites_trail_id ON favorites(trail_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_unique_spot ON favorites(user_id, hiking_spot_id) WHERE trail_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_unique_trail ON favorites(user_id, trail_id) WHERE trail_id IS NOT NULL;

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    hiking_spot_id INTEGER REFERENCES hiking_spots(hiking_spot_id) ON DELETE CASCADE,
    trail_id UUID REFERENCES trails(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title TEXT,
    content TEXT,
    photos TEXT[], -- array of photo URLs
    difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
    trail_condition TEXT CHECK (trail_condition IN ('Excellent', 'Good', 'Fair', 'Poor')),
    weather_during_hike TEXT,
    recommended BOOLEAN DEFAULT TRUE,
    helpful_votes INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE, -- verified by completing the hike
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_hiking_spot_id ON reviews(hiking_spot_id);
CREATE INDEX IF NOT EXISTS idx_reviews_trail_id ON reviews(trail_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hiking_spots_updated_at BEFORE UPDATE ON hiking_spots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trails_updated_at BEFORE UPDATE ON trails FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trail_routes_updated_at BEFORE UPDATE ON trail_routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_check_ins_updated_at BEFORE UPDATE ON check_ins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hiking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE trail_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trail_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users can only see their own user record
CREATE POLICY "Users can view own user data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own user data" ON users FOR UPDATE USING (auth.uid() = id);

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Hiking spots are public
CREATE POLICY "Hiking spots are viewable by everyone" ON hiking_spots FOR SELECT USING (true);

-- Trails are public
CREATE POLICY "Trails are viewable by everyone" ON trails FOR SELECT USING (true);
CREATE POLICY "Trail routes are viewable by everyone" ON trail_routes FOR SELECT USING (true);
CREATE POLICY "Trail points are viewable by everyone" ON trail_points FOR SELECT USING (true);

-- Check-ins are private to users
CREATE POLICY "Users can view own check-ins" ON check_ins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own check-ins" ON check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own check-ins" ON check_ins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own check-ins" ON check_ins FOR DELETE USING (auth.uid() = user_id);

-- Favorites are private to users
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Reviews are public to view, private to modify
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert sample hiking spots
INSERT INTO hiking_spots (hiking_spot_id, name, description, latitude, longitude, elevation, difficulty, trail_length, estimated_duration, cover_image_url, average_rating, number_of_reviews, is_verified) VALUES
(1, 'Mount Babag', 'A scenic mountain with gentle trails and beautiful forest views.', 10.3628, 123.8897, 800, 'Easy to Moderate', 1.1, 21, '', 4.5, 25, true),
(2, 'Sirao Peak', 'Famous for its flower garden and panoramic city views.', 10.3200, 123.8500, 900, 'Easy', 0.8, 15, '', 4.3, 18, true),
(3, 'Temple of Leah', 'Roman-inspired temple with stunning architecture and city views.', 10.3100, 123.8400, 600, 'Easy', 0.5, 10, '', 4.7, 32, true)
ON CONFLICT (hiking_spot_id) DO NOTHING;

-- Insert sample trail routes
INSERT INTO trail_routes (hiking_spot_id, route_name, description, difficulty, distance_km, elevation_gain_m, estimated_duration_hr, trail_type, highlights, route_color) VALUES
(1, 'Babag Ridge Loop', 'Gentle forest walk, birdlife, shaded bamboo patches.', 'Easy', 0.48, 39, 0.14, 'Loop', 'Gentle forest walk, birdlife, shaded bamboo patches.', '#4CAF50'),
(1, 'Babag Tower Trail', 'Short steady climb to viewpoint tower, city skyline views.', 'Moderate', 0.62, 124, 0.21, 'Out and Back', 'Short steady climb to viewpoint tower, city skyline views.', '#FF9800'),
(2, 'Sirao Flower Trail', 'Easy walk through colorful flower gardens.', 'Easy', 0.8, 50, 0.25, 'Loop', 'Colorful flower gardens, panoramic views.', '#4CAF50'),
(3, 'Temple Approach Trail', 'Paved path to the temple with scenic stops.', 'Easy', 0.5, 30, 0.17, 'Out and Back', 'Roman architecture, city views.', '#4CAF50')
ON CONFLICT DO NOTHING;

-- =============================================
-- FUNCTIONS FOR STATISTICS
-- =============================================

-- Function to update hiking spot ratings
CREATE OR REPLACE FUNCTION update_hiking_spot_rating(spot_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE hiking_spots 
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM reviews 
            WHERE hiking_spot_id = spot_id
        ),
        number_of_reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE hiking_spot_id = spot_id
        )
    WHERE hiking_spot_id = spot_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update user profile statistics
CREATE OR REPLACE FUNCTION update_user_stats(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles 
    SET 
        total_hikes = (
            SELECT COUNT(*) 
            FROM check_ins 
            WHERE user_id = user_uuid AND is_completed = true
        ),
        total_distance_km = (
            SELECT COALESCE(SUM(distance_completed_km), 0) 
            FROM check_ins 
            WHERE user_id = user_uuid AND is_completed = true
        ),
        total_elevation_m = (
            SELECT COALESCE(SUM(elevation_completed_m), 0) 
            FROM check_ins 
            WHERE user_id = user_uuid AND is_completed = true
        )
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- View for trail details with hiking spot information
CREATE OR REPLACE VIEW trail_details AS
SELECT 
    tr.route_id,
    tr.hiking_spot_id,
    tr.route_name,
    tr.description,
    tr.difficulty,
    tr.distance_km,
    tr.elevation_gain_m,
    tr.estimated_duration_hr,
    tr.trail_type,
    tr.highlights,
    tr.route_color,
    hs.name as hiking_spot_name,
    hs.latitude as spot_latitude,
    hs.longitude as spot_longitude,
    hs.elevation as spot_elevation,
    hs.average_rating as spot_rating,
    hs.number_of_reviews as spot_reviews
FROM trail_routes tr
JOIN hiking_spots hs ON tr.hiking_spot_id = hs.hiking_spot_id
WHERE tr.is_active = true AND hs.is_active = true;

-- View for user hiking statistics
CREATE OR REPLACE VIEW user_hiking_stats AS
SELECT 
    p.id as user_id,
    p.username,
    p.total_hikes,
    p.total_distance_km,
    p.total_elevation_m,
    COUNT(DISTINCT c.hiking_spot_id) as unique_spots_visited,
    AVG(c.difficulty_rating) as avg_difficulty_rating,
    AVG(c.enjoyment_rating) as avg_enjoyment_rating
FROM profiles p
LEFT JOIN check_ins c ON p.id = c.user_id AND c.is_completed = true
GROUP BY p.id, p.username, p.total_hikes, p.total_distance_km, p.total_elevation_m;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE users IS 'User authentication and basic account information';
COMMENT ON TABLE profiles IS 'Extended user profile information and hiking statistics';
COMMENT ON TABLE hiking_spots IS 'Hiking locations and destinations';
COMMENT ON TABLE trails IS 'Individual trail routes within hiking spots';
COMMENT ON TABLE trail_points IS 'GPS coordinates and waypoints for trail mapping';
COMMENT ON TABLE trail_routes IS 'Legacy trail routes table for compatibility';
COMMENT ON TABLE check_ins IS 'User hiking activity and progress tracking';
COMMENT ON TABLE favorites IS 'User favorite hiking spots and trails';
COMMENT ON TABLE reviews IS 'User reviews and ratings for hiking spots and trails';

-- Schema creation completed
SELECT 'Hiking Mobile App database schema created successfully!' as status;