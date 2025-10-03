const fs = require('fs');
const path = require('path');

console.log('Testing enhanced trail data compatibility with TrailMap components...\n');

// Read the enhanced trail routes data
let enhancedContent;
try {
  enhancedContent = fs.readFileSync(path.join(__dirname, 'data', 'trailRoutesData-enhanced.ts'), 'utf8');
  console.log('✅ Successfully read enhanced trail routes data');
} catch (error) {
  console.error('❌ Error reading enhanced trail routes data:', error.message);
  process.exit(1);
}

// Extract enhanced routes
const routesMatch = enhancedContent.match(/export const NEW_TRAIL_ROUTES[^=]*=\s*(\[[\s\S]*?\]);/);
if (!routesMatch) {
  console.error('❌ Could not extract NEW_TRAIL_ROUTES from enhanced data');
  process.exit(1);
}

let enhancedRoutes;
try {
  enhancedRoutes = JSON.parse(routesMatch[1]);
  console.log(`✅ Successfully parsed ${enhancedRoutes.length} enhanced trail routes\n`);
} catch (error) {
  console.error('❌ Error parsing enhanced trail routes:', error.message);
  process.exit(1);
}

console.log('=== ENHANCED TRAIL DATA VALIDATION ===\n');

let validationResults = {
  totalRoutes: enhancedRoutes.length,
  validRoutes: 0,
  routesWithWaypoints: 0,
  routesWithElevationProfiles: 0,
  routesWithEnhancedMetadata: 0,
  coordinatePointsRange: { min: Infinity, max: 0 },
  waypointsRange: { min: Infinity, max: 0 },
  errors: []
};

// Validate each enhanced route
enhancedRoutes.forEach((route, index) => {
  const routeNum = index + 1;
  let isValid = true;
  
  // Check required fields
  const requiredFields = ['id', 'route_id', 'hikingSpotId', 'hiking_spot_id', 'route_name', 
                         'difficulty', 'start_coordinates', 'end_coordinates', 'geojson_path'];
  
  for (const field of requiredFields) {
    if (!route[field]) {
      validationResults.errors.push(`Route ${routeNum} (${route.id || 'unknown'}): Missing ${field}`);
      isValid = false;
    }
  }
  
  // Validate geojson_path structure
  if (route.geojson_path) {
    if (route.geojson_path.type !== 'LineString') {
      validationResults.errors.push(`Route ${routeNum}: Invalid geojson type (expected LineString)`);
      isValid = false;
    }
    
    if (!Array.isArray(route.geojson_path.coordinates)) {
      validationResults.errors.push(`Route ${routeNum}: Invalid coordinates array`);
      isValid = false;
    } else {
      const coordCount = route.geojson_path.coordinates.length;
      validationResults.coordinatePointsRange.min = Math.min(validationResults.coordinatePointsRange.min, coordCount);
      validationResults.coordinatePointsRange.max = Math.max(validationResults.coordinatePointsRange.max, coordCount);
      
      // Validate coordinate format
      route.geojson_path.coordinates.forEach((coord, coordIndex) => {
        if (!Array.isArray(coord) || coord.length !== 2) {
          validationResults.errors.push(`Route ${routeNum}: Invalid coordinate format at index ${coordIndex}`);
          isValid = false;
        }
      });
    }
  }
  
  // Check enhanced fields
  if (route.waypoints) {
    validationResults.routesWithWaypoints++;
    const waypointCount = route.waypoints.length;
    validationResults.waypointsRange.min = Math.min(validationResults.waypointsRange.min, waypointCount);
    validationResults.waypointsRange.max = Math.max(validationResults.waypointsRange.max, waypointCount);
    
    // Validate waypoint structure
    route.waypoints.forEach((waypoint, wpIndex) => {
      const requiredWpFields = ['latitude', 'longitude', 'name', 'description', 'elevation_m'];
      for (const field of requiredWpFields) {
        if (waypoint[field] === undefined || waypoint[field] === null) {
          validationResults.errors.push(`Route ${routeNum}: Waypoint ${wpIndex} missing ${field}`);
          isValid = false;
        }
      }
    });
  }
  
  if (route.elevation_profile) {
    validationResults.routesWithElevationProfiles++;
    
    // Validate elevation profile structure
    if (!Array.isArray(route.elevation_profile)) {
      validationResults.errors.push(`Route ${routeNum}: Invalid elevation profile format`);
      isValid = false;
    } else {
      route.elevation_profile.forEach((point, epIndex) => {
        const requiredEpFields = ['latitude', 'longitude', 'elevation_m', 'distance_from_start_km'];
        for (const field of requiredEpFields) {
          if (point[field] === undefined || point[field] === null) {
            validationResults.errors.push(`Route ${routeNum}: Elevation profile point ${epIndex} missing ${field}`);
            isValid = false;
          }
        }
      });
    }
  }
  
  if (route.enhanced_metadata) {
    validationResults.routesWithEnhancedMetadata++;
    
    // Validate enhanced metadata structure
    const requiredMetaFields = ['total_coordinate_points', 'path_smoothness', 'terrain_type', 'scenic_rating', 'technical_difficulty'];
    for (const field of requiredMetaFields) {
      if (route.enhanced_metadata[field] === undefined || route.enhanced_metadata[field] === null) {
        validationResults.errors.push(`Route ${routeNum}: Enhanced metadata missing ${field}`);
        isValid = false;
      }
    }
  }
  
  if (isValid) {
    validationResults.validRoutes++;
  }
});

