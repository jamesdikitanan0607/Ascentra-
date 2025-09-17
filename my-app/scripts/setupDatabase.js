import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  console.error('Make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Sample hiking spots data with correct column names matching the schema
// We'll get the authenticated user ID after signing in
let SYSTEM_USER_ID = null;

const hikingSpots = [
  {
    name: 'Mount Babag',
    description: 'A popular hiking destination offering panoramic views of Cebu City and surrounding areas.',
    latitude: 10.3157,
    longitude: 123.8854,
    difficulty: 'Moderate',
    elevation: 800,
    trail_length: 4.2,
    estimated_duration: 240, // 4 hours in minutes
    rating: 4.5,
    best_season: ['December', 'January', 'February', 'March', 'April', 'May'],
    amenities: ['Parking', 'Viewpoint', 'Trail Markers'],
    image_url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800',
    is_verified: true,
    created_by: SYSTEM_USER_ID
  },
  {
    name: 'Mount Kan-irag / Sirao Peak',
    description: 'Known for its flower gardens and cool climate, perfect for nature lovers.',
    latitude: 10.3456,
    longitude: 123.8234,
    difficulty: 'Moderate',
    elevation: 1000,
    trail_length: 3.1,
    estimated_duration: 180, // 3 hours in minutes
    rating: 4.6,
    best_season: ['November', 'December', 'January', 'February', 'March'],
    amenities: ['Parking', 'Flower Gardens', 'Cafe'],
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    is_verified: true,
    created_by: SYSTEM_USER_ID
  },
  {
    name: 'Mount Naupa',
    description: 'A challenging hike with rewarding views of the surrounding mountains.',
    latitude: 10.2089,
    longitude: 123.7567,
    difficulty: 'Hard',
    elevation: 1200,
    trail_length: 6.8,
    estimated_duration: 300, // 5 hours in minutes
    rating: 4.3,
    best_season: ['December', 'January', 'February', 'March', 'April'],
    amenities: ['Parking', 'Viewpoint', 'Camping Area'],
    image_url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800',
    is_verified: true,
    created_by: SYSTEM_USER_ID
  },
  {
    name: 'Mount Manunggal',
    description: 'Historical significance with the crash site of President Ramon Magsaysay.',
    latitude: 10.4833,
    longitude: 123.7167,
    difficulty: 'Moderate',
    elevation: 1003,
    trail_length: 5.2,
    estimated_duration: 360, // 6 hours in minutes
    rating: 4.4,
    best_season: ['December', 'January', 'February', 'March', 'April', 'May'],
    amenities: ['Parking', 'Monument', 'Historical Site'],
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    is_verified: true,
    created_by: SYSTEM_USER_ID
  },
  {
    name: 'Mount Mago',
    description: 'One of the highest peaks in Cebu with stunning sunrise views.',
    latitude: 10.1500,
    longitude: 123.8000,
    difficulty: 'Hard',
    elevation: 1200,
    trail_length: 8.5,
    estimated_duration: 480, // 8 hours in minutes
    rating: 4.6,
    best_season: ['November', 'December', 'January', 'February', 'March'],
    amenities: ['Parking', 'Camping Area', 'Sunrise Viewpoint'],
    image_url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800',
    is_verified: true,
    created_by: SYSTEM_USER_ID
  },
  {
    name: 'Mount Kapayas',
    description: 'A lesser-known gem offering tranquil hiking experience.',
    latitude: 10.3789,
    longitude: 123.6456,
    difficulty: 'Moderate',
    elevation: 900,
    trail_length: 4.0,
    estimated_duration: 240, // 4 hours in minutes
    rating: 4.3,
    best_season: ['December', 'January', 'February', 'March', 'April'],
    amenities: ['Parking', 'Rest Area'],
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    is_verified: true,
    created_by: SYSTEM_USER_ID
  },
  {
    name: 'Mount Lantoy',
    description: 'Beautiful mountain with diverse flora and fauna.',
    latitude: 9.8833,
    longitude: 123.6167,
    difficulty: 'Moderate',
    elevation: 1100,
    trail_length: 5.5,
    estimated_duration: 300, // 5 hours in minutes
    rating: 4.2,
    best_season: ['November', 'December', 'January', 'February', 'March', 'April'],
    amenities: ['Parking', 'Wildlife Viewing'],
    image_url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800',
    is_verified: true,
    created_by: SYSTEM_USER_ID
  },
  {
    name: 'Mount Kalbasaan',
    description: 'Scenic mountain trail with waterfalls along the way.',
    latitude: 9.8667,
    longitude: 123.3833,
    difficulty: 'Moderate',
    elevation: 850,
    trail_length: 4.5,
    estimated_duration: 240, // 4 hours in minutes
    rating: 4.1,
    best_season: ['December', 'January', 'February', 'March', 'April', 'May'],
    amenities: ['Parking', 'Waterfall', 'Swimming Area'],
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    is_verified: true,
    created_by: SYSTEM_USER_ID
  },
  {
    name: 'Mount Mauyog',
    description: 'Peaceful hiking destination with great views of the coastline.',
    latitude: 10.1167,
    longitude: 123.5167,
    difficulty: 'Moderate',
    elevation: 750,
    trail_length: 3.8,
    estimated_duration: 240, // 4 hours in minutes
    rating: 4.3,
    best_season: ['November', 'December', 'January', 'February', 'March'],
    amenities: ['Parking', 'Coastal View'],
    image_url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800',
    is_verified: true,
    created_by: SYSTEM_USER_ID
  },
  {
    name: 'Mount Lanaya',
    description: 'Hidden gem with pristine nature and cool climate.',
    latitude: 9.7667,
    longitude: 123.3500,
    difficulty: 'Moderate',
    elevation: 1000,
    trail_length: 5.0,
    estimated_duration: 300, // 5 hours in minutes
    rating: 4.2,
    best_season: ['December', 'January', 'February', 'March', 'April'],
    amenities: ['Parking', 'Cool Climate'],
    image_url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800',
    is_verified: true,
    created_by: SYSTEM_USER_ID
  },
  {
    name: 'Mount Hambubuyog',
    description: 'Challenging trail with rewarding panoramic views.',
    latitude: 9.6000,
    longitude: 123.3333,
    difficulty: 'Hard',
    elevation: 1200,
    trail_length: 7.2,
    estimated_duration: 360, // 6 hours in minutes
    rating: 4.1,
    best_season: ['November', 'December', 'January', 'February', 'March', 'April'],
    amenities: ['Parking', 'Panoramic View'],
    image_url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800',
    is_verified: true,
    created_by: SYSTEM_USER_ID
  },
  {
    name: 'Osmeña Peak',
    description: 'Highest peak in Cebu with rolling hills and stunning views.',
    latitude: 9.7500,
    longitude: 123.4167,
    difficulty: 'Easy',
    elevation: 1013,
    trail_length: 2.0,
    estimated_duration: 120, // 2 hours in minutes
    rating: 4.8,
    best_season: ['November', 'December', 'January', 'February', 'March', 'April', 'May'],
    amenities: ['Parking', 'Rolling Hills', 'Photography'],
    image_url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800',
    is_verified: true,
    created_by: SYSTEM_USER_ID
  },
  {
    name: 'Casino Peak',
    description: 'Easy hike with beautiful sunset views.',
    latitude: 9.7400,
    longitude: 123.4200,
    difficulty: 'Easy',
    elevation: 800,
    trail_length: 1.8,
    estimated_duration: 120, // 2 hours in minutes
    rating: 4.5,
    best_season: ['December', 'January', 'February', 'March', 'April', 'May'],
    amenities: ['Parking', 'Sunset View'],
    image_url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800',
    is_verified: true,
    created_by: SYSTEM_USER_ID
  },
  {
    name: 'Budlaan Falls',
    description: 'Combination of hiking and waterfall exploration.',
    latitude: 9.5333,
    longitude: 123.3167,
    difficulty: 'Moderate',
    elevation: 400,
    trail_length: 2.5,
    estimated_duration: 180, // 3 hours in minutes
    rating: 4.4,
    best_season: ['June', 'July', 'August', 'September', 'October', 'November'],
    amenities: ['Parking', 'Waterfall', 'Swimming Area'],
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    is_verified: true
  },
  {
    name: 'Spartan Trail',
    description: 'Extreme hiking challenge for experienced hikers.',
    latitude: 9.4833,
    longitude: 123.3833,
    difficulty: 'Expert',
    elevation: 1100,
    trail_length: 9.5,
    estimated_duration: 480, // 8 hours in minutes
    rating: 4.4,
    best_season: ['November', 'December', 'January', 'February', 'March'],
    amenities: ['Parking', 'Extreme Challenge'],
    image_url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800',
    is_verified: true,
    created_by: SYSTEM_USER_ID
  }
];



async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...');
    
    // Sign in with a temporary user for setup
    console.log('🔐 Authenticating for setup...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'setup@hiking.app',
      password: 'setup123456'
    });
    
    if (authError) {
      // Try to sign up if user doesn't exist
      console.log('👤 Creating setup user...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'setup@hiking.app',
        password: 'setup123456'
      });
      
      if (signUpError) {
        console.error('❌ Authentication failed:', signUpError.message);
        return;
      }
      
      SYSTEM_USER_ID = signUpData.user?.id;
    } else {
      SYSTEM_USER_ID = authData.user?.id;
    }
    
    if (!SYSTEM_USER_ID) {
      console.error('❌ Could not get user ID for setup');
      return;
    }
    
    console.log('✅ Authenticated successfully');
    
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('hiking_spots')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await supabase.from('trail_routes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('hiking_spots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Update hiking spots with the authenticated user ID
     const hikingSpotsWithUser = hikingSpots.map(spot => ({
       ...spot,
       created_by: SYSTEM_USER_ID
     }));
     
     // Insert hiking spots
      console.log('🏔️ Inserting hiking spots...');
      const { data: spotsData, error: spotsError } = await supabase
        .from('hiking_spots')
        .insert(hikingSpotsWithUser)
        .select('id, name');
    
    if (spotsError) {
      console.error('❌ Error inserting hiking spots:', spotsError.message);
      return;
    }
    
    console.log('✅ Successfully inserted hiking spots');
    
    console.log('\n🎉 Database setup completed successfully!');
    
    // Verify the data
    const { data: spots, error: spotsVerifyError } = await supabase
      .from('hiking_spots')
      .select('name, difficulty, rating');
    
    if (!spotsVerifyError && spots) {
      console.log(`\n📊 Verification: Found ${spots.length} hiking spots`);
      spots.forEach(spot => {
        console.log(`  - ${spot.name} (${spot.difficulty}) - Rating: ${spot.rating}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupDatabase();