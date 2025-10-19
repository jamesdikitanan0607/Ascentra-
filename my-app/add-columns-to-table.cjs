const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMissingColumns() {
  try {
    console.log('🔧 Adding missing columns to hiking_spot_routes table...');
    
    // Note: Supabase client doesn't support ALTER TABLE directly
    // We need to use the SQL editor in Supabase dashboard or use raw SQL
    
    const alterTableSQL = `
      ALTER TABLE hiking_spot_routes
      ADD COLUMN IF NOT EXISTS start_latitude DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS start_longitude DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS end_latitude DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS end_longitude DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS waypoints JSONB;
    `;
    
    console.log('📋 SQL to execute in Supabase dashboard:');
    console.log(alterTableSQL);
    
    console.log('\n⚠️ Please run this SQL in your Supabase dashboard SQL editor:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the SQL above');
    console.log('4. Click "Run"');
    
    // Test if columns exist by trying to select them
    try {
      const { data, error } = await supabase
        .from('hiking_spot_routes')
        .select('start_latitude, start_longitude, end_latitude, end_longitude, waypoints')
        .limit(1);
      
      if (!error) {
        console.log('✅ Columns already exist or were added successfully!');
        return true;
      } else {
        console.log('❌ Columns still missing:', error.message);
        return false;
      }
    } catch (e) {
      console.log('❌ Columns still missing:', e.message);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

addMissingColumns();
