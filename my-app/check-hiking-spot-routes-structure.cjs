const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  try {
    console.log('🔍 Checking hiking_spot_routes table structure...');
    
    const { data, error } = await supabase
      .from('hiking_spot_routes')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('📊 Table columns:');
      Object.keys(data[0]).forEach(column => {
        console.log(`  - ${column}: ${typeof data[0][column]}`);
      });
    } else {
      console.log('📊 Table is empty, checking with describe...');
    }
    
    // Also check if we can insert a test record to see what columns are expected
    console.log('\n🧪 Testing insert to see required columns...');
    const testData = {
      hiking_spot_id: 999,
      route_name: 'Test Route',
      difficulty: 'Easy',
      distance: 1.0,
      elevation_gain: 100,
      estimated_duration_minutes: 60,
      route_features: 'Test',
      route_description: 'Test route',
      start_latitude: 10.0,
      start_longitude: 123.0,
      end_latitude: 10.1,
      end_longitude: 123.1,
      waypoints: []
    };
    
    const { error: insertError } = await supabase
      .from('hiking_spot_routes')
      .insert([testData]);
    
    if (insertError) {
      console.log('Insert error (this helps us see what columns exist):', insertError.message);
    } else {
      console.log('✅ Test insert successful');
      
      // Clean up test data
      await supabase
        .from('hiking_spot_routes')
        .delete()
        .eq('hiking_spot_id', 999);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkTableStructure();
