import { supabase } from './supabaseClient';
import { Database } from '../types/database';

type HikingSpot = Database['public']['Tables']['hiking_spots']['Row'];
type TrailRoute = Database['public']['Tables']['trail_routes']['Row'];

export interface HikingSpotWithRoutes extends HikingSpot {
  trail_routes?: TrailRoute[];
}

export interface TopRatedSpot {
  id: number;
  name: string;
  coordinates: any;
  description: string;
  cover_image_url: string;
  average_rating: number;
  number_of_reviews: number;
}

export interface TrailRouteDetails {
  route_id: number;
  hiking_spot_id: number;
  route_name: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Advanced';
  start_coordinates: any;
  end_coordinates?: any;
  route_coordinates?: any[];
  distance_km: number;
  elevation_gain_m: number;
  estimated_duration_hr: number;
  highlights: string;
  geojson_path: any;
  route_color: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch top-rated hiking spots ordered by average rating
 * @param limit Number of spots to fetch (default: 10)
 * @returns Promise<TopRatedSpot[]>
 */
export async function getTopRatedHikingSpots(limit: number = 10): Promise<TopRatedSpot[]> {
  try {
    const { data, error } = await supabase
      .from('hiking_spots')
      .select('*')
      .order('average_rating', { ascending: false })
      .limit(limit);

    if (error) {
      // Error fetching top-rated hiking spots
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch top-rated hiking spots:', error);
    throw error;
  }
}

/**
 * Fetch a specific hiking spot by ID with its trail routes
 * @param hikingSpotId The ID of the hiking spot
 * @returns Promise<HikingSpotWithRoutes | null>
 */
export async function getHikingSpotWithRoutes(hikingSpotId: number): Promise<HikingSpotWithRoutes | null> {
  try {
    // Convert app ID to database ID
    const dbId = mapAppIdToDbId(hikingSpotId);
    
    // First try with hiking_spot_id, then fallback to id
    let data, error;
    
    // Try with hiking_spot_id column
    const result1 = await supabase
      .from('hiking_spots')
      .select(`
        *,
        trail_routes (*)
      `)
      .eq('hiking_spot_id', dbId)
      .single();
    
    if (result1.error && result1.error.code === '42703') {
      // Column doesn't exist, try with id column
      const result2 = await supabase
        .from('hiking_spots')
        .select(`
          *,
          trail_routes (*)
        `)
        .eq('id', dbId)
        .single();
      
      data = result2.data;
      error = result2.error;
    } else {
      data = result1.data;
      error = result1.error;
    }

    if (error) {
      console.error('Error fetching hiking spot with routes:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch hiking spot with routes:', error);
    throw error;
  }
}

/**
 * Fetch all trail routes for a specific hiking spot
 * @param hikingSpotId The ID of the hiking spot
 * @returns Promise<TrailRouteDetails[]>
 */
export async function getTrailRoutesByHikingSpot(hikingSpotId: number): Promise<TrailRouteDetails[]> {
  try {
    const { data, error } = await supabase
      .from('trail_routes')
      .select('*')
      .eq('hiking_spot_id', hikingSpotId) // Fixed: use hiking_spot_id instead of id
      .order('difficulty', { ascending: true }); // Order by difficulty: Easy -> Advanced

    if (error) {
      console.error('Error fetching trail routes:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch trail routes:', error);
    throw error;
  }
}

/**
 * Fetch a specific trail route by ID
 * @param routeId The ID of the trail route
 * @returns Promise<TrailRouteDetails | null>
 */
export async function getTrailRoute(routeId: number): Promise<TrailRouteDetails | null> {
  try {
    const { data, error } = await supabase
      .from('trail_routes')
      .select('*')
      .eq('route_id', routeId)
      .single();

    if (error) {
      console.error('Error fetching trail route:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch trail route:', error);
    throw error;
  }
}

/**
 * Fetch all hiking spots (for general listing)
 * @returns Promise<HikingSpot[]>
 */
export async function getAllHikingSpots(): Promise<HikingSpot[]> {
  try {
    const { data, error } = await supabase
      .from('hiking_spots')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      // Error fetching all hiking spots
      throw error;
    }

    return data || [];
  } catch (error) {
    // Failed to fetch all hiking spots
    throw error;
  }
}

/**
 * Search hiking spots by name or description
 * @param searchTerm The search term
 * @returns Promise<HikingSpot[]>
 */
export async function searchHikingSpots(searchTerm: string): Promise<HikingSpot[]> {
  try {
    const { data, error } = await supabase
      .from('hiking_spots')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('average_rating', { ascending: false });

    if (error) {
      console.error('Error searching hiking spots:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to search hiking spots:', error);
    throw error;
  }
}

/**
 * Get hiking spots by difficulty level
 * @param difficulty The difficulty level to filter by
 * @returns Promise<HikingSpot[]>
 */
export async function getHikingSpotsByDifficulty(difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Advanced'): Promise<HikingSpot[]> {
  try {
    const { data, error } = await supabase
      .from('hiking_spots')
      .select(`
        *,
        trail_routes!inner(*)
      `)
      .eq('trail_routes.difficulty', difficulty)
      .order('average_rating', { ascending: false });

    if (error) {
      console.error('Error fetching hiking spots by difficulty:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch hiking spots by difficulty:', error);
    throw error;
  }
}

/**
 * Update hiking spot rating (for future use)
 * @param hikingSpotId The ID of the hiking spot
 * @param newRating The new rating to add
 * @returns Promise<boolean>
 */
export async function updateHikingSpotRating(hikingSpotId: number, newRating: number): Promise<boolean> {
  try {
    // First, get current rating data
    const { data: currentData, error: fetchError } = await supabase
      .from('hiking_spots')
      .select('average_rating, number_of_reviews')
      .eq('id', hikingSpotId)
      .single();

    if (fetchError) {
      console.error('Error fetching current rating data:', fetchError);
      throw fetchError;
    }

    // Calculate new average rating
    const currentAverage = currentData.average_rating || 0;
    const currentReviews = currentData.number_of_reviews || 0;
    const newReviewCount = currentReviews + 1;
    const newAverage = ((currentAverage * currentReviews) + newRating) / newReviewCount;

    // Update the hiking spot with new rating data
    const { error: updateError } = await supabase
      .from('hiking_spots')
      .update({
        average_rating: Math.round(newAverage * 10) / 10, // Round to 1 decimal place
        number_of_reviews: newReviewCount
      })
      .eq('id', hikingSpotId);

    if (updateError) {
      console.error('Error updating hiking spot rating:', updateError);
      throw updateError;
    }

    return true;
  } catch (error) {
    console.error('Failed to update hiking spot rating:', error);
    throw error;
  }
}

/**
 * Map app IDs (1-15) to database IDs (31-45)
 * This is needed because the app uses sequential IDs but the database has different IDs
 */
function mapAppIdToDbId(appId: string | number): number {
  const id = typeof appId === 'string' ? parseInt(appId) : appId;
  // Map app IDs 1-15 to database IDs 31-45
  return id + 30;
}

/**
 * Fetch a specific hiking spot by ID
 * @param hikingSpotId The ID of the hiking spot (can be string or number)
 * @returns Promise<HikingSpot | null>
 */
export async function getHikingSpotById(hikingSpotId: string | number): Promise<HikingSpot | null> {
  try {
    // Convert app ID to database ID
    const dbId = mapAppIdToDbId(hikingSpotId);

    const { data, error } = await supabase
      .from('hiking_spots')
      .select('*')
      .eq('hiking_spot_id', dbId)
      .single();

    if (error) {
      console.error('Error fetching hiking spot by ID:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch hiking spot by ID:', error);
    throw error;
  }
}

/**
 * Fetch all trail routes for a specific hiking spot (alias for getTrailRoutesByHikingSpot)
 * @param spotId The ID of the hiking spot
 * @returns Promise<TrailRouteDetails[]>
 */
export async function getTrailRoutesBySpotId(spotId: string): Promise<TrailRouteDetails[]> {
  const dbId = mapAppIdToDbId(parseInt(spotId));
  return getTrailRoutesByHikingSpot(dbId);
}

/**
 * Get coordinates for a hiking spot (for weather API)
 * @param hikingSpotId The ID of the hiking spot
 * @returns Promise<{latitude: number, longitude: number} | null>
 */
export async function getHikingSpotCoordinates(hikingSpotId: number): Promise<{latitude: number, longitude: number} | null> {
  try {
    const { data, error } = await supabase
      .from('hiking_spots')
      .select('coordinates')
      .eq('id', hikingSpotId)
      .single();

    if (error) {
      console.error('Error fetching hiking spot coordinates:', error);
      throw error;
    }

    if (data?.coordinates) {
      // Assuming coordinates are stored as POINT(longitude, latitude)
      // You may need to adjust this based on your actual data structure
      return {
        latitude: data.coordinates.coordinates[1],
        longitude: data.coordinates.coordinates[0]
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch hiking spot coordinates:', error);
    throw error;
  }
}

// =====================================================
// WEATHER SYSTEM FUNCTIONS
// =====================================================

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

/**
 * Get weather data with caching from Supabase
 * @param latitude The latitude coordinate
 * @param longitude The longitude coordinate
 * @returns Promise<WeatherData>
 */
export async function getWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
  try {
    // First, check if we have cached weather data that's still valid
    const { data: cachedData, error: cacheError } = await supabase
      .from('weather_cache')
      .select('*')
      .eq('latitude', latitude)
      .eq('longitude', longitude)
      .gt('expires_at', new Date().toISOString())
      .order('cached_at', { ascending: false })
      .limit(1)
      .single();

    if (!cacheError && cachedData) {
      // Return cached data if it's still valid
      return {
        temperature: cachedData.temperature,
        condition: cachedData.weather_condition,
        humidity: cachedData.humidity,
        windSpeed: Math.round(cachedData.wind_speed * 3.6), // Convert m/s to km/h
        icon: getWeatherIcon(cachedData.weather_condition)
      };
    }

    // If no valid cache, fetch from OpenWeatherMap API
    const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
    
    if (!API_KEY || API_KEY === 'your_openweather_api_key_here') {
      // Return mock data when no API key is available
      const mockWeatherData = {
        temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
        condition: ['Clear', 'Clouds', 'Rain', 'Drizzle'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 10) + 5, // 5-15 km/h
        icon: getWeatherIcon(['Clear', 'Clouds', 'Rain', 'Drizzle'][Math.floor(Math.random() * 4)])
      };
      return mockWeatherData;
    }

    // Fetch from OpenWeatherMap API
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();
    
    const weatherData: WeatherData = {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      icon: getWeatherIcon(data.weather[0].main)
    };

    // Cache the weather data in Supabase
    try {
      await supabase
        .from('weather_cache')
        .insert({
          latitude,
          longitude,
          weather_data: data,
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          wind_speed: data.wind.speed, // Store in m/s
          weather_condition: weatherData.condition,
          visibility: data.visibility ? data.visibility / 1000 : null, // Convert to km
          uv_index: data.uvi || null,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
        });
    } catch (cacheInsertError) {
      console.error('Failed to cache weather data:', cacheInsertError);
      // Continue anyway, we have the weather data
    }

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    // Return fallback mock data on error
    return {
      temperature: 25,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 8,
      icon: getWeatherIcon('Clouds')
    };
  }
}

/**
 * Get weather icon based on condition
 * @param condition The weather condition
 * @returns string Weather icon emoji
 */
function getWeatherIcon(condition: string): string {
  switch (condition.toLowerCase()) {
    case 'clear':
      return '☀️';
    case 'clouds':
      return '☁️';
    case 'rain':
      return '🌧️';
    case 'drizzle':
      return '🌦️';
    case 'thunderstorm':
      return '⛈️';
    case 'snow':
      return '❄️';
    case 'mist':
    case 'fog':
      return '🌫️';
    default:
      return '⛅';
  }
}

/**
 * Clean up expired weather cache entries
 * @returns Promise<boolean>
 */
export async function cleanupExpiredWeatherCache(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('weather_cache')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Error cleaning up weather cache:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to cleanup weather cache:', error);
    return false;
  }
}

// =====================================================
// REVIEWS SYSTEM FUNCTIONS
// =====================================================

export interface Review {
  id: string;
  user_id: string;
  hiking_spot_id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

/**
 * Fetch all reviews for a hiking spot with user information
 * @param hikingSpotId The ID of the hiking spot
 * @returns Promise<Review[]>
 */
export async function getReviewsForHikingSpot(hikingSpotId: number): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles!reviews_user_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .eq('hiking_spot_id', hikingSpotId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
}

/**
 * Get review statistics for a hiking spot
 * @param hikingSpotId The ID of the hiking spot
 * @returns Promise<ReviewStats>
 */
export async function getReviewStats(hikingSpotId: number): Promise<ReviewStats> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('hiking_spot_id', hikingSpotId);

    if (error) {
      console.error('Error fetching review stats:', error);
      throw error;
    }

    const reviews = data || [];
    const totalReviews = reviews.length;
    
    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      const rating = review.rating as keyof typeof ratingDistribution;
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating]++;
      }
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingDistribution
    };
  } catch (error) {
    console.error('Failed to fetch review stats:', error);
    throw error;
  }
}

/**
 * Submit a new review for a hiking spot
 * @param hikingSpotId The ID of the hiking spot
 * @param userId The ID of the user
 * @param rating The rating (1-5)
 * @param comment The review comment
 * @returns Promise<Review>
 */
export async function submitReview(
  hikingSpotId: number,
  userId: string,
  rating: number,
  comment: string
): Promise<Review> {
  try {
    // Check if user already reviewed this spot
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('hiking_spot_id', hikingSpotId)
      .eq('user_id', userId)
      .single();

    if (existingReview) {
      throw new Error('You have already reviewed this hiking spot');
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        hiking_spot_id: hikingSpotId,
        user_id: userId,
        rating,
        comment: comment.trim(),
      })
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error submitting review:', error);
      throw error;
    }

    return {
      ...data,
      user_name: data.profiles?.full_name || 'Anonymous User',
      user_avatar: data.profiles?.avatar_url,
    };
  } catch (error) {
    console.error('Failed to submit review:', error);
    throw error;
  }
}

/**
 * Update an existing review
 * @param reviewId The ID of the review
 * @param userId The ID of the user (for authorization)
 * @param rating The new rating (1-5)
 * @param comment The new review comment
 * @returns Promise<Review>
 */
export async function updateReview(
  reviewId: string,
  userId: string,
  rating: number,
  comment: string
): Promise<Review> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        rating,
        comment: comment.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .eq('user_id', userId) // Ensure user can only update their own review
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error updating review:', error);
      throw error;
    }

    return {
      ...data,
      user_name: data.profiles?.full_name || 'Anonymous User',
      user_avatar: data.profiles?.avatar_url,
    };
  } catch (error) {
    console.error('Failed to update review:', error);
    throw error;
  }
}

/**
 * Delete a review
 * @param reviewId The ID of the review
 * @param userId The ID of the user (for authorization)
 * @returns Promise<boolean>
 */
export async function deleteReview(reviewId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId); // Ensure user can only delete their own review

    if (error) {
      console.error('Error deleting review:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete review:', error);
    throw error;
  }
}

/**
 * Get a user's review for a specific hiking spot
 * @param hikingSpotId The ID of the hiking spot
 * @param userId The ID of the user
 * @returns Promise<Review | null>
 */
export async function getUserReviewForSpot(hikingSpotId: number, userId: string): Promise<Review | null> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('hiking_spot_id', hikingSpotId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No review found
        return null;
      }
      console.error('Error fetching user review:', error);
      throw error;
    }

    return {
      ...data,
      user_name: data.profiles?.full_name || 'Anonymous User',
      user_avatar: data.profiles?.avatar_url,
    };
  } catch (error) {
    console.error('Failed to fetch user review:', error);
    throw error;
  }
}