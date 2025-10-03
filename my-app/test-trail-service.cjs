const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Simulate the TrailService.getAllTrails() method
async function testGetAllTrails() {
  try {
    console.log('🧪 Testing TrailService.getAllTrails() simulation...');
    
    // Fetch trail routes with hiking spot data (same as TrailService)
    const { data: trailRoutes, error } = await supabase
      .from('trail_routes')
      .select(`
        *,
        hiking_spots (
          hiking_spot_id,
          name,
          latitude,
          longitude,
          description,
          cover_image_url,
          average_rating,
          number_of_reviews
        )
      `)
      .order('hiking_spot_id')
      .order('route_name');

    if (error) {
      console.error('❌ Error fetching trail routes:', error.message);
      return;
    }

    console.log(`✅ Successfully fetched ${trailRoutes.length} trail routes`);
    
    // Group by hiking spot (simulate transformTrailData)
    const trailsBySpot = {};
    trailRoutes.forEach(route => {
      const spotId = route.hiking_spot_id;
      if (!trailsBySpot[spotId]) {
        trailsBySpot[spotId] = {
          spot: route.hiking_spots,
          routes: []
        };
      }
      trailsBySpot[spotId].routes.push(route);
    });
    
    console.log('\n📊 Routes by hiking spot:');
    Object.entries(trailsBySpot).forEach(([spotId, data]) => {
      console.log(`   ${data.spot.name} (ID ${spotId}): ${data.routes.length} routes`);
    });
    
    // Test specific hiking spot lookup (Mount Babag - ID 71)
    console.log('\n🔍 Testing specific hiking spot lookup (Mount Babag - ID 71)...');
    const { data: babagRoutes, error: babagError } = await supabase
      .from('trail_routes')
      .select('*')
      .eq('hiking_spot_id', 71);
    
    if (babagError) {
      console.error('❌ Error fetching Mount Babag routes:', babagError.message);
    } else {
      console.log(`✅ Found ${babagRoutes.length} routes for Mount Babag:`);
      babagRoutes.forEach(route => {
        console.log(`   - ${route.route_name} (${route.difficulty})`);
      });
    }
    
    console.log('\n🎯 TrailService test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGetAllTrails();