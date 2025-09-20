import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://tppimfexrhptzdxlxcbj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcGltZmV4cmhwdHpkeGx4Y2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA5MzczMywiZXhwIjoyMDczNjY5NzMzfQ.SYCLq43OaWJv-M6JH6eZonwNgApI6wJlr_pr7ROAGzM');

// Trail routes for hiking spots 75-85 (app IDs 2-15, excluding 1 and 12-15 which already exist)
const newTrailRoutes = [
  // Mount Kan-irag / Sirao Peak (hiking_spot_id: 75)
  {
    hiking_spot_id: 75,
    name: 'Sirao Garden Trail',
    description: 'Easy trail through flower gardens with scenic views',
    difficulty: 'Easy',
    length: 2.2,
    elevation_gain: 180,
    estimated_time: 72, // 1.2 hours = 72 minutes
    trail_type: 'Out and Back',
    waypoints: JSON.stringify([
      { lat: 10.3941, lng: 123.8573, name: 'Trailhead' },
      { lat: 10.3950, lng: 123.8578, name: 'Garden View' },
      { lat: 10.3970, lng: 123.8585, name: 'Summit' }
    ]),
    is_active: true
  },
  {
    hiking_spot_id: 75,
    name: 'Kan-irag Summit Trail',
    description: 'Moderate trail to the summit with panoramic views',
    difficulty: 'Moderate',
    length: 4.8,
    elevation_gain: 410,
    estimated_time: 150, // 2.5 hours = 150 minutes
    trail_type: 'Loop',
    waypoints: JSON.stringify([
      { lat: 10.3890, lng: 123.8520, name: 'Start' },
      { lat: 10.3920, lng: 123.8540, name: 'Midpoint' },
      { lat: 10.3992, lng: 123.8612, name: 'Summit' }
    ]),
    is_active: true
  },

  // Mount Naupa (hiking_spot_id: 76)
  {
    hiking_spot_id: 76,
    name: 'Naupa Eco Trail',
    description: 'Easy grassland trail perfect for beginners',
    difficulty: 'Easy',
    length: 1.8,
    elevation_gain: 120,
    estimated_time: 60, // 1.0 hour = 60 minutes
    trail_type: 'Out and Back',
    waypoints: JSON.stringify([
      { lat: 10.2560, lng: 123.7660, name: 'Trailhead' },
      { lat: 10.2559, lng: 123.7670, name: 'Midpoint' },
      { lat: 10.2558, lng: 123.7698, name: 'End' }
    ]),
    is_active: true
  },
  {
    hiking_spot_id: 76,
    name: 'Naupa Ridge Walk',
    description: 'Moderate trail with rolling hills and summit views',
    difficulty: 'Moderate',
    length: 4.0,
    elevation_gain: 320,
    estimated_time: 132, // 2.2 hours = 132 minutes
    trail_type: 'Loop',
    waypoints: JSON.stringify([
      { lat: 10.2520, lng: 123.7620, name: 'Start' },
      { lat: 10.2540, lng: 123.7650, name: 'Ridge' },
      { lat: 10.2575, lng: 123.7722, name: 'Summit' }
    ]),
    is_active: true
  },

  // Mount Manunggal (hiking_spot_id: 77)
  {
    hiking_spot_id: 77,
    name: 'Manunggal Heritage Trail',
    description: 'Historic trail with cultural significance',
    difficulty: 'Easy',
    length: 2.2,
    elevation_gain: 160,
    estimated_time: 78, // 1.3 hours = 78 minutes
    trail_type: 'Out and Back',
    waypoints: JSON.stringify([
      { lat: 10.4911, lng: 123.7800, name: 'Heritage Site' },
      { lat: 10.4920, lng: 123.7810, name: 'Memorial' },
      { lat: 10.4939, lng: 123.7831, name: 'Summit' }
    ]),
    is_active: true
  },
  {
    hiking_spot_id: 77,
    name: 'Manunggal Ridge Trail',
    description: 'Moderate trail through forest to summit',
    difficulty: 'Moderate',
    length: 4.9,
    elevation_gain: 420,
    estimated_time: 156, // 2.6 hours = 156 minutes
    trail_type: 'Out and Back',
    waypoints: JSON.stringify([
      { lat: 10.4870, lng: 123.7752, name: 'Trailhead' },
      { lat: 10.4890, lng: 123.7780, name: 'Forest' },
      { lat: 10.4961, lng: 123.7860, name: 'Summit' }
    ]),
    is_active: true
  },

  // Mount Mago (hiking_spot_id: 78)
  {
    hiking_spot_id: 78,
    name: 'Mago Meadow Trail',
    description: 'Easy trail through beautiful meadows',
    difficulty: 'Easy',
    length: 2.0,
    elevation_gain: 140,
    estimated_time: 60, // 1.0 hour = 60 minutes
    trail_type: 'Out and Back',
    waypoints: JSON.stringify([
      { lat: 10.7081, lng: 123.8972, name: 'Meadow Start' },
      { lat: 10.7085, lng: 123.8980, name: 'Meadow Center' },
      { lat: 10.7100, lng: 123.9000, name: 'End' }
    ]),
    is_active: true
  },
  {
    hiking_spot_id: 78,
    name: 'Mago Hill Loop',
    description: 'Moderate loop trail with summit views',
    difficulty: 'Moderate',
    length: 4.6,
    elevation_gain: 360,
    estimated_time: 144, // 2.4 hours = 144 minutes
    trail_type: 'Loop',
    waypoints: JSON.stringify([
      { lat: 10.7040, lng: 123.8931, name: 'Start' },
      { lat: 10.7060, lng: 123.8950, name: 'Hill Base' },
      { lat: 10.7125, lng: 123.9022, name: 'Summit' }
    ]),
    is_active: true
  },

  // Mount Kapayas (hiking_spot_id: 79)
  {
    hiking_spot_id: 79,
    name: 'Kapayas Nature Trail',
    description: 'Easy trail through diverse flora and fauna',
    difficulty: 'Easy',
    length: 2.3,
    elevation_gain: 150,
    estimated_time: 72, // 1.2 hours = 72 minutes
    trail_type: 'Out and Back',
    waypoints: JSON.stringify([
      { lat: 10.7167, lng: 124.0167, name: 'Nature Start' },
      { lat: 10.7175, lng: 124.0180, name: 'Flora Point' },
      { lat: 10.7185, lng: 124.0195, name: 'End' }
    ]),
    is_active: true
  },
  {
    hiking_spot_id: 79,
    name: 'Kapayas Summit Trail',
    description: 'Moderate trail to the peak with panoramic views',
    difficulty: 'Moderate',
    length: 3.8,
    elevation_gain: 280,
    estimated_time: 120, // 2.0 hours = 120 minutes
    trail_type: 'Out and Back',
    waypoints: JSON.stringify([
      { lat: 10.7150, lng: 124.0140, name: 'Trailhead' },
      { lat: 10.7167, lng: 124.0167, name: 'Midpoint' },
      { lat: 10.7190, lng: 124.0200, name: 'Summit' }
    ]),
    is_active: true
  },

  // Mount Lantoy (hiking_spot_id: 80)
  {
    hiking_spot_id: 80,
    name: 'Lantoy Forest Trail',
    description: 'Easy forest trail with wildlife viewing opportunities',
    difficulty: 'Easy',
    length: 2.1,
    elevation_gain: 130,
    estimated_time: 66, // 1.1 hours = 66 minutes
    trail_type: 'Out and Back',
    waypoints: JSON.stringify([
      { lat: 9.8833, lng: 123.6167, name: 'Forest Entry' },
      { lat: 9.8840, lng: 123.6180, name: 'Wildlife Area' },
      { lat: 9.8850, lng: 123.6195, name: 'End' }
    ]),
    is_active: true
  },
  {
    hiking_spot_id: 80,
    name: 'Lantoy Ridge Walk',
    description: 'Moderate ridge trail with scenic overlooks',
    difficulty: 'Moderate',
    length: 4.2,
    elevation_gain: 320,
    estimated_time: 138, // 2.3 hours = 138 minutes
    trail_type: 'Loop',
    waypoints: JSON.stringify([
      { lat: 9.8820, lng: 123.6140, name: 'Start' },
      { lat: 9.8833, lng: 123.6167, name: 'Ridge' },
      { lat: 9.8860, lng: 123.6210, name: 'Overlook' }
    ]),
    is_active: true
  },

  // Mount Kalbasaan (hiking_spot_id: 81)
  {
    hiking_spot_id: 81,
    name: 'Kalbasaan Main Trail',
    description: 'Primary trail to the summit with moderate difficulty',
    difficulty: 'Moderate',
    length: 3.5,
    elevation_gain: 250,
    estimated_time: 108, // 1.8 hours = 108 minutes
    trail_type: 'Out and Back',
    waypoints: JSON.stringify([
      { lat: 10.2333, lng: 123.7833, name: 'Trailhead' },
      { lat: 10.2345, lng: 123.7850, name: 'Midpoint' },
      { lat: 10.2360, lng: 123.7870, name: 'Summit' }
    ]),
    is_active: true
  },
  {
    hiking_spot_id: 81,
    name: 'Kalbasaan Loop Trail',
    description: 'Circular trail with multiple viewpoints',
    difficulty: 'Easy',
    length: 2.8,
    elevation_gain: 180,
    estimated_time: 90, // 1.5 hours = 90 minutes
    trail_type: 'Loop',
    waypoints: JSON.stringify([
      { lat: 10.2320, lng: 123.7820, name: 'Start' },
      { lat: 10.2333, lng: 123.7833, name: 'Viewpoint 1' },
      { lat: 10.2350, lng: 123.7860, name: 'Viewpoint 2' }
    ]),
    is_active: true
  },

  // Mount Mauyog (hiking_spot_id: 82)
  {
    hiking_spot_id: 82,
    name: 'Mauyog Nature Walk',
    description: 'Easy trail through diverse flora near Mt. Manunggal',
    difficulty: 'Easy',
    length: 2.0,
    elevation_gain: 120,
    estimated_time: 60, // 1.0 hour = 60 minutes
    trail_type: 'Out and Back',
    waypoints: JSON.stringify([
      { lat: 10.4667, lng: 123.7333, name: 'Nature Start' },
      { lat: 10.4675, lng: 123.7345, name: 'Flora Area' },
      { lat: 10.4685, lng: 123.7360, name: 'End' }
    ]),
    is_active: true
  },
  {
    hiking_spot_id: 82,
    name: 'Mauyog Ridge Trail',
    description: 'Moderate trail with scenic mountain views',
    difficulty: 'Moderate',
    length: 3.7,
    elevation_gain: 290,
    estimated_time: 126, // 2.1 hours = 126 minutes
    trail_type: 'Out and Back',
    waypoints: JSON.stringify([
      { lat: 10.4650, lng: 123.7310, name: 'Trailhead' },
      { lat: 10.4667, lng: 123.7333, name: 'Ridge Start' },
      { lat: 10.4690, lng: 123.7370, name: 'Summit' }
    ]),
    is_active: true
  },

  // Mount Lanaya (hiking_spot_id: 83)
  {
    hiking_spot_id: 83,
    name: 'Lanaya Peaceful Trail',
    description: 'Easy trail offering peaceful hiking experience',
    difficulty: 'Easy',
    length: 2.4,
    elevation_gain: 160,
    estimated_time: 78, // 1.3 hours = 78 minutes
    trail_type: 'Out and Back',
    waypoints: JSON.stringify([
      { lat: 9.7667, lng: 123.4167, name: 'Peaceful Start' },
      { lat: 9.7675, lng: 123.4180, name: 'Midpoint' },
      { lat: 9.7685, lng: 123.4195, name: 'End' }
    ]),
    is_active: true
  },
  {
    hiking_spot_id: 83,
    name: 'Lanaya Summit Trail',
    description: 'Moderate trail to summit with stunning views',
    difficulty: 'Moderate',
    length: 4.1,
    elevation_gain: 340,
    estimated_time: 144, // 2.4 hours = 144 minutes
    trail_type: 'Out and Back',
    waypoints: JSON.stringify([
      { lat: 9.7650, lng: 123.4140, name: 'Trailhead' },
      { lat: 9.7667, lng: 123.4167, name: 'Midpoint' },
      { lat: 9.7690, lng: 123.4200, name: 'Summit' }
    ]),
    is_active: true
  },

  // Mount Hambubuyog (hiking_spot_id: 84)
  {
    hiking_spot_id: 84,
    name: 'Hambubuyog Forest Trail',
    description: 'Easy forest trail with rich biodiversity',
    difficulty: 'Easy',
    length: 2.2,
    elevation_gain: 140,
    estimated_time: 72, // 1.2 hours = 72 minutes
    trail_type: 'Out and Back',
    waypoints: JSON.stringify([
      { lat: 9.6167, lng: 123.3333, name: 'Forest Entry' },
      { lat: 9.6175, lng: 123.3345, name: 'Biodiversity Area' },
      { lat: 9.6185, lng: 123.3360, name: 'End' }
    ]),
    is_active: true
  },
  {
    hiking_spot_id: 84,
    name: 'Hambubuyog Ridge Walk',
    description: 'Moderate ridge trail with mountain vistas',
    difficulty: 'Moderate',
    length: 3.9,
    elevation_gain: 310,
    estimated_time: 132, // 2.2 hours = 132 minutes
    trail_type: 'Loop',
    waypoints: JSON.stringify([
      { lat: 9.6150, lng: 123.3310, name: 'Start' },
      { lat: 9.6167, lng: 123.3333, name: 'Ridge' },
      { lat: 9.6190, lng: 123.3370, name: 'Vista Point' }
    ]),
    is_active: true
  },

  // Waterfall (hiking_spot_id: 85)
  {
    hiking_spot_id: 85,
    name: 'Waterfall Base Trail',
    description: 'Easy trail to the waterfall base with minimal elevation',
    difficulty: 'Easy',
    length: 2.1,
    elevation_gain: 150,
    estimated_time: 90, // 1.5 hours = 90 minutes
    trail_type: 'Out and Back',
    waypoints: JSON.stringify([
      { lat: 10.3300, lng: 123.8600, name: 'Trailhead' },
      { lat: 10.3305, lng: 123.8610, name: 'Midpoint' },
      { lat: 10.3310, lng: 123.8620, name: 'Waterfall Base' }
    ]),
    is_active: true
  },
  {
    hiking_spot_id: 85,
    name: 'Falls Circuit Trail',
    description: 'Moderate circular route around the falls area',
    difficulty: 'Moderate',
    length: 3.8,
    elevation_gain: 280,
    estimated_time: 150, // 2.5 hours = 150 minutes
    trail_type: 'Loop',
    waypoints: JSON.stringify([
      { lat: 10.3290, lng: 123.8580, name: 'Circuit Start' },
      { lat: 10.3300, lng: 123.8600, name: 'Falls View' },
      { lat: 10.3320, lng: 123.8640, name: 'Circuit End' }
    ]),
    is_active: true
  }
];

