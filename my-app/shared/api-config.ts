// Shared API Configuration for Mobile App - Admin Dashboard Integration
// This ensures mobile app uses the same Supabase instance and data structure as admin dashboard

export const MOBILE_SHARED_CONFIG = {
  // Supabase Configuration - Same as Admin Dashboard
  SUPABASE_URL: 'https://tppimfexrhptzdxlxcbj.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcGltZmV4cmhwdHpkeGx4Y2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTM3MzMsImV4cCI6MjA3MzY2OTczM30.sQCNoudMxCodsGqNespKTBrH0i34c71eyzYDrSzyz78',
  SUPABASE_SERVICE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcGltZmV4cmhwdHpkeGx4Y2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA5MzczMywiZXhwIjoyMDczNjY5NzMzfQ.SYCLq43OaWJv-M6JH6eZonwNgApI6wJlr_pr7ROAGzM'
};

// Shared TypeScript Interfaces - Compatible with Admin Dashboard
export interface MobileHikingSpot {
  id: string | number;
  hiking_spot_id: string | number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  elevation: number;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Advanced';
  trail_length: number; // in kilometers
  estimated_duration: number; // in hours
  cover_image_url: string | null;
  average_rating: number | null;
  number_of_reviews: number | null;
  is_verified: boolean;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MobileTrailRoute {
  id: string | number;
  route_id: string | number;
  hiking_spot_id: string | number;
  name: string;
  route_name: string;
  description: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Advanced';
  length: number; // in kilometers
  distance_km: number; // in kilometers
  elevation_gain: number; // in meters
  elevation_gain_m: number; // in meters
  estimated_time: number; // in minutes
  estimated_duration_hr: number; // in hours
  trail_type: 'Loop' | 'Out and Back' | 'Point to Point';
  waypoints: string; // JSON string
  gpx_data?: string;
  highlights: string[];
  route_color: string;
  route_coordinates: { latitude: number; longitude: number }[];
  start_coordinates: [number, number] | string;
  end_coordinates: [number, number] | string;
  geojson_path?: { type: string; coordinates: number[][] };
  created_at: string;
  updated_at: string;
}

export interface MobileUserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  hiking_experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  location: string | null;
  is_active: boolean;
  total_hikes: number;
  total_distance_km: number;
  created_at: string;
  updated_at: string;
}

// Admin Dashboard Integration Functions
export class AdminDashboardBridge {
  
  // Transform admin data to mobile format
  static transformAdminHikingSpot(adminSpot: any): MobileHikingSpot {
    return {
      id: adminSpot.hiking_spot_id || adminSpot.id,
      hiking_spot_id: adminSpot.hiking_spot_id || adminSpot.id,
      name: adminSpot.name,
      description: adminSpot.description || '',
      latitude: parseFloat(adminSpot.latitude),
      longitude: parseFloat(adminSpot.longitude),
      elevation: parseInt(adminSpot.elevation) || 0,
      difficulty: this.normalizeDifficulty(adminSpot.difficulty),
      trail_length: parseFloat(adminSpot.trail_length) || 0,
      estimated_duration: parseFloat(adminSpot.estimated_duration) || 0,
      cover_image_url: adminSpot.cover_image_url || null,
      average_rating: parseFloat(adminSpot.average_rating) || null,
      number_of_reviews: parseInt(adminSpot.number_of_reviews) || null,
      is_verified: Boolean(adminSpot.is_verified),
      is_active: Boolean(adminSpot.is_active),
      created_by: adminSpot.created_by || 'admin',
      created_at: adminSpot.created_at || new Date().toISOString(),
      updated_at: adminSpot.updated_at || new Date().toISOString()
    };
  }

