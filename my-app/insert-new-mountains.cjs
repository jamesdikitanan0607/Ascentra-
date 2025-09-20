require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables');
  console.log('Required: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function insertNewMountains() {
  console.log('🏔️ Inserting new mountains and trail routes...');
  
  // New hiking spots data
  const newHikingSpots = [
    {
      name: 'Mount Naupa',
      description: 'A scenic mountain offering panoramic views of Naga City and the surrounding valleys. Known for its lush forest trails and cool climate.',
      latitude: 10.2080,
      longitude: 123.7570,
      difficulty: 'Moderate',
      elevation: 1085,
      trail_length: 6.2,
      estimated_duration: 270, // 4.5 hours in minutes
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      best_season: ['November', 'December', 'January', 'February', 'March', 'April']
    },
    {
      name: 'Mount Lantoy',
      description: 'The highest peak in southern Cebu, offering challenging trails through dense forests and rewarding summit views of the entire southern region.',
      latitude: 9.8830,
      longitude: 123.6170,
      difficulty: 'Hard',
      elevation: 1327,
      trail_length: 8.5,
      estimated_duration: 420, // 7 hours in minutes
      image_url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      best_season: ['December', 'January', 'February', 'March', 'April', 'May']
    },
    {
      name: 'Mount Kapayas',
      description: 'A popular hiking destination known for its rolling hills, grasslands, and stunning sunrise views. Features well-maintained trails suitable for beginners.',
      latitude: 10.3790,
      longitude: 123.6420,
      difficulty: 'Moderate',
      elevation: 1002,
      trail_length: 5.1,
      estimated_duration: 210, // 3.5 hours in minutes
      image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      best_season: ['October', 'November', 'December', 'January', 'February', 'March']
    },
    {
      name: 'Mount Manunggal',
      description: 'A historically significant mountain with easy trails, memorial sites, and beautiful forest scenery. Perfect for family hikes and educational tours.',
      latitude: 10.4830,
      longitude: 123.7170,
      difficulty: 'Easy',
      elevation: 1003,
      trail_length: 3.8,
      estimated_duration: 150, // 2.5 hours in minutes
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      best_season: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },
    {
      name: 'Mount Capayas',
      description: 'A lesser-known gem offering peaceful trails through bamboo forests and agricultural areas, with panoramic views of Carcar City and the coastline.',
      latitude: 10.1070,
      longitude: 123.6370,
      difficulty: 'Moderate',
      elevation: 956,
      trail_length: 4.7,
      estimated_duration: 210, // 3.5 hours in minutes
      image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      best_season: ['November', 'December', 'January', 'February', 'March', 'April']
    }
  ];

  try {
    // Insert hiking spots
    console.log('📍 Inserting hiking spots...');
    const { data: insertedSpots, error: spotsError } = await supabase
      .from('hiking_spots')
      .insert(newHikingSpots)
      .select();

    if (spotsError) {
      console.log('❌ Error inserting hiking spots:', spotsError.message);
      return;
    }

    console.log(`✅ Successfully inserted ${insertedSpots.length} hiking spots`);

    // Create trail routes for each new hiking spot
    const trailRoutes = [];
    
    insertedSpots.forEach((spot, index) => {
      // Create 5 routes per mountain
      for (let i = 0; i < 5; i++) {
        const routeTypes = ['Main Trail', 'Summit Trail', 'Loop Trail', 'Ridge Trail', 'Forest Trail'];
        const difficulties = ['Easy', 'Moderate', 'Hard', 'Advanced'];
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        
        // Generate coordinates based on the hiking spot location
        const baseLat = newHikingSpots[index].latitude;
        const baseLng = newHikingSpots[index].longitude;
        
        // Create a simple path with start and end coordinates
        const startLat = baseLat + (Math.random() - 0.5) * 0.01;
        const startLng = baseLng + (Math.random() - 0.5) * 0.01;
        const endLat = baseLat + (Math.random() - 0.5) * 0.01;
        const endLng = baseLng + (Math.random() - 0.5) * 0.01;
        
        trailRoutes.push({
          hiking_spot_id: spot.id,
          route_name: `${routeTypes[i]} - ${spot.name}`,
          difficulty: difficulties[i % 4],
          start_coordinates: `${startLat.toFixed(6)}, ${startLng.toFixed(6)}`,
          distance_km: 2.0 + (i * 1.2) + (Math.random() * 2),
          elevation_gain_m: 150 + (i * 100) + Math.floor(Math.random() * 200),
          estimated_duration_hr: 1.5 + (i * 0.8) + (Math.random() * 1.5),
          highlights: `Scenic ${routeTypes[i].toLowerCase()} with beautiful views and unique features for ${spot.name}`,
          route_color: colors[i],
          geojson_path: {
            type: 'LineString',
            coordinates: [
              [startLng, startLat],
              [baseLng, baseLat],
              [endLng, endLat]
            ]
          }
        });
      }
    });

    // Insert trail routes
    console.log('🛤️ Inserting trail routes...');
    const { data: insertedRoutes, error: routesError } = await supabase
      .from('trail_routes')
      .insert(trailRoutes)
      .select('id, route_name');

    if (routesError) {
      console.log('❌ Error inserting trail routes:', routesError.message);
      return;
    }

    console.log(`✅ Successfully inserted ${insertedRoutes.length} trail routes`);
    
    // Verify the data
    console.log('\n📊 Verification:');
    const { data: totalSpots } = await supabase
      .from('hiking_spots')
      .select('id', { count: 'exact' });
    
    const { data: totalRoutes } = await supabase
      .from('trail_routes')
      .select('id', { count: 'exact' });
    
    console.log(`Total hiking spots in database: ${totalSpots?.length || 0}`);
    console.log(`Total trail routes in database: ${totalRoutes?.length || 0}`);
    
    console.log('\n🎉 New mountains and trail routes successfully added!');
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

// Run the insertion
insertNewMountains();