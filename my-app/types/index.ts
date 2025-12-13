export interface HikingSpot {
    id: string;
    name: string;
    description: string;
    image_url: string;
    latitude: number;
    longitude: number;
    difficulty: 'Easy' | 'Moderate' | 'Hard';
    elevation: number;
    rating: number;
    review_count: number;
    location?: string;
    highlights?: string[];
    amenities?: string[];
    tips?: string[];
    best_season?: string[];
    trail_length?: number;
    estimated_duration?: string;
}

export interface TrailRoute {
    id: string;
    hiking_spot_id: string;
    name: string;
    difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Expert';
    distance_km: number;
    elevation_gain_m: number;
    estimated_time_hours: number;
    waypoints: {
        latitude: number;
        longitude: number;
        elevation?: number;
    }[];
    color?: string;
    // UI Properties (Optional to support UI usage)
    route_name?: string;
    distance?: number;
    elevation_gain?: number;
    estimated_duration?: number;
    route_description?: string;
    highlights?: string;
    start_coordinates?: { latitude: number; longitude: number };
    end_coordinates?: { latitude: number; longitude: number };
    coordinates?: number[][];
    route_color?: string;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
}

export interface Review {
    id: string;
    user_id: string;
    hiking_spot_id: string;
    rating: number;
    comment: string;
    created_at: string;
    user?: User;
}

export interface Profile {
    id: string;
    user_id: string;
    username: string;
    full_name: string;
    bio: string;
    avatar_url?: string;
    skill_level?: string;
    cover_photo_url?: string;
    total_km_traveled?: number;
    created_at?: string;
    updated_at?: string;
}

export interface FavoriteSpot extends HikingSpot {
    favorited_at: string;
    is_favorited: boolean;
    hiking_spot_id: string;
}