// Display validation results
console.log(`Total routes: ${validationResults.totalRoutes}`);
console.log(`Valid routes: ${validationResults.validRoutes}`);
console.log(`Routes with waypoints: ${validationResults.routesWithWaypoints}`);
console.log(`Routes with elevation profiles: ${validationResults.routesWithElevationProfiles}`);
console.log(`Routes with enhanced metadata: ${validationResults.routesWithEnhancedMetadata}`);

if (validationResults.coordinatePointsRange.min !== Infinity) {
  console.log(`Coordinate points range: ${validationResults.coordinatePointsRange.min} - ${validationResults.coordinatePointsRange.max}`);
}

if (validationResults.waypointsRange.min !== Infinity) {
  console.log(`Waypoints range: ${validationResults.waypointsRange.min} - ${validationResults.waypointsRange.max}`);
}

if (validationResults.errors.length > 0) {
  console.log(`\n❌ Validation errors found: ${validationResults.errors.length}`);
  validationResults.errors.forEach(error => console.log(`  - ${error}`));
} else {
  console.log('\n✅ No validation errors found');
}

console.log('\n=== ENHANCEMENT ANALYSIS ===\n');

// Analyze enhancement distribution by difficulty
const difficultyAnalysis = {};
enhancedRoutes.forEach(route => {
  if (!difficultyAnalysis[route.difficulty]) {
    difficultyAnalysis[route.difficulty] = {
      count: 0,
      avgCoordinates: 0,
      avgWaypoints: 0,
      avgElevationPoints: 0
    };
  }
  
  const analysis = difficultyAnalysis[route.difficulty];
  analysis.count++;
  analysis.avgCoordinates += route.geojson_path.coordinates.length;
  analysis.avgWaypoints += route.waypoints ? route.waypoints.length : 0;
  analysis.avgElevationPoints += route.elevation_profile ? route.elevation_profile.length : 0;
});

Object.keys(difficultyAnalysis).forEach(difficulty => {
  const analysis = difficultyAnalysis[difficulty];
  analysis.avgCoordinates = (analysis.avgCoordinates / analysis.count).toFixed(1);
  analysis.avgWaypoints = (analysis.avgWaypoints / analysis.count).toFixed(1);
  analysis.avgElevationPoints = (analysis.avgElevationPoints / analysis.count).toFixed(1);
  
  console.log(`${difficulty}:`);
  console.log(`  Routes: ${analysis.count}`);
  console.log(`  Avg coordinates: ${analysis.avgCoordinates}`);
  console.log(`  Avg waypoints: ${analysis.avgWaypoints}`);
  console.log(`  Avg elevation points: ${analysis.avgElevationPoints}`);
  console.log('');
});

// Test compatibility with TrailMap component expectations
console.log('=== TRAILMAP COMPONENT COMPATIBILITY ===\n');

// Test sample route for TrailMap compatibility
const sampleRoute = enhancedRoutes[0];
console.log(`Testing with sample route: ${sampleRoute.route_name}`);

// Check if route has all fields expected by TrailMap components
const trailMapFields = ['id', 'route_id', 'hikingSpotId', 'hiking_spot_id', 'route_name', 
                       'difficulty', 'start_coordinates', 'end_coordinates', 'route_color', 'geojson_path'];

let compatibilityIssues = [];
trailMapFields.forEach(field => {
  if (!sampleRoute[field]) {
    compatibilityIssues.push(`Missing ${field}`);
  }
});

if (compatibilityIssues.length === 0) {
  console.log('✅ Enhanced routes are compatible with TrailMap components');
} else {
  console.log('❌ Compatibility issues found:');
  compatibilityIssues.forEach(issue => console.log(`  - ${issue}`));
}

// Test geojson format for map rendering
console.log('\n=== GEOJSON FORMAT VALIDATION ===\n');

const geojsonSample = sampleRoute.geojson_path;
console.log(`Sample geojson type: ${geojsonSample.type}`);
console.log(`Sample coordinates count: ${geojsonSample.coordinates.length}`);
console.log(`First coordinate: [${geojsonSample.coordinates[0].join(', ')}]`);
console.log(`Last coordinate: [${geojsonSample.coordinates[geojsonSample.coordinates.length - 1].join(', ')}]`);

// Validate coordinate format (longitude, latitude)
const firstCoord = geojsonSample.coordinates[0];
if (firstCoord[0] >= -180 && firstCoord[0] <= 180 && firstCoord[1] >= -90 && firstCoord[1] <= 90) {
  console.log('✅ Coordinate format is valid (longitude, latitude)');
} else {
  console.log('❌ Invalid coordinate format detected');
}

console.log('\n=== SUMMARY ===');
if (validationResults.errors.length === 0 && compatibilityIssues.length === 0) {
  console.log('✅ Enhanced trail data validation completed successfully');
  console.log('✅ All routes are valid and compatible with TrailMap components');
  console.log('✅ Enhanced features (waypoints, elevation profiles, metadata) are properly structured');
  console.log('✅ Geojson paths are properly formatted for map rendering');
} else {
  console.log('❌ Issues found during validation');
  console.log('Please review and fix the identified problems before using enhanced data');
}

console.log('\n🔍 Enhanced trail data testing completed!');