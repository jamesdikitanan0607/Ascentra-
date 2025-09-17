const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for seeding

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please check your .env file contains:');
  console.log('- EXPO_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedHikingData() {
  try {
    console.log('🌲 Starting hiking data seeding process...\n');

    // Load the hiking spots dataset
    const dataPath = path.join(__dirname, 'hiking-spots-complete-dataset.json');
    const hikingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log(`📊 Loaded ${hikingData.length} hiking spots with ${hikingData.length * 5} total routes\n`);

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await supabase.from('trail_routes').delete().neq('id', 0);
    await supabase.from('hiking_spots').delete().neq('hiking_spot_id', 0);
    console.log('✅ Existing data cleared\n');

    let totalSpotsInserted = 0;
    let totalRoutesInserted = 0;

    // Process each hiking spot
    for (const spotData of hikingData) {
      console.log(`🏔️  Processing: ${spotData.spot_slug}`);

      // Insert hiking spot
      const { data: spot, error: spotError } = await supabase
        .from('hiking_spots')
        .insert({
          name: spotData.spot_slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: `Beautiful hiking destination with ${spotData.routes.length} trail routes ranging from ${spotData.routes[0].difficulty} to ${spotData.routes[spotData.routes.length - 1].difficulty}.`,
          latitude: spotData.routes[0].start_lat,
          longitude: spotData.routes[0].start_lng,
          elevation: spotData.routes[spotData.routes.length - 1].elevation_gain_m, // Use highest elevation
          difficulty: spotData.routes[2].difficulty, // Use moderate as average
          trail_length: spotData.routes[2].distance_km, // Use moderate trail length
          estimated_duration: spotData.routes[2].duration_minutes, // Use moderate duration
          cover_image_url: `https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80`,
          image_url: `https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80`,
          location_text: spotData.routes[0].highlight,
          amenities: ['Parking', 'Trail Markers', 'Scenic Views'],
          best_season: ['Dry Season', 'Cool Weather']
        })
        .select()
        .single();

      if (spotError) {
        console.error(`❌ Error inserting spot ${spotData.spot_slug}:`, spotError);
        continue;
      }

      totalSpotsInserted++;
      console.log(`   ✅ Spot inserted with ID: ${spot.id}`);

      // Insert trail routes for this spot
      const routesToInsert = spotData.routes.map(route => ({
        hiking_spot_id: spot.hiking_spot_id,
        name: route.name,
        difficulty: route.difficulty,
        length: route.distance_km,
        elevation_gain: route.elevation_gain_m,
        estimated_time: route.duration_minutes,
        description: route.highlight,
        trail_type: 'Loop', // Default trail type
        waypoints: JSON.stringify([
          { lat: route.start_lat, lng: route.start_lng, name: 'Start' },
          { lat: route.end_lat, lng: route.end_lng, name: 'End' }
        ])
      }));

      const { data: routes, error: routesError } = await supabase
        .from('trail_routes')
        .insert(routesToInsert)
        .select();

      if (routesError) {
        console.error(`❌ Error inserting routes for ${spotData.spot_slug}:`, routesError);
        continue;
      }

      totalRoutesInserted += routes.length;
      console.log(`   ✅ ${routes.length} routes inserted\n`);
    }

    console.log('🎉 Seeding completed successfully!');
    console.log(`📈 Summary:`);
    console.log(`   • Hiking spots inserted: ${totalSpotsInserted}`);
    console.log(`   • Trail routes inserted: ${totalRoutesInserted}`);
    console.log(`   • Total records: ${totalSpotsInserted + totalRoutesInserted}\n`);

    // Verify the data
    console.log('🔍 Verifying inserted data...');
    
    const { data: spots, error: spotsError } = await supabase
      .from('hiking_spots')
      .select('hiking_spot_id, name, description')
      .order('name');

    if (spotsError) {
      console.error('❌ Error verifying spots:', spotsError);
    } else {
      console.log(`✅ Verified ${spots.length} hiking spots in database`);
    }

    const { data: routes, error: routesError } = await supabase
      .from('trail_routes')
      .select('id, name, difficulty, hiking_spot_id')
      .order('difficulty');

    if (routesError) {
      console.error('❌ Error verifying routes:', routesError);
    } else {
      console.log(`✅ Verified ${routes.length} trail routes in database`);
      
      // Show difficulty distribution
      const difficultyCount = routes.reduce((acc, route) => {
        acc[route.difficulty] = (acc[route.difficulty] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📊 Trail difficulty distribution:');
      Object.entries(difficultyCount).forEach(([difficulty, count]) => {
        console.log(`   • ${difficulty}: ${count} trails`);
      });
    }

    console.log('\n🚀 Your hiking app is now ready with sample data!');
    console.log('💡 You can now test the app functionality with real hiking spots and routes.');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding process
seedHikingData();