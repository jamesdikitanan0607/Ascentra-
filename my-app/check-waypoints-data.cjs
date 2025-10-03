const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function checkWaypointsData() {
  try {
    console.log('🔍 Checking current waypoints data...\n');

    // Get a sample of trail routes to examine waypoints
    const { data: routes, error } = await supabase
      .from('trail_routes')
      .select('route_id, name, hiking_spot_id, waypoints')
      .limit(10);

    if (error) {
      console.error('❌ Error fetching routes:', error.message);
      return;
    }

    console.log(`📊 Found ${routes.length} sample routes\n`);

    routes.forEach((route, index) => {
      console.log(`Route ${index + 1}: ${route.name} (Spot ID: ${route.hiking_spot_id})`);
      console.log(`  Route ID: ${route.route_id}`);
      
      try {
        const waypoints = JSON.parse(route.waypoints || '[]');
        console.log(`  Waypoints count: ${waypoints.length}`);
        
        if (waypoints.length > 0) {
          console.log(`  First waypoint:`, waypoints[0]);
          if (waypoints.length > 1) {
            console.log(`  Last waypoint:`, waypoints[waypoints.length - 1]);
          }
        }
        
        // Waypoints should contain start and end coordinates
      } catch (parseError) {
        console.log(`  ❌ Error parsing waypoints: ${parseError.message}`);
      }
      
      console.log('');
    });

    // Check if we have proper trail paths vs just start/end points
    const routesWithMinimalWaypoints = routes.filter(route => {
      try {
        const waypoints = JSON.parse(route.waypoints || '[]');
        return waypoints.length <= 2; // Only start and end
      } catch {
        return true;
      }
    });

    console.log(`\n📈 Analysis:`);
    console.log(`  Routes with minimal waypoints (≤2): ${routesWithMinimalWaypoints.length}/${routes.length}`);
    console.log(`  This indicates we need to create proper trail paths with intermediate waypoints\n`);

    // Check total routes per hiking spot
    const { data: allRoutes, error: allError } = await supabase
      .from('trail_routes')
      .select('hiking_spot_id')
      .order('hiking_spot_id');

    if (!allError) {
      const routesBySpot = allRoutes.reduce((acc, route) => {
        acc[route.hiking_spot_id] = (acc[route.hiking_spot_id] || 0) + 1;
        return acc;
      }, {});

      console.log(`📊 Total routes by hiking spot:`);
      Object.entries(routesBySpot).forEach(([spotId, count]) => {
        console.log(`  Spot ${spotId}: ${count} routes`);
      });
    }

  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
}

checkWaypointsData();