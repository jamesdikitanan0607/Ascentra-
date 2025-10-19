const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRouteNames() {
  try {
    const { data: routes, error } = await supabase
      .from('trail_routes')
      .select('hiking_spot_id, route_name')
      .order('hiking_spot_id', { ascending: true });
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('Route names by hiking spot:');
    
    const routesBySpot = {};
    routes.forEach(route => {
      if (!routesBySpot[route.hiking_spot_id]) {
        routesBySpot[route.hiking_spot_id] = [];
      }
      routesBySpot[route.hiking_spot_id].push(route.route_name);
    });
    
    Object.keys(routesBySpot).forEach(spotId => {
      console.log(`\nHiking Spot ${spotId}:`);
      routesBySpot[spotId].forEach(routeName => {
        console.log(`  - ${routeName}`);
      });
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkRouteNames();
