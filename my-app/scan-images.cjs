#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Image validation script
const imagesDir = './assets/images';
const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
const issues = [];
const validImages = [];

// JPEG file signature: FF D8 FF
// PNG file signature: 89 50 4E 47
// WebP file signature: 52 49 46 46 (RIFF)

function checkFileSignature(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    if (buffer.length < 4) return false;
    
    const header = buffer.slice(0, 4);
    const ext = path.extname(filePath).toLowerCase();
    
    // Check JPEG
    if (ext === '.jpg' || ext === '.jpeg') {
      return header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF;
    }
    
    // Check PNG
    if (ext === '.png') {
      return header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47;
    }
    
    // Check WebP
    if (ext === '.webp') {
      return header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

function scanDirectory(dir) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        
        if (validExtensions.includes(ext)) {
          const relativePath = path.relative('./assets/images', fullPath);
          
          // Check file size
          if (stat.size === 0) {
            issues.push({
              file: relativePath,
              issue: 'Empty file (0 bytes)',
              severity: 'high'
            });
            continue;
          }
          
          // Check file signature
          if (!checkFileSignature(fullPath)) {
            issues.push({
              file: relativePath,
              issue: 'Invalid file signature - corrupted or wrong format',
              severity: 'high'
            });
            continue;
          }
          
          validImages.push({
            file: relativePath,
            size: stat.size,
            extension: ext
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }
}

console.log('🔍 Starting comprehensive image asset scan...\n');

if (!fs.existsSync(imagesDir)) {
  console.error('❌ Images directory not found:', imagesDir);
  process.exit(1);
}

scanDirectory(imagesDir);

console.log('📊 SCAN RESULTS');
console.log('================\n');

console.log(`✅ Valid images found: ${validImages.length}`);
console.log(`❌ Issues found: ${issues.length}\n`);

if (issues.length > 0) {
  console.log('🚨 ISSUES DETECTED:');
  console.log('-------------------');
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.file}`);
    console.log(`   Issue: ${issue.issue}`);
    console.log(`   Severity: ${issue.severity}\n`);
  });
}

if (validImages.length > 0) {
  console.log('✅ VALID IMAGES:');
  console.log('----------------');
  validImages.forEach(img => {
    console.log(`${img.file} (${Math.round(img.size / 1024)}KB, ${img.extension})`);
  });
}

// Save results to JSON for further processing
const results = {
  timestamp: new Date().toISOString(),
  validImages,
  issues,
  summary: {
    totalValid: validImages.length,
    totalIssues: issues.length,
    highSeverityIssues: issues.filter(i => i.severity === 'high').length
  }
};

fs.writeFileSync('./image-scan-results.json', JSON.stringify(results, null, 2));
console.log('\n📄 Results saved to image-scan-results.json');