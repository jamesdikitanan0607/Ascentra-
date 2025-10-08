import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { TrailRoute } from '../types';

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
  // If it's already in the correct format, return as is
  if (route.id && route.route_name && route.difficulty !== undefined) {
    return route;
  }

  // Normalize from different formats
  const normalized: TrailRoute = {
    id: route.id || route.route_id || '',
    route_name: route.route_name || route.name || 'Unnamed Trail',
    difficulty: (route.difficulty as 'Easy' | 'Moderate' | 'Hard' | 'Expert') || 'Moderate',
    distance: route.distance || route.distance_km || 0,
    elevation_gain: route.elevation_gain || route.elevation_gain_m || 0,
    estimated_duration: route.estimated_duration || (route.estimated_duration_hr || 0) * 60,
    route_description: route.route_description || route.description || '',
    highlights: route.highlights || '',
    route_color: route.route_color || '#388E3C',
    start_coordinates: route.start_coordinates || (route.startCoords ? 
      { 
        latitude: route.startCoords[1],
        longitude: route.startCoords[0]
      } : undefined),
    end_coordinates: route.end_coordinates || (route.endCoords ?
      { 
        latitude: route.endCoords[1],
        longitude: route.endCoords[0]
      } : undefined),
    coordinates: route.coordinates || (route.route_coordinates ? 
      route.route_coordinates.map((coord: any) => [coord.longitude, coord.latitude]) : []) as [number, number][],
    waypoints: route.waypoints || '',
    created_at: route.created_at || new Date().toISOString(),
    updated_at: route.updated_at || new Date().toISOString()
  };

  return normalized;
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
  // Priority 1: Use coordinates array if available
  if (trail.coordinates && trail.coordinates.length > 0) {
    return trail.coordinates.map(coord => ({
      latitude: coord[1],
      longitude: coord[0]
    }));
  }

  // Priority 2: Parse waypoints JSON data
  if (typeof trail.waypoints === 'string' && trail.waypoints) {
    try {
      const waypoints = JSON.parse(trail.waypoints);
      if (Array.isArray(waypoints) && waypoints.length > 0) {
        return waypoints.map((waypoint: any) => ({
          latitude: waypoint.latitude || waypoint.lat || 0,
          longitude: waypoint.longitude || waypoint.lng || 0,
        })).filter((coord: any) => coord.latitude !== undefined && coord.longitude !== undefined);
      }
    } catch (error) {
      console.warn('Failed to parse waypoints JSON:', error);
    }
  }
  
  // Priority 3: Fallback to start/end coordinates
  if (trail.start_coordinates && trail.end_coordinates) {
    return [trail.start_coordinates, trail.end_coordinates];
  }
  
  return [];
};

export default TrailContext;