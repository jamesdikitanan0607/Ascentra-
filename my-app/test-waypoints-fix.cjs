const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables:');
  console.error('Required: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simulate the getTrailCoordinates function from TrailContext
function getTrailCoordinates(trail) {
  console.log(`\n=== Testing getTrailCoordinates for: ${trail.name} ===`);
  
  // Priority 1: Parse waypoints JSON data (this is where the actual trail path is stored)
  if (trail.waypoints) {
    try {
      console.log('Raw waypoints string:', trail.waypoints.substring(0, 100) + '...');
      const waypoints = JSON.parse(trail.waypoints);
      console.log(`Parsed waypoints count: ${waypoints.length}`);
      
      if (Array.isArray(waypoints) && waypoints.length > 0) {
        const coordinates = waypoints.map((waypoint, index) => {
          const coord = {
            latitude: waypoint.latitude || waypoint.lat,
            longitude: waypoint.longitude || waypoint.lng,
          };
          if (index < 3 || index >= waypoints.length - 3) {
            console.log(`Waypoint ${index + 1}:`, coord);
          } else if (index === 3) {
            console.log('... (middle waypoints omitted) ...');
          }
          return coord;
        }).filter((coord) => coord.latitude && coord.longitude);
        
        console.log(`✅ Successfully processed ${coordinates.length} waypoints`);
        return coordinates;
      }
    } catch (error) {
      console.log('❌ Failed to parse waypoints JSON:', error.message);
    }
  }
  
  console.log('⚠️ No valid waypoints found, checking fallbacks...');
  
  // Priority 2: Use route_coordinates if available
  if (trail.route_coordinates && trail.route_coordinates.length > 0) {
    console.log(`✅ Using route_coordinates: ${trail.route_coordinates.length} points`);
    return trail.route_coordinates;
  }
  
  console.log('❌ No coordinates found');
  return [];
}

async function testWaypointsProcessing() {
  try {
    console.log('🧪 Testing waypoints processing after fix...\n');
    
    // Get a few sample routes to test
    const { data: routes, error } = await supabase
      .from('trail_routes')
      .select('route_id, name, hiking_spot_id, waypoints')
      .limit(3);
    
    if (error) {
      console.error('❌ Error fetching routes:', error);
      return;
    }
    
    if (!routes || routes.length === 0) {
      console.log('❌ No routes found in database');
      return;
    }
    
    console.log(`📊 Testing ${routes.length} routes:\n`);
    
    for (const route of routes) {
      const coordinates = getTrailCoordinates(route);
      
      if (coordinates.length > 0) {
        console.log(`✅ Route "${route.name}" has ${coordinates.length} coordinates`);
        console.log(`   First: ${coordinates[0].latitude}, ${coordinates[0].longitude}`);
        console.log(`   Last: ${coordinates[coordinates.length - 1].latitude}, ${coordinates[coordinates.length - 1].longitude}`);
      } else {
        console.log(`❌ Route "${route.name}" has no coordinates`);
      }
      
      console.log('─'.repeat(60));
    }
    
    console.log('\n🎯 Summary:');
    const successfulRoutes = routes.filter(route => getTrailCoordinates(route).length > 0);
    console.log(`✅ ${successfulRoutes.length}/${routes.length} routes have valid coordinates`);
    
    if (successfulRoutes.length === routes.length) {
      console.log('🎉 All routes are working correctly!');
    } else {
      console.log('⚠️ Some routes need attention');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWaypointsProcessing();