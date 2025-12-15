import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  SafeAreaView,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../contexts/ProfileContext';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useTrail, normalizeTrailRoute } from '../../contexts/TrailContext';
import { fetchHikingSpotById, getTrailRoutesBySpotId, TrailRouteDetails } from '../../services/supabaseService';
import { HikingSpot } from '../../types/database';
import WeatherWidget from '../../components/WeatherWidget';
import ReviewSystem from '../../components/ReviewSystem';
import { HikingSpotHeader } from './components/HikingSpotHeader';
import { TrailMapSection } from './components/TrailMapSection';
import { TrailInfoSection } from './components/TrailInfoSection';
import { FavoriteButton } from './components/FavoriteButton';
import { LeaveNoTraceSection } from './components/LeaveNoTraceSection';
import { useHikingSpotData } from './hooks/useHikingSpotData';
import { TrailRoute } from '../../types';
import LeafletTrailMap from '../../components/LeafletTrailMap';
import TrailRoutesSlider from '../../components/TrailRoutesSlider';

// Define a consistent color palette
export const COLORS = {
  primary: '#388E3C',
  secondary: '#388E3C',
  text: '#212121',
  textLight: '#616161',
  textMuted: '#9E9E9E',
  background: '#FFFFFF',
  card: '#F9F9F9',
  separator: '#EEEEEE',
  star: '#FFD700',
  error: '#F44336',
  success: '#4CAF50',
  danger: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',
  light: '#F8F9FA',
  dark: '#343A40',
  lightGray: '#E9ECEF',
  mapPlaceholder: '#F5F5F5',
};

// Screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HikingSpotLandingPageProps {
  navigation: any;
  route: {
    params: {
      hiking_spot_id: string;
    };
  };
}

// Utility function to convert TrailRouteDetails to TrailRoute
const toTrailRoute = (details: TrailRouteDetails): TrailRoute => ({
  id: details.route_id,
  route_name: details.route_name || 'Unnamed Route',
  difficulty: details.difficulty_level === 'Easy' ? 'Easy' :
    details.difficulty_level === 'Moderate' ? 'Moderate' :
      details.difficulty_level === 'Hard' ? 'Hard' : 'Expert',
  distance: details.distance_km || 0,
  elevation_gain: details.elevation_gain_m || 0,
  estimated_duration: Math.round((details.estimated_duration_hr || 0) * 60),
  route_description: details.route_description || '',
  highlights: details.highlights || '',
  route_color: details.route_color || '#388E3C',
  start_coordinates: details.start_coordinates || { latitude: 0, longitude: 0 },
  end_coordinates: details.end_coordinates || { latitude: 0, longitude: 0 },
  coordinates: details.geojson_path?.coordinates || [],
  created_at: details.created_at,
  updated_at: details.updated_at,
  // Satisfy strict TrailRoute interface
  hiking_spot_id: details.hiking_spot_id,
  name: details.route_name || 'Unnamed Route',
  distance_km: details.distance_km || 0,
  elevation_gain_m: details.elevation_gain_m || 0,
  estimated_time_hours: details.estimated_duration_hr || 0,
  waypoints: Array.isArray(details.waypoints) ? details.waypoints : []
});

const toTrailRouteDetails = (route: TrailRoute): TrailRouteDetails => ({
  route_id: route.id,
  route_name: route.route_name || route.name || 'Unnamed Route',
  difficulty_level: route.difficulty,
  distance_km: route.distance_km || route.distance || 0,
  elevation_gain_m: route.elevation_gain_m || route.elevation_gain || 0,
  estimated_duration_hr: route.estimated_time_hours || ((route.estimated_duration || 0) / 60) || 0,
  route_description: route.route_description,
  highlights: route.highlights,
  route_color: route.route_color,
  start_coordinates: route.start_coordinates,
  end_coordinates: route.end_coordinates,
  geojson_path: { coordinates: route.coordinates || [] },
  waypoints: route.waypoints,
  created_at: route.created_at,
  updated_at: route.updated_at,
  hiking_spot_id: route.hiking_spot_id || '' // Will be populated from context if needed elsewhere
});

const findTrailRouteDetails = (routes: TrailRouteDetails[], id: string): TrailRouteDetails | null => {
  const found = routes.find(r => r.route_id === id);
  return found || null;
};

export default function HikingSpotLandingPage({ navigation, route }: HikingSpotLandingPageProps) {
  // Add null checks for route.params
  if (!route.params?.hiking_spot_id) {
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
  const [coordinates, setCoordinates] = useState<{ latitude: number, longitude: number } | null>(null);
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const trailInfoYRef = useRef<number>(0);
  const infoOpacity = useRef(new Animated.Value(0)).current;
  const infoTranslateY = useRef(new Animated.Value(12)).current;

  // Profile context for favorites functionality
  const { addToFavorites, removeFromFavorites, isSpotFavorited, favoritesLoading } = useProfile();
  const [favoriteSaving, setFavoriteSaving] = useState(false);

  // Trail context for shared trail selection
  const { selectedTrail, setSelectedTrail, setTrails } = useTrail();
  const [selectedRoute, setSelectedRoute] = useState<TrailRoute | null>(null);

  // Custom hook for fetching and managing hiking spot data
  const {
    hikingSpot,
    trailRoutes,
    loading,
    error,
    fetchHikingSpotData,
  } = useHikingSpotData(hiking_spot_id);

  // Transform DB routes (TrailRouteDetails) into UI routes (types.TrailRoute) for UI components
  // MEMOIZED to prevent infinite loop in useEffect below
  const uiRoutes: TrailRoute[] = React.useMemo(() => trailRoutes ? trailRoutes.map(r => ({
    id: r.route_id,
    route_name: r.route_name || 'Unnamed Route',
    difficulty: r.difficulty_level === 'Easy' ? 'Easy' :
      r.difficulty_level === 'Moderate' ? 'Moderate' :
        r.difficulty_level === 'Hard' ? 'Hard' : 'Expert',
    distance: r.distance_km || 0,
    elevation_gain: r.elevation_gain_m || 0,
    estimated_duration: Math.round((r.estimated_duration_hr || 0) * 60),
    route_description: r.route_description || '',
    highlights: r.highlights || '',
    route_color: r.route_color || '#388E3C',
    start_coordinates: r.start_coordinates || { latitude: 0, longitude: 0 },
    end_coordinates: r.end_coordinates || { latitude: 0, longitude: 0 },
    coordinates: r.geojson_path?.coordinates || [],
    waypoints: r.waypoints || [],
    created_at: r.created_at,
    updated_at: r.updated_at,
    // Satisfy strict TrailRoute interface
    hiking_spot_id: r.hiking_spot_id || hiking_spot_id,
    name: r.route_name || 'Unnamed Route',
    distance_km: r.distance_km || 0,
    elevation_gain_m: r.elevation_gain_m || 0,
    estimated_time_hours: r.estimated_duration_hr || 0,
  })) : [], [trailRoutes, hiking_spot_id]);

  // Set initial selected route when routes or selectedTrail changes
  useEffect(() => {
    if (uiRoutes.length > 0) {
      // Prefer currently selected trail id from context if present
      if (selectedTrail) {
        const existing = uiRoutes.find(r => String(r.id) === String(selectedTrail.id));
        if (existing) { setSelectedRoute(existing); return; }
      }

      // Otherwise, choose the easiest available by canonical difficulty order
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
      const route = sorted[0];
      if (route) setSelectedRoute(route);
    } else setSelectedRoute(null);
  }, [uiRoutes, selectedTrail]);

  // Update map coordinates when hiking spot changes
  useEffect(() => {
    let lat = 0;
    let lng = 0;

    if (typeof hikingSpot?.latitude === 'number' && typeof hikingSpot?.longitude === 'number') {
      lat = hikingSpot.latitude;
      lng = hikingSpot.longitude;
    } else if (hikingSpot?.coordinates?.coordinates && Array.isArray(hikingSpot.coordinates.coordinates)) {
      lng = hikingSpot.coordinates.coordinates[0];
      lat = hikingSpot.coordinates.coordinates[1];
    }

    if (lat && lng) {
      setCoordinates({
        latitude: lat,
        longitude: lng
      });
    }
  }, [hikingSpot]);

  // Animate Trail Information panel when selected route changes
  useEffect(() => {
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

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    // Basic null check
    if (!hikingSpot) {
      console.warn('handleFavoriteToggle: hikingSpot is null');
      return;
    }
    if (favoriteSaving) {
      return;
    }

    // Robust ID access
    const spotId = hikingSpot.id || (hikingSpot as any).hiking_spot_id;
    if (!spotId) {
      console.error('handleFavoriteToggle: missing spot ID', hikingSpot);
      Alert.alert('Error', 'Cannot favorite this spot: Missing ID');
      return;
    }

    setFavoriteSaving(true);
    try {
      const isCurrentlyFavorited = isSpotFavorited(spotId);

      let success;
      if (isCurrentlyFavorited) {
        success = await removeFromFavorites(spotId);
      } else {
        // Ensure the spot object has a valid ID for context usage
        const spotToSave = {
          ...hikingSpot,
          id: spotId,
          description: hikingSpot.description || '',
          image_url: hikingSpot.image_url || '',
          latitude: hikingSpot.latitude || 0,
          longitude: hikingSpot.longitude || 0,
          elevation: hikingSpot.elevation || 0,
          rating: hikingSpot.rating || (hikingSpot.average_rating || 0),
          review_count: hikingSpot.review_count || (hikingSpot.number_of_reviews || 0),
          estimated_duration: hikingSpot.estimated_duration ? String(hikingSpot.estimated_duration) : undefined,
          difficulty: (hikingSpot.difficulty as 'Easy' | 'Moderate' | 'Hard') || 'Moderate'
        };
        success = await addToFavorites(spotToSave);
      }

      if (!success) {
        Alert.alert('Error', 'Failed to update favorites. Please checks if you are logged in.');
      }

    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites: ' + String(error));
    } finally {
      setFavoriteSaving(false);
    }
  };

  // Handle fullscreen map toggle
  const handleFullscreenMap = () => {
    navigation.navigate('TrailMapFullScreen', {
      hiking_spot_id,
      spotName: hikingSpot?.name || 'Trail Map'
    });
  };

  // Handle trail selection from map or list
  const handleTrailSelect = useCallback((trailId: string) => {
    if (!trailId || !uiRoutes.length) return;
    const route = uiRoutes.find(r => String(r.id) === String(trailId));
    if (!route) return;

    setSelectedRoute(route);
    const normalizedTrail = normalizeTrailRoute({
      id: route.id,
      route_name: route.route_name,
      route_description: route.route_description || '',
      difficulty: route.difficulty || 'Unknown',
      distance: route.distance || 0,
      elevation_gain: route.elevation_gain || 0,
      estimated_duration: route.estimated_duration || 0,
      highlights: route.highlights || '',
      route_color: route.route_color || '#388E3C',
      start_coordinates: route.start_coordinates || null,
      end_coordinates: route.end_coordinates || null,
      coordinates: route.coordinates || [],
      waypoints: route.waypoints || '',
      created_at: route.created_at || new Date().toISOString(),
      updated_at: route.updated_at || new Date().toISOString(),
    });
    setSelectedTrail(normalizedTrail);

    // Scroll to trail info section
    if (trailInfoYRef.current && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: Math.max(trailInfoYRef.current - 20, 0),
        animated: true
      });
    }
  }, [uiRoutes, setSelectedTrail]);

  // Handle focus on map
  const handleFocusOnMap = (routeId: string) => {
    handleTrailSelect(routeId);
  };

  // Show loading state
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

  // Show error state
  if (error || !hikingSpot) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={COLORS.danger} />
          <Text style={styles.errorText}>
            {error || 'Hiking spot not found'}
          </Text>
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

  // Helper function to get local images based on spot name/id
  // This is a temporary fix to ensure carousel images appear until backend data is populated
  const getImagesForSpot = (spotName: string) => {
    const name = spotName.toLowerCase();
    if (name.includes('naupa')) {
      return [
        require('../../assets/images/mt naupa/thumbnail.jpg'),
        require('../../assets/images/mt naupa/2.jpg'),
        require('../../assets/images/mt naupa/3.jpg'),
        require('../../assets/images/mt naupa/4.jpg'),
        require('../../assets/images/mt naupa/5.jpg'),
      ];
    }
    if (name.includes('babag')) {
      return [
        require('../../assets/images/mount-babag/thumbnail.webp'),
        require('../../assets/images/mount-babag/2.jpg'),
        require('../../assets/images/mount-babag/3.webp'),
        require('../../assets/images/mount-babag/4.webp'),
        require('../../assets/images/mount-babag/5.jpg'),
      ];
    }
    if (name.includes('tagaytay')) {
      return [
        require('../../assets/images/Mount Tagaytay/1.webp'),
        require('../../assets/images/Mount Tagaytay/2.webp'),
        require('../../assets/images/Mount Tagaytay/3.webp'),
        require('../../assets/images/Mount Tagaytay/4.jpg'),
        require('../../assets/images/Mount Tagaytay/5.jpg'),
      ];
    }
    if (name.includes('mago')) {
      return [
        require('../../assets/images/mt mago/thumbnail.jpg'),
        require('../../assets/images/mt mago/2.webp'),
        require('../../assets/images/mt mago/3.jpg'),
        require('../../assets/images/mt mago/4.jpg'),
        require('../../assets/images/mt mago/5.webp'),
      ];
    }
    if (name.includes('mauyog')) {
      return [
        require('../../assets/images/mt mauyog/thumbnail.jpg'),
        require('../../assets/images/mt mauyog/2.jpg'),
        require('../../assets/images/mt mauyog/3.jpg'),
        require('../../assets/images/mt mauyog/4.jpg'),
        require('../../assets/images/mt mauyog/5.jpg'),
      ];
    }
    if (name.includes('lantoy')) {
      return [
        require('../../assets/images/mount latoy/thumbnail.webp'),
        require('../../assets/images/mount latoy/2.jpg'),
        require('../../assets/images/mount latoy/3.jpg'),
        require('../../assets/images/mount latoy/4.png'),
        require('../../assets/images/mount latoy/5.jpg'),
      ];
    }
    if (name.includes('lugsangan')) {
      return [
        require('../../assets/images/Lugsangan Peak/1.jpg'),
        require('../../assets/images/Lugsangan Peak/2.webp'),
        require('../../assets/images/Lugsangan Peak/3.jpg'),
        require('../../assets/images/Lugsangan Peak/4.jpg'),
        require('../../assets/images/Lugsangan Peak/5.jpg'),
      ];
    }
    if (name.includes('osmena') || name.includes('osmeña')) {
      return [
        require('../../assets/images/osmena peak/thumbnail.jpg'),
        require('../../assets/images/osmena peak/2.jpg'),
        require('../../assets/images/osmena peak/3.jpg'),
        require('../../assets/images/osmena peak/4.jpg'),
        require('../../assets/images/osmena peak/5.jpg'),
      ];
    }
    if (name.includes('kapayas')) {
      return [
        require('../../assets/images/mt kapayas/thumbnail.webp'),
        require('../../assets/images/mt kapayas/2.jpg'),
        require('../../assets/images/mt kapayas/3.jpg'),
        require('../../assets/images/mt kapayas/4.webp'),
        require('../../assets/images/mt kapayas/5.jpg'),
      ];
    }
    if (name.includes('kalbasan') || name.includes('kalbasaan')) {
      return [
        require('../../assets/images/mt kalbasan/thumbnail.jpg'),
        require('../../assets/images/mt kalbasan/2.jpg'),
        require('../../assets/images/mt kalbasan/3.jpg'),
        require('../../assets/images/mt kalbasan/4.jpg'),
        require('../../assets/images/mt kalbasan/5.jpg'),
      ];
    }
    if (name.includes('spartan')) {
      return [
        require('../../assets/images/spartantrail/thumbnail.jpg'),
        require('../../assets/images/spartantrail/2.jpg'),
        require('../../assets/images/spartantrail/3.jpg'),
        require('../../assets/images/spartantrail/4.jpg'),
        require('../../assets/images/spartantrail/5.jpg'),
      ];
    }

    // Return null to indicate no local override found
    return null;
  };

  // Determine images to show:
  // 1. Local override (if exists)
  // 2. Remote images (from DB)
  // 3. Placeholder
  const localImages = getImagesForSpot(hikingSpot.name);
  const carouselImages = localImages
    ? localImages
    : (hikingSpot.images && hikingSpot.images.length > 0)
      ? hikingSpot.images
      : [require('../../assets/images/placeholder-mountain.jpg')];

  // Resolve the correct ID, handling cases where 'id' might be missing but 'hiking_spot_id' exists
  const spotId = hikingSpot.id || (hikingSpot as any).hiking_spot_id;

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

        {/* Hiking Spot Header with Image Carousel */}
        <HikingSpotHeader
          name={hikingSpot.name}
          rating={hikingSpot.average_rating || 4.5}
          location={hikingSpot.location_text || hikingSpot.name}
          images={carouselImages}
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Content Container */}
          <View style={styles.contentContainer}>

            {/* Description Section */}
            <View style={styles.section}>
              <FavoriteButton
                isFavorite={isSpotFavorited(spotId)}
                isLoading={favoriteSaving}
                onPress={handleFavoriteToggle}
                style={{ marginBottom: 16, width: '100%' }}
              />
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>
                {hikingSpot.description || 'No description available for this hiking spot.'}
              </Text>
            </View>

            {/* Trail Map Section */}
            <TrailMapSection
              hikingSpotId={hiking_spot_id}
              selectedTrailId={selectedTrail?.id}
              trailRoutes={uiRoutes}
              onTrailSelect={handleTrailSelect}
              onFullscreenPress={handleFullscreenMap}
            />

            {/* Trail Routes Slider Section */}
            {trailRoutes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trail Routes</Text>
                <TrailRoutesSlider
                  routes={trailRoutes}
                  selectedRoute={selectedRoute ? findTrailRouteDetails(trailRoutes, selectedRoute.id) : null}
                  onRouteSelect={(route: TrailRouteDetails) => handleTrailSelect(route.route_id)}
                />
              </View>
            )}

            {/* Weather Widget */}
            {coordinates && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Current Weather</Text>
                <WeatherWidget
                  latitude={coordinates.latitude}
                  longitude={coordinates.longitude}
                  locationName={hikingSpot.name}
                />
              </View>
            )}

            {/* Trail Information Section */}
            <TrailInfoSection
              selectedRoute={selectedRoute}
              onFocusOnMap={handleTrailSelect}
            />



            {/* Leave No Trace Section */}
            <LeaveNoTraceSection />

            {/* Reviews Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <ReviewSystem
                hikingSpotId={hiking_spot_id}
              />
            </View>


          </View>
        </ScrollView>
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
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
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
    fontSize: 16,
    color: COLORS.error,
    marginVertical: 20,
    textAlign: 'center',
  },
  errorBackButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorBackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 16,
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
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textLight,
    marginTop: 8,
  },
  fullscreenMapContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  fullscreenMapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.primary,
  },
  fullscreenMapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  fullscreenMap: {
    flex: 1,
  },
  fullscreenMapStyle: {
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
