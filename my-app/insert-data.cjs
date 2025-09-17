require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertHikingSpots() {
  console.log('🏔️ Inserting hiking spots...');
  
  const hikingSpots = [
    {
      name: 'Temple of Leah',
      coordinates: '10.3157, 123.9621',
      description: 'A beautiful Roman-inspired temple with stunning views of Cebu City.',
      cover_image_url: 'https://example.com/temple-of-leah.jpg',
      average_rating: 4.5,
      number_of_reviews: 150
    },
    {
      name: 'Sirao Flower Garden',
      coordinates: '10.3234, 123.9456',
      description: 'Colorful flower garden known as the "Little Amsterdam" of Cebu.',
      cover_image_url: 'https://example.com/sirao-garden.jpg',
      average_rating: 4.3,
      number_of_reviews: 200
    },
    {
      name: 'Tumalog Falls',
      coordinates: '9.4567, 123.3456',
      description: 'A stunning waterfall with crystal clear blue waters.',
      cover_image_url: 'https://example.com/tumalog-falls.jpg',
      average_rating: 4.7,
      number_of_reviews: 300
    }
  ];
  
  const { data, error } = await supabase
    .from('hiking_spots')
    .insert(hikingSpots)
    .select();
  
  if (error) {
    console.log('❌ Error inserting hiking spots:', error.message);
    return null;
  }
  
  console.log(`✅ Inserted ${data.length} hiking spots`);
  return data;
}

async function insertTrailRoutes(hikingSpots) {
  console.log('🛤️ Inserting trail routes...');
  
  if (!hikingSpots || hikingSpots.length === 0) {
    console.log('❌ No hiking spots available for trail routes');
    return;
  }
  
  const trailRoutes = [
    {
      hiking_spot_id: hikingSpots[0].id,
      route_name: 'Main Temple Trail',
      difficulty: 'Easy',
      start_coordinates: '10.3157, 123.9621',
      distance_km: 1.2,
      elevation_gain_m: 50,
      estimated_duration_hr: 1.0,
      highlights: 'Temple views, city panorama',
      route_color: '#FF6B6B',
      geojson_path: null
    },
    {
      hiking_spot_id: hikingSpots[1].id,
      route_name: 'Flower Garden Loop',
      difficulty: 'Easy',
      start_coordinates: '10.3234, 123.9456',
      distance_km: 0.8,
      elevation_gain_m: 30,
      estimated_duration_hr: 0.5,
      highlights: 'Colorful flowers, photo spots',
      route_color: '#4ECDC4',
      geojson_path: null
    },
    {
      hiking_spot_id: hikingSpots[2].id,
      route_name: 'Waterfall Trail',
      difficulty: 'Moderate',
      start_coordinates: '9.4567, 123.3456',
      distance_km: 2.5,
      elevation_gain_m: 150,
      estimated_duration_hr: 2.0,
      highlights: 'Waterfall swimming, natural pools',
      route_color: '#45B7D1',
      geojson_path: null
    }
  ];
  
  const { data, error } = await supabase
    .from('trail_routes')
    .insert(trailRoutes)
    .select();
  
  if (error) {
    console.log('❌ Error inserting trail routes:', error.message);
    return;
  }
  
  console.log(`✅ Inserted ${data.length} trail routes`);
}

async function setupForumStorage() {
  console.log('💾 Setting up forum storage...');
  
  // Note: Storage bucket creation typically requires admin privileges
  // This might need to be done manually in Supabase dashboard
  console.log('ℹ️ Forum storage setup should be done manually in Supabase dashboard');
  console.log('   Create buckets: forum-images, forum-attachments');
}

async function main() {
  try {
    console.log('🚀 Starting data insertion process...');
    
    // First, check if hiking spots already exist
    const { data: existingSpots } = await supabase
      .from('hiking_spots')
      .select('id, name')
      .limit(5);
    
    let hikingSpots = existingSpots;
    
    if (!existingSpots || existingSpots.length === 0) {
      hikingSpots = await insertHikingSpots();
    } else {
      console.log(`ℹ️ Found ${existingSpots.length} existing hiking spots`);
    }
    
    // Check if trail routes already exist
    const { data: existingRoutes } = await supabase
      .from('trail_routes')
      .select('id')
      .limit(1);
    
    if (!existingRoutes || existingRoutes.length === 0) {
      await insertTrailRoutes(hikingSpots);
    } else {
      console.log('ℹ️ Trail routes already exist');
    }
    
    await setupForumStorage();
    
    console.log('✅ Data insertion process completed!');
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

main();