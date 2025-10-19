const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTrailRoutes() {
  try {
    console.log('Checking trail routes for the new hiking spots...');
    
    // Check trail routes for our specific new hiking spots (IDs: 52, 53, 54, 55, 56)
    const newSpotIds = [52, 53, 54, 55, 56];
    const { data: routes, error: routesError } = await supabase
      .from('trail_routes')
      .select('route_id, hiking_spot_id, name, difficulty, length, elevation_gain, estimated_time')
      .in('hiking_spot_id', newSpotIds)
      .order('hiking_spot_id, name');
    
    if (routesError) {
      console.error('Error fetching routes:', routesError);
      return;
    }
    
    console.log('Trail routes found:', routes.length);
    
    const mountainNames = {
      52: 'Mount Lanaya (Alegria, Cebu)',
      53: 'Mount Lantoy (Argao, Cebu)', 
      54: 'Mount Kapayas (Catmon, Cebu)',
      55: 'Lugsangan Peak (Ginatilan, Cebu)',
      56: 'Mount Mauyog (Balamban, Cebu)'
    };
    
    const routesBySpot = {};
    routes.forEach(route => {
      const spotId = route.hiking_spot_id;
      if (!routesBySpot[spotId]) {
        routesBySpot[spotId] = [];
      }
      routesBySpot[spotId].push(route);
    });
    
    console.log('\n=== TRAIL ROUTES FOR NEW MOUNTAINS ===');
    newSpotIds.forEach(spotId => {
      const spotRoutes = routesBySpot[spotId] || [];
      console.log('\n' + mountainNames[spotId] + ' (' + spotRoutes.length + ' routes):');
      spotRoutes.forEach(route => {
        const hours = Math.floor(route.estimated_time / 60);
        const minutes = route.estimated_time % 60;
        const timeStr = hours > 0 ? hours + 'h' + (minutes > 0 ? ' ' + minutes + 'm' : '') : minutes + 'm';
        console.log('  - ' + route.name + ' (' + route.difficulty + ') - ' + route.length + 'km, +' + route.elevation_gain + 'm, ' + timeStr);
      });
    });
    
    console.log('\n=== SUMMARY ===');
    console.log('Total trail routes added for new mountains:', routes.length);
    console.log('Expected: 25 routes (5 per mountain)');
    console.log('Status:', routes.length === 25 ? 'SUCCESS - All routes added!' : 'INCOMPLETE - Missing routes');
    
  } catch (error) {
    console.error('Error checking trail routes:', error);
  }
}

checkTrailRoutes();