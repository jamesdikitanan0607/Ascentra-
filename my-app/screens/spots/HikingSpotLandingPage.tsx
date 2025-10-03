import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Modal,
} from 'react-native';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../contexts/ProfileContext';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useTrail, normalizeTrailRoute } from '../../contexts/TrailContext';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchHikingSpotById, getTrailRoutesBySpotId, TrailRouteDetails } from '../../services/supabaseService';
import { HikingSpot } from '../../types/database';
import WeatherWidget from '../../components/WeatherWidget';
import { formatDistance, formatElevation } from '../../utils/formatters';
import LeafletTrailMap from '../../components/LeafletTrailMap';
import { ImageCarousel } from '../../components/ImageCarousel';
import ReviewSystem from '../../components/ReviewSystem';
import TrailInfo from '../../components/TrailInfo';
import AvailableRoutes, { TrailRoute } from '../../components/AvailableRoutes';

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
      hiking_spot_id: string;
    };
  };
}

export default function HikingSpotLandingPage({ navigation, route }: HikingSpotLandingPageProps) {
  // Add null checks for route.params
  if (!route.params || !route.params.hiking_spot_id) {
    console.error('HikingSpotLandingPage: Missing hiking_spot_id parameter');
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: Missing hiking spot information</Text>
          <TouchableOpacity 
            style={styles.errorBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { hiking_spot_id } = route.params;
  const [hikingSpot, setHikingSpot] = useState<HikingSpot | null>(null);
  const [trailRoutes, setTrailRoutes] = useState<TrailRouteDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [coordinates, setCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<TrailRouteDetails | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const trailInfoYRef = useRef<number>(0);
  const infoOpacity = useRef(new Animated.Value(0)).current;
  const infoTranslateY = useRef(new Animated.Value(12)).current;
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);
  
  // Profile context for favorites functionality
  const { addToFavorites, removeFromFavorites, isSpotFavorited, favoritesLoading } = useProfile();
  
  // Trail context for shared trail selection
  const { selectedTrail, setSelectedTrail, setTrails } = useTrail();

  // Convert selectedTrail to selectedRoute format for TrailInfo component
  const convertTrailToRoute = (trail: any): TrailRouteDetails | null => {
    if (!trail) return null;
    
    // Find the corresponding route in trailRoutes using route_id
    const route = trailRoutes.find(r => String(r.route_id) === String(trail.route_id || trail.id));
    if (route) {
      return route;
    }
    
    // If not found, create a compatible structure from the normalized trail data
    return {
      route_id: String(trail.route_id || trail.id) || '',
      hiking_spot_id: hiking_spot_id,
      route_name: trail.route_name || trail.name || 'Unnamed Trail',
      difficulty_level: trail.difficulty_level || trail.difficulty || 'Unknown',
      difficulty: trail.difficulty || 'Unknown',
      distance_km: trail.distance_km || trail.distance || trail.length || 0,
      elevation_gain_m: trail.elevation_gain_m || trail.elevationGain || trail.elevation_gain || 0,
      estimated_duration_hr: trail.estimated_duration_hr || (trail.estimatedTime || 0) / 60 || trail.estimated_time || 0,
      highlights: trail.highlights || trail.description || '',
      start_coordinates: trail.start_coordinates || null,
      end_coordinates: trail.end_coordinates || null,
      route_coordinates: trail.route_coordinates || null,
      geojson_path: trail.geojson_path || null,
      waypoints: trail.waypoints || null,
      route_color: trail.route_color || null,
      created_at: trail.created_at || new Date().toISOString(),
      updated_at: trail.updated_at || new Date().toISOString()
    };
  };

  useEffect(() => {
    fetchHikingSpotData();
  }, [hiking_spot_id]);

  useEffect(() => {
    if (hikingSpot) {
      extractCoordinates();
    }
  }, [hikingSpot]);

  useEffect(() => {
    setSelectedRoute(convertTrailToRoute(selectedTrail));
  }, [selectedTrail, trailRoutes]);

  useEffect(() => {
    // Animate Trail Information panel on selection
    if (selectedRoute) {
      Animated.parallel([
        Animated.timing(infoOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(infoTranslateY, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      infoOpacity.setValue(0);
      infoTranslateY.setValue(12);
    }
  }, [selectedRoute]);

  async function fetchHikingSpotData() {
    try {
      setLoading(true);
      
      // Validate hiking_spot_id before making API calls
      if (!hiking_spot_id) {
        navigation.goBack();
        return;
      }
      
      // Fetch hiking spot details
      const spotData = await fetchHikingSpotById(hiking_spot_id);
      const spot = (spotData?.data as unknown) as HikingSpot | null;
      if (spot) {
        setHikingSpot(spot);
        
        // Fetch trail routes for this spot
        const routesResponse = await getTrailRoutesBySpotId(hiking_spot_id);
        
        // Handle the response structure properly
        const routes = routesResponse?.data || [];
        if (routesResponse?.error) {
          console.error('Error fetching trail routes:', routesResponse.error);
        }
        
        // Ensure routes is an array
        const validRoutes = Array.isArray(routes) ? routes : [];
        setTrailRoutes(validRoutes);
        
        // Convert to TrailRoute format and update context with null checks
        const normalizedTrails = validRoutes
          .filter(route => route && route.route_id) // Filter out null/undefined routes
          .map(route => {
            try {
              return normalizeTrailRoute({
                id: route.route_id,
                name: route.route_name || 'Unnamed Route',
                description: route.highlights || '',
                difficulty: route.difficulty || 'Unknown',
                length: route.distance_km || 0,
                elevation_gain: route.elevation_gain_m || 0,
                estimated_time: (route.estimated_duration_hr || 0) * 60, // Convert hours to minutes
                trail_type: 'trail',
                waypoints: route.waypoints || '',
                gpx_data: null,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                hiking_spot_id: hiking_spot_id,
                route_id: route.route_id,
                start_coordinates: route.start_coordinates || null,
                end_coordinates: route.end_coordinates || null,
                route_coordinates: route.route_coordinates || null,
                geojson_path: route.geojson_path || null
              });
            } catch (error) {
              console.error('Error normalizing trail route:', error);
              return null;
            }
          })
          .filter(trail => trail !== null); // Remove any failed normalizations
        
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
      console.error('Error fetching hiking spot data:', error);
      Alert.alert('Error', 'Failed to load hiking spot details');
      navigation.goBack();
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
        await addToFavorites(hikingSpot);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
      Linking.openURL(url).catch(err => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Could not open maps application');
      });
    }
  };

  const handleFullscreenMap = () => {
    setIsFullscreenMap(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreenMap(false);
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
    <ErrorBoundary
      navigation={navigation}
      screenName="HikingSpotLandingPage"
      onError={(error) => {
        console.error('Error in HikingSpotLandingPage:', error);
      }}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ScrollView ref={scrollViewRef} style={styles.container} showsVerticalScrollIndicator={false}>
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
          {/* Available Trails Section */}
          {trailRoutes && trailRoutes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Trails ({trailRoutes.length})</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.trailsScrollView}
                contentContainerStyle={styles.trailsScrollContent}
              >
                {trailRoutes.map((route) => {
                  if (!route || !route.route_id) return null;
                  
                  return (
                    <TouchableOpacity
                      key={route.route_id}
                      style={[
                        styles.trailChip,
                        String(selectedTrail?.id) === String(route.route_id) && styles.trailChipSelected,
                      ]}
                      onPress={() => {
                        try {
                          const normalizedTrail = normalizeTrailRoute({
                            id: route.route_id,
                            name: route.route_name || 'Unnamed Trail',
                            description: route.highlights || '',
                            difficulty: route.difficulty || 'Unknown',
                            length: route.distance_km || 0,
                            elevation_gain: route.elevation_gain_m || 0,
                            estimated_time: (route.estimated_duration_hr || 0) * 60,
                            trail_type: 'trail',
                            waypoints: route.waypoints || '',
                            gpx_data: null,
                            is_active: true,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            hiking_spot_id: hiking_spot_id,
                            route_id: route.route_id,
                            start_coordinates: route.start_coordinates || null,
                            end_coordinates: route.end_coordinates || null,
                            route_coordinates: route.route_coordinates || null,
                            geojson_path: route.geojson_path || null
                          });
                          setSelectedTrail(normalizedTrail);
                        } catch (error) {
                          console.error('Error selecting trail:', error);
                        }
                      }}
                    >
                      <Text style={[
                        styles.trailChipText,
                        String(selectedTrail?.id) === String(route.route_id) && styles.trailChipTextSelected,
                      ]}>
                        {route.route_name || 'Unnamed Trail'}
                      </Text>
                      <View style={[
                        styles.trailChipDifficulty,
                        { backgroundColor: getDifficultyColor(route.difficulty || 'Unknown') }
                      ]}>
                        <Text style={styles.trailChipDifficultyText}>{route.difficulty || 'Unknown'}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Trail Map Section */}
          {coordinates && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trail Map</Text>
                <TouchableOpacity 
                  style={styles.fullscreenButton}
                  onPress={handleFullscreenMap}
                  disabled={!trailRoutes || trailRoutes.length === 0}
                >
                  <Ionicons name="expand" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.mapContainer}>
                {trailRoutes && trailRoutes.length > 0 ? (
                  <LeafletTrailMap
                    selectedHikingSpotId={hiking_spot_id}
                    selectedTrailId={selectedTrail?.id}
                    onTrailSelect={(trailId) => {
                      try {
                        if (!trailId || !trailRoutes) return;
                        
                        const route = trailRoutes.find(r => r && String(r.route_id) === String(trailId));
                        if (route && route.route_id) {
                          const normalizedTrail = normalizeTrailRoute({
                            id: route.route_id,
                            name: route.route_name || 'Unnamed Route',
                            description: route.highlights || '',
                            difficulty: route.difficulty || 'Unknown',
                            length: route.distance_km || 0,
                            elevation_gain: route.elevation_gain_m || 0,
                            estimated_time: (route.estimated_duration_hr || 0) * 60,
                            trail_type: 'trail',
                            waypoints: route.waypoints || '',
                            gpx_data: null,
                            is_active: true,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            hiking_spot_id: hiking_spot_id,
                            route_id: route.route_id,
                            start_coordinates: route.start_coordinates || null,
                            end_coordinates: route.end_coordinates || null,
                            route_coordinates: route.route_coordinates || null,
                            geojson_path: route.geojson_path || null
                          });
                          setSelectedTrail(normalizedTrail);
                          // Scroll Trail Information into view
                          if (trailInfoYRef.current && scrollViewRef.current) {
                            scrollViewRef.current.scrollTo({ y: Math.max(trailInfoYRef.current - 20, 0), animated: true });
                          }
                        }
                    } catch (error) {
                      console.error('Error selecting trail from map:', error);
                    }
                  }}
                  style={styles.mapStyle}
                  showFullscreenButton={false}
                  navigation={navigation}
                />
              ) : (
                <View style={styles.noRoutesContainer}>
                  <MaterialIcons name="terrain" size={48} color={COLORS.textMuted} />
                  <Text style={styles.noRoutesTitle}>No Trail Routes Available</Text>
                  <Text style={styles.noRoutesDescription}>Trail routes for this hiking spot will be available soon. Check back later for updates!</Text>
                </View>
              )}
              
              {/* Available Routes Section */}
              {trailRoutes && trailRoutes.length > 0 && (
                <AvailableRoutes
                  routes={trailRoutes.map(route => ({
                    id: route.route_id?.toString() || '',
                    route_name: route.route_name || 'Unnamed Route',
                    difficulty: (route.difficulty || 'Moderate') as 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Hard' | 'Very Hard',
                    distance: route.distance_km || 0,
                    elevation_gain: route.elevation_gain_m || 0,
                    estimated_duration: (route.estimated_duration_hr || 0) * 60, // Convert to minutes
                    route_description: route.highlights || '',
                    highlights: route.highlights || '',
                    route_color: route.route_color || '#FF6B6B',
                    start_coordinates: route.start_coordinates || { latitude: 0, longitude: 0 },
                    end_coordinates: route.end_coordinates || { latitude: 0, longitude: 0 },
                    waypoints: route.waypoints || '',
                    coordinates: route.route_coordinates?.map(coord => [coord.longitude, coord.latitude]) || []
                  }))}
                  selectedRoute={selectedRoute ? {
                    id: selectedRoute.route_id?.toString() || '',
                    route_name: selectedRoute.route_name || 'Unnamed Route',
                    difficulty: (selectedRoute.difficulty_level || selectedRoute.difficulty || 'Moderate') as 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Hard' | 'Very Hard',
                    distance: selectedRoute.distance_km || 0,
                    elevation_gain: selectedRoute.elevation_gain_m || 0,
                    estimated_duration: selectedRoute.estimated_duration_hr || 0,
                    route_description: selectedRoute.route_description || '',
                    highlights: selectedRoute.route_description || '',
                    route_color: '#FF6B6B',
                    start_coordinates: selectedRoute.start_coordinates || { latitude: 0, longitude: 0 },
                    end_coordinates: selectedRoute.end_coordinates || { latitude: 0, longitude: 0 },
                    waypoints: selectedRoute.waypoints || '',
                    coordinates: selectedRoute.route_coordinates?.map(coord => [coord.longitude, coord.latitude]) || []
                  } : null}
                  onRouteSelect={(route) => {
                    const normalizedTrail = normalizeTrailRoute({
                      id: route.id,
                      name: route.route_name,
                      description: route.route_description,
                      difficulty: route.difficulty,
                      length: route.distance,
                      elevation_gain: route.elevation_gain,
                      estimated_time: route.estimated_duration,
                      trail_type: 'trail',
                      waypoints: route.waypoints,
                      gpx_data: null,
                      is_active: true,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      hiking_spot_id: hiking_spot_id,
                      route_id: route.id,
                      start_coordinates: route.start_coordinates,
                      end_coordinates: route.end_coordinates,
                      route_coordinates: route.coordinates?.map(coord => ({ latitude: coord[1], longitude: coord[0] })) || [],
                      geojson_path: {
                        type: 'LineString',
                        coordinates: route.coordinates || []
                      }
                    });
                    setSelectedTrail(normalizedTrail);
                    // Scroll Trail Information into view
                    if (trailInfoYRef.current && scrollViewRef.current) {
                      scrollViewRef.current.scrollTo({ y: Math.max(trailInfoYRef.current - 20, 0), animated: true });
                    }
                  }}
                />
              )}
              </View>
            </View>
          )}

          {/* Trail Information Section (moved before Weather) */}
          <View
            style={styles.section}
            onLayout={e => { trailInfoYRef.current = e.nativeEvent.layout.y; }}
          >
            <Text style={styles.sectionTitle}>Trail Information</Text>
            {trailRoutes && trailRoutes.length > 0 ? (
              <Animated.View style={{ opacity: infoOpacity, transform: [{ translateY: infoTranslateY }] }}>
                <TrailInfo 
                  selectedRoute={selectedRoute}
                  onFocusOnMap={(routeId: string) => {
                    try {
                      const route = trailRoutes.find(r => String(r.route_id) === String(routeId));
                      if (!route) return;
                      const normalizedTrail = normalizeTrailRoute({
                        id: route.route_id,
                        name: route.route_name || 'Unnamed Route',
                        description: route.highlights || '',
                        difficulty: route.difficulty || 'Unknown',
                        length: route.distance_km || 0,
                        elevation_gain: route.elevation_gain_m || 0,
                        estimated_time: (route.estimated_duration_hr || 0) * 60,
                        trail_type: 'trail',
                        waypoints: route.waypoints || '',
                        gpx_data: null,
                        is_active: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        hiking_spot_id: hiking_spot_id,
                        route_id: route.route_id,
                        start_coordinates: route.start_coordinates || null,
                        end_coordinates: route.end_coordinates || null,
                        route_coordinates: route.route_coordinates || null,
                        geojson_path: route.geojson_path || null
                      });
                      setSelectedTrail(normalizedTrail);
                    } catch (err) {
                      console.error('Error focusing trail on map:', err);
                    }
                  }}
                />
              </Animated.View>
            ) : (
              <View style={styles.noRoutesContainer}>
                <MaterialIcons name="terrain" size={48} color={COLORS.textMuted} />
                <Text style={styles.noRoutesTitle}>No Trail Routes Available</Text>
                <Text style={styles.noRoutesDescription}>No trail routes available yet — check back later for detailed trail maps.</Text>
              </View>
            )}
          </View>

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
              onReviewsUpdate={(_reviews) => {
                // Optionally refresh hiking spot data to update average rating
                // Reviews updated successfully
              }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Fullscreen Map Modal */}
      <Modal
        visible={isFullscreenMap}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.fullscreenContainer}>
          <View style={styles.fullscreenHeader}>
            <TouchableOpacity
              style={styles.fullscreenCloseButton}
              onPress={handleCloseFullscreen}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.fullscreenTitle}>
              {hikingSpot?.name || 'Trail Map'}
            </Text>
            <View style={styles.fullscreenHeaderSpacer} />
          </View>
          
          {coordinates && trailRoutes && trailRoutes.length > 0 ? (
            <View style={styles.fullscreenMapContainer}>
              <LeafletTrailMap
                selectedHikingSpotId={hiking_spot_id}
                selectedTrailId={selectedTrail?.id}
                onTrailSelect={(trailId) => {
                  try {
                    if (!trailId || !trailRoutes) return;
                    
                    const route = trailRoutes.find(r => r && String(r.route_id) === String(trailId));
                    if (route && route.route_id) {
                      const normalizedTrail = normalizeTrailRoute({
                        id: route.route_id,
                        name: route.route_name || 'Unnamed Route',
                        description: route.highlights || '',
                        difficulty: route.difficulty || 'Unknown',
                        length: route.distance_km || 0,
                        elevation_gain: route.elevation_gain_m || 0,
                        estimated_time: (route.estimated_duration_hr || 0) * 60,
                        trail_type: 'trail',
                        waypoints: route.waypoints || '',
                        gpx_data: null,
                        is_active: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        hiking_spot_id: hiking_spot_id,
                        route_id: route.route_id,
                        start_coordinates: route.start_coordinates || null,
                        end_coordinates: route.end_coordinates || null,
                        route_coordinates: route.route_coordinates || null,
                        geojson_path: route.geojson_path || null
                      });
                      setSelectedTrail(normalizedTrail);
                    }
                  } catch (error) {
                    console.error('Error selecting trail from fullscreen map:', error);
                  }
                }}
                style={styles.fullscreenMapStyle}
                showFullscreenButton={false}
                navigation={navigation}
              />
              
              {/* Available Routes Section in Fullscreen */}
              <View style={styles.fullscreenRoutesContainer}>
                <AvailableRoutes
                  routes={trailRoutes.map(route => ({
                    id: route.route_id?.toString() || '',
                    route_name: route.route_name || 'Unnamed Route',
                    difficulty: (route.difficulty_level || route.difficulty || 'Moderate') as 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Hard' | 'Very Hard',
                    distance: route.distance_km || 0,
                    elevation_gain: route.elevation_gain_m || 0,
                    estimated_duration: (route.estimated_duration_hr || 0) * 60,
                    route_description: route.highlights || '',
                    highlights: route.highlights || '',
                    route_color: route.route_color || '#FF6B6B',
                    start_coordinates: route.start_coordinates || { latitude: 0, longitude: 0 },
                    end_coordinates: route.end_coordinates || { latitude: 0, longitude: 0 },
                    waypoints: route.waypoints || '',
                    coordinates: route.route_coordinates?.map(coord => [coord.longitude, coord.latitude]) || []
                  }))}
                  selectedRoute={selectedRoute ? {
                    id: selectedRoute.route_id?.toString() || '',
                    route_name: selectedRoute.route_name || 'Unnamed Route',
                    difficulty: (selectedRoute.difficulty_level || selectedRoute.difficulty || 'Moderate') as 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Hard' | 'Very Hard',
                    distance: selectedRoute.distance_km || 0,
                    elevation_gain: selectedRoute.elevation_gain_m || 0,
                    estimated_duration: selectedRoute.estimated_duration_hr || 0,
                    route_description: selectedRoute.route_description || '',
                    highlights: selectedRoute.route_description || '',
                    route_color: '#FF6B6B',
                    start_coordinates: selectedRoute.start_coordinates || { latitude: 0, longitude: 0 },
                    end_coordinates: selectedRoute.end_coordinates || { latitude: 0, longitude: 0 },
                    waypoints: selectedRoute.waypoints || '',
                    coordinates: selectedRoute.route_coordinates?.map(coord => [coord.longitude, coord.latitude]) || []
                  } : null}
                  onRouteSelect={(route) => {
                    const normalizedTrail = normalizeTrailRoute({
                      id: route.id,
                      name: route.route_name,
                      description: route.route_description,
                      difficulty: route.difficulty,
                      length: route.distance,
                      elevation_gain: route.elevation_gain,
                      estimated_time: route.estimated_duration,
                      trail_type: 'trail',
                      waypoints: route.waypoints,
                      gpx_data: null,
                      is_active: true,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      hiking_spot_id: hiking_spot_id,
                      route_id: route.id,
                      start_coordinates: route.start_coordinates,
                      end_coordinates: route.end_coordinates,
                      route_coordinates: route.coordinates?.map(coord => ({ latitude: coord[1], longitude: coord[0] })) || [],
                      geojson_path: {
                        type: 'LineString',
                        coordinates: route.coordinates || []
                      }
                    });
                    setSelectedTrail(normalizedTrail);
                  }}
                />
              </View>
            </View>
          ) : (
            <View style={styles.fullscreenNoRoutesContainer}>
              <MaterialIcons name="terrain" size={64} color={COLORS.textMuted} />
              <Text style={styles.fullscreenNoRoutesTitle}>No Trail Routes Available</Text>
              <Text style={styles.fullscreenNoRoutesDescription}>Trail routes for this hiking spot will be available soon.</Text>
              <TouchableOpacity
                style={styles.fullscreenBackButton}
                onPress={handleCloseFullscreen}
              >
                <Text style={styles.fullscreenBackButtonText}>Back to Spot</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
      </SafeAreaView>
    </ErrorBoundary>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  fullscreenButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.mapPlaceholder,
  },
  mapStyle: {
    flex: 1,
  },
  noRoutesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noRoutesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noRoutesDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Fullscreen styles
  fullscreenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fullscreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  fullscreenCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  fullscreenHeaderSpacer: {
    width: 40,
  },
  fullscreenMapContainer: {
    flex: 1,
  },
  fullscreenMapStyle: {
    flex: 1,
  },
  fullscreenRoutesContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '40%',
  },
  fullscreenNoRoutesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  fullscreenNoRoutesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  fullscreenNoRoutesDescription: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  fullscreenBackButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  fullscreenBackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  errorBackButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorBackButtonText: {
    color: 'white',
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
  mapContainer: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapStyle: {
    height: 500,
    width: '100%',
    borderRadius: 12,
  },
  trailsScrollView: {
    marginHorizontal: -20,
  },
  trailsScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  trailChip: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  trailChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  trailChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginRight: 8,
  },
  trailChipTextSelected: {
    color: 'white',
  },
  trailChipDifficulty: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trailChipDifficultyText: {
    fontWeight: '600',
    color: 'white',
  },
  noRoutesContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.separator,
    borderStyle: 'dashed',
    minHeight: 200,
  },
  noRoutesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noRoutesDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },

});