  // Transform admin trail data to mobile format
  static transformAdminTrailRoute(adminRoute: any): MobileTrailRoute {
    return {
      id: adminRoute.route_id || adminRoute.id,
      route_id: adminRoute.route_id || adminRoute.id,
      hiking_spot_id: adminRoute.hiking_spot_id,
      name: adminRoute.route_name,
      route_name: adminRoute.route_name,
      description: adminRoute.description || '',
      difficulty: this.normalizeDifficulty(adminRoute.difficulty),
      length: parseFloat(adminRoute.distance_km) || 0,
      distance_km: parseFloat(adminRoute.distance_km) || 0,
      elevation_gain: parseInt(adminRoute.elevation_gain_m) || 0,
      elevation_gain_m: parseInt(adminRoute.elevation_gain_m) || 0,
      estimated_time: (parseFloat(adminRoute.estimated_duration_hr) || 0) * 60, // Convert hours to minutes
      estimated_duration_hr: parseFloat(adminRoute.estimated_duration_hr) || 0,
      trail_type: this.normalizeTrailType(adminRoute.trail_type),
      waypoints: adminRoute.waypoints || '[]',
      gpx_data: adminRoute.gpx_data,
      highlights: Array.isArray(adminRoute.highlights) ? adminRoute.highlights : [],
      route_color: adminRoute.route_color || '#FF0000',
      route_coordinates: adminRoute.route_coordinates || [],
      start_coordinates: adminRoute.start_coordinates,
      end_coordinates: adminRoute.end_coordinates,
      geojson_path: adminRoute.geojson_path,
      created_at: adminRoute.created_at || new Date().toISOString(),
      updated_at: adminRoute.updated_at || new Date().toISOString()
    };
  }

  // Normalize difficulty values
  private static normalizeDifficulty(difficulty: string): 'Easy' | 'Moderate' | 'Hard' | 'Advanced' {
    const normalized = difficulty.toLowerCase();
    if (normalized === 'easy' || normalized === 'beginner') return 'Easy';
    if (normalized === 'medium' || normalized === 'intermediate') return 'Moderate';
    if (normalized === 'hard' || normalized === 'advanced' || normalized === 'expert') return 'Advanced';
    return 'Moderate'; // default
  }

  // Normalize trail type
  private static normalizeTrailType(trailType: string): 'Loop' | 'Out and Back' | 'Point to Point' {
    const normalized = trailType.toLowerCase().replace(/\s+/g, '_');
    if (normalized === 'loop') return 'Loop';
    if (normalized === 'out_and_back' || normalized === 'out-and-back') return 'Out and Back';
    if (normalized === 'point_to_point' || normalized === 'point-to-point') return 'Point to Point';
    return 'Loop'; // default
  }

  // Check if data is from admin dashboard
  static isAdminData(data: any): boolean {
    return (
      data &&
      (data.hiking_spot_id !== undefined || data.route_id !== undefined) &&
      data.created_at !== undefined
    );
  }

  // Sync mobile app with admin dashboard data
  static async syncWithAdmin(supabase: any): Promise<{
    hikingSpots: MobileHikingSpot[];
    trailRoutes: MobileTrailRoute[];
    success: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let hikingSpots: MobileHikingSpot[] = [];
    let trailRoutes: MobileTrailRoute[] = [];

    try {
      // Fetch hiking spots
      const { data: spotsData, error: spotsError } = await supabase
        .from('hiking_spots')
        .select('*')
        .eq('is_active', true);

      if (spotsError) {
        errors.push(`Failed to fetch hiking spots: ${spotsError.message}`);
      } else if (spotsData) {
        hikingSpots = spotsData.map((spot: any) => this.transformAdminHikingSpot(spot));
      }

      // Fetch trail routes
      const { data: routesData, error: routesError } = await supabase
        .from('trail_routes')
        .select('*')
        .eq('is_active', true);

      if (routesError) {
        errors.push(`Failed to fetch trail routes: ${routesError.message}`);
      } else if (routesData) {
        trailRoutes = routesData.map((route: any) => this.transformAdminTrailRoute(route));
      }

    } catch (error) {
      errors.push(`Sync failed: ${error}`);
    }

    return {
      hikingSpots,
      trailRoutes,
      success: errors.length === 0,
      errors
    };
  }
}

// Export for easy use in mobile app
export default MOBILE_SHARED_CONFIG;
