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
    difficulty: 'Easy' | 'Moderate' | 'Hard';
    distance_km: number;
    elevation_gain_m: number;
    estimated_time_hours: number;
    waypoints: {
        latitude: number;
        longitude: number;
        elevation?: number;
    }[];
    color?: string;
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
