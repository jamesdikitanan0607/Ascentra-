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
import LeafletTrailMap from '../../components/LeafletTrailMap';
import ReviewSystem from '../../components/ReviewSystem';
import TrailInfo from '../../components/TrailInfo';
import WeatherWidget from '../../components/WeatherWidget';
import { getTrailRoutesBySpotId, TrailRouteDetails } from '../../services/supabaseService';
import { TrailRoutesSection } from './components/TrailRoutesSection';
import { TrailInfoSection } from './components/TrailInfoSection';
import { TrailRoute } from '../../types';


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
  hiking_spot_id?: string; // Added for component consistency
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

interface HikingSpotTemplateProps {
  navigation: any;
  spotData: HikingSpotData;
}

export default function HikingSpotTemplate({ navigation, spotData }: HikingSpotTemplateProps) {
  console.log('HikingSpotTemplate - spotData:', spotData);
  console.log('HikingSpotTemplate - spotData.hiking_spot_id:', spotData.hiking_spot_id);
  console.log('HikingSpotTemplate - spotData.id:', spotData.id);

  const [isLoading, setIsLoading] = useState(true);

  // Trail routes state
  const [trailRoutes, setTrailRoutes] = useState<TrailRouteDetails[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<TrailRouteDetails | null>(null);
  const [selectedUiRoute, setSelectedUiRoute] = useState<TrailRoute | null>(null);
  const [trailRoutesLoading, setTrailRoutesLoading] = useState(true);
  const [trailRoutesError, setTrailRoutesError] = useState<string | null>(null);
  const [effectiveSpotId, setEffectiveSpotId] = useState<string>((spotData as any).hiking_spot_id || (spotData as any).hikingSpotId || spotData.id);

  // Profile context for favorites functionality
  const { addToFavorites, removeFromFavorites, isSpotFavorited, favoritesLoading } = useProfile();

  const getImageSource = () => {
    return spotData.imageSource || null;
  };

  useEffect(() => {
    fetchTrailRoutes();
    setIsLoading(false);
  }, []);

  async function fetchTrailRoutes() {
    console.log('fetchTrailRoutes called with spotId:', spotData.id);
    setTrailRoutesLoading(true);
    setTrailRoutesError(null);
    try {
      const initialId = ((spotData as any).hiking_spot_id || (spotData as any).hikingSpotId || spotData.id).toString();
      const response = await getTrailRoutesBySpotId(initialId);
      console.log('API Response:', JSON.stringify(response, null, 2));

      let routes = (response.data || []) as TrailRouteDetails[];
      console.log('Fetched routes:', routes);

      if (!routes || routes.length === 0) {
        try {
          const { data: spotLookup, error: spotErr } = await supabase
            .from('hiking_spots')
            .select('hiking_spot_id,name')
            .ilike('name', `%${spotData.name}%`)
            .limit(1);
          if (!spotErr && Array.isArray(spotLookup) && spotLookup.length > 0 && spotLookup[0]?.hiking_spot_id) {
            const resolvedId = String(spotLookup[0].hiking_spot_id);
            setEffectiveSpotId(resolvedId);
            const retry = await getTrailRoutesBySpotId(resolvedId);
            routes = (retry.data || []) as TrailRouteDetails[];
          }
        } catch (e) {
        }
      }

      setTrailRoutes(routes || []);
      if (routes && routes.length > 0) {
        console.log('Setting selected route to first route:', routes[0]);
        setSelectedRoute(routes[0]);
      } else {
        console.log('No routes found for this spot');
      }
    } catch (error) {
      console.error('Error fetching trail routes:', error);
      setTrailRoutesError('Failed to load trail routes. Please try again later.');
    } finally {
      setTrailRoutesLoading(false);
    }
  }

  // Map DB routes to UI routes used by slider/info components
  const uiRoutes: TrailRoute[] = React.useMemo(() => {
    console.log('Mapping trail routes. Input trailRoutes:', trailRoutes);
    if (!Array.isArray(trailRoutes)) {
      console.log('trailRoutes is not an array');
      return [];
    }

    return trailRoutes.map((r) => {
      // Parse start and end coordinates from the database
      let startLat = spotData.latitude;
      let startLng = spotData.longitude;
      let endLat = spotData.latitude;
      let endLng = spotData.longitude;

      // Use provided coordinates if available
      if (r.start_coordinates) {
        startLat = r.start_coordinates.latitude;
        startLng = r.start_coordinates.longitude;
      }

      if (r.end_coordinates) {
        endLat = r.end_coordinates.latitude;
        endLng = r.end_coordinates.longitude;
      }

      // Parse waypoints if available
      let coordinates: [number, number][] = [];
      if (r.route_coordinates && Array.isArray(r.route_coordinates)) {
        coordinates = r.route_coordinates
          .filter(coord => coord && typeof coord.latitude === 'number' && typeof coord.longitude === 'number')
          .map(coord => [coord.longitude, coord.latitude] as [number, number]);
      }

      // Map database fields to UI model
      const route: TrailRoute = {
        id: r.route_id,  // Using route_id from the database
        route_name: r.route_name || 'Unnamed Route',
        difficulty: (() => {
          const d = (r.difficulty || r.difficulty_level || 'moderate').toLowerCase();
          if (d.includes('easy')) return 'Easy';
          if (d.includes('moderate')) return 'Moderate';
          if (d.includes('hard')) return 'Hard';
          if (d.includes('expert') || d.includes('challenging')) return 'Expert';
          return 'Moderate';
        })() as 'Easy' | 'Moderate' | 'Hard' | 'Expert',
        distance: r.distance_km || 0,
        elevation_gain: r.elevation_gain_m || 0,
        estimated_duration: r.estimated_duration_hr ? Math.round(r.estimated_duration_hr * 60) : 0, // Convert hours to minutes
        route_description: r.route_description || '',
        highlights: r.highlights || '',
        route_color: r.route_color || '#2E7D32',
        start_coordinates: {
          latitude: startLat,
          longitude: startLng
        },
        end_coordinates: {
          latitude: endLat,
          longitude: endLng
        },
        coordinates: coordinates,
        waypoints: r.waypoints ? JSON.stringify(r.waypoints) : '[]',
        created_at: r.created_at,
        updated_at: r.updated_at
      };

      console.log(`Mapped route ${route.id} (${route.route_name}):`, route);
      return route;
    });
  }, [trailRoutes, spotData.latitude, spotData.longitude]);

  // Keep selected UI route in sync with selected DB route
  useEffect(() => {
    console.log('Selected route changed:', selectedRoute);
    console.log('Available UI routes:', uiRoutes);

    if (!selectedRoute) {
      console.log('No selected route, setting selectedUiRoute to null');
      setSelectedUiRoute(null);
      return;
    }

    const found = uiRoutes.find(u => String(u.id) === String(selectedRoute.route_id));
    console.log('Found matching UI route for selected route:', found);
    setSelectedUiRoute(found || null);
  }, [selectedRoute, uiRoutes]);

  // Normalize difficulty and prefer easiest default
  useEffect(() => {
    if (!uiRoutes.length) return;
    if (selectedRoute) return; // Already selected from fetch
    const ORDER = ['Easy', 'Moderate', 'Challenging', 'Hard', 'Expert'] as const;
    function normalize(raw?: string) {
      if (!raw) return 'Moderate' as const;
      const d = raw.toLowerCase();
      if (d.includes('easy') && !d.includes('moderate')) return 'Easy' as const;
      if (d.includes('easy') && d.includes('moderate')) return 'Moderate' as const;
      if (d === 'moderate') return 'Moderate' as const;
      if (d.includes('very hard') || d.includes('expert')) return 'Expert' as const;
      if (d.includes('hard')) return 'Hard' as const;
      return 'Challenging' as const;
    }
    const sorted = [...uiRoutes].sort((a, b) => ORDER.indexOf(normalize(a.difficulty)) - ORDER.indexOf(normalize(b.difficulty)));
    const easiest = sorted[0];
    if (easiest) {
      const details = trailRoutes.find(r => String(r.route_id) === String(easiest.id)) || null;
      setSelectedRoute(details);
    }
  }, [uiRoutes, trailRoutes, selectedRoute]);

  const handleSelectFromSlider = (trailId: string) => {
    console.log('handleSelectFromSlider called with trailId:', trailId);
    console.log('Available trailRoutes:', trailRoutes);

    // Find the route in the database routes
    const details = trailRoutes.find(r => String(r.route_id) === String(trailId));
    console.log('Found route details:', details);

    if (details) {
      setSelectedRoute(details);

      // Also update the selected UI route
      const uiRoute = uiRoutes.find(r => r.id === trailId);
      if (uiRoute) {
        console.log('Setting selected UI route:', uiRoute);
        setSelectedUiRoute(uiRoute);
      }
    }
  };

  const handleFavoriteToggle = async () => {
    if (favoritesLoading) return;

    try {
      const isCurrentlyFavorited = isSpotFavorited(spotData.id);
      if (isCurrentlyFavorited) {
        await removeFromFavorites(spotData.id);
      } else {
        // Ensure hiking_spot_id is present as per user requirement
        const spotToSave = {
          ...spotData,
          hiking_spot_id: (spotData as any).hiking_spot_id || spotData.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await addToFavorites(spotToSave);
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
                  {spotData.rating} <Text style={{ opacity: 0.85 }}>({spotData.review_count} reviews)</Text>
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
                <LeafletTrailMap
                  selectedHikingSpotId={effectiveSpotId}
                  selectedTrailId={selectedRoute?.route_id?.toString()}
                  onTrailSelect={(trailId) => {
                    const route = trailRoutes.find(r => r.route_id === trailId);
                    if (route) {
                      setSelectedRoute(route);
                    }
                  }}
                  showFullscreenButton={true}
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
                                    .bindPopup('<b>' + ${JSON.stringify(spotData.name)} + '</b><br>' + ${JSON.stringify(spotData.description || '')});
                                
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

          {/* Trail Routes Section (slider) */}
          <View style={styles.section}>
            {trailRoutesLoading ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text>Loading trail routes...</Text>
              </View>
            ) : trailRoutesError ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: 'red' }}>{trailRoutesError}</Text>
              </View>
            ) : uiRoutes.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text>No trail routes available for this spot.</Text>
              </View>
            ) : (
              <TrailRoutesSection
                trailRoutes={uiRoutes}
                onTrailSelect={handleSelectFromSlider}
                selectedTrailId={selectedUiRoute?.id || null}
              />
            )}
          </View>

          {/* Trail Information Panel */}
          <View style={styles.section}>
            <TrailInfoSection
              selectedRoute={selectedUiRoute}
              onFocusOnMap={(rid) => handleSelectFromSlider(rid)}
            />
          </View>





          {/* Weather Condition Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Weather</Text>
            <WeatherWidget
              latitude={spotData.latitude}
              longitude={spotData.longitude}
              locationName={spotData.name}
            />
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
              hikingSpotId={spotData.hiking_spot_id || spotData.id}
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