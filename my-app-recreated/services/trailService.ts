import { supabase } from './supabaseClient';

export interface TrailRoute {
  id: number;
  route_id: number;
  hiking_spot_id: number;
  name: string;
  route_name?: string;
  description?: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Advanced';
  length: number; // in kilometers
  distance_km?: number; // alternative field name
  elevation_gain: number; // in meters
  elevation_gain_m?: number; // alternative field name
  estimated_time: number; // in minutes
  estimated_duration_hr?: number; // alternative field name in hours
  trail_type?: 'Loop' | 'Out and Back' | 'Point to Point';
  waypoints: string; // JSON string of waypoints
  gpx_data?: string;
  highlights?: string;
  route_coordinates?: { latitude: number; longitude: number }[];
  start_coordinates?: [number, number] | string;
  end_coordinates?: [number, number] | string;
  geojson_path?: { type: string; coordinates: number[][] };
  route_color?: string;

  created_at: string;
  updated_at: string;
}

export interface HikingSpot {
  hiking_spot_id: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  difficulty?: string;
  trail_length?: number;
  estimated_duration?: number;
  cover_image_url?: string;
  image_url?: string;
  images?: any;
  amenities?: string[];
  best_season?: string[];
  location_text?: string;
  average_rating: number;
  number_of_reviews: number;
  is_verified: boolean;
}

export interface TrailWithSpot extends TrailRoute {
  hiking_spot: HikingSpot;
  start_coordinates?: [number, number];
  end_coordinates?: [number, number];
  coordinates?: number[][]; // For map polyline rendering
  distance_km: number;
  elevation_m: number;
  duration_hr: number;
  highlights: string;
}

export interface TrailsByMountain {
  mount: string;
  trails: TrailWithSpot[];
}

// Difficulty color mapping
export const DIFFICULTY_COLORS = {
  Easy: '#4CAF50',           // Green
  'Easy-Moderate': '#8BC34A', // Light Green
  Moderate: '#FF9800',       // Orange
  Hard: '#F44336',           // Red
  'Very Hard': '#9C27B0'     // Purple
} as const;

// Mock trail data for Mount Babag and Sirao Peak
const MOCK_TRAIL_DATA: TrailWithSpot[] = [
  // Mount Babag trails
  {
    id: 1001,
    route_id: 1001,
    hiking_spot_id: 1001,
    name: "Babag Ridge Loop",
    description: "Gentle forest walk, birdlife, shaded bamboo patches.",
    difficulty: "Easy",
    length: 0.48,
    elevation_gain: 39,
    estimated_time: 8.4, // 0.14 hours * 60 minutes
    trail_type: "Loop",
    waypoints: JSON.stringify([
      { lat: 10.3628, lng: 123.8897 },
      { lat: 10.3655, lng: 123.8931 }
    ]),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    hiking_spot: {
      hiking_spot_id: 1001,
      name: "Mount Babag",
      description: "A scenic mountain with gentle trails and beautiful forest views.",
      latitude: 10.3628,
      longitude: 123.8897,
      elevation: 800,
      difficulty: "Easy to Moderate",
      trail_length: 1.1,
      estimated_duration: 21,
      cover_image_url: "",
      image_url: "",
      average_rating: 4.5,
      number_of_reviews: 25,
      is_verified: true,
    },
    start_coordinates: [10.3628, 123.8897],
    end_coordinates: [10.3655, 123.8931],
    distance_km: 0.48,
    elevation_m: 39,
    duration_hr: 0.14,
    highlights: "Gentle forest walk, birdlife, shaded bamboo patches."
  },
  {
    id: 1002,
    route_id: 1002,
    hiking_spot_id: 1001,
    name: "Babag Tower Trail",
    description: "Short steady climb to viewpoint tower, city skyline views.",
    difficulty: "Moderate",
    length: 0.62,
    elevation_gain: 124,
    estimated_time: 12.6, // 0.21 hours * 60 minutes
    trail_type: "Out and Back",
    waypoints: JSON.stringify([
      { lat: 10.3655, lng: 123.8931 },
      { lat: 10.3700, lng: 123.8965 }
    ]),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    hiking_spot: {
      hiking_spot_id: 1001,
      name: "Mount Babag",
      description: "A scenic mountain with gentle trails and beautiful forest views.",
      latitude: 10.3628,
      longitude: 123.8897,
      elevation: 800,
      difficulty: "Easy to Moderate",
      trail_length: 1.1,
      estimated_duration: 21,
      cover_image_url: "",
      image_url: "",
      average_rating: 4.5,
      number_of_reviews: 25,
      is_verified: true,
    },
    start_coordinates: [10.3655, 123.8931],
    end_coordinates: [10.3700, 123.8965],
    distance_km: 0.62,
    elevation_m: 124,
    duration_hr: 0.21,
    highlights: "Short steady climb to viewpoint tower, city skyline views."
  },
  // Mount Kan-irag / Sirao Peak trails
  {
    id: 1003,
    route_id: 1003,
    hiking_spot_id: 1002,
    name: "Sirao Garden Walk",
    description: "Flower farm views, gentle grassy slopes.",
    difficulty: "Easy",
    length: 0.49,
    elevation_gain: 39,
    estimated_time: 8.4, // 0.14 hours * 60 minutes
    trail_type: "Out and Back",
    waypoints: JSON.stringify([
      { lat: 10.3820, lng: 123.8587 },
      { lat: 10.3865, lng: 123.8589 }
    ]),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    hiking_spot: {
      hiking_spot_id: 1002,
      name: "Mount Kan-irag / Sirao Peak",
      description: "Beautiful mountain peak with flower gardens and panoramic views.",
      latitude: 10.3820,
      longitude: 123.8587,
      elevation: 1200,
      difficulty: "Easy to Moderate",
      trail_length: 1.27,
      estimated_duration: 24,
      cover_image_url: "",
      image_url: "",
      average_rating: 4.7,
      number_of_reviews: 18,
      is_verified: true,
    },
    start_coordinates: [10.3820, 123.8587],
    end_coordinates: [10.3865, 123.8589],
    distance_km: 0.49,
    elevation_m: 39,
    duration_hr: 0.14,
    highlights: "Flower farm views, gentle grassy slopes."
  },
  {
    id: 1004,
    route_id: 1004,
    hiking_spot_id: 1002,
    name: "Kan-irag Ridge",
    description: "Ridge walk with partial city and mountain vistas.",
    difficulty: "Moderate",
    length: 0.78,
    elevation_gain: 156,
    estimated_time: 15.6, // 0.26 hours * 60 minutes
    trail_type: "Point to Point",
    waypoints: JSON.stringify([
      { lat: 10.3865, lng: 123.8589 },
      { lat: 10.3935, lng: 123.8587 }
    ]),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    hiking_spot: {
      hiking_spot_id: 1002,
      name: "Mount Kan-irag / Sirao Peak",
      description: "Beautiful mountain peak with flower gardens and panoramic views.",
      latitude: 10.3820,
      longitude: 123.8587,
      elevation: 1200,
      difficulty: "Easy to Moderate",
      trail_length: 1.27,
      estimated_duration: 24,
      cover_image_url: "",
      image_url: "",
      average_rating: 4.7,
      number_of_reviews: 18,
      is_verified: true,
    },
    start_coordinates: [10.3865, 123.8589],
    end_coordinates: [10.3935, 123.8587],
    distance_km: 0.78,
    elevation_m: 156,
    duration_hr: 0.26,
    highlights: "Ridge walk with partial city and mountain vistas."
  }
];

// Convert database trail to app format
function transformTrailData(trail: any, spot: HikingSpot): TrailWithSpot {
  // Extract coordinates from database trail data
  let startCoords: [number, number] | undefined;
  let endCoords: [number, number] | undefined;
  let coordinates: number[][] | undefined;
  
  try {
    // Check for start_coordinates (PostGIS point format: "POINT(lng lat)")
    if (trail.start_coordinates) {
      if (typeof trail.start_coordinates === 'string') {
        // Parse PostGIS point format
        const match = trail.start_coordinates.match(/POINT\(([^)]+)\)/);
        if (match) {
          const [lng, lat] = match[1].split(' ').map(Number);
          startCoords = [lat, lng]; // App expects [lat, lng]
        }
      } else if (Array.isArray(trail.start_coordinates) && trail.start_coordinates.length === 2) {
        // Direct coordinate array [lng, lat] from PostGIS
        startCoords = [trail.start_coordinates[1], trail.start_coordinates[0]]; // Convert to [lat, lng]
      }
    }

    // Check for end_coordinates (PostGIS point format)
    if (trail.end_coordinates) {
      if (typeof trail.end_coordinates === 'string') {
        // Parse PostGIS point format
        const match = trail.end_coordinates.match(/POINT\(([^)]+)\)/);
        if (match) {
          const [lng, lat] = match[1].split(' ').map(Number);
          endCoords = [lat, lng]; // App expects [lat, lng]
        }
      } else if (Array.isArray(trail.end_coordinates) && trail.end_coordinates.length === 2) {
        // Direct coordinate array [lng, lat] from PostGIS
        endCoords = [trail.end_coordinates[1], trail.end_coordinates[0]]; // Convert to [lat, lng]
      }
    }

    // Extract route coordinates for the trail path
    if (trail.route_coordinates && Array.isArray(trail.route_coordinates)) {
      // Database format: [{ latitude: number, longitude: number }, ...]
      coordinates = trail.route_coordinates.map((coord: any) => [coord.longitude, coord.latitude]);
    } else if (trail.geojson_path && trail.geojson_path.coordinates) {
      // GeoJSON format: [[lng, lat], ...]
      coordinates = trail.geojson_path.coordinates;
    }

    // Fallback to spot coordinates if no trail coordinates found
    if (!startCoords || !endCoords) {
      startCoords = startCoords || [spot.latitude, spot.longitude];
      endCoords = endCoords || [spot.latitude, spot.longitude];
    }

    // If no route coordinates, create a simple line from start to end
    if (!coordinates && startCoords && endCoords) {
      coordinates = [[startCoords[1], startCoords[0]], [endCoords[1], endCoords[0]]]; // [lng, lat] format
    }

  } catch (error) {
    console.warn('Error parsing coordinates for trail:', trail.route_name || trail.name, error);
    // Fallback to spot coordinates
    startCoords = [spot.latitude, spot.longitude];
    endCoords = [spot.latitude, spot.longitude];
    coordinates = [[spot.longitude, spot.latitude]];
  }

  return {
    ...trail,
    // Ensure both id and route_id are set consistently
    id: trail.route_id || trail.id,
    route_id: trail.route_id || trail.id,
    // Normalize hiking_spot_id field
    hiking_spot_id: trail.hiking_spot_id,
    name: trail.route_name || trail.name || 'Unnamed Trail',
    description: trail.description,
    difficulty: trail.difficulty || 'Moderate',
    length: trail.distance_km || trail.length || 0,
    elevation_gain: trail.elevation_gain_m || trail.elevation_gain || 0,
    estimated_time: (trail.estimated_duration_hr || trail.estimated_time || 0) * 60, // Convert hours to minutes
    trail_type: trail.trail_type,
    waypoints: JSON.stringify(coordinates || []),
    hiking_spot: spot,
    start_coordinates: startCoords,
    end_coordinates: endCoords,
    coordinates: coordinates, // Add coordinates for the map component
    distance_km: trail.distance_km || trail.length || 0,
    elevation_m: trail.elevation_gain_m || trail.elevation_gain || 0,
    duration_hr: trail.estimated_duration_hr || (trail.estimated_time || 0) / 60,
    highlights: trail.highlights || trail.description || `${trail.difficulty || 'Moderate'} trail with ${trail.elevation_gain_m || trail.elevation_gain || 0}m elevation gain.`,
    created_at: trail.created_at || new Date().toISOString(),
    updated_at: trail.updated_at || new Date().toISOString()
  };
}

export class TrailService {
  // Instance method for getting all trails
  async getAllTrails(): Promise<TrailWithSpot[]> {
    return TrailService.getAllTrails();
  }

  // Instance method for getting trails by mountain
  async getTrailsByMountain(): Promise<TrailsByMountain[]> {
    return TrailService.getTrailsByMountain();
  }

  // Instance method for getting trails for a specific spot
  async getTrailsForSpot(spotId: number): Promise<TrailWithSpot[]> {
    return TrailService.getTrailsForSpot(spotId);
  }

  // Instance method for filtering by difficulty
  filterTrailsByDifficulty(trails: TrailWithSpot[], difficulties: string[]): TrailWithSpot[] {
    return TrailService.filterTrailsByDifficulty(trails, difficulties);
  }

  // Instance method for filtering by distance
  filterTrailsByDistance(trails: TrailWithSpot[], minKm: number, maxKm: number): TrailWithSpot[] {
    return TrailService.filterTrailsByDistance(trails, minKm, maxKm);
  }

  // Instance method for filtering by elevation
  filterTrailsByElevation(trails: TrailWithSpot[], minM: number, maxM: number): TrailWithSpot[] {
    return TrailService.filterTrailsByElevation(trails, minM, maxM);
  }

  // Instance method for searching trails
  searchTrails(trails: TrailWithSpot[], query: string): TrailWithSpot[] {
    return TrailService.searchTrails(trails, query);
  }

  // Fetch all trails with their hiking spots (static method)
  static async getAllTrails(): Promise<TrailWithSpot[]> {
    try {
      // Fetch trails from database first
      const { data: trails, error: trailsError } = await supabase
        .from('trail_routes')
        .select('*')
        .order('hiking_spot_id', { ascending: true })
        .order('route_name', { ascending: true });

      if (trailsError) {
        console.warn('Error fetching trails from database:', trailsError);
        // Fallback to mock data only if database fails
        return MOCK_TRAIL_DATA;
      }

      const { data: spots, error: spotsError } = await supabase
        .from('hiking_spots')
        .select('*')
        .order('name', { ascending: true });

      if (spotsError) {
        console.warn('Error fetching hiking spots from database:', spotsError);
        // Fallback to mock data only if database fails
        return MOCK_TRAIL_DATA;
      }

      // Create a map of spots for quick lookup
      const spotsMap = new Map<number, HikingSpot>();
      spots?.forEach(spot => {
        spotsMap.set(spot.hiking_spot_id, spot);
      });

      // Transform database data to TrailWithSpot format
      const allTrails: TrailWithSpot[] = [];
      trails?.forEach(trail => {
        const spot = spotsMap.get(trail.hiking_spot_id);
        if (spot) {
          allTrails.push(transformTrailData(trail, spot));
        }
      });

      console.log(`✅ Loaded ${allTrails.length} trails from ${spots?.length} hiking spots`);

      return allTrails.sort((a, b) => {
        // Sort by mountain name first, then by trail name
        const mountainCompare = a.hiking_spot.name.localeCompare(b.hiking_spot.name);
        if (mountainCompare !== 0) return mountainCompare;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error in getAllTrails:', error);
      // Fallback to mock data if everything fails
      return MOCK_TRAIL_DATA;
    }
  }

  // Fetch trails grouped by mountain
  static async getTrailsByMountain(): Promise<TrailsByMountain[]> {
    try {
      const trails = await this.getAllTrails();
      
      // Group trails by mountain name
      const trailsMap = new Map<string, TrailWithSpot[]>();
      
      trails.forEach(trail => {
        const mountainName = trail.hiking_spot.name;
        if (!trailsMap.has(mountainName)) {
          trailsMap.set(mountainName, []);
        }
        trailsMap.get(mountainName)!.push(trail);
      });

      // Convert to array format
      const result: TrailsByMountain[] = [];
      trailsMap.forEach((trails, mountainName) => {
        result.push({
          mount: mountainName,
          trails: trails.sort((a, b) => a.name.localeCompare(b.name))
        });
      });

      return result.sort((a, b) => a.mount.localeCompare(b.mount));
    } catch (error) {
      console.error('Error in getTrailsByMountain:', error);
      throw error;
    }
  }

  // Fetch trails for a specific hiking spot
  static async getTrailsForSpot(spotId: number): Promise<TrailWithSpot[]> {
    try {
      const { data: trails, error: trailsError } = await supabase
        .from('trail_routes')
        .select('*')
        .eq('hiking_spot_id', spotId)
        .order('route_name', { ascending: true });

      if (trailsError) {
        console.error('Error fetching trails for spot:', trailsError);
        throw trailsError;
      }

      const { data: spot, error: spotError } = await supabase
        .from('hiking_spots')
        .select('*')
        .eq('hiking_spot_id', spotId)
        .single();

      if (spotError) {
        console.error('Error fetching hiking spot:', spotError);
        throw spotError;
      }

      return trails?.map(trail => transformTrailData(trail, spot)) || [];
    } catch (error) {
      console.error('Error in getTrailsForSpot:', error);
      throw error;
    }
  }

  // Filter trails by difficulty
  static filterTrailsByDifficulty(trails: TrailWithSpot[], difficulties: string[]): TrailWithSpot[] {
    if (difficulties.length === 0) return trails;
    return trails.filter(trail => difficulties.includes(trail.difficulty));
  }

  // Filter trails by distance range
  static filterTrailsByDistance(trails: TrailWithSpot[], minKm: number, maxKm: number): TrailWithSpot[] {
    return trails.filter(trail => trail.distance_km >= minKm && trail.distance_km <= maxKm);
  }

  // Filter trails by elevation range
  static filterTrailsByElevation(trails: TrailWithSpot[], minM: number, maxM: number): TrailWithSpot[] {
    return trails.filter(trail => trail.elevation_m >= minM && trail.elevation_m <= maxM);
  }

  // Search trails by name
  static searchTrails(trails: TrailWithSpot[], query: string): TrailWithSpot[] {
    if (!query.trim()) return trails;
    const lowerQuery = query.toLowerCase();
    return trails.filter(trail => 
      trail.name.toLowerCase().includes(lowerQuery) ||
      trail.hiking_spot.name.toLowerCase().includes(lowerQuery) ||
      (typeof trail.highlights === 'string' && trail.highlights.toLowerCase().includes(lowerQuery))
    );
  }
}