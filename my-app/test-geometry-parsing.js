// Test script to verify PostGIS geometry parsing
// Run this with: node test-geometry-parsing.js

// Sample PostGIS ST_AsGeoJSON output
const samplePostGISOutput = '{"type":"LineString","coordinates":[[123.7480,10.2070],[123.7490,10.2075],[123.7500,10.2080],[123.7510,10.2090],[123.7520,10.2095]]}';

console.log('=== PostGIS Geometry Parsing Test ===');
console.log('Raw PostGIS output:', samplePostGISOutput);

try {
  const parsedGeometry = JSON.parse(samplePostGISOutput);
  console.log('Parsed geometry:', parsedGeometry);
  console.log('Geometry type:', parsedGeometry.type);
  console.log('Coordinate count:', parsedGeometry.coordinates.length);
  console.log('First coordinate [lng, lat]:', parsedGeometry.coordinates[0]);
  console.log('Last coordinate [lng, lat]:', parsedGeometry.coordinates[parsedGeometry.coordinates.length - 1]);
  
  // Convert to Leaflet format [lat, lng]
  const leafletCoords = parsedGeometry.coordinates.map(coord => [coord[1], coord[0]]);
  console.log('Converted to Leaflet [lat, lng]:');
  console.log('First point:', leafletCoords[0]);
  console.log('Last point:', leafletCoords[leafletCoords.length - 1]);
  
  // Check if this matches Mount Naupa coordinates
  console.log('\n=== Coordinate Validation ===');
  console.log('Expected Mount Naupa area: ~10.2083°N, 123.7500°E');
  console.log('First point latitude:', leafletCoords[0][0], '(should be ~10.207)');
  console.log('First point longitude:', leafletCoords[0][1], '(should be ~123.748)');
  
  const isInExpectedArea = leafletCoords[0][0] > 10.2 && leafletCoords[0][0] < 10.22 && 
                          leafletCoords[0][1] > 123.74 && leafletCoords[0][1] < 123.76;
  console.log('Coordinates in expected Mount Naupa area:', isInExpectedArea ? 'YES' : 'NO');
  
} catch (error) {
  console.error('Failed to parse geometry:', error);
}

// Test the fallback coordinate construction
console.log('\n=== Fallback Coordinate Construction Test ===');
const mockRoute = {
  route_name: 'Test Route',
  start_latitude: 10.2070,
  start_longitude: 123.7480,
  end_latitude: 10.2095,
  end_longitude: 123.7520,
  waypoints: [
    {"lat":10.2075,"lng":123.7490},
    {"lat":10.2080,"lng":123.7500},
    {"lat":10.2090,"lng":123.7510}
  ]
};

const fallbackCoords = [];
fallbackCoords.push([mockRoute.start_longitude, mockRoute.start_latitude]);
mockRoute.waypoints.forEach(wp => fallbackCoords.push([wp.lng, wp.lat]));
fallbackCoords.push([mockRoute.end_longitude, mockRoute.end_latitude]);

console.log('Fallback coordinates [lng, lat]:', fallbackCoords);
console.log('Fallback coordinate count:', fallbackCoords.length);

// Convert to Leaflet
const fallbackLeaflet = fallbackCoords.map(coord => [coord[1], coord[0]]);
console.log('Fallback Leaflet [lat, lng]:', fallbackLeaflet);
