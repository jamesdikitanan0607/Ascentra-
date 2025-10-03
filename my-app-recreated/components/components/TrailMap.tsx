import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { TrailRouteDetails, fetchTrailRoutes } from '../services/supabaseService';
import { isInDemoMode } from '../services/supabaseClient';
import ErrorHandlingService from '../services/ErrorHandlingService';
import AvailableRoutes, { TrailRoute } from './AvailableRoutes';
import TrailInformation from './TrailInformation';
import WeatherWidget from './WeatherWidget';

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

export default function TrailMap({
  hikingSpotId,
  centerCoordinates,
  onWeatherUpdate,
}: TrailMapProps) {
  const webViewRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [routes, setRoutes] = useState<TrailRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<TrailRoute | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
  const [routesError, setRoutesError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Load trail routes from database (with demo fallback)
  const loadTrails = useCallback(async (attempt = 1) => {
    if (!hikingSpotId) {
      setRoutesError('Hiking spot ID is required to load trails');
      setIsLoadingRoutes(false);
      return;
    }

    try {
      setIsLoadingRoutes(true);
      setRoutesError(null);

      const { data, error } = await fetchTrailRoutes(hikingSpotId);

      if (error) {
        throw error;
      }

      // If in demo mode or no data, provide sample routes
      if (isInDemoMode || !data || (Array.isArray(data) && data.length === 0)) {
        if (isInDemoMode) {
          console.log('Demo mode: Using sample trail data');
        } else {
          console.log('No trail routes found in database, using sample data');
        }

        // Create sample trail routes for demo/testing
        const sampleRoutes: TrailRoute[] = [
          {
            id: 'sample-route-1',
            route_name: 'Mount Babag Summit Trail',
            difficulty: 'Moderate',
            distance: 8.5,
            elevation_gain: 650,
            estimated_duration: 3,
            route_description: 'The primary route to Mount Babag summit with well-marked trails and scenic viewpoints.',
            highlights: 'Summit viewpoint, City views, Sunrise spot',
            route_color: '#4CAF50',
            start_coordinates: { latitude: 10.3451, longitude: 123.8863 },
            end_coordinates: { latitude: 10.3470, longitude: 123.8885 },
            waypoints: JSON.stringify([
              { lat: 10.3451, lng: 123.8863 },
              { lat: 10.3458, lng: 123.8870 },
              { lat: 10.3465, lng: 123.8878 },
              { lat: 10.3470, lng: 123.8885 }
            ]),
            coordinates: [
              [123.8863, 10.3451],
              [123.8870, 10.3458],
              [123.8878, 10.3465],
              [123.8885, 10.3470]
            ],
          },
          {
            id: 'sample-route-2',
            route_name: 'Scenic Loop Trail',
            difficulty: 'Hard',
            distance: 12.3,
            elevation_gain: 750,
            estimated_duration: 4,
            route_description: 'A longer loop trail that offers multiple viewpoints and a more challenging experience.',
            highlights: 'Multiple viewpoints, Forest trail, Wildlife spotting',
            route_color: '#FF6B6B',
            start_coordinates: { latitude: 10.3451, longitude: 123.8863 },
            end_coordinates: { latitude: 10.3451, longitude: 123.8863 },
            waypoints: JSON.stringify([
              { lat: 10.3451, lng: 123.8863 },
              { lat: 10.3455, lng: 123.8868 },
              { lat: 10.3460, lng: 123.8872 },
              { lat: 10.3468, lng: 123.8880 },
              { lat: 10.3475, lng: 123.8887 },
              { lat: 10.3482, lng: 123.8894 },
              { lat: 10.3490, lng: 123.8902 },
              { lat: 10.3495, lng: 123.8908 },
              { lat: 10.3490, lng: 123.8915 },
              { lat: 10.3485, lng: 123.8920 },
              { lat: 10.3478, lng: 123.8918 },
              { lat: 10.3470, lng: 123.8910 },
              { lat: 10.3462, lng: 123.8902 },
              { lat: 10.3455, lng: 123.8890 },
              { lat: 10.3451, lng: 123.8863 }
            ]),
            coordinates: [
              [123.8863, 10.3451],
              [123.8868, 10.3455],
              [123.8872, 10.3460],
              [123.8880, 10.3468],
              [123.8887, 10.3475],
              [123.8894, 10.3482],
              [123.8902, 10.3490],
              [123.8908, 10.3495],
              [123.8915, 10.3490],
              [123.8920, 10.3485],
              [123.8918, 10.3478],
              [123.8910, 10.3470],
              [123.8902, 10.3462],
              [123.8890, 10.3455],
              [123.8863, 10.3451]
            ],
          }
        ];

        setRoutes(sampleRoutes);

        // Auto-select first route if none selected
        if (!selectedRoute && sampleRoutes.length > 0) {
          const firstRoute = sampleRoutes[0];
          setSelectedRoute(firstRoute);
          onWeatherUpdate?.(firstRoute.start_coordinates);
        }

        setRetryCount(0); // Reset retry count on success
        setIsLoadingRoutes(false);
        return;
      }

      if (!data || (Array.isArray(data) && data.length === 0)) {
        setRoutesError('No trail routes available for this hiking spot');
        setRoutes([]);
        setIsLoadingRoutes(false);
        return;
      }

      // Transform database routes to TrailRoute format
      const transformedRoutes: TrailRoute[] = (data as TrailRouteDetails[]).map((route: TrailRouteDetails, index: number) => ({
        id: route.route_id,
        route_name: route.route_name,
        difficulty: (route.difficulty_level || route.difficulty || 'Moderate') as TrailRoute['difficulty'],
        distance: route.distance_km,
        elevation_gain: route.elevation_gain_m,
        estimated_duration: route.estimated_duration_hr || 2,
        route_description: route.route_description,
        highlights: route.highlights,
        route_color: route.route_color || ROUTE_COLORS[index % ROUTE_COLORS.length],
        start_coordinates: route.start_coordinates || { latitude: 0, longitude: 0 },
        end_coordinates: route.end_coordinates || { latitude: 0, longitude: 0 },
        waypoints: route.waypoints,
        coordinates: (route.route_coordinates || []).map(coord => [coord.longitude || 0, coord.latitude || 0]),
      }));

      setRoutes(transformedRoutes);

      // Auto-select first route if none selected
      if (!selectedRoute && transformedRoutes.length > 0) {
        const firstRoute = transformedRoutes[0];
        setSelectedRoute(firstRoute);
        onWeatherUpdate?.(firstRoute.start_coordinates);
      }

      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      ErrorHandlingService.logError(error, 'trails', { hikingSpotId, attempt });

      const errorInfo = ErrorHandlingService.analyzeError(error, 'trails');

      if (errorInfo.retryable && attempt < MAX_RETRY_ATTEMPTS) {
        console.log(`Retrying trail load (attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS})`);
        setRetryCount(attempt);
        setTimeout(() => loadTrails(attempt + 1), RETRY_DELAY);
        return;
      }

      const contextualMessage = ErrorHandlingService.getContextualErrorMessage(error, 'trails');
      setRoutesError(contextualMessage);
    } finally {
      setIsLoadingRoutes(false);
    }
  }, [hikingSpotId, selectedRoute, onWeatherUpdate]);

  useEffect(() => {
    if (hikingSpotId) {
      loadTrails();
    }
  }, [hikingSpotId, loadTrails]);

  const sendMessageToWebView = useCallback((message: any) => {
    if (webViewRef.current && mapReady) {
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  }, [mapReady]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case 'mapReady':
          setMapReady(true);
          setIsLoading(false);
          setMapError(null);
          break;
        case 'mapError':
          console.error('Map error:', data.error);
          if (retryCount < MAX_RETRY_ATTEMPTS) {
            console.log(`Retrying map load (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
            setRetryCount(prev => prev + 1);
            setTimeout(() => {
              webViewRef.current?.reload();
            }, RETRY_DELAY);
          } else {
            setMapError(data.error || 'Failed to load map');
            setIsLoading(false);
          }
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  }, [retryCount]);

  const handleRouteSelect = useCallback((route: TrailRoute) => {
    setSelectedRoute(route);

    // Send route data to map - WebView expects [lng, lat] format
    const webViewCoordinates = (route.coordinates || []).map((coord: any) => [
      coord.longitude || 0,
      coord.latitude || 0
    ]);

    sendMessageToWebView({
      type: 'selectRoute',
      route: {
        ...route,
        coordinates: webViewCoordinates,
        waypoints: route.waypoints,
        start_coordinates: [
          route.start_coordinates?.longitude || 0,
          route.start_coordinates?.latitude || 0
        ],
        end_coordinates: [
          route.end_coordinates?.longitude || 0,
          route.end_coordinates?.latitude || 0
        ],
      },
    });

    // Update weather with route coordinates
    onWeatherUpdate?.(route.start_coordinates);
  }, [sendMessageToWebView, onWeatherUpdate]);

  const toggleMapType = useCallback(() => {
    const newMapType = mapType === 'standard' ? 'satellite' : 'standard';
    setMapType(newMapType);
    sendMessageToWebView({
      type: 'changeMapType',
      mapType: newMapType,
    });
  }, [mapType, sendMessageToWebView]);

  const centerMap = useCallback(() => {
    if (selectedRoute) {
      sendMessageToWebView({
        type: 'centerMap',
        coordinates: [selectedRoute.start_coordinates.longitude, selectedRoute.start_coordinates.latitude],
      });
    }
  }, [selectedRoute, sendMessageToWebView]);

  const handleRetryMap = useCallback(() => {
    setMapError(null);
    setIsLoading(true);
    setRetryCount(0);
    webViewRef.current?.reload();
  }, []);

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
        .custom-div-icon {
          background: none;
          border: none;
        }
        .trail-marker {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .waypoint-marker {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 1px solid white;
          background-color: #2196F3;
          box-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <script>
        try {
          const map = L.map('map').setView([${centerCoordinates?.[0] || 14.5995}, ${centerCoordinates?.[1] || 120.9842}], 13);

          let currentMapType = '${mapType}';
          let tileLayer;

          function updateTileLayer() {
            if (tileLayer) {
              map.removeLayer(tileLayer);
            }

            if (currentMapType === 'satellite') {
              tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              });
            } else {
              tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
              });
            }

            tileLayer.addTo(map);
          }

          updateTileLayer();

          let routeLayers = [];
          let markerLayers = [];
          let waypointLayers = [];

          function clearLayers() {
            routeLayers.forEach(layer => map.removeLayer(layer));
            markerLayers.forEach(layer => map.removeLayer(layer));
            waypointLayers.forEach(layer => map.removeLayer(layer));
            routeLayers = [];
            markerLayers = [];
            waypointLayers = [];
          }

          function addRoute(route) {
            if (!route) return;

            // Add waypoints if available
            if (route.waypoints && typeof route.waypoints === 'string') {
              try {
                const waypoints = JSON.parse(route.waypoints);
                waypoints.forEach((waypoint, index) => {
                  if (waypoint.lat && waypoint.lng) {
                    const waypointMarker = L.circleMarker([waypoint.lat, waypoint.lng], {
                      radius: 4,
                      fillColor: '#2196F3',
                      color: '#ffffff',
                      weight: 1,
                      opacity: 0.8,
                      fillOpacity: 0.8
                    }).addTo(map);

                    waypointLayers.push(waypointMarker);
                  }
                });
              } catch (e) {
                console.error('Error parsing waypoints:', e);
              }
            }

            // Add route path
            if (route.coordinates && Array.isArray(route.coordinates)) {
              const polyline = L.polyline(route.coordinates, {
                color: route.color || '#FF6B6B',
                weight: 4,
                opacity: 0.8
              }).addTo(map);

              routeLayers.push(polyline);

              // Add start marker
              if (route.start_coordinates && route.start_coordinates.length === 2) {
                const startMarker = L.divIcon({
                  className: 'custom-div-icon',
                  html: '<div style="display: flex; flex-direction: column; align-items: center;">' +
                         '<div class="trail-marker" style="background-color: #4CAF50; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>' +
                         '<div style="background-color: #4CAF50; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: bold; margin-top: 2px; white-space: nowrap;">START</div>' +
                         '</div>',
                  iconSize: [50, 35],
                  iconAnchor: [25, 35]
                });

                const startMarkerLayer = L.marker(route.start_coordinates, { icon: startMarker }).addTo(map);
                markerLayers.push(startMarkerLayer);
              }

              // Add end marker
              if (route.end_coordinates && route.end_coordinates.length === 2) {
                const endMarker = L.divIcon({
                  className: 'custom-div-icon',
                  html: '<div style="display: flex; flex-direction: column; align-items: center;">' +
                         '<div class="trail-marker" style="background-color: #F44336; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>' +
                         '<div style="background-color: #F44336; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: bold; margin-top: 2px; white-space: nowrap;">END</div>' +
                         '</div>',
                  iconSize: [50, 35],
                  iconAnchor: [25, 35]
                });

                const endMarkerLayer = L.marker(route.end_coordinates, { icon: endMarker }).addTo(map);
                markerLayers.push(endMarkerLayer);
              }

              // Fit map to route bounds
              if (route.coordinates.length > 0) {
                const bounds = L.latLngBounds(route.coordinates);
                map.fitBounds(bounds, { padding: [20, 20] });
              }
            }
          }

          window.addEventListener('message', function(event) {
            try {
              const data = JSON.parse(event.data);

              switch(data.type) {
                case 'selectRoute':
                  clearLayers();
                  if (data.route) {
                    addRoute(data.route);
                  }
                  break;
                case 'changeMapType':
                  currentMapType = data.mapType;
                  updateTileLayer();
                  break;
                case 'centerMap':
                  if (data.coordinates) {
                    map.setView(data.coordinates, 15);
                  }
                  break;
              }
            } catch (error) {
              console.error('Error processing message:', error);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapError',
                error: error.message
              }));
            }
          });

          map.on('load', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapReady'
            }));
          });

          // Trigger mapReady immediately if map is already loaded
          setTimeout(() => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapReady'
            }));
          }, 1000);

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

  return (
    <View style={styles.container}>
      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading map...</Text>
          {retryCount > 0 && (
            <Text style={styles.retryText}>Retry attempt {retryCount}/{MAX_RETRY_ATTEMPTS}</Text>
          )}
        </View>
      )}

      {/* Map Error Overlay */}
      {mapError && (
        <View style={styles.errorOverlay}>
          <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorTitle}>Map Error</Text>
          <Text style={styles.errorMessage}>{mapError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetryMap}>
            <MaterialIcons name="refresh" size={20} color={COLORS.background} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={styles.webView}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          setMapError('Failed to load map content');
          setIsLoading(false);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView HTTP error:', nativeEvent);
          setMapError('Network error loading map');
          setIsLoading(false);
        }}
      />

      {/* Map Controls */}
      {mapReady && !mapError && (
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleMapType}>
            <MaterialIcons
              name={mapType === 'standard' ? 'satellite' : 'map'}
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={centerMap}>
            <MaterialIcons name="my-location" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setIsFullscreen(true)}
          >
            <MaterialIcons name="fullscreen" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* Available Routes Section */}
      <View style={styles.routesContainer}>
        <AvailableRoutes
          routes={routes}
          selectedRoute={selectedRoute}
          onRouteSelect={handleRouteSelect}
          isLoading={isLoadingRoutes}
          error={routesError}
        />
      </View>

      {/* Trail Information Section */}
      <View style={styles.trailInfoContainer}>
        <TrailInformation
          selectedRoute={selectedRoute}
          onRouteSelect={handleRouteSelect}
          availableRoutes={routes}
          isLoadingRoutes={isLoadingRoutes}
          routesError={routesError}
        />
      </View>

      {/* Weather Section */}
      {selectedRoute && (
        <View style={styles.weatherContainer}>
          <WeatherWidget
            latitude={selectedRoute.start_coordinates.latitude}
            longitude={selectedRoute.start_coordinates.longitude}
            locationName={selectedRoute.route_name}
            compact={true}
          />
        </View>
      )}

      {/* Fullscreen Modal */}
      <Modal
        visible={isFullscreen}
        animationType="slide"
        statusBarTranslucent={true}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  retryText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textLight,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.error,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
  mapControls: {
    position: 'absolute',
    top: 50,
    right: 16,
    gap: 8,
  },
  controlButton: {
    backgroundColor: COLORS.background,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  routesContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    maxHeight: 200,
  },
  trailInfoContainer: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: COLORS.background,
  },
  weatherContainer: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: COLORS.background,
    width: 48,
    height: 48,
    borderRadius: 24,
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
