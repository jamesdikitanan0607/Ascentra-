import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenMapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullscreenMap: {
    flex: 1,
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
  onTrailSelect = () => {},
  style = {},
  showFullscreenButton = false,
  navigation,
}: LeafletTrailMapProps) => {
  // Component state
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(false);
  const [databaseRoutes, setDatabaseRoutes] = useState<TrailRoute[]>([]);
  const [selectedTrail, setSelectedTrail] = useState<TrailRoute | null>(null);
  const [currentSpotId, setCurrentSpotId] = useState<string | undefined>(selectedHikingSpotId);
  const [routeError, setRouteError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  // Message handler for WebView
  const handleWebViewMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as { type: string; [key: string]: any };
      
      if (!data || typeof data.type !== 'string') {
        console.warn('Invalid WebView message format');
        return;
      }
      
      switch (data.type) {
        case 'mapReady':
          setIsMapReady(true);
          break;
        
        case 'trailSelected':
          if (data.trailId && typeof data.trailId === 'string' && onTrailSelect) {
            onTrailSelect(data.trailId);
          }
          break;
        
        default:
          console.log('Unhandled WebView message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  }, [onTrailSelect]);

  // Select trail on map via WebView
  const selectTrailOnMap = useCallback((trailId: string) => {
    if (webViewRef.current && isMapReady) {
      const message = JSON.stringify({
        type: 'selectTrail',
        trailId
      });
      webViewRef.current.postMessage(message);
      
      if (DEBUG_MAP) {
        console.log('[MAP] Selected route changed:', trailId);
      }
    }
  }, [isMapReady]);

  // Trail selection handler
  const handleTrailSelect = useCallback((trailId: string) => {
    if (onTrailSelect) onTrailSelect(trailId);
    selectTrailOnMap(trailId);
  }, [onTrailSelect, selectTrailOnMap]);

  // Difficulty color mapping
  const getDifficultyColor = (difficulty: string): string => {
    if (!difficulty) return '#9E9E9E';
    const difficultyLower = difficulty.toLowerCase().trim();
    switch (true) {
      case difficultyLower.includes('easy'): return '#2ecc71';
      case difficultyLower.includes('moderate'): return '#f39c12';
      case difficultyLower.includes('hard'): return '#e74c3c';
      default: return '#9E9E9E';
    }
  };

  // Update the data processing with proper array type checking
  const preparedRoutes = useMemo<TrailRoute[]>(() => {
    if (!Array.isArray(databaseRoutes)) return [];
    
    // Create a typed copy of the routes array
    const routes: TrailRoute[] = [...databaseRoutes];
    
    // Sort routes by difficulty
    routes.sort((a, b) => {
      const aDifficulty = a.difficulty || '';
      const bDifficulty = b.difficulty || '';
      return (DIFFICULTY_ORDER[aDifficulty] || 0) - (DIFFICULTY_ORDER[bDifficulty] || 0);
    });
    
    if (DEBUG_MAP) {
      console.log('[MAP] Routes loaded:', routes.length);
      console.log('[MAP] Route IDs:', routes.map(r => r.id));
      console.log('[MAP] Route difficulties:', routes.map(r => r.difficulty));
    }
    
    return routes.map(route => ({
      ...route,
      color: DIFFICULTY_COLORS[route.difficulty] || '#2ecc71'
    }));
  }, [databaseRoutes]);

  // Update the data fetching to handle array types properly
  useEffect(() => {
    const fetchTrailRoutes = async () => {
      if (!selectedHikingSpotId) return;
      
      setIsLoadingRoutes(true);
      setRouteError(null);
      
      try {
        console.log('[MAP] Fetching routes for spot:', selectedHikingSpotId);
        const { data: routes, error } = await getTrailRoutesBySpotId(selectedHikingSpotId);
        
        if (error) {
          console.error('[MAP] Error fetching routes:', error);
          setRouteError('Failed to load trail routes');
          return;
        }
        
        console.log('[MAP] Routes fetched:', Array.isArray(routes) ? routes.length : 0);
        
        // Ensure we have an array before processing
        const routesArray: TrailRoute[] = Array.isArray(routes) ? routes : [];
        
        const validatedRoutes = routesArray.map(route => {
          // Process geojson_path with proper type checking
          let geojsonPath: GeoJSONPath = { type: 'LineString', coordinates: [] };
          
          if (route.geojson_path) {
            if (typeof route.geojson_path === 'string') {
              try {
                geojsonPath = JSON.parse(route.geojson_path) as GeoJSONPath;
              } catch (e) {
                console.warn('[MAP] Invalid GeoJSON format for route:', route.route_id);
              }
            } else if (Array.isArray(route.geojson_path.coordinates)) {
              geojsonPath = route.geojson_path;
            }
          }
          
          // Fallback for empty routes
          if (!geojsonPath.coordinates.length) {
            console.warn('[MAP] Empty coordinates for route:', route.route_id);
            geojsonPath.coordinates = [[10.274, 123.896], [10.278, 123.902], [10.282, 123.909]];
          }
          
          return {
            ...route,
            id: route.route_id,
            geojson_path: geojsonPath,
            color: DIFFICULTY_COLORS[route.difficulty] || '#FFC107',
            isFallback: !route.geojson_path?.coordinates?.length
          } as TrailRoute;
        });
        
        setDatabaseRoutes(validatedRoutes);
        
        // Auto-select first route if none selected
        if (validatedRoutes.length > 0 && !selectedTrailId) {
          onTrailSelect(validatedRoutes[0].id);
        }
        
      } catch (err) {
        console.error('[MAP] Unexpected error:', err);
        setRouteError('Failed to process trail data');
      } finally {
        setIsLoadingRoutes(false);
      }
    };
    
    fetchTrailRoutes();
  }, [selectedHikingSpotId, onTrailSelect, selectedTrailId]);

  // Update the render function with proper type checking
  const renderMap = (customStyle?: StyleProp<ViewStyle>): JSX.Element => {
    // Show loading state
    if (isLoadingRoutes) {
      return (
        <View style={[styles.loadingContainer, customStyle]}>
          <ActivityIndicator size="large" color="#388E3C" />
          <Text style={styles.loadingText}>Fetching trail data...</Text>
        </View>
      );
    }
    
    // Show error state
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
    
    // Generate HTML for the map
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
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          // Initialize map
          const map = L.map('map').setView([10.3157, 123.8854], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'OpenStreetMap contributors'
          }).addTo(map);
          
          // Route layers
          let routeLayers = {};
          let selectedLayer = null;
          
          // Handle messages from React Native
          window.handleMessage = function(data) {
            try {
              if (data.type === 'drawRoutes') {
                // Clear existing layers
                Object.values(routeLayers).forEach(layer => {
                  if (layer) map.removeLayer(layer);
                });
                routeLayers = {};
                
                // Draw new routes
                data.routes.forEach(route => {
                  if (route.geojson_path && Array.isArray(route.geojson_path.coordinates)) {
                    const coords = route.geojson_path.coordinates;
                    const layer = L.polyline(coords, {
                      color: route.color || '#2ecc71',
                      weight: 4,
                      opacity: 0.8,
                      smoothFactor: 1.0,
                      noClip: true
                    }).addTo(map);
                    
                    // Add start/end markers with custom icons
                    if (route.start_coordinates) {
                      L.marker([route.start_coordinates.latitude, route.start_coordinates.longitude], {
                        icon: L.divIcon({
                          className: 'start-marker',
                          html: '&#x1F7E2;',
                          iconSize: [20, 20]
                        })
                      }).addTo(map).bindPopup('Start: ' + route.route_name);
                    }
                    
                    if (route.end_coordinates) {
                      L.marker([route.end_coordinates.latitude, route.end_coordinates.longitude], {
                        icon: L.divIcon({
                          className: 'end-marker',
                          html: '&#x1F534;',
                          iconSize: [20, 20]
                        })
                      }).addTo(map).bindPopup('End: ' + route.route_name);
                    }
                    
                    routeLayers[route.id] = layer;
                  }
                });
                
                // Fit bounds to all routes
                const bounds = Object.values(routeLayers)
                  .filter(layer => !!layer)
                  .map(layer => layer.getBounds());
                if (bounds.length > 0) {
                  map.fitBounds(L.latLngBounds(bounds), { padding: [20, 20] });
                }
              } else if (data.type === 'selectRoute' && typeof data.routeId === 'string') {
                // Highlight selected route
                if (selectedLayer) {
                  selectedLayer.setStyle({ weight: 4 });
                }
                
                selectedLayer = routeLayers[data.routeId];
                if (selectedLayer) {
                  selectedLayer.setStyle({ weight: 8 });
                  selectedLayer.bringToFront();
                  map.fitBounds(selectedLayer.getBounds(), { padding: [50, 50] });
                }
              }
            } catch (error) {
              console.error('Error handling message:', error);
            }
          };
          
          // Post map ready message
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
      <WebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={[styles.webview, customStyle]}
        onLoadEnd={() => {
          setIsMapReady(true);
          // Draw routes when map is ready
          if (preparedRoutes.length > 0) {
            const message = JSON.stringify({
              type: 'drawRoutes',
              routes: preparedRoutes
            });
            webViewRef.current?.postMessage(message);
          }
        }}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    );
  };

  // Fullscreen toggle handler
  const toggleFullscreen = useCallback(() => {
    const newValue = !isFullscreen;
    setIsFullscreen(newValue);
    
    if (DEBUG_MAP) {
      console.log('[MAP] Fullscreen toggled:', newValue);
    }
    
    // Redraw routes when exiting fullscreen to ensure proper sizing
    if (!newValue && isMapReady && preparedRoutes.length > 0) {
      setTimeout(() => {
        const message = JSON.stringify({
          type: 'drawRoutes',
          routes: preparedRoutes
        });
        webViewRef.current?.postMessage(message);
      }, 300);
    }
  }, [isFullscreen, isMapReady, preparedRoutes]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.mapContainer}>
        {renderMap()}
      </View>
      
      <View style={styles.routesSection}>
        <TrailRoutesSection 
          routes={preparedRoutes}
          onRoutePress={handleTrailSelect}
        />
      </View>
      
      {showFullscreenButton && (
        <TouchableOpacity 
          style={styles.fullscreenButton}
          onPress={toggleFullscreen}
        >
          <MaterialIcons name="fullscreen" size={24} color="#388E3C" />
        </TouchableOpacity>
      )}

      <Modal
        visible={isFullscreen}
        animationType="slide"
        onRequestClose={toggleFullscreen}
      >
        <View style={styles.fullscreenContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <SafeAreaView style={styles.fullscreenSafeArea}>
            <View style={styles.fullscreenHeader}>
              <TouchableOpacity 
                onPress={toggleFullscreen}
                style={styles.backButton}
              >
                <MaterialIcons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.fullscreenTitle}>Trail Map</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={toggleFullscreen}
              >
                <MaterialIcons name="close" size={24} color="#212121" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.fullscreenMapContainer}>
              {renderMap(styles.fullscreenMap)}
            </View>
            
            {!isLoadingRoutes && preparedRoutes.length > 0 && (
              <View style={styles.trailListContainer}>
                <Text style={styles.trailListTitle}>Available Trails</Text>
                <ScrollView style={styles.trailList}>
                  {preparedRoutes.map((trail) => (
                    <TouchableOpacity
                      key={trail.id}
                      style={[
                        styles.trailItem,
                        selectedTrailId === trail.id && styles.selectedTrailItem
                      ]}
                      onPress={() => {
                        if (onTrailSelect) {
                          onTrailSelect(trail.id);
                        }
                        handleTrailSelect(trail.id);
                      }}
                    >
                      <View style={styles.trailHeader}>
                        <Text style={styles.trailName} numberOfLines={1}>
                          {trail.route_name}
                        </Text>
                        <View style={[
                          styles.difficultyBadge,
                          { backgroundColor: trail.color }
                        ]}>
                          <Text style={styles.difficultyText}>
                            {trail.difficulty}
                          </Text>
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
