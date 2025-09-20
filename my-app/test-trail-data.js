import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ixcfqjqfqjqfqjqfqjqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y2ZxanFmcWpxZnFqcWZxanFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MzQ0MDAsImV4cCI6MjA1MTMxMDQwMH0.example';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTrailData() {
  console.log('🔍 Testing trail routes data structure...');
  
  try {
    // Fetch a sample trail route to see the actual data structure
    const { data, error } = await supabase
      .from('trail_routes')
      .select('*')
      .eq('hiking_spot_id', '75')
      .limit(1);

    if (error) {
      console.error('❌ Error fetching trail data:', error);
      return;
    }

    if (data && data.length > 0) {
      const route = data[0];
      console.log('📊 Sample trail route data:');
      console.log('ID:', route.id);
      console.log('Name:', route.name);
      console.log('Hiking Spot ID:', route.hiking_spot_id);
      console.log('Waypoints type:', typeof route.waypoints);
      console.log('Waypoints content:', route.waypoints);
      
      // Try to parse waypoints
      if (route.waypoints) {
        try {
          const parsed = JSON.parse(route.waypoints);
          console.log('✅ Parsed waypoints:', parsed);
          console.log('Waypoints structure:', Array.isArray(parsed) ? 'Array' : 'Object');
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('First waypoint:', parsed[0]);
          }
        } catch (parseError) {
          console.error('❌ Error parsing waypoints:', parseError);
        }
      }
      
      console.log('\n📍 All fields in route:');
      Object.keys(route).forEach(key => {
        console.log(`${key}: ${typeof route[key]} = ${route[key]}`);
      });
    } else {
      console.log('❌ No trail routes found for hiking spot 75');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testTrailData();