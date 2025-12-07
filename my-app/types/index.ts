// Shared type definitions for the hiking app

export interface Favorite {
  id: string;
  user_id: string;
  spot_id: string;
  created_at: string;
}

export interface HikingSpot {
  id: number;
  hiking_spot_id?: number | string;
  name: string;
  coordinates?: any; // PostGIS POINT type
  description?: string;
  cover_image_url?: string;
  average_rating: number;
  number_of_reviews: number;
  difficulty?: string;
  elevation?: number;
  trail_length?: number;
  estimated_duration?: number;
  image_url?: string;
  images?: any; // JSONB
  amenities?: string[];
  best_season?: string[];
  created_by?: string;
  is_verified: boolean;
  rating?: number;
  review_count?: number;
  latitude?: number;
  longitude?: number;
  location_text?: string;
  elevation_m?: number;
  trail_length_km?: number;
  estimated_duration_min?: number;
  created_at?: string;
  updated_at?: string;
  is_favorited?: boolean;
  thumbnail?: any;
}

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  skill_level: string;
  cover_photo_url?: string;
  total_km_traveled?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FavoriteSpot extends HikingSpot {
  favorited_at: string;
}

// Media used in activities/hikes
export interface MediaItem {
  uri: string;
  type: 'image' | 'video';
}

// Post used in profile feed
export interface Post {
  id: string;
  content?: string;
  image_url?: string;
  created_at: string;
  user_id: string;
  visibility?: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  profiles?: {
    username: string;
    avatar_url?: string | null;
  };
}

// Hike activity summary surfaced on Profile
export interface Hike {
  id: string;
  title?: string;
  description?: string;
  date: string;
  distance: number;
  duration: number;
  elevation: number;
  media?: MediaItem[];
}

/**
 * Represents a trail route with all its details
 */
export interface TrailRoute {
  /** Unique identifier for the trail route */
  id: string;

  /** Name of the trail route */
  route_name: string;

  /** Difficulty level of the trail */
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Expert';

  /** Distance in kilometers */
  distance: number;

  /** Elevation gain in meters */
  elevation_gain: number;

  /** Estimated duration in minutes */
  estimated_duration: number;

  /** Detailed description of the route */
  route_description: string;

  /** Key highlights or features of the trail */
  highlights: string;

  /** Color code for the route line on the map */
  route_color: string;

  /** Starting point coordinates of the trail */
  start_coordinates: {
    latitude: number;
    longitude: number;
  };

  /** Ending point coordinates of the trail */
  end_coordinates: {
    latitude: number;
    longitude: number;
  };

  /** Array of [longitude, latitude] coordinates for the route line */
  coordinates: [number, number][];

  /** 
   * Waypoints along the route as a JSON string or array of waypoint objects
   * @example '[{"latitude": 10.1234, "longitude": 123.4567, "name": "Viewpoint 1"}]'
   */
  waypoints: string | Array<{
    latitude: number;
    longitude: number;
    name?: string;
    description?: string;
  }>;

  /** Timestamp when the route was created */
  created_at?: string;

  /** Timestamp when the route was last updated */
  updated_at?: string;
}