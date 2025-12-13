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
  start_coordinates?: Coordinates | null;
  end_coordinates?: Coordinates | null;
  geojson_path: GeoJSONPath;
  color?: string;
  isFallback?: boolean;
}

interface LeafletTrailMapProps {
  selectedHikingSpotId?: string;
  selectedTrailId?: string | null;
  onTrailSelect?: (trailId: string) => void;
  style?: StyleProp<ViewStyle>;
  showFullscreenButton?: boolean;
  includeCarouselBelowMap?: boolean;
  navigation?: any;
}

const DIFFICULTY_ORDER: Record<string, number> = {
  'Easy': 0,
  'Moderate': 1,
  'Hard': 2,
  'Very Hard': 3,
  'Extreme': 4
};

const DIFFICULTY_COLORS: Record<string, string> = {
  'Easy': '#2ecc71',
  'Moderate': '#f39c12',
  'Hard': '#e74c3c',
  'Advanced': '#8e44ad',
  'Expert': '#2c3e50'
};

const DEBUG_MAP = true;

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
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
    marginHorizontal: 6,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
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

});

const LeafletTrailMap: React.FC<LeafletTrailMapProps> = ({
  selectedHikingSpotId,
  selectedTrailId,
  onTrailSelect = () => { },
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
        console.log('[LEAFLET_MAP] Map is ready');
      }
    } catch (error) {
      console.error('[LEAFLET_MAP] Error handling WebView message:', error);
    }
  }, []);

  const selectTrailOnMap = useCallback((trailId: string) => {
    if (webViewRef.current && isMapReady) {
      const message = JSON.stringify({
        type: 'selectRoute',
        routeId: trailId
      });
      webViewRef.current.postMessage(message);
      console.log('[LEAFLET_MAP] Selected route on map:', trailId);
    }
  }, [isMapReady]);

  const handleTrailSelect = useCallback((trailId: string) => {
    console.log('[LEAFLET_MAP] Trail selected:', trailId);
    if (onTrailSelect) onTrailSelect(trailId);
    selectTrailOnMap(trailId);
  }, [onTrailSelect, selectTrailOnMap]);

  useEffect(() => {
    if (selectedTrailId && isMapReady) {
      selectTrailOnMap(selectedTrailId);
    }
  }, [selectedTrailId, isMapReady, selectTrailOnMap]);

  const preparedRoutes = useMemo<TrailRoute[]>(() => {
    if (!Array.isArray(databaseRoutes)) return [];

    const routes: TrailRoute[] = [...databaseRoutes];

    routes.sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] || 0) - (DIFFICULTY_ORDER[b.difficulty] || 0));

    console.log('[LEAFLET_MAP] Routes prepared:', routes.length);

    return routes.map(route => ({ ...route, color: DIFFICULTY_COLORS[route.difficulty] || '#2ecc71' }));
  }, [databaseRoutes]);

  const selectedRoute = useMemo(() => {
    return preparedRoutes.find(route => route.id === selectedTrailId) || null;
  }, [preparedRoutes, selectedTrailId]);

  useEffect(() => {
    if (preparedRoutes.length > 0 && !selectedTrailId) {
      console.log('[LEAFLET_MAP] Auto-selecting first route:', preparedRoutes[0].id);
      onTrailSelect(preparedRoutes[0].id);
    }
  }, [preparedRoutes, selectedTrailId, onTrailSelect]);

  useEffect(() => {
    const fetchTrailRoutes = async () => {
      if (!selectedHikingSpotId) return;

      setIsLoadingRoutes(true);
      setRouteError(null);

      try {
        console.log('[LEAFLET_MAP] Fetching routes for spot:', selectedHikingSpotId);
        const { data: routes, error } = await getTrailRoutesBySpotId(selectedHikingSpotId);

        if (error) {
          console.error('[LEAFLET_MAP] Error fetching routes:', error);
          setRouteError('Failed to load trail routes');
          return;
        }

        const routesArray: TrailRoute[] = Array.isArray(routes) ? routes : [];

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

        setDatabaseRoutes(validatedRoutes);
      } catch (error) {
        console.error('[LEAFLET_MAP] Error fetching routes:', error);
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
          const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
          
          // Prepared routes injected from React Native
          const routes = ${JSON.stringify(preparedRoutes)};
          let selectedRouteId = null;
          let currentPolyline = null;
          
          console.log('[TRAIL_MAP] Map initialized, routes available:', routes.length);
          
          // Log each route for debugging
          routes.forEach(function(route, index) {
            const count = route && route.geojson_path && route.geojson_path.coordinates ? route.geojson_path.coordinates.length : 0;
            console.log('[TRAIL_MAP] Route ' + (index + 1) + ':', route.route_name);
            console.log('[TRAIL_MAP] Coordinates:', count, 'points');
            if (count > 0) {
              console.log('[TRAIL_MAP] First point:', route.geojson_path.coordinates[0]);
              console.log('[TRAIL_MAP] Last point:', route.geojson_path.coordinates[count - 1]);
            }
          });
          
          // Create custom icons
          const createIcon = (html, className) => {
            return L.divIcon({
              html: html,
              className: className,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
          };
          
          const startIcon = createIcon('S', 'custom-marker');
          const endIcon = createIcon('E', 'custom-marker end-marker');

          const getColorByDifficulty = function(difficulty) {
            if (difficulty === 'Easy') return '#22C55E';
            if (difficulty === 'Moderate') return '#F59E0B';
            if (difficulty === 'Hard') return '#EF4444';
            return '#22C55E';
          };
          
          function drawRoute(route) {
            const raw = route && route.geojson_path && route.geojson_path.coordinates ? route.geojson_path.coordinates : [];
            if (!raw || raw.length < 3) {
              console.error('[TRAIL_MAP] Missing or invalid coordinates for route', route && route.id, 'count:', raw ? raw.length : 0);
              return;
            }
            
            // Convert [lng, lat] to [lat, lng] for Leaflet
            const coordinates = raw.map(function(coord){ return [coord[1], coord[0]]; });
            const color = getColorByDifficulty(route.difficulty);
            console.log('[TRAIL_MAP] Redrawing polyline + markers');
            console.log('[TRAIL_MAP] Coordinate count:', coordinates.length);
            console.log('[TRAIL_MAP] Example point:', coordinates[0]);
            
            currentPolyline = L.polyline(coordinates, {
              color: color,
              weight: 5,
              opacity: 0.9,
              smoothFactor: 1.5,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(map);
            
            // Add start marker at first coordinate
            L.marker(coordinates[0], { icon: startIcon }).addTo(map).bindPopup('Start');
            console.log('[TRAIL_MAP] Added Start marker at', coordinates[0]);
            
            // Add end marker at last coordinate
            L.marker(coordinates[coordinates.length - 1], { icon: endIcon }).addTo(map).bindPopup('End');
            console.log('[TRAIL_MAP] Added End marker at', coordinates[coordinates.length - 1]);
            
            // Fit bounds to the polyline
            map.fitBounds(currentPolyline.getBounds(), { padding: [30, 30] });
            console.log('[TRAIL_MAP] Fit bounds applied');
          }
          
          function selectRoute(routeId) {
            selectedRouteId = routeId;
            console.log('[TRAIL_MAP] Selected trail changed →', routeId);
            
            // Clear previous non-tile layers (preserve tile layer)
            map.eachLayer(function(layer){
              // tile layers have _url
              if (!layer._url) {
                map.removeLayer(layer);
              }
            });
            currentPolyline = null;
            
            // Find the selected route and draw it
            const route = routes.find(function(r){ return r.id === routeId; });
            if (route) {
              drawRoute(route);
            }
          }
          
          // Auto-select first route
          if (routes.length > 0) {
            const firstRouteId = ${selectedTrailId ? `'${selectedTrailId}'` : 'routes[0].id'};
            selectRoute(firstRouteId);
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
          setTimeout(() => {
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
            console.log('[LEAFLET_MAP] WebView loaded');
          }}
        />
      </View>
    );
  };

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    console.log('[LEAFLET_MAP] Fullscreen toggled:', !isFullscreen);
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

export default LeafletTrailMap;
