const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Trail route templates for each difficulty level
const routeTemplates = {
  'Easy': {
    distance_range: [1.5, 3.0],
    elevation_range: [50, 200],
    duration_range: [1.0, 2.0],
    names: ['Nature Walk', 'Family Trail', 'Scenic Loop', 'Easy Path', 'Beginner Route']
  },
  'Moderate': {
    distance_range: [3.0, 6.0],
    elevation_range: [200, 500],
    duration_range: [2.0, 4.0],
    names: ['Main Trail', 'Ridge Walk', 'Forest Path', 'Valley Route', 'Moderate Loop']
  },
  'Hard': {
    distance_range: [5.0, 10.0],
    elevation_range: [500, 1000],
    duration_range: [3.5, 6.0],
    names: ['Summit Trail', 'Challenge Route', 'Advanced Path', 'Peak Ascent', 'Expert Trail']
  },
  'Advanced': {
    distance_range: [8.0, 15.0],
    elevation_range: [800, 1500],
    duration_range: [5.0, 8.0],
    names: ['Extreme Route', 'Technical Trail', 'Alpine Path', 'Master Challenge', 'Ultimate Ascent']
  }
};

const highlights = [
  'Stunning panoramic views from the summit',
  'Beautiful waterfall cascades along the trail',
  'Dense forest canopy with diverse wildlife',
  'Rocky outcrops perfect for photography',
  'Peaceful meadows with wildflower blooms',
  'Historic landmarks and cultural sites',
  'Crystal clear mountain streams',
  'Challenging rock formations and boulders',
  'Breathtaking sunrise and sunset viewpoints',
  'Ancient trees and old-growth forest',
  'Natural swimming holes and pools',
  'Unique geological formations',
  'Bird watching opportunities',
  'Scenic overlooks of valleys below',
  'Traditional village encounters'
];

const routeColors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Light Yellow
  '#BB8FCE', // Light Purple
  '#85C1E9'  // Light Blue
];

function getRandomInRange(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateGeoJSONPath(baseCoords, distance) {
  const points = [];
  const numPoints = Math.max(5, Math.floor(distance * 2)); // More points for longer trails
  
  for (let i = 0; i < numPoints; i++) {
    const progress = i / (numPoints - 1);
    const latOffset = (Math.random() - 0.5) * 0.01 * distance;
    const lngOffset = (Math.random() - 0.5) * 0.01 * distance;
    
    points.push([
      baseCoords.longitude + lngOffset,
      baseCoords.latitude + latOffset
    ]);
  }
  
  return {
    type: 'LineString',
    coordinates: points
  };
}

async function populateTrailRoutes() {
  try {
    console.log('🔍 Fetching hiking spots...');
    
    // Get all hiking spots
    const { data: spots, error: spotsError } = await supabase
      .from('hiking_spots')
      .select('id, name, coordinates')
      .order('name');
    
    if (spotsError) {
      console.error('❌ Error fetching hiking spots:', spotsError);
      return;
    }
    
    if (!spots || spots.length === 0) {
      console.log('❌ No hiking spots found in database');
      return;
    }
    
    console.log(`📍 Found ${spots.length} hiking spots`);
    
    // Check existing trail routes
    const { data: existingRoutes, error: routesError } = await supabase
      .from('trail_routes')
      .select('hiking_spot_id')
      .order('hiking_spot_id');
    
    if (routesError) {
      console.error('❌ Error fetching existing routes:', routesError);
      return;
    }
    
    const existingSpotIds = new Set(existingRoutes?.map(r => r.hiking_spot_id) || []);
    console.log(`🛤️  Found existing routes for ${existingSpotIds.size} spots`);
    
    // Generate trail routes for each spot
    const allRoutes = [];
    const difficulties = ['Easy', 'Easy', 'Moderate', 'Hard', 'Advanced']; // 2 easy routes per spot
    
    for (const spot of spots) {
      // Skip if routes already exist for this spot
      if (existingSpotIds.has(spot.id)) {
        console.log(`⏭️  Skipping ${spot.name} - routes already exist`);
        continue;
      }
      
      console.log(`🏔️  Creating routes for ${spot.name}`);
      
      // Extract coordinates
      let baseCoords = { latitude: 10.3700, longitude: 123.8890 }; // Default fallback
      if (spot.coordinates && spot.coordinates.coordinates) {
        baseCoords = {
          latitude: spot.coordinates.coordinates[1],
          longitude: spot.coordinates.coordinates[0]
        };
      }
      
      for (let i = 0; i < 5; i++) {
        const difficulty = difficulties[i];
        const template = routeTemplates[difficulty];
        const routeName = `${template.names[i % template.names.length]}`;
        
        const distance = getRandomInRange(template.distance_range[0], template.distance_range[1]);
        const elevation = Math.floor(getRandomInRange(template.elevation_range[0], template.elevation_range[1]));
        const duration = getRandomInRange(template.duration_range[0], template.duration_range[1]);
        
        const route = {
          hiking_spot_id: spot.id,
          route_name: routeName,
          difficulty: difficulty,
          start_coordinates: `POINT(${baseCoords.longitude} ${baseCoords.latitude})`,
          distance_km: distance,
          elevation_gain_m: elevation,
          estimated_duration_hr: duration,
          highlights: getRandomElement(highlights),
          geojson_path: generateGeoJSONPath(baseCoords, distance),
          route_color: routeColors[i % routeColors.length]
        };
        
        allRoutes.push(route);
      }
    }
    
    if (allRoutes.length === 0) {
      console.log('✅ All trail routes already exist!');
      return;
    }
    
    console.log(`\n🚀 Inserting ${allRoutes.length} new trail routes...`);
    
    // Insert routes in batches to avoid timeout
    const batchSize = 10;
    let inserted = 0;
    
    for (let i = 0; i < allRoutes.length; i += batchSize) {
      const batch = allRoutes.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('trail_routes')
        .insert(batch)
        .select('route_id, route_name, hiking_spot_id');
      
      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
        continue;
      }
      
      inserted += batch.length;
      console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allRoutes.length/batchSize)} (${batch.length} routes)`);
    }
    
    console.log(`\n🎉 Successfully inserted ${inserted} trail routes!`);
    
    // Final verification
    const { data: finalCount, error: countError } = await supabase
      .from('trail_routes')
      .select('route_id', { count: 'exact' });
    
    if (!countError) {
      console.log(`📊 Total trail routes in database: ${finalCount?.length || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Error populating trail routes:', error);
  }
}

populateTrailRoutes();