/**
 * Utility functions for maps and handling route coordinates
 */

/**
 * Validates and sanitizes route coordinates for map display
 * @param {Array} coordinates - Array of lat/lng coordinate objects
 * @returns {Array} - Sanitized and filtered coordinates
 */
export const sanitizeRouteCoordinates = (coordinates) => {
  if (!coordinates || !Array.isArray(coordinates)) {
    return [];
  }
  
  return coordinates
    .map(coord => {
      // Ensure we have valid numbers for latitude and longitude
      if (!coord) return null;
      
      // Handle different possible formats
      const lat = Number(coord.latitude || coord.lat);
      const lng = Number(coord.longitude || coord.lng);
      
      if (isNaN(lat) || isNaN(lng)) {
        return null;
      }
      
      // Ensure coordinates are within valid range
      if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return null;
      }
      
      // Return a cleaned object with consistent property names
      return {
        latitude: lat,
        longitude: lng
      };
    })
    .filter(coord => coord !== null);
};

/**
 * Calculates the appropriate map region to fit all coordinates
 * @param {Array} coordinates - Array of lat/lng coordinate objects
 * @param {Number} padding - Padding percentage (0-1)
 * @returns {Object} - Region object suitable for MapView
 */
export const calculateMapRegion = (coordinates, padding = 0.2) => {
  if (!coordinates || coordinates.length === 0) {
    // Default to a fallback region if no coordinates
    return {
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05
    };
  }
  
  // If only one coordinate, return a small region around it
  if (coordinates.length === 1) {
    return {
      latitude: coordinates[0].latitude,
      longitude: coordinates[0].longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01
    };
  }
  
  // Find min/max values
  let minLat = coordinates[0].latitude;
  let maxLat = coordinates[0].latitude;
  let minLng = coordinates[0].longitude;
  let maxLng = coordinates[0].longitude;
  
  coordinates.forEach(coord => {
    minLat = Math.min(minLat, coord.latitude);
    maxLat = Math.max(maxLat, coord.latitude);
    minLng = Math.min(minLng, coord.longitude);
    maxLng = Math.max(maxLng, coord.longitude);
  });
  
  // Calculate center point
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  
  // Calculate deltas with padding
  const latDelta = (maxLat - minLat) * (1 + padding);
  const lngDelta = (maxLng - minLng) * (1 + padding);
  
  // Ensure minimum zoom level
  const finalLatDelta = Math.max(latDelta, 0.01);
  const finalLngDelta = Math.max(lngDelta, 0.01);
  
  // Map region calculated
  
  return {
    latitude: centerLat,
    longitude: centerLng,
    latitudeDelta: finalLatDelta,
    longitudeDelta: finalLngDelta
  };
};

/**
 * Logs details about route coordinates for debugging
 * @param {Array} coordinates - Array of lat/lng coordinate objects
 * @param {String} tag - Label for the log
 */
export const logRouteDetails = (coordinates, tag = 'Route') => {
  // Debug function for route validation
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    return;
  }
  
  // Validate first and last coordinates
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  
  return {
    count: coordinates.length,
    first: first,
    last: last,
    valid: coordinates.every(coord => 
      typeof coord.latitude === 'number' && 
      typeof coord.longitude === 'number'
    )
  };
};
