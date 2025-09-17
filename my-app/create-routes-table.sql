-- =====================================================
-- CREATE HIKING SPOT ROUTES TABLE
-- =====================================================
-- This script creates the hiking_spot_routes table to store
-- multiple trail routes for each hiking spot (1-5 routes per spot)

-- Create hiking_spot_routes table
CREATE TABLE IF NOT EXISTS hiking_spot_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hiking_spot_id UUID REFERENCES hiking_spots(id) ON DELETE CASCADE NOT NULL,
    route_name TEXT NOT NULL,
    route_description TEXT,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Moderate', 'Hard', 'Expert')),
    distance DECIMAL(10,2), -- in kilometers
    estimated_duration INTEGER, -- in minutes
    elevation_gain DECIMAL(10,2), -- in meters
    route_coordinates JSONB DEFAULT '[]', -- array of lat/lng coordinates for the trail
    waypoints JSONB DEFAULT '[]', -- important points along the route
    route_type TEXT DEFAULT 'loop' CHECK (route_type IN ('loop', 'out_and_back', 'point_to_point')),
    trail_conditions TEXT,
    safety_notes TEXT,
    best_time_to_hike TEXT[] DEFAULT '{}',
    route_features TEXT[] DEFAULT '{}', -- ['waterfall', 'viewpoint', 'cave', etc.]
    is_main_route BOOLEAN DEFAULT false, -- mark the primary/recommended route
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hiking_spot_routes_spot_id ON hiking_spot_routes(hiking_spot_id);
CREATE INDEX IF NOT EXISTS idx_hiking_spot_routes_difficulty ON hiking_spot_routes(difficulty);
CREATE INDEX IF NOT EXISTS idx_hiking_spot_routes_main ON hiking_spot_routes(is_main_route) WHERE is_main_route = true;
CREATE INDEX IF NOT EXISTS idx_hiking_spot_routes_active ON hiking_spot_routes(is_active) WHERE is_active = true;

-- Create trigger for updated_at
CREATE TRIGGER trigger_hiking_spot_routes_updated_at
    BEFORE UPDATE ON hiking_spot_routes
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Enable RLS
ALTER TABLE hiking_spot_routes ENABLE ROW LEVEL SECURITY;

-- RLS policies for hiking_spot_routes
DROP POLICY IF EXISTS "Hiking spot routes viewable by all" ON hiking_spot_routes;
CREATE POLICY "Hiking spot routes viewable by all" ON hiking_spot_routes
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can add routes" ON hiking_spot_routes;
CREATE POLICY "Authenticated users can add routes" ON hiking_spot_routes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update routes" ON hiking_spot_routes;
CREATE POLICY "Authenticated users can update routes" ON hiking_spot_routes
    FOR UPDATE USING (auth.uid() IS NOT NULL);

SELECT 'Hiking spot routes table created successfully!' as status;