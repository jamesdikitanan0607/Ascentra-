const fs = require('fs');
const path = require('path');

// ID mapping: old ID -> new ID
const idMapping = {
  '1': '71',   // Mount Babag
  '2': '72',   // Mount Kan-irag / Sirao Peak  
  '3': '73',   // Mount Naupa
  '4': '74',   // Mount Manunggal
  '5': '75',   // Mount Mago
  '6': '76',   // Mount Kapayas
  '7': '77',   // Mount Lantoy
  '8': '78',   // Mount Kalbasaan
  '9': '79',   // Mount Mauyog
  '10': '80',  // Mount Lanaya
  '11': '81',  // Mount Hambubuyog
  '12': '82',  // Mount Kalawisan (Kanlaas Ridge)
  '13': '83',  // Osmeña Peak
  '14': '84',  // Casino Peak
  '15': '85',  // Budlaan Falls
  '16': '85'   // Handle any 16 -> 15 mapping (Budlaan Falls)
};

function updateFile(filePath) {
  console.log(`📝 Updating ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changeCount = 0;
  
  // Update id: 'X' patterns
  content = content.replace(/id: '(\d+)'/g, (match, oldId) => {
    if (idMapping[oldId]) {
      changeCount++;
      return `id: '${idMapping[oldId]}'`;
    }
    return match;
  });
  
  // Update hikingSpotId: 'X' patterns
  content = content.replace(/hikingSpotId: '(\d+)'/g, (match, oldId) => {
    if (idMapping[oldId]) {
      changeCount++;
      return `hikingSpotId: '${idMapping[oldId]}'`;
    }
    return match;
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated ${changeCount} IDs in ${path.basename(filePath)}`);
}

function updateHikingSpotData() {
  const filePath = path.join(__dirname, 'data', 'hikingSpotData.ts');
  updateFile(filePath);
}

function updateTrailRoutesData() {
  const filePath = path.join(__dirname, 'data', 'trailRoutesData.ts');
  updateFile(filePath);
}

function updateOtherDataFiles() {
  const dataDir = path.join(__dirname, 'data');
  const files = [
    'hikingSpots.js',
    'mockHikingSpots.ts'
  ];
  
  files.forEach(fileName => {
    const filePath = path.join(dataDir, fileName);
    if (fs.existsSync(filePath)) {
      updateFile(filePath);
    } else {
      console.log(`⚠️  File not found: ${fileName}`);
    }
  });
}

console.log('🔄 Starting hiking spot ID update...');
console.log('📋 ID Mapping:');
Object.entries(idMapping).forEach(([oldId, newId]) => {
  console.log(`   ${oldId} → ${newId}`);
});
console.log('');

updateHikingSpotData();
updateTrailRoutesData();
updateOtherDataFiles();

console.log('');
console.log('✅ All hiking spot IDs updated successfully!');
console.log('🎯 App should now use database IDs 71-85 instead of mock IDs 1-15');