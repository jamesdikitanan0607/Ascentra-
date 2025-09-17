import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// The 15 official Cebu hiking spots data
const hikingSpots = [
  {
    name: 'Mount Babag',
    description: 'A popular hiking destination with stunning views of Cebu City and surrounding areas.',
    difficulty: 'Moderate',
    elevation: 800,
    trail_length: 3.5,
    estimated_duration: 150, // 2-3 hours in minutes
    image_url: 'https://example.com/mount-babag.jpg',
    images: [],
    amenities: ['Parking', 'Restrooms', 'Trail markers'],
    best_season: ['Dry season', 'November to April'],
    created_by: null,
    is_verified: true,
    rating: 4.5,
    review_count: 120,
    latitude: 10.3157,
    longitude: 123.8854
  },
  {
    name: 'Mount Kan-irag / Sirao Peak',
    description: 'A scenic mountain peak offering panoramic views of Cebu City and surrounding areas.',
    difficulty: 'Moderate',
    elevation: 900,
    trail_length: 4.0,
    estimated_duration: 210, // 3-4 hours in minutes
    image_url: 'https://example.com/mount-kan-irag.jpg',
    images: [],
    amenities: ['Trail markers', 'Scenic viewpoints'],
    best_season: ['Dry season', 'November to April'],
    created_by: null,
    is_verified: true,
    rating: 4.6,
    review_count: 95,
    latitude: 10.3440,
    longitude: 123.8695
  },
  {
    name: 'Mount Naupa',
    description: 'A beautiful mountain with lush vegetation and scenic hiking trails.',
    difficulty: 'Moderate',
    elevation: 750,
    trail_length: 3.0,
    estimated_duration: 150, // 2-3 hours in minutes
    image_url: 'https://example.com/mount-naupa.jpg',
    images: [],
    amenities: ['Trail markers', 'Natural springs'],
    best_season: ['Dry season', 'November to April'],
    created_by: null,
    is_verified: true,
    rating: 4.3,
    review_count: 78,
    latitude: 10.2167,
    longitude: 123.7667
  },
  {
    name: 'Mount Manunggal',
    description: 'Historic mountain with memorial significance and rewarding summit views.',
    difficulty: 'Moderate',
    elevation: 1003,
    trail_length: 4.5,
    estimated_duration: 210, // 3-4 hours in minutes
    image_url: 'https://example.com/mount-manunggal.jpg',
    images: [],
    amenities: ['Memorial site', 'Trail markers', 'Historical significance'],
    best_season: ['Dry season', 'November to April'],
    created_by: null,
    is_verified: true,
    rating: 4.4,
    review_count: 65,
    latitude: 10.4833,
    longitude: 123.7167
  },
  {
    name: 'Mount Mago',
    description: 'A challenging mountain hike with rewarding views at the Carmen/Danao boundary.',
    difficulty: 'Hard',
    elevation: 1200,
    trail_length: 5.0,
    estimated_duration: 270, // 4-5 hours in minutes
    image_url: 'https://example.com/mount-mago.jpg',
    images: [],
    amenities: ['Trail markers', 'Challenging terrain'],
    best_season: ['Dry season', 'November to April'],
    created_by: null,
    is_verified: true,
    rating: 4.6,
    review_count: 42,
    latitude: 10.5833,
    longitude: 124.0167
  },
  {
    name: 'Mount Kapayas',
    description: 'A scenic mountain trail offering beautiful views and diverse flora.',
    difficulty: 'Moderate',
    elevation: 850,
    trail_length: 3.8,
    estimated_duration: 210, // 3-4 hours in minutes
    image_url: 'https://example.com/mount-kapayas.jpg',
    images: [],
    amenities: ['Trail markers', 'Diverse flora', 'Scenic views'],
    best_season: ['Dry season', 'November to April'],
    created_by: null,
    is_verified: true,
    rating: 4.3,
    review_count: 38,
    latitude: 10.7167,
    longitude: 124.0167
  },
  {
    name: 'Mount Lantoy',
    description: 'A scenic mountain trail with beautiful coastal views and diverse flora.',
    difficulty: 'Moderate',
    elevation: 700,
    trail_length: 3.2,
    estimated_duration: 150, // 2-3 hours in minutes
    image_url: 'https://example.com/mount-lantoy.jpg',
    images: [],
    amenities: ['Coastal views', 'Trail markers', 'Diverse flora'],
    best_season: ['Dry season', 'November to April'],
    created_by: null,
    is_verified: true,
    rating: 4.2,
    review_count: 29,
    latitude: 9.8833,
    longitude: 123.6167
  },
  {
    name: 'Mount Kalbasaan',
    description: 'A beautiful mountain offering panoramic views and challenging trails.',
    difficulty: 'Moderate',
    elevation: 650,
    trail_length: 2.8,
    estimated_duration: 150, // 2-3 hours in minutes
    image_url: 'https://example.com/mount-kalbasaan.jpg',
    images: [],
    amenities: ['Panoramic views', 'Trail markers'],
    best_season: ['Dry season', 'November to April'],
    created_by: null,
    is_verified: true,
    rating: 4.1,
    review_count: 25,
    latitude: 10.2333,
    longitude: 123.7833
  },
  {
    name: 'Mount Mauyog',
    description: 'A scenic mountain trail with diverse flora near Mt. Manunggal.',
    difficulty: 'Moderate',
    elevation: 950,
    trail_length: 4.2,
    estimated_duration: 210, // 3-4 hours in minutes
    image_url: 'https://example.com/mount-mauyog.jpg',
    images: [],
    amenities: ['Trail markers', 'Diverse flora', 'Near Mt. Manunggal'],
    best_season: ['Dry season', 'November to April'],
    created_by: null,
    is_verified: true,
    rating: 4.3,
    review_count: 31,
    latitude: 10.4667,
    longitude: 123.7333
  },
  {
    name: 'Mount Lanaya',
    description: 'A beautiful mountain offering stunning views and peaceful hiking experience.',
    difficulty: 'Moderate',
    elevation: 800,
    trail_length: 3.6,
    estimated_duration: 210, // 3-4 hours in minutes
    image_url: 'https://example.com/mount-lanaya.jpg',
    images: [],
    amenities: ['Peaceful trails', 'Stunning views', 'Trail markers'],
    best_season: ['Dry season', 'November to April'],
    created_by: null,
    is_verified: true,
    rating: 4.2,
    review_count: 27,
    latitude: 9.7667,
    longitude: 123.4167
  },
  {
    name: 'Mount Hambubuyog',
    description: 'A scenic mountain offering beautiful views and challenging hiking trails.',
    difficulty: 'Moderate',
    elevation: 750,
    trail_length: 3.4,
    estimated_duration: 210, // 3-4 hours in minutes
    image_url: 'https://example.com/mount-hambubuyog.jpg',
    images: [],
    amenities: ['Beautiful views', 'Challenging trails', 'Trail markers'],
    best_season: ['Dry season', 'November to April'],
    created_by: null,
    is_verified: true,
    rating: 4.1,
    review_count: 52,
    latitude: 9.6167,
    longitude: 123.3333
  },
  {
    name: 'Osmeña Peak',
    description: 'The highest peak in Cebu offering breathtaking panoramic views.',
    difficulty: 'Easy',
    elevation: 1013,
    trail_length: 1.5,
    estimated_duration: 90, // 1-2 hours in minutes
    image_url: 'https://example.com/osmena-peak.jpg',
    images: [],
    amenities: ['Highest peak', 'Panoramic views', 'Easy access'],
    best_season: ['Year-round', 'Best in dry season'],
    created_by: null,
    is_verified: true,
    rating: 4.8,
    review_count: 156,
    latitude: 9.7167,
    longitude: 123.5167
  },
  {
    name: 'Casino Peak',
    description: 'A scenic peak near Osmeña Peak offering stunning mountain views.',
    difficulty: 'Easy',
    elevation: 980,
    trail_length: 1.8,
    estimated_duration: 90, // 1-2 hours in minutes
    image_url: 'https://example.com/casino-peak.jpg',
    images: [],
    amenities: ['Near Osmeña Peak', 'Mountain views', 'Easy access'],
    best_season: ['Year-round', 'Best in dry season'],
    created_by: null,
    is_verified: true,
    rating: 4.5,
    review_count: 89,
    latitude: 9.7100,
    longitude: 123.5200
  },
  {
    name: 'Budlaan Falls',
    description: 'A beautiful waterfall with trekking trail to Mt. Kan-irag, perfect for nature lovers.',
    difficulty: 'Moderate',
    elevation: 600,
    trail_length: 2.5,
    estimated_duration: 150, // 2-3 hours in minutes
    image_url: 'https://example.com/budlaan-falls.jpg',
    images: [],
    amenities: ['Waterfall', 'Nature trail', 'Swimming area'],
    best_season: ['Rainy season for falls', 'Year-round'],
    created_by: null,
    is_verified: true,
    rating: 4.4,
    review_count: 34,
    latitude: 10.3300,
    longitude: 123.8600
  },
  {
    name: 'Spartan Trail',
    description: 'Challenging urban trail through the city offering great workout and views.',
    difficulty: 'Hard',
    elevation: 400,
    trail_length: 2.0,
    estimated_duration: 90, // 1-2 hours in minutes
    image_url: 'https://example.com/spartan-trail.jpg',
    images: [],
    amenities: ['Urban trail', 'Fitness challenge', 'City views'],
    best_season: ['Early morning', 'Late afternoon'],
    created_by: null,
    is_verified: true,
    rating: 4.4,
    review_count: 67,
    latitude: 10.3167,
    longitude: 123.8833
  }
];

