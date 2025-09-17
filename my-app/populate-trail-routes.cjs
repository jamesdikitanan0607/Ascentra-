const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample trail routes data for the 15 hiking spots
const trailRoutesData = [
  // Mount Babag (Cebu City) - hiking_spot_id: 1
  {
    hiking_spot_id: 1,
    route_name: 'Babag Ridge Trail',
    difficulty: 'Moderate',
    start_coordinates: 'POINT(123.9094 10.3157)',
    distance_km: 3.2,
    elevation_gain_m: 450,
    estimated_duration_hr: 2.5,
    highlights: 'Panoramic city views, cool mountain breeze, pine trees',
    route_color: '#FF6B6B',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9094, 10.3157],
        [123.9098, 10.3162],
        [123.9105, 10.3168],
        [123.9112, 10.3175],
        [123.9118, 10.3182]
      ]
    }
  },
  {
    hiking_spot_id: 1,
    route_name: 'Babag Summit Trail',
    difficulty: 'Hard',
    start_coordinates: 'POINT(123.9090 10.3155)',
    distance_km: 4.8,
    elevation_gain_m: 680,
    estimated_duration_hr: 3.5,
    highlights: 'Challenging ascent, summit views, rock formations',
    route_color: '#4ECDC4',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9090, 10.3155],
        [123.9095, 10.3160],
        [123.9102, 10.3167],
        [123.9110, 10.3175],
        [123.9120, 10.3185]
      ]
    }
  },
  {
    hiking_spot_id: 1,
    route_name: 'Babag Nature Trail',
    difficulty: 'Easy',
    start_coordinates: 'POINT(123.9092 10.3156)',
    distance_km: 2.1,
    elevation_gain_m: 280,
    estimated_duration_hr: 1.5,
    highlights: 'Family-friendly, nature observation, bird watching',
    route_color: '#45B7D1',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9092, 10.3156],
        [123.9096, 10.3161],
        [123.9100, 10.3165],
        [123.9104, 10.3170],
        [123.9108, 10.3174]
      ]
    }
  },
  {
    hiking_spot_id: 1,
    route_name: 'Babag Sunrise Trail',
    difficulty: 'Moderate',
    start_coordinates: 'POINT(123.9088 10.3153)',
    distance_km: 3.8,
    elevation_gain_m: 520,
    estimated_duration_hr: 2.8,
    highlights: 'Best sunrise views, early morning hike, photography spots',
    route_color: '#96CEB4',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9088, 10.3153],
        [123.9093, 10.3158],
        [123.9099, 10.3164],
        [123.9106, 10.3171],
        [123.9114, 10.3179]
      ]
    }
  },
  {
    hiking_spot_id: 1,
    route_name: 'Babag Loop Trail',
    difficulty: 'Advanced',
    start_coordinates: 'POINT(123.9094 10.3157)',
    distance_km: 6.2,
    elevation_gain_m: 750,
    estimated_duration_hr: 4.5,
    highlights: 'Complete circuit, multiple viewpoints, challenging terrain',
    route_color: '#FFEAA7',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9094, 10.3157],
        [123.9100, 10.3165],
        [123.9108, 10.3173],
        [123.9115, 10.3180],
        [123.9110, 10.3175],
        [123.9102, 10.3167],
        [123.9094, 10.3157]
      ]
    }
  },

  // Mount Kan-irag / Sirao Peak (Cebu City) - hiking_spot_id: 2
  {
    hiking_spot_id: 2,
    route_name: 'Sirao Flower Trail',
    difficulty: 'Easy',
    start_coordinates: 'POINT(123.9200 10.3300)',
    distance_km: 2.5,
    elevation_gain_m: 320,
    estimated_duration_hr: 1.8,
    highlights: 'Colorful flower gardens, scenic views, cool climate',
    route_color: '#FF6B6B',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9200, 10.3300],
        [123.9205, 10.3305],
        [123.9210, 10.3310],
        [123.9215, 10.3315],
        [123.9220, 10.3320]
      ]
    }
  },
  {
    hiking_spot_id: 2,
    route_name: 'Kan-irag Summit Trail',
    difficulty: 'Moderate',
    start_coordinates: 'POINT(123.9195 10.3295)',
    distance_km: 4.2,
    elevation_gain_m: 580,
    estimated_duration_hr: 3.0,
    highlights: 'Summit views, pine forest, mountain breeze',
    route_color: '#4ECDC4',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9198, 10.3298],
        [123.9203, 10.3303],
        [123.9208, 10.3308],
        [123.9213, 10.3313],
        [123.9218, 10.3318]
      ]
    }
  },
  {
    hiking_spot_id: 2,
    route_name: 'Sirao Ridge Walk',
    difficulty: 'Easy',
    distance_km: 1.8,
    elevation_gain_m: 180,
    estimated_duration_hr: 1.2,
    highlights: 'Easy ridge walk, panoramic views, beginner-friendly',
    route_color: '#45B7D1',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9202, 10.3302],
        [123.9206, 10.3306],
        [123.9210, 10.3310],
        [123.9214, 10.3314],
        [123.9218, 10.3318]
      ]
    }
  },
  {
    hiking_spot_id: 2,
    route_name: 'Temple of Leah Trail',
    difficulty: 'Moderate',
    distance_km: 3.5,
    elevation_gain_m: 420,
    estimated_duration_hr: 2.5,
    highlights: 'Historic temple, cultural sites, city views',
    route_color: '#96CEB4',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9195, 10.3295],
        [123.9200, 10.3300],
        [123.9205, 10.3305],
        [123.9210, 10.3310],
        [123.9215, 10.3315]
      ]
    }
  },
  {
    hiking_spot_id: 2,
    route_name: 'Sirao Adventure Trail',
    difficulty: 'Hard',
    distance_km: 5.8,
    elevation_gain_m: 720,
    estimated_duration_hr: 4.0,
    highlights: 'Challenging terrain, multiple peaks, adventure seekers',
    route_color: '#FFEAA7',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9190, 10.3290],
        [123.9198, 10.3298],
        [123.9206, 10.3306],
        [123.9214, 10.3314],
        [123.9222, 10.3322]
      ]
    }
  },

  // Mount Naupa (Naga City) - hiking_spot_id: 3
  {
    hiking_spot_id: 3,
    route_name: 'Naupa Base Trail',
    difficulty: 'Easy',
    distance_km: 2.8,
    elevation_gain_m: 380,
    estimated_duration_hr: 2.0,
    highlights: 'Gentle slopes, forest canopy, wildlife spotting',
    route_color: '#FF6B6B',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7500, 10.2100],
        [123.7505, 10.2105],
        [123.7510, 10.2110],
        [123.7515, 10.2115],
        [123.7520, 10.2120]
      ]
    }
  },
  {
    hiking_spot_id: 3,
    route_name: 'Naupa Summit Trail',
    difficulty: 'Moderate',
    distance_km: 4.5,
    elevation_gain_m: 650,
    estimated_duration_hr: 3.2,
    highlights: 'Summit views, rock formations, challenging ascent',
    route_color: '#4ECDC4',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7498, 10.2098],
        [123.7503, 10.2103],
        [123.7508, 10.2108],
        [123.7513, 10.2113],
        [123.7518, 10.2118]
      ]
    }
  },
  {
    hiking_spot_id: 3,
    route_name: 'Naupa Nature Walk',
    difficulty: 'Easy',
    distance_km: 1.9,
    elevation_gain_m: 220,
    estimated_duration_hr: 1.3,
    highlights: 'Nature education, bird watching, family trail',
    route_color: '#45B7D1',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7502, 10.2102],
        [123.7506, 10.2106],
        [123.7510, 10.2110],
        [123.7514, 10.2114],
        [123.7518, 10.2118]
      ]
    }
  },
  {
    hiking_spot_id: 3,
    route_name: 'Naupa Ridge Trail',
    difficulty: 'Hard',
    distance_km: 5.2,
    elevation_gain_m: 780,
    estimated_duration_hr: 3.8,
    highlights: 'Ridge walking, panoramic views, steep sections',
    route_color: '#96CEB4',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7495, 10.2095],
        [123.7500, 10.2100],
        [123.7505, 10.2105],
        [123.7510, 10.2110],
        [123.7515, 10.2115]
      ]
    }
  },
  {
    hiking_spot_id: 3,
    route_name: 'Naupa Explorer Trail',
    difficulty: 'Advanced',
    distance_km: 7.1,
    elevation_gain_m: 920,
    estimated_duration_hr: 5.0,
    highlights: 'Multi-peak traverse, technical sections, experienced hikers',
    route_color: '#FFEAA7',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7490, 10.2090],
        [123.7498, 10.2098],
        [123.7506, 10.2106],
        [123.7514, 10.2114],
        [123.7522, 10.2122]
      ]
    }
  }
];

