const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function manualRouteInsert() {
  try {
    console.log('🔄 Manually inserting sample routes with your updated coordinates...');
    
    // Clear existing data first
    console.log('🧹 Clearing existing data...');
    const { error: deleteError } = await supabase
      .from('hiking_spot_routes')
      .delete()
      .neq('id', 0);
    
    if (deleteError) {
      console.log('Note: Could not clear existing data:', deleteError.message);
    }
    
    // Sample routes with your updated coordinates
    const sampleRoutes = [
      {
        hiking_spot_id: 71, // Mount Babag
        route_name: 'Babag Ridge Easy Trail',
        difficulty: 'Easy',
        distance: 2.4,
        elevation_gain: 160,
        estimated_duration: '80 minutes',
        route_features: 'Gentle slopes, pine trees, family-friendly',
        route_description: 'A short, well-marked trail ideal for beginners with multiple rest points.',
        start_point: '10.3140, 123.9620',
        end_point: '10.3170, 123.9660',
        coordinates: JSON.stringify([
          [123.9620, 10.3140],
          [123.9630, 10.3145],
          [123.9635, 10.3150],
          [123.9645, 10.3155],
          [123.9655, 10.3165],
          [123.9660, 10.3170]
        ])
      },
      {
        hiking_spot_id: 71, // Mount Babag
        route_name: 'Babag Summit Classic',
        difficulty: 'Moderate',
        distance: 4.6,
        elevation_gain: 620,
        estimated_duration: '200 minutes',
        route_features: 'Steeper ascent, rocky sections, great summit views',
        route_description: 'Standard route to the summit with panoramic views of the city and coast.',
        start_point: '10.3130, 123.9610',
        end_point: '10.3180, 123.9680',
        coordinates: JSON.stringify([
          [123.9610, 10.3130],
          [123.9625, 10.3140],
          [123.9640, 10.3150],
          [123.9655, 10.3160],
          [123.9670, 10.3170],
          [123.9680, 10.3180]
        ])
      },
      {
        hiking_spot_id: 72, // Mount Kan-irag
        route_name: 'Sirao Flower Garden Walk',
        difficulty: 'Easy',
        distance: 2.1,
        elevation_gain: 110,
        estimated_duration: '60 minutes',
        route_features: 'Flower beds, family-friendly stroll',
        route_description: 'A gentle walk through the flower gardens near Sirao.',
        start_point: '10.3320, 123.9150',
        end_point: '10.3340, 123.9180',
        coordinates: JSON.stringify([
          [123.9150, 10.3320],
          [123.9160, 10.3325],
          [123.9165, 10.3330],
          [123.9175, 10.3335],
          [123.9180, 10.3340]
        ])
      },
      {
        hiking_spot_id: 73, // Mount Naupa
        route_name: 'Naupa Village Trail',
        difficulty: 'Easy',
        distance: 2.6,
        elevation_gain: 190,
        estimated_duration: '90 minutes',
        route_features: 'Agricultural scenery, community access',
        route_description: 'Accessible trail passing through farms and local settlements.',
        start_point: '10.2070, 123.7480',
        end_point: '10.2095, 123.7520',
        coordinates: JSON.stringify([
          [123.7480, 10.2070],
          [123.7490, 10.2075],
          [123.7500, 10.2080],
          [123.7510, 10.2090],
          [123.7520, 10.2095]
        ])
      }
    ];
    
    console.log('📍 Inserting sample routes...');
    
    for (const route of sampleRoutes) {
      console.log(`🔄 Inserting: ${route.route_name}`);
      console.log(`   Start: ${route.start_point}`);
      console.log(`   End: ${route.end_point}`);
      console.log(`   Coordinates: ${JSON.parse(route.coordinates).length} points`);
      
      const { error } = await supabase
        .from('hiking_spot_routes')
        .insert([route]);
      
      if (error) {
        console.error(`❌ Error inserting ${route.route_name}:`, error.message);
      } else {
        console.log(`✅ Successfully inserted ${route.route_name}`);
      }
    }
    
    // Verify the data
    console.log('\n🔍 Verifying inserted data...');
    const { data: allRoutes, error: fetchError } = await supabase
      .from('hiking_spot_routes')
      .select('*')
      .order('hiking_spot_id');
    
    if (fetchError) {
      console.error('❌ Error fetching routes:', fetchError);
    } else {
      console.log(`📊 Total routes inserted: ${allRoutes.length}`);
      
      if (allRoutes.length > 0) {
        console.log('\n📍 Inserted routes:');
        allRoutes.forEach(route => {
          console.log(`   ${route.route_name}:`);
          console.log(`     Start: ${route.start_point}`);
          console.log(`     End: ${route.end_point}`);
          const coords = JSON.parse(route.coordinates);
          console.log(`     Coordinates: ${coords.length} points`);
          console.log(`     Sample coordinates: [${coords[0]}] -> [${coords[coords.length - 1]}]`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

manualRouteInsert();
