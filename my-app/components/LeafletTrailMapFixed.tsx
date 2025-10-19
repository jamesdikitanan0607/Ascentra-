import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { MaterialIcons } from '@expo/vector-icons';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

// Custom hook for map bounds fitting
const MapBoundsFitter: React.FC<{ routes: TrailRoute[]; selectedRoute: TrailRoute | null }> = ({ routes, selectedRoute }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedRoute?.geojson_path?.coordinates) {
      const coords = selectedRoute.geojson_path.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
      if (coords.length > 0) {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [20, 20] });
        console.log('[LEAFLET_MAP] Fitted bounds for selected route:', selectedRoute.route_name);
      }
    } else if (routes.length > 0) {
      // Fit to all routes if no specific route selected
      const allCoords: [number, number][] = [];
      routes.forEach(route => {
        if (route.geojson_path?.coordinates) {
          route.geojson_path.coordinates.forEach(([lng, lat]) => {
            allCoords.push([lat, lng]);
          });
        }
      });
      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords);
        map.fitBounds(bounds, { padding: [40, 40] });
        console.log('[LEAFLET_MAP] Fitted bounds for all routes');
      }
    }
  }, [map, routes, selectedRoute]);
  
  return null;
};

const LeafletTrailMap: React.FC<LeafletTrailMapProps> = ({
  selectedHikingSpotId,
  selectedTrailId,
  onTrailSelect = () => {},
  style = {},
  showFullscreenButton = false,
  includeCarouselBelowMap = false,
  navigation,
}: LeafletTrailMapProps) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(false);
  const [databaseRoutes, setDatabaseRoutes] = useState<TrailRoute[]>([]);
  const [routeError, setRouteError] = useState<string | null>(null);

  const handleTrailSelect = useCallback((trailId: string) => {
    console.log('[LEAFLET_MAP] Trail selected:', trailId);
    if (onTrailSelect) onTrailSelect(trailId);
  }, [onTrailSelect]);

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

  // Auto-select first route if none selected
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
          if (route.geojson_path) {
            if (typeof (route as any).geojson_path === 'string') {
              try { geojsonPath = JSON.parse((route as any).geojson_path) as GeoJSONPath; } catch {}
            } else if (Array.isArray(route.geojson_path.coordinates)) {
              geojsonPath = route.geojson_path;
            }
          }
          if (!geojsonPath.coordinates.length) {
            geojsonPath.coordinates = [[123.896, 10.274], [123.902, 10.278], [123.909, 10.282]]; // fallback lon,lat
          }
          return {
            ...route,
            id: route.route_id,
            geojson_path: geojsonPath,
            color: DIFFICULTY_COLORS[route.difficulty] || '#FFC107',
            isFallback: !(route as any).geojson_path?.coordinates?.length
          } as TrailRoute;
        });
        setDatabaseRoutes(validatedRoutes);
        console.log('[LEAFLET_MAP] Routes loaded:', validatedRoutes.length);
      } catch (err) {
        console.error('[LEAFLET_MAP] Unexpected error:', err);
        setRouteError('Failed to process trail data');
      } finally {
        setIsLoadingRoutes(false);
      }
    };
    fetchTrailRoutes();
  }, [selectedHikingSpotId]);

  // Create custom icons for start and end markers
  const createCustomIcon = (html: string, color: string) => {
    return L.divIcon({
      html: `<div style="background-color: ${color}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${html}</div>`,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const startIcon = createCustomIcon('S', '#22C55E');
  const endIcon = createCustomIcon('E', '#EF4444');

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

    return (
      <View style={[styles.mapContainer, customStyle]}>
        <MapContainer
          center={[10.3157, 123.8854]}
          zoom={13}
          style={{ height: '100%', width: '100%', minHeight: 320 }}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Render all routes */}
          {preparedRoutes.map((route) => {
            if (!route.geojson_path?.coordinates) return null;
            
            const coordinates = route.geojson_path.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
            const isSelected = route.id === selectedTrailId;
            
            return (
              <React.Fragment key={route.id}>
                <Polyline
                  positions={coordinates}
                  color={isSelected ? '#22C55E' : route.color || '#9CA3AF'}
                  weight={isSelected ? 6 : 4}
                  opacity={isSelected ? 1.0 : 0.7}
                  dashArray={isSelected ? undefined : '5, 10'}
                />
                
                {/* Start marker */}
                {route.start_coordinates && (
                  <Marker
                    position={[route.start_coordinates.latitude, route.start_coordinates.longitude]}
                    icon={startIcon}
                  />
                )}
                
                {/* End marker */}
                {route.end_coordinates && (
                  <Marker
                    position={[route.end_coordinates.latitude, route.end_coordinates.longitude]}
                    icon={endIcon}
                  />
                )}
              </React.Fragment>
            );
          })}
          
          {/* Auto-fit bounds component */}
          <MapBoundsFitter routes={preparedRoutes} selectedRoute={selectedRoute} />
        </MapContainer>
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
              </TouchableOpacity>
              <Text style={styles.fullscreenTitle}>Trail Map</Text>
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

export default LeafletTrailMap;
