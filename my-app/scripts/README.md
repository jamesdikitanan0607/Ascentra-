# Pre-Build Verification Script

This directory contains automated verification scripts to ensure the app is ready for building and deployment.

## Pre-Build Check Script

The `pre-build-check.js` script performs comprehensive checks to prevent common build failures and compatibility issues.

### What it checks:

1. **Critical Files**: Ensures all essential app files exist
   - App.tsx (main component)
   - Data files (hikingSpotData.ts)
   - Service files (databaseService.ts, supabaseClient.ts)
   - Screen components (TrackingScreen.tsx, ProfileScreen.tsx)
   - Utility files (imageHelpers.ts)

2. **Package Dependencies**: Verifies essential packages are installed
   - Expo framework
   - React and React Native
   - Supabase client
   - React Navigation

3. **Supabase Configuration**: Validates database setup
   - Environment variables (.env file)
   - Supabase URL and API key configuration
   - Client configuration file

4. **Image Compatibility**: Checks for platform compatibility issues
   - Detects .webp files (limited React Native support)
   - Detects .HEIC files (iOS-specific format)
   - Verifies no .webp references in data files

### Usage:

```bash
# Run the verification script
npm run pre-build-check

# Run verification and start app if checks pass
npm run build:safe
```

### Exit Codes:

- **0**: All checks passed (may have warnings)
- **1**: Critical errors found, build should not proceed

### Output:

- ✅ **Green**: Check passed
- ⚠️ **Yellow**: Warning (non-critical issue)
- ❌ **Red**: Error (critical issue that will prevent build)
- ℹ️ **Blue**: Information/section header

### Warnings vs Errors:

**Warnings** (won't prevent build):
- .webp or .HEIC files present in assets (may have compatibility issues on some platforms)
- Package version mismatches

**Errors** (will prevent build):
- Missing critical files
- Missing essential dependencies
- Invalid Supabase configuration
- .webp references in code files

### Integration:

This script is automatically run when using `npm run build:safe`, which combines verification with a clean build:

```bash
npm run build:safe
# Equivalent to:
# npm run pre-build-check && expo start --clear
```

### Customization:

To add new checks, modify the `PreBuildChecker` class in `pre-build-check.js`:

1. Add new check methods
2. Call them in the `run()` method
3. Use `this.error()`, `this.warning()`, or `this.success()` for output

### Best Practices:

1. Run `npm run pre-build-check` before committing changes
2. Address all errors before building for production
3. Consider addressing warnings for better platform compatibility
4. Use `npm run build:safe` for development builds to ensure consistency