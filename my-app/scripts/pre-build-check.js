#!/usr/bin/env node

/**
 * Pre-build verification script for Hiking Mobile App
 * Checks for common issues that could cause build failures
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class PreBuildChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checks = 0;
    this.passed = 0;
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  error(message) {
    this.errors.push(message);
    this.log(`❌ ${message}`, colors.red);
  }

  warning(message) {
    this.warnings.push(message);
    this.log(`⚠️  ${message}`, colors.yellow);
  }

  success(message) {
    this.passed++;
    this.log(`✅ ${message}`, colors.green);
  }

  info(message) {
    this.log(`ℹ️  ${message}`, colors.blue);
  }

  checkFileExists(filePath, description) {
    this.checks++;
    if (fs.existsSync(filePath)) {
      this.success(`${description} exists`);
      return true;
    } else {
      this.error(`${description} not found: ${filePath}`);
      return false;
    }
  }

  checkImageCompatibility() {
    this.info('Checking image compatibility...');
    
    const assetsDir = path.join(__dirname, '..', 'assets', 'images');
    const dataFile = path.join(__dirname, '..', 'data', 'hikingSpotData.ts');
    
    if (!fs.existsSync(assetsDir)) {
      this.error('Assets directory not found');
      return;
    }

    if (!fs.existsSync(dataFile)) {
      this.error('Hiking spot data file not found');
      return;
    }

    // Check for .webp files in assets
    const webpFiles = this.findFilesByExtension(assetsDir, '.webp');
    if (webpFiles.length > 0) {
      this.warning(`Found ${webpFiles.length} .webp files that may not be compatible with all platforms:`);
      webpFiles.forEach(file => this.log(`  - ${file}`, colors.yellow));
    } else {
      this.success('No .webp files found in assets');
    }

    // Check for .HEIC files in assets
    const heicFiles = this.findFilesByExtension(assetsDir, '.jpg');
    if (heicFiles.length > 0) {
      this.warning(`Found ${heicFiles.length} .HEIC files that may not be compatible with all platforms:`);
      heicFiles.forEach(file => this.log(`  - ${file}`, colors.yellow));
    } else {
      this.success('No .HEIC files found in assets');
    }

    // Check data file for .webp references
    const dataContent = fs.readFileSync(dataFile, 'utf8');
    const webpReferences = dataContent.match(/\.webp/g);
    if (webpReferences) {
      this.error(`Found ${webpReferences.length} .webp references in hikingSpotData.ts`);
    } else {
      this.success('No .webp references found in hikingSpotData.ts');
    }
  }

  findFilesByExtension(dir, extension) {
    const files = [];
    
    function searchDir(currentDir) {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          searchDir(fullPath);
        } else if (item.toLowerCase().endsWith(extension.toLowerCase())) {
          files.push(path.relative(dir, fullPath));
        }
      }
    }
    
    searchDir(dir);
    return files;
  }

  checkSupabaseConfig() {
    this.info('Checking Supabase configuration...');
    
    const envFile = path.join(__dirname, '..', '.env');
    const supabaseClient = path.join(__dirname, '..', 'services', 'supabaseClient.ts');
    
    this.checks++;
    if (this.checkFileExists(envFile, '.env file')) {
      const envContent = fs.readFileSync(envFile, 'utf8');
      
      if (envContent.includes('EXPO_PUBLIC_SUPABASE_URL') && envContent.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY')) {
        this.success('Supabase environment variables found');
      } else {
        this.error('Missing Supabase environment variables in .env');
      }
    }
    
    this.checkFileExists(supabaseClient, 'Supabase client configuration');
  }

  checkPackageJson() {
    this.info('Checking package.json...');
    
    const packageFile = path.join(__dirname, '..', 'package.json');
    
    this.checks++;
    if (this.checkFileExists(packageFile, 'package.json')) {
      try {
        const packageData = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
        
        // Check for essential dependencies
        const requiredDeps = [
          'expo',
          'react',
          'react-native',
          '@supabase/supabase-js',
          '@react-navigation/native'
        ];
        
        const missingDeps = requiredDeps.filter(dep => 
          !packageData.dependencies?.[dep] && !packageData.devDependencies?.[dep]
        );
        
        if (missingDeps.length === 0) {
          this.success('All essential dependencies found');
        } else {
          this.error(`Missing dependencies: ${missingDeps.join(', ')}`);
        }
        
      } catch (error) {
        this.error('Invalid package.json format');
      }
    }
  }

  checkCriticalFiles() {
    this.info('Checking critical files...');
    
    const criticalFiles = [
      { path: 'App.tsx', description: 'Main App component' },
      { path: 'data/hikingSpotData.ts', description: 'Hiking spot data' },
      { path: 'utils/imageHelpers.ts', description: 'Image helpers' },
      { path: 'services/databaseService.ts', description: 'Database service' },
      { path: 'screens/TrackingScreen.tsx', description: 'Tracking screen' },
      { path: 'screens/ProfileScreen.tsx', description: 'Profile screen' }
    ];
    
    criticalFiles.forEach(file => {
      const fullPath = path.join(__dirname, '..', file.path);
      this.checkFileExists(fullPath, file.description);
    });
  }

  run() {
    this.log(`${colors.bold}🔍 Running pre-build verification checks...${colors.reset}`);
    this.log('');
    
    this.checkCriticalFiles();
    this.checkPackageJson();
    this.checkSupabaseConfig();
    this.checkImageCompatibility();
    
    this.log('');
    this.log(`${colors.bold}📊 Summary:${colors.reset}`);
    this.log(`Total checks: ${this.checks}`);
    this.log(`Passed: ${this.passed}`, colors.green);
    this.log(`Warnings: ${this.warnings.length}`, colors.yellow);
    this.log(`Errors: ${this.errors.length}`, colors.red);
    
    if (this.errors.length > 0) {
      this.log('');
      this.log(`${colors.bold}❌ Build verification failed!${colors.reset}`, colors.red);
      this.log('Please fix the above errors before building.', colors.red);
      process.exit(1);
    } else if (this.warnings.length > 0) {
      this.log('');
      this.log(`${colors.bold}⚠️  Build verification passed with warnings.${colors.reset}`, colors.yellow);
      this.log('Consider addressing the warnings for optimal compatibility.', colors.yellow);
    } else {
      this.log('');
      this.log(`${colors.bold}✅ All checks passed! Ready to build.${colors.reset}`, colors.green);
    }
  }
}

// Run the checker
const checker = new PreBuildChecker();
checker.run();