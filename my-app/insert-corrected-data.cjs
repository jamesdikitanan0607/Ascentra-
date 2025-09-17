require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTrailRoutesWithCorrectSchema() {
  console.log('🛤️ Inserting trail routes with corrected schema...');
  
  // Get existing hiking spots
  const { data: hikingSpots, error: spotsError } = await supabase
    .from('hiking_spots')
    .select('id, name')
    .limit(5);
  
  if (spotsError) {
    console.log('❌ Error fetching hiking spots:', spotsError.message);
    return;
  }
  
  if (!hikingSpots || hikingSpots.length === 0) {
    console.log('❌ No hiking spots found');
    return;
  }
  
  console.log(`Found ${hikingSpots.length} hiking spots`);
  
  // Create trail routes for each hiking spot
  const trailRoutes = [];
  
  hikingSpots.forEach((spot, index) => {
    trailRoutes.push({
      hiking_spot_id: spot.id, // Now using UUID
      route_name: `Main Trail - ${spot.name}`,
      difficulty: index % 4 === 0 ? 'Easy' : index % 4 === 1 ? 'Moderate' : index % 4 === 2 ? 'Hard' : 'Advanced',
      start_coordinates: '10.3157, 123.8854', // Using text format
      distance_km: 2.5 + (index * 0.5),
      elevation_gain_m: 100 + (index * 50),
      estimated_duration_hr: 1.5 + (index * 0.5),
      highlights: `Beautiful views and scenic trail for ${spot.name}`,
      route_color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][index % 5],
      geojson_path: {
        type: 'LineString',
        coordinates: [
          [123.8854, 10.3157],
          [123.8864, 10.3167],
          [123.8874, 10.3177]
        ]
      }
    });
  });
  
  console.log('Attempting to insert trail routes...');
  
  const { data, error } = await supabase
    .from('trail_routes')
    .insert(trailRoutes)
    .select();
  
  if (error) {
    console.log('❌ Error inserting trail routes:', error.message);
    
    if (error.message.includes('invalid input syntax for type integer')) {
      console.log('');
      console.log('🔧 SCHEMA FIX STILL NEEDED!');
      console.log('Please run the SQL from fix-trail-routes-corrected.sql in Supabase SQL Editor first.');
      console.log('');
      console.log('Steps:');
      console.log('1. Go to Supabase Dashboard > SQL Editor');
      console.log('2. Copy and paste the contents of fix-trail-routes-corrected.sql');
      console.log('3. Run the SQL');
      console.log('4. Then run this script again');
    }
    
    return;
  }
  
  console.log(`✅ Successfully inserted ${data.length} trail routes`);
  data.forEach(route => {
    console.log(`   - ${route.route_name} (${route.difficulty})`);
  });
}

async function insertAdditionalHikingSpots() {
  console.log('🏔️ Checking if we need more hiking spots...');
  
  const { data: existingSpots } = await supabase
    .from('hiking_spots')
    .select('id, name')
    .limit(10);
  
  if (existingSpots && existingSpots.length >= 5) {
    console.log(`✅ Found ${existingSpots.length} existing hiking spots - sufficient data`);
    return;
  }
  
  console.log('Adding more hiking spots...');
  
  const additionalSpots = [
    {
      name: 'Temple of Leah',
      description: 'A beautiful Roman-inspired temple with stunning views of Cebu City.',
      latitude: 10.3157,
      longitude: 123.9621,
      difficulty: 'Easy',
      elevation: 300,
      trail_length: 1.2,
      estimated_duration: 60,
      image_url: 'https://example.com/temple-of-leah.jpg',
      images: [],
      amenities: ['Parking', 'Restrooms', 'Gift Shop'],
      best_season: ['All year round'],
      is_verified: true,
      rating: 4.5,
      review_count: 150,
      region: 'Cebu'
    },
    {
      name: 'Sirao Flower Garden',
      description: 'Colorful flower garden known as the "Little Amsterdam" of Cebu.',
      latitude: 10.3234,
      longitude: 123.9456,
      difficulty: 'Easy',
      elevation: 250,
      trail_length: 0.8,
      estimated_duration: 30,
      image_url: 'https://example.com/sirao-garden.jpg',
      images: [],
      amenities: ['Parking', 'Restrooms', 'Photo spots'],
      best_season: ['All year round'],
      is_verified: true,
      rating: 4.3,
      review_count: 200,
      region: 'Cebu'
    }
  ];
  
  const { data, error } = await supabase
    .from('hiking_spots')
    .insert(additionalSpots)
    .select();
  
  if (error) {
    console.log('❌ Error inserting additional hiking spots:', error.message);
    return;
  }
  
  console.log(`✅ Added ${data.length} additional hiking spots`);
}

async function main() {
  try {
    console.log('🚀 Starting corrected data insertion...');
    
    await insertAdditionalHikingSpots();
    await insertTrailRoutesWithCorrectSchema();
    
    console.log('✅ Data insertion process completed!');
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

main();