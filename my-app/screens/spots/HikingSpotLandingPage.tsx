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
  Dimensions,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../contexts/ProfileContext';
import { useTrail, normalizeTrailRoute } from '../../contexts/TrailContext';
import { LinearGradient } from 'expo-linear-gradient';
import { getHikingSpotById, getTrailRoutesBySpotId, TrailRouteDetails } from '../../services/supabaseService';
import { HikingSpot } from '../../types/database';
import WeatherWidget from '../../components/WeatherWidget';
import GoogleMapsTrailMap from '../../components/GoogleMapsTrailMap';
import { ImageCarousel } from '../../components/ImageCarousel';
import ReviewSystem from '../../components/ReviewSystem';

const { width, height } = Dimensions.get('window');

// Constants for route card layout
const CARD_GAP = 12;
const cardWidth = (width - 40 - CARD_GAP) / 2; // 40 for padding, divided by 2 for 2 columns

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

interface HikingSpotLandingPageProps {
  navigation: any;
  route: {
    params: {
      spotId: string;
    };
  };
}

export default function HikingSpotLandingPage({ navigation, route }: HikingSpotLandingPageProps) {
  const { spotId } = route.params;
  const [hikingSpot, setHikingSpot] = useState<HikingSpot | null>(null);
  const [trailRoutes, setTrailRoutes] = useState<TrailRouteDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [coordinates, setCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  
  // Profile context for favorites functionality
  const { addToFavorites, removeFromFavorites, isSpotFavorited, favoritesLoading } = useProfile();
  
  // Trail context for shared trail selection
  const { selectedTrail, setSelectedTrail, setTrails } = useTrail();

  useEffect(() => {
    fetchHikingSpotData();
  }, [spotId]);

  useEffect(() => {
    if (hikingSpot) {
      extractCoordinates();
    }
  }, [hikingSpot]);

  async function fetchHikingSpotData() {
    try {
      setLoading(true);
      
      // Fetch hiking spot details
      const spot = await getHikingSpotById(spotId);
      if (spot) {
        setHikingSpot(spot);
        
        // Fetch trail routes for this spot
        const routes = await getTrailRoutesBySpotId(spotId);
        setTrailRoutes(routes);
        
        // Convert to TrailRoute format and update context
        const normalizedTrails = routes.map(route => normalizeTrailRoute({
          id: route.route_id,
          name: route.route_name,
          description: route.highlights || '',
          difficulty: route.difficulty,
          length: route.distance_km,
          elevation_gain: route.elevation_gain_m,
          estimated_time: route.estimated_duration_hr * 60, // Convert hours to minutes
          trail_type: 'trail',
          waypoints: '',
          gpx_data: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          hiking_spot_id: spotId,
          route_id: route.route_id
        }));
        
        setTrails(normalizedTrails);
        
        // Set the first route as selected by default if none is selected
        if (normalizedTrails.length > 0 && !selectedTrail) {
          setSelectedTrail(normalizedTrails[0]);
        }
      } else {
        Alert.alert('Error', 'Hiking spot not found');
        navigation.goBack();
      }
    } catch (error) {
      // Error fetching hiking spot data
      Alert.alert('Error', 'Failed to load hiking spot details');
    } finally {
      setLoading(false);
    }
  }

  function extractCoordinates() {
    if (!hikingSpot?.coordinates) return;
    
    try {
      // Extract coordinates from the hiking spot data
      // Assuming coordinates are stored as POINT(longitude, latitude) or similar format
      if (hikingSpot.coordinates.coordinates) {
        setCoordinates({
          latitude: hikingSpot.coordinates.coordinates[1],
          longitude: hikingSpot.coordinates.coordinates[0]
        });
      }
    } catch (error) {
      // Error extracting coordinates
    }
  }

  const handleFavoriteToggle = async () => {
    if (favoritesLoading || !hikingSpot) return;
    
    try {
      const isCurrentlyFavorited = isSpotFavorited(hikingSpot.id.toString());
      if (isCurrentlyFavorited) {
        await removeFromFavorites(hikingSpot.id.toString());
      } else {
        await addToFavorites({
          id: hikingSpot.id.toString(),
          name: hikingSpot.name,
          description: hikingSpot.description,
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
    if (!selectedTrail || !selectedTrail.coordinates || selectedTrail.coordinates.length === 0) return;
    
    const coords = selectedTrail.coordinates[0];
    const url = Platform.select({
      ios: `maps:0,0?q=${coords[1]},${coords[0]}`,
      android: `geo:0,0?q=${coords[1]},${coords[0]}`
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'hard': return '#F44336';
      case 'advanced': return '#9C27B0';
      default: return COLORS.primary;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading hiking spot details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hikingSpot) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Hiking spot not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
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
          <ImageCarousel spotName={hikingSpot.name} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{hikingSpot.name}</Text>
            <View style={styles.heroRating}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= (hikingSpot.average_rating || 4.5) ? "star" : "star-outline"}
                    size={16}
                    color="#FFD700"
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>{hikingSpot.average_rating?.toFixed(1) || '4.5'}</Text>
            </View>
            <View style={styles.heroLocation}>
              <Ionicons name="location" size={16} color="white" />
              <Text style={styles.heroLocationText}>{hikingSpot.name}</Text>
            </View>
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Trail Map Section */}
          {coordinates && trailRoutes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trail Map</Text>
              <GoogleMapsTrailMap
                selectedHikingSpotId={spotId}
                selectedTrailId={selectedTrail?.id}
                onTrailSelect={(trailId) => {
                  const route = trailRoutes.find(r => r.route_id === Number(trailId));
                  if (route) {
                    const normalizedTrail = normalizeTrailRoute({
                      id: route.route_id,
                      name: route.route_name,
                      description: route.highlights || '',
                      difficulty: route.difficulty,
                      length: route.distance_km,
                      elevation_gain: route.elevation_gain_m,
                      estimated_time: route.estimated_duration_hr * 60,
                      trail_type: 'trail',
                      waypoints: '',
                      gpx_data: null,
                      is_active: true,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      hiking_spot_id: spotId,
                      route_id: route.route_id
                    });
                    setSelectedTrail(normalizedTrail);
                  }
                }}
                style={{ height: 300, borderRadius: 12, overflow: 'hidden' }}
              />
            </View>
          )}

          {/* Weather Section */}
          {coordinates && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Weather</Text>
              <WeatherWidget
                latitude={coordinates.latitude}
                longitude={coordinates.longitude}
                locationName={hikingSpot?.name || 'Hiking Spot'}
              />
            </View>
          )}

          {/* Trail Routes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trail Routes ({trailRoutes.length})</Text>
            <View style={styles.routesGrid}>
              {trailRoutes.map((route) => (
                <TouchableOpacity
                  key={route.route_id}
                  style={[
                    styles.routeCard,
                    styles.routeCardCompact,
                    selectedTrail?.id === String(route.route_id) && styles.routeCardSelected,
                    { width: cardWidth, marginRight: CARD_GAP, marginBottom: CARD_GAP },
                  ]}
                  onPress={() => {
                    const normalizedTrail = normalizeTrailRoute({
                      id: route.route_id,
                      name: route.route_name,
                      description: route.highlights || '',
                      difficulty: route.difficulty,
                      length: route.distance_km,
                      elevation_gain: route.elevation_gain_m,
                      estimated_time: route.estimated_duration_hr * 60,
                      trail_type: 'trail',
                      waypoints: '',
                      gpx_data: null,
                      is_active: true,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      hiking_spot_id: spotId,
                      route_id: route.route_id
                    });
                    setSelectedTrail(normalizedTrail);
                  }}
                >
                  <View style={styles.routeHeader}>
                    <Text style={styles.routeName}>{route.route_name}</Text>
                    <View
                      style={[
                        styles.difficultyBadge,
                        { backgroundColor: getDifficultyColor(route.difficulty) },
                      ]}
                    >
                      <Text style={styles.difficultyText}>{route.difficulty}</Text>
                    </View>
                  </View>
                  <View style={styles.routeStats}>
                    <View style={styles.routeStat}>
                      <MaterialIcons name="straighten" size={16} color={COLORS.textLight} />
                      <Text style={styles.routeStatText}>{route.distance_km}km</Text>
                    </View>
                    <View style={styles.routeStat}>
                      <MaterialIcons name="terrain" size={16} color={COLORS.textLight} />
                      <Text style={styles.routeStatText}>{route.elevation_gain_m}m</Text>
                    </View>
                    <View style={styles.routeStat}>
                      <MaterialIcons name="schedule" size={16} color={COLORS.textLight} />
                      <Text style={styles.routeStatText}>{route.estimated_duration_hr}h</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Trail Information Panel */}
          {selectedTrail && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trail Information</Text>
              <View style={styles.trailInfoCard}>
                <View style={styles.trailInfoHeader}>
                  <Text style={styles.trailInfoTitle}>{selectedTrail.name}</Text>
                  <View style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor(selectedTrail.difficulty) }
                  ]}>
                    <Text style={styles.difficultyText}>{selectedTrail.difficulty}</Text>
                  </View>
                </View>
                
                <View style={styles.trailInfoStats}>
                  <View style={styles.trailInfoStat}>
                    <MaterialIcons name="straighten" size={20} color={COLORS.primary} />
                    <Text style={styles.trailInfoStatValue}>{selectedTrail.distance}km</Text>
                    <Text style={styles.trailInfoStatLabel}>Distance</Text>
                  </View>
                  <View style={styles.trailInfoStat}>
                    <MaterialIcons name="terrain" size={20} color={COLORS.primary} />
                    <Text style={styles.trailInfoStatValue}>{selectedTrail.elevationGain}m</Text>
                    <Text style={styles.trailInfoStatLabel}>Elevation Gain</Text>
                  </View>
                  <View style={styles.trailInfoStat}>
                    <MaterialIcons name="schedule" size={20} color={COLORS.primary} />
                    <Text style={styles.trailInfoStatValue}>{Math.round((selectedTrail.estimatedTime || 0) / 60)}h</Text>
                    <Text style={styles.trailInfoStatLabel}>Duration</Text>
                  </View>
                </View>
                
                <Text style={styles.highlightsTitle}>Trail Highlights</Text>
                <Text style={styles.highlightsText}>{selectedTrail.description}</Text>
              </View>
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity 
            style={[
              styles.favoriteButton,
              isSpotFavorited(hikingSpot.id.toString()) && styles.favoriteButtonActive
            ]}
            onPress={handleFavoriteToggle}
            disabled={favoritesLoading}
          >
            <Ionicons 
              name={isSpotFavorited(hikingSpot.id.toString()) ? 'heart' : 'heart-outline'} 
              size={20} 
              color={isSpotFavorited(hikingSpot.id.toString()) ? '#FF6B6B' : COLORS.primary} 
            />
            <Text style={[
              styles.favoriteButtonText,
              isSpotFavorited(hikingSpot.id.toString()) && styles.favoriteButtonTextActive
            ]}>
              {isSpotFavorited(hikingSpot.id.toString()) ? 'Remove from Favorites' : 'Add to Favorites'}
            </Text>
          </TouchableOpacity>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About {hikingSpot.name}</Text>
            <Text style={styles.description}>{hikingSpot.description}</Text>
          </View>

          {/* Reviews Section */}
          <View style={styles.section}>
            <ReviewSystem 
              hikingSpotId={hikingSpot.id.toString()} 
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
    fontSize: 16,
    color: COLORS.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.error,
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  heroImage: {
    width: '100%',
    height: '100%',
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
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  heroRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  heroLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLocationText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  heroRatingText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  weatherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
  },
  weatherItem: {
    alignItems: 'center',
  },
  weatherText: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  routesScrollView: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  routesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  routeCard: {
    width: 200,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  routeCardCompact: {
    padding: 12,
    marginRight: 0,
  },
  routeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E8',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeStatText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.textLight,
  },
  trailInfoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
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
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  trailInfoStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  trailInfoStat: {
    alignItems: 'center',
  },
  trailInfoStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  trailInfoStatLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  highlightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  highlightsText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  favoriteButtonActive: {
    backgroundColor: '#FFE8E8',
    borderColor: '#FF6B6B',
  },
  favoriteButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  favoriteButtonTextActive: {
    color: '#FF6B6B',
  },
  mapControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  mapControlButton: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapControlText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  description: {
    fontSize: 16,
    color: COLORS.textLight,
    lineHeight: 24,
  },
  mapSection: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: 200,
  },
  directionsButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  directionsButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 8,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsPlaceholder: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.separator,
    borderStyle: 'dashed',
  },
  noReviewsText: {
    fontStyle: 'italic',
    color: COLORS.textMuted,
    marginTop: 10,
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
  addReviewButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addReviewButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});