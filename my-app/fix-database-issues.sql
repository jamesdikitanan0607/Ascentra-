-- =====================================================
-- COMPREHENSIVE DATABASE ISSUES FIX
-- =====================================================
-- This script fixes the specific issues causing the app errors:
-- 1. Trail routes table missing 'id' column (uses route_id)
-- 2. Hiking spots ID format issues (INTEGER vs UUID)
-- 3. Reviews table foreign key relationship issues

-- =====================================================
-- 1. FIX TRAIL_ROUTES TABLE STRUCTURE
-- =====================================================

-- Check if trail_routes table exists and fix the structure
DO $$
BEGIN
    -- Check if trail_routes table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'trail_routes') THEN
        -- Add 'id' column as alias to route_id if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'trail_routes' AND column_name = 'id') THEN
            -- Add id column that references route_id
            ALTER TABLE trail_routes ADD COLUMN id INTEGER;
            -- Update id to match route_id
            UPDATE trail_routes SET id = route_id;
            -- Make id NOT NULL
            ALTER TABLE trail_routes ALTER COLUMN id SET NOT NULL;
            -- Add unique constraint
            ALTER TABLE trail_routes ADD CONSTRAINT trail_routes_id_unique UNIQUE (id);
        END IF;
        
        -- Ensure hiking_spot_id column exists and is properly named
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'trail_routes' AND column_name = 'hiking_spot_id') THEN
            -- If it doesn't exist, check for other possible names and rename
            IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'trail_routes' AND column_name = 'spot_id') THEN
                ALTER TABLE trail_routes RENAME COLUMN spot_id TO hiking_spot_id;
            END IF;
        END IF;
    ELSE
        -- Create trail_routes table with proper structure
        CREATE TABLE trail_routes (
            id SERIAL PRIMARY KEY,
            route_id INTEGER UNIQUE NOT NULL DEFAULT nextval('trail_routes_id_seq'),
            hiking_spot_id INTEGER NOT NULL,
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
        
        -- Enable RLS
        ALTER TABLE trail_routes ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Allow read access to trail routes" ON trail_routes FOR SELECT USING (true);
        CREATE POLICY "Allow authenticated users to modify trail routes" ON trail_routes FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- =====================================================
-- 2. FIX HIKING_SPOTS TABLE STRUCTURE
-- =====================================================

-- Ensure hiking_spots table uses INTEGER primary key (not UUID)
DO $$
BEGIN
    -- Check if hiking_spots table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hiking_spots') THEN
        -- Check the primary key column name and type
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'hiking_spots' AND column_name = 'hiking_spot_id') THEN
            -- If hiking_spot_id doesn't exist, check for 'id' column and rename it
            IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'hiking_spots' AND column_name = 'id') THEN
                -- Check if id is INTEGER type
                IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'hiking_spots' AND column_name = 'id' AND data_type = 'integer') THEN
                    -- Add hiking_spot_id as alias to id
                    ALTER TABLE hiking_spots ADD COLUMN hiking_spot_id INTEGER;
                    UPDATE hiking_spots SET hiking_spot_id = id;
                    ALTER TABLE hiking_spots ALTER COLUMN hiking_spot_id SET NOT NULL;
                    ALTER TABLE hiking_spots ADD CONSTRAINT hiking_spots_hiking_spot_id_unique UNIQUE (hiking_spot_id);
                END IF;
            END IF;
        END IF;
        
        -- Ensure proper foreign key relationship with trail_routes
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'trail_routes') THEN
            -- Add foreign key constraint if it doesn't exist
            IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'trail_routes_hiking_spot_id_fkey') THEN
                -- First, ensure all hiking_spot_id values in trail_routes exist in hiking_spots
                DELETE FROM trail_routes WHERE hiking_spot_id NOT IN (SELECT COALESCE(hiking_spot_id, id) FROM hiking_spots);
                
                -- Add the foreign key constraint
                ALTER TABLE trail_routes ADD CONSTRAINT trail_routes_hiking_spot_id_fkey 
                FOREIGN KEY (hiking_spot_id) REFERENCES hiking_spots(COALESCE(hiking_spot_id, id)) ON DELETE CASCADE;
            END IF;
        END IF;
    END IF;
END $$;

-- =====================================================
-- 3. FIX REVIEWS TABLE STRUCTURE
-- =====================================================

