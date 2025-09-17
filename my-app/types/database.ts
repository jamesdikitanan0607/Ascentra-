export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      hiking_spots: {
        Row: {
          id: number
          name: string
          coordinates?: any // PostGIS POINT type
          description?: string
          cover_image_url?: string
          average_rating: number
          number_of_reviews: number
          difficulty?: string
          elevation?: number
          trail_length?: number
          estimated_duration?: number
          image_url?: string
          images?: any // JSONB
          amenities?: string[]
          best_season?: string[]
          created_by?: string
          is_verified: boolean
          rating?: number
          review_count?: number
          latitude?: number
          longitude?: number
          location_text?: string
          elevation_m?: number
          trail_length_km?: number
          estimated_duration_min?: number
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: number
          name: string
          coordinates?: any
          description?: string
          cover_image_url?: string
          average_rating?: number
          number_of_reviews?: number
          difficulty?: string
          elevation?: number
          trail_length?: number
          estimated_duration?: number
          image_url?: string
          images?: any
          amenities?: string[]
          best_season?: string[]
          created_by?: string
          is_verified?: boolean
          rating?: number
          review_count?: number
          latitude?: number
          longitude?: number
          location_text?: string
          elevation_m?: number
          trail_length_km?: number
          estimated_duration_min?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          coordinates?: any
          description?: string
          cover_image_url?: string
          average_rating?: number
          number_of_reviews?: number
          difficulty?: string
          elevation?: number
          trail_length?: number
          estimated_duration?: number
          image_url?: string
          images?: any
          amenities?: string[]
          best_season?: string[]
          created_by?: string
          is_verified?: boolean
          rating?: number
          review_count?: number
          latitude?: number
          longitude?: number
          location_text?: string
          elevation_m?: number
          trail_length_km?: number
          estimated_duration_min?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      trail_routes: {
        Row: {
          route_id: number
          hiking_spot_id: number
          route_name: string
          difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Advanced'
          start_coordinates: any // PostGIS POINT type
          end_coordinates?: any // PostGIS POINT type
          route_coordinates?: any[] // Array of coordinates for the trail path
          distance_km: number
          elevation_gain_m: number
          estimated_duration_hr: number
          highlights: string
          geojson_path: any // JSONB type for GeoJSON data
          route_color: string // Hex color code
          created_at?: string
          updated_at?: string
        }
        Insert: {
          route_id?: number
          hiking_spot_id: number
          route_name: string
          difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Advanced'
          start_coordinates: any
          end_coordinates?: any
          route_coordinates?: any[]
          distance_km: number
          elevation_gain_m: number
          estimated_duration_hr: number
          highlights: string
          geojson_path: any
          route_color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          route_id?: number
          hiking_spot_id?: number
          route_name?: string
          difficulty?: 'Easy' | 'Moderate' | 'Hard' | 'Advanced'
          start_coordinates?: any
          end_coordinates?: any
          route_coordinates?: any[]
          distance_km?: number
          elevation_gain_m?: number
          estimated_duration_hr?: number
          highlights?: string
          geojson_path?: any
          route_color?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trail_routes_hiking_spot_id_fkey"
            columns: ["hiking_spot_id"]
            referencedRelation: "hiking_spots"
            referencedColumns: ["hiking_spot_id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          hiking_spot_id: number
          rating: number
          comment: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          hiking_spot_id: number
          rating: number
          comment: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          hiking_spot_id?: number
          rating?: number
          comment?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_hiking_spot_id_fkey"
            columns: ["hiking_spot_id"]
            referencedRelation: "hiking_spots"
            referencedColumns: ["hiking_spot_id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      difficulty_level: 'Easy' | 'Moderate' | 'Hard' | 'Advanced'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type HikingSpot = Database['public']['Tables']['hiking_spots']['Row']
export type TrailRoute = Database['public']['Tables']['trail_routes']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type DifficultyLevel = Database['public']['Enums']['difficulty_level']