const { createClient } = require('@supabase/supabase-js');

// Supabase configuration with service role key to bypass RLS
const supabaseUrl = 'https://tppimfexrhptzdxlxcbj.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcGltZmV4cmhwdHpkeGx4Y2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA5MzczMywiZXhwIjoyMDczNjY5NzMzfQ.SYCLq43OaWJv-M6JH6eZonwNgApI6wJlr_pr7ROAGzM';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkTrailRoutesWithServiceRole() {
  console.log('🔍 Checking trail routes with service role...\n');

  try {
    // Get all trail routes
    const { data: routes, error: routesError } = await supabase
      .from('trail_routes')
      .select('*');

    if (routesError) {
      console.error('❌ Error fetching trail routes:', routesError);
      return;
    }

    console.log(`📊 Found ${routes ? routes.length : 0} trail routes`);
    
    if (routes && routes.length > 0) {
      console.log('📋 Available columns:', Object.keys(routes[0]));
      console.log('\n📍 All routes:');
      routes.forEach((route, index) => {
        console.log(`   ${index + 1}. ${route.name || 'Unnamed'} (Spot ID: ${route.hiking_spot_id})`);
        if (route.coordinates) {
          console.log(`      📍 Coordinates: ${route.coordinates.length} points`);
        }
      });
    } else {
      console.log('⚠️  No trail routes found');
    }

    // Also check hiking spots
    console.log('\n🏔️  Checking hiking spots...');
    const { data: spots, error: spotsError } = await supabase
      .from('hiking_spots')
      .select('hiking_spot_id, name')
      .order('hiking_spot_id');

    if (!spotsError && spots) {
      console.log(`📍 Found ${spots.length} hiking spots:`);
      spots.forEach(spot => {
        const hasRoute = routes?.some(route => route.hiking_spot_id === spot.hiking_spot_id);
        console.log(`   ${spot.hiking_spot_id}: ${spot.name} ${hasRoute ? '✅' : '❌'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTrailRoutesWithServiceRole();