const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please check your .env file for:');
  console.log('- EXPO_PUBLIC_SUPABASE_URL');
  console.log('- EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTrailRoutes() {
  try {
    console.log('🔍 Checking current trail routes in database...');
    
    // Check hiking spots
    const { data: spots, error: spotsError } = await supabase
      .from('hiking_spots')
      .select('id, name')
      .order('name');
    
    if (spotsError) {
      console.error('❌ Error fetching hiking spots:', spotsError);
      return;
    }
    
    console.log(`📍 Found ${spots?.length || 0} hiking spots`);
    
    // Check trail routes
    const { data: routes, error: routesError } = await supabase
      .from('trail_routes')
      .select('route_id, hiking_spot_id, route_name, difficulty')
      .order('hiking_spot_id');
    
    if (routesError) {
      console.error('❌ Error fetching trail routes:', routesError);
      return;
    }
    
    console.log(`🛤️  Found ${routes?.length || 0} trail routes`);
    
    // Group routes by hiking spot
    const routesBySpot = {};
    routes?.forEach(route => {
      if (!routesBySpot[route.hiking_spot_id]) {
        routesBySpot[route.hiking_spot_id] = [];
      }
      routesBySpot[route.hiking_spot_id].push(route);
    });
    
    console.log('\n📊 Trail Routes Summary:');
    spots?.forEach(spot => {
      const spotRoutes = routesBySpot[spot.id] || [];
      console.log(`  ${spot.name}: ${spotRoutes.length} routes`);
      if (spotRoutes.length > 0) {
        spotRoutes.forEach(route => {
          console.log(`    - ${route.route_name} (${route.difficulty})`);
        });
      }
    });
    
    // Calculate missing routes
    const totalExpected = (spots?.length || 0) * 5;
    const totalActual = routes?.length || 0;
    const missing = totalExpected - totalActual;
    
    console.log(`\n📈 Statistics:`);
    console.log(`  Expected: ${totalExpected} routes (5 per spot)`);
    console.log(`  Actual: ${totalActual} routes`);
    console.log(`  Missing: ${missing} routes`);
    
    if (missing > 0) {
      console.log('\n⚠️  Need to create missing trail routes!');
    } else {
      console.log('\n✅ All trail routes are present!');
    }
    
  } catch (error) {
    console.error('❌ Error checking trail routes:', error);
  }
}

checkTrailRoutes();