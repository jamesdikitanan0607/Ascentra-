const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Simulate the updated supabaseService logic
async function testUpdatedService() {
  try {
    console.log('🧪 Testing updated supabaseService logic...');
    
    // Test fetching routes for Mount Babag (hiking_spot_id: 71)
    const hikingSpotId = '71';
    
    const { data, error } = await supabase
      .from('hiking_spot_routes')
      .select('*')
      .eq('hiking_spot_id', hikingSpotId)
      .order('route_name');

    console.log(`📊 Raw data for hiking spot ${hikingSpotId}:`, data?.length || 0, 'routes');
    console.log('❌ Error:', error);

    if (data && !error && Array.isArray(data)) {
      console.log('\n🔄 Testing coordinate transformation...');
      
      data.forEach(route => {
        console.log(`\n📍 Processing route: ${route.route_name}`);
        
        // Test start_point parsing
        let startCoordinates = { latitude: 0, longitude: 0 };
        if (route.start_point && typeof route.start_point === 'string') {
          const pointMatch = route.start_point.match(/POINT\(([^\s]+)\s+([^)]+)\)/);
          if (pointMatch) {
            startCoordinates = {
              longitude: parseFloat(pointMatch[1]),
              latitude: parseFloat(pointMatch[2])
            };
            console.log(`   ✅ Start coordinates: ${startCoordinates.latitude}, ${startCoordinates.longitude}`);
          } else {
            console.log(`   ❌ Could not parse start_point: ${route.start_point}`);
          }
        }
        
        // Test end_point parsing
        let endCoordinates = { latitude: 0, longitude: 0 };
        if (route.end_point && typeof route.end_point === 'string') {
          const pointMatch = route.end_point.match(/POINT\(([^\s]+)\s+([^)]+)\)/);
          if (pointMatch) {
            endCoordinates = {
              longitude: parseFloat(pointMatch[1]),
              latitude: parseFloat(pointMatch[2])
            };
            console.log(`   ✅ End coordinates: ${endCoordinates.latitude}, ${endCoordinates.longitude}`);
          } else {
            console.log(`   ❌ Could not parse end_point: ${route.end_point}`);
          }
        }
        
        // Test coordinates parsing
        let geojsonPath = { type: 'LineString', coordinates: [] };
        if (route.coordinates && typeof route.coordinates === 'string') {
          const linestringMatch = route.coordinates.match(/LINESTRING\(([^)]+)\)/);
          if (linestringMatch) {
            const coordinateString = linestringMatch[1];
            const coordinatePairs = coordinateString.split(',').map(pair => pair.trim());
            const coordinates = coordinatePairs.map(pair => {
              const [lng, lat] = pair.split(/\s+/).map(coord => parseFloat(coord.trim()));
              return [lng, lat];
            });
            
            geojsonPath = {
              type: 'LineString',
              coordinates: coordinates
            };
            console.log(`   ✅ Parsed LINESTRING: ${coordinates.length} points`);
            console.log(`   📍 First point: [${coordinates[0]}]`);
            console.log(`   📍 Last point: [${coordinates[coordinates.length - 1]}]`);
          } else {
            console.log(`   ❌ Could not parse coordinates: ${route.coordinates.substring(0, 100)}...`);
          }
        }
        
        // Verify coordinates are in correct Cebu areas
        if (startCoordinates.latitude && startCoordinates.longitude) {
          const isInCebu = (
            startCoordinates.latitude >= 9.5 && startCoordinates.latitude <= 11.0 &&
            startCoordinates.longitude >= 123.0 && startCoordinates.longitude <= 124.5
          );
          
          if (isInCebu) {
            console.log(`   ✅ Coordinates are in Cebu area`);
          } else {
            console.log(`   ⚠️ Coordinates might be outside Cebu area`);
          }
          
          // Check specific areas
          if (startCoordinates.latitude >= 10.31 && startCoordinates.latitude <= 10.32 && 
              startCoordinates.longitude >= 123.96 && startCoordinates.longitude <= 123.97) {
            console.log(`   🏔️ Mount Babag area coordinates confirmed!`);
          } else if (startCoordinates.latitude >= 10.33 && startCoordinates.latitude <= 10.34 && 
                     startCoordinates.longitude >= 123.91 && startCoordinates.longitude <= 123.92) {
            console.log(`   🌸 Sirao/Kan-irag area coordinates confirmed!`);
          } else if (startCoordinates.latitude >= 10.20 && startCoordinates.latitude <= 10.21 && 
                     startCoordinates.longitude >= 123.74 && startCoordinates.longitude <= 123.76) {
            console.log(`   🏞️ Naupa area coordinates confirmed!`);
          }
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testUpdatedService();
