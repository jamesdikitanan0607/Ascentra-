const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testRouteMatching() {
  try {
    console.log('🧪 Testing route matching with updated IDs...');
    
    // Test 1: Check if hiking spots 71-85 exist in database
    console.log('\n📍 Test 1: Checking hiking spots in database...');
    const { data: spots, error: spotsError } = await supabase
      .from('hiking_spots')
      .select('hiking_spot_id, name')
      .order('hiking_spot_id');
    
    if (spotsError) {
      console.error('❌ Error fetching hiking spots:', spotsError.message);
      return;
    }
    
    console.log(`✅ Found ${spots.length} hiking spots in database:`);
    spots.forEach(spot => {
      console.log(`   ID ${spot.hiking_spot_id}: ${spot.name}`);
    });
    
    // Test 2: Check trail routes for each hiking spot
    console.log('\n🛤️  Test 2: Checking trail routes for each hiking spot...');
    for (const spot of spots) {
      const { data: routes, error: routesError } = await supabase
        .from('trail_routes')
        .select('route_id, route_name, difficulty')
        .eq('hiking_spot_id', spot.hiking_spot_id);
      
      if (routesError) {
        console.error(`❌ Error fetching routes for spot ${spot.hiking_spot_id}:`, routesError.message);
        continue;
      }
      
      console.log(`   ${spot.name} (ID ${spot.hiking_spot_id}): ${routes.length} routes`);
      if (routes.length !== 5) {
        console.warn(`   ⚠️  Expected 5 routes, found ${routes.length}`);
      }
    }
    
    // Test 3: Test specific route lookup (simulate what the app does)
    console.log('\n🔍 Test 3: Testing specific route lookup...');
    const testSpotId = 71; // Mount Babag
    const testRouteId = 1;  // First route
    
    const { data: testRoute, error: testError } = await supabase
      .from('trail_routes')
      .select('*')
      .eq('hiking_spot_id', testSpotId)
      .eq('route_id', testRouteId)
      .single();
    
    if (testError) {
      console.error(`❌ Error fetching test route (spot ${testSpotId}, route ${testRouteId}):`, testError.message);
    } else {
      console.log(`✅ Successfully found route: ${testRoute.route_name}`);
      console.log(`   Difficulty: ${testRoute.difficulty}`);
      console.log(`   Distance: ${testRoute.distance_km}km`);
      console.log(`   Elevation: ${testRoute.elevation_gain_m}m`);
    }
    
    // Test 4: Count total routes
    console.log('\n📊 Test 4: Counting total routes...');
    const { count, error: countError } = await supabase
      .from('trail_routes')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting routes:', countError.message);
    } else {
      console.log(`✅ Total routes in database: ${count}`);
      if (count === 75) {
        console.log('✅ Perfect! Expected 75 routes (15 spots × 5 routes each)');
      } else {
        console.warn(`⚠️  Expected 75 routes, found ${count}`);
      }
    }
    
    console.log('\n🎯 Route matching test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRouteMatching();