import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupReviewsTable() {
  try {
    console.log('Setting up reviews table and average rating column...');
    console.log('Note: Since we cannot execute DDL statements directly through the client,');
    console.log('please run the following SQL commands in your Supabase SQL Editor:');
    console.log('');
    
    const sqlCommands = `
-- Add average_rating column to hiking_spots table
ALTER TABLE hiking_spots 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5);

CREATE INDEX IF NOT EXISTS idx_hiking_spots_average_rating ON hiking_spots(average_rating DESC);

UPDATE hiking_spots SET average_rating = 0.00 WHERE average_rating IS NULL;

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hiking_spot_id UUID NOT NULL REFERENCES hiking_spots(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL CHECK (length(comment) >= 10 AND length(comment) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, hiking_spot_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_hiking_spot_id ON reviews(hiking_spot_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Allow read access to all reviews" ON reviews;
CREATE POLICY "Allow read access to all reviews" ON reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users to insert their own reviews" ON reviews;
CREATE POLICY "Allow users to insert their own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own reviews" ON reviews;
CREATE POLICY "Allow users to update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own reviews" ON reviews;
CREATE POLICY "Allow users to delete their own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_reviews_updated_at_trigger ON reviews;
CREATE TRIGGER update_reviews_updated_at_trigger
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

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

CREATE OR REPLACE FUNCTION update_hiking_spot_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE hiking_spots 
  SET average_rating = calculate_hiking_spot_average_rating(
    COALESCE(NEW.hiking_spot_id, OLD.hiking_spot_id)
  )
  WHERE id = COALESCE(NEW.hiking_spot_id, OLD.hiking_spot_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_hiking_spot_rating_on_insert ON reviews;
CREATE TRIGGER update_hiking_spot_rating_on_insert
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_hiking_spot_rating();

DROP TRIGGER IF EXISTS update_hiking_spot_rating_on_update ON reviews;
CREATE TRIGGER update_hiking_spot_rating_on_update
  AFTER UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_hiking_spot_rating();

DROP TRIGGER IF EXISTS update_hiking_spot_rating_on_delete ON reviews;
CREATE TRIGGER update_hiking_spot_rating_on_delete
  AFTER DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_hiking_spot_rating();
`;
    
    console.log(sqlCommands);
    console.log('');
    console.log('After running the SQL commands above, the reviews system will be ready.');
    console.log('You can copy and paste the SQL commands into the Supabase SQL Editor.');
    
    // Try to verify if reviews table exists by attempting a simple query
    console.log('\nTesting database connection...');
    const { data: hikingSpots, error: testError } = await supabase
      .from('hiking_spots')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('Database connection test failed:', testError);
    } else {
      console.log('✓ Database connection successful');
    }
    
  } catch (error) {
    console.error('Error in setup script:', error);
    process.exit(1);
  }
}

setupReviewsTable();