const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Complete schema SQL as specified in requirements
const COMPLETE_SCHEMA_SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create spots table
CREATE TABLE IF NOT EXISTS spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create spot_images table
CREATE TABLE IF NOT EXISTS spot_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid REFERENCES spots(id) ON DELETE CASCADE,
  filename text NOT NULL,
  position int NOT NULL,
  is_thumbnail boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid REFERENCES spots(id) ON DELETE CASCADE,
  name text NOT NULL,
  difficulty text CHECK (difficulty IN ('Easy','Moderate','Advanced')) NOT NULL,
  start_lat double precision NOT NULL,
  start_lng double precision NOT NULL,
  end_lat double precision NOT NULL,
  end_lng double precision NOT NULL,
  distance_km double precision NOT NULL,
  elevation_gain_m int NOT NULL,
  duration_minutes int NOT NULL,
  highlight text,
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid REFERENCES spots(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating int CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Create weather_cache table
CREATE TABLE IF NOT EXISTS weather_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid REFERENCES spots(id) ON DELETE CASCADE,
  fetched_at timestamptz DEFAULT now(),
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE spot_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY IF NOT EXISTS "Allow public read access on spots" ON spots FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access on spot_images" ON spot_images FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access on routes" ON routes FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access on reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access on weather_cache" ON weather_cache FOR SELECT USING (true);

-- Create policies for authenticated users
CREATE POLICY IF NOT EXISTS "Allow authenticated users to insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Allow authenticated users to update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS spots_slug_idx ON spots(slug);
CREATE INDEX IF NOT EXISTS spot_images_spot_id_idx ON spot_images(spot_id);
CREATE INDEX IF NOT EXISTS routes_spot_id_idx ON routes(spot_id);
CREATE INDEX IF NOT EXISTS reviews_spot_id_idx ON reviews(spot_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON reviews(user_id);
CREATE INDEX IF NOT EXISTS weather_cache_spot_id_idx ON weather_cache(spot_id);
CREATE INDEX IF NOT EXISTS weather_cache_fetched_at_idx ON weather_cache(fetched_at);
`;

async function runCompleteMigration() {
  try {
    console.log('🚀 Starting complete database migration...');
    
    // Note: Since we can't execute raw SQL directly through the client,
    // we'll output the SQL for manual execution in Supabase dashboard
    console.log('\n📋 Please execute the following SQL in your Supabase SQL Editor:');
    console.log('=' .repeat(80));
    console.log(COMPLETE_SCHEMA_SQL);
    console.log('=' .repeat(80));
    
    console.log('\n✅ Migration SQL generated successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Copy the SQL above');
    console.log('2. Go to your Supabase dashboard > SQL Editor');
    console.log('3. Paste and execute the SQL');
    console.log('4. Run: node insert-seed-data.cjs');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runCompleteMigration();