-- =====================================================
-- COMPLETE DATABASE SETUP FOR NEW SUPABASE INSTANCE
-- =====================================================
-- This script creates all necessary tables and relationships
-- for the Hiking Mobile App with proper schema design

-- =====================================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- 2. CREATE PROFILES TABLE (extends auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  hiking_experience TEXT CHECK (hiking_experience IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  preferred_difficulty TEXT CHECK (preferred_difficulty IN ('Easy', 'Moderate', 'Hard', 'Advanced')),
  total_hikes INTEGER DEFAULT 0,
  total_distance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE HIKING_SPOTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.hiking_spots (
  hiking_spot_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  coordinates POINT,
  elevation INTEGER,
  difficulty TEXT CHECK (difficulty IN ('Easy','Moderate','Hard','Advanced')),
  trail_length DECIMAL(5,2),
  estimated_duration INTEGER, -- in minutes
  cover_image_url TEXT,
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  amenities TEXT[],
  best_season TEXT[],
  location_text TEXT,
  average_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5),
  number_of_reviews INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. CREATE TRAIL_ROUTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.trail_routes (
  id SERIAL PRIMARY KEY,
  route_id INTEGER UNIQUE NOT NULL DEFAULT nextval('trail_routes_id_seq'),
  hiking_spot_id INTEGER NOT NULL REFERENCES public.hiking_spots(hiking_spot_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy','Moderate','Hard','Advanced')),
  length DECIMAL(5,2), -- in kilometers
  elevation_gain INTEGER, -- in meters
  estimated_time INTEGER, -- in minutes
  trail_type TEXT CHECK (trail_type IN ('Loop', 'Out and Back', 'Point to Point')),
  waypoints JSONB DEFAULT '[]'::jsonb,
  gpx_data TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. CREATE REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id SERIAL PRIMARY KEY,
  hiking_spot_id INTEGER NOT NULL REFERENCES public.hiking_spots(hiking_spot_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  visit_date DATE,
  weather_conditions TEXT,
  trail_conditions TEXT,
  difficulty_rating TEXT CHECK (difficulty_rating IN ('Easy','Moderate','Hard','Advanced')),
  would_recommend BOOLEAN DEFAULT true,
  helpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hiking_spot_id, user_id) -- One review per user per hiking spot
);

-- =====================================================
-- 6. CREATE HIKE_RECORDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.hike_records (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hiking_spot_id INTEGER REFERENCES public.hiking_spots(hiking_spot_id) ON DELETE SET NULL,
  trail_route_id INTEGER REFERENCES public.trail_routes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration INTEGER, -- in minutes
  distance DECIMAL(10,2), -- in kilometers
  elevation_gain INTEGER, -- in meters
  max_elevation INTEGER, -- in meters
  average_pace DECIMAL(5,2), -- minutes per kilometer
  calories_burned INTEGER,
  gps_track JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  weather_data JSONB,
  difficulty_experienced TEXT CHECK (difficulty_experienced IN ('Easy','Moderate','Hard','Advanced')),
  notes TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- Hiking spots indexes
CREATE INDEX IF NOT EXISTS idx_hiking_spots_location ON public.hiking_spots USING GIST(coordinates);
CREATE INDEX IF NOT EXISTS idx_hiking_spots_difficulty ON public.hiking_spots(difficulty);
CREATE INDEX IF NOT EXISTS idx_hiking_spots_rating ON public.hiking_spots(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_hiking_spots_created_at ON public.hiking_spots(created_at);

-- Trail routes indexes
CREATE INDEX IF NOT EXISTS idx_trail_routes_hiking_spot ON public.trail_routes(hiking_spot_id);
CREATE INDEX IF NOT EXISTS idx_trail_routes_difficulty ON public.trail_routes(difficulty);
CREATE INDEX IF NOT EXISTS idx_trail_routes_active ON public.trail_routes(is_active);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_hiking_spot ON public.reviews(hiking_spot_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- Hike records indexes
CREATE INDEX IF NOT EXISTS idx_hike_records_user ON public.hike_records(user_id);
CREATE INDEX IF NOT EXISTS idx_hike_records_hiking_spot ON public.hike_records(hiking_spot_id);
CREATE INDEX IF NOT EXISTS idx_hike_records_date ON public.hike_records(start_time DESC);

-- =====================================================
-- 8. CREATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update coordinates from lat/lng
CREATE OR REPLACE FUNCTION update_coordinates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.coordinates = POINT(NEW.longitude, NEW.latitude);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update coordinates
DROP TRIGGER IF EXISTS trigger_update_coordinates ON public.hiking_spots;
CREATE TRIGGER trigger_update_coordinates
  BEFORE INSERT OR UPDATE ON public.hiking_spots
  FOR EACH ROW
  EXECUTE FUNCTION update_coordinates();

-- Function to update hiking spot ratings
CREATE OR REPLACE FUNCTION update_hiking_spot_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.hiking_spots 
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating::DECIMAL), 0) 
      FROM public.reviews 
      WHERE hiking_spot_id = COALESCE(NEW.hiking_spot_id, OLD.hiking_spot_id)
    ),
    number_of_reviews = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE hiking_spot_id = COALESCE(NEW.hiking_spot_id, OLD.hiking_spot_id)
    ),
    review_count = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE hiking_spot_id = COALESCE(NEW.hiking_spot_id, OLD.hiking_spot_id)
    ),
    rating = (
      SELECT COALESCE(AVG(rating::DECIMAL), 0) 
      FROM public.reviews 
      WHERE hiking_spot_id = COALESCE(NEW.hiking_spot_id, OLD.hiking_spot_id)
    ),
    updated_at = NOW()
  WHERE hiking_spot_id = COALESCE(NEW.hiking_spot_id, OLD.hiking_spot_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for rating updates
DROP TRIGGER IF EXISTS trigger_update_rating_insert ON public.reviews;
CREATE TRIGGER trigger_update_rating_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_hiking_spot_rating();

DROP TRIGGER IF EXISTS trigger_update_rating_update ON public.reviews;
CREATE TRIGGER trigger_update_rating_update
  AFTER UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_hiking_spot_rating();

DROP TRIGGER IF EXISTS trigger_update_rating_delete ON public.reviews;
CREATE TRIGGER trigger_update_rating_delete
  AFTER DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_hiking_spot_rating();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_hiking_spots_updated_at ON public.hiking_spots;
CREATE TRIGGER trigger_update_hiking_spots_updated_at
  BEFORE UPDATE ON public.hiking_spots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_trail_routes_updated_at ON public.trail_routes;
CREATE TRIGGER trigger_update_trail_routes_updated_at
  BEFORE UPDATE ON public.trail_routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_reviews_updated_at ON public.reviews;
CREATE TRIGGER trigger_update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hiking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trail_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hike_records ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Hiking spots policies (public read, authenticated write)
CREATE POLICY "Hiking spots are viewable by everyone" ON public.hiking_spots
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert hiking spots" ON public.hiking_spots
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own hiking spots" ON public.hiking_spots
  FOR UPDATE USING (auth.uid() = created_by);

-- Trail routes policies
CREATE POLICY "Trail routes are viewable by everyone" ON public.trail_routes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert trail routes" ON public.trail_routes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Hike records policies
CREATE POLICY "Public hike records are viewable by everyone" ON public.hike_records
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own hike records" ON public.hike_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hike records" ON public.hike_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hike records" ON public.hike_records
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- All tables, indexes, functions, triggers, and RLS policies have been created
-- The database is now ready for the Hiking Mobile App