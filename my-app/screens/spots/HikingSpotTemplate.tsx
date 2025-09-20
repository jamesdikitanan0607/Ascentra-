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
import { WebView } from 'react-native-webview';
import { useProfile } from '../../contexts/ProfileContext';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageCarousel } from '../../components/ImageCarousel';
import TrailMap from '../../components/TrailMap';
import ReviewSystem from '../../components/ReviewSystem';
import TrailRoutesSlider from '../../components/TrailRoutesSlider';
import { getTrailRoutesBySpotId, TrailRouteDetails } from '../../services/supabaseService';

const { width, height } = Dimensions.get('window');

// Hero section height - responsive to screen size
const HERO_HEIGHT = Math.min(height * 0.45, 400); // 45% of screen height, max 400px

// Define a consistent color palette
const COLORS = {
  primary: '#2E7D32',
  secondary: '#2E7D32',
  text: '#1F2933',
  textLight: '#546E7A',
  textMuted: '#9BA4AF',
  background: '#FAFAF7',
  card: '#FFFFFF',
  separator: '#E6E8EB',
  star: '#2E7D32',
  error: '#F44336',
  success: '#4CAF50',
  mapPlaceholder: '#F5F5F5'
};

interface HikingSpotData {
  id: string;
  name: string;
  description?: string;
  difficulty: string;
  elevation: number;
  trail_length: number;
  estimated_duration: string;
  latitude: number;
  longitude: number;
  rating: number;
  review_count: number;
  image_url?: string;
  amenities: string[];
  best_season: string[];
  highlights: string[];
  tips: string[];
  imageSource?: any;
  location?: string; // Added: human-readable place name for pinned location
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface HikingSpotTemplateProps {
  navigation: any;
  spotData: HikingSpotData;
}

export default function HikingSpotTemplate({ navigation, spotData }: HikingSpotTemplateProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [trailRoutes, setTrailRoutes] = useState<TrailRouteDetails[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<TrailRouteDetails | null>(null);
  const [trailRoutesLoading, setTrailRoutesLoading] = useState(true);
  const [trailRoutesError, setTrailRoutesError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  
  // Profile context for favorites functionality
  const { addToFavorites, removeFromFavorites, isSpotFavorited, favoritesLoading } = useProfile();

  const getImageSource = () => {
    return spotData.imageSource || null;
  };

  useEffect(() => {
    fetchTrailRoutes();
    fetchWeatherData();
    setIsLoading(false);
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
    
    if (url) {
      Linking.openURL(url);
    }
  };

  const renderStars = (rating: number) => {
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

  if (isLoading) {
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
            customImages={undefined}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "transparent"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={styles.imageOverlay}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          {/* Removed favorite icon per spec */}

          {/* Overlay trail name, rating, location */}
          <View style={styles.heroContent} pointerEvents="none">
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>{spotData.name}</Text>
              <View style={styles.heroRating}>
                {renderStars(Math.floor(spotData.rating))}
                <Text style={styles.heroRatingText}>
                  {spotData.rating} <Text style={{opacity: 0.85}}>({spotData.review_count} reviews)</Text>
                </Text>
              </View>
              <View style={styles.heroLocation}>
                <MaterialIcons name="location-on" size={16} color="#fff" />
                <Text style={styles.heroLocationText}>{spotData.location || 'Cebu, Philippines'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Removed first 'Trail Information' header and stats row for a cleaner layout */}
          
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
                size={20} 
                color="#FFFFFF" 
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
            <Text style={styles.description}>{spotData.description || 'No description available'}</Text>
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
                  <WebView
                    style={styles.map}
                    source={{
                      html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8" />
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Hiking Spot Map</title>
                            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                            <style>
                                body { margin: 0; padding: 0; }
                                #map { height: 100vh; width: 100%; }
                            </style>
                        </head>
                        <body>
                            <div id="map"></div>
                            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                            <script>
                                const map = L.map('map').setView([${spotData.latitude}, ${spotData.longitude}], 15);
                                
                                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                    attribution: '© OpenStreetMap contributors'
                                }).addTo(map);
                                
                                const marker = L.marker([${spotData.latitude}, ${spotData.longitude}])
                                    .addTo(map)
                                    .bindPopup('<b>${spotData.name}</b><br>${spotData.description || ''}');
                                
                                marker.openPopup();
                            </script>
                        </body>
                        </html>
                      `
                    }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                  />
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
            <TrailRoutesSlider
              routes={trailRoutes}
              selectedRoute={selectedRoute}
              onRouteSelect={setSelectedRoute}
              loading={trailRoutesLoading}
              error={trailRoutesError || undefined}
              onRetry={fetchTrailRoutes}
            />
          </View>

          {/* Trail Information Section */}
          {selectedRoute && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trail Information</Text>
              <View style={styles.trailInfoContainer}>
                <Text style={styles.trailInfoTitle}>{selectedRoute.route_name || 'Selected Route'}</Text>
                {selectedRoute.highlights && (
                  <View style={styles.trailHighlights}>
                    <Text style={styles.trailHighlightsTitle}>Highlights:</Text>
                    <Text style={styles.trailHighlightsText}>{selectedRoute.highlights}</Text>
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
    height: HERO_HEIGHT,
    width: '100%',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: 'hidden',
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
    height: 160,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  favoriteIconButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  heroContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  heroTextContainer: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    padding: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroRatingText: {
    color: 'rgba(255,255,255,0.95)',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLocationText: {
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  contentContainer: {
    padding: 24,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -12,
  },
  // Removed stats cards from initial section
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 0,
  },
  favoriteButtonActive: {
    backgroundColor: COLORS.primary,
  },
  favoriteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  favoriteButtonTextActive: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: COLORS.text,
    opacity: 0.95,
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
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailRoutesLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  trailRoutesErrorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailRoutesErrorText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },

});