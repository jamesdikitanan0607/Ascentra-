import { supabase, isInDemoMode } from './supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';
import { getMockTrailRoutes, shouldUseMockData } from './mockTrailData';

// Error types for better error handling
export enum SupabaseErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface SupabaseServiceError {
  type: SupabaseErrorType;
  message: string;
  originalError?: any;
  retryable: boolean;
  statusCode?: number;
}

// Configuration for retry logic
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000, // 1 second
  MAX_DELAY: 10000, // 10 seconds
  BACKOFF_MULTIPLIER: 2
};

// Network connectivity check
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    // Simple connectivity test using a lightweight Supabase query
    const { error } = await supabase.from('hiking_spots').select('name').limit(1);
    return !error;
  } catch (error) {
    return false;
  }
};

// Enhanced error classification
export const classifySupabaseError = (error: any): SupabaseServiceError => {
  if (!error) {
    return {
      type: SupabaseErrorType.UNKNOWN_ERROR,
      message: 'Unknown error occurred',
      retryable: false
    };
  }

  // Network/connectivity errors
  if (error.message?.includes('fetch') || 
      error.message?.includes('network') ||
      error.message?.includes('Failed to fetch') ||
      error.code === 'NETWORK_ERROR') {
    return {
      type: SupabaseErrorType.NETWORK_ERROR,
      message: 'Network connection failed. Please check your internet connection.',
      originalError: error,
      retryable: true
    };
  }

  // Authentication errors
  if (error.message?.includes('JWT') || 
      error.message?.includes('auth') ||
      error.status === 401) {
    return {
      type: SupabaseErrorType.AUTHENTICATION_ERROR,
      message: 'Authentication failed. Please log in again.',
      originalError: error,
      retryable: false,
      statusCode: 401
    };
  }

  // Permission errors
  if (error.message?.includes('permission') ||
      error.message?.includes('RLS') ||
      error.status === 403) {
    return {
      type: SupabaseErrorType.PERMISSION_ERROR,
      message: 'You do not have permission to perform this action.',
      originalError: error,
      retryable: false,
      statusCode: 403
    };
  }

  // Not found errors
  if (error.status === 404 || error.message?.includes('not found')) {
    return {
      type: SupabaseErrorType.NOT_FOUND_ERROR,
      message: 'The requested resource was not found.',
      originalError: error,
      retryable: false,
      statusCode: 404
    };
  }

  // Rate limiting
  if (error.status === 429) {
    return {
      type: SupabaseErrorType.RATE_LIMIT_ERROR,
      message: 'Too many requests. Please try again later.',
      originalError: error,
      retryable: true,
      statusCode: 429
    };
  }

  // Server errors (5xx)
  if (error.status >= 500) {
    return {
      type: SupabaseErrorType.SERVER_ERROR,
      message: 'Server error occurred. Please try again later.',
      originalError: error,
      retryable: true,
      statusCode: error.status
    };
  }

  // Validation errors
  if (error.message?.includes('invalid') || 
      error.message?.includes('constraint') ||
      error.message?.includes('duplicate')) {
    return {
      type: SupabaseErrorType.VALIDATION_ERROR,
      message: error.message || 'Data validation failed.',
      originalError: error,
      retryable: false
    };
  }

  // Default to unknown error
  return {
    type: SupabaseErrorType.UNKNOWN_ERROR,
    message: error.message || 'An unexpected error occurred.',
    originalError: error,
    retryable: false
  };
};

// Retry mechanism with exponential backoff
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = RETRY_CONFIG.MAX_RETRIES,
  initialDelay: number = RETRY_CONFIG.INITIAL_DELAY
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const classifiedError = classifySupabaseError(error);
      
      // Don't retry if error is not retryable
      if (!classifiedError.retryable || attempt === maxRetries) {
        throw classifiedError;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, attempt),
        RETRY_CONFIG.MAX_DELAY
      );
      
      console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, classifiedError.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw classifySupabaseError(lastError);
};

// Data validation helpers
export const validateHikingSpotData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data) {
    errors.push('Hiking spot data is required');
    return { isValid: false, errors };
  }
  
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Hiking spot name is required and must be a string');
  }
  
  if (!data.description || typeof data.description !== 'string') {
    errors.push('Hiking spot description is required and must be a string');
  }
  
  if (data.latitude && (typeof data.latitude !== 'number' || data.latitude < -90 || data.latitude > 90)) {
    errors.push('Latitude must be a number between -90 and 90');
  }
  
  if (data.longitude && (typeof data.longitude !== 'number' || data.longitude < -180 || data.longitude > 180)) {
    errors.push('Longitude must be a number between -180 and 180');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateTrailData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data) {
    errors.push('Trail data is required');
    return { isValid: false, errors };
  }
  
  if (!data.route_name || typeof data.route_name !== 'string') {
    errors.push('Trail name is required and must be a string');
  }
  
  if (data.distance_km && (typeof data.distance_km !== 'number' || data.distance_km < 0)) {
    errors.push('Distance must be a positive number');
  }
  
  if (data.elevation_gain_m && (typeof data.elevation_gain_m !== 'number' || data.elevation_gain_m < 0)) {
    errors.push('Elevation gain must be a positive number');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Enhanced database operations with error handling
export const safeSupabaseQuery = async <T>(
  queryBuilder: any,
  operationName: string = 'database operation'
): Promise<{ data: T | null; error: SupabaseServiceError | null }> => {
  try {
    // Check if in demo mode
    if (isInDemoMode) {
      console.warn(`Demo mode: Skipping ${operationName}`);
      return { data: null, error: null };
    }
    
    // Execute query with retry logic
    const result = await withRetry(async () => {
      const { data, error } = await queryBuilder;
      
      if (error) {
        throw error;
      }
      
      return data;
    });
    
    return { data: result, error: null };
  } catch (error) {
    const classifiedError = classifySupabaseError(error);
    console.error(`${operationName} failed:`, classifiedError);
    return { data: null, error: classifiedError };
  }
};

// Specific service methods with enhanced error handling
export const fetchHikingSpots = async () => {
  return safeSupabaseQuery(
    supabase
      .from('hiking_spots')
      .select('*')
      .order('name'),
    'fetch hiking spots'
  );
};

export const fetchHikingSpotById = async (id: string) => {
  // Try common schemas: first 'hiking_spot_id' (legacy), then fallback to 'id'
  let { data, error } = await safeSupabaseQuery(
    supabase
      .from('hiking_spots')
      .select('*')
      .eq('hiking_spot_id', id)
      .single(),
    `fetch hiking spot by spot_id ${id}`
  );

  // Fallback if column doesn't exist or no row matched
  if (error || !data) {
    const byAltKey = await safeSupabaseQuery(
      supabase
        .from('hiking_spots')
        .select('*')
        .eq('id', id)
        .single(),
      `fetch hiking spot (alt id) ${id}`
    );
    if (byAltKey.data) {
      data = byAltKey.data;
      error = null;
    } else if (byAltKey.error && !error) {
      error = byAltKey.error;
    }
  }
  
  // Additional validation for hiking spot data
  if (data && !error) {
    const validation = validateHikingSpotData(data);
    if (!validation.isValid) {
      return {
        data: null,
        error: {
          type: SupabaseErrorType.VALIDATION_ERROR,
          message: `Invalid hiking spot data: ${validation.errors.join(', ')}`,
          retryable: false
        }
      };
    }
  }
  
  return { data, error };
};

export const fetchTrailRoutes = async (hikingSpotId: string) => {
  console.log('[SUPABASE] Fetching trail routes for hiking spot:', hikingSpotId);
  
  // Check if we should use mock data
  if (shouldUseMockData() || isInDemoMode) {
    console.log('[SUPABASE] Using mock data for trail routes');
    const mockRoutes = getMockTrailRoutes(hikingSpotId);
    
    // Transform mock data to match expected interface
    const transformedMockData = mockRoutes.map(route => ({
      ...route,
      estimated_duration_hr: route.estimated_duration_min / 60,
      estimated_duration: `${route.estimated_duration_min} minutes`,
      route_color: getDifficultyColor(route.difficulty),
      highlights: route.route_features,
      start_coordinates: {
        latitude: route.start_latitude,
        longitude: route.start_longitude
      },
      end_coordinates: {
        latitude: route.end_latitude,
        longitude: route.end_longitude
      },
      route_coordinates: route.geojson_path.coordinates.map((coord: number[]) => ({
        latitude: coord[1],
        longitude: coord[0]
      }))
    }));
    
    console.log('[SUPABASE] Returning mock data:', transformedMockData);
    return { data: transformedMockData, error: null };
  }
  
  // Query the hiking_spot_routes table directly (RPC function not needed)
  const { data, error } = await safeSupabaseQuery(
    supabase
      .from('hiking_spot_routes')
      .select('*')
      .eq('hiking_spot_id', hikingSpotId)
      .order('route_name'),
    `fetch trail routes for spot ${hikingSpotId}`
  );
  
  console.log('[SUPABASE] Using fallback coordinates for accurate trail mapping');

  console.log('[SUPABASE] Raw trail routes data:', data);
  console.log('[SUPABASE] Trail routes error:', error);

  // Only fall back to mock data if there's an actual error (not empty results)
  if (error) {
    console.error('[SUPABASE] Database query failed with error:', error);
    console.log('[SUPABASE] Falling back to mock data due to database error');
    const mockRoutes = getMockTrailRoutes(hikingSpotId);
    
    const transformedMockData = mockRoutes.map(route => ({
      ...route,
      estimated_duration_hr: route.estimated_duration_min / 60,
      estimated_duration: `${route.estimated_duration_min} minutes`,
      route_color: getDifficultyColor(route.difficulty),
      highlights: route.route_features,
      start_coordinates: {
        latitude: route.start_latitude,
        longitude: route.start_longitude
      },
      end_coordinates: {
        latitude: route.end_latitude,
        longitude: route.end_longitude
      },
      route_coordinates: route.geojson_path.coordinates.map((coord: number[]) => ({
        latitude: coord[1],
        longitude: coord[0]
      }))
    }));
    
    return { data: transformedMockData, error: null };
  }
  
  // If no data is returned, return empty array instead of falling back to mock data
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log('[SUPABASE] No trail routes found in database for hiking spot:', hikingSpotId);
    return { data: [], error: null };
  }

  // Transform database data to match TrailRouteDetails interface
  if (data && !error && Array.isArray(data)) {
    const transformedData = data.map(route => {
      console.log('[SUPABASE] Processing route:', route.route_name);
      console.log('[SUPABASE] Raw hiking_spot_routes data:', route);
      
      // Parse coordinates from either DB fields or derive from waypoints (preferred)
      let startCoordinates = { latitude: 0, longitude: 0 };
      let endCoordinates = { latitude: 0, longitude: 0 };
      let coordsFromWaypoints: number[][] = [];

      // Normalize waypoints early so we can derive start/end and path even if DB geometry fields are missing
      try {
        if (route.waypoints) {
          const waypoints = Array.isArray(route.waypoints)
            ? route.waypoints
            : (typeof route.waypoints === 'string' ? JSON.parse(route.waypoints) : []);
          if (Array.isArray(waypoints) && waypoints.length) {
            coordsFromWaypoints = waypoints
              .map((p: any) => [
                Number(p.longitude ?? p.lng),
                Number(p.latitude ?? p.lat)
              ])
              .filter((c: any) => Number.isFinite(c[0]) && Number.isFinite(c[1]));
          }
        }
      } catch (e) {
        console.warn('[SUPABASE] Failed to parse waypoints early for route:', route.route_name, e);
      }
      
      // Try parsing text format first (from RPC function)
      if (route.start_point_text && typeof route.start_point_text === 'string') {
        try {
          const pointMatch = route.start_point_text.match(/POINT\(([^\s]+)\s+([^)]+)\)/);
          if (pointMatch) {
            startCoordinates = {
              longitude: parseFloat(pointMatch[1]),
              latitude: parseFloat(pointMatch[2])
            };
            console.log('[SUPABASE] Parsed start coordinates from text:', startCoordinates);
          }
        } catch (e) {
          console.warn('[SUPABASE] Failed to parse start_point_text:', e);
        }
      }
      
      if (route.end_point_text && typeof route.end_point_text === 'string') {
        try {
          const pointMatch = route.end_point_text.match(/POINT\(([^\s]+)\s+([^)]+)\)/);
          if (pointMatch) {
            endCoordinates = {
              longitude: parseFloat(pointMatch[1]),
              latitude: parseFloat(pointMatch[2])
            };
            console.log('[SUPABASE] Parsed end coordinates from text:', endCoordinates);
          }
        } catch (e) {
          console.warn('[SUPABASE] Failed to parse end_point_text:', e);
        }
      }
      
      // If DB start/end are missing but waypoints exist, derive from first/last waypoint
      if ((!startCoordinates.latitude || !startCoordinates.longitude) && coordsFromWaypoints.length >= 1) {
        startCoordinates = { latitude: coordsFromWaypoints[0][1], longitude: coordsFromWaypoints[0][0] };
        console.log('[SUPABASE] Derived start from waypoints:', startCoordinates);
      }
      if ((!endCoordinates.latitude || !endCoordinates.longitude) && coordsFromWaypoints.length >= 1) {
        const last = coordsFromWaypoints[coordsFromWaypoints.length - 1];
        endCoordinates = { latitude: last[1], longitude: last[0] };
        console.log('[SUPABASE] Derived end from waypoints:', endCoordinates);
      }

      // Fallback: Use hardcoded coordinates based on route name if geometry parsing fails entirely (no waypoints)
      if ((!startCoordinates.latitude || !startCoordinates.longitude || !endCoordinates.latitude || !endCoordinates.longitude) && coordsFromWaypoints.length === 0) {
        console.log('[SUPABASE] Using fallback coordinates for route:', route.route_name);
        
        // Map route names to your updated coordinates
        const routeCoordinates: { [key: string]: { start: [number, number], end: [number, number] } } = {
          'Babag Ridge Easy Trail': {
            start: [10.3140, 123.9620],
            end: [10.3170, 123.9660]
          },
          'Babag Summit Classic': {
            start: [10.3130, 123.9610],
            end: [10.3180, 123.9680]
          },
          'Sirao Flower Garden Walk': {
            start: [10.3320, 123.9150],
            end: [10.3340, 123.9180]
          },
          'Sirao Ridge Route': {
            start: [10.3310, 123.9140],
            end: [10.3350, 123.9190]
          },
          'Naupa Village Trail': {
            start: [10.2070, 123.7480],
            end: [10.2095, 123.7520]
          },
          'Naupa Forest Path': {
            start: [10.2060, 123.7470],
            end: [10.2105, 123.7530]
          }
        };
        
        const coords = routeCoordinates[route.route_name];
        if (coords) {
          startCoordinates = { latitude: coords.start[0], longitude: coords.start[1] };
          endCoordinates = { latitude: coords.end[0], longitude: coords.end[1] };
          console.log('[SUPABASE] Applied fallback coordinates:', startCoordinates, endCoordinates);
        }
      }
      
      // (moved) Validation will occur after geojsonPath is constructed

      // Extract GeoJSON path from coordinates_text field or use fallback
      let geojsonPath: { type: string; coordinates: number[][] } = {
        type: 'LineString',
        coordinates: []
      };
      
      // Try parsing coordinates_text first (from RPC function)
      if (route.coordinates_text && typeof route.coordinates_text === 'string') {
        try {
          const linestringMatch = route.coordinates_text.match(/LINESTRING\(([^)]+)\)/);
          if (linestringMatch) {
            const coordinateString = linestringMatch[1];
            const coordinatePairs = coordinateString.split(',').map((pair: string) => pair.trim());
            const coordinates = coordinatePairs.map((pair: string) => {
              const [lng, lat] = pair.split(/\s+/).map((coord: string) => parseFloat(coord.trim()));
              return [lng, lat];
            });
            
            geojsonPath = {
              type: 'LineString',
              coordinates: coordinates
            };
            console.log('[SUPABASE] Parsed PostGIS LINESTRING for route:', route.route_name, 'with', coordinates.length, 'points');
          }
        } catch (e) {
          console.warn('[SUPABASE] Failed to parse coordinates_text for route:', route.route_name, e);
        }
      }

      // Build from waypoints JSON if present and we still have no coordinates
      if (!geojsonPath.coordinates.length && coordsFromWaypoints.length >= 2) {
        geojsonPath = { type: 'LineString', coordinates: coordsFromWaypoints };
        console.log('[SUPABASE] Built geojson_path from waypoints for route:', route.route_name, 'points:', coordsFromWaypoints.length);
      }
      
      // Fallback: Use hardcoded coordinate paths if geometry parsing fails
      if (!geojsonPath.coordinates.length) {
        console.log('[SUPABASE] Using fallback coordinate path for route:', route.route_name);
        
        const routePaths: { [key: string]: number[][] } = {
          'Babag Ridge Easy Trail': [
            [123.9620, 10.3140], [123.9630, 10.3145], [123.9635, 10.3150],
            [123.9645, 10.3155], [123.9655, 10.3165], [123.9660, 10.3170]
          ],
          'Babag Summit Classic': [
            [123.9610, 10.3130], [123.9625, 10.3140], [123.9640, 10.3150],
            [123.9655, 10.3160], [123.9670, 10.3170], [123.9680, 10.3180]
          ],
          'Sirao Flower Garden Walk': [
            [123.9150, 10.3320], [123.9160, 10.3325], [123.9165, 10.3330],
            [123.9175, 10.3335], [123.9180, 10.3340]
          ],
          'Sirao Ridge Route': [
            [123.9140, 10.3310], [123.9155, 10.3320], [123.9170, 10.3330],
            [123.9180, 10.3340], [123.9190, 10.3350]
          ],
          'Naupa Village Trail': [
            [123.7480, 10.2070], [123.7490, 10.2075], [123.7500, 10.2080],
            [123.7510, 10.2090], [123.7520, 10.2095]
          ],
          'Naupa Forest Path': [
            [123.7470, 10.2060], [123.7485, 10.2070], [123.7505, 10.2085],
            [123.7520, 10.2095], [123.7530, 10.2105]
          ]
        };
        
        const pathCoords = routePaths[route.route_name];
        if (pathCoords) {
          geojsonPath = {
            type: 'LineString',
            coordinates: pathCoords
          };
          console.log('[SUPABASE] Applied fallback coordinate path with', pathCoords.length, 'points');
        }
      }
      
      // Fallback: construct from start/end if no coordinates
      if (!geojsonPath.coordinates.length) {
        console.log('[SUPABASE] No coordinates found, constructing from start/end for route:', route.route_name);
        geojsonPath = {
          type: 'LineString',
          coordinates: [
            [startCoordinates.longitude, startCoordinates.latitude],
            [endCoordinates.longitude, endCoordinates.latitude]
          ]
        };
      }

      // If start/end still missing but we now have a path, derive from geojson first/last
      if ((!startCoordinates.latitude || !startCoordinates.longitude) && geojsonPath.coordinates.length >= 1) {
        startCoordinates = { latitude: geojsonPath.coordinates[0][1], longitude: geojsonPath.coordinates[0][0] };
        console.log('[SUPABASE] Derived start from geojson_path:', startCoordinates);
      }
      if ((!endCoordinates.latitude || !endCoordinates.longitude) && geojsonPath.coordinates.length >= 1) {
        const last = geojsonPath.coordinates[geojsonPath.coordinates.length - 1];
        endCoordinates = { latitude: last[1], longitude: last[0] };
        console.log('[SUPABASE] Derived end from geojson_path:', endCoordinates);
      }

      // Final validation: require at least two points overall
      if (!geojsonPath.coordinates || geojsonPath.coordinates.length < 2) {
        console.error('[SUPABASE] Missing required coordinates and no valid path for route:', route.route_name);
        console.error('[SUPABASE] Start coords:', startCoordinates);
        console.error('[SUPABASE] End coords:', endCoordinates);
        return null;
      }

      // Create route coordinates array for compatibility
      const routeCoordinates = geojsonPath.coordinates.map((coord: number[]) => ({
        latitude: coord[1],
        longitude: coord[0]
      }));

      // Parse estimated duration with multiple fallbacks
      let estimatedDurationMin = 0;
      if (typeof route.estimated_duration_minutes === 'number') {
        estimatedDurationMin = Math.max(0, Math.round(route.estimated_duration_minutes));
      } else if (typeof route.estimated_duration_min === 'number') {
        estimatedDurationMin = Math.max(0, Math.round(route.estimated_duration_min));
      } else if (typeof route.estimated_duration_hr === 'number') {
        estimatedDurationMin = Math.max(0, Math.round(route.estimated_duration_hr * 60));
      } else if (route.estimated_duration && typeof route.estimated_duration === 'string') {
        const durationMatch = route.estimated_duration.match(/(\d+)/);
        if (durationMatch) {
          estimatedDurationMin = parseInt(durationMatch[1]);
        }
      }

      const transformedRoute = {
        id: route.id?.toString() || '',
        route_id: route.id?.toString() || '',
        route_name: route.route_name || 'Unnamed Route',
        hiking_spot_id: route.hiking_spot_id?.toString() || hikingSpotId,
        difficulty_level: route.difficulty || 'Moderate',
        difficulty: route.difficulty || 'Moderate',
        distance_km: route.distance || 0,
        elevation_gain_m: route.elevation_gain || 0,
        estimated_duration_min: estimatedDurationMin,
        estimated_duration_hr: estimatedDurationMin ? estimatedDurationMin / 60 : 0,
        estimated_duration: route.estimated_duration || '',
        route_description: route.route_description || '',
        route_features: route.route_features || '',
        highlights: route.route_features || '',
        waypoints: [],
        start_coordinates: startCoordinates,
        end_coordinates: endCoordinates,
        start_latitude: startCoordinates.latitude,
        start_longitude: startCoordinates.longitude,
        end_latitude: endCoordinates.latitude,
        end_longitude: endCoordinates.longitude,
        route_coordinates: routeCoordinates,
        geojson_path: geojsonPath,
        route_color: getDifficultyColor(route.difficulty || 'Moderate'),
        created_at: route.created_at,
        updated_at: route.updated_at
      };

      console.log('[SUPABASE] Transformed route:', transformedRoute.route_name, 'start:', startCoordinates, 'end:', endCoordinates, 'points:', geojsonPath.coordinates.length);
      return transformedRoute;
    }).filter(route => route !== null); // Remove routes with invalid coordinates

    console.log('[SUPABASE] Final transformed data:', transformedData);
    return { data: transformedData, error };
  }

  return { data: data || [], error };
};

// Helper function to get difficulty colors
const getDifficultyColor = (difficulty: string): string => {
  const colors: Record<string, string> = {
    'Easy': '#2ecc71',
    'Moderate': '#f39c12',
    'Hard': '#e74c3c',
    'Expert': '#8e44ad',
  };
  return colors[difficulty] || '#3498db';
};

export const fetchUserProfile = async (userId: string) => {
  return safeSupabaseQuery(
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single(),
    `fetch user profile ${userId}`
  );
};

// Health check function
export const performHealthCheck = async (): Promise<{
  isHealthy: boolean;
  checks: Record<string, boolean>;
  errors: string[];
}> => {
  const checks: Record<string, boolean> = {};
  const errors: string[] = [];
  
  try {
    // Check network connectivity
    checks.connectivity = await checkNetworkConnectivity();
    if (!checks.connectivity) {
      errors.push('Network connectivity failed');
    }
    
    // Check hiking_spots table access (use a safe column present across schemas)
    const { error: hikingSpotsError } = await supabase
      .from('hiking_spots')
      .select('name')
      .limit(1);
    checks.hikingSpots = !hikingSpotsError;
    if (hikingSpotsError) {
      errors.push(`Hiking spots table: ${hikingSpotsError.message}`);
    }
    
    // Check trail_routes table access
    const { error: trailRoutesError } = await supabase
      .from('hiking_spot_routes')
      .select('id')
      .limit(1);
    checks.trailRoutes = !trailRoutesError;
    if (trailRoutesError) {
      errors.push(`Trail routes table: ${trailRoutesError.message}`);
    }
    
    // Check profiles table access
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    checks.profiles = !profilesError;
    if (profilesError) {
      errors.push(`Profiles table: ${profilesError.message}`);
    }
    
  } catch (error) {
    errors.push(`Health check failed: ${error}`);
  }
  
  const isHealthy = Object.values(checks).every(check => check === true) && errors.length === 0;
  
  return { isHealthy, checks, errors };
};

// Trail route interface for component compatibility
export interface TrailRouteDetails {
  route_id: string;
  route_name: string;
  hiking_spot_id: string;
  difficulty_level: string;
  difficulty?: string;
  distance_km: number;
  elevation_gain_m: number;
  estimated_duration_hr?: number;
  estimated_duration?: string;
  route_description?: string;
  highlights?: string;
  waypoints?: any;
  start_coordinates?: { latitude: number; longitude: number } | null;
  end_coordinates?: { latitude: number; longitude: number } | null;
  route_coordinates?: { latitude: number; longitude: number }[] | null;
  geojson_path?: any;
  route_color?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Alias function for component compatibility
export const getTrailRoutesBySpotId = async (hikingSpotId: string) => {
  return fetchTrailRoutes(hikingSpotId);
};

// Weather data interfaces
export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  description?: string;
  visibility?: number;
  uvIndex?: number;
  pressure?: number;
}

// OpenWeatherMap API configuration
const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || 'demo_key';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Weather cache duration (1 hour)
const WEATHER_CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Weather data fetching with caching
export const getWeatherData = async (latitude: number, longitude: number): Promise<WeatherData | null> => {
  try {
    // Validate coordinates
    if (!latitude || !longitude || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      throw new Error('Invalid coordinates provided');
    }

    // Check cache first
    const cachedWeather = await getCachedWeatherData(latitude, longitude);
    if (cachedWeather) {
      return cachedWeather;
    }

    // If no API key is configured, return mock data for demo
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'demo_key') {
      console.warn('OpenWeatherMap API key not configured, returning mock weather data');
      return getMockWeatherData(latitude, longitude);
    }

    // Fetch from OpenWeatherMap API
    const weatherData = await fetchWeatherFromAPI(latitude, longitude);
    
    // Cache the result
    if (weatherData) {
      await cacheWeatherData(latitude, longitude, weatherData);
    }

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    // Return mock data as fallback
    return getMockWeatherData(latitude, longitude);
  }
};

// Fetch weather data from OpenWeatherMap API
const fetchWeatherFromAPI = async (latitude: number, longitude: number): Promise<WeatherData | null> => {
  try {
    const url = `${OPENWEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform OpenWeatherMap response to our format
    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      icon: data.weather[0].icon,
      description: data.weather[0].description,
      visibility: data.visibility ? Math.round(data.visibility / 1000) : undefined, // Convert m to km
      uvIndex: data.uvi || undefined,
      pressure: data.main.pressure
    };
  } catch (error) {
    console.error('OpenWeatherMap API error:', error);
    throw error;
  }
};

// Get cached weather data
const getCachedWeatherData = async (latitude: number, longitude: number): Promise<WeatherData | null> => {
  try {
    if (isInDemoMode) {
      return null; // Skip cache in demo mode
    }

    const { data, error } = await supabase
      .from('weather_cache')
      .select('*')
      .gte('fetched_at', new Date(Date.now() - WEATHER_CACHE_DURATION).toISOString())
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    // Transform cached data to our format
    const weatherData = data.data;
    return {
      temperature: weatherData?.main?.temp || 25,
      condition: weatherData?.weather?.[0]?.main || 'Clear',
      humidity: weatherData?.main?.humidity || 70,
      windSpeed: Math.round((weatherData?.wind?.speed || 5) * 3.6), // Convert m/s to km/h
      icon: weatherData?.weather?.[0]?.icon || 'partly-sunny',
      description: weatherData?.weather?.[0]?.description,
      visibility: weatherData?.visibility ? Math.round(weatherData.visibility / 1000) : undefined,
      uvIndex: weatherData?.uvi || undefined,
      pressure: weatherData?.main?.pressure
    };
  } catch (error) {
    console.error('Error fetching cached weather data:', error);
    return null;
  }
};

// Cache weather data
const cacheWeatherData = async (latitude: number, longitude: number, weatherData: WeatherData): Promise<void> => {
  try {
    if (isInDemoMode) {
      return; // Skip caching in demo mode
    }

    // Find the closest hiking spot to cache the weather data
    const { data: spot } = await supabase
      .from('hiking_spots')
      .select('id')
      .order('created_at')
      .limit(1)
      .single();

    if (!spot) {
      console.warn('No hiking spot found for weather caching');
      return;
    }

    await supabase
      .from('weather_cache')
      .insert({
        spot_id: spot.id,
        data: {
          main: {
            temp: weatherData.temperature,
            humidity: weatherData.humidity,
            pressure: weatherData.pressure
          },
          weather: [{
            main: weatherData.condition,
            description: weatherData.description,
            icon: weatherData.icon
          }],
          wind: {
            speed: weatherData.windSpeed / 3.6 // Convert back to m/s for storage
          },
          visibility: weatherData.visibility ? weatherData.visibility * 1000 : null
        }
      });
  } catch (error) {
    console.error('Error caching weather data:', error);
    // Don't throw error for caching failures
  }
};

// Generate mock weather data for demo/fallback
const getMockWeatherData = (latitude: number, _longitude: number): WeatherData => {
  // Mark parameter as intentionally unused for API compatibility
  void _longitude;
  // Generate realistic weather data based on location and time
  const now = new Date();
  const hour = now.getHours();
  const isDay = hour >= 6 && hour < 18;
  
  // Base temperature on latitude (tropical climate for Philippines)
  const baseTemp = 28 - (Math.abs(latitude - 10) * 2); // Cooler at higher altitudes
  const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 5; // Daily temperature variation
  const temperature = Math.round(baseTemp + tempVariation + (Math.random() - 0.5) * 4);
  
  // Mock conditions based on time and randomness
  const conditions = isDay 
    ? ['Clear', 'Partly Cloudy', 'Cloudy', 'Hazy']
    : ['Clear', 'Partly Cloudy', 'Cloudy'];
  
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  return {
    temperature,
    condition,
    humidity: Math.round(65 + Math.random() * 25), // 65-90% humidity (tropical)
    windSpeed: Math.round(5 + Math.random() * 15), // 5-20 km/h
    icon: getWeatherIcon(condition, isDay),
    description: `${condition.toLowerCase()} skies`,
    visibility: Math.round(8 + Math.random() * 7), // 8-15 km
    uvIndex: isDay ? Math.round(6 + Math.random() * 5) : 0, // 6-11 during day
    pressure: Math.round(1010 + Math.random() * 20) // 1010-1030 hPa
  };
};

// Get appropriate weather icon
const getWeatherIcon = (condition: string, isDay: boolean = true): string => {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('clear')) {
    return isDay ? 'sunny' : 'moon';
  } else if (conditionLower.includes('partly') || conditionLower.includes('few')) {
    return isDay ? 'partly-sunny' : 'cloudy-night';
  } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
    return 'cloudy';
  } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return 'rainy';
  } else if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
    return 'thunderstorm';
  } else if (conditionLower.includes('snow')) {
    return 'snow';
  } else if (conditionLower.includes('fog') || conditionLower.includes('mist') || conditionLower.includes('haze')) {
    return 'cloudy';
  }
  
  return isDay ? 'partly-sunny' : 'cloudy-night';
};

// Additional service methods for hiking spot reviews
export const getHikingSpotReviews = async (hikingSpotId: string) => {
  return safeSupabaseQuery(
    supabase
      .from('reviews')
      .select('*')
      .eq('hiking_spot_id', hikingSpotId)
      .order('created_at', { ascending: false }),
    `fetch reviews for hiking spot ${hikingSpotId}`
  );
};

export const addHikingSpotReview = async (reviewData: {
  hiking_spot_id: string;
  user_name: string;
  rating: number;
  comment: string;
}) => {
  return safeSupabaseQuery(
    supabase
      .from('reviews')
      .insert(reviewData),
    'add hiking spot review'
  );
};

// Export error types and utilities
export { RETRY_CONFIG };