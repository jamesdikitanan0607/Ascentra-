// Test the updated mock data to ensure it matches PostGIS coordinates
const { getMockTrailRoutes } = require('./services/mockTrailData.ts');

console.log('=== Testing Updated Mock Data ===');

// Test Mount Naupa routes (hiking_spot_id = '1')
const naupaRoutes = getMockTrailRoutes('1');

console.log(`Found ${naupaRoutes.length} routes for Mount Naupa`);
console.log();

naupaRoutes.forEach((route, index) => {
  console.log(`Route ${index + 1}: ${route.route_name}`);
  console.log(`Difficulty: ${route.difficulty}`);
  console.log(`Distance: ${route.distance_km}km`);
  console.log(`Elevation: ${route.elevation_gain_m}m`);
  console.log(`Duration: ${route.estimated_duration_min}min`);
  
  const coords = route.geojson_path.coordinates;
  console.log(`Coordinates: ${coords.length} points`);
  console.log(`Start [lng, lat]: [${coords[0][0]}, ${coords[0][1]}]`);
  console.log(`End [lng, lat]: [${coords[coords.length-1][0]}, ${coords[coords.length-1][1]}]`);
  
  // Convert to Leaflet format for verification
  const leafletCoords = coords.map(coord => [coord[1], coord[0]]);
  console.log(`Leaflet Start [lat, lng]: [${leafletCoords[0][0]}, ${leafletCoords[0][1]}]`);
  console.log(`Leaflet End [lat, lng]: [${leafletCoords[leafletCoords.length-1][0]}, ${leafletCoords[leafletCoords.length-1][1]}]`);
  
  // Check if coordinates are in Mount Naupa area (10.2083°N, 123.7500°E)
  const firstPoint = leafletCoords[0];
  const isInNaupaArea = firstPoint[0] > 10.2 && firstPoint[0] < 10.22 && 
                       firstPoint[1] > 123.74 && firstPoint[1] < 123.76;
  console.log(`✅ In Mount Naupa area: ${isInNaupaArea ? 'YES' : 'NO'}`);
  
  // Check if it will render a curved line
  const isCurved = coords.length > 2;
  console.log(`✅ Will render: ${isCurved ? 'CURVED POLYLINE' : 'STRAIGHT LINE'}`);
  console.log('---');
});

console.log('\n=== Expected Results ===');
console.log('✅ All routes should be in Mount Naupa area (lat ~10.20-10.21, lng ~123.74-123.76)');
console.log('✅ All routes should have 5+ coordinate points for curved polylines');
console.log('✅ Routes should match the PostGIS data from insert-trail-routes-data.sql');
console.log('✅ When rendered on map, trails should appear in correct geographic location');
console.log('✅ No more straight lines between start/end points');
