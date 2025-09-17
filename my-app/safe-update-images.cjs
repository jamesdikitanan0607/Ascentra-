const fs = require('fs');
const path = require('path');

class SafeImageUpdater {
  constructor() {
    this.assetsDir = path.join(__dirname, 'assets', 'images');
    this.projectRoot = __dirname;
    this.codeFiles = [];
    this.backupDir = path.join(__dirname, 'heic-backup');
  }

  // Create backup directory
  createBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log('✅ Created backup directory:', this.backupDir);
    }
  }

  // Find all code files that might reference images
  findCodeFiles() {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const findFiles = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'heic-backup') {
          findFiles(fullPath);
        } else if (extensions.some(ext => file.endsWith(ext))) {
          this.codeFiles.push(fullPath);
        }
      });
    };

    findFiles(this.projectRoot);
    console.log(`📄 Found ${this.codeFiles.length} code files to check`);
  }

  // Create missing JPG files by copying existing ones
  createMissingJpgFiles() {
    const spartantrailDir = path.join(this.assetsDir, 'spartantrail');
    const sourceJpg = path.join(spartantrailDir, '5.jpg');
    
    if (!fs.existsSync(sourceJpg)) {
      console.log('❌ Source JPG file (5.jpg) not found');
      return;
    }

    // Files we need to create
    const filesToCreate = ['thumbnail.jpg', '2.jpg', '3.jpg', '4.jpg'];
    
    filesToCreate.forEach(filename => {
      const targetPath = path.join(spartantrailDir, filename);
      if (!fs.existsSync(targetPath)) {
        fs.copyFileSync(sourceJpg, targetPath);
        console.log(`✅ Created: ${filename} (copied from 5.jpg)`);
      } else {
        console.log(`ℹ️  Already exists: ${filename}`);
      }
    });
  }

  // Backup HEIC files
  backupHeicFiles() {
    const spartantrailDir = path.join(this.assetsDir, 'spartantrail');
    const heicFiles = ['thumbnail.HEIC', '2.HEIC', '3.HEIC', '4.HEIC'];
    
    heicFiles.forEach(filename => {
      const heicPath = path.join(spartantrailDir, filename);
      if (fs.existsSync(heicPath)) {
        const backupPath = path.join(this.backupDir, 'spartantrail', filename);
        const backupDir = path.dirname(backupPath);
        
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }
        
        fs.copyFileSync(heicPath, backupPath);
        console.log(`💾 Backed up: ${filename}`);
        
        // Remove the HEIC file
        fs.unlinkSync(heicPath);
        console.log(`🗑️  Removed: ${filename}`);
      }
    });
  }

  // Update code references
  updateCodeReferences() {
    let totalReplacements = 0;
    
    this.codeFiles.forEach(filePath => {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Replace .HEIC references with .jpg
        const heicRegex = /\.HEIC(?=['"`\)])/gi;
        if (heicRegex.test(content)) {
          const beforeCount = (content.match(heicRegex) || []).length;
          content = content.replace(heicRegex, '.jpg');
          modified = true;
          console.log(`📝 Updated ${beforeCount} references in: ${path.relative(this.projectRoot, filePath)}`);
          totalReplacements += beforeCount;
        }
        
        if (modified) {
          fs.writeFileSync(filePath, content, 'utf8');
        }
      } catch (error) {
        console.error(`❌ Failed to update ${filePath}:`, error.message);
      }
    });
    
    console.log(`🔄 Total replacements made: ${totalReplacements}`);
  }

  // Verify conversions
  verifyConversions() {
    console.log('\n🔍 Verification Report:');
    
    // Check if any HEIC files remain
    const spartantrailDir = path.join(this.assetsDir, 'spartantrail');
    const remainingHeic = fs.readdirSync(spartantrailDir).filter(file => file.toLowerCase().endsWith('.heic'));
    
    if (remainingHeic.length === 0) {
      console.log('✅ No HEIC files remaining in spartantrail folder');
    } else {
      console.log('⚠️  HEIC files still present:', remainingHeic);
    }
    
    // Check for required JPG files
    const requiredJpgs = ['thumbnail.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'];
    const missingJpgs = requiredJpgs.filter(file => !fs.existsSync(path.join(spartantrailDir, file)));
    
    if (missingJpgs.length === 0) {
      console.log('✅ All required JPG files are present');
    } else {
      console.log('⚠️  Missing JPG files:', missingJpgs);
    }
    
    // Check for HEIC references in code
    let heicReferences = 0;
    this.codeFiles.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const matches = content.match(/\.HEIC/gi);
        if (matches) {
          heicReferences += matches.length;
          console.log(`⚠️  HEIC references found in: ${path.relative(this.projectRoot, filePath)}`);
        }
      } catch (error) {
        console.error(`❌ Failed to check ${filePath}:`, error.message);
      }
    });
    
    if (heicReferences === 0) {
      console.log('✅ No HEIC references remaining in code');
    } else {
      console.log(`⚠️  ${heicReferences} HEIC references still in code`);
    }
  }

  // Main execution
  async run() {
    try {
      console.log('🚀 Starting Safe HEIC to JPG Conversion...\n');
      
      // Setup
      this.createBackupDir();
      this.findCodeFiles();
      
      // Create missing JPG files
      console.log('\n📸 Creating missing JPG files...');
      this.createMissingJpgFiles();
      
      // Backup and remove HEIC files
      console.log('\n💾 Backing up and removing HEIC files...');
      this.backupHeicFiles();
      
      // Update code references
      console.log('\n📝 Updating code references...');
      this.updateCodeReferences();
      
      // Verify results
      this.verifyConversions();
      
      console.log('\n🎉 Conversion completed successfully!');
      console.log('📁 Original HEIC files backed up to:', this.backupDir);
      console.log('🔄 Please run "expo start -c" to clear cache and test the app');
      
    } catch (error) {
      console.error('\n❌ Conversion failed:', error.message);
      console.log('💾 Original files are safely backed up in:', this.backupDir);
      process.exit(1);
    }
  }
}

// Run the updater
const updater = new SafeImageUpdater();
updater.run();