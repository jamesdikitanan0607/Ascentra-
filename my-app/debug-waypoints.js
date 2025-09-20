import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tppimfexrhptzdxlxcbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcGltZmV4cmhwdHpkeGx4Y2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTM3MzMsImV4cCI6MjA3MzY2OTczM30.sQCNoudMxCodsGqNespKTBrH0i34c71eyzYDrSzyz78';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugWaypoints() {
  try {
    console.log('Fetching trail routes for hiking spots 75-85...');
    
    const { data: routes, error } = await supabase
      .from('trail_routes')
      .select('*')
      .gte('hiking_spot_id', 75)
      .lte('hiking_spot_id', 85)
      .limit(3);

    if (error) {
      console.error('Error fetching routes:', error);
      return;
    }

    console.log(`Found ${routes.length} routes`);
    
    routes.forEach((route, index) => {
      console.log(`\n--- Route ${index + 1} ---`);
      console.log('ID:', route.id);
      console.log('Hiking Spot ID:', route.hiking_spot_id);
      console.log('Name:', route.name);
      console.log('Length:', route.length, typeof route.length);
      console.log('Estimated Time:', route.estimated_time, typeof route.estimated_time);
      console.log('Waypoints type:', typeof route.waypoints);
      console.log('Waypoints raw:', route.waypoints);
      
      if (route.waypoints) {
        try {
          const parsed = JSON.parse(route.waypoints);
          console.log('Waypoints parsed:', parsed);
          console.log('Waypoints structure:', Array.isArray(parsed) ? 'Array' : 'Object');
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('First waypoint:', parsed[0]);
            console.log('First waypoint keys:', Object.keys(parsed[0]));
          }
        } catch (parseError) {
          console.log('Waypoints parse error:', parseError.message);
        }
      }
    });
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

debugWaypoints();