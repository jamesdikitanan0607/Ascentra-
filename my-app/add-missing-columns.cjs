const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMissingColumns() {
  console.log('🔄 Adding missing columns to trail_routes table...');
  
  const alterTableSQL = `
    -- Add missing columns to trail_routes table
    ALTER TABLE trail_routes 
    ADD COLUMN IF NOT EXISTS hiking_spot_id INTEGER,
    ADD COLUMN IF NOT EXISTS route_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50),
    ADD COLUMN IF NOT EXISTS distance_km DECIMAL(5,2),
    ADD COLUMN IF NOT EXISTS elevation_gain_m INTEGER,
    ADD COLUMN IF NOT EXISTS estimated_duration_hr DECIMAL(4,2),
    ADD COLUMN IF NOT EXISTS highlights TEXT,
    ADD COLUMN IF NOT EXISTS geojson_path JSONB,
    ADD COLUMN IF NOT EXISTS route_color VARCHAR(7) DEFAULT '#FF0000',
    ADD COLUMN IF NOT EXISTS start_coordinates POINT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    -- Add constraints
    ALTER TABLE trail_routes 
    ADD CONSTRAINT IF NOT EXISTS fk_hiking_spot 
    FOREIGN KEY (hiking_spot_id) REFERENCES hiking_spots(hiking_spot_id) ON DELETE CASCADE;
    
    -- Add check constraint for difficulty
    ALTER TABLE trail_routes 
    ADD CONSTRAINT IF NOT EXISTS check_difficulty 
    CHECK (difficulty IN ('Easy', 'Moderate', 'Hard', 'Advanced'));
  `;
  
  console.log('SQL to execute:');
  console.log(alterTableSQL);
  console.log('\n⚠️  Please run this SQL manually in your Supabase SQL editor.');
  console.log('\n📝 Steps:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste the SQL above');
  console.log('4. Click "Run" to execute');
  console.log('5. Then run the populate script again');
}

addMissingColumns().catch(console.error);