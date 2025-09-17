const fs = require('fs');
const path = require('path');

// List of all hiking spot folders
const hikingSpotFolders = [
  'mount-babag', // already done
  'mt kan-irag',
  'mt naupa',
  'mt manunggal',
  'mt mago',
  'mt kapayas',
  'mount latoy',
  'mt kalbasan',
  'mt mauyog',
  'mt lanaya',
  'mount hambubuyog',
  'osmena peak',
  'casino peak',
  'budlaanfalls',
  'spartantrail'
];

const assetsPath = path.join(__dirname, '..', 'assets', 'images');

function renameFilesInFolder(folderName) {
  const folderPath = path.join(assetsPath, folderName);
  
  if (!fs.existsSync(folderPath)) {
    console.log(`Folder ${folderName} does not exist, skipping...`);
    return;
  }

  const files = fs.readdirSync(folderPath);
  console.log(`Processing folder: ${folderName}`);
  console.log(`Files found: ${files.join(', ')}`);

  // Rename thumbnail file
  const thumbnailFile = files.find(file => file.startsWith('thumbnail'));
  if (thumbnailFile) {
    const ext = path.extname(thumbnailFile);
    const oldPath = path.join(folderPath, thumbnailFile);
    const newPath = path.join(folderPath, `01_thumb${ext}`);
    
    if (!fs.existsSync(newPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed ${thumbnailFile} to 01_thumb${ext}`);
    }
  }

  // Rename numbered files (2.jpg, 3.jpg, etc.)
  for (let i = 2; i <= 5; i++) {
    const numberFile = files.find(file => file.startsWith(`${i}.`));
    if (numberFile) {
      const ext = path.extname(numberFile);
      const oldPath = path.join(folderPath, numberFile);
      const newPath = path.join(folderPath, `0${i}${ext}`);
      
      if (!fs.existsSync(newPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed ${numberFile} to 0${i}${ext}`);
      }
    }
  }

  console.log(`Completed processing ${folderName}\n`);
}

// Process all folders except mount-babag (already done)
for (const folder of hikingSpotFolders) {
  if (folder !== 'mount-babag') {
    renameFilesInFolder(folder);
  }
}

console.log('All image files have been renamed to follow the proper structure!');