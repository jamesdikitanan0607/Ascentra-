const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceUpdateBabagKanirag() {
  try {
    console.log('🔄 Force updating Mount Babag and Mount Kan-irag routes...');
    
    // Mount Babag routes (hiking_spot_id: 71) - Coordinates around 10.3157°N, 123.9644°E
    const babagUpdates = [
      {
        route_name: 'Babag Ridge Easy Trail',
        start_coordinates: '(123.9620,10.3140)',
        end_coordinates: '(123.9660,10.3170)',
        geojson_path: {
          type: 'LineString',
          coordinates: [[123.9620, 10.3140], [123.9630, 10.3145], [123.9635, 10.3150], [123.9645, 10.3155], [123.9655, 10.3165], [123.9660, 10.3170]]
        }
      },
      {
        route_name: 'Babag Summit Classic',
        start_coordinates: '(123.9610,10.3130)',
        end_coordinates: '(123.9680,10.3180)',
        geojson_path: {
          type: 'LineString',
          coordinates: [[123.9610, 10.3130], [123.9625, 10.3140], [123.9640, 10.3150], [123.9655, 10.3160], [123.9670, 10.3170], [123.9680, 10.3180]]
        }
      },
      {
        route_name: 'Babag Sunrise Trail',
        start_coordinates: '(123.9615,10.3135)',
        end_coordinates: '(123.9665,10.3175)',
        geojson_path: {
          type: 'LineString',
          coordinates: [[123.9615, 10.3135], [123.9630, 10.3145], [123.9645, 10.3155], [123.9655, 10.3165], [123.9665, 10.3175]]
        }
      },
      {
        route_name: 'Babag Adventure Circuit',
        start_coordinates: '(123.9625,10.3145)',
        end_coordinates: '(123.9655,10.3165)',
        geojson_path: {
          type: 'LineString',
          coordinates: [[123.9625, 10.3145], [123.9635, 10.3150], [123.9645, 10.3155], [123.9655, 10.3165]]
        }
      },
      {
        route_name: 'Babag Extreme Traverse',
        start_coordinates: '(123.9600,10.3125)',
        end_coordinates: '(123.9690,10.3185)',
        geojson_path: {
          type: 'LineString',
          coordinates: [[123.9600, 10.3125], [123.9620, 10.3135], [123.9645, 10.3150], [123.9665, 10.3165], [123.9680, 10.3175], [123.9690, 10.3185]]
        }
      }
    ];
    
    // Mount Kan-irag routes (hiking_spot_id: 72) - Coordinates around 10.3333°N, 123.9167°E
    const kaniragUpdates = [
      {
        route_name: 'Sirao Flower Garden Trail',
        start_coordinates: '(123.9150,10.3320)',
        end_coordinates: '(123.9180,10.3340)',
        geojson_path: {
          type: 'LineString',
          coordinates: [[123.9150, 10.3320], [123.9160, 10.3325], [123.9165, 10.3330], [123.9175, 10.3335], [123.9180, 10.3340]]
        }
      },
      {
        route_name: 'Sirao Ridge Route',
        start_coordinates: '(123.9140,10.3310)',
        end_coordinates: '(123.9190,10.3350)',
        geojson_path: {
          type: 'LineString',
          coordinates: [[123.9140, 10.3310], [123.9155, 10.3320], [123.9170, 10.3330], [123.9180, 10.3340], [123.9190, 10.3350]]
        }
      },
      {
        route_name: 'Kan-irag Summit Trail',
        start_coordinates: '(123.9130,10.3300)',
        end_coordinates: '(123.9200,10.3360)',
        geojson_path: {
          type: 'LineString',
          coordinates: [[123.9130, 10.3300], [123.9145, 10.3315], [123.9165, 10.3330], [123.9185, 10.3345], [123.9200, 10.3360]]
        }
      },
      {
        route_name: 'Kan-irag Nature Walk',
        start_coordinates: '(123.9145,10.3315)',
        end_coordinates: '(123.9185,10.3345)',
        geojson_path: {
          type: 'LineString',
          coordinates: [[123.9145, 10.3315], [123.9160, 10.3325], [123.9175, 10.3335], [123.9185, 10.3345]]
        }
      },
      {
        route_name: 'Sirao Peak Summit',
        start_coordinates: '(123.9135,10.3305)',
        end_coordinates: '(123.9195,10.3355)',
        geojson_path: {
          type: 'LineString',
          coordinates: [[123.9135, 10.3305], [123.9150, 10.3320], [123.9170, 10.3330], [123.9185, 10.3345], [123.9195, 10.3355]]
        }
      }
    ];
    
    let updatedCount = 0;
    
    // Update Babag routes
    console.log('\n🏔️ Updating Mount Babag routes...');
    for (const update of babagUpdates) {
      const routeCoordinates = update.geojson_path.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0]
      }));
      
      const { error } = await supabase
        .from('trail_routes')
        .update({
          start_coordinates: update.start_coordinates,
          end_coordinates: update.end_coordinates,
          route_coordinates: routeCoordinates,
          geojson_path: update.geojson_path
        })
        .eq('hiking_spot_id', 71)
        .eq('route_name', update.route_name);
      
      if (error) {
        console.error(`❌ Error updating ${update.route_name}:`, error);
      } else {
        console.log(`✅ Updated ${update.route_name}: ${update.start_coordinates} -> ${update.end_coordinates}`);
        updatedCount++;
      }
    }
    
    // Update Kan-irag routes
    console.log('\n🏔️ Updating Mount Kan-irag routes...');
    for (const update of kaniragUpdates) {
      const routeCoordinates = update.geojson_path.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0]
      }));
      
      const { error } = await supabase
        .from('trail_routes')
        .update({
          start_coordinates: update.start_coordinates,
          end_coordinates: update.end_coordinates,
          route_coordinates: routeCoordinates,
          geojson_path: update.geojson_path
        })
        .eq('hiking_spot_id', 72)
        .ilike('route_name', `%${update.route_name.split(' ')[0]}%`); // Partial match for route names
      
      if (error) {
        console.error(`❌ Error updating ${update.route_name}:`, error);
      } else {
        console.log(`✅ Updated ${update.route_name}: ${update.start_coordinates} -> ${update.end_coordinates}`);
        updatedCount++;
      }
    }
    
    console.log(`\n🎉 Force update complete! Updated ${updatedCount} routes`);
    
    // Verify the updates
    console.log('\n🔍 Verifying force updates...');
    const { data: verifyRoutes, error: verifyError } = await supabase
      .from('trail_routes')
      .select('hiking_spot_id, route_name, start_coordinates, end_coordinates')
      .in('hiking_spot_id', [71, 72])
      .order('hiking_spot_id');
    
    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
    } else {
      console.log('📍 Verified coordinates:');
      verifyRoutes.forEach(route => {
        console.log(`Spot ${route.hiking_spot_id} - ${route.route_name}:`);
        console.log(`  ${route.start_coordinates} -> ${route.end_coordinates}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

forceUpdateBabagKanirag();
