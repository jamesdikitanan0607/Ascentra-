import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Platform, 
  TouchableOpacity, 
  Modal, 
  Text, 
  StatusBar, 
  ScrollView, 
  StyleProp, 
  ViewStyle,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { getTrailRoutesBySpotId } from '../services/supabaseService';
import TrailRoutesSection from './TrailRoutesSection';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface GeoJSONPath {
  type: 'LineString';
  coordinates: number[][];
}

interface TrailRoute {
  id: string;
  route_id: string;
  route_name: string;
  hiking_spot_id: string;
  difficulty: string;
  distance_km: number;
  elevation_gain_m: number;
  estimated_duration_min: number;
  route_description: string;
  route_features: string;
  start_coordinates?: Coordinates;
  end_coordinates?: Coordinates;
  start_latitude?: number;
  start_longitude?: number;
  end_latitude?: number;
  end_longitude?: number;
  waypoints?: Array<{ lat: number; lng: number }>;
  geojson_path: GeoJSONPath;
  color?: string;
  isFallback?: boolean;
}

interface LeafletTrailMapProps {
  selectedHikingSpotId: string;
  selectedTrailId?: string;
  onTrailSelect?: (trailId: string) => void;
  style?: StyleProp<ViewStyle>;
  showFullscreenButton?: boolean;
  includeCarouselBelowMap?: boolean;
  navigation?: any;
}

const DIFFICULTY_COLORS = {
  'Easy': '#22C55E',
  'Moderate': '#F59E0B', 
  'Hard': '#EF4444',
  'Expert': '#7C3AED'
};

const DIFFICULTY_ORDER = {
  'Easy': 1,
  'Moderate': 2,
  'Hard': 3,
  'Expert': 4
};

