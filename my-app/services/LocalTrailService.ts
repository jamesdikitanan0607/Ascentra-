import { NEW_TRAIL_ROUTES, TrailRoute } from '../data/trailRoutesData';

export interface LocalTrailRoute {
  id: number;
  name: string;
  difficulty: string;
  distance: number;
  elevation_gain: number;
  estimated_time: string;
  waypoints: Array<{ lat: number; lng: number }>;
  start_coordinates: [number, number];
  end_coordinates: [number, number];
  color?: string;
}

class LocalTrailService {
  /**
   * Get all available trails
   */
  static getAllTrails(): LocalTrailRoute[] {
    console.log('LocalTrailService: Getting all trails');
    return NEW_TRAIL_ROUTES.map(this.transformTrailRoute);
  }

  /**
   * Get trails for a specific hiking spot
   */
  static getTrailsForSpot(hikingSpotId: string | number | null | undefined): LocalTrailRoute[] {
    console.log(`LocalTrailService: Getting trails for hiking spot ${hikingSpotId}`);
    
    if (!hikingSpotId) {
      console.warn('LocalTrailService: No hiking spot ID provided');
      return [];
    }

    const spotId = String(hikingSpotId);
    const trails = NEW_TRAIL_ROUTES.filter(route => 
      route.hiking_spot_id === spotId || route.hikingSpotId === spotId
    ).map(this.transformTrailRoute);

    console.log(`LocalTrailService: Found ${trails.length} trails for spot ${hikingSpotId}`);
    
    if (trails.length === 0) {
      console.warn(`LocalTrailService: No trails found for hiking spot ${hikingSpotId}`);
    }

    return trails;
  }

  /**
   * Get a specific trail by ID
   */
  static getTrailById(trailId: string | null | undefined): LocalTrailRoute | null {
    console.log(`LocalTrailService: Getting trail by ID ${trailId}`);
    
    if (!trailId) {
      console.warn('LocalTrailService: No trail ID provided');
      return null;
    }

    const trail = NEW_TRAIL_ROUTES.find(route => route.id === trailId);
    
    if (!trail) {
      console.warn(`LocalTrailService: Trail with ID ${trailId} not found`);
      return null;
    }

    console.log(`LocalTrailService: Found trail ${trail.route_name} (ID: ${trailId})`);
    return this.transformTrailRoute(trail);
  }

  /**
   * Get trails by difficulty level
   */
  static getTrailsByDifficulty(difficulty: string | null | undefined): LocalTrailRoute[] {
    console.log(`LocalTrailService: Getting trails by difficulty ${difficulty}`);
    
    if (!difficulty) {
      console.warn('LocalTrailService: No difficulty level provided');
      return [];
    }

    const trails = NEW_TRAIL_ROUTES.filter(route => 
      route.difficulty === difficulty
    ).map(this.transformTrailRoute);

    console.log(`LocalTrailService: Found ${trails.length} trails with difficulty ${difficulty}`);
    
    if (trails.length === 0) {
      console.warn(`LocalTrailService: No trails found with difficulty ${difficulty}`);
    }

    return trails;
  }

  /**
   * Transform TrailRoute to LocalTrailRoute format
   */
  private static transformTrailRoute(route: TrailRoute): LocalTrailRoute {
    // Convert GeoJSON coordinates to waypoints
    const waypoints = route.geojson_path.coordinates.map(coord => ({
      lat: coord[1], // GeoJSON uses [lng, lat] format
      lng: coord[0]
    }));

    // Convert estimated duration from hours to readable string
    const hours = Math.floor(route.estimated_duration_hr);
    const minutes = Math.round((route.estimated_duration_hr - hours) * 60);
    const estimated_time = hours > 0 
      ? `${hours}h ${minutes}m`
      : `${minutes}m`;

    return {
      id: parseInt(route.id.replace(/[^0-9]/g, '')) || Math.random() * 1000,
      name: route.route_name,
      difficulty: route.difficulty,
      distance: route.distance_km,
      elevation_gain: route.elevation_gain_m,
      estimated_time,
      waypoints,
      start_coordinates: [
        route.start_coordinates.latitude,
        route.start_coordinates.longitude
      ],
      end_coordinates: [
        route.end_coordinates.latitude,
        route.end_coordinates.longitude
      ],
      color: route.route_color
    };
  }
}

export default LocalTrailService;