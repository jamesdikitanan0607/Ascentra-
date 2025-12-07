import { hikingSpots } from '../data/hikingSpots';
import { HIKING_SPOTS_DATA, HikingSpotData } from '../data/hikingSpotData';

/**
 * Unified hiking spot data that combines basic info from hikingSpots.js
 * with comprehensive details from hikingSpotData.ts
 */
export interface UnifiedHikingSpot {
    // Core identifiers
    id: string;
    hiking_spot_id?: string;

    // Basic info (from hikingSpots.js)
    name: string;
    slug?: string;
    thumbnail?: any;
    latitude: number;
    longitude: number;
    average_rating: number;
    rating_count: number;
    difficulty: string;
    distance_km?: number;
    elevation_gain_m?: number;

    // Comprehensive details (from hikingSpotData.ts)
    description?: string;
    elevation?: number;
    trail_length?: number;
    estimated_duration?: string;
    rating?: number;
    review_count?: number;
    image_url?: string;
    amenities?: string[];
    best_season?: string[];
    highlights?: string[];
    tips?: string[];
    imageSource?: any;
}

/**
 * Get unified hiking spot data by ID
 * Merges data from both hikingSpots.js and hikingSpotData.ts
 */
export function getUnifiedHikingSpotById(id: string): UnifiedHikingSpot | undefined {
    // Get basic data from hikingSpots.js
    const basicData = hikingSpots.find(spot => spot.id === id);

    // Get comprehensive data from hikingSpotData.ts
    const comprehensiveData = HIKING_SPOTS_DATA.find(spot => spot.id === id);

    // If neither exists, return undefined
    if (!basicData && !comprehensiveData) {
        return undefined;
    }

    // Merge the data, preferring basicData for thumbnails and core fields
    const unified: UnifiedHikingSpot = {
        id: id,
        hiking_spot_id: id,
        name: basicData?.name || comprehensiveData?.name || '',
        slug: basicData?.slug,
        thumbnail: basicData?.thumbnail || comprehensiveData?.imageSource,
        latitude: basicData?.latitude || comprehensiveData?.latitude || 0,
        longitude: basicData?.longitude || comprehensiveData?.longitude || 0,
        average_rating: basicData?.average_rating || comprehensiveData?.rating || 0,
        rating_count: basicData?.rating_count || comprehensiveData?.review_count || 0,
        difficulty: basicData?.difficulty || comprehensiveData?.difficulty || 'Moderate',
        distance_km: basicData?.distance_km || comprehensiveData?.trail_length,
        elevation_gain_m: basicData?.elevation_gain_m || comprehensiveData?.elevation,

        // Add comprehensive details if available
        description: comprehensiveData?.description,
        elevation: comprehensiveData?.elevation,
        trail_length: comprehensiveData?.trail_length,
        estimated_duration: comprehensiveData?.estimated_duration,
        rating: comprehensiveData?.rating,
        review_count: comprehensiveData?.review_count,
        image_url: comprehensiveData?.image_url,
        amenities: comprehensiveData?.amenities,
        best_season: comprehensiveData?.best_season,
        highlights: comprehensiveData?.highlights,
        tips: comprehensiveData?.tips,
        imageSource: comprehensiveData?.imageSource || basicData?.thumbnail,
    };

    return unified;
}

/**
 * Get all unified hiking spots
 */
export function getAllUnifiedHikingSpots(): UnifiedHikingSpot[] {
    // Get all unique IDs from both sources
    const allIds = new Set([
        ...hikingSpots.map(spot => spot.id),
        ...HIKING_SPOTS_DATA.map(spot => spot.id)
    ]);

    // Map each ID to unified data
    const unifiedSpots = Array.from(allIds)
        .map(id => getUnifiedHikingSpotById(id))
        .filter((spot): spot is UnifiedHikingSpot => spot !== undefined);

    return unifiedSpots;
}

/**
 * Get unified hiking spot by name (case-insensitive, fuzzy match)
 */
export function getUnifiedHikingSpotByName(name: string): UnifiedHikingSpot | undefined {
    const normalize = (str: string) => str?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
    const targetName = normalize(name);

    const allSpots = getAllUnifiedHikingSpots();
    return allSpots.find(spot => normalize(spot.name) === targetName);
}

/**
 * Get top rated unified hiking spots
 */
export function getTopRatedUnifiedSpots(limit: number = 5): UnifiedHikingSpot[] {
    return getAllUnifiedHikingSpots()
        .sort((a, b) => b.average_rating - a.average_rating)
        .slice(0, limit);
}
