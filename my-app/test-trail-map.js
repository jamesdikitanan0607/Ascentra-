import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ixqjqfkpqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWpxZmtwcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NzE4NzAsImV4cCI6MjA1MTM0Nzg3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTrailMapWaypoints() {
  console.log('Testing TrailMap waypoints functionality...\n');
  
  try {
    // Fetch trail routes for hiking spots 75-85 (same as our debug script)
    const { data: routes, error } = await supabase
      .from('trail_routes')
      .select('*')
      .in('hiking_spot_id', [75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85])
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching routes:', error);
      return;
    }

    console.log(`Found ${routes.length} trail routes\n`);

    // Test the getRouteCoordinates logic from TrailMap.tsx
    routes.forEach((route, index) => {
      console.log(`--- Route ${index + 1}: ${route.route_name} ---`);
      console.log(`Hiking Spot ID: ${route.hiking_spot_id}`);
      console.log(`Route ID: ${route.route_id}`);
      
      // Simulate the getRouteCoordinates function logic
      let coordinates = [];
      
      // First, try to parse waypoints field (our fix)
      if (route.waypoints) {
        try {
          const waypoints = JSON.parse(route.waypoints);
          if (Array.isArray(waypoints) && waypoints.length > 0) {
            coordinates = waypoints.map((wp) => ({
              latitude: wp.latitude || wp.lat || 0,
              longitude: wp.longitude || wp.lng || 0,
            }));
            console.log(`✅ Waypoints parsed successfully: ${coordinates.length} points`);
            console.log(`First point: lat=${coordinates[0].latitude}, lng=${coordinates[0].longitude}`);
            console.log(`Last point: lat=${coordinates[coordinates.length-1].latitude}, lng=${coordinates[coordinates.length-1].longitude}`);
          }
        } catch (error) {
          console.log(`❌ Error parsing waypoints: ${error.message}`);
        }
      }
      
      // Fallback checks
      if (coordinates.length === 0) {
        if (route.geojson_path?.coordinates) {
          console.log('📍 Using geojson_path coordinates');
        } else if (route.route_coordinates && Array.isArray(route.route_coordinates)) {
          console.log('📍 Using route_coordinates');
        } else if (route.start_coordinates?.coordinates || route.end_coordinates?.coordinates) {
          console.log('📍 Using start/end coordinates');
        } else {
          console.log('⚠️  No coordinate data available');
        }
      }
      
      console.log('');
    });

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testTrailMapWaypoints();