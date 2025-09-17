-- =====================================================
-- COMPLETE REVIEWS SYSTEM SETUP
-- =====================================================
-- Run this script in Supabase SQL Editor to set up the complete reviews system

-- 1. Add average_rating column to hiking_spots table if it doesn't exist
ALTER TABLE hiking_spots 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_hiking_spots_average_rating ON hiking_spots(average_rating DESC);

-- Update existing records to have default rating
UPDATE hiking_spots SET average_rating = 0.00 WHERE average_rating IS NULL;

-- 2. Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hiking_spot_id UUID NOT NULL REFERENCES hiking_spots(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL CHECK (length(comment) >= 10 AND length(comment) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one review per user per hiking spot
  UNIQUE(user_id, hiking_spot_id)
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_hiking_spot_id ON reviews(hiking_spot_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to all reviews" ON reviews;
DROP POLICY IF EXISTS "Allow users to insert their own reviews" ON reviews;
DROP POLICY IF EXISTS "Allow users to update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Allow users to delete their own reviews" ON reviews;

-- Allow users to read all reviews
CREATE POLICY "Allow read access to all reviews" ON reviews
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own reviews
CREATE POLICY "Allow users to insert their own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own reviews
CREATE POLICY "Allow users to update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own reviews
CREATE POLICY "Allow users to delete their own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_reviews_updated_at_trigger ON reviews;
CREATE TRIGGER update_reviews_updated_at_trigger
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

-- 8. Create function to calculate average rating for hiking spots
CREATE OR REPLACE FUNCTION calculate_hiking_spot_average_rating(spot_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  avg_rating DECIMAL;
BEGIN
  SELECT AVG(rating::DECIMAL) INTO avg_rating
  FROM reviews
  WHERE hiking_spot_id = spot_id;
  
  RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to update hiking_spots average_rating when reviews change
CREATE OR REPLACE FUNCTION update_hiking_spot_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the hiking spot's average rating
  UPDATE hiking_spots 
  SET average_rating = calculate_hiking_spot_average_rating(
    COALESCE(NEW.hiking_spot_id, OLD.hiking_spot_id)
  )
  WHERE id = COALESCE(NEW.hiking_spot_id, OLD.hiking_spot_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 10. Create triggers to update hiking spot rating when reviews change
DROP TRIGGER IF EXISTS update_hiking_spot_rating_on_insert ON reviews;
DROP TRIGGER IF EXISTS update_hiking_spot_rating_on_update ON reviews;
DROP TRIGGER IF EXISTS update_hiking_spot_rating_on_delete ON reviews;

CREATE TRIGGER update_hiking_spot_rating_on_insert
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_hiking_spot_rating();

CREATE TRIGGER update_hiking_spot_rating_on_update
  AFTER UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_hiking_spot_rating();

CREATE TRIGGER update_hiking_spot_rating_on_delete
  AFTER DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_hiking_spot_rating();

-- 11. Grant necessary permissions
GRANT ALL ON reviews TO authenticated;
GRANT ALL ON reviews TO anon;

-- 12. Create some sample reviews for testing (optional)
-- Uncomment the following section if you want to add sample data

/*
-- Sample reviews for testing
INSERT INTO reviews (user_id, hiking_spot_id, rating, comment) VALUES
-- You'll need to replace these UUIDs with actual user and hiking spot IDs from your database
-- ('user-uuid-1', 'hiking-spot-uuid-1', 5, 'Amazing trail with breathtaking views! Highly recommend for experienced hikers.'),
-- ('user-uuid-2', 'hiking-spot-uuid-1', 4, 'Great hike but quite challenging. Make sure to bring plenty of water.'),
-- ('user-uuid-3', 'hiking-spot-uuid-2', 5, 'Perfect for families! Beautiful scenery and well-maintained trails.');
*/

-- 13. Verify the setup
SELECT 
    'Reviews Table' as component,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') 
         THEN '✅ Created' 
         ELSE '❌ Missing' 
    END as status
UNION ALL
SELECT 
    'Average Rating Column' as component,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hiking_spots' AND column_name = 'average_rating') 
         THEN '✅ Added' 
         ELSE '❌ Missing' 
    END as status
UNION ALL
SELECT 
    'RLS Enabled' as component,
    CASE WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = 'reviews') 
         THEN '✅ Enabled' 
         ELSE '❌ Disabled' 
    END as status;

-- 14. Show current review statistics
SELECT 
    COUNT(*) as total_reviews,
    COUNT(DISTINCT hiking_spot_id) as spots_with_reviews,
    COUNT(DISTINCT user_id) as users_who_reviewed,
    ROUND(AVG(rating::DECIMAL), 2) as overall_average_rating
FROM reviews;

COMMIT;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- The reviews system is now fully configured with:
-- ✅ Reviews table with proper constraints
-- ✅ Row Level Security policies
-- ✅ Automatic average rating calculation
-- ✅ Triggers for real-time updates
-- ✅ Performance indexes
-- ✅ Data validation
--
-- Your React Native app can now:
-- 📱 Display reviews for hiking spots
-- ⭐ Allow users to submit ratings and comments
-- 🔄 Automatically update average ratings
-- 🔒 Ensure users can only edit their own reviews
-- 📊 Show review statistics and distributions