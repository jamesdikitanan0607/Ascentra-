const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Simulate the fetchTrailRoutes function
async function testFetchTrailRoutes(hikingSpotId) {
  try {
    console.log(`🔄 Testing trail routes fetch for hiking spot: ${hikingSpotId}`);
    
    // Query the trail_routes table (the actual table with data)
    const { data, error } = await supabase
      .from('trail_routes')
      .select('*')
      .eq('hiking_spot_id', hikingSpotId)
      .order('route_name');

    console.log(`📊 Raw trail routes data for spot ${hikingSpotId}:`, data?.length || 0, 'routes');
    console.log('❌ Trail routes error:', error);

    if (error || !data || !Array.isArray(data) || data.length === 0) {
      console.log(`⚠️ No trail routes found for hiking spot: ${hikingSpotId}`);
      return { data: [], error };
    }

    // Transform database data (simplified version)
    const transformedData = data.map(route => {
      console.log(`🔄 Processing route: ${route.route_name}`);
      
      // Extract coordinates from start_coordinates and end_coordinates fields
      let startCoordinates = { latitude: 0, longitude: 0 };
      let endCoordinates = { latitude: 0, longitude: 0 };
      
      // Parse start_coordinates
      if (route.start_coordinates && typeof route.start_coordinates === 'string') {
        const match = route.start_coordinates.match(/\(([^,]+),([^)]+)\)/);
        if (match) {
          startCoordinates = {
            longitude: parseFloat(match[1]),
            latitude: parseFloat(match[2])
          };
        }
      }
      
      // Parse end_coordinates
      if (route.end_coordinates && typeof route.end_coordinates === 'string') {
        const match = route.end_coordinates.match(/\(([^,]+),([^)]+)\)/);
        if (match) {
          endCoordinates = {
            longitude: parseFloat(match[1]),
            latitude: parseFloat(match[2])
          };
        }
      }
      
      console.log(`📍 Route coordinates: ${route.route_name}`);
      console.log(`   Start: ${startCoordinates.latitude}, ${startCoordinates.longitude}`);
      console.log(`   End: ${endCoordinates.latitude}, ${endCoordinates.longitude}`);
      
      // Check if coordinates are in Guadalupe area
      const isGuadalupe = (
        startCoordinates.longitude >= 123.88 && startCoordinates.longitude <= 123.89 && 
        startCoordinates.latitude >= 10.36 && startCoordinates.latitude <= 10.42
      );
      
      if (isGuadalupe) {
        console.log(`   ⚠️ Still in Guadalupe area!`);
      } else {
        console.log(`   ✅ Outside Guadalupe area`);
      }
      
      // Extract GeoJSON path
      let geojsonPath = {
        type: 'LineString',
        coordinates: []
      };
      
      if (route.geojson_path && route.geojson_path.coordinates) {
        geojsonPath = route.geojson_path;
        console.log(`   📍 GeoJSON coordinates: ${geojsonPath.coordinates.length} points`);
        console.log(`   📍 First point: [${geojsonPath.coordinates[0]}]`);
        console.log(`   📍 Last point: [${geojsonPath.coordinates[geojsonPath.coordinates.length - 1]}]`);
      }

      return {
        id: route.id?.toString() || '',
        route_id: route.route_id?.toString() || route.id?.toString() || '',
        route_name: route.route_name || 'Unnamed Route',
        hiking_spot_id: route.hiking_spot_id?.toString() || hikingSpotId,
        difficulty: route.difficulty || 'Moderate',
        distance_km: route.distance_km || 0,
        elevation_gain_m: route.elevation_gain_m || 0,
        start_coordinates: startCoordinates,
        end_coordinates: endCoordinates,
        geojson_path: geojsonPath
      };
    });

    console.log(`✅ Successfully transformed ${transformedData.length} routes`);
    return { data: transformedData, error: null };
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return { data: [], error };
  }
}

async function runTests() {
  console.log('🧪 Testing supabaseService functionality...\n');
  
  // Test different hiking spots
  const testSpots = [71, 72, 73]; // Mount Babag, Mount Kan-irag, Mount Naupa
  
  for (const spotId of testSpots) {
    console.log(`\n${'='.repeat(50)}`);
    const result = await testFetchTrailRoutes(spotId.toString());
    
    if (result.data.length > 0) {
      console.log(`\n📊 Summary for Spot ${spotId}:`);
      console.log(`   Total routes: ${result.data.length}`);
      console.log(`   Sample route: ${result.data[0].route_name}`);
      console.log(`   Sample coordinates: ${result.data[0].start_coordinates.latitude}, ${result.data[0].start_coordinates.longitude}`);
    }
  }
}

runTests();
