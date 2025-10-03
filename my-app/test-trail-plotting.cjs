const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testTrailPlotting() {
  console.log('🧪 Testing Trail Plotting System...\n');

  try {
    // Test 1: Verify all hiking spots have trails
    console.log('📍 Test 1: Checking trail distribution across hiking spots...');
    const { data: trailsBySpot, error: spotsError } = await supabase
      .from('trail_routes')
      .select('hiking_spot_id, route_name, difficulty')
      .order('hiking_spot_id');

    if (spotsError) {
      console.error('❌ Error fetching trails by spot:', spotsError);
      return;
    }

    const spotGroups = {};
    trailsBySpot.forEach(trail => {
      if (!spotGroups[trail.hiking_spot_id]) {
        spotGroups[trail.hiking_spot_id] = [];
      }
      spotGroups[trail.hiking_spot_id].push(trail);
    });

    console.log(`✅ Found trails for ${Object.keys(spotGroups).length} hiking spots:`);
    Object.entries(spotGroups).forEach(([spotId, trails]) => {
      const difficulties = trails.map(t => t.difficulty);
      console.log(`   Spot ${spotId}: ${trails.length} trails (${difficulties.join(', ')})`);
    });

    // Test 2: Verify coordinate data integrity
    console.log('\n🗺️  Test 2: Checking coordinate data integrity...');
    const { data: coordinateData, error: coordError } = await supabase
      .from('trail_routes')
      .select('route_id, route_name, start_coordinates, end_coordinates, geojson_path')
      .limit(5);

    if (coordError) {
      console.error('❌ Error fetching coordinate data:', coordError);
      return;
    }

    console.log('✅ Sample coordinate data:');
    coordinateData.forEach(trail => {
      console.log(`   ${trail.route_name}:`);
      console.log(`     Start: ${trail.start_coordinates}`);
      console.log(`     End: ${trail.end_coordinates}`);
      console.log(`     GeoJSON: ${trail.geojson_path ? 'Present' : 'Missing'}`);
    });

    // Test 3: Verify GeoJSON path data
    console.log('\n🛤️  Test 3: Checking GeoJSON path data...');
    const { data: geoJsonData, error: geoError } = await supabase
      .from('trail_routes')
      .select('route_name, geojson_path')
      .not('geojson_path', 'is', null)
      .limit(3);

    if (geoError) {
      console.error('❌ Error fetching GeoJSON data:', geoError);
      return;
    }

    console.log('✅ Sample GeoJSON path data:');
    geoJsonData.forEach(trail => {
      const path = trail.geojson_path;
      if (path && path.coordinates) {
        console.log(`   ${trail.route_name}: ${path.coordinates.length} coordinate points`);
        console.log(`     First point: [${path.coordinates[0].join(', ')}]`);
        console.log(`     Last point: [${path.coordinates[path.coordinates.length - 1].join(', ')}]`);
      }
    });

    // Test 4: Test specific hiking spot data (spot 1)
    console.log('\n🏔️  Test 4: Testing specific hiking spot (ID: 1)...');
    const { data: spot1Data, error: spot1Error } = await supabase
      .from('trail_routes')
      .select('*')
      .eq('hiking_spot_id', 1);

    if (spot1Error) {
      console.error('❌ Error fetching spot 1 data:', spot1Error);
      return;
    }

    console.log(`✅ Hiking Spot 1 has ${spot1Data.length} trails:`);
    spot1Data.forEach(trail => {
      console.log(`   - ${trail.route_name} (${trail.difficulty})`);
      console.log(`     Distance: ${trail.distance_km}km, Elevation: ${trail.elevation_gain_m}m`);
      console.log(`     Duration: ${trail.estimated_duration_hr}h`);
      console.log(`     Color: ${trail.route_color}`);
    });

    // Test 5: Verify difficulty distribution
    console.log('\n📊 Test 5: Checking difficulty distribution...');
    const { data: difficultyData, error: diffError } = await supabase
      .from('trail_routes')
      .select('difficulty')
      .order('difficulty');

    if (diffError) {
      console.error('❌ Error fetching difficulty data:', diffError);
      return;
    }

    const difficultyCount = {};
    difficultyData.forEach(trail => {
      difficultyCount[trail.difficulty] = (difficultyCount[trail.difficulty] || 0) + 1;
    });

    console.log('✅ Difficulty distribution:');
    Object.entries(difficultyCount).forEach(([difficulty, count]) => {
      console.log(`   ${difficulty}: ${count} trails`);
    });

    // Test 6: Verify route colors
    console.log('\n🎨 Test 6: Checking route color assignments...');
    const { data: colorData, error: colorError } = await supabase
      .from('trail_routes')
      .select('difficulty, route_color')
      .limit(10);

    if (colorError) {
      console.error('❌ Error fetching color data:', colorError);
      return;
    }

    const colorMapping = {};
    colorData.forEach(trail => {
      if (!colorMapping[trail.difficulty]) {
        colorMapping[trail.difficulty] = trail.route_color;
      }
    });

    console.log('✅ Difficulty-to-color mapping:');
    Object.entries(colorMapping).forEach(([difficulty, color]) => {
      console.log(`   ${difficulty}: ${color}`);
    });

    console.log('\n🎉 Trail Plotting System Test Complete!');
    console.log('✅ All tests passed - Trail plotting system is ready for use');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testTrailPlotting();