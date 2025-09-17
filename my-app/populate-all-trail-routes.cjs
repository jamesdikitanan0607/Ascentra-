const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('Make sure EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Comprehensive trail routes data for all 15 hiking spots (5 routes each = 75 total)
const allTrailRoutes = [
  // Mount Babag (ID: 1)
  {
    hiking_spot_id: 1,
    route_name: 'Babag Ridge Trail',
    difficulty: 'Moderate',
    start_coordinates: `(123.9094,10.3157)`,
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
    start_coordinates: `(123.9090,10.3155)`,
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
    start_coordinates: `(123.9092,10.3155)`,
    distance_km: 2.1,
    elevation_gain_m: 280,
    estimated_duration_hr: 1.5,
    highlights: 'Family-friendly, nature observation, bird watching',
    route_color: '#95E1D3',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9092, 10.3155],
        [123.9096, 10.3158],
        [123.9100, 10.3162],
        [123.9104, 10.3166],
        [123.9108, 10.3170]
      ]
    }
  },
  {
    hiking_spot_id: 1,
    route_name: 'Babag Sunrise Trail',
    difficulty: 'Moderate',
    start_coordinates: `(123.9088,10.3152)`,
    distance_km: 3.8,
    elevation_gain_m: 520,
    estimated_duration_hr: 2.8,
    highlights: 'Best sunrise viewpoint, early morning hike, photography',
    route_color: '#F38BA8',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9088, 10.3152],
        [123.9093, 10.3158],
        [123.9099, 10.3165],
        [123.9106, 10.3172],
        [123.9114, 10.3180]
      ]
    }
  },
  {
    hiking_spot_id: 1,
    route_name: 'Babag Adventure Trail',
    difficulty: 'Hard',
    start_coordinates: `(123.9085,10.3150)`,
    distance_km: 5.5,
    elevation_gain_m: 750,
    estimated_duration_hr: 4.0,
    highlights: 'Technical sections, rope climbing, experienced hikers only',
    route_color: '#A8DADC',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9085, 10.3150],
        [123.9092, 10.3158],
        [123.9101, 10.3168],
        [123.9112, 10.3179],
        [123.9125, 10.3192]
      ]
    }
  },

  // Mount Kan-irag / Sirao Peak (ID: 2)
  {
    hiking_spot_id: 2,
    route_name: 'Sirao Main Trail',
    difficulty: 'Moderate',
    start_coordinates: `(123.8695,10.3440)`,
    distance_km: 4.2,
    elevation_gain_m: 580,
    estimated_duration_hr: 3.0,
    highlights: 'Flower gardens, temple views, scenic overlooks',
    route_color: '#FF6B6B',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8695, 10.3440],
        [123.8700, 10.3445],
        [123.8707, 10.3452],
        [123.8714, 10.3459],
        [123.8721, 10.3466]
      ]
    }
  },
  {
    hiking_spot_id: 2,
    route_name: 'Kan-irag Peak Trail',
    difficulty: 'Hard',
    start_coordinates: `(123.8690,10.3435)`,
    distance_km: 5.8,
    elevation_gain_m: 720,
    estimated_duration_hr: 4.2,
    highlights: 'Summit views, challenging climb, panoramic vistas',
    route_color: '#4ECDC4',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8690, 10.3435],
        [123.8698, 10.3443],
        [123.8708, 10.3453],
        [123.8718, 10.3463],
        [123.8728, 10.3473]
      ]
    }
  },
  {
    hiking_spot_id: 2,
    route_name: 'Temple Circuit Trail',
    difficulty: 'Easy',
    start_coordinates: `(123.8692,10.3438)`,
    distance_km: 2.8,
    elevation_gain_m: 320,
    estimated_duration_hr: 2.0,
    highlights: 'Temple of Leah, cultural sites, easy walking',
    route_color: '#95E1D3',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8692, 10.3438],
        [123.8696, 10.3442],
        [123.8701, 10.3447],
        [123.8706, 10.3452],
        [123.8711, 10.3457]
      ]
    }
  },
  {
    hiking_spot_id: 2,
    route_name: 'Flower Garden Trail',
    difficulty: 'Easy',
    start_coordinates: `(123.8688,10.3433)`,
    distance_km: 3.1,
    elevation_gain_m: 380,
    estimated_duration_hr: 2.2,
    highlights: 'Celosia flowers, colorful gardens, photography spots',
    route_color: '#F38BA8',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8688, 10.3433],
        [123.8694, 10.3439],
        [123.8702, 10.3447],
        [123.8710, 10.3455],
        [123.8718, 10.3463]
      ]
    }
  },
  {
    hiking_spot_id: 2,
    route_name: 'Sirao Ridge Walk',
    difficulty: 'Moderate',
    start_coordinates: `(123.8685,10.3430)`,
    distance_km: 4.5,
    elevation_gain_m: 620,
    estimated_duration_hr: 3.3,
    highlights: 'Ridge walking, city views, cool climate',
    route_color: '#A8DADC',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8685, 10.3430],
        [123.8692, 10.3438],
        [123.8701, 10.3448],
        [123.8712, 10.3459],
        [123.8723, 10.3470]
      ]
    }
  },

  // Mount Naupa (ID: 3)
  {
    hiking_spot_id: 3,
    route_name: 'Naupa Base Trail',
    difficulty: 'Moderate',
    start_coordinates: `(123.7500,10.2100)`,
    distance_km: 3.8,
    elevation_gain_m: 520,
    estimated_duration_hr: 2.8,
    highlights: 'Forest trail, wildlife spotting, moderate climb',
    route_color: '#FF6B6B',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7500, 10.2100],
        [123.7505, 10.2105],
        [123.7512, 10.2112],
        [123.7519, 10.2119],
        [123.7526, 10.2126]
      ]
    }
  },
  {
    hiking_spot_id: 3,
    route_name: 'Naupa Summit Trail',
    difficulty: 'Hard',
    start_coordinates: `(123.7495,10.2095)`,
    distance_km: 5.2,
    elevation_gain_m: 780,
    estimated_duration_hr: 3.8,
    highlights: 'Summit views, challenging ascent, panoramic vistas',
    route_color: '#4ECDC4',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7495, 10.2095],
        [123.7502, 10.2102],
        [123.7510, 10.2110],
        [123.7518, 10.2118],
        [123.7526, 10.2126]
      ]
    }
  },
  {
    hiking_spot_id: 3,
    route_name: 'Naupa Nature Walk',
    difficulty: 'Easy',
    start_coordinates: `(123.7498,10.2098)`,
    distance_km: 2.5,
    elevation_gain_m: 280,
    estimated_duration_hr: 1.8,
    highlights: 'Easy walk, nature observation, family-friendly',
    route_color: '#95E1D3',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7498, 10.2098],
        [123.7502, 10.2102],
        [123.7507, 10.2107],
        [123.7512, 10.2112],
        [123.7517, 10.2117]
      ]
    }
  },
  {
    hiking_spot_id: 3,
    route_name: 'Naupa Ridge Trail',
    difficulty: 'Hard',
    start_coordinates: `(123.7492,10.2092)`,
    distance_km: 6.1,
    elevation_gain_m: 850,
    estimated_duration_hr: 4.5,
    highlights: 'Ridge walking, technical sections, experienced hikers',
    route_color: '#F38BA8',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7492, 10.2092],
        [123.7500, 10.2100],
        [123.7509, 10.2109],
        [123.7519, 10.2119],
        [123.7530, 10.2130]
      ]
    }
  },
  {
    hiking_spot_id: 3,
    route_name: 'Naupa Explorer Trail',
    difficulty: 'Advanced',
    start_coordinates: `(123.7490,10.2090)`,
    distance_km: 7.1,
    elevation_gain_m: 920,
    estimated_duration_hr: 5.0,
    highlights: 'Multi-peak traverse, technical climbing, expert level',
    route_color: '#A8DADC',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7490, 10.2090],
        [123.7498, 10.2098],
        [123.7508, 10.2108],
        [123.7520, 10.2120],
        [123.7533, 10.2133]
      ]
    }
  }
];

