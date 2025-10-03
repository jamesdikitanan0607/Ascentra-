const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Simulate the TrailService.getAllTrails() method exactly
async function testAllRoutesLoad() {
  try {
    console.log('🧪 Testing if all 75 routes load correctly...');
    
    // Step 1: Fetch trails from database (same as TrailService)
    console.log('\n📊 Step 1: Fetching trail routes...');
    const { data: trails, error: trailsError } = await supabase
      .from('trail_routes')
      .select('*')
      .order('hiking_spot_id', { ascending: true })
      .order('route_name', { ascending: true });

    if (trailsError) {
      console.error('❌ Error fetching trails:', trailsError.message);
      return;
    }

    console.log(`✅ Fetched ${trails.length} trail routes from database`);

    // Step 2: Fetch hiking spots (same as TrailService)
    console.log('\n📍 Step 2: Fetching hiking spots...');
    const { data: spots, error: spotsError } = await supabase
      .from('hiking_spots')
      .select('*')
      .order('name', { ascending: true });

    if (spotsError) {
      console.error('❌ Error fetching hiking spots:', spotsError.message);
      return;
    }

    console.log(`✅ Fetched ${spots.length} hiking spots from database`);

    // Step 3: Create spots map (same as TrailService)
    console.log('\n🗺️  Step 3: Creating spots map...');
    const spotsMap = new Map();
    spots?.forEach(spot => {
      spotsMap.set(spot.hiking_spot_id, spot);
    });

    console.log(`✅ Created spots map with ${spotsMap.size} entries`);

    // Step 4: Transform data (simulate transformTrailData)
    console.log('\n🔄 Step 4: Transforming trail data...');
    const allTrails = [];
    let successCount = 0;
    let errorCount = 0;

    trails?.forEach(trail => {
      const spot = spotsMap.get(trail.hiking_spot_id);
      if (spot) {
        // Simulate basic transformation
        const transformedTrail = {
          id: trail.route_id || trail.id,
          route_id: trail.route_id,
          name: trail.route_name,
          difficulty: trail.difficulty,
          length: trail.distance_km,
          elevation_gain: trail.elevation_gain_m,
          estimated_time: trail.estimated_duration_hr * 60, // Convert to minutes
          hiking_spot: {
            hiking_spot_id: spot.hiking_spot_id,
            name: spot.name,
            latitude: spot.latitude,
            longitude: spot.longitude
          }
        };
        allTrails.push(transformedTrail);
        successCount++;
      } else {
        console.warn(`⚠️  No hiking spot found for trail ${trail.route_name} (spot_id: ${trail.hiking_spot_id})`);
        errorCount++;
      }
    });

    console.log(`✅ Successfully transformed ${successCount} trails`);
    if (errorCount > 0) {
      console.warn(`⚠️  Failed to transform ${errorCount} trails`);
    }

    // Step 5: Analyze results
    console.log('\n📈 Step 5: Analysis Results:');
    console.log(`   Total trails in database: ${trails.length}`);
    console.log(`   Total hiking spots: ${spots.length}`);
    console.log(`   Successfully loaded trails: ${allTrails.length}`);
    console.log(`   Expected: 75 trails (15 spots × 5 routes each)`);

    if (allTrails.length === 75) {
      console.log('🎉 SUCCESS! All 75 routes loaded correctly!');
    } else {
      console.warn(`⚠️  Expected 75 routes, got ${allTrails.length}`);
    }

    // Step 6: Group by hiking spot to verify distribution
    console.log('\n📊 Step 6: Routes per hiking spot:');
    const routesBySpot = {};
    allTrails.forEach(trail => {
      const spotName = trail.hiking_spot.name;
      if (!routesBySpot[spotName]) {
        routesBySpot[spotName] = [];
      }
      routesBySpot[spotName].push(trail.name);
    });

    Object.entries(routesBySpot).forEach(([spotName, routes]) => {
      console.log(`   ${spotName}: ${routes.length} routes`);
      if (routes.length !== 5) {
        console.warn(`     ⚠️  Expected 5 routes, found ${routes.length}`);
      }
    });

    console.log('\n🎯 Route loading test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAllRoutesLoad();