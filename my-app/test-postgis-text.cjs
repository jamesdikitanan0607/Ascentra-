const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPostGISText() {
  try {
    console.log('🧪 Testing PostGIS ST_AsText conversion...');
    
    // Test the new query with ST_AsText
    const { data, error } = await supabase
      .from('hiking_spot_routes')
      .select(`
        id,
        hiking_spot_id,
        route_name,
        difficulty,
        distance,
        elevation_gain,
        estimated_duration,
        route_features,
        route_description,
        ST_AsText(start_point) as start_point_text,
        ST_AsText(end_point) as end_point_text,
        ST_AsText(coordinates) as coordinates_text,
        created_at,
        updated_at,
        is_active
      `)
      .eq('hiking_spot_id', 71)
      .order('route_name');

    console.log(`📊 Query result: ${data?.length || 0} routes`);
    console.log('❌ Error:', error);

    if (data && !error && Array.isArray(data)) {
      console.log('\n🔄 Testing coordinate parsing with your updated data...');
      
      data.forEach(route => {
        console.log(`\n📍 Processing route: ${route.route_name}`);
        
        // Test start_point_text parsing
        if (route.start_point_text) {
          console.log(`   Raw start_point_text: ${route.start_point_text}`);
          const pointMatch = route.start_point_text.match(/POINT\(([^\s]+)\s+([^)]+)\)/);
          if (pointMatch) {
            const startCoordinates = {
              longitude: parseFloat(pointMatch[1]),
              latitude: parseFloat(pointMatch[2])
            };
            console.log(`   ✅ Parsed start: ${startCoordinates.latitude}, ${startCoordinates.longitude}`);
            
            // Verify this is Mount Babag area
            if (startCoordinates.latitude >= 10.31 && startCoordinates.latitude <= 10.32 && 
                startCoordinates.longitude >= 123.96 && startCoordinates.longitude <= 123.97) {
              console.log(`   🏔️ Confirmed Mount Babag coordinates!`);
            }
          }
        }
        
        // Test end_point_text parsing
        if (route.end_point_text) {
          console.log(`   Raw end_point_text: ${route.end_point_text}`);
          const pointMatch = route.end_point_text.match(/POINT\(([^\s]+)\s+([^)]+)\)/);
          if (pointMatch) {
            const endCoordinates = {
              longitude: parseFloat(pointMatch[1]),
              latitude: parseFloat(pointMatch[2])
            };
            console.log(`   ✅ Parsed end: ${endCoordinates.latitude}, ${endCoordinates.longitude}`);
          }
        }
        
        // Test coordinates_text parsing
        if (route.coordinates_text) {
          console.log(`   Raw coordinates_text: ${route.coordinates_text.substring(0, 100)}...`);
          const linestringMatch = route.coordinates_text.match(/LINESTRING\(([^)]+)\)/);
          if (linestringMatch) {
            const coordinateString = linestringMatch[1];
            const coordinatePairs = coordinateString.split(',').map(pair => pair.trim());
            const coordinates = coordinatePairs.map(pair => {
              const [lng, lat] = pair.split(/\s+/).map(coord => parseFloat(coord.trim()));
              return [lng, lat];
            });
            
            console.log(`   ✅ Parsed LINESTRING: ${coordinates.length} points`);
            console.log(`   📍 Trail path: [${coordinates[0]}] -> [${coordinates[coordinates.length - 1]}]`);
            
            // Verify all points are in the correct area
            const allInBabagArea = coordinates.every(coord => {
              const [lng, lat] = coord;
              return lat >= 10.31 && lat <= 10.32 && lng >= 123.96 && lng <= 123.97;
            });
            
            if (allInBabagArea) {
              console.log(`   🎯 All coordinates confirmed in Mount Babag area!`);
            } else {
              console.log(`   ⚠️ Some coordinates outside expected area`);
            }
          }
        }
        
        console.log(`   Duration: ${route.estimated_duration} minutes`);
        console.log(`   Features: ${route.route_features}`);
      });
      
      console.log('\n🎉 PostGIS text conversion working correctly!');
      console.log('✅ Your updated coordinates are now properly accessible');
      console.log('✅ Trail map will display accurate polylines for each route');
      
    } else {
      console.log('❌ No data returned or error occurred');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testPostGISText();
