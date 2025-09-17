const fs = require('fs');
const path = require('path');

// Required folder names according to specifications
const REQUIRED_FOLDERS = [
  'budlaan-falls',
  'casino-peak', 
  'mount-hambubuyog',
  'mount-lantoy',
  'mount-babag',
  'mt-kalbasan',
  'mt-kan-irag', 
  'mt-kapayas',
  'mt-lanaya',
  'mt-mago',
  'mt-manunggal',
  'mt-mauyog',
  'mt-naupa',
  'osmena-peak',
  'spartan-trail'
];

// Current folder names to required names mapping
const FOLDER_MAPPING = {
  'budlaanfalls': 'budlaan-falls',
  'casino peak': 'casino-peak',
  'mount hambubuyog': 'mount-hambubuyog', 
  'mount latoy': 'mount-lantoy',
  'mount-babag': 'mount-babag', // already correct
  'mt kalbasan': 'mt-kalbasan',
  'mt kan-irag': 'mt-kan-irag', // already correct
  'mt kapayas': 'mt-kapayas',
  'mt lanaya': 'mt-lanaya',
  'mt mago': 'mt-mago',
  'mt manunggal': 'mt-manunggal',
  'mt mauyog': 'mt-mauyog',
  'mt naupa': 'mt-naupa',
  'osmena peak': 'osmena-peak',
  'spartantrail': 'spartan-trail'
};

const IMAGES_DIR = path.join(__dirname, 'assets', 'images');

function fixImageFolders() {
  try {
    console.log('🔧 Fixing image folder names...');
    
    if (!fs.existsSync(IMAGES_DIR)) {
      console.error('❌ Images directory not found:', IMAGES_DIR);
      return;
    }
    
    const currentFolders = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log('📁 Current folders:', currentFolders);
    
    let renamedCount = 0;
    
    // Rename folders according to mapping
    for (const [currentName, requiredName] of Object.entries(FOLDER_MAPPING)) {
      const currentPath = path.join(IMAGES_DIR, currentName);
      const newPath = path.join(IMAGES_DIR, requiredName);
      
      if (fs.existsSync(currentPath) && currentName !== requiredName) {
        try {
          fs.renameSync(currentPath, newPath);
          console.log(`✅ Renamed: ${currentName} → ${requiredName}`);
          renamedCount++;
        } catch (error) {
          console.error(`❌ Failed to rename ${currentName}:`, error.message);
        }
      }
    }
    
    // Check for missing folders
    const updatedFolders = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    const missingFolders = REQUIRED_FOLDERS.filter(folder => !updatedFolders.includes(folder));
    
    if (missingFolders.length > 0) {
      console.log('\n⚠️ Missing folders (need to be created):');
      missingFolders.forEach(folder => {
        console.log(`  - ${folder}`);
        // Create missing folder
        const folderPath = path.join(IMAGES_DIR, folder);
        try {
          fs.mkdirSync(folderPath, { recursive: true });
          console.log(`✅ Created folder: ${folder}`);
        } catch (error) {
          console.error(`❌ Failed to create ${folder}:`, error.message);
        }
      });
    }
    
    console.log(`\n🎉 Folder fixing completed!`);
    console.log(`📊 Summary:`);
    console.log(`  - Renamed: ${renamedCount} folders`);
    console.log(`  - Created: ${missingFolders.length} missing folders`);
    console.log(`  - Total required: ${REQUIRED_FOLDERS.length} folders`);
    
    // Verify all required folders exist
    const finalFolders = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    const stillMissing = REQUIRED_FOLDERS.filter(folder => !finalFolders.includes(folder));
    
    if (stillMissing.length === 0) {
      console.log('\n✅ All required image folders are now present!');
    } else {
      console.log('\n⚠️ Still missing folders:', stillMissing);
    }
    
  } catch (error) {
    console.error('❌ Error fixing image folders:', error);
  }
}

// Function to standardize image filenames within folders
function standardizeImageFilenames() {
  try {
    console.log('\n🖼️ Standardizing image filenames...');
    
    const folders = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    folders.forEach(folderName => {
      const folderPath = path.join(IMAGES_DIR, folderName);
      const files = fs.readdirSync(folderPath);
      
      // Look for thumbnail file
      const thumbnailFile = files.find(file => 
        file.toLowerCase().includes('thumb') || file === '1.jpg' || file === '1.png'
      );
      
      if (thumbnailFile) {
        const currentPath = path.join(folderPath, thumbnailFile);
        const newPath = path.join(folderPath, '01_thumb.jpg');
        
        if (thumbnailFile !== '01_thumb.jpg') {
          try {
            fs.renameSync(currentPath, newPath);
            console.log(`✅ ${folderName}: ${thumbnailFile} → 01_thumb.jpg`);
          } catch (error) {
            console.error(`❌ Failed to rename thumbnail in ${folderName}:`, error.message);
          }
        }
      }
      
      // Rename other images to 02.jpg, 03.jpg, 04.jpg, 05.jpg
      const otherFiles = files.filter(file => 
        !file.toLowerCase().includes('thumb') && 
        file !== '01_thumb.jpg' &&
        (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.webp'))
      );
      
      otherFiles.slice(0, 4).forEach((file, index) => {
        const currentPath = path.join(folderPath, file);
        const newName = `0${index + 2}.jpg`;
        const newPath = path.join(folderPath, newName);
        
        if (file !== newName) {
          try {
            fs.renameSync(currentPath, newPath);
            console.log(`✅ ${folderName}: ${file} → ${newName}`);
          } catch (error) {
            console.error(`❌ Failed to rename ${file} in ${folderName}:`, error.message);
          }
        }
      });
    });
    
    console.log('\n✅ Image filename standardization completed!');
    
  } catch (error) {
    console.error('❌ Error standardizing image filenames:', error);
  }
}

// Run both functions
fixImageFolders();
standardizeImageFilenames();