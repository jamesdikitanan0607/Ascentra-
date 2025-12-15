import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTrailRoutesBySpotId } from '../services/supabaseService';
import TrailInfo from '../components/TrailInfo';
import LeafletTrailMap from '../components/LeafletTrailMap';
import TrailRoutesSection from '../components/TrailRoutesSection';
import { formatDistance, formatElevation } from '../utils/formatters';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

const COLORS = {
  primary: '#2E7D32',
  text: '#1F2933',
  textLight: '#546E7A',
  textMuted: '#9BA4AF',
  background: '#FAFAF7',
  card: '#FFFFFF',
  error: '#F44336',
  overlay: 'rgba(0, 0, 0, 0.4)',
  routeContainer: 'rgba(255, 255, 255, 0.4)',
  selectedRoute: 'rgba(46, 125, 50, 0.6)'
};

interface TrailRouteDetails {
  id: string;
  route_id: string;
  route_name: string;
  hiking_spot_id: string;
  difficulty: string;
  distance_km: number;
  elevation_gain_m: number;
  estimated_duration_min: number;
  start_coordinates?: { latitude: number; longitude: number } | null;
  end_coordinates?: { latitude: number; longitude: number } | null;
  geojson_path?: { type: 'LineString'; coordinates: number[][] };
  route_description?: string;
}

interface TrailMapFullScreenProps {
  navigation: any;
  route: {
    params: {
      hiking_spot_id: string;
      spotName?: string;
    };
  };
}

function TrailMapFullScreen({ navigation, route }: TrailMapFullScreenProps) {
  const { hiking_spot_id, spotName } = route.params;
  const { width, height } = useWindowDimensions();

  // Responsive breakpoints
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  const isLandscape = width > height;

  const [trailRoutes, setTrailRoutes] = useState<TrailRouteDetails[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<TrailRouteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [webViewRef, setWebViewRef] = useState<WebView | null>(null);
  const [showTrailInfo, setShowTrailInfo] = useState(true);

  // User Location & Navigation State
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Searching...');

  useEffect(() => {
    fetchTrailRoutes();
  }, [hiking_spot_id]);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    const setupLocationTracking = async () => {
      try {
        setLocationStatus('Requesting permissions...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        setPermissionStatus(status);
        if (status !== 'granted') {
          console.log('Location permission denied');
          setLocationStatus('Permission Denied');
          Alert.alert('Permission Denied', 'Location access is required for navigation.');
          return;
        }

        setLocationStatus('Acquiring location...');

        // Start watching immediately
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000,
            distanceInterval: 5
          },
          (newLocation) => {
            console.log('Location update:', newLocation.coords.latitude, newLocation.coords.longitude);
            setUserLocation({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude
            });
            setLocationStatus('Location Found');
          }
        );
      } catch (error) {
        console.error('Error setting up location tracking:', error);
        setLocationStatus('Error: ' + (error instanceof Error ? error.message : String(error)));
      }
    };
    setupLocationTracking();
    return () => {
      if (locationSubscription) locationSubscription.remove();
    };
  }, []);

  async function fetchTrailRoutes() {
    setIsLoading(true);
    setError(null);
    try {
      const routesResponse = await getTrailRoutesBySpotId(hiking_spot_id);
      const routes = routesResponse?.data || [];

      if (routesResponse?.error) {
        console.error('Error fetching trail routes:', routesResponse.error);
        setError('Failed to load trail routes. Please try again later.');
        return;
      }

      setTrailRoutes(routes);
      if (routes && routes.length > 0) {
        setSelectedRoute(routes[0]);
      }
    } catch (error) {
      console.error('Error fetching trail routes:', error);
      setError('Failed to load trail routes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleGetDirections = () => {
    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location services to use this feature.');
      return;
    }
    setIsNavigating(!isNavigating);
  };

  const parseCoordinates = (coord: { latitude: number; longitude: number } | null): [number, number] | null => {
    if (!coord) return null;
    return [coord.latitude, coord.longitude];
  };

  const handleRouteSelect = (route: TrailRouteDetails) => {
    try {
      // Validate route object
      if (!route) {
        console.warn('TrailMapFullScreen: Cannot select null or undefined route');
        return;
      }

      if (!route.route_id) {
        console.warn('TrailMapFullScreen: Route missing route_id:', route);
        return;
      }

      setSelectedRoute(route);

      // Validate coordinates
      if (!route.start_coordinates || !route.end_coordinates) {
        console.warn('TrailMapFullScreen: Route missing coordinates:', {
          routeId: route.route_id,
          routeName: route.route_name,
          hasStart: !!route.start_coordinates,
          hasEnd: !!route.end_coordinates
        });
        return;
      }

      const startCoords = parseCoordinates(route.start_coordinates);
      const endCoords = parseCoordinates(route.end_coordinates);

      if (!startCoords || !endCoords) {
        console.warn('TrailMapFullScreen: Failed to parse route coordinates:', {
          routeId: route.route_id,
          routeName: route.route_name,
          startCoords: route.start_coordinates,
          endCoords: route.end_coordinates,
          parsedStart: startCoords,
          parsedEnd: endCoords
        });
        return;
      }

      // Validate WebView reference
      if (!webViewRef) {
        // console.warn('TrailMapFullScreen: WebView reference not available for route selection');
        return;
      }

      try {
        const centerLat = (startCoords[0] + endCoords[0]) / 2;
        const centerLng = (startCoords[1] + endCoords[1]) / 2;

        // Validate calculated center coordinates
        if (isNaN(centerLat) || isNaN(centerLng)) {
          console.error('TrailMapFullScreen: Invalid center coordinates calculated:', {
            centerLat,
            centerLng,
            startCoords,
            endCoords
          });
          return;
        }

        // Skip routes without valid names
        if (!route.route_name || route.route_name.trim() === '') {
          console.warn('TrailMapFullScreen: Skipping route without valid name:', route);
          return;
        }

        // Escape route name for JavaScript
        const escapedRouteName = route.route_name.replace(/'/g, "\\'").replace(/"/g, '\\"');

        // Extract full trail coordinates
        let trailCoordinates = [];
        if (route.geojson_path && route.geojson_path.coordinates && Array.isArray(route.geojson_path.coordinates)) {
          trailCoordinates = route.geojson_path.coordinates.map(coord => [coord[1], coord[0]]); // Convert [lng, lat] to [lat, lng]
        } else if (route.end_coordinates && Array.isArray(route.end_coordinates)) { // Typo in original file? Assuming end_coordinates is not an array? Original code had route.route_coordinates check which is not in interface
          // Assuming fallback
          trailCoordinates = [startCoords, endCoords];
        } else {
          // Fallback to start and end coordinates only
          trailCoordinates = [startCoords, endCoords];
        }

        const coordinatesString = JSON.stringify(trailCoordinates);

        const jsCode = `
          try {
            if (window.map && window.currentPolyline) {
              window.map.removeLayer(window.currentPolyline);
            }
            if (window.map && window.startMarker) {
              window.map.removeLayer(window.startMarker);
            }
            if (window.map && window.endMarker) {
              window.map.removeLayer(window.endMarker);
            }
            
            if (window.map) {
              window.map.setView([${centerLat}, ${centerLng}], 14);
              
              window.startMarker = L.marker([${startCoords[0]}, ${startCoords[1]}])
                .addTo(window.map)
                .bindPopup('Start: ${escapedRouteName}');
                
              window.endMarker = L.marker([${endCoords[0]}, ${endCoords[1]}])
                .addTo(window.map)
                .bindPopup('End: ${escapedRouteName}');
                
              // Use full trail coordinates for polyline
              const coordinates = ${coordinatesString};
              window.currentPolyline = L.polyline(coordinates, {
                color: '#2E7D32',
                weight: 4,
                opacity: 0.8,
                lineCap: 'round',
                lineJoin: 'round',
                smoothFactor: 1
              }).addTo(window.map);
              
              // Fit map to show the entire trail
              if (coordinates.length > 1) {
                window.map.fitBounds(coordinates, { padding: [20, 20] });
              }
            } else {
              console.error('TrailMapFullScreen JS: Map not available for route selection');
            }
          } catch (jsError) {
            console.error('TrailMapFullScreen JS: Error in route selection:', jsError);
          }
        `;

        webViewRef.postMessage(jsCode);
      } catch (jsCodeError) {
        console.error('TrailMapFullScreen: Error creating JavaScript code for route selection:', jsCodeError);
      }
    } catch (error) {
      console.error('TrailMapFullScreen: Unexpected error in handleRouteSelect:', error);
      console.error('TrailMapFullScreen: Route data:', route);
    }
  };

  const handleFitToRoute = () => {
    if (selectedRoute && webViewRef) {
      const startCoords = parseCoordinates(selectedRoute.start_coordinates || null);
      const endCoords = parseCoordinates(selectedRoute.end_coordinates || null);

      if (startCoords && endCoords) {
        const jsCode = `
          if (window.map && window.currentPolyline) {
            window.map.fitBounds(window.currentPolyline.getBounds(), { padding: [20, 20] });
          }
        `;
        webViewRef.postMessage(jsCode);
      }
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      // Validate event structure
      if (!event || !event.nativeEvent || !event.nativeEvent.data) {
        console.warn('TrailMapFullScreen: Invalid WebView message event structure');
        return;
      }

      let data;
      try {
        data = JSON.parse(event.nativeEvent.data);
      } catch (parseError) {
        console.error('TrailMapFullScreen: Failed to parse WebView message JSON:', parseError);
        console.error('TrailMapFullScreen: Raw message data:', event.nativeEvent.data);
        return;
      }

      // Validate message has type
      if (!data || typeof data.type !== 'string') {
        console.warn('TrailMapFullScreen: WebView message missing or invalid type:', data);
        return;
      }

      switch (data.type) {
        case 'mapReady':
          try {
            console.log('TrailMapFullScreen: Map is ready');
            // Map is ready, could trigger additional initialization if needed
          } catch (mapReadyError) {
            console.error('TrailMapFullScreen: Error handling mapReady event:', mapReadyError);
          }
          break;

        case 'routeClicked':
        case 'routeSelected':
          try {
            if (data.routeId) {
              const route = trailRoutes.find(r => r.route_id === data.routeId);
              if (route) {
                setSelectedRoute(route);
                setShowTrailInfo(true);
              } else {
                console.warn('TrailMapFullScreen: Route not found for ID:', data.routeId);
              }
            } else {
              console.warn('TrailMapFullScreen: Route selection message missing routeId');
            }
          } catch (routeSelectError) {
            console.error('TrailMapFullScreen: Error handling route selection:', routeSelectError);
          }
          break;

        case 'mapError':
          try {
            const errorMessage = data.message || 'Unknown map error occurred';
            console.error('TrailMapFullScreen: Map error received:', errorMessage);
            setError(`Map error: ${errorMessage}`);
          } catch (mapErrorHandlingError) {
            console.error('TrailMapFullScreen: Error handling map error message:', mapErrorHandlingError);
          }
          break;

        default:
          // Log unhandled message types for debugging
          // console.log('TrailMapFullScreen: Unhandled WebView message type:', data.type);
          break;
      }
    } catch (error) {
      console.error('TrailMapFullScreen: Unexpected error in handleWebViewMessage:', error);
      console.error('TrailMapFullScreen: Event data:', event);
    }
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'hard': return '#F44336';
      default: return COLORS.primary;
    }
  };

  // Create responsive styles
  const getResponsiveStyles = () => {
    const topBarTop = Platform.OS === 'ios' ? (isTablet ? 60 : 44) : (isTablet ? 40 : 20);
    const routesOverlayTop = Platform.OS === 'ios' ? (isTablet ? 140 : 120) : (isTablet ? 120 : 96);
    const controlButtonsBottom = Platform.OS === 'ios' ? (isTablet ? 140 : 120) : (isTablet ? 120 : 100);
    const trailInfoMaxHeight = isTablet ? height * 0.4 : height * 0.3;

    return StyleSheet.create({
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
        marginTop: 16,
        fontSize: 16,
        color: COLORS.textLight,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
      },
      errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
      errorText: {
        marginTop: 16,
        marginBottom: 24,
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
        paddingVertical: 12,
        borderRadius: 24,
      },
      retryButtonText: {
        marginLeft: 8,
        fontSize: 16,
        color: 'white',
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
      },
      routesSection: {
        marginBottom: 20,
      },
      routeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
      },
      difficultyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
      },
      difficultyText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
      },
      mapContainer: {
        flex: 1,
      },
      webView: {
        flex: 1,
      },
      topBar: {
        position: 'absolute',
        top: topBarTop,
        left: isTablet ? 24 : 16,
        right: isTablet ? 24 : 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.overlay,
        borderRadius: 24,
        paddingHorizontal: isTablet ? 20 : 16,
        paddingVertical: isTablet ? 16 : 12,
        zIndex: 10,
      },
      navButton: {
        padding: 8,
      },
      topBarTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
        marginHorizontal: 16,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
      },
      routesOverlay: {
        position: 'absolute',
        top: routesOverlayTop,
        left: isTablet ? 24 : 16,
        right: isTablet ? 24 : 16,
        maxHeight: isTablet ? height * 0.5 : height * 0.4,
        zIndex: 5,
      },
      routesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 12,
        backgroundColor: COLORS.overlay,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
      },
      routeItem: {
        backgroundColor: COLORS.overlay,
        borderRadius: 12,
        padding: isTablet ? 16 : 12,
        marginBottom: isTablet ? 12 : 8,
        borderWidth: 2,
        borderColor: 'transparent',
      },
      selectedRouteItem: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(46, 125, 50, 0.2)',
      },
      routeName: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
      },
      routeStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
      },
      routeStat: {
        fontSize: 12,
        color: COLORS.textLight,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
      },
      controlButtons: {
        position: 'absolute',
        bottom: controlButtonsBottom,
        right: isTablet ? 24 : 16,
        flexDirection: 'column',
        gap: isTablet ? 16 : 12,
        zIndex: 10,
      },
      controlButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.overlay,
        paddingHorizontal: isTablet ? 20 : 16,
        paddingVertical: isTablet ? 16 : 12,
        borderRadius: 24,
      },
      controlButtonText: {
        marginLeft: 8,
        fontSize: 14,
        color: 'white',
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
      },
      trailInfoPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: trailInfoMaxHeight,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 8,
      },
    });
  };

  const styles = getResponsiveStyles();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading trail map...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTrailRoutes}>
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Full-screen Map */}
      <View style={styles.mapContainer}>
        <LeafletTrailMap
          selectedHikingSpotId={hiking_spot_id}
          selectedTrailId={selectedRoute?.route_id}
          userLocation={userLocation || null}
          isNavigating={isNavigating}
          routes={trailRoutes}
          onTrailSelect={(trailId: string) => {
            const r = trailRoutes.find(tr => tr.route_id === trailId);
            if (r) setSelectedRoute(r);
          }}
        />
      </View>


      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle} numberOfLines={1}>
          {spotName || 'Trail Map'}
          {userLocation ? ' • ' + locationStatus : ' • ' + locationStatus}
        </Text>

        <TouchableOpacity style={styles.navButton} onPress={handleGoHome}>
          <Ionicons name="home" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Available Routes Overlay */}
      <View style={styles.routesOverlay}>
        <Text style={styles.routesTitle}>Available Routes</Text>
        {trailRoutes.map((route, index) => (
          <TouchableOpacity
            key={route.route_id}
            style={[
              styles.routeItem,
              selectedRoute?.route_id === route.route_id && styles.selectedRouteItem
            ]}
            onPress={() => handleRouteSelect(route)}
          >
            <View style={styles.routeHeader}>
              <Text style={styles.routeName} numberOfLines={1}>
                {route.route_name}
              </Text>
              <View style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(route.difficulty) }
              ]}>
                <Text style={styles.difficultyText}>
                  {route.difficulty}
                </Text>
              </View>
            </View>
            <Text style={styles.routeStats}>
              {formatDistance(route.distance_km)} • {formatElevation(route.elevation_gain_m)} elevation
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Control Buttons */}
      <View style={styles.controlButtons}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: isNavigating ? COLORS.error : COLORS.primary }]}
          onPress={handleGetDirections}
        >
          <Ionicons name={isNavigating ? "navigate" : "navigate-circle"} size={20} color="white" />
          <Text style={styles.controlButtonText}>
            {isNavigating ? "Stop" : "Directions"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handleFitToRoute}>
          <Ionicons name="locate" size={20} color="white" />
          <Text style={styles.controlButtonText}>Fit to Route</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowTrailInfo(!showTrailInfo)}
        >
          <Ionicons name={showTrailInfo ? "eye-off" : "eye"} size={20} color="white" />
          <Text style={styles.controlButtonText}>
            {showTrailInfo ? "Hide Info" : "Show Info"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Trail Information Panel */}
      {showTrailInfo && selectedRoute && (
        <View style={styles.trailInfoPanel}>
          <TrailInfo
            selectedRoute={selectedRoute}
            isLoading={false}
            error={null}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

export default TrailMapFullScreen;