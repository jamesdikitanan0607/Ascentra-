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
    console.log('🔄 Fixing trail_routes table schema...');
    
    // First, let's check current table structure
    console.log('📋 Current table structure check...');
    const { data: currentData, error: selectError } = await supabase
      .from('trail_routes')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.log('❌ Error accessing table:', selectError.message);
      return;
    }
    
    console.log('✅ Table exists with', Object.keys(currentData?.[0] || {}).length, 'columns');
    
    // Since we can't run DDL directly, we need to use the SQL editor in Supabase
    // Let's create a comprehensive SQL script that can be run manually
    
    const migrationSQL = `
-- Fix trail_routes table schema
-- Run this SQL in Supabase SQL Editor

-- First, backup existing data if any
CREATE TABLE IF NOT EXISTS trail_routes_backup AS SELECT * FROM trail_routes;

-- Drop the existing table
DROP TABLE IF EXISTS trail_routes CASCADE;

-- Create the corrected trail_routes table with all required columns
CREATE TABLE trail_routes (
    id BIGSERIAL PRIMARY KEY,
    route_id INTEGER UNIQUE,
    hiking_spot_id INTEGER NOT NULL,
    route_name VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('Easy', 'Moderate', 'Hard', 'Advanced')),
    start_coordinates POINT NOT NULL,
    end_coordinates POINT,
    route_coordinates JSONB,
    distance_km DECIMAL(5,2) NOT NULL,
    elevation_gain_m INTEGER NOT NULL,
    estimated_duration_hr DECIMAL(4,2) NOT NULL,
    highlights TEXT NOT NULL,
    geojson_path JSONB NOT NULL,
    route_color VARCHAR(7) DEFAULT '#FF0000',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_trail_routes_hiking_spot_id ON trail_routes (hiking_spot_id);
CREATE INDEX idx_trail_routes_route_id ON trail_routes (route_id);
CREATE INDEX idx_trail_routes_difficulty ON trail_routes (difficulty);

-- Enable Row Level Security
ALTER TABLE trail_routes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON trail_routes FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON trail_routes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON trail_routes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON trail_routes FOR DELETE USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trail_routes_updated_at BEFORE UPDATE ON trail_routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

    console.log('\n📝 MIGRATION SQL SCRIPT:');
    console.log('='.repeat(80));
    console.log(migrationSQL);
    console.log('='.repeat(80));
    
    console.log('\n🔧 MANUAL STEPS REQUIRED:');
    console.log('1. Copy the SQL script above');
    console.log('2. Go to your Supabase dashboard');
    console.log('3. Navigate to SQL Editor');
    console.log('4. Paste and run the SQL script');
    console.log('5. Come back and run the trail data population script');
    
    // Save the SQL to a file for easy access
    const fs = require('fs');
    fs.writeFileSync('trail-routes-migration.sql', migrationSQL);
    console.log('\n💾 SQL script saved to: trail-routes-migration.sql');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixTrailRoutesSchema();