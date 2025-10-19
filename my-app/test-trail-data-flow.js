// Test script to simulate the complete trail data flow
// This will help us verify the geometry parsing works correctly

// Mock PostGIS response for Mount Naupa routes
const mockPostGISResponse = [
  {
    id: '1',
    route_id: '1',
    route_name: 'Naupa Village Trail',
    hiking_spot_id: '3',
    difficulty: 'Easy',
    distance: 2.6,
    elevation_gain: 190,
    estimated_duration_minutes: 90,
    route_features: 'Agricultural scenery, community access',
    route_description: 'Accessible trail passing through farms and local settlements.',
    start_latitude: 10.2070,
    start_longitude: 123.7480,
    end_latitude: 10.2095,
    end_longitude: 123.7520,
    waypoints: '[{"lat":10.2075,"lng":123.7490},{"lat":10.2080,"lng":123.7500},{"lat":10.2090,"lng":123.7510}]',
    // This is what ST_AsGeoJSON(route_geom) would return
    geojson_geometry: '{"type":"LineString","coordinates":[[123.7480,10.2070],[123.7490,10.2075],[123.7500,10.2080],[123.7510,10.2090],[123.7520,10.2095]]}'
  },
  {
    id: '2',
    route_id: '2',
    route_name: 'Naupa Forest Path',
    hiking_spot_id: '3',
    difficulty: 'Moderate',
    distance: 4.5,
    elevation_gain: 330,
    estimated_duration_minutes: 150,
    route_features: 'Secondary forest, shaded canopy',
    route_description: 'Forest approach with natural springs and birdlife.',
    start_latitude: 10.2060,
    start_longitude: 123.7470,
    end_latitude: 10.2105,
    end_longitude: 123.7530,
    waypoints: '[{"lat":10.2070,"lng":123.7485},{"lat":10.2085,"lng":123.7505},{"lat":10.2095,"lng":123.7520}]',
    geojson_geometry: '{"type":"LineString","coordinates":[[123.7470,10.2060],[123.7485,10.2070],[123.7505,10.2085],[123.7520,10.2095],[123.7530,10.2105]]}'
  }
];

console.log('=== Trail Data Flow Test ===');
console.log('Simulating supabaseService.ts processing...\n');

// Simulate the processing logic from supabaseService.ts
const processedRoutes = mockPostGISResponse.map(route => {
  console.log(`Processing route: ${route.route_name}`);
  console.log(`Raw PostGIS geometry: ${route.geojson_geometry}`);
  
  // Parse PostGIS geometry (same logic as supabaseService.ts)
  let geojsonPath = { type: 'LineString', coordinates: [] };
  
  if (route.geojson_geometry) {
    try {
      const parsedGeometry = JSON.parse(route.geojson_geometry);
      if (parsedGeometry && parsedGeometry.coordinates && Array.isArray(parsedGeometry.coordinates)) {
        geojsonPath = {
          type: 'LineString',
          coordinates: parsedGeometry.coordinates
        };
        console.log(`✅ Using PostGIS geometry with ${parsedGeometry.coordinates.length} points`);
        console.log(`First coord [lng,lat]: [${parsedGeometry.coordinates[0][0]}, ${parsedGeometry.coordinates[0][1]}]`);
        console.log(`Last coord [lng,lat]: [${parsedGeometry.coordinates[parsedGeometry.coordinates.length-1][0]}, ${parsedGeometry.coordinates[parsedGeometry.coordinates.length-1][1]}]`);
      }
    } catch (e) {
      console.warn(`❌ Failed to parse PostGIS geometry: ${e}`);
    }
  }
  
  // Convert to route coordinates for compatibility
  const routeCoordinates = geojsonPath.coordinates.map(coord => ({
    latitude: coord[1],  // lat from [lng, lat]
    longitude: coord[0]  // lng from [lng, lat]
  }));
  
  console.log(`Route coordinates count: ${routeCoordinates.length}`);
  console.log(`First point: lat=${routeCoordinates[0].latitude}, lng=${routeCoordinates[0].longitude}`);
  console.log(`Last point: lat=${routeCoordinates[routeCoordinates.length-1].latitude}, lng=${routeCoordinates[routeCoordinates.length-1].longitude}`);
  
  // Check if coordinates are in Mount Naupa area
  const firstPoint = routeCoordinates[0];
  const isInNaupaArea = firstPoint.latitude > 10.2 && firstPoint.latitude < 10.22 && 
                       firstPoint.longitude > 123.74 && firstPoint.longitude < 123.76;
  console.log(`✅ Coordinates in Mount Naupa area: ${isInNaupaArea ? 'YES' : 'NO'}`);
  console.log('---\n');
  
  return {
    ...route,
    geojson_path: geojsonPath,
    route_coordinates: routeCoordinates
  };
});

console.log('=== Component Processing Test ===');
console.log('Simulating LeafletTrailMap component processing...\n');

// Simulate what the map component would do
processedRoutes.forEach((route, index) => {
  console.log(`Map processing route ${index + 1}: ${route.route_name}`);
  
  if (route.geojson_path && route.geojson_path.coordinates && route.geojson_path.coordinates.length >= 3) {
    // Convert [lng, lat] to Leaflet [lat, lng] format
    const leafletCoordinates = route.geojson_path.coordinates.map(coord => [coord[1], coord[0]]);
    
    console.log(`✅ Valid coordinates for polyline: ${leafletCoordinates.length} points`);
    console.log(`Start marker at: [${leafletCoordinates[0][0]}, ${leafletCoordinates[0][1]}]`);
    console.log(`End marker at: [${leafletCoordinates[leafletCoordinates.length-1][0]}, ${leafletCoordinates[leafletCoordinates.length-1][1]}]`);
    
    // Calculate bounds (simplified)
    const lats = leafletCoordinates.map(coord => coord[0]);
    const lngs = leafletCoordinates.map(coord => coord[1]);
    const bounds = {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };
    console.log(`Map bounds: N=${bounds.north}, S=${bounds.south}, E=${bounds.east}, W=${bounds.west}`);
    
    // Check if this would show a curved line vs straight line
    const isLinear = leafletCoordinates.length <= 2;
    console.log(`✅ Will render: ${isLinear ? 'STRAIGHT LINE' : 'CURVED POLYLINE'}`);
  } else {
    console.log(`❌ Invalid coordinates - would skip rendering`);
  }
  console.log('---\n');
});

console.log('=== Summary ===');
console.log(`Total routes processed: ${processedRoutes.length}`);
console.log(`Routes with valid PostGIS geometry: ${processedRoutes.filter(r => r.geojson_path.coordinates.length > 0).length}`);
console.log(`Routes that would render curved polylines: ${processedRoutes.filter(r => r.geojson_path.coordinates.length > 2).length}`);
