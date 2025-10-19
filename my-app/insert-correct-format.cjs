const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertCorrectFormat() {
  try {
    console.log('🔄 Inserting routes with correct PostGIS format...');
    
    // Clear existing data first
    console.log('🧹 Clearing existing data...');
    const { error: deleteError } = await supabase
      .from('hiking_spot_routes')
      .delete()
      .neq('id', 0);
    
    if (deleteError) {
      console.log('Note: Could not clear existing data:', deleteError.message);
    }
    
    // Routes with your updated coordinates in correct format
    const routes = [
      {
        hiking_spot_id: 71,
        route_name: 'Babag Ridge Easy Trail',
        difficulty: 'Easy',
        distance: 2.4,
        elevation_gain: 160,
        estimated_duration: 80, // Integer minutes
        route_features: 'Gentle slopes, pine trees, family-friendly',
        route_description: 'A short, well-marked trail ideal for beginners with multiple rest points.',
        start_point: 'POINT(123.9620 10.3140)', // PostGIS format
        end_point: 'POINT(123.9660 10.3170)',
        coordinates: 'LINESTRING(123.9620 10.3140, 123.9630 10.3145, 123.9635 10.3150, 123.9645 10.3155, 123.9655 10.3165, 123.9660 10.3170)' // PostGIS LINESTRING
      },
      {
        hiking_spot_id: 71,
        route_name: 'Babag Summit Classic',
        difficulty: 'Moderate',
        distance: 4.6,
        elevation_gain: 620,
        estimated_duration: 200,
        route_features: 'Steeper ascent, rocky sections, great summit views',
        route_description: 'Standard route to the summit with panoramic views of the city and coast.',
        start_point: 'POINT(123.9610 10.3130)',
        end_point: 'POINT(123.9680 10.3180)',
        coordinates: 'LINESTRING(123.9610 10.3130, 123.9625 10.3140, 123.9640 10.3150, 123.9655 10.3160, 123.9670 10.3170, 123.9680 10.3180)'
      },
      {
        hiking_spot_id: 72,
        route_name: 'Sirao Flower Garden Walk',
        difficulty: 'Easy',
        distance: 2.1,
        elevation_gain: 110,
        estimated_duration: 60,
        route_features: 'Flower beds, family-friendly stroll',
        route_description: 'A gentle walk through the flower gardens near Sirao.',
        start_point: 'POINT(123.9150 10.3320)',
        end_point: 'POINT(123.9180 10.3340)',
        coordinates: 'LINESTRING(123.9150 10.3320, 123.9160 10.3325, 123.9165 10.3330, 123.9175 10.3335, 123.9180 10.3340)'
      },
      {
        hiking_spot_id: 72,
        route_name: 'Sirao Ridge Route',
        difficulty: 'Moderate',
        distance: 3.8,
        elevation_gain: 320,
        estimated_duration: 130,
        route_features: 'Pine forest, overlooks, moderate ascent',
        route_description: 'Ridge trail with views over the valley and temple landmarks.',
        start_point: 'POINT(123.9140 10.3310)',
        end_point: 'POINT(123.9190 10.3350)',
        coordinates: 'LINESTRING(123.9140 10.3310, 123.9155 10.3320, 123.9170 10.3330, 123.9180 10.3340, 123.9190 10.3350)'
      },
      {
        hiking_spot_id: 73,
        route_name: 'Naupa Village Trail',
        difficulty: 'Easy',
        distance: 2.6,
        elevation_gain: 190,
        estimated_duration: 90,
        route_features: 'Agricultural scenery, community access',
        route_description: 'Accessible trail passing through farms and local settlements.',
        start_point: 'POINT(123.7480 10.2070)',
        end_point: 'POINT(123.7520 10.2095)',
        coordinates: 'LINESTRING(123.7480 10.2070, 123.7490 10.2075, 123.7500 10.2080, 123.7510 10.2090, 123.7520 10.2095)'
      },
      {
        hiking_spot_id: 73,
        route_name: 'Naupa Forest Path',
        difficulty: 'Moderate',
        distance: 4.5,
        elevation_gain: 330,
        estimated_duration: 150,
        route_features: 'Secondary forest, shaded canopy',
        route_description: 'Forest approach with natural springs and birdlife.',
        start_point: 'POINT(123.7470 10.2060)',
        end_point: 'POINT(123.7530 10.2105)',
        coordinates: 'LINESTRING(123.7470 10.2060, 123.7485 10.2070, 123.7505 10.2085, 123.7520 10.2095, 123.7530 10.2105)'
      }
    ];
    
    console.log('📍 Inserting routes with your updated coordinates...');
    
    let insertedCount = 0;
    
    for (const route of routes) {
      console.log(`🔄 Inserting: ${route.route_name}`);
      console.log(`   Start: ${route.start_point}`);
      console.log(`   End: ${route.end_point}`);
      console.log(`   Coordinates: ${route.coordinates.split(',').length} points`);
      
      const { error } = await supabase
        .from('hiking_spot_routes')
        .insert([route]);
      
      if (error) {
        console.error(`❌ Error inserting ${route.route_name}:`, error.message);
      } else {
        console.log(`✅ Successfully inserted ${route.route_name}`);
        insertedCount++;
      }
    }
    
    console.log(`\n🎉 Successfully inserted ${insertedCount} out of ${routes.length} routes`);
    
    // Verify the data
    console.log('\n🔍 Verifying inserted data...');
    const { data: allRoutes, error: fetchError } = await supabase
      .from('hiking_spot_routes')
      .select('*')
      .order('hiking_spot_id');
    
    if (fetchError) {
      console.error('❌ Error fetching routes:', fetchError);
    } else {
      console.log(`📊 Total routes in database: ${allRoutes.length}`);
      
      if (allRoutes.length > 0) {
        console.log('\n📍 Verified routes with your coordinates:');
        allRoutes.forEach(route => {
          console.log(`   ${route.route_name}:`);
          console.log(`     Start: ${route.start_point}`);
          console.log(`     End: ${route.end_point}`);
          console.log(`     Coordinates: ${route.coordinates}`);
          console.log(`     Duration: ${route.estimated_duration} minutes`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

insertCorrectFormat();
