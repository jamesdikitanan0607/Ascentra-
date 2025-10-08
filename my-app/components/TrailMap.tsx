import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { fetchTrailRoutes } from '../services/supabaseService';
import { isInDemoMode } from '../services/supabaseClient';
import { TrailInfoCarousel } from './TrailInfoCarousel';
import { MaterialIcons } from '@expo/vector-icons';

// Import TrailRoute type from shared types
import { TrailRoute } from '../types';

// Type for the raw trail route data from the API
interface TrailRouteDetails extends Omit<TrailRoute, 'waypoints' | 'id' | 'distance' | 'elevation_gain' | 'estimated_duration' | 'difficulty'> {
  route_id: string;
  distance_km: number;
  elevation_gain_m: number;
  estimated_duration_hr: number;
  difficulty_level: string;
  waypoints: string; // Always stored as JSON string in the database
  coordinates: [number, number][];
  start_coordinates: { latitude: number; longitude: number };
  end_coordinates: { latitude: number; longitude: number };
}

// Helper function to parse waypoints from JSON string or object array
const parseWaypoints = (waypoints: string | Array<{latitude: number; longitude: number; name?: string; description?: string}>): Array<{latitude: number; longitude: number; name?: string; description?: string}> => {
  try {
    if (!waypoints) return [];
    if (typeof waypoints === 'string') {
      // If it's an empty string, return empty array
      if (waypoints.trim() === '') return [];
      // Try to parse as JSON
      const parsed = JSON.parse(waypoints);
      // Ensure we return an array
      return Array.isArray(parsed) ? parsed : [parsed];
    }
    // If it's already an array, return it
    return Array.isArray(waypoints) ? waypoints : [waypoints];
  } catch (error) {
    console.error('Error parsing waypoints:', error);
    return [];
  }
};

const COLORS = {
  primary: '#2196F3',
  text: '#212121',
  textLight: '#616161',
  card: '#F9F9F9',
  background: '#FFFFFF',
  error: '#F44336',
  warning: '#FF9800',
  success: '#4CAF50',
};

const ROUTE_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
];

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds

interface TrailMapProps {
  hikingSpotId?: string;
  centerCoordinates?: [number, number];
  onWeatherUpdate?: (coordinates: { latitude: number; longitude: number }) => void;
}

// Cache for storing loaded routes to prevent unnecessary refetches
const routeCache = new Map<string, TrailRoute[]>();

export const TrailMap = React.memo(({
  hikingSpotId,
  centerCoordinates = [0, 0],
  onWeatherUpdate,
}: TrailMapProps) => {
  const webViewRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [routes, setRoutes] = useState<TrailRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<TrailRoute | null>(null);
  const [, setIsLoadingRoutes] = useState(true);
  const [, setRoutesError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Handle layout changes for responsive design
  const handleLayout = useCallback((event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setMapDimensions({ width, height });
  }, []);

  // Format time since last update
  const formatTimeSinceLastUpdate = useCallback((date: Date | null) => {
    if (!date) return 'Never';
    
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return date.toLocaleDateString();
  }, []);

    // Load trail routes from database (with demo fallback)
  const loadTrails = useCallback(async (isRefreshing = false, attempt = 0) => {
    if (!hikingSpotId) {
      setRoutesError('Hiking spot ID is required to load trails');
      setIsLoadingRoutes(false);
      return;
    }

    try {
      if (isRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoadingRoutes(true);
      }
      setRoutesError(null);

      const { data, error } = await fetchTrailRoutes(hikingSpotId);

      if (error) {
        throw error;
      }

      // If in demo mode or no data, provide sample routes
      if (isInDemoMode || !data || (Array.isArray(data) && data.length === 0)) {
        const sampleRoutes: TrailRoute[] = [
          {
            id: 'sample-1',
            route_name: 'Osmeña Peak Trail',
            difficulty: 'Moderate',
            distance: 5.2,
            elevation_gain: 350,
            estimated_duration: 150, // in minutes
            route_description: 'A beautiful scenic trail with moderate difficulty, featuring stunning 360-degree views of Cebu',
            highlights: 'Panoramic views, unique rock formations, cool climate',
            route_color: ROUTE_COLORS[0],
            start_coordinates: { latitude: 10.3157, longitude: 123.8854 },
            end_coordinates: { latitude: 10.3257, longitude: 123.8954 },
            waypoints: JSON.stringify([
              { 
                latitude: 10.3157, 
                longitude: 123.8854, 
                name: 'Trailhead',
                description: 'Starting point of the trail with parking available'
              },
              { 
                latitude: 10.3187, 
                longitude: 123.8874, 
                name: 'First Viewpoint',
                description: 'First scenic viewpoint with rest area'
              },
              { 
                latitude: 10.3227, 
                longitude: 123.8914, 
                name: 'Summit',
                description: 'Highest point with 360° views'
              }
            ]),
            coordinates: [
              [123.8854, 10.3157],
              [123.8864, 10.3167],
              [123.8874, 10.3187],
              [123.8894, 10.3207],
              [123.8914, 10.3227],
              [123.8934, 10.3247],
              [123.8954, 10.3257]
            ]
          }
        ];
        setRoutes(sampleRoutes);
        setIsLoadingRoutes(false);
        return;
      }

      // Transform and set the routes
      const transformedRoutes: TrailRoute[] = (data as TrailRouteDetails[]).map((route, index) => {
        // Parse waypoints from string to array of waypoint objects
        let waypoints: string | Array<{latitude: number; longitude: number; name?: string; description?: string}> = [];
        
        try {
          // If waypoints is already an array, use it as is
          if (Array.isArray(route.waypoints)) {
            waypoints = route.waypoints;
          } 
          // If it's a string, parse it and ensure it's in the correct format
          else if (typeof route.waypoints === 'string') {
            // If it's an empty string, use empty array
            if (route.waypoints.trim() === '') {
              waypoints = [];
            } else {
              // Try to parse as JSON
              const parsed = JSON.parse(route.waypoints);
              waypoints = Array.isArray(parsed) ? parsed : [parsed];
            }
          }
          // If waypoints is undefined or null, use empty array
          else {
            waypoints = [];
          }
        } catch (error) {
          console.error('Error parsing waypoints for route', route.route_id, error);
          waypoints = [];
        }

        // Create the route object with proper type safety
        const trailRoute: TrailRoute = {
          id: route.route_id || `route-${index}`,
          route_name: route.route_name || 'Unnamed Trail',
          difficulty: (route.difficulty_level === 'Easy' ? 'Easy' : 
                      route.difficulty_level === 'Moderate' ? 'Moderate' :
                      route.difficulty_level === 'Hard' ? 'Hard' : 'Expert') as TrailRoute['difficulty'],
          distance: route.distance_km || 0,
          elevation_gain: route.elevation_gain_m || 0,
          estimated_duration: route.estimated_duration_hr || 2,
          route_description: route.route_description || '',
          highlights: route.highlights || '',
          route_color: route.route_color || ROUTE_COLORS[index % ROUTE_COLORS.length],
          start_coordinates: route.start_coordinates || { latitude: 0, longitude: 0 },
          end_coordinates: route.end_coordinates || { latitude: 0, longitude: 0 },
          waypoints,
          coordinates: route.coordinates || [],
          created_at: route.created_at,
          updated_at: route.updated_at
        };

        return trailRoute;
      });

      setRoutes(transformedRoutes);
      setIsLoadingRoutes(false);
      
      // Select the first route by default if none is selected
      if (!selectedRoute && transformedRoutes.length > 0) {
        setSelectedRoute(transformedRoutes[0]);
        onWeatherUpdate?.(transformedRoutes[0].start_coordinates);
      }
    } catch (error) {
      console.error('Error loading trails:', error);
      setRoutesError('Failed to load trail data. Please try again.');
      setIsLoadingRoutes(false);
      
      // Retry logic
      if (attempt < MAX_RETRY_ATTEMPTS) {
        console.log(`Retrying... Attempt ${attempt + 1} of ${MAX_RETRY_ATTEMPTS}`);
        setTimeout(() => loadTrails(isRefreshing, attempt + 1), RETRY_DELAY);
      }
    }
  }, [hikingSpotId, selectedRoute, onWeatherUpdate]);

  // Handle refresh action
  const handleRefresh = useCallback(() => {
    setLastUpdated(new Date());
    loadTrails(true);
  }, [loadTrails]);

  // Load trails when component mounts or hikingSpotId changes
  useEffect(() => {
    if (hikingSpotId) {
      loadTrails();
    }
  }, [hikingSpotId, loadTrails]);

  // Handle WebView messages
  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'mapReady':
          setMapReady(true);
          setIsLoading(false);
          break;
        case 'mapError':
          setMapError(message.error || 'Failed to load map');
          setIsLoading(false);
          break;
        case 'routeClick':
          // Handle route click if needed
          break;
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  }, []);

  // Handle route selection
  const handleRouteSelect = useCallback((route: TrailRoute) => {
    // Ensure waypoints are properly parsed before setting the selected route
    const routeWithParsedWaypoints = {
      ...route,
      waypoints: parseWaypoints(route.waypoints)
    };
    
    setSelectedRoute(routeWithParsedWaypoints);
    onWeatherUpdate?.(route.start_coordinates);
    
    // Send message to WebView to highlight the selected route
    if (webViewRef.current && route.coordinates && route.coordinates.length > 0) {
      webViewRef.current.injectJavaScript(`
        if (window.fitBoundsToRoute) {
          window.fitBoundsToRoute(${JSON.stringify(route.coordinates)});
        }
        true;
      `);
    }
  }, [onWeatherUpdate]);

  // Generate HTML for the WebView
  const mapHTML = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <style>
          body, html, #map {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <script>
          let map;
          let currentRouteLayer = null;
          
          try {
            // Initialize the map
            map = L.map('map').setView([${centerCoordinates[0]}, ${centerCoordinates[1]}], 13);
            
            // Add tile layer based on map type
            const tileLayer = L.tileLayer(
              'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 18,
              }
            ).addTo(map);
            
            // Function to fit bounds to a route
            window.fitBoundsToRoute = function(coordinates) {
              if (!map) return;
              
              // Remove previous route layer if it exists
              if (currentRouteLayer) {
                map.removeLayer(currentRouteLayer);
              }
              
              // Create a polyline for the route
              if (coordinates && coordinates.length > 0) {
                const latLngs = coordinates.map(coord => L.latLng(coord[0], coord[1]));
                currentRouteLayer = L.polyline(latLngs, { color: '#2196F3', weight: 4 }).addTo(map);
                map.fitBounds(currentRouteLayer.getBounds(), { padding: [20, 20] });
              }
            };
            
            // Notify React Native that the map is ready
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
            
          } catch (error) {
            console.error('Map initialization error:', error);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapError',
              error: error.message
            }));
          }
        </script>
      </body>
      </html>
    `;
  }, [centerCoordinates]);

  // Define all styles in one place
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
      position: 'relative',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.background,
    },
    loadingText: {
      marginTop: 10,
      color: COLORS.textLight,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: COLORS.background,
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.error,
      marginTop: 10,
      marginBottom: 5,
    },
    errorMessage: {
      fontSize: 14,
      color: COLORS.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 5,
    },
    retryButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    webView: {
      flex: 1,
    },
    mapControls: {
      position: 'absolute',
      top: 10,
      left: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 20,
      padding: 5,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    controlButton: {
      padding: 8,
      borderRadius: 15,
      margin: 2,
    },
    controlButtonActive: {
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
    },
    routeSelector: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      paddingHorizontal: 10,
    },
    routeList: {
      paddingHorizontal: 10,
    },
    routeButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 15,
      marginRight: 10,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    routeButtonSelected: {
      backgroundColor: COLORS.primary,
    },
    routeButtonText: {
      color: COLORS.text,
      marginRight: 5,
      maxWidth: 120,
    },
    routeButtonTextSelected: {
      color: 'white',
    },
    routeDifficulty: {
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    lastUpdatedContainer: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: 8,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 10,
      elevation: 3,
    },
    lastUpdatedText: {
      fontSize: 12,
      color: COLORS.textLight,
      marginRight: 4,
    },
    refreshButton: {
      padding: 4,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    trailInfoContainer: {
      backgroundColor: COLORS.background,
      borderTopWidth: 1,
      borderTopColor: '#eee',
      padding: 16,
    },
    noRoutesContainer: {
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.card,
      borderRadius: 12,
      margin: 16,
    },
    noRoutesTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.text,
      marginTop: 12,
      marginBottom: 8,
      textAlign: 'center',
    },
    noRoutesText: {
      fontSize: 14,
      color: COLORS.textLight,
      textAlign: 'center',
      lineHeight: 20,
    },
    routeInfoContainer: {
      position: 'absolute',
      bottom: 80,
      left: 10,
      right: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 12,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    routeInfoText: {
      flex: 1,
      marginRight: 10,
    },
    routeName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: COLORS.text,
      marginBottom: 4,
    },
    routeDetails: {
      fontSize: 12,
      color: COLORS.textLight,
      marginBottom: 4,
    },
    routeHighlights: {
      fontSize: 12,
      color: COLORS.textLight,
      fontStyle: 'italic',
    },
    directionsButton: {
      backgroundColor: COLORS.primary,
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullscreenContainer: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    closeButton: {
      position: 'absolute',
      top: 40,
      right: 20,
      zIndex: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,
    },
    fullscreenWebView: {
      flex: 1,
    },
  });

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  // Render error state
  if (mapError) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorTitle}>Map Error</Text>
        <Text style={styles.errorMessage}>{mapError}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setMapError(null);
            setIsLoading(true);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Last updated indicator */}
      {!isLoading && !isRefreshing && (
        <View style={styles.lastUpdatedContainer}>
          <Text style={styles.lastUpdatedText}>
            Updated {formatTimeSinceLastUpdate(lastUpdated)}
          </Text>
          <TouchableOpacity 
            onPress={handleRefresh}
            style={styles.refreshButton}
          >
            <MaterialIcons name="refresh" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Map View */}
      <WebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={[styles.webView, { 
          height: mapDimensions.height || '100%',
          opacity: isRefreshing ? 0.7 : 1
        }]}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onError={() => {
          setMapError('Failed to load map. Please check your internet connection.');
        }}
        onHttpError={() => {
          setMapError('Failed to load map resources. Please try again later.');
        }}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
      />

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            mapType === 'standard' && styles.controlButtonActive
          ]}
          onPress={() => setMapType('standard')}
        >
          <MaterialIcons name="map" size={24} color={mapType === 'standard' ? COLORS.primary : COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.controlButton,
            mapType === 'satellite' && styles.controlButtonActive
          ]}
          onPress={() => setMapType('satellite')}
        >
          <MaterialIcons name="satellite" size={24} color={mapType === 'satellite' ? COLORS.primary : COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setIsFullscreen(true)}
        >
          <MaterialIcons name="fullscreen" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Route Selector */}
      {routes.length > 0 && (
        <View style={styles.routeSelector}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.routeList}
          >
            {routes.map((route) => (
              <TouchableOpacity
                key={route.id}
                style={[
                  styles.routeButton,
                  selectedRoute?.id === route.id && styles.routeButtonSelected,
                ]}
                onPress={() => handleRouteSelect(route)}
              >
                <Text
                  style={[
                    styles.routeButtonText,
                    selectedRoute?.id === route.id && styles.routeButtonTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {route.route_name}
                </Text>
                <Text style={[styles.routeDifficulty, { color: route.route_color }]}>
                  {route.difficulty}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Trail Information Carousel */}
      <View style={styles.trailInfoContainer}>
        {routes.length > 0 ? (
          <TrailInfoCarousel 
            routes={routes}
            selectedRouteId={selectedRoute?.id || null}
            onSelectRoute={(route) => {
              setSelectedRoute(route);
              onWeatherUpdate?.(route.start_coordinates);
            }}
          />
        ) : (
          <View style={styles.noRoutesContainer}>
            <MaterialIcons name="terrain" size={48} color="#ccc" />
            <Text style={styles.noRoutesTitle}>Trail Data Loading</Text>
            <Text style={styles.noRoutesText}>
              Trail data is loading. Please check back shortly.
            </Text>
          </View>
        )}
      </View>

      {/* Remove      {/* Selected Route Info */}
      {selectedRoute && (
        <View style={styles.routeInfoContainer}>
          <View style={styles.routeInfoText}>
            <Text style={styles.routeName} numberOfLines={1}>
              {selectedRoute?.route_name}
            </Text>
            <Text style={styles.routeDetails}>
              {selectedRoute.distance.toFixed(1)} km • {Math.round(selectedRoute.estimated_duration * 60)} min • {selectedRoute.difficulty}
            </Text>
            {selectedRoute?.highlights ? (
              <Text style={styles.routeHighlights} numberOfLines={2}>
                {selectedRoute.highlights}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={() => {
              // Handle directions
            }}
          >
            <MaterialIcons name="directions" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Fullscreen Modal */}
      <Modal
        visible={isFullscreen}
        animationType="slide"
        onRequestClose={() => setIsFullscreen(false)}
      >
        <View style={styles.fullscreenContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsFullscreen(false)}
          >
            <MaterialIcons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <WebView
            source={{ html: mapHTML }}
            style={styles.fullscreenWebView}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  webView: {
    flex: 1,
    minHeight: 300,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mapControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  controlButton: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  controlButtonActive: {
    backgroundColor: '#f5f5f5',
  },
  routeSelector: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  routeList: {
    paddingBottom: 8,
  },
  routeButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 100,
    alignItems: 'center',
  },
  routeButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  routeButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  routeButtonTextSelected: {
    color: 'white',
  },
  routeDifficulty: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  routeInfoContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  routeInfoText: {
    flex: 1,
    marginRight: 12,
  },
  routeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  routeDetails: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  routeHighlights: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  directionsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fullscreenWebView: {
    flex: 1,
  },
});

export default TrailMap;