// Function to insert trail routes
async function populateTrailRoutes() {
  try {
    console.log('Starting to populate trail routes...');
    
    // Insert trail routes in batches
    const batchSize = 5;
    for (let i = 0; i < trailRoutesData.length; i += batchSize) {
      const batch = trailRoutesData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('trail_routes')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
      } else {
        console.log(`Successfully inserted batch ${Math.floor(i/batchSize) + 1} (${batch.length} routes)`);
      }
    }
    
    console.log('Trail routes population completed!');
    
    // Verify the data
    const { data: allRoutes, error: fetchError } = await supabase
      .from('trail_routes')
      .select('*')
      .order('hiking_spot_id', { ascending: true });
    
    if (fetchError) {
      console.error('Error fetching routes for verification:', fetchError);
    } else {
      console.log(`\nTotal routes in database: ${allRoutes.length}`);
      
      // Group by hiking spot
      const routesBySpot = allRoutes.reduce((acc, route) => {
        if (!acc[route.hiking_spot_id]) {
          acc[route.hiking_spot_id] = [];
        }
        acc[route.hiking_spot_id].push(route);
        return acc;
      }, {});
      
      console.log('\nRoutes by hiking spot:');
      Object.keys(routesBySpot).forEach(spotId => {
        console.log(`  Spot ${spotId}: ${routesBySpot[spotId].length} routes`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the population script
populateTrailRoutes();