-- Ensure reviews table has proper structure and relationships
DO $$
BEGIN
    -- Check if reviews table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reviews') THEN
        -- Ensure hiking_spot_id column exists and is INTEGER type
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'hiking_spot_id') THEN
            -- Check for other possible column names
            IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'spot_id') THEN
                ALTER TABLE reviews RENAME COLUMN spot_id TO hiking_spot_id;
            ELSE
                -- Add the column
                ALTER TABLE reviews ADD COLUMN hiking_spot_id INTEGER;
            END IF;
        END IF;
        
        -- Ensure hiking_spot_id is INTEGER type (not UUID)
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'hiking_spot_id' AND data_type != 'integer') THEN
            -- Convert UUID to INTEGER if needed (this might require data migration)
            ALTER TABLE reviews ALTER COLUMN hiking_spot_id TYPE INTEGER USING hiking_spot_id::text::integer;
        END IF;
        
        -- Ensure user_id exists and is UUID type
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'user_id') THEN
            ALTER TABLE reviews ADD COLUMN user_id UUID;
        END IF;
        
        -- Add foreign key constraints if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'reviews_hiking_spot_id_fkey') THEN
            -- Clean up orphaned reviews first
            DELETE FROM reviews WHERE hiking_spot_id NOT IN (SELECT COALESCE(hiking_spot_id, id) FROM hiking_spots);
            
            -- Add foreign key to hiking_spots
            ALTER TABLE reviews ADD CONSTRAINT reviews_hiking_spot_id_fkey 
            FOREIGN KEY (hiking_spot_id) REFERENCES hiking_spots(COALESCE(hiking_spot_id, id)) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'reviews_user_id_fkey') THEN
            -- Clean up orphaned reviews first
            DELETE FROM reviews WHERE user_id NOT IN (SELECT id FROM auth.users);
            
            -- Add foreign key to auth.users
            ALTER TABLE reviews ADD CONSTRAINT reviews_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    ELSE
        -- Create reviews table with proper structure
        CREATE TABLE reviews (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            hiking_spot_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT NOT NULL CHECK (length(comment) >= 10 AND length(comment) <= 500),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, hiking_spot_id)
        );
        
        -- Add foreign key to hiking_spots (will be added after hiking_spots is fixed)
        -- This will be handled by the constraint addition above
        
        -- Create indexes
        CREATE INDEX idx_reviews_hiking_spot_id ON reviews(hiking_spot_id);
        CREATE INDEX idx_reviews_user_id ON reviews(user_id);
        CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
        
        -- Enable RLS
        ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Allow read access to all reviews" ON reviews FOR SELECT USING (true);
        CREATE POLICY "Allow users to insert their own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Allow users to update their own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Allow users to delete their own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- =====================================================
-- 4. CREATE MISSING FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at (only create if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'update_trail_routes_updated_at') THEN
        CREATE TRIGGER update_trail_routes_updated_at
            BEFORE UPDATE ON trail_routes
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'update_reviews_updated_at') THEN
        CREATE TRIGGER update_reviews_updated_at
            BEFORE UPDATE ON reviews
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

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
    )
  WHERE COALESCE(hiking_spot_id, id) = COALESCE(NEW.hiking_spot_id, OLD.hiking_spot_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for rating updates (only create if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'update_rating_on_review_insert') THEN
        CREATE TRIGGER update_rating_on_review_insert
            AFTER INSERT ON reviews
            FOR EACH ROW EXECUTE FUNCTION update_hiking_spot_rating();
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'update_rating_on_review_update') THEN
        CREATE TRIGGER update_rating_on_review_update
            AFTER UPDATE ON reviews
            FOR EACH ROW EXECUTE FUNCTION update_hiking_spot_rating();
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'update_rating_on_review_delete') THEN
        CREATE TRIGGER update_rating_on_review_delete
            AFTER DELETE ON reviews
            FOR EACH ROW EXECUTE FUNCTION update_hiking_spot_rating();
    END IF;
END $$;

-- =====================================================
-- 5. VERIFICATION QUERIES
-- =====================================================

-- Verify table structures
SELECT 'VERIFICATION RESULTS:' as status;

SELECT 
    'trail_routes table structure:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'trail_routes' 
ORDER BY ordinal_position;

SELECT 
    'hiking_spots table structure:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'hiking_spots' 
ORDER BY ordinal_position;

SELECT 
    'reviews table structure:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reviews' 
ORDER BY ordinal_position;

-- Verify foreign key constraints
SELECT 
    'Foreign key constraints:' as info,
    constraint_name,
    table_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND table_name IN ('trail_routes', 'reviews')
ORDER BY table_name, constraint_name;

SELECT 'Database schema fixes completed successfully!' as final_status;