-- =====================================================
-- ADDITIONAL TABLES FOR ASCENTRA HIKING APP
-- =====================================================
-- This file adds missing tables: routes, weather_cache, spot_images
-- Run this after the main database_schema.sql

-- =====================================================
-- ROUTES TABLE
-- =====================================================

-- Trail routes for hiking spots (5 routes per spot)
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hiking_spot_id UUID REFERENCES public.hiking_spots(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Moderate', 'Hard', 'Expert')),
    distance DECIMAL(10,2), -- in kilometers
    estimated_duration INTEGER, -- in minutes
    elevation_gain DECIMAL(10,2), -- in meters
    route_coordinates JSONB DEFAULT '[]', -- array of lat/lng coordinates
    gpx_data TEXT, -- GPX file content
    waypoints JSONB DEFAULT '[]', -- important waypoints along the route
    trail_conditions TEXT,
    best_season TEXT[] DEFAULT '{}',
    safety_notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- WEATHER CACHE TABLE
-- =====================================================

-- Weather data cache for hiking spots
CREATE TABLE IF NOT EXISTS public.weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hiking_spot_id UUID REFERENCES public.hiking_spots(id) ON DELETE CASCADE NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    weather_data JSONB NOT NULL, -- OpenWeatherMap API response
    temperature DECIMAL(5,2), -- in Celsius
    humidity INTEGER, -- percentage
    wind_speed DECIMAL(5,2), -- in m/s
    weather_condition TEXT, -- clear, cloudy, rainy, etc.
    visibility DECIMAL(5,2), -- in km
    uv_index DECIMAL(3,1),
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SPOT IMAGES TABLE
-- =====================================================

-- Detailed image management for hiking spots
CREATE TABLE IF NOT EXISTS public.spot_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hiking_spot_id UUID REFERENCES public.hiking_spots(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    image_type TEXT CHECK (image_type IN ('thumbnail', 'gallery', 'hero', 'trail_marker')),
    caption TEXT,
    alt_text TEXT,
    file_name TEXT,
    file_size INTEGER, -- in bytes
    width INTEGER, -- in pixels
    height INTEGER, -- in pixels
    mime_type TEXT,
    sort_order INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_featured BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Routes indexes
CREATE INDEX IF NOT EXISTS idx_routes_hiking_spot_id ON public.routes(hiking_spot_id);
CREATE INDEX IF NOT EXISTS idx_routes_difficulty ON public.routes(difficulty);
CREATE INDEX IF NOT EXISTS idx_routes_distance ON public.routes(distance);
CREATE INDEX IF NOT EXISTS idx_routes_created_by ON public.routes(created_by);
CREATE INDEX IF NOT EXISTS idx_routes_verified ON public.routes(is_verified) WHERE is_verified = true;

-- Weather cache indexes
CREATE INDEX IF NOT EXISTS idx_weather_cache_hiking_spot_id ON public.weather_cache(hiking_spot_id);
CREATE INDEX IF NOT EXISTS idx_weather_cache_location ON public.weather_cache(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires_at ON public.weather_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_weather_cache_cached_at ON public.weather_cache(cached_at DESC);

-- Spot images indexes
CREATE INDEX IF NOT EXISTS idx_spot_images_hiking_spot_id ON public.spot_images(hiking_spot_id);
CREATE INDEX IF NOT EXISTS idx_spot_images_type ON public.spot_images(image_type);
CREATE INDEX IF NOT EXISTS idx_spot_images_sort_order ON public.spot_images(hiking_spot_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_spot_images_featured ON public.spot_images(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_spot_images_uploaded_by ON public.spot_images(uploaded_by);

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- =====================================================

-- Routes trigger
CREATE TRIGGER trigger_routes_updated_at
    BEFORE UPDATE ON public.routes
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Spot images trigger
CREATE TRIGGER trigger_spot_images_updated_at
    BEFORE UPDATE ON public.spot_images
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spot_images ENABLE ROW LEVEL SECURITY;

-- Routes policies
DROP POLICY IF EXISTS "Routes are viewable by everyone" ON public.routes;
CREATE POLICY "Routes are viewable by everyone" ON public.routes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can add routes" ON public.routes;
CREATE POLICY "Authenticated users can add routes" ON public.routes
    FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own routes" ON public.routes;
CREATE POLICY "Users can update their own routes" ON public.routes
    FOR UPDATE USING (auth.uid() = created_by);

-- Weather cache policies
DROP POLICY IF EXISTS "Weather cache is viewable by everyone" ON public.weather_cache;
CREATE POLICY "Weather cache is viewable by everyone" ON public.weather_cache
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can manage weather cache" ON public.weather_cache;
CREATE POLICY "System can manage weather cache" ON public.weather_cache
    FOR ALL USING (true);

-- Spot images policies
DROP POLICY IF EXISTS "Spot images are viewable by everyone" ON public.spot_images;
CREATE POLICY "Spot images are viewable by everyone" ON public.spot_images
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can upload images" ON public.spot_images;
CREATE POLICY "Authenticated users can upload images" ON public.spot_images
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Users can update their own images" ON public.spot_images;
CREATE POLICY "Users can update their own images" ON public.spot_images
    FOR UPDATE USING (auth.uid() = uploaded_by);

-- =====================================================
-- HELPFUL VIEWS
-- =====================================================

-- View for hiking spots with route count
CREATE VIEW hiking_spots_with_routes AS
SELECT 
    hs.*,
    COUNT(r.id) as route_count,
    ARRAY_AGG(r.name ORDER BY r.difficulty, r.distance) FILTER (WHERE r.id IS NOT NULL) as route_names
FROM hiking_spots hs
LEFT JOIN routes r ON hs.id = r.hiking_spot_id
GROUP BY hs.id;

-- View for current weather data
CREATE VIEW current_weather AS
SELECT 
    wc.*,
    hs.name as spot_name
FROM weather_cache wc
JOIN hiking_spots hs ON wc.hiking_spot_id = hs.id
WHERE wc.expires_at > NOW()
ORDER BY wc.cached_at DESC;

-- View for spot images with metadata
CREATE VIEW spot_images_detailed AS
SELECT 
    si.*,
    hs.name as spot_name,
    p.username as uploaded_by_username
FROM spot_images si
JOIN hiking_spots hs ON si.hiking_spot_id = hs.id
LEFT JOIN profiles p ON si.uploaded_by = p.user_id
ORDER BY si.hiking_spot_id, si.sort_order;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Additional Ascentra Schema Tables Created Successfully!' as status;
SELECT 'Added: routes, weather_cache, spot_images tables with full RLS and indexing' as details;