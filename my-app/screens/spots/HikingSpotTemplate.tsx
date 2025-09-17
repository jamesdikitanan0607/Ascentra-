import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  StatusBar,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { supabase } from '../../services/supabaseClient';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useProfile } from '../../contexts/ProfileContext';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageCarousel } from '../../components/ImageCarousel';
import TrailMap from '../../components/TrailMap';
import ReviewSystem from '../../components/ReviewSystem';
import { getTrailRoutesBySpotId, TrailRouteDetails } from '../../services/supabaseService';

const { width, height } = Dimensions.get('window');

// Define a consistent color palette
const COLORS = {
  primary: '#388E3C',
  secondary: '#388E3C',
  text: '#212121',
  textLight: '#616161',
  textMuted: '#9E9E9E',
  background: '#FFFFFF',
  card: '#F9F9F9',
  separator: '#EEEEEE',
  star: '#388E3C',
  error: '#F44336',
  success: '#4CAF50',
  mapPlaceholder: '#F5F5F5'
};

interface HikingSpotData {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  elevation: number;
  trail_length: number;
  estimated_duration: string;
  latitude: number;
  longitude: number;
  rating: number;
  review_count: number;
  image_url: string;
  amenities: string[];
  best_season: string[];
  highlights: string[];
  tips: string[];
  imageSource: any;
}

interface HikingSpotTemplateProps {
  navigation: any;
  spotData: HikingSpotData;
}

export default function HikingSpotTemplate({ navigation, spotData }: HikingSpotTemplateProps) {
  const [loading, setLoading] = useState(true);
  const [trailRoutes, setTrailRoutes] = useState<TrailRouteDetails[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<TrailRouteDetails | null>(null);
  const [trailRoutesLoading, setTrailRoutesLoading] = useState(true);
  const [trailRoutesError, setTrailRoutesError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  
  // Profile context for favorites functionality
  const { addToFavorites, removeFromFavorites, isSpotFavorited, favoritesLoading } = useProfile();

  const getImageSource = () => {
    return spotData.imageSource;
  };

  useEffect(() => {
    fetchTrailRoutes();
    fetchWeatherData();
    setLoading(false);
  }, []);

  async function fetchTrailRoutes() {
    setTrailRoutesLoading(true);
    setTrailRoutesError(null);
    try {
      const routes = await getTrailRoutesBySpotId(spotData.id);
      setTrailRoutes(routes || []);
      if (routes && routes.length > 0) {
        setSelectedRoute(routes[0]);
      }
    } catch (error) {
      console.error('Error fetching trail routes:', error);
      setTrailRoutesError('Failed to load trail routes. Please try again later.');
    } finally {
      setTrailRoutesLoading(false);
    }
  }



  const handleFavoriteToggle = async () => {
    if (favoritesLoading) return;
    
    try {
      const isCurrentlyFavorited = isSpotFavorited(spotData.id);
      if (isCurrentlyFavorited) {
        await removeFromFavorites(spotData.id);
      } else {
        await addToFavorites({
          ...spotData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      // Error toggling favorite
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const openDirections = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${spotData.latitude},${spotData.longitude}`,
      android: `geo:0,0?q=${spotData.latitude},${spotData.longitude}`
    });
    
    Linking.openURL(url);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesome
          key={i}
          name={i <= rating ? 'star' : 'star-o'}
          size={16}
          color={COLORS.star}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return '#4CAF50'; // Green
      case 'moderate':
        return '#FF9800'; // Orange
      case 'hard':
      case 'very hard':
        return '#F44336'; // Red
      case 'expert':
        return '#9C27B0'; // Purple
      default:
        return '#757575'; // Gray
    }
  };

  const fetchWeatherData = async () => {
    if (!spotData?.latitude || !spotData?.longitude) return;
    
    setWeatherLoading(true);
    try {
      // Using OpenWeatherMap API (free alternative to AccuWeather)
      // For production, get API key from environment variables
      const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || 'demo_key';
      
      if (API_KEY === 'demo_key') {
        // Use mock weather data when no API key is available
        const mockWeatherData = {
          temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
          condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
          humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
          windSpeed: Math.floor(Math.random() * 10) + 5, // 5-15 km/h
          icon: ['☀️', '⛅', '☁️', '🌧️'][Math.floor(Math.random() * 4)]
        };
        setWeatherData(mockWeatherData);
      } else {
        // Real API call when API key is available
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${spotData.latitude}&lon=${spotData.longitude}&appid=${API_KEY}&units=metric`
        );
        
        if (response.ok) {
          const data = await response.json();
          const weatherData = {
            temperature: Math.round(data.main.temp),
            condition: data.weather[0].main,
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
            icon: getWeatherIcon(data.weather[0].main)
          };
          setWeatherData(weatherData);
        } else {
          throw new Error('Weather API request failed');
        }
      }
    } catch (error) {
      // Error fetching weather data
      // Fallback to mock data on error
      const mockWeatherData = {
        temperature: 25,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 8,
        icon: '⛅'
      };
      setWeatherData(mockWeatherData);
    } finally {
      setWeatherLoading(false);
    }
  };

  const getWeatherIcon = (condition: string): string => {
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
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading {spotData.name} details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section with Image Carousel */}
        <View style={styles.imageContainer}>
          <ImageCarousel
            spotName={spotData.name}
            customImages={null} // Let it use all 5 images from imageHelpers
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageOverlay}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.heroContent}>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>{spotData.name}</Text>
              <View style={styles.heroRating}>
                {renderStars(Math.floor(spotData.rating))}
                <Text style={styles.heroRatingText}>
                  {spotData.rating} ({spotData.review_count} reviews)
                </Text>
              </View>
              <View style={styles.heroLocation}>
                <MaterialIcons name="location-on" size={16} color="white" />
                <Text style={styles.heroLocationText}>
                  {spotData.latitude.toFixed(4)}, {spotData.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Basic Trail Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trail Information</Text>
            <View style={styles.trailInfoGrid}>
              <View style={styles.trailInfoCard}>
                <MaterialIcons name="straighten" size={24} color={COLORS.primary} />
                <Text style={styles.trailInfoValue}>{spotData.trail_length}km</Text>
                <Text style={styles.trailInfoLabel}>Distance</Text>
              </View>
              <View style={styles.trailInfoCard}>
                <MaterialIcons name="terrain" size={24} color={COLORS.primary} />
                <Text style={styles.trailInfoValue}>{spotData.elevation}m</Text>
                <Text style={styles.trailInfoLabel}>Elevation</Text>
              </View>
              <View style={styles.trailInfoCard}>
                <MaterialIcons name="fitness-center" size={24} color={COLORS.primary} />
                <Text style={styles.trailInfoValue}>{spotData.difficulty}</Text>
                <Text style={styles.trailInfoLabel}>Difficulty</Text>
              </View>
            </View>
          </View>

          {/* Add to Favorites Section */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={[
                styles.favoriteButton,
                isSpotFavorited(spotData.id) && styles.favoriteButtonActive
              ]}
              onPress={handleFavoriteToggle}
              disabled={favoritesLoading}
            >
              <Ionicons 
                name={isSpotFavorited(spotData.id) ? 'heart' : 'heart-outline'} 
                size={24} 
                color={isSpotFavorited(spotData.id) ? '#FF6B6B' : COLORS.primary} 
              />
              <Text style={[
                styles.favoriteButtonText,
                isSpotFavorited(spotData.id) && styles.favoriteButtonTextActive
              ]}>
                {isSpotFavorited(spotData.id) ? 'Remove from Favorites' : 'Add to Favorites'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{spotData.description}</Text>
          </View>

          {/* Trail Map Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trail Map</Text>
            <View style={styles.mapSection}>
              {trailRoutesLoading ? (
                <View style={styles.trailRoutesLoadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.trailRoutesLoadingText}>Loading trail routes...</Text>
                </View>
              ) : trailRoutesError ? (
                <View style={styles.trailRoutesErrorContainer}>
                  <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
                  <Text style={styles.trailRoutesErrorText}>{trailRoutesError}</Text>
                  <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={fetchTrailRoutes}
                  >
                    <MaterialIcons name="refresh" size={20} color="white" />
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : trailRoutes.length > 0 ? (
                <TrailMap
                  routes={trailRoutes}
                  selectedRoute={selectedRoute}
                  onRouteSelect={setSelectedRoute}
                  centerCoordinates={{
                    latitude: spotData.latitude,
                    longitude: spotData.longitude,
                  }}
                />
              ) : (
                <View style={styles.noRouteMapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: spotData.latitude,
                      longitude: spotData.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: spotData.latitude,
                        longitude: spotData.longitude,
                      }}
                      title={spotData.name}
                      description={spotData.description}
                    />
                  </MapView>
                  <View style={styles.noRouteOverlay}>
                    <Text style={styles.noRouteText}>No trail routes available yet</Text>
                    <Text style={styles.noRouteSubtext}>Check back later for detailed trail maps</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Trail Routes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trail Routes</Text>
            {trailRoutesLoading ? (
              <View style={styles.trailRoutesLoadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.trailRoutesLoadingText}>Loading trail routes...</Text>
              </View>
            ) : trailRoutesError ? (
              <View style={styles.trailRoutesErrorContainer}>
                <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
                <Text style={styles.trailRoutesErrorText}>{trailRoutesError}</Text>
                <TouchableOpacity 
                  style={styles.retryButton} 
                  onPress={fetchTrailRoutes}
                >
                  <MaterialIcons name="refresh" size={20} color="white" />
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.routesContainer}>
                {trailRoutes.length > 0 ? (
                  trailRoutes.map((route, index) => (
                  <TouchableOpacity
                    key={route.id || index}
                    style={[
                      styles.routeButton,
                      { backgroundColor: getDifficultyColor(route.difficulty || 'moderate') },
                      selectedRoute?.id === route.id && styles.selectedRouteButton
                    ]}
                    onPress={() => setSelectedRoute(route)}
                  >
                    <Text style={styles.routeButtonText}>{route.name || `Route ${index + 1}`}</Text>
                    <Text style={styles.routeDifficultyText}>{route.difficulty || 'Moderate'}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                // Default routes if none exist
                ['Main Trail', 'Summit Route', 'Scenic Path', 'Advanced Trail', 'Expert Route'].map((routeName, index) => {
                  const difficulties = ['Easy', 'Moderate', 'Hard', 'Very Hard', 'Expert'];
                  const difficulty = difficulties[index];
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.routeButton,
                        { backgroundColor: getDifficultyColor(difficulty) }
                      ]}
                      onPress={() => {}}
                    >
                      <Text style={styles.routeButtonText}>{routeName}</Text>
                      <Text style={styles.routeDifficultyText}>{difficulty}</Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>

          {/* Trail Information Section */}
          {selectedRoute && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trail Information</Text>
              <View style={styles.trailInfoContainer}>
                <Text style={styles.trailInfoTitle}>{selectedRoute.name || 'Selected Route'}</Text>
                {selectedRoute.highlights && (
                  <View style={styles.trailHighlights}>
                    <Text style={styles.trailHighlightsTitle}>Highlights:</Text>
                    <Text style={styles.trailHighlightsText}>{selectedRoute.highlights}</Text>
                  </View>
                )}
                {selectedRoute.description && (
                  <View style={styles.trailDescription}>
                    <Text style={styles.trailDescriptionTitle}>Description:</Text>
                    <Text style={styles.trailDescriptionText}>{selectedRoute.description}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Weather Condition Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weather Condition</Text>
            {weatherLoading ? (
              <View style={styles.weatherLoadingContainer}>
                <Text style={styles.weatherLoadingText}>Loading weather data...</Text>
              </View>
            ) : weatherData ? (
              <View style={styles.weatherContainer}>
                <View style={styles.weatherHeader}>
                  <Text style={styles.weatherIcon}>{weatherData.icon}</Text>
                  <View style={styles.weatherMainInfo}>
                    <Text style={styles.weatherTemperature}>{weatherData.temperature}°C</Text>
                    <Text style={styles.weatherCondition}>{weatherData.condition}</Text>
                  </View>
                </View>
                
                <View style={styles.weatherDetails}>
                  <View style={styles.weatherDetailItem}>
                    <Ionicons name="water-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.weatherDetailText}>Humidity: {weatherData.humidity}%</Text>
                  </View>
                  <View style={styles.weatherDetailItem}>
                    <Ionicons name="leaf-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.weatherDetailText}>Wind: {weatherData.windSpeed} km/h</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.weatherErrorContainer}>
                <Text style={styles.weatherErrorText}>Weather data unavailable</Text>
              </View>
            )}
          </View>

          {/* Highlights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Highlights</Text>
            {spotData.highlights.map((highlight, index) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                <Text style={styles.listItemText}>{highlight}</Text>
              </View>
            ))}
          </View>

          {/* Tips Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hiking Tips</Text>
            {spotData.tips.map((tip, index) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="bulb" size={16} color={COLORS.primary} />
                <Text style={styles.listItemText}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* Amenities Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {spotData.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityTag}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Trail Map Section */}
          {trailRoutes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trail Map</Text>
              <TrailMap
                routes={trailRoutes}
                selectedRoute={selectedRoute}
                onRouteSelect={setSelectedRoute}
                centerCoordinates={{
                  latitude: spotData.latitude,
                  longitude: spotData.longitude
                }}
              />
            </View>
          )}



          {/* Reviews Section */}
          <View style={styles.section}>
            <ReviewSystem 
              hikingSpotId={spotData.id} 
              onReviewAdded={() => {
                // Optionally refresh hiking spot data to update average rating
                // Review added successfully
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: COLORS.textLight,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  imageContainer: {
    position: 'relative',
    height: 300,
    width: '100%',
  },
  heroImage: {
    height: '100%',
    width: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 35,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroTextContainer: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 16,
    padding: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroRatingText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLocationText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '400',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  contentContainer: {
    padding: 24,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  trailInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  trailInfoCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  trailInfoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  trailInfoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  favoriteButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: '#FF6B6B',
  },
  favoriteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  favoriteButtonTextActive: {
    color: '#FF6B6B',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listItemText: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.text,
    marginLeft: 12,
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  amenityText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  mapSection: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    elevation: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  map: {
    height: 200,
    width: '100%',
  },
  directionsButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    margin: 12,
    borderRadius: 30,
    elevation: 0,
  },
  directionsButtonText: {
    color: 'white',
    fontWeight: '600',
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },

  routesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  routeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 8,
    minWidth: 120,
    alignItems: 'center',
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedRouteButton: {
    borderWidth: 2,
    borderColor: COLORS.text,
  },
  routeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  routeDifficultyText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  trailInfoContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  trailInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  trailHighlights: {
    marginBottom: 12,
  },
  trailHighlightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  trailHighlightsText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  trailDescription: {
    marginBottom: 8,
  },
  trailDescriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  trailDescriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  weatherContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  weatherLoadingContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  weatherLoadingText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  weatherErrorContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  weatherErrorText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  weatherMainInfo: {
    flex: 1,
  },
  weatherTemperature: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  weatherCondition: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.separator,
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  weatherDetailText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  noRouteMapContainer: {
    position: 'relative',
  },
  noRouteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  noRouteText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  noRouteSubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  trailRoutesLoadingContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  trailRoutesLoadingText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  trailRoutesErrorContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  trailRoutesErrorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
});