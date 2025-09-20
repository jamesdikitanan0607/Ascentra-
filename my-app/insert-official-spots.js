import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

// Create Supabase client with service role to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// The 15 official Cebu hiking spots data
const officialHikingSpots = [
  {
    name: 'Mount Babag',
    description: 'A popular hiking destination offering panoramic views of Cebu City and surrounding areas. Known for its accessible trails and beautiful sunrise views.',
    difficulty: 'Moderate',
    elevation: 850,
    trail_length: 8.5,
    estimated_duration: 180,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    images: [],
    amenities: ['Parking', 'Restrooms', 'Trail markers', 'Viewpoint'],
    best_season: ['November', 'December', 'January', 'February', 'March', 'April'],
    is_verified: true,
    rating: 4.5,
    review_count: 128,
    latitude: 10.3157,
    longitude: 123.9621
  },
  {
    name: 'Mount Kan-irag',
    description: 'Famous for its flower gardens and cool climate. The peak offers stunning views and is known for its colorful celosia flowers.',
    difficulty: 'Easy',
    elevation: 1200,
    trail_length: 6.2,
    estimated_duration: 120,
    image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    images: [],
    amenities: ['Parking', 'Flower garden', 'Cafe', 'Restrooms'],
    best_season: ['November', 'December', 'January', 'February'],
    is_verified: true,
    rating: 4.3,
    review_count: 95,
    latitude: 10.3308,
    longitude: 123.9456
  },
  {
    name: 'Mount Naupa',
    description: 'A challenging hike with rewarding views of the southern part of Cebu. Known for its rocky terrain and diverse flora.',
    difficulty: 'Hard',
    elevation: 1080,
    trail_length: 12.3,
    estimated_duration: 300,
    image_url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=600&fit=crop',
    images: [],
    amenities: ['Trail markers', 'Camping area'],
    best_season: ['December', 'January', 'February', 'March'],
    is_verified: true,
    rating: 4.2,
    review_count: 67,
    latitude: 10.2097,
    longitude: 123.7564
  },
  {
    name: 'Mount Manunggal',
    description: 'Historical significance as the crash site of President Ramon Magsaysay. Offers great views and historical monuments.',
    difficulty: 'Moderate',
    elevation: 980,
    trail_length: 15.7,
    estimated_duration: 240,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    images: [],
    amenities: ['Historical monument', 'Trail markers', 'Parking'],
    best_season: ['November', 'December', 'January', 'February', 'March'],
    is_verified: true,
    rating: 4.1,
    review_count: 89,
    latitude: 10.4897,
    longitude: 123.7234
  },
  {
    name: 'Mount Mago',
    description: 'A lesser-known peak offering solitude and pristine nature. Great for experienced hikers seeking adventure.',
    difficulty: 'Hard',
    elevation: 1250,
    trail_length: 18.4,
    estimated_duration: 360,
    image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    images: [],
    amenities: ['Trail markers', 'Camping area', 'Water source'],
    best_season: ['December', 'January', 'February'],
    is_verified: true,
    rating: 4.0,
    review_count: 45,
    latitude: 10.5234,
    longitude: 124.0123
  },
  {
    name: 'Mount Kapayas',
    description: 'Known for its lush vegetation and cool climate. A perfect spot for nature lovers and bird watching.',
    difficulty: 'Moderate',
    elevation: 890,
    trail_length: 10.8,
    estimated_duration: 180,
    image_url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=600&fit=crop',
    images: [],
    amenities: ['Bird watching area', 'Trail markers', 'Rest areas'],
    best_season: ['November', 'December', 'January', 'February', 'March'],
    is_verified: true,
    rating: 4.3,
    review_count: 72,
    latitude: 10.7234,
    longitude: 124.0567
  },
  {
    name: 'Mount Lantoy',
    description: 'Offers spectacular views of the southern coastline of Cebu. Known for its challenging trails and beautiful landscapes.',
    difficulty: 'Hard',
    elevation: 1150,
    trail_length: 14.2,
    estimated_duration: 300,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    images: [],
    amenities: ['Viewpoint', 'Trail markers', 'Camping area'],
    best_season: ['December', 'January', 'February', 'March'],
    is_verified: true,
    rating: 4.4,
    review_count: 56,
    latitude: 9.8734,
    longitude: 123.6123
  },
  {
    name: 'Mount Kalbasaan',
    description: 'A relatively easy hike with great views of the metro area. Perfect for beginners and family hiking trips.',
    difficulty: 'Easy',
    elevation: 650,
    trail_length: 5.6,
    estimated_duration: 120,
    image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    images: [],
    amenities: ['Family-friendly', 'Parking', 'Restrooms', 'Picnic area'],
    best_season: ['November', 'December', 'January', 'February', 'March', 'April'],
    is_verified: true,
    rating: 4.2,
    review_count: 84,
    latitude: 10.2456,
    longitude: 123.7890
  },
  {
    name: 'Mount Mauyog',
    description: 'A scenic peak near Mount Manunggal offering similar historical significance and beautiful mountain views.',
    difficulty: 'Moderate',
    elevation: 920,
    trail_length: 13.5,
    estimated_duration: 210,
    image_url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=600&fit=crop',
    images: [],
    amenities: ['Historical site', 'Trail markers', 'Viewpoint'],
    best_season: ['November', 'December', 'January', 'February', 'March'],
    is_verified: true,
    rating: 4.1,
    review_count: 63,
    latitude: 10.4756,
    longitude: 123.7345
  },
  {
    name: 'Mount Lanaya',
    description: 'Known for its pristine waterfalls and diverse ecosystem. A great combination of hiking and nature exploration.',
    difficulty: 'Hard',
    elevation: 1080,
    trail_length: 16.8,
    estimated_duration: 330,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    images: [],
    amenities: ['Waterfall', 'Swimming area', 'Trail markers', 'Camping area'],
    best_season: ['December', 'January', 'February', 'March'],
    is_verified: true,
    rating: 4.3,
    review_count: 41,
    latitude: 9.7234,
    longitude: 123.4567
  },
  {
    name: 'Mount Hambubuyog',
    description: 'A challenging peak in the southern part of Cebu offering panoramic views of the Bohol Sea and surrounding islands.',
    difficulty: 'Hard',
    elevation: 1320,
    trail_length: 19.2,
    estimated_duration: 390,
    image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    images: [],
    amenities: ['Sea view', 'Trail markers', 'Camping area'],
    best_season: ['December', 'January', 'February'],
    is_verified: true,
    rating: 4.2,
    review_count: 38,
    latitude: 9.6123,
    longitude: 123.3456
  },
  {
    name: 'Osmeña Peak',
    description: 'The highest peak in Cebu offering breathtaking 360-degree views. Famous for its rolling hills and cool climate.',
    difficulty: 'Easy',
    elevation: 1013,
    trail_length: 4.2,
    estimated_duration: 90,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    images: [],
    amenities: ['Highest peak', 'Viewpoint', 'Parking', 'Restrooms'],
    best_season: ['November', 'December', 'January', 'February', 'March'],
    is_verified: true,
    rating: 4.6,
    review_count: 156,
    latitude: 9.7567,
    longitude: 123.4234
  },
  {
    name: 'Casino Peak',
    description: 'Located near Osmeña Peak, this spot offers similar stunning views with fewer crowds. Great for photography.',
    difficulty: 'Easy',
    elevation: 980,
    trail_length: 5.8,
    estimated_duration: 120,
    image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    images: [],
    amenities: ['Photography spot', 'Viewpoint', 'Less crowded'],
    best_season: ['November', 'December', 'January', 'February', 'March'],
    is_verified: true,
    rating: 4.4,
    review_count: 78,
    latitude: 9.7456,
    longitude: 123.4345
  },
  {
    name: 'Budlaan Falls',
    description: 'A beautiful waterfall with a trekking trail that connects to Mount Kan-irag. Perfect for waterfall lovers and hikers.',
    difficulty: 'Moderate',
    elevation: 750,
    trail_length: 9.5,
    estimated_duration: 180,
    image_url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=600&fit=crop',
    images: [],
    amenities: ['Waterfall', 'Swimming area', 'Trail markers', 'Picnic area'],
    best_season: ['November', 'December', 'January', 'February', 'March', 'April'],
    is_verified: true,
    rating: 4.4,
    review_count: 103,
    latitude: 10.3456,
    longitude: 123.9234
  },
  {
    name: 'Mount Kalawisan (Kanlaas Ridge)',
    description: 'A scenic ridge offering panoramic views of northern Cebu. Known for its rolling hills and grasslands.',
    difficulty: 'Moderate',
    elevation: 780,
    trail_length: 11.2,
    estimated_duration: 210,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    images: [],
    amenities: ['Ridge walk', 'Grasslands', 'Viewpoint', 'Trail markers'],
    best_season: ['November', 'December', 'January', 'February', 'March'],
    is_verified: true,
    rating: 4.3,
    review_count: 67,
    latitude: 10.8234,
    longitude: 124.1234
  }
];

async function insertOfficialHikingSpots() {
  try {
    console.log('🚀 Starting official hiking spots insertion...');
    
    // Clear existing hiking spots
    console.log('🗑️ Clearing existing hiking spots...');
    const { error: deleteError } = await supabase
      .from('hiking_spots')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) {
      console.error('❌ Error clearing existing data:', deleteError);
      return;
    }
    
    console.log('✅ Existing data cleared successfully');
    
    // Insert new hiking spots
    console.log('📍 Inserting 15 official hiking spots...');
    const { data, error } = await supabase
      .from('hiking_spots')
      .insert(officialHikingSpots)
      .select();
    
    if (error) {
      console.error('❌ Error inserting hiking spots:', error.message);
      console.error('Error details:', error);
      return;
    }
    
    console.log('✅ Successfully inserted', data.length, 'hiking spots');
    console.log('🎉 Official hiking spots setup completed!');
    
    // Display inserted spots
    data.forEach((spot, index) => {
      console.log(`${index + 1}. ${spot.name} (${spot.difficulty}) - ${spot.elevation}m`);
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the insertion
insertOfficialHikingSpots();