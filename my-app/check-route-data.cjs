const { createClient } = require('@supabase/supabase-js');

// Supabase configuration with service role key
const supabaseUrl = 'https://tppimfexrhptzdxlxcbj.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcGltZmV4cmhwdHpkeGx4Y2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA5MzczMywiZXhwIjoyMDczNjY5NzMzfQ.SYCLq43OaWJv-M6JH6eZonwNgApI6wJlr_pr7ROAGzM';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkRouteData() {
  console.log('🔍 Checking trail route data structure...\n');

  try {
    // Get a few sample routes to see the data structure
    const { data: routes, error: routesError } = await supabase
      .from('trail_routes')
      .select('*')
      .eq('hiking_spot_id', 71)
      .limit(2);

    if (routesError) {
      console.error('❌ Error fetching trail routes:', routesError);
      return;
    }

    if (routes && routes.length > 0) {
      console.log('📋 Sample route data:');
      routes.forEach((route, index) => {
        console.log(`\n--- Route ${index + 1} ---`);
        console.log('ID:', route.id);
        console.log('Route ID:', route.route_id);
        console.log('Hiking Spot ID:', route.hiking_spot_id);
        console.log('Route Name:', route.route_name || 'Unnamed');
        console.log('Difficulty:', route.difficulty);
        console.log('Distance:', route.distance_km);
        console.log('Elevation Gain:', route.elevation_gain_m);
        console.log('Duration:', route.estimated_duration_hr);
        
        // Check coordinate fields
        console.log('\n📍 Coordinate Fields:');
        console.log('Start Coordinates:', route.start_coordinates ? 'Present' : 'Missing');
        console.log('End Coordinates:', route.end_coordinates ? 'Present' : 'Missing');
        console.log('Route Coordinates:', route.route_coordinates ? 'Present' : 'Missing');
        console.log('GeoJSON Path:', route.geojson_path || 'Missing');
        
        if (route.start_coordinates) {
          console.log('Start Coords Data:', route.start_coordinates);
        }
        if (route.end_coordinates) {
          console.log('End Coords Data:', route.end_coordinates);
        }
        if (route.route_coordinates) {
          console.log('Route Coords Type:', typeof route.route_coordinates);
          console.log('Route Coords Length:', Array.isArray(route.route_coordinates) ? route.route_coordinates.length : 'Not an array');
        }
      });
    } else {
      console.log('⚠️  No routes found for hiking spot 71');
    }

    // Check how many routes have coordinate data
    const { data: allRoutes, error: allError } = await supabase
      .from('trail_routes')
      .select('id, hiking_spot_id, start_coordinates, end_coordinates, route_coordinates');

    if (!allError && allRoutes) {
      let withStart = 0;
      let withEnd = 0;
      let withRoute = 0;
      
      allRoutes.forEach(route => {
        if (route.start_coordinates) withStart++;
        if (route.end_coordinates) withEnd++;
        if (route.route_coordinates) withRoute++;
      });
      
      console.log('\n📊 Coordinate Data Summary:');
      console.log(`Total routes: ${allRoutes.length}`);
      console.log(`Routes with start coordinates: ${withStart}`);
      console.log(`Routes with end coordinates: ${withEnd}`);
      console.log(`Routes with route coordinates: ${withRoute}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkRouteData();