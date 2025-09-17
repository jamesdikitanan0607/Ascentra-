const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 15 Official Hiking Spots Data
const HIKING_SPOTS = [
  { slug: 'mount-babag', name: 'Mount Babag', latitude: 10.3167, longitude: 123.9833 },
  { slug: 'mount-kan-irag', name: 'Mount Kan-irag', latitude: 10.3200, longitude: 123.9900 },
  { slug: 'mount-naupa', name: 'Mount Naupa', latitude: 10.2833, longitude: 123.9500 },
  { slug: 'mount-manunggal', name: 'Mount Manunggal', latitude: 10.4167, longitude: 123.9833 },
  { slug: 'mount-mago', name: 'Mount Mago', latitude: 10.3500, longitude: 123.9667 },
  { slug: 'mount-kapayas', name: 'Mount Kapayas', latitude: 10.2667, longitude: 123.9333 },
  { slug: 'mount-lantoy', name: 'Mount Lantoy', latitude: 9.9086, longitude: 123.6047 },
  { slug: 'mount-kalbasan', name: 'Mount Kalbasan', latitude: 10.3000, longitude: 123.9200 },
  { slug: 'mount-mauyog', name: 'Mount Mauyog', latitude: 10.2500, longitude: 123.9100 },
  { slug: 'mount-lanaya', name: 'Mount Lanaya', latitude: 10.2800, longitude: 123.9400 },
  { slug: 'mount-hambubuyog', name: 'Mount Hambubuyog', latitude: 9.6000, longitude: 123.3200 },
  { slug: 'osmena-peak', name: 'Osmeña Peak', latitude: 9.9500, longitude: 123.3333 },
  { slug: 'casino-peak', name: 'Casino Peak', latitude: 10.3100, longitude: 123.9700 },
  { slug: 'budlaan-falls', name: 'Budlaan Falls', latitude: 10.3300, longitude: 123.9600 },
  { slug: 'spartan-trail', name: 'Spartan Trail', latitude: 10.3400, longitude: 123.9800 }
];

// Generate 5 routes per spot (75 total)
function generateRoutesForSpot(spot, spotIndex) {
  const baseRoutes = [
    {
      name: 'Beginner Trail',
      difficulty: 'Easy',
      distance_km: 2.5,
      elevation_gain_m: 150,
      duration_minutes: 90,
      highlight: 'Perfect for first-time hikers with gentle slopes'
    },
    {
      name: 'Scenic Route',
      difficulty: 'Easy',
      distance_km: 3.2,
      elevation_gain_m: 200,
      duration_minutes: 120,
      highlight: 'Beautiful viewpoints and photo opportunities'
    },
    {
      name: 'Standard Trail',
      difficulty: 'Moderate',
      distance_km: 4.8,
      elevation_gain_m: 350,
      duration_minutes: 180,
      highlight: 'Most popular route with balanced challenge'
    },
    {
      name: 'Advanced Path',
      difficulty: 'Moderate',
      distance_km: 6.5,
      elevation_gain_m: 500,
      duration_minutes: 240,
      highlight: 'Challenging terrain with rewarding summit views'
    },
    {
      name: 'Expert Challenge',
      difficulty: 'Advanced',
      distance_km: 8.2,
      elevation_gain_m: 750,
      duration_minutes: 300,
      highlight: 'Technical route for experienced hikers only'
    }
  ];

  return baseRoutes.map((route, routeIndex) => {
    // Generate realistic coordinates around the spot
    const latOffset = (Math.random() - 0.5) * 0.01;
    const lngOffset = (Math.random() - 0.5) * 0.01;
    
    return {
      spot_id: null, // Will be set after spot insertion
      name: route.name,
      difficulty: route.difficulty,
      start_lat: spot.latitude + latOffset,
      start_lng: spot.longitude + lngOffset,
      end_lat: spot.latitude + latOffset + (Math.random() - 0.5) * 0.005,
      end_lng: spot.longitude + lngOffset + (Math.random() - 0.5) * 0.005,
      distance_km: route.distance_km,
      elevation_gain_m: route.elevation_gain_m,
      duration_minutes: route.duration_minutes,
      highlight: route.highlight
    };
  });
}

// Generate spot images data
function generateSpotImages(spotId, spotSlug) {
  return [
    { spot_id: spotId, filename: '01_thumb.jpg', position: 1, is_thumbnail: true },
    { spot_id: spotId, filename: '02.jpg', position: 2, is_thumbnail: false },
    { spot_id: spotId, filename: '03.jpg', position: 3, is_thumbnail: false },
    { spot_id: spotId, filename: '04.jpg', position: 4, is_thumbnail: false },
    { spot_id: spotId, filename: '05.jpg', position: 5, is_thumbnail: false }
  ];
}

async function insertSeedData() {
  try {
    console.log('🌱 Starting seed data insertion...');
    
    // Insert hiking spots
    console.log('📍 Inserting hiking spots...');
    const { data: spotsData, error: spotsError } = await supabase
      .from('spots')
      .insert(HIKING_SPOTS)
      .select();
    
    if (spotsError) {
      console.error('❌ Error inserting spots:', spotsError);
      return;
    }
    
    console.log(`✅ Inserted ${spotsData.length} hiking spots`);
    
    // Insert spot images
    console.log('🖼️ Inserting spot images...');
    const allImages = [];
    spotsData.forEach(spot => {
      const images = generateSpotImages(spot.id, spot.slug);
      allImages.push(...images);
    });
    
    const { data: imagesData, error: imagesError } = await supabase
      .from('spot_images')
      .insert(allImages)
      .select();
    
    if (imagesError) {
      console.error('❌ Error inserting images:', imagesError);
    } else {
      console.log(`✅ Inserted ${imagesData.length} spot images`);
    }
    
    // Insert routes
    console.log('🗺️ Inserting trail routes...');
    const allRoutes = [];
    spotsData.forEach((spot, index) => {
      const routes = generateRoutesForSpot(spot, index);
      routes.forEach(route => {
        route.spot_id = spot.id;
        allRoutes.push(route);
      });
    });
    
    const { data: routesData, error: routesError } = await supabase
      .from('routes')
      .insert(allRoutes)
      .select();
    
    if (routesError) {
      console.error('❌ Error inserting routes:', routesError);
    } else {
      console.log(`✅ Inserted ${routesData.length} trail routes`);
    }
    
    console.log('\n🎉 Seed data insertion completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${spotsData.length} hiking spots`);
    console.log(`- ${allImages.length} spot images`);
    console.log(`- ${allRoutes.length} trail routes`);
    console.log('\n✅ Database is ready for the hiking app!');
    
  } catch (error) {
    console.error('❌ Seed data insertion failed:', error);
    process.exit(1);
  }
}

insertSeedData();