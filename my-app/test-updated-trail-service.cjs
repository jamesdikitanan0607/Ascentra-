const { createClient } = require('@supabase/supabase-js');

// Mock the supabase client for the trail service
const supabase = createClient('https://tppimfexrhptzdxlxcbj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcGltZmV4cmhwdHpkeGx4Y2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTM3MzMsImV4cCI6MjA3MzY2OTczM30.sQCNoudMxCodsGqNespKTBrH0i34c71eyzYDrSzyz78');

// Simplified version of the transformTrailData function
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

async function testUpdatedTrailService() {
  try {
    console.log('🧪 Testing Updated Trail Service...\n');

    // Fetch trails from database first
    const { data: trails, error: trailsError } = await supabase
      .from('trail_routes')
      .select('*')
      .order('hiking_spot_id', { ascending: true })
      .order('route_name', { ascending: true });

    if (trailsError) {
      console.error('❌ Error fetching trails from database:', trailsError);
      return;
    }

    const { data: spots, error: spotsError } = await supabase
      .from('hiking_spots')
      .select('*')
      .order('name', { ascending: true });

    if (spotsError) {
      console.error('❌ Error fetching hiking spots from database:', spotsError);
      return;
    }

    // Create a map of spots for quick lookup
    const spotsMap = new Map();
    spots?.forEach(spot => {
      spotsMap.set(spot.hiking_spot_id, spot);
    });

    // Transform database data to TrailWithSpot format
    const allTrails = [];
    trails?.forEach(trail => {
      const spot = spotsMap.get(trail.hiking_spot_id);
      if (spot) {
        allTrails.push(transformTrailData(trail, spot));
      }
    });

    console.log(`✅ Loaded ${allTrails.length} trails from ${spots?.length} hiking spots\n`);

    // Group trails by hiking spot
    const trailsBySpot = new Map();
    allTrails.forEach(trail => {
      const spotName = trail.hiking_spot.name;
      if (!trailsBySpot.has(spotName)) {
        trailsBySpot.set(spotName, []);
      }
      trailsBySpot.get(spotName).push(trail);
    });

    // Verify each hiking spot has 5 routes
    console.log('📊 Trail Distribution by Hiking Spot:');
    let totalRoutes = 0;
    let spotsWithCorrectRoutes = 0;

    trailsBySpot.forEach((trails, spotName) => {
      const routeCount = trails.length;
      totalRoutes += routeCount;
      
      if (routeCount === 5) {
        spotsWithCorrectRoutes++;
        console.log(`✅ ${spotName}: ${routeCount} routes`);
      } else {
        console.log(`⚠️  ${spotName}: ${routeCount} routes (expected 5)`);
      }
    });

    console.log(`\n📈 Summary:`);
    console.log(`- Total hiking spots: ${trailsBySpot.size}`);
    console.log(`- Total trail routes: ${totalRoutes}`);
    console.log(`- Spots with correct route count (5): ${spotsWithCorrectRoutes}`);
    console.log(`- Expected total: 15 spots × 5 routes = 75 routes`);

    if (trailsBySpot.size === 15 && totalRoutes === 75 && spotsWithCorrectRoutes === 15) {
      console.log(`\n🎉 SUCCESS: All data loaded correctly!`);
    } else {
      console.log(`\n❌ ISSUE: Data doesn't match expected structure`);
    }

    // Test trail information formatting
    console.log(`\n🔍 Sample Trail Information Formatting:`);
    const sampleTrails = allTrails.slice(0, 3);
    sampleTrails.forEach(trail => {
      console.log(`- ${trail.name}:`);
      console.log(`  Distance: ${trail.distance_km}km`);
      console.log(`  Elevation: ${trail.elevation_m}m`);
      console.log(`  Duration: ${trail.duration_hr}h`);
      console.log(`  Start: [${trail.start_coordinates?.[0]?.toFixed(4)}, ${trail.start_coordinates?.[1]?.toFixed(4)}]`);
      console.log(`  End: [${trail.end_coordinates?.[0]?.toFixed(4)}, ${trail.end_coordinates?.[1]?.toFixed(4)}]`);
      console.log(`  Waypoints: ${trail.coordinates?.length || 0} points`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUpdatedTrailService();