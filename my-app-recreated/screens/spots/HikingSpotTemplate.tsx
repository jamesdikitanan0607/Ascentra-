import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageCarousel } from '../../my-app/components/ImageCarousel';
import { supabaseService, fetchTrailRoutes } from '../../my-app/services/supabaseService';

const { width: screenWidth } = Dimensions.get('window');

// Helper function for difficulty colors
const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return '#4CAF50';
    case 'moderate':
      return '#FF9800';
    case 'hard':
      return '#F44336';
    case 'very hard':
      return '#9C27B0';
    case 'expert':
      return '#212121';
    default:
      return '#FF9800';
  }
};

interface HikingSpotTemplateProps {
  navigation: any;
  spotData: SpotData;
}

interface SpotData {
  id: string;
  name: string;
  location?: string;
  difficulty: string;
  distance?: string;
  duration?: string;
  elevation?: string;
  description: string;
  images?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  trail_routes?: TrailRoute[];
  latitude: number;
  longitude: number;
  imageSource: any;
  amenities?: string[];
  best_season?: string[];
  highlights?: string[];
  tips?: string[];
}

interface TrailRoute {
  id: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  route_geometry: {
    coordinates: [number, number][];
  };
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const HikingSpotTemplate: React.FC<HikingSpotTemplateProps> = ({ navigation, spotData }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [routes, setRoutes] = useState<TrailRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    if (spotData) {
      fetchWeatherData();
      fetchRoutes();
      fetchReviews();
      setLoading(false);
    }
  }, [spotData]);

  const fetchRoutes = async () => {
    if (!spotData?.id) return;
    setRoutesLoading(true);
    const { data, error } = await fetchTrailRoutes(spotData.id);
    if (data) {
      setRoutes(data);
    }
    if (error) {
      Alert.alert('Error', 'Failed to fetch trail routes.');
    }
    setRoutesLoading(false);
  };

  const fetchReviews = async () => {
    try {
      const reviewsData = await supabaseService.getHikingSpotReviews(spotData.id);
      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchWeatherData = async () => {
    if (!spotData?.latitude || !spotData?.longitude) return;
    
    try {
      setWeatherLoading(true);
      const weather = await supabaseService.getWeatherData(
        spotData.latitude,
        spotData.longitude
      );
      setWeatherData(weather);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await supabaseService.removeFavorite(spotData.id);
      } else {
        await supabaseService.addFavorite(spotData.id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color="#FFD700"
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading hiking spot details...</Text>
      </View>
    );
  }

  if (!spotData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Hiking spot not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Carousel Hero Section */}
      <View style={styles.heroSection}>
        <ImageCarousel 
          images={spotData.images || [spotData.imageSource]} 
          height={300}
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>{spotData.name}</Text>
          <Text style={styles.heroLocation}>{spotData.location || 'Cebu, Philippines'}</Text>
        </View>
      </View>

      {/* Basic Trail Information Cards */}
      <View style={styles.trailInfoCards}>
        <View style={styles.infoCard}>
          <Ionicons name="trail-sign-outline" size={20} color="#2E7D32" />
          <Text style={styles.infoCardLabel}>Difficulty</Text>
          <Text style={[styles.infoCardValue, { color: getDifficultyColor(spotData.difficulty) }]}>
            {spotData.difficulty}
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="walk-outline" size={20} color="#2E7D32" />
          <Text style={styles.infoCardValue}>{spotData.distance || 'N/A'}</Text>
              <Text style={styles.infoCardLabel}>Distance</Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="time-outline" size={20} color="#2E7D32" />
          <Text style={styles.infoCardValue}>{spotData.duration || spotData.estimated_duration || 'N/A'}</Text>
              <Text style={styles.infoCardLabel}>Duration</Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="trending-up-outline" size={20} color="#2E7D32" />
          <Text style={styles.infoCardValue}>{spotData.elevation || (spotData.elevation ? `${spotData.elevation}m` : 'N/A')}</Text>
              <Text style={styles.infoCardLabel}>Elevation</Text>
        </View>
      </View>

      {/* Add to Favorites Section */}
      <View style={styles.favoritesSection}>
        <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#E91E63' : '#757575'}
          />
          <Text style={styles.favoriteButtonText}>
            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Description Section */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.descriptionText}>{spotData.description}</Text>
      </View>

      {/* Trail Map Section */}
      <View style={styles.mapSection}>
        <Text style={styles.sectionTitle}>Trail Map</Text>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={48} color="#757575" />
          <Text style={styles.mapPlaceholderText}>Interactive trail map coming soon</Text>
        </View>
      </View>

      {/* Trail Routes Section */}
      {spotData.trail_routes && spotData.trail_routes.length > 0 && (
        <View style={styles.routesSection}>
          <Text style={styles.sectionTitle}>Trail Routes</Text>
          <View style={styles.routesContainer}>
            {spotData.trail_routes.map((route) => (
              <TouchableOpacity
                key={route.id}
                style={[
                  styles.routeButton,
                  selectedTrail?.id === route.id && styles.selectedRouteButton
                ]}
                onPress={() => {
                  const normalizedTrail = normalizeTrailRoute(route);
                  setSelectedTrail(normalizedTrail);
                }}
              >
                <Text style={styles.routeButtonText}>{route.name}</Text>
                <Text style={[styles.routeDifficultyText, { color: getDifficultyColor(route.difficulty) }]}>
                  {route.difficulty}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Trail Information Section */}
      {selectedTrail && (
        <View style={styles.trailInfoContainer}>
          <View style={styles.trailInfoHeader}>
            <Text style={styles.trailInfoTitle}>{selectedTrail.name} Details</Text>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(selectedTrail.difficulty) }]}>
              <Text style={styles.difficultyBadgeText}>{selectedTrail.difficulty}</Text>
            </View>
          </View>
          
          {/* Enhanced Trail Statistics */}
          <View style={styles.trailStatsGrid}>
            <View style={styles.trailStatCard}>
              <Ionicons name="trail-sign" size={24} color="#2E7D32" />
              <Text style={styles.trailStatValue}>{selectedTrail.distance}km</Text>
              <Text style={styles.trailStatLabel}>Distance</Text>
            </View>
            <View style={styles.trailStatCard}>
              <Ionicons name="time" size={24} color="#2E7D32" />
              <Text style={styles.trailStatValue}>{Math.round(selectedTrail.estimatedTime / 60)}h</Text>
              <Text style={styles.trailStatLabel}>Duration</Text>
            </View>
            <View style={styles.trailStatCard}>
              <Ionicons name="trending-up" size={24} color="#2E7D32" />
              <Text style={styles.trailStatValue}>{selectedTrail.elevationGain}m</Text>
              <Text style={styles.trailStatLabel}>Elevation</Text>
            </View>
          </View>
          
          {/* Trail Highlights */}
          {selectedTrail.description && (
            <View style={styles.trailHighlights}>
              <Text style={styles.trailHighlightsTitle}>Trail Highlights</Text>
              <View style={styles.highlightsList}>
                <View style={styles.highlightItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                  <Text style={styles.trailHighlightsText}>{selectedTrail.description}</Text>
                </View>
              </View>
            </View>
          )}
          
          {/* Route Description */}
          {selectedTrail.description && (
            <View style={styles.trailDescription}>
              <Text style={styles.trailDescriptionTitle}>Route Description</Text>
              <Text style={styles.trailDescriptionText}>{selectedTrail.description}</Text>
            </View>
          )}
          
          {/* Trail Actions */}
          <View style={styles.trailActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => openDirections()}>
              <Ionicons name="navigate" size={20} color="white" />
              <Text style={styles.actionButtonText}>Get Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.secondaryActionButton]}>
              <Ionicons name="bookmark-outline" size={20} color="#2E7D32" />
              <Text style={[styles.actionButtonText, styles.secondaryActionButtonText]}>Save Route</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Weather Condition Section */}
      <View style={styles.weatherSection}>
        <Text style={styles.sectionTitle}>Current Weather</Text>
        {weatherLoading ? (
          <View style={styles.weatherLoading}>
            <ActivityIndicator size="small" color="#2E7D32" />
            <Text style={styles.weatherLoadingText}>Loading weather data...</Text>
          </View>
        ) : weatherData ? (
          <View style={styles.weatherContainer}>
            <View style={styles.weatherHeader}>
              <Ionicons name={weatherData.icon as any} size={32} color="#2E7D32" />
              <Text style={styles.weatherTemperature}>{weatherData.temperature}°C</Text>
            </View>
            <Text style={styles.weatherCondition}>{weatherData.condition}</Text>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetailItem}>
                <Ionicons name="water-outline" size={16} color="#757575" />
                <Text style={styles.weatherDetailText}>Humidity: {weatherData.humidity}%</Text>
              </View>
              <View style={styles.weatherDetailItem}>
                <Ionicons name="leaf-outline" size={16} color="#757575" />
                <Text style={styles.weatherDetailText}>Wind: {weatherData.windSpeed} km/h</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.weatherError}>
            <Text style={styles.weatherErrorText}>Unable to load weather data</Text>
          </View>
        )}
      </View>

      {/* Reviews Section */}
      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.user_name}</Text>
                <View style={styles.reviewRating}>{renderStars(review.rating)}</View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.reviewDate}>
                {new Date(review.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noReviewsText}>No reviews yet. Be the first to review!</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  heroSection: {
    position: 'relative',
    height: 300,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroLocation: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  trailInfoCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    minWidth: (screenWidth - 56) / 2,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoCardLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 8,
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  favoritesSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  favoriteButtonText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  descriptionContainer: {
    padding: 16,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666666',
  },
  mapSection: {
    padding: 16,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#757575',
  },
  routesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  routesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  routeButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedRouteButton: {
    backgroundColor: '#2E7D32',
  },
  routeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  routeDifficultyText: {
    fontSize: 12,
    marginTop: 2,
  },
  trailInfoContainer: {
    padding: 16,
    backgroundColor: '#F9F9F9',
    margin: 16,
    borderRadius: 12,
  },
  trailInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trailInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  difficultyBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  trailStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  trailStatCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trailStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
    marginBottom: 4,
  },
  trailStatLabel: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  trailHighlights: {
    marginBottom: 20,
  },
  trailHighlightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  highlightsList: {
    gap: 8,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trailHighlightsText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  trailDescription: {
    marginBottom: 20,
  },
  trailDescriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  trailDescriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
  },
  trailActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  secondaryActionButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  secondaryActionButtonText: {
    color: '#2E7D32',
  },
  weatherSection: {
    padding: 16,
  },
  weatherLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  weatherLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#757575',
  },
  weatherContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherTemperature: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 12,
  },
  weatherCondition: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherDetailText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  weatherError: {
    padding: 20,
    alignItems: 'center',
  },
  weatherErrorText: {
    fontSize: 14,
    color: '#F44336',
  },
  reviewsSection: {
    padding: 16,
  },
  reviewItem: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999999',
  },
  noReviewsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999999',
    fontStyle: 'italic',
    paddingVertical: 32,
  },
});

export default HikingSpotTemplate;