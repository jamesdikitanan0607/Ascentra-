require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTrailRoutesSchema() {
  try {
    console.log('🔧 Fixing trail_routes table schema...');
    
    // First, drop the existing trail_routes table if it exists
    console.log('Dropping existing trail_routes table...');
    const { error: dropError } = await supabase.rpc('exec', {
      query: 'DROP TABLE IF EXISTS trail_routes CASCADE;'
    });
    
    if (dropError && !dropError.message.includes('function public.exec')) {
      console.log('Note: Could not drop table via RPC, may need manual intervention');
    }
    
    // Create the corrected trail_routes table
    console.log('Creating corrected trail_routes table...');
    
    // Since we can't use RPC, let's try direct table operations
    // First check if we can create via insert (this will fail but show us the structure)
    const testInsert = {
      hiking_spot_id: '84d144a2-8ce6-40ca-aa11-bf09fca2ec3a', // UUID from hiking_spots
      route_name: 'Test Route',
      difficulty: 'Easy',
      start_coordinates: '10.3157, 123.8854',
      distance_km: 1.0,
      elevation_gain_m: 100,
      estimated_duration_hr: 1.0,
      highlights: 'Test highlights',
      route_color: '#FF0000',
      geojson_path: {}
    };
    
    const { data, error } = await supabase
      .from('trail_routes')
      .insert(testInsert)
      .select();
    
    if (error) {
      console.log('❌ Insert error (expected):', error.message);
      console.log('This confirms the schema mismatch.');
      console.log('');
      console.log('🔧 MANUAL FIX REQUIRED:');
      console.log('Please run this SQL in Supabase SQL Editor:');
      console.log('');
      console.log('-- Drop existing trail_routes table');
      console.log('DROP TABLE IF EXISTS trail_routes CASCADE;');
      console.log('');
      console.log('-- Create corrected trail_routes table');
      console.log('CREATE TABLE trail_routes (');
      console.log('    route_id SERIAL PRIMARY KEY,');
      console.log('    hiking_spot_id UUID NOT NULL REFERENCES hiking_spots(id) ON DELETE CASCADE,');
      console.log('    route_name VARCHAR(255) NOT NULL,');
      console.log('    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN (\'Easy\', \'Moderate\', \'Hard\', \'Advanced\')),');
      console.log('    start_coordinates TEXT NOT NULL,');
      console.log('    distance_km DECIMAL(5,2) NOT NULL,');
      console.log('    elevation_gain_m INTEGER NOT NULL,');
      console.log('    estimated_duration_hr DECIMAL(4,2) NOT NULL,');
      console.log('    highlights TEXT NOT NULL,');
      console.log('    geojson_path JSONB,');
      console.log('    route_color VARCHAR(7) DEFAULT \'#FF0000\',');
      console.log('    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
      console.log('    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
      console.log(');');
      console.log('');
      console.log('-- Create index');
      console.log('CREATE INDEX idx_trail_routes_hiking_spot_id ON trail_routes (hiking_spot_id);');
      console.log('');
      console.log('-- Enable RLS');
      console.log('ALTER TABLE trail_routes ENABLE ROW LEVEL SECURITY;');
      console.log('');
      console.log('-- Create RLS policies');
      console.log('CREATE POLICY "Enable read access for all users" ON trail_routes FOR SELECT USING (true);');
      console.log('CREATE POLICY "Enable insert for authenticated users only" ON trail_routes FOR INSERT WITH CHECK (auth.role() = \'authenticated\');');
      console.log('CREATE POLICY "Enable update for authenticated users only" ON trail_routes FOR UPDATE USING (auth.role() = \'authenticated\');');
      console.log('');
    } else {
      console.log('✅ Trail routes table is working correctly!');
      console.log('Inserted test route:', data);
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

fixTrailRoutesSchema();