async function addMissingTrailRoutes() {
  console.log('🏔️  Adding missing trail routes...');
  
  try {
    // Check existing routes
    const { data: existingRoutes, error: fetchError } = await supabase
      .from('trail_routes')
      .select('hiking_spot_id')
      .in('hiking_spot_id', [75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85]);
    
    if (fetchError) {
      console.error('❌ Error fetching existing routes:', fetchError);
      return;
    }
    
    const existingSpotIds = [...new Set(existingRoutes.map(route => route.hiking_spot_id))];
    console.log('📍 Found existing routes for spots:', existingSpotIds);
    
    // Filter out routes for spots that already have routes
    const routesToAdd = newTrailRoutes.filter(route => !existingSpotIds.includes(route.hiking_spot_id));
    
    if (routesToAdd.length === 0) {
      console.log('✅ All trail routes already exist!');
      return;
    }
    
    console.log(`➕ Adding ${routesToAdd.length} new trail routes...`);
    
    // Insert new routes
    const { data, error } = await supabase
      .from('trail_routes')
      .insert(routesToAdd)
      .select();
    
    if (error) {
      console.error('❌ Error inserting trail routes:', error);
      return;
    }
    
    console.log(`✅ Successfully added ${data.length} trail routes!`);
    console.log('📊 Routes added for hiking spots:', [...new Set(data.map(route => route.hiking_spot_id))]);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addMissingTrailRoutes();