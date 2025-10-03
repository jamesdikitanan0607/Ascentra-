// Shared type definitions for the hiking app

export interface Favorite {
  id: string;
  user_id: string;
  spot_id: string;
  created_at: string;
}

export interface HikingSpot {
  id: number;
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