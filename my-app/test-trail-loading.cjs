// Simple test to verify trail data loading
const fs = require('fs');
const path = require('path');

console.log('Testing trail data structure and availability...\n');

// Read the trail routes data file
const trailDataPath = path.join(__dirname, 'data', 'trailRoutesData.ts');
const hikingSpotDataPath = path.join(__dirname, 'data', 'hikingSpotData.ts');

try {
  const trailData = fs.readFileSync(trailDataPath, 'utf8');
  const hikingSpotData = fs.readFileSync(hikingSpotDataPath, 'utf8');
  
  console.log('✅ Successfully read trail routes data file');
  console.log('✅ Successfully read hiking spots data file');
  
  // Extract hiking spot IDs from trail data
  const trailSpotMatches = trailData.match(/hiking_spot_id: '[0-9]+'/g) || [];
  const trailSpotIds = [...new Set(trailSpotMatches.map(match => match.match(/'([0-9]+)'/)[1]))];
  
  // Extract hiking spot IDs from hiking spot data
  const hikingSpotMatches = hikingSpotData.match(/id: '[0-9]+'/g) || [];
  const hikingSpotIds = [...new Set(hikingSpotMatches.map(match => match.match(/'([0-9]+)'/)[1]))];
  
  console.log(`\nFound ${hikingSpotIds.length} hiking spots: ${hikingSpotIds.sort().join(', ')}`);
  console.log(`Found trail routes for ${trailSpotIds.length} spots: ${trailSpotIds.sort().join(', ')}`);
  
  // Check which spots are missing trails
  const spotsWithoutTrails = hikingSpotIds.filter(id => !trailSpotIds.includes(id));
  const trailsWithoutSpots = trailSpotIds.filter(id => !hikingSpotIds.includes(id));
  
  if (spotsWithoutTrails.length > 0) {
    console.log(`\n⚠️  Hiking spots missing trail routes: ${spotsWithoutTrails.join(', ')}`);
  }
  
  if (trailsWithoutSpots.length > 0) {
    console.log(`\n⚠️  Trail routes for non-existent spots: ${trailsWithoutSpots.join(', ')}`);
  }
  
  // Count routes per spot
  console.log('\nRoutes per hiking spot:');
  trailSpotIds.forEach(spotId => {
    const count = trailSpotMatches.filter(match => match.includes(`'${spotId}'`)).length;
    console.log(`  Spot ${spotId}: ${count} routes`);
  });
  
  // Check for route_id field
  const routeIdMatches = trailData.match(/route_id: '[^']+'/g) || [];
  console.log(`\n✅ Found ${routeIdMatches.length} route_id fields in trail data`);
  
  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Total hiking spots: ${hikingSpotIds.length}`);
  console.log(`Spots with trails: ${trailSpotIds.length}`);
  console.log(`Spots missing trails: ${spotsWithoutTrails.length}`);
  console.log(`Total trail routes: ${trailSpotMatches.length}`);
  
  if (spotsWithoutTrails.length === 0) {
    console.log('✅ All hiking spots have trail routes!');
  } else {
    console.log('❌ Some hiking spots are missing trail routes');
  }
  
} catch (error) {
  console.log(`❌ Error reading files: ${error.message}`);
}