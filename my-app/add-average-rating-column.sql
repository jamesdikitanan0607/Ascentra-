-- Add average_rating column to hiking_spots table
ALTER TABLE hiking_spots 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5);

-- Add index for faster queries on average_rating
CREATE INDEX IF NOT EXISTS idx_hiking_spots_average_rating ON hiking_spots(average_rating DESC);

-- Update existing hiking spots to have 0 average rating initially
UPDATE hiking_spots SET average_rating = 0.00 WHERE average_rating IS NULL;

COMMIT;