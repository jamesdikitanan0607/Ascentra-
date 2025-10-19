const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Correct coordinates from insert-trail-routes-data.sql
const correctRouteData = {
  // Mount Babag routes (hiking_spot_id: 71)
  'Babag Ridge Easy Trail': {
    start_coordinates: { latitude: 10.3140, longitude: 123.9620 },
    end_coordinates: { latitude: 10.3170, longitude: 123.9660 },
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9620, 10.3140], [123.9630, 10.3145], [123.9635, 10.3150], 
        [123.9645, 10.3155], [123.9655, 10.3165], [123.9660, 10.3170]
      ]
    }
  },
  'Babag Summit Classic': {
    start_coordinates: { latitude: 10.3130, longitude: 123.9610 },
    end_coordinates: { latitude: 10.3180, longitude: 123.9680 },
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9610, 10.3130], [123.9625, 10.3140], [123.9640, 10.3150], 
        [123.9655, 10.3160], [123.9670, 10.3170], [123.9680, 10.3180]
      ]
    }
  },
  'Babag Sunrise Route': {
    start_coordinates: { latitude: 10.3135, longitude: 123.9615 },
    end_coordinates: { latitude: 10.3175, longitude: 123.9665 },
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9615, 10.3135], [123.9630, 10.3145], [123.9645, 10.3155], 
        [123.9655, 10.3165], [123.9665, 10.3175]
      ]
    }
  },
  
  // Mount Kan-irag routes (hiking_spot_id: 72)
  'Sirao Flower Garden Walk': {
    start_coordinates: { latitude: 10.3320, longitude: 123.9150 },
    end_coordinates: { latitude: 10.3340, longitude: 123.9180 },
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9150, 10.3320], [123.9160, 10.3325], [123.9165, 10.3330], 
        [123.9175, 10.3335], [123.9180, 10.3340]
      ]
    }
  },
  'Sirao Ridge Route': {
    start_coordinates: { latitude: 10.3310, longitude: 123.9140 },
    end_coordinates: { latitude: 10.3350, longitude: 123.9190 },
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9140, 10.3310], [123.9155, 10.3320], [123.9170, 10.3330], 
        [123.9180, 10.3340], [123.9190, 10.3350]
      ]
    }
  },
  'Kan-irag Summit Trail': {
    start_coordinates: { latitude: 10.3300, longitude: 123.9130 },
    end_coordinates: { latitude: 10.3360, longitude: 123.9200 },
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9130, 10.3300], [123.9145, 10.3315], [123.9165, 10.3330], 
        [123.9185, 10.3345], [123.9200, 10.3360]
      ]
    }
  },
  
  // Mount Naupa routes (hiking_spot_id: 73)
  'Naupa Village Trail': {
    start_coordinates: { latitude: 10.2070, longitude: 123.7480 },
    end_coordinates: { latitude: 10.2095, longitude: 123.7520 },
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7480, 10.2070], [123.7490, 10.2075], [123.7500, 10.2080], 
        [123.7510, 10.2090], [123.7520, 10.2095]
      ]
    }
  },
  'Naupa Forest Path': {
    start_coordinates: { latitude: 10.2060, longitude: 123.7470 },
    end_coordinates: { latitude: 10.2105, longitude: 123.7530 },
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7470, 10.2060], [123.7485, 10.2070], [123.7505, 10.2085], 
        [123.7520, 10.2095], [123.7530, 10.2105]
      ]
    }
  },
  'Naupa Summit Route': {
    start_coordinates: { latitude: 10.2050, longitude: 123.7460 },
    end_coordinates: { latitude: 10.2115, longitude: 123.7540 },
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7460, 10.2050], [123.7480, 10.2065], [123.7500, 10.2080], 
        [123.7525, 10.2100], [123.7540, 10.2115]
      ]
    }
  }
};

async function updateTrailRoutesCoordinates() {
  try {
    console.log('🔄 Fetching existing trail routes...');
    
    const { data: routes, error: fetchError } = await supabase
      .from('trail_routes')
      .select('*')
      .order('id');
    
    if (fetchError) {
      console.error('❌ Error fetching routes:', fetchError);
      return;
    }
    
    console.log(`📊 Found ${routes.length} routes to update`);
    
    let updatedCount = 0;
    
    for (const route of routes) {
      const correctData = correctRouteData[route.route_name];
      
      if (correctData) {
        console.log(`🔄 Updating ${route.route_name}...`);
        console.log(`   Old coords: ${route.start_coordinates} -> ${route.end_coordinates}`);
        console.log(`   New coords: (${correctData.start_coordinates.longitude},${correctData.start_coordinates.latitude}) -> (${correctData.end_coordinates.longitude},${correctData.end_coordinates.latitude})`);
        
        // Convert coordinates to PostgreSQL POINT format
        const startCoordString = `(${correctData.start_coordinates.longitude},${correctData.start_coordinates.latitude})`;
        const endCoordString = `(${correctData.end_coordinates.longitude},${correctData.end_coordinates.latitude})`;
        
        // Convert geojson coordinates to route_coordinates format
        const routeCoordinates = correctData.geojson_path.coordinates.map(coord => ({
          latitude: coord[1],
          longitude: coord[0]
        }));
        
        const { error: updateError } = await supabase
          .from('trail_routes')
          .update({
            start_coordinates: startCoordString,
            end_coordinates: endCoordString,
            route_coordinates: routeCoordinates,
            geojson_path: correctData.geojson_path
          })
          .eq('id', route.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${route.route_name}:`, updateError);
        } else {
          console.log(`✅ Successfully updated ${route.route_name}`);
          updatedCount++;
        }
      } else {
        console.log(`⚠️ No correct data found for route: ${route.route_name}`);
      }
    }
    
    console.log(`🎉 Update complete! Updated ${updatedCount} out of ${routes.length} routes`);
    
    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const { data: updatedRoutes, error: verifyError } = await supabase
      .from('trail_routes')
      .select('route_name, start_coordinates, end_coordinates')
      .limit(5);
    
    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
    } else {
      console.log('📍 Sample updated coordinates:');
      updatedRoutes.forEach(route => {
        console.log(`   ${route.route_name}: ${route.start_coordinates} -> ${route.end_coordinates}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateTrailRoutesCoordinates();
