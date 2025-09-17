-- =====================================================
-- STEP 4: CREATE REVIEWS TABLE
-- =====================================================
-- Run this in your Supabase SQL Editor

-- Create reviews table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_hiking_spot ON public.reviews(hiking_spot_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

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

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_reviews_updated_at ON public.reviews;
CREATE TRIGGER trigger_update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO authenticated;
GRANT USAGE ON SEQUENCE reviews_id_seq TO authenticated;