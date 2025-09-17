# Google Maps API Setup

## Overview
The GoogleMapsTrailMap component uses the Google Maps JavaScript API to display interactive trail maps with Mt. Babag and Kan-Irag trail routes.

## Setup Instructions

### 1. Get Google Maps API Key
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Maps JavaScript API"
4. Create credentials (API Key)
5. Restrict the API key to your domain/app for security

### 2. Configure API Key
Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` in the GoogleMapsTrailMap component with your actual API key:

```typescript
// In components/GoogleMapsTrailMap.tsx, line ~150
const GOOGLE_MAPS_API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
```

### 3. Security Best Practices
- Never commit API keys to version control
- Use environment variables in production
- Restrict API key usage to your specific domains
- Monitor API usage in Google Cloud Console

## Features Implemented
- ✅ Interactive Google Maps with terrain view
- ✅ Mt. Babag trail route with polyline and markers
- ✅ Kan-Irag trail route with polyline and markers
- ✅ Start/End point markers for each trail
- ✅ Automatic map bounds adjustment
- ✅ Trail selection controls
- ✅ Responsive design for mobile and desktop
- ✅ Error handling and loading states

## Trail Data
The component includes demo data for:
- **Mt. Babag**: Moderate difficulty, 3.2km, 450m elevation gain
- **Kan-Irag**: Easy difficulty, 2.8km, 320m elevation gain

## Usage
The component is integrated into the HikingSpotLandingPage and replaces the previous TrailMap component. It provides the same interface but uses Google Maps instead of react-native-maps.