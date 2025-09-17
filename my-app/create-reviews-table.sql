-- Create reviews table for hiking spot reviews
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_hiking_spot_id ON reviews(hiking_spot_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reviews_updated_at_trigger
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

-- Create function to calculate average rating for hiking spots
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

-- Create function to update hiking_spots average_rating when reviews change
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

-- Create triggers to update hiking spot rating when reviews change
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

-- Grant necessary permissions
GRANT ALL ON reviews TO authenticated;
GRANT ALL ON reviews TO anon;

COMMIT;