// Generate routes for remaining spots (4-15)
const generateRoutesForSpot = (spotId, baseLat, baseLng, spotName) => {
  const routeTemplates = [
    {
      suffix: 'Main Trail',
      difficulty: 'Moderate',
      distance_km: 3.5 + Math.random() * 2,
      elevation_gain_m: 400 + Math.random() * 300,
      estimated_duration_hr: 2.5 + Math.random() * 1.5,
      highlights: `${spotName} main route, scenic views, well-marked trail`,
      route_color: '#FF6B6B'
    },
    {
      suffix: 'Summit Trail',
      difficulty: 'Hard',
      distance_km: 4.5 + Math.random() * 2.5,
      elevation_gain_m: 600 + Math.random() * 400,
      estimated_duration_hr: 3.5 + Math.random() * 2,
      highlights: `${spotName} summit, challenging climb, panoramic views`,
      route_color: '#4ECDC4'
    },
    {
      suffix: 'Nature Trail',
      difficulty: 'Easy',
      distance_km: 2.0 + Math.random() * 1.5,
      elevation_gain_m: 200 + Math.random() * 200,
      estimated_duration_hr: 1.5 + Math.random() * 1,
      highlights: `${spotName} nature walk, family-friendly, wildlife spotting`,
      route_color: '#95E1D3'
    },
    {
      suffix: 'Adventure Trail',
      difficulty: 'Hard',
      distance_km: 5.0 + Math.random() * 3,
      elevation_gain_m: 700 + Math.random() * 500,
      estimated_duration_hr: 4.0 + Math.random() * 2.5,
      highlights: `${spotName} adventure route, technical sections, experienced hikers`,
      route_color: '#F38BA8'
    },
    {
      suffix: 'Explorer Trail',
      difficulty: 'Advanced',
      distance_km: 6.0 + Math.random() * 4,
      elevation_gain_m: 800 + Math.random() * 600,
      estimated_duration_hr: 4.5 + Math.random() * 3,
      highlights: `${spotName} explorer route, multi-peak traverse, expert level`,
      route_color: '#A8DADC'
    }
  ];

  return routeTemplates.map((template, index) => {
    const latOffset = (Math.random() - 0.5) * 0.01;
    const lngOffset = (Math.random() - 0.5) * 0.01;
    
    const startLng = baseLng + lngOffset;
    const startLat = baseLat + latOffset;
    
    return {
      hiking_spot_id: spotId,
      route_name: `${spotName} ${template.suffix}`,
      difficulty: template.difficulty,
      start_coordinates: `(${startLng},${startLat})`,
      distance_km: Math.round(template.distance_km * 10) / 10,
      elevation_gain_m: Math.round(template.elevation_gain_m),
      estimated_duration_hr: Math.round(template.estimated_duration_hr * 10) / 10,
      highlights: template.highlights,
      route_color: template.route_color,
      geojson_path: {
        type: 'LineString',
        coordinates: [
          [startLng, startLat],
          [startLng + 0.002, startLat + 0.002],
          [startLng + 0.004, startLat + 0.004],
          [startLng + 0.006, startLat + 0.006],
          [startLng + 0.008, startLat + 0.008]
        ]
      }
    };
  });
};

// Hiking spots data with coordinates - Final 15 Official Hiking Spots
const hikingSpots = [
  { id: 1, name: 'Mount Babag', lat: 10.3157, lng: 123.8854 },
  { id: 2, name: 'Mount Kan-irag / Sirao Peak', lat: 10.3440, lng: 123.8695 },
  { id: 3, name: 'Mount Naupa', lat: 10.2167, lng: 123.7667 },
  { id: 4, name: 'Mount Manunggal', lat: 10.4833, lng: 123.7167 },
  { id: 5, name: 'Mount Mago', lat: 10.5833, lng: 124.0167 },
  { id: 6, name: 'Mount Kapayas', lat: 10.7167, lng: 124.0167 },
  { id: 7, name: 'Mount Lantoy', lat: 9.8833, lng: 123.6167 },
  { id: 8, name: 'Mount Kalbasaan', lat: 10.2333, lng: 123.7833 },
  { id: 9, name: 'Mount Mauyog', lat: 10.4667, lng: 123.7333 },
  { id: 10, name: 'Mount Lanaya', lat: 9.7667, lng: 123.4167 },
  { id: 11, name: 'Mount Hambubuyog', lat: 9.6167, lng: 123.3333 },
  { id: 12, name: 'Osmeña Peak', lat: 9.7167, lng: 123.5167 },
  { id: 13, name: 'Casino Peak', lat: 9.7100, lng: 123.5200 },
  { id: 14, name: 'Budlaan Falls', lat: 10.3300, lng: 123.8600 },
  { id: 15, name: 'Spartan Trail', lat: 10.3167, lng: 123.8833 }
];

// Generate routes for all 15 hiking spots
hikingSpots.forEach(spot => {
  const routes = generateRoutesForSpot(spot.id, spot.lat, spot.lng, spot.name);
  allTrailRoutes.push(...routes);
});

async function populateAllTrailRoutes() {
  try {
    console.log('🚀 Starting comprehensive trail routes population...');
    console.log(`📊 Total routes to insert: ${allTrailRoutes.length}`);
    
    // Clear existing trail routes
    console.log('🗑️  Clearing existing trail routes...');
    const { error: deleteError } = await supabase
      .from('trail_routes')
      .delete()
      .gt('id', 0);
    
    if (deleteError) {
      console.error('❌ Error clearing trail routes:', deleteError.message);
      process.exit(1);
    }
    
    console.log('✅ Existing trail routes cleared');
    
    // Insert routes in batches of 10 to avoid overwhelming the database
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < allTrailRoutes.length; i += batchSize) {
      const batch = allTrailRoutes.slice(i, i + batchSize);
      console.log(`📝 Inserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allTrailRoutes.length/batchSize)} (${batch.length} routes)`);
      
      try {
        const { data, error } = await supabase
          .from('trail_routes')
          .insert(batch)
          .select();
        
        if (error) {
          console.error(`❌ Error in batch ${Math.floor(i/batchSize) + 1}:`, error.message);
          errorCount += batch.length;
        } else {
          console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} inserted successfully (${data.length} routes)`);
          successCount += data.length;
        }
      } catch (batchError) {
        console.error(`❌ Exception in batch ${Math.floor(i/batchSize) + 1}:`, batchError.message);
        errorCount += batch.length;
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 Final Results:');
    console.log(`✅ Successfully inserted: ${successCount} routes`);
    console.log(`❌ Failed to insert: ${errorCount} routes`);
    console.log(`📈 Success rate: ${((successCount / allTrailRoutes.length) * 100).toFixed(1)}%`);
    
    if (successCount > 0) {
      console.log('\n🎉 Trail routes population completed!');
      console.log('💡 You can now test the trail maps in your hiking spot screens.');
    } else {
      console.log('\n⚠️  No routes were successfully inserted. Please check the errors above.');
    }
    
  } catch (error) {
    console.error('💥 Fatal error during trail routes population:', error.message);
    process.exit(1);
  }
}

// Run the population script
populateAllTrailRoutes();