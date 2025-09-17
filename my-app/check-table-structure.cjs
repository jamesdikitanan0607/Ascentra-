const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('Checking trail_routes table structure...');
  
  // Try different approaches to understand the table structure
  const testFields = [
    'id',
    'route_id', 
    'hiking_spot_id',
    'route_name',
    'difficulty',
    'distance_km',
    'elevation_gain_m',
    'estimated_duration_hr',
    'highlights',
    'geojson_path',
    'route_color',
    'start_coordinates',
    'created_at',
    'updated_at'
  ];
  
  for (const field of testFields) {
    try {
      const { error } = await supabase
        .from('trail_routes')
        .insert({ [field]: 'test' });
      
      if (error) {
        if (error.message.includes('Could not find')) {
          console.log(`❌ Column '${field}' does NOT exist`);
        } else {
          console.log(`✅ Column '${field}' exists (error: ${error.message.substring(0, 50)}...)`);
        }
      } else {
        console.log(`✅ Column '${field}' exists and accepts data`);
        // Clean up the test record
        await supabase.from('trail_routes').delete().eq(field, 'test');
      }
    } catch (err) {
      console.log(`? Column '${field}' - unexpected error:`, err.message);
    }
  }
}

checkTableStructure().catch(console.error);