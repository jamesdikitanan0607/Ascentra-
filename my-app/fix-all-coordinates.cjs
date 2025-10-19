const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Coordinate areas for different hiking spots based on insert-trail-routes-data.sql
const hikingSpotCoordinates = {
  71: { // Mount Babag (Cebu City)
    baseCoords: { lat: 10.3157, lng: 123.9644 },
    name: 'Mount Babag'
  },
  72: { // Mount Kan-irag (Cebu City)
    baseCoords: { lat: 10.3333, lng: 123.9167 },
    name: 'Mount Kan-irag'
  },
  73: { // Mount Naupa (Naga City)
    baseCoords: { lat: 10.2083, lng: 123.7500 },
    name: 'Mount Naupa'
  },
  74: { // Mount Manunggal (Balamban)
    baseCoords: { lat: 10.4833, lng: 123.7167 },
    name: 'Mount Manunggal'
  },
  75: { // Mount Mago (Carmen/Danao boundary)
    baseCoords: { lat: 10.6000, lng: 124.0000 },
    name: 'Mount Mago'
  },
  76: { // Mount Kapayas (Catmon)
    baseCoords: { lat: 10.7167, lng: 124.0167 },
    name: 'Mount Kapayas'
  },
  77: { // Mount Lantoy (Argao)
    baseCoords: { lat: 9.8833, lng: 123.3500 },
    name: 'Mount Lantoy'
  },
  78: { // Mount Kalbasaan (Minglanilla)
    baseCoords: { lat: 10.2500, lng: 123.8000 },
    name: 'Mount Kalbasaan'
  },
  79: { // Mount Mauyog (Balamban)
    baseCoords: { lat: 10.5000, lng: 123.7000 },
    name: 'Mount Mauyog'
  },
  80: { // Mount Lanaya (Alegria)
    baseCoords: { lat: 9.7667, lng: 123.4000 },
    name: 'Mount Lanaya'
  },
  81: { // San Carlos Heights (Ginatilan)
    baseCoords: { lat: 9.6000, lng: 123.3167 },
    name: 'San Carlos Heights'
  },
  82: { // Mount Kalawisan (Kanlaas Ridge, Lapu-Lapu City)
    baseCoords: { lat: 10.3167, lng: 124.0167 },
    name: 'Mount Kalawisan (Kanlaas Ridge)'
  },
  83: { // Osmeña Peak (Dalaguete)
    baseCoords: { lat: 9.9167, lng: 123.3333 },
    name: 'Osmeña Peak'
  },
  84: { // Casino Peak (Dalaguete)
    baseCoords: { lat: 9.9100, lng: 123.3250 },
    name: 'Casino Peak'
  },
  85: { // Budlaan Falls (Cebu City – trail to Mount Kan-irag)
    baseCoords: { lat: 10.3400, lng: 123.9100 },
    name: 'Budlaan Falls'
  }
};

function generateRouteCoordinates(baseCoords, routeIndex, difficulty) {
  // Generate different coordinate patterns based on route index and difficulty
  const offsets = [
    { lat: -0.005, lng: -0.005 }, // Easy routes - shorter
    { lat: -0.008, lng: -0.008 }, // Moderate routes - medium
    { lat: -0.012, lng: -0.012 }, // Hard routes - longer
    { lat: -0.015, lng: -0.015 }, // Advanced routes - longest
    { lat: -0.010, lng: -0.010 }  // Default
  ];
  
  const offset = offsets[routeIndex] || offsets[4];
  
  // Adjust offset based on difficulty
  let difficultyMultiplier = 1;
  if (difficulty === 'Easy') difficultyMultiplier = 0.7;
  else if (difficulty === 'Moderate') difficultyMultiplier = 1.0;
  else if (difficulty === 'Hard') difficultyMultiplier = 1.3;
  else if (difficulty === 'Advanced') difficultyMultiplier = 1.6;
  
  const adjustedOffset = {
    lat: offset.lat * difficultyMultiplier,
    lng: offset.lng * difficultyMultiplier
  };
  
  const startCoords = {
    latitude: baseCoords.lat + adjustedOffset.lat,
    longitude: baseCoords.lng + adjustedOffset.lng
  };
  
  const endCoords = {
    latitude: baseCoords.lat - adjustedOffset.lat,
    longitude: baseCoords.lng - adjustedOffset.lng
  };
  
  // Generate waypoints for the route
  const numWaypoints = Math.min(3 + routeIndex, 6);
  const coordinates = [[startCoords.longitude, startCoords.latitude]];
  
  for (let i = 1; i <= numWaypoints; i++) {
    const progress = i / (numWaypoints + 1);
    const waypointLat = startCoords.latitude + (endCoords.latitude - startCoords.latitude) * progress;
    const waypointLng = startCoords.longitude + (endCoords.longitude - startCoords.longitude) * progress;
    
    // Add some variation to make the route more interesting
    const variation = 0.002 * Math.sin(progress * Math.PI * 2);
    coordinates.push([waypointLng + variation, waypointLat + variation]);
  }
  
  coordinates.push([endCoords.longitude, endCoords.latitude]);
  
  const geojsonPath = {
    type: 'LineString',
    coordinates: coordinates
  };
  
  const routeCoordinates = coordinates.map(coord => ({
    latitude: coord[1],
    longitude: coord[0]
  }));
  
  return {
    startCoords,
    endCoords,
    geojsonPath,
    routeCoordinates
  };
}

