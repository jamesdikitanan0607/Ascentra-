const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://tppimfexrhptzdxlxcbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcGltZmV4cmhwdHpkeGx4Y2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTM3MzMsImV4cCI6MjA3MzY2OTczM30.sQCNoudMxCodsGqNespKTBrH0i34c71eyzYDrSzyz78';

const supabase = createClient(supabaseUrl, supabaseKey);

// Transform database trail to app format (copied from trailService.ts)
function transformTrailData(trail, spot) {
  // Extract coordinates from database trail data
  let startCoords;
  let endCoords;
  let coordinates;
  
  try {
    // Check for start_coordinates (PostGIS point format: "POINT(lng lat)")
    if (trail.start_coordinates) {
      if (typeof trail.start_coordinates === 'string') {
        // Parse PostGIS point format
        const match = trail.start_coordinates.match(/POINT\(([^)]+)\)/);
        if (match) {
          const [lng, lat] = match[1].split(' ').map(Number);
          startCoords = [lat, lng]; // App expects [lat, lng]
        }
      } else if (Array.isArray(trail.start_coordinates) && trail.start_coordinates.length === 2) {
        // Direct coordinate array [lng, lat] from PostGIS
        startCoords = [trail.start_coordinates[1], trail.start_coordinates[0]]; // Convert to [lat, lng]
      }
    }

    // Check for end_coordinates (PostGIS point format)
    if (trail.end_coordinates) {
      if (typeof trail.end_coordinates === 'string') {
        // Parse PostGIS point format
        const match = trail.end_coordinates.match(/POINT\(([^)]+)\)/);
        if (match) {
          const [lng, lat] = match[1].split(' ').map(Number);
          endCoords = [lat, lng]; // App expects [lat, lng]
        }
      } else if (Array.isArray(trail.end_coordinates) && trail.end_coordinates.length === 2) {
        // Direct coordinate array [lng, lat] from PostGIS
        endCoords = [trail.end_coordinates[1], trail.end_coordinates[0]]; // Convert to [lat, lng]
      }
    }

    // Extract route coordinates for the trail path
    if (trail.route_coordinates && Array.isArray(trail.route_coordinates)) {
      // Database format: [{ latitude: number, longitude: number }, ...]
      coordinates = trail.route_coordinates.map(coord => [coord.longitude, coord.latitude]);
    } else if (trail.geojson_path && trail.geojson_path.coordinates) {
      // GeoJSON format: [[lng, lat], ...]
      coordinates = trail.geojson_path.coordinates;
    }

    // Fallback to spot coordinates if no trail coordinates found
    if (!startCoords || !endCoords) {
      startCoords = startCoords || [spot.latitude, spot.longitude];
      endCoords = endCoords || [spot.latitude, spot.longitude];
    }

    // If no route coordinates, create a simple line from start to end
    if (!coordinates && startCoords && endCoords) {
      coordinates = [[startCoords[1], startCoords[0]], [endCoords[1], endCoords[0]]]; // [lng, lat] format
    }

  } catch (error) {
    console.warn('Error parsing coordinates for trail:', trail.route_name || trail.name, error);
    // Fallback to spot coordinates
    startCoords = [spot.latitude, spot.longitude];
    endCoords = [spot.latitude, spot.longitude];
    coordinates = [[spot.longitude, spot.latitude]];
  }

  return {
    ...trail,
    id: trail.route_id || trail.id,
    name: trail.route_name || trail.name || 'Unnamed Trail',
    description: trail.description,
    difficulty: trail.difficulty || 'Moderate',
    length: trail.distance_km || trail.length || 0,
    elevation_gain: trail.elevation_gain_m || trail.elevation_gain || 0,
    estimated_time: (trail.estimated_duration_hr || trail.estimated_time || 0) * 60, // Convert hours to minutes
    trail_type: trail.trail_type,
    waypoints: JSON.stringify(coordinates || []),
    hiking_spot: spot,
    start_coordinates: startCoords,
    end_coordinates: endCoords,
    coordinates: coordinates, // Add coordinates for the map component
    distance_km: trail.distance_km || trail.length || 0,
    elevation_m: trail.elevation_gain_m || trail.elevation_gain || 0,
    duration_hr: trail.estimated_duration_hr || (trail.estimated_time || 0) / 60,
    highlights: trail.highlights || trail.description || `${trail.difficulty || 'Moderate'} trail with ${trail.elevation_gain_m || trail.elevation_gain || 0}m elevation gain.`,
    created_at: trail.created_at || new Date().toISOString(),
    updated_at: trail.updated_at || new Date().toISOString()
  };
}

async function verifyTrailService() {
  console.log('🔍 Verifying trail service transformation...\n');

  try {
    // Fetch all hiking spots
    const { data: spots, error: spotsError } = await supabase
      .from('hiking_spots')
      .select('*')
      .order('name', { ascending: true });

    if (spotsError) {
      console.error('❌ Error fetching hiking spots:', spotsError);
      return;
    }

    console.log(`📍 Found ${spots.length} hiking spots\n`);

    let successCount = 0;
    let failureCount = 0;

    // Test each hiking spot
    for (const spot of spots) {
      console.log(`\n🏔️  Testing: ${spot.name} (ID: ${spot.hiking_spot_id})`);
      
      try {
        // Fetch trail routes for this spot
        const { data: routes, error: routesError } = await supabase
          .from('trail_routes')
          .select('*')
          .eq('hiking_spot_id', spot.hiking_spot_id)
          .order('route_name', { ascending: true });

        if (routesError) {
          console.log(`   ❌ Error fetching routes: ${routesError.message}`);
          failureCount++;
          continue;
        }

        if (!routes || routes.length === 0) {
          console.log(`   ⚠️  No trail routes found`);
          failureCount++;
          continue;
        }

        console.log(`   ✅ Found ${routes.length} trail route(s)`);
        
        let spotHasValidRoutes = false;
        
        // Transform each route and check if it has valid data
        for (const route of routes) {
          const transformedRoute = transformTrailData(route, spot);
          
          const hasCoordinates = transformedRoute.coordinates && Array.isArray(transformedRoute.coordinates) && transformedRoute.coordinates.length > 0;
          const hasStartEnd = transformedRoute.start_coordinates && transformedRoute.end_coordinates;
          const hasName = transformedRoute.name && transformedRoute.name !== 'Unnamed Trail';
          
          if (hasCoordinates && hasStartEnd) {
            console.log(`      ✅ Route "${transformedRoute.name}": ${transformedRoute.coordinates.length} coordinate points`);
            spotHasValidRoutes = true;
          } else {
            const issues = [];
            if (!hasName) issues.push('unnamed');
            if (!hasCoordinates) issues.push('no coordinates');
            if (!hasStartEnd) issues.push('no start/end points');
            console.log(`      ⚠️  Route "${transformedRoute.name}": ${issues.join(', ')}`);
          }
        }
        
        if (spotHasValidRoutes) {
          console.log(`   ✅ Spot has valid trail routes`);
          successCount++;
        } else {
          console.log(`   ❌ No valid trail routes found`);
          failureCount++;
        }

      } catch (error) {
        console.log(`   ❌ Error processing spot: ${error.message}`);
        failureCount++;
      }
    }

    // Summary
    console.log('\n==================================================');
    console.log('📊 TRAIL SERVICE VERIFICATION SUMMARY');
    console.log('==================================================');
    console.log(`✅ Successful spots: ${successCount}`);
    console.log(`❌ Failed spots: ${failureCount}`);
    console.log(`🏔️ Total spots: ${successCount + failureCount}`);
    console.log(`📈 Success rate: ${((successCount / (successCount + failureCount)) * 100).toFixed(1)}%`);

    if (failureCount > 0) {
      console.log('\n⚠️  Some spots need attention.');
    } else {
      console.log('\n🎉 All spots have valid trail routes!');
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

verifyTrailService();