const fs = require('fs');
const path = require('path');

// Spot data with screen names
const spots = [
  { id: '1', name: 'Mount Babag', screenName: 'MountBabagScreen' },

  { id: '4', name: 'La Vie Parisienne', screenName: 'LaVieParisienneScreen' },
  { id: '5', name: 'Oslob Whale Shark Watching', screenName: 'OslobWhaleSharkScreen' },
  { id: '6', name: 'Kawasan Falls', screenName: 'KawasanFallsScreen' },
  { id: '7', name: 'Magellan\'s Cross', screenName: 'MagellansCrossScreen' },
  { id: '8', name: 'Colon Street', screenName: 'ColonStreetScreen' },
  { id: '9', name: 'Fort San Pedro', screenName: 'FortSanPedroScreen' },
  { id: '10', name: 'Yap-Sandiego Ancestral House', screenName: 'YapSandiegoScreen' },
  { id: '11', name: 'Basilica del Santo Niño', screenName: 'BasilicaDelSantoNinoScreen' },
  { id: '12', name: 'Heritage Monument', screenName: 'HeritageMonumentScreen' },
  { id: '13', name: 'Cebu Taoist Temple', screenName: 'CebuTaoistTempleScreen' },
  { id: '14', name: 'Jumalon Museum', screenName: 'JumalonMuseumScreen' },
  { id: '15', name: 'Casa Gorordo Museum', screenName: 'CasaGorordoMuseumScreen' }
];

// Template for generating screen files
const generateScreenTemplate = (spot) => {
  return `import React from 'react';
import HikingSpotTemplate from './HikingSpotTemplate';
import { getSpotById } from '../../data/hikingSpotData';

export default function ${spot.screenName}({ navigation }) {
  const spotData = getSpotById('${spot.id}');
  
  if (!spotData) {
    return null;
  }

  return (
    <HikingSpotTemplate 
      navigation={navigation} 
      spotData={spotData} 
    />
  );
}
`;
};

// Directory where screens will be created
const screensDir = path.join(__dirname, '..', 'screens', 'spots');

// Ensure the directory exists
if (!fs.existsSync(screensDir)) {
  fs.mkdirSync(screensDir, { recursive: true });
}

// Generate screen files
spots.forEach(spot => {
  const fileName = `${spot.screenName}.tsx`;
  const filePath = path.join(screensDir, fileName);
  
  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`Skipping ${fileName} - already exists`);
    return;
  }
  
  const content = generateScreenTemplate(spot);
  
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Created ${fileName}`);
  } catch (error) {
    console.error(`Error creating ${fileName}:`, error.message);
  }
});

console.log('\nScreen generation complete!');
console.log(`Total spots: ${spots.length}`);
console.log(`Screens directory: ${screensDir}`);