async function fixAllCoordinates() {
  try {
    console.log('🔄 Fetching all trail routes...');
    
    const { data: routes, error: fetchError } = await supabase
      .from('trail_routes')
      .select('*')
      .order('hiking_spot_id', { ascending: true });
    
    if (fetchError) {
      console.error('❌ Error fetching routes:', fetchError);
      return;
    }
    
    console.log(`📊 Found ${routes.length} routes to update`);
    
    let updatedCount = 0;
    
    // Group routes by hiking spot
    const routesBySpot = {};
    routes.forEach(route => {
      if (!routesBySpot[route.hiking_spot_id]) {
        routesBySpot[route.hiking_spot_id] = [];
      }
      routesBySpot[route.hiking_spot_id].push(route);
    });
    
    for (const [spotId, spotRoutes] of Object.entries(routesBySpot)) {
      const spotInfo = hikingSpotCoordinates[spotId];
      if (!spotInfo) {
        console.log(`⚠️ No coordinate info for hiking spot ${spotId}`);
        continue;
      }
      
      console.log(`\n🏔️ Updating routes for ${spotInfo.name} (Spot ${spotId})...`);
      
      for (let i = 0; i < spotRoutes.length; i++) {
        const route = spotRoutes[i];
        const { startCoords, endCoords, geojsonPath, routeCoordinates } = generateRouteCoordinates(
          spotInfo.baseCoords, 
          i, 
          route.difficulty
        );
        
        console.log(`🔄 Updating ${route.route_name}...`);
        console.log(`   New coords: (${startCoords.longitude.toFixed(4)},${startCoords.latitude.toFixed(4)}) -> (${endCoords.longitude.toFixed(4)},${endCoords.latitude.toFixed(4)})`);
        
        // Convert coordinates to PostgreSQL POINT format
        const startCoordString = `(${startCoords.longitude},${startCoords.latitude})`;
        const endCoordString = `(${endCoords.longitude},${endCoords.latitude})`;
        
        const { error: updateError } = await supabase
          .from('trail_routes')
          .update({
            start_coordinates: startCoordString,
            end_coordinates: endCoordString,
            route_coordinates: routeCoordinates,
            geojson_path: geojsonPath
          })
          .eq('id', route.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${route.route_name}:`, updateError);
        } else {
          console.log(`✅ Successfully updated ${route.route_name}`);
          updatedCount++;
        }
      }
    }
    
    console.log(`\n🎉 Update complete! Updated ${updatedCount} out of ${routes.length} routes`);
    
    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const { data: updatedRoutes, error: verifyError } = await supabase
      .from('trail_routes')
      .select('hiking_spot_id, route_name, start_coordinates, end_coordinates')
      .order('hiking_spot_id')
      .limit(10);
    
    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
    } else {
      console.log('📍 Sample updated coordinates:');
      updatedRoutes.forEach(route => {
        const spotInfo = hikingSpotCoordinates[route.hiking_spot_id];
        console.log(`   ${spotInfo?.name || `Spot ${route.hiking_spot_id}`} - ${route.route_name}:`);
        console.log(`     ${route.start_coordinates} -> ${route.end_coordinates}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixAllCoordinates();