async function insertHikingSpotsWithSQL() {
  try {
    console.log('🚀 Starting hiking spots insertion with SQL...');
    
    // Clear existing data
    console.log('🗑️  Clearing existing hiking spots...');
    const { error: deleteError } = await supabase
      .from('hiking_spots')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) {
      console.error('❌ Error clearing data:', deleteError.message);
      process.exit(1);
    }
    
    console.log('✅ Existing data cleared successfully');
    
    // Insert each hiking spot individually to avoid RLS issues
    console.log('📝 Inserting 15 hiking spots one by one...');
    
    for (let i = 0; i < hikingSpots.length; i++) {
      const spot = hikingSpots[i];
      console.log(`   Inserting ${i + 1}/15: ${spot.name}`);
      
      // Use raw SQL to bypass RLS
      const { data, error } = await supabase.rpc('insert_hiking_spot_admin', {
        spot_name: spot.name,
        spot_description: spot.description,
        spot_difficulty: spot.difficulty,
        spot_elevation: spot.elevation,
        spot_trail_length: spot.trail_length,
        spot_estimated_duration: spot.estimated_duration,
        spot_image_url: spot.image_url,
        spot_images: spot.images,
        spot_amenities: spot.amenities,
        spot_best_season: spot.best_season,
        spot_is_verified: spot.is_verified,
        spot_rating: spot.rating,
        spot_review_count: spot.review_count,
        spot_latitude: spot.latitude,
        spot_longitude: spot.longitude
      });
      
      if (error) {
        console.error(`❌ Error inserting ${spot.name}:`, error.message);
        // Continue with next spot instead of failing completely
        continue;
      }
    }
    
    // Verify insertion
    console.log('\n🔍 Verifying insertion...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('hiking_spots')
      .select('id, name')
      .order('name');
    
    if (verifyError) {
      console.error('❌ Error verifying data:', verifyError.message);
    } else {
      console.log('\n📋 Verification - Inserted hiking spots:');
      verifyData.forEach((spot, index) => {
        console.log(`   ${index + 1}. ${spot.name} (ID: ${spot.id})`);
      });
      console.log(`\n✅ Total spots in database: ${verifyData.length}`);
    }
    
    console.log('\n🎉 Hiking spots insertion completed!');
    
  } catch (error) {
    console.error('❌ Insertion failed:', error.message);
    process.exit(1);
  }
}

insertHikingSpotsWithSQL();