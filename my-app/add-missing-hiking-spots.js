import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://tppimfexrhptzdxlxcbj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcGltZmV4cmhwdHpkeGx4Y2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA5MzczMywiZXhwIjoyMDczNjY5NzMzfQ.SYCLq43OaWJv-M6JH6eZonwNgApI6wJlr_pr7ROAGzM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// All 15 hiking spots data (from mockHikingSpots.ts)
const hikingSpots = [
  {
    hiking_spot_id: 71, // Mount Babag (already exists)
    name: 'Mount Babag',
    description: 'A popular hiking destination in Cebu City offering stunning panoramic views and diverse trail options ranging from easy forest walks to challenging ridge traverses.',
    difficulty: 'Hard',
    location_text: 'Cebu City, Cebu',
    cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    average_rating: 4.5,
    number_of_reviews: 120,
    rating: 4.5,
    review_count: 120,
    coordinates: '(123.8860,10.3613)',
    latitude: 10.3613,
    longitude: 123.8860,
    elevation: 650,
    trail_length: 8.5,
    estimated_duration: 270,
    images: [],
    amenities: ['Parking', 'Trail Markers', 'Scenic Views', 'Rest Areas'],
    best_season: ['Dry Season', 'Cool Weather'],
    is_verified: true
  },
  {
    hiking_spot_id: 75, // Mount Kan-irag / Sirao Peak (new)
    name: 'Mount Kan-irag',
    description: 'A scenic mountain peak in Cebu City famous for its flower gardens, rolling grasslands, and breathtaking summit views. Features trails from easy garden walks to extreme ridge exposures.',
    difficulty: 'Advanced',
    location_text: 'Cebu City, Cebu',
    cover_image_url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    image_url: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    average_rating: 4.6,
    number_of_reviews: 95,
    rating: 4.6,
    review_count: 95,
    coordinates: '(123.8585,10.3970)',
    latitude: 10.3970,
    longitude: 123.8585,
    elevation: 800,
    trail_length: 6.2,
    estimated_duration: 240,
    images: [],
    amenities: ['Parking', 'Trail Markers', 'Scenic Views', 'Flower Gardens'],
    best_season: ['Dry Season', 'Cool Weather'],
    is_verified: true
  },
  {
    hiking_spot_id: 76, // Mount Naupa (new)
    name: 'Mount Naupa',
    description: 'A beautiful grassland mountain in Naga, Cebu offering rolling hills, eco trails, and spectacular ridge walks. Perfect for both beginners and experienced hikers seeking scenic views.',
    difficulty: 'Advanced',
     location_text: 'Naga, Cebu',
    cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    average_rating: 4.3,
    number_of_reviews: 87,
    rating: 4.3,
    review_count: 87,
    coordinates: '(123.7698,10.2558)',
    latitude: 10.2558,
    longitude: 123.7698,
    elevation: 750,
    trail_length: 7.8,
    estimated_duration: 300,
    images: [],
    amenities: ['Parking', 'Trail Markers', 'Scenic Views', 'Grasslands'],
    best_season: ['Dry Season', 'Cool Weather'],
    is_verified: true
  },
  {
    hiking_spot_id: 77, // Mount Manunggal (new)
    name: 'Mount Manunggal',
    description: 'A historic mountain in Balamban, Cebu featuring heritage trails, grass ridges, and forest climbs. Known for its historical significance and diverse terrain from meadows to narrow ridges.',
    difficulty: 'Advanced',
     location_text: 'Balamban, Cebu',
    cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    average_rating: 4.4,
    number_of_reviews: 76,
    rating: 4.4,
    review_count: 76,
    coordinates: '(123.7831,10.4939)',
    latitude: 10.4939,
    longitude: 123.7831,
    elevation: 900,
    trail_length: 9.5,
    estimated_duration: 360,
    images: [],
    amenities: ['Parking', 'Trail Markers', 'Historic Sites', 'Rest Areas'],
    best_season: ['Dry Season', 'Cool Weather'],
    is_verified: true
  },
  {
    hiking_spot_id: 78, // Mount Mago (new)
    name: 'Mount Mago',
    description: 'A scenic mountain in Carmen, Cebu featuring meadow trails, farm ridges, and challenging climbs. Offers diverse terrain from rolling farmlands to continuous steep ascents with summit views.',
    difficulty: 'Advanced',
     location_text: 'Carmen, Cebu',
    cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    average_rating: 4.6,
    number_of_reviews: 52,
    rating: 4.6,
    review_count: 52,
    coordinates: '(123.9000,10.7100)',
    latitude: 10.7100,
    longitude: 123.9000,
    elevation: 1100,
    trail_length: 12.3,
    estimated_duration: 420,
    images: [],
    amenities: ['Parking', 'Trail Markers', 'Scenic Views', 'Farm Views'],
    best_season: ['Dry Season', 'Cool Weather'],
    is_verified: true
  },
  {
    hiking_spot_id: 79, // Mount Kapayas (new)
    name: 'Mount Kapayas',
    description: 'A scenic mountain trail offering beautiful views and diverse flora.',
    difficulty: 'Moderate',
    location_text: 'Catmon, Cebu',
    cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    average_rating: 4.3,
    number_of_reviews: 38,
    rating: 4.3,
    review_count: 38,
    coordinates: '(124.0167,10.7167)',
    latitude: 10.7167,
    longitude: 124.0167,
    elevation: 850,
    trail_length: 8.0,
    estimated_duration: 300,
    images: [],
    amenities: ['Parking', 'Trail Markers', 'Scenic Views', 'Flora'],
    best_season: ['Dry Season', 'Cool Weather'],
    is_verified: true
  },
  {
    hiking_spot_id: 80, // Mount Lantoy (new)
    name: 'Mount Lantoy',
    description: 'A scenic mountain trail with beautiful coastal views and diverse flora.',
    difficulty: 'Moderate',
    location_text: 'Argao, Cebu',
    cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    average_rating: 4.2,
    number_of_reviews: 29,
    rating: 4.2,
    review_count: 29,
    coordinates: '(123.6167,9.8833)',
    latitude: 9.8833,
    longitude: 123.6167,
    elevation: 700,
    trail_length: 6.5,
    estimated_duration: 240,
    images: [],
    amenities: ['Parking', 'Trail Markers', 'Coastal Views', 'Flora'],
    best_season: ['Dry Season', 'Cool Weather'],
    is_verified: true
  },
  {
    hiking_spot_id: 81, // Mount Kalbasaan (new) - will be removed later
    name: 'Mount Kalbasaan',
    description: 'A beautiful mountain offering panoramic views and challenging trails.',
    difficulty: 'Moderate',
    location_text: 'Minglanilla, Cebu',
    cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    average_rating: 4.1,
    number_of_reviews: 25,
    rating: 4.1,
    review_count: 25,
    coordinates: '(123.7833,10.2333)',
    latitude: 10.2333,
    longitude: 123.7833,
    elevation: 600,
    trail_length: 5.5,
    estimated_duration: 210,
    images: [],
    amenities: ['Parking', 'Trail Markers', 'Scenic Views'],
    best_season: ['Dry Season', 'Cool Weather'],
    is_verified: true
  },
  {
    hiking_spot_id: 82, // Mount Mauyog (new)
    name: 'Mount Mauyog',
    description: 'A scenic mountain trail with diverse flora near Mt. Manunggal.',
    difficulty: 'Moderate',
    location_text: 'Balamban, near Mt. Manunggal, Cebu',
    cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    average_rating: 4.3,
    number_of_reviews: 31,
    rating: 4.3,
    review_count: 31,
    coordinates: '(123.7333,10.4667)',
    latitude: 10.4667,
    longitude: 123.7333,
    elevation: 750,
    trail_length: 7.2,
    estimated_duration: 280,
    images: [],
    amenities: ['Parking', 'Trail Markers', 'Flora', 'Rest Areas'],
    best_season: ['Dry Season', 'Cool Weather'],
    is_verified: true
  },
  {
    hiking_spot_id: 83, // Mount Lanaya (new)
    name: 'Mount Lanaya',
    description: 'A beautiful mountain offering stunning views and peaceful hiking experience.',
    difficulty: 'Moderate',
    location_text: 'Alegria, Cebu',
    cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    average_rating: 4.2,
    number_of_reviews: 27,
    rating: 4.2,
    review_count: 27,
    coordinates: '(123.4167,9.7667)',
    latitude: 9.7667,
    longitude: 123.4167,
    elevation: 650,
    trail_length: 6.8,
    estimated_duration: 250,
    images: [],
    amenities: ['Parking', 'Trail Markers', 'Scenic Views', 'Peaceful'],
    best_season: ['Dry Season', 'Cool Weather'],
    is_verified: true
  },
  {
    hiking_spot_id: 84, // Lugsangan Peak (new)
    name: 'Lugsangan Peak',
    description: 'A scenic elevated area offering beautiful views and challenging hiking trails.',
    difficulty: 'Moderate',
    location_text: 'Ginatilan, Cebu',
    cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    average_rating: 4.1,
    number_of_reviews: 52,
    rating: 4.1,
    review_count: 52,
    coordinates: '(123.3333,9.6167)',
    latitude: 9.6167,
    longitude: 123.3333,
    elevation: 800,
    trail_length: 8.5,
    estimated_duration: 320,
    images: [],
    amenities: ['Parking', 'Trail Markers', 'Scenic Views', 'Challenging'],
    best_season: ['Dry Season', 'Cool Weather'],
    is_verified: true
  },
  // Existing spots (72-74) - Osmeña Peak, Casino Peak, Spartan Trail
  {
    hiking_spot_id: 85, // Budlaan Falls (new)
    name: 'Budlaan Falls',
    description: 'A beautiful waterfall with trekking trail to Mt. Kan-irag, perfect for nature lovers.',
    difficulty: 'Moderate',
    location_text: 'Cebu City – trekking trail to Mt. Kan-irag',
    cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    average_rating: 4.4,
    number_of_reviews: 34,
    rating: 4.4,
    review_count: 34,
    coordinates: '(123.8600,10.3300)',
    latitude: 10.3300,
    longitude: 123.8600,
    elevation: 400,
    trail_length: 4.5,
    estimated_duration: 180,
    images: [],
    amenities: ['Parking', 'Trail Markers', 'Waterfall', 'Nature'],
    best_season: ['Dry Season', 'Cool Weather'],
    is_verified: true
  }
];

async function addMissingHikingSpots() {
  console.log('Starting to add missing hiking spots to database...');
  
  try {
    // First, check what spots already exist
    const { data: existingSpots, error: fetchError } = await supabase
      .from('hiking_spots')
      .select('hiking_spot_id, name');
    
    if (fetchError) {
      console.error('Error fetching existing spots:', fetchError);
      return;
    }
    
    console.log('Existing spots in database:');
    existingSpots.forEach(spot => console.log(`- ID ${spot.hiking_spot_id}: ${spot.name}`));
    
    const existingIds = existingSpots.map(spot => spot.hiking_spot_id);
    const spotsToAdd = hikingSpots.filter(spot => !existingIds.includes(spot.hiking_spot_id));
    
    console.log(`\nNeed to add ${spotsToAdd.length} new spots:`);
    spotsToAdd.forEach(spot => console.log(`- ID ${spot.hiking_spot_id}: ${spot.name}`));
    
    if (spotsToAdd.length === 0) {
      console.log('All spots already exist in database!');
      return;
    }
    
    // Add the missing spots
    const { data, error } = await supabase
      .from('hiking_spots')
      .insert(spotsToAdd)
      .select();
    
    if (error) {
      console.error('Error adding hiking spots:', error);
      return;
    }
    
    console.log(`\nSuccessfully added ${data.length} hiking spots to database!`);
    data.forEach(spot => console.log(`✅ Added: ${spot.name} (ID: ${spot.hiking_spot_id})`));
    
  } catch (err) {
    console.error('Failed to add hiking spots:', err.message);
  }
}

// Run the script
addMissingHikingSpots();