import { supabase } from './supabaseClient';

export interface TrailRoute {
  id: number;
  route_id: number;
  hiking_spot_id: number;
  name: string;
  description?: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Advanced';
  length: number; // in kilometers
  elevation_gain: number; // in meters
  estimated_time: number; // in minutes
  trail_type?: 'Loop' | 'Out and Back' | 'Point to Point';
  waypoints: string; // JSON string of waypoints
  gpx_data?: string;
  is_active: boolean;
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
  Easy: '#4CAF50',      // Green
  Moderate: '#2196F3',  // Blue
  Hard: '#FF9800',      // Orange
  Advanced: '#F44336'   // Red
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
    is_active: true,
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
    is_active: true,
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
    is_active: true,
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
    is_active: true,
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
function transformTrailData(trail: TrailRoute, spot: HikingSpot): TrailWithSpot {
  // Parse waypoints to get start/end coordinates
  let startCoords: [number, number] | undefined;
  let endCoords: [number, number] | undefined;
  
  try {
    const waypoints = JSON.parse(trail.waypoints || '[]');
    if (waypoints.length > 0) {
      const start = waypoints[0];
      startCoords = [start.lat, start.lng];
      
      if (waypoints.length > 1) {
        const end = waypoints[waypoints.length - 1];
        endCoords = [end.lat, end.lng];
      } else {
        // If only one waypoint, use spot coordinates as end
        endCoords = [spot.latitude, spot.longitude];
      }
    } else {
      // Fallback to spot coordinates
      startCoords = [spot.latitude, spot.longitude];
      endCoords = [spot.latitude, spot.longitude];
    }
  } catch (error) {
    console.warn('Error parsing waypoints for trail:', trail.name, error);
    // Fallback to spot coordinates
    startCoords = [spot.latitude, spot.longitude];
    endCoords = [spot.latitude, spot.longitude];
  }

  return {
    ...trail,
    hiking_spot: spot,
    start_coordinates: startCoords,
    end_coordinates: endCoords,
    distance_km: trail.length,
    elevation_m: trail.elevation_gain,
    duration_hr: trail.estimated_time / 60, // Convert minutes to hours
    highlights: trail.description || `${trail.difficulty} ${trail.trail_type || 'trail'} with ${trail.elevation_gain}m elevation gain.`
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
      // Always include mock data for Mount Babag and Sirao Peak
      let allTrails: TrailWithSpot[] = [...MOCK_TRAIL_DATA];

      try {
        // Try to fetch additional trails from database
        const { data: trails, error: trailsError } = await supabase
          .from('trail_routes')
          .select('*')
          .eq('is_active', true)
          .order('hiking_spot_id', { ascending: true })
          .order('name', { ascending: true });

        if (trailsError) {
          console.warn('Error fetching trails from database:', trailsError);
          // Continue with mock data only
          return allTrails;
        }

        const { data: spots, error: spotsError } = await supabase
          .from('hiking_spots')
          .select('*')
          .order('name', { ascending: true });

        if (spotsError) {
          console.warn('Error fetching hiking spots from database:', spotsError);
          // Continue with mock data only
          return allTrails;
        }

        // Create a map of spots for quick lookup
        const spotsMap = new Map<number, HikingSpot>();
        spots?.forEach(spot => {
          spotsMap.set(spot.hiking_spot_id, spot);
        });

        // Transform and combine database data
        trails?.forEach(trail => {
          const spot = spotsMap.get(trail.hiking_spot_id);
          if (spot) {
            // Avoid duplicates by checking if trail already exists in mock data
            const existingTrail = allTrails.find(t => 
              t.name === trail.name && t.hiking_spot.name === spot.name
            );
            if (!existingTrail) {
              allTrails.push(transformTrailData(trail, spot));
            }
          }
        });
      } catch (dbError) {
        console.warn('Database connection failed, using mock data only:', dbError);
        // Continue with mock data only
      }

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
        .eq('is_active', true)
        .order('name', { ascending: true });

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
      trail.highlights.toLowerCase().includes(lowerQuery)
    );
  }
}