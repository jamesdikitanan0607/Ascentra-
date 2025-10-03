import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Trail Route interface matching the expected data structure
export interface TrailRoute {
  id: string;
  route_id?: string;
  hiking_spot_id: string;
  hikingSpotId?: string; // Added for component consistency
  name: string;
  route_name?: string;
  description: string;
  difficulty: 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Hard' | 'Advanced' | 'Very Hard';
  distance_km: number;
  distance?: number; // Computed property for display
  length?: number; // Alternative field name
  elevation_gain_m: number;
  elevationGain?: number; // Computed property for display
  elevation_gain?: number; // Alternative field name
  estimated_duration_hr: number;
  estimatedTime?: number; // Computed property for display (in minutes)
  estimated_time?: number; // Alternative field name
  duration_hr?: number;
  highlights: string | string[];
  trail_type?: string;
  trailType?: string; // Computed property for display
  route_color?: string;
  startCoords?: [number, number]; // [longitude, latitude]
  endCoords?: [number, number]; // [longitude, latitude]
  start_coordinates?: { latitude: number; longitude: number };
  end_coordinates?: { latitude: number; longitude: number };
  route_coordinates?: { latitude: number; longitude: number }[];
  coordinates?: number[][]; // Computed property for map display
  geojson_path?: {
    type: string;
    coordinates: number[][];
  };
  waypoints?: string;
  gpx_data?: string | null;

  created_at?: string;
  updated_at?: string;
}

// Context interface
interface TrailContextType {
  selectedTrail: TrailRoute | null;
  setSelectedTrail: (trail: TrailRoute | null) => void;
  clearSelectedTrail: () => void;
  trails: TrailRoute[];
  setTrails: (trails: TrailRoute[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

// Create context
const TrailContext = createContext<TrailContextType | undefined>(undefined);

// Provider props
interface TrailProviderProps {
  children: ReactNode;
}

// Provider component
export const TrailProvider: React.FC<TrailProviderProps> = ({ children }) => {
  const [selectedTrail, setSelectedTrailState] = useState<TrailRoute | null>(null);
  const [trails, setTrails] = useState<TrailRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setSelectedTrail = useCallback((trail: TrailRoute | null) => {
    setSelectedTrailState(trail);
    // Clear any previous errors when selecting a new trail
    if (trail) {
      setError(null);
    }
  }, []);

  const clearSelectedTrail = useCallback(() => {
    setSelectedTrailState(null);
  }, []);

  const value: TrailContextType = {
    selectedTrail,
    setSelectedTrail,
    clearSelectedTrail,
    trails,
    setTrails,
    isLoading,
    setIsLoading,
    error,
    setError,
  };

  return (
    <TrailContext.Provider value={value}>
      {children}
    </TrailContext.Provider>
  );
};

// Custom hook to use the trail context
export const useTrail = (): TrailContextType => {
  const context = useContext(TrailContext);
  if (context === undefined) {
    throw new Error('useTrail must be used within a TrailProvider');
  }
  return context;
};

// Helper function to normalize trail data from different sources
export const normalizeTrailRoute = (route: any): TrailRoute => {
  const distanceKm = route.distance_km || route.length || 0;
  const elevationGainM = route.elevation_gain_m || route.elevation_gain || 0;
  const estimatedDurationHr = route.estimated_duration_hr || route.estimated_time || route.duration_hr || 0;
  
  return {
    id: route.id || route.route_id || '',
    route_id: route.route_id || route.id,
    hiking_spot_id: route.hiking_spot_id || '',
    hikingSpotId: route.hikingSpotId || route.hiking_spot_id || '', // Added for component consistency
    name: route.name || route.route_name || '',
    route_name: route.route_name || route.name,
    description: route.description || route.highlights || '',
    difficulty: route.difficulty || 'Easy',
    distance_km: distanceKm,
    distance: distanceKm, // Computed property for display
    length: route.length || distanceKm,
    elevation_gain_m: elevationGainM,
    elevationGain: elevationGainM, // Computed property for display
    elevation_gain: route.elevation_gain || elevationGainM,
    estimated_duration_hr: estimatedDurationHr,
    estimatedTime: estimatedDurationHr * 60, // Computed property for display (in minutes)
    estimated_time: route.estimated_time || estimatedDurationHr,
    duration_hr: route.duration_hr || estimatedDurationHr,
    highlights: route.highlights || route.description || '',
    trail_type: route.trail_type,
    trailType: route.trail_type, // Computed property for display
    route_color: route.route_color || '#FF0000',
    startCoords: route.startCoords,
    endCoords: route.endCoords,
    start_coordinates: route.start_coordinates,
    end_coordinates: route.end_coordinates,
    route_coordinates: route.route_coordinates,
    coordinates: getCoordinatesFromRoute(route), // Computed property for map display
    geojson_path: route.geojson_path,
    waypoints: route.waypoints,
    gpx_data: route.gpx_data,

    created_at: route.created_at,
    updated_at: route.updated_at,
  };
};

// Helper function to extract coordinates from various route formats
const getCoordinatesFromRoute = (route: any): number[][] => {
  if (route.geojson_path && route.geojson_path.coordinates) {
    return route.geojson_path.coordinates;
  }
  
  if (route.route_coordinates && route.route_coordinates.length > 0) {
    return route.route_coordinates.map((coord: any) => [coord.longitude, coord.latitude]);
  }
  
  if (route.start_coordinates && route.end_coordinates) {
    return [
      [route.start_coordinates.longitude, route.start_coordinates.latitude],
      [route.end_coordinates.longitude, route.end_coordinates.latitude],
    ];
  }
  
  return [];
};

// Helper function to get trail coordinates for map rendering
export const getTrailCoordinates = (trail: TrailRoute): { latitude: number; longitude: number }[] => {
  // Priority 1: Parse waypoints JSON data (this is where the actual trail path is stored)
  if (trail.waypoints) {
    try {
      const waypoints = JSON.parse(trail.waypoints);
      if (Array.isArray(waypoints) && waypoints.length > 0) {
        return waypoints.map((waypoint: any) => ({
          latitude: waypoint.latitude || waypoint.lat,
          longitude: waypoint.longitude || waypoint.lng,
        })).filter((coord: any) => coord.latitude && coord.longitude);
      }
    } catch (error) {
      console.warn('Failed to parse waypoints JSON:', error);
    }
  }
  
  // Priority 2: Use route_coordinates if available
  if (trail.route_coordinates && trail.route_coordinates.length > 0) {
    return trail.route_coordinates;
  }
  
  // Priority 3: Use geojson_path coordinates
  if (trail.geojson_path && trail.geojson_path.coordinates) {
    return trail.geojson_path.coordinates.map(([lng, lat]) => ({
      latitude: lat,
      longitude: lng,
    }));
  }
  
  // Priority 4: Fallback to start/end coordinates (legacy support)
  if (trail.startCoords && trail.endCoords) {
    return [
      { latitude: trail.startCoords[1], longitude: trail.startCoords[0] },
      { latitude: trail.endCoords[1], longitude: trail.endCoords[0] },
    ];
  }
  
  if (trail.start_coordinates && trail.end_coordinates) {
    return [trail.start_coordinates, trail.end_coordinates];
  }
  
  return [];
};

export default TrailContext;