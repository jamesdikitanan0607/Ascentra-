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
import { TrailRoutesSection } from './components/TrailRoutesSection';
import { AvailableTrailsSection } from './components/AvailableTrailsSection';
import { TrailInfoSection } from './components/TrailInfoSection';
import { FavoriteButton } from './components/FavoriteButton';
import { useHikingSpotData } from './hooks/useHikingSpotData';
import { TrailRoute } from '../../types';
import LeafletTrailMap from '../../components/LeafletTrailMap';

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
  const [coordinates, setCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const trailInfoYRef = useRef<number>(0);
  const infoOpacity = useRef(new Animated.Value(0)).current;
  const infoTranslateY = useRef(new Animated.Value(12)).current;
  
  // Profile context for favorites functionality
  const { addToFavorites, removeFromFavorites, isSpotFavorited, favoritesLoading } = useProfile();
  
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
  const uiRoutes: TrailRoute[] = Array.isArray(trailRoutes)
    ? trailRoutes.map((r) => ({
        id: r.route_id,
        route_name: r.route_name || 'Unnamed Route',
        difficulty: (r.difficulty || r.difficulty_level || 'Moderate') as TrailRoute['difficulty'],
        distance: r.distance_km || 0,
        elevation_gain: r.elevation_gain_m || 0,
        estimated_duration: Math.round((r.estimated_duration_hr || 0) * 60),
        route_description: r.route_description || '',
        highlights: r.highlights || '',
        route_color: r.route_color || '#388E3C',
        start_coordinates: r.start_coordinates || { latitude: 0, longitude: 0 },
        end_coordinates: r.end_coordinates || { latitude: 0, longitude: 0 },
        coordinates: Array.isArray(r.route_coordinates)
          ? r.route_coordinates.map((c: { longitude: number; latitude: number }) => [c.longitude, c.latitude] as [number, number])
          : [],
        waypoints: r.waypoints || '',
        created_at: r.created_at,
        updated_at: r.updated_at,
      }))
    : [];

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
    if (hikingSpot?.coordinates?.coordinates) {
      setCoordinates({
        latitude: hikingSpot.coordinates.coordinates[1],
        longitude: hikingSpot.coordinates.coordinates[0]
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
  
  // Handle fullscreen map toggle
  const handleFullscreenMap = () => {
    setIsFullscreenMap(true);
  };
  
  const handleCloseFullscreen = () => {
    setIsFullscreenMap(false);
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
          images={hikingSpot.images || []}
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
            {/* Available Trails Section */}
            <AvailableTrailsSection
              trailRoutes={trailRoutes}
              selectedTrailId={selectedTrail?.id}
              onSelectTrail={(trail) => {
                handleTrailSelect(trail.id);
              }}
              hikingSpotId={hiking_spot_id}
            />
            
            {/* Trail Map Section */}
            {coordinates && (
              <TrailMapSection
                hikingSpotId={hiking_spot_id}
                selectedTrailId={selectedTrail?.id}
                trailRoutes={trailRoutes}
                onTrailSelect={handleTrailSelect}
                onFullscreenPress={handleFullscreenMap}
              />
            )}
            
            {/* Trail Routes Section */}
            <TrailRoutesSection 
              trailRoutes={uiRoutes}
              onTrailSelect={handleTrailSelect}
              selectedTrailId={selectedRoute?.id || null}
            />

            {/* Trail Information Section */}
            <TrailInfoSection 
              selectedRoute={selectedRoute}
              onFocusOnMap={handleTrailSelect}
            />
            
            {/* Reviews Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <ReviewSystem 
                hikingSpotId={hiking_spot_id}
              />
            </View>

            {/* Weather Widget */}
            {coordinates && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Weather Forecast</Text>
                <WeatherWidget 
                  latitude={coordinates.latitude}
                  longitude={coordinates.longitude}
                />
              </View>
            )}
          </View>
        </ScrollView>
      
        {/* Fullscreen Map Modal */}
        <Modal
          visible={isFullscreenMap}
          animationType="slide"
          onRequestClose={handleCloseFullscreen}
        >
          <View style={styles.fullscreenMapContainer}>
            <View style={styles.fullscreenMapHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleCloseFullscreen}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.fullscreenMapTitle}>
                {selectedRoute?.route_name || 'Trail Map'}
              </Text>
              <View style={{ width: 40 }} />
            </View>
            
            <View style={styles.fullscreenMap}>
              <LeafletTrailMap
                selectedHikingSpotId={hiking_spot_id}
                selectedTrailId={selectedRoute?.id}
                onTrailSelect={handleTrailSelect}
                showFullscreenButton={false}
              />
            </View>
          </View>
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
    padding: 16,
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
