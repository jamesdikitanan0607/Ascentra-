const fs = require('fs');
const path = require('path');

console.log('Checking ID field consistency in trail routes data...\n');

// Read the trail routes data
let trailRoutesContent;
try {
  trailRoutesContent = fs.readFileSync(path.join(__dirname, 'data', 'trailRoutesData.ts'), 'utf8');
  console.log('✅ Successfully read trailRoutesData.ts');
} catch (error) {
  console.error('❌ Error reading trailRoutesData.ts:', error.message);
  process.exit(1);
}

// Extract all trail route objects
const trailMatches = [...trailRoutesContent.matchAll(/{\s*id:\s*['"`]([^'"`]+)['"`][^}]*?}/gs)];
console.log(`Found ${trailMatches.length} trail route objects\n`);

// Check each trail route for ID field consistency
let inconsistentRoutes = [];
let missingHikingSpotId = [];
let missingHiking_spot_id = [];
let totalRoutes = 0;

// More comprehensive regex to extract trail route data
const routePattern = /{\s*id:\s*['"`]([^'"`]+)['"`].*?(?=},\s*{|}\s*];)/gs;
const routes = [...trailRoutesContent.matchAll(routePattern)];

console.log('=== ID FIELD CONSISTENCY CHECK ===\n');

for (const routeMatch of routes) {
  totalRoutes++;
  const routeText = routeMatch[0];
  const routeId = routeMatch[1];
  
  // Check for hikingSpotId field
  const hasHikingSpotId = /hikingSpotId:\s*['"`]([^'"`]+)['"`]/.test(routeText);
  const hikingSpotIdMatch = routeText.match(/hikingSpotId:\s*['"`]([^'"`]+)['"`]/);
  
  // Check for hiking_spot_id field
  const hasHiking_spot_id = /hiking_spot_id:\s*['"`]([^'"`]+)['"`]/.test(routeText);
  const hiking_spot_idMatch = routeText.match(/hiking_spot_id:\s*['"`]([^'"`]+)['"`]/);
  
  if (!hasHikingSpotId) {
    missingHikingSpotId.push(routeId);
  }
  
  if (!hasHiking_spot_id) {
    missingHiking_spot_id.push(routeId);
  }
  
  // Check if both fields exist but have different values
  if (hasHikingSpotId && hasHiking_spot_id) {
    const hikingSpotIdValue = hikingSpotIdMatch[1];
    const hiking_spot_idValue = hiking_spot_idMatch[1];
    
    if (hikingSpotIdValue !== hiking_spot_idValue) {
      inconsistentRoutes.push({
        id: routeId,
        hikingSpotId: hikingSpotIdValue,
        hiking_spot_id: hiking_spot_idValue
      });
    }
  }
}

console.log(`Total routes analyzed: ${totalRoutes}`);
console.log(`Routes missing 'hikingSpotId': ${missingHikingSpotId.length}`);
console.log(`Routes missing 'hiking_spot_id': ${missingHiking_spot_id.length}`);
console.log(`Routes with inconsistent ID values: ${inconsistentRoutes.length}\n`);

if (missingHikingSpotId.length > 0) {
  console.log('❌ Routes missing hikingSpotId field:');
  missingHikingSpotId.forEach(id => console.log(`  - ${id}`));
  console.log('');
}

if (missingHiking_spot_id.length > 0) {
  console.log('❌ Routes missing hiking_spot_id field:');
  missingHiking_spot_id.forEach(id => console.log(`  - ${id}`));
  console.log('');
}

if (inconsistentRoutes.length > 0) {
  console.log('❌ Routes with inconsistent ID values:');
  inconsistentRoutes.forEach(route => {
    console.log(`  - ${route.id}: hikingSpotId='${route.hikingSpotId}', hiking_spot_id='${route.hiking_spot_id}'`);
  });
  console.log('');
}

// Check field order consistency
console.log('=== FIELD ORDER ANALYSIS ===\n');

const hikingSpotIdFirst = (trailRoutesContent.match(/hikingSpotId:.*?hiking_spot_id:/gs) || []).length;
const hiking_spot_idFirst = (trailRoutesContent.match(/hiking_spot_id:.*?hikingSpotId:/gs) || []).length;

console.log(`Routes with 'hikingSpotId' before 'hiking_spot_id': ${hikingSpotIdFirst}`);
console.log(`Routes with 'hiking_spot_id' before 'hikingSpotId': ${hiking_spot_idFirst}`);

// Summary
console.log('\n=== SUMMARY ===');
if (missingHikingSpotId.length === 0 && missingHiking_spot_id.length === 0 && inconsistentRoutes.length === 0) {
  console.log('✅ All trail routes have consistent ID fields');
  console.log('✅ Both hikingSpotId and hiking_spot_id fields are present');
  console.log('✅ All ID values are consistent between both fields');
} else {
  console.log('❌ ID field inconsistencies found');
  console.log('Recommendations:');
  if (missingHikingSpotId.length > 0) {
    console.log('  - Add missing hikingSpotId fields');
  }
  if (missingHiking_spot_id.length > 0) {
    console.log('  - Add missing hiking_spot_id fields');
  }
  if (inconsistentRoutes.length > 0) {
    console.log('  - Fix inconsistent ID values between fields');
  }
}

console.log('\n🔍 ID field consistency check completed!');