const LeafletTrailMapDebug: React.FC<LeafletTrailMapProps> = ({
  selectedHikingSpotId,
  selectedTrailId,
  onTrailSelect = () => {},
  style = {},
  showFullscreenButton = false,
  includeCarouselBelowMap = false,
  navigation,
}: LeafletTrailMapProps) => {
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(false);
  const [databaseRoutes, setDatabaseRoutes] = useState<TrailRoute[]>([]);
  const [routeError, setRouteError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  const handleWebViewMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapReady') {
        setIsMapReady(true);
        console.log('[TRAIL_MAP] Map is ready');
      }
    } catch (error) {
      console.error('[TRAIL_MAP] Error handling WebView message:', error);
    }
  }, []);

  const selectTrailOnMap = useCallback((trailId: string) => {
    if (webViewRef.current && isMapReady) {
      const message = JSON.stringify({
        type: 'selectRoute',
        routeId: trailId
      });
      webViewRef.current.postMessage(message);
      console.log('[TRAIL_MAP] Selected route on map:', trailId);
    }
  }, [isMapReady]);

  const handleTrailSelect = useCallback((trailId: string) => {
    console.log('[TRAIL_MAP] Trail selected:', trailId);
    if (onTrailSelect) onTrailSelect(trailId);
    selectTrailOnMap(trailId);
  }, [onTrailSelect, selectTrailOnMap]);

  // Sync external route selection to WebView
  useEffect(() => {
    if (selectedTrailId && isMapReady) {
      selectTrailOnMap(selectedTrailId);
    }
  }, [selectedTrailId, isMapReady, selectTrailOnMap]);

  const preparedRoutes = useMemo<TrailRoute[]>(() => {
    if (!Array.isArray(databaseRoutes)) return [];

    const routes: TrailRoute[] = [...databaseRoutes];
    routes.sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] || 0) - (DIFFICULTY_ORDER[b.difficulty] || 0));

    console.log('[TRAIL_MAP] Routes prepared:', routes.length);
    return routes.map(route => ({ ...route, color: DIFFICULTY_COLORS[route.difficulty] || '#2ecc71' }));
  }, [databaseRoutes]);

  const selectedRoute = useMemo(() => {
    return preparedRoutes.find(route => route.id === selectedTrailId) || null;
  }, [preparedRoutes, selectedTrailId]);

  useEffect(() => {
    if (preparedRoutes.length > 0 && !selectedTrailId) {
      console.log('[TRAIL_MAP] Auto-selecting first route:', preparedRoutes[0].id);
      onTrailSelect(preparedRoutes[0].id);
    }
  }, [preparedRoutes, selectedTrailId, onTrailSelect]);

  useEffect(() => {
    const fetchTrailRoutes = async () => {
      if (!selectedHikingSpotId) return;

      setIsLoadingRoutes(true);
      setRouteError(null);

      try {
        console.log('[TRAIL_MAP] Fetching routes for spot:', selectedHikingSpotId);
        const { data: routes, error } = await getTrailRoutesBySpotId(selectedHikingSpotId);

        if (error) {
          console.error('[TRAIL_MAP] Error fetching routes:', error);
          setRouteError('Failed to load trail routes');
          return;
        }

        const routesArray: TrailRoute[] = Array.isArray(routes) ? routes : [];
        console.log('[TRAIL_MAP] Raw routes received:', routesArray.length);

        const validatedRoutes = routesArray.map(route => {
          let geojsonPath: GeoJSONPath = { type: 'LineString', coordinates: [] };
          
          console.log('[TRAIL_MAP] Processing route:', route.route_name);
          console.log('[TRAIL_MAP] Raw geojson_path:', route.geojson_path);
          
          if (route.geojson_path) {
            if (typeof (route as any).geojson_path === 'string') {
              try { 
                geojsonPath = JSON.parse((route as any).geojson_path) as GeoJSONPath; 
                console.log('[TRAIL_MAP] Parsed string geojson_path:', geojsonPath);
              } catch (e) {
                console.error('[TRAIL_MAP] Failed to parse geojson_path string:', e);
              }
            } else if (route.geojson_path.coordinates && Array.isArray(route.geojson_path.coordinates)) {
              geojsonPath = route.geojson_path;
              console.log('[TRAIL_MAP] Using object geojson_path:', geojsonPath);
            }
          }
          
          // Validate coordinates
          if (!geojsonPath.coordinates || geojsonPath.coordinates.length < 2) {
            console.error('[TRAIL_MAP] Missing or invalid coordinates for route:', route.route_name, 'coords:', geojsonPath.coordinates?.length || 0);
            return null; // Skip invalid routes
          }
          
          console.log('[TRAIL_MAP] Valid route:', route.route_name, 'with', geojsonPath.coordinates.length, 'coordinate points');
          console.log('[TRAIL_MAP] First coord:', geojsonPath.coordinates[0], 'Last coord:', geojsonPath.coordinates[geojsonPath.coordinates.length - 1]);
          
          return {
            ...route,
            id: route.route_id || route.id,
            geojson_path: geojsonPath,
            color: DIFFICULTY_COLORS[route.difficulty] || '#FFC107',
            isFallback: false
          } as TrailRoute;
        }).filter(route => route !== null); // Remove invalid routes

        console.log('[TRAIL_MAP] Valid routes after processing:', validatedRoutes.length);
        setDatabaseRoutes(validatedRoutes);
      } catch (error) {
        console.error('[TRAIL_MAP] Error fetching routes:', error);
        setRouteError('Failed to load trail routes');
      } finally {
        setIsLoadingRoutes(false);
      }
    };

    fetchTrailRoutes();
  }, [selectedHikingSpotId]);

  const renderMap = (customStyle?: StyleProp<ViewStyle>): JSX.Element => {
    if (isLoadingRoutes) {
      return (
        <View style={[styles.loadingContainer, customStyle]}>
          <ActivityIndicator size="large" color="#388E3C" />
          <Text style={styles.loadingText}>Loading trail map...</Text>
        </View>
      );
    }
    if (routeError) {
      return (
        <View style={[styles.errorContainer, customStyle]}>
          <MaterialIcons name="error-outline" size={24} color="#F44336" />
          <Text style={styles.errorText}>{routeError}</Text>
          {preparedRoutes.length === 0 && (
            <Text style={styles.errorSubtext}>No trail routes available yet for this hiking spot</Text>
          )}
        </View>
      );
    }

    const mapHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Trail Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          body, html { margin: 0; padding: 0; height: 100%; }
          #map { height: 100%; width: 100%; }
          .custom-marker {
            background-color: #22C55E;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          .end-marker {
            background-color: #EF4444 !important;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          // Initialize map - will be recentered to actual trail coordinates
          const map = L.map('map').setView([10.3157, 123.8854], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
          
          let routeLayers = {};
          let selectedRouteId = null;
          const routes = ${JSON.stringify(preparedRoutes)};
          
          console.log('[TRAIL_MAP] Map initialized, routes available:', routes.length);
          
          // Log each route for debugging
          routes.forEach(function(route, index) {
            console.log('[TRAIL_MAP] Route ' + (index + 1) + ':', route.route_name);
            console.log('[TRAIL_MAP] Coordinates:', route.geojson_path ? route.geojson_path.coordinates.length : 0, 'points');
            if (route.geojson_path && route.geojson_path.coordinates && route.geojson_path.coordinates.length > 0) {
              console.log('[TRAIL_MAP] First point:', route.geojson_path.coordinates[0]);
              console.log('[TRAIL_MAP] Last point:', route.geojson_path.coordinates[route.geojson_path.coordinates.length - 1]);
            }
          });
          
          // Create custom icons
          const createIcon = function(html, className) {
            return L.divIcon({
              html: html,
              className: className,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
          };
          
          const startIcon = createIcon('S', 'custom-marker');
          const endIcon = createIcon('E', 'custom-marker end-marker');
          
          function drawRoute(route) {
            if (!route.geojson_path || !route.geojson_path.coordinates || route.geojson_path.coordinates.length < 2) {
              console.error('[TRAIL_MAP] No valid coordinates for route:', route.route_name, 'coords:', route.geojson_path ? route.geojson_path.coordinates.length : 0);
              return;
            }
            
            // Convert [lng, lat] to [lat, lng] for Leaflet
            const coordinates = route.geojson_path.coordinates.map(function(coord) { return [coord[1], coord[0]]; });
            const isSelected = selectedRouteId === route.id;
            
            console.log('[TRAIL_MAP] Drawing route:', route.route_name, 'with', coordinates.length, 'points');
            console.log('[TRAIL_MAP] Route bounds:', coordinates[0], '→', coordinates[coordinates.length - 1]);
            console.log('[TRAIL_MAP] Selected:', isSelected, 'Color:', isSelected ? '#22C55E' : (route.color || '#9CA3AF'));
            
            const polyline = L.polyline(coordinates, {
              color: isSelected ? '#22C55E' : (route.color || '#9CA3AF'),
              weight: isSelected ? 6 : 4,
              opacity: isSelected ? 1.0 : 0.7,
              dashArray: isSelected ? null : '5, 10',
              smoothFactor: 1.0,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(map);
            
            routeLayers[route.id] = polyline;
            
            // Add start marker at first coordinate
            if (coordinates.length > 0) {
              const startMarker = L.marker(coordinates[0], {
                icon: startIcon
              }).addTo(map).bindPopup('Start: ' + route.route_name);
              console.log('[TRAIL_MAP] Added start marker at:', coordinates[0]);
            }
            
            // Add end marker at last coordinate
            if (coordinates.length > 1) {
              const endMarker = L.marker(coordinates[coordinates.length - 1], {
                icon: endIcon
              }).addTo(map).bindPopup('End: ' + route.route_name);
              console.log('[TRAIL_MAP] Added end marker at:', coordinates[coordinates.length - 1]);
            }
          }
          
          function selectRoute(routeId) {
            selectedRouteId = routeId;
            console.log('[TRAIL_MAP] Selecting route:', routeId);
            
            // Clear and redraw all routes
            Object.values(routeLayers).forEach(function(layer) {
              if (layer) map.removeLayer(layer);
            });
            routeLayers = {};
            
            routes.forEach(function(route) { drawRoute(route); });
            
            // Fit bounds to selected route with proper logging
            if (routeLayers[routeId]) {
              const bounds = routeLayers[routeId].getBounds();
              map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
              console.log('[TRAIL_MAP] Fitted bounds for route:', routeId);
              console.log('[TRAIL_MAP] Selected route bounds:', bounds.getSouthWest(), '→', bounds.getNorthEast());
            }
          }
          
          // Initialize routes
          console.log('[TRAIL_MAP] Drawing initial routes...');
          routes.forEach(function(route) { drawRoute(route); });
          
          // Auto-select first route
          if (routes.length > 0) {
            const firstRouteId = ${selectedTrailId ? `'${selectedTrailId}'` : 'routes[0].id'};
            console.log('[TRAIL_MAP] Auto-selecting route:', firstRouteId);
            selectRoute(firstRouteId);
          }
          
          // Fit bounds to all routes initially - this will center on actual mountain coordinates
          if (routes.length > 0 && Object.keys(routeLayers).length > 0) {
            const validLayers = Object.values(routeLayers).filter(function(layer) { return layer; });
            if (validLayers.length > 0) {
              const group = new L.featureGroup(validLayers);
              const bounds = group.getBounds();
              map.fitBounds(bounds, { padding: [30, 30] });
              console.log('[TRAIL_MAP] Fitted bounds to', validLayers.length, 'routes');
              console.log('[TRAIL_MAP] Map bounds:', bounds.getSouthWest(), '→', bounds.getNorthEast());
            }
          }
          
          // Handle messages from React Native
          window.addEventListener('message', function(event) {
            try {
              const data = JSON.parse(event.data);
              if (data.type === 'selectRoute' && data.routeId) {
                selectRoute(data.routeId);
              }
            } catch (e) {
              // Ignore parsing errors
            }
          });
          
          // Notify React Native that map is ready
          setTimeout(function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapReady'
            }));
          }, 500);
        </script>
      </body>
      </html>
    `;

    return (
      <View style={[styles.mapContainer, customStyle]}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.webview}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          onLoadEnd={() => {
            console.log('[TRAIL_MAP] WebView loaded');
          }}
        />
      </View>
    );
  };

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    console.log('[TRAIL_MAP] Fullscreen toggled:', !isFullscreen);
  }, [isFullscreen]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.mapContainer}>
        {renderMap()}
      </View>

      {includeCarouselBelowMap && (
        <View style={styles.routesSection}>
          <TrailRoutesSection 
            routes={preparedRoutes}
            onRoutePress={handleTrailSelect}
          />
        </View>
      )}

      {showFullscreenButton && (
        <TouchableOpacity style={styles.fullscreenButton} onPress={toggleFullscreen}>
          <MaterialIcons name="fullscreen" size={24} color="#388E3C" />
        </TouchableOpacity>
      )}

      <Modal visible={isFullscreen} animationType="slide" onRequestClose={toggleFullscreen}>
        <View style={styles.fullscreenContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <SafeAreaView style={styles.fullscreenSafeArea}>
            <View style={styles.fullscreenHeader}>
              <TouchableOpacity onPress={toggleFullscreen} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={24} color="#333" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <Text style={styles.fullscreenTitle}>Trail Map - Full Screen</Text>
              <TouchableOpacity style={styles.closeButton} onPress={toggleFullscreen}>
                <MaterialIcons name="close" size={24} color="#212121" />
              </TouchableOpacity>
            </View>

            <View style={styles.fullscreenMapContainer}>
              {renderMap(styles.fullscreenMap)}
            </View>

            {!isLoadingRoutes && preparedRoutes.length > 0 && (
              <View style={styles.trailListContainer}>
                <Text style={styles.trailListTitle}>Available Trails</Text>
                <ScrollView style={styles.trailList} horizontal contentContainerStyle={styles.trailListContent}>
                  {preparedRoutes.map((trail) => (
                    <TouchableOpacity
                      key={trail.id}
                      style={[styles.trailItem, selectedTrailId === trail.id && styles.selectedTrailItem]}
                      onPress={() => handleTrailSelect(trail.id)}
                    >
                      <View style={styles.trailHeader}>
                        <Text style={styles.trailName} numberOfLines={1}>{trail.route_name}</Text>
                        <View style={[styles.difficultyBadge, { backgroundColor: trail.color }]}>
                          <Text style={styles.difficultyText}>{trail.difficulty}</Text>
                        </View>
                      </View>
                      <View style={styles.trailStats}>
                        <View style={styles.trailStat}>
                          <MaterialIcons name="straighten" size={14} color="#666" />
                          <Text style={styles.trailStatText}>{trail.distance_km}km</Text>
                        </View>
                        <View style={styles.trailStat}>
                          <MaterialIcons name="trending-up" size={14} color="#666" />
                          <Text style={styles.trailStatText}>{trail.elevation_gain_m}m</Text>
                        </View>
                        <View style={styles.trailStat}>
                          <MaterialIcons name="schedule" size={14} color="#666" />
                          <Text style={styles.trailStatText}>{trail.estimated_duration_min}min</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  mapContainer: {
    flex: 1,
    minHeight: 320,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fullscreenButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: '100%',
  },
  fullscreenSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  fullscreenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    minHeight: 44,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
  },
  fullscreenMapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullscreenMap: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  routesSection: {
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  trailListContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: Dimensions.get('window').height * 0.25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  trailListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  trailList: {
    flexGrow: 0,
  },
  trailListContent: {
    paddingHorizontal: 4,
  },
  trailItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 6,
    minWidth: 160,
    maxWidth: 180,
    borderWidth: 1,
    borderColor: 'rgba(224, 224, 224, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedTrailItem: {
    borderColor: '#388E3C',
    borderWidth: 2,
    backgroundColor: 'rgba(56, 142, 60, 0.1)',
  },
  trailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  trailName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  trailStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  trailStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trailStatText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 320,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 12,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
    marginHorizontal: 6,
    marginBottom: 8,
    minHeight: 320,
  },
  errorText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  errorSubtext: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default LeafletTrailMapDebug;
