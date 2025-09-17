const fs = require('fs');

// Read the current populate script
let content = fs.readFileSync('populate-trail-routes.cjs', 'utf8');

// Simple approach: add start_coordinates to all entries that don't have it
// Extract coordinates from geojson_path and create start_coordinates
const lines = content.split('\n');
const fixedLines = [];
let inTrailEntry = false;
let currentEntry = {};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check if we're starting a new trail entry
  if (line.includes('hiking_spot_id:')) {
    inTrailEntry = true;
    currentEntry = {};
  }
  
  // If we're in a trail entry and find coordinates, extract the first point
  if (inTrailEntry && line.includes('coordinates: [')) {
    // Look for the first coordinate pair in the next few lines
    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
      const coordLine = lines[j].trim();
      const coordMatch = coordLine.match(/\[([\d.-]+),\s*([\d.-]+)\]/);
      if (coordMatch) {
        const [, lng, lat] = coordMatch;
        currentEntry.startCoords = `POINT(${lng} ${lat})`;
        break;
      }
    }
  }
  
  // If we find difficulty line and don't have start_coordinates yet, add it
  if (inTrailEntry && line.includes('difficulty:') && !line.includes('start_coordinates') && currentEntry.startCoords) {
    fixedLines.push(line);
    fixedLines.push(`    start_coordinates: '${currentEntry.startCoords}',`);
    inTrailEntry = false;
  } else {
    fixedLines.push(line);
    if (line.includes('}') && line.includes(',') && inTrailEntry) {
      inTrailEntry = false;
    }
  }
}

fs.writeFileSync('populate-trail-routes.cjs', fixedLines.join('\n'));
console.log('Fixed trail routes data with start_coordinates');