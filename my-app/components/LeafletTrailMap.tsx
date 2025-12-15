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
  ActivityIndicator,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
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
  routes?: any[];
  userLocation?: { latitude: number; longitude: number } | null;
  isNavigating?: boolean;
  onToggleNavigation?: () => void;
  externalDropdownControl?: boolean;
  isRoutesDropdownVisible?: boolean;
  onToggleRoutesDropdown?: () => void;
}

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const DIFFICULTY_ORDER: Record<string, number> = {
  'Easy': 0,
  'Moderate': 1,
  'Hard': 2,
  'Very Hard': 3,
  'Expert': 4,
  'Advanced': 4
};

const DIFFICULTY_COLORS: Record<string, string> = {
  'Easy': '#2ecc71',
  'Moderate': '#f39c12',
  'Hard': '#e74c3c',
  'Very Hard': '#c0392b',
  'Advanced': '#8e44ad',
  'Expert': '#2c3e50'
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
    backgroundColor: '#e0e0e0',
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
  routesToggleButton: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 100, // Ensure it's above map elements
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  routesToggleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    flex: 1,
  },
  routesDropdownContainer: {
    position: 'absolute',
    top: 80, // Just below the toggle button (20 + ~55 height + 5 gap)
    alignSelf: 'center',
    width: '90%',
    maxWidth: 400,
    maxHeight: Dimensions.get('window').height * 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  dropdownList: {
    width: '100%',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(56, 142, 60, 0.08)',
    borderRadius: 12,
    borderBottomWidth: 0,
  },
  dropdownItemContent: {
    flex: 1,
  },
  dropdownItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  dropdownItemDetails: {
    fontSize: 12,
    color: '#757575',
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
  routes,
  userLocation,
  isNavigating,
  onToggleNavigation,
  externalDropdownControl = false,
  isRoutesDropdownVisible: externalIsRoutesDropdownVisible,
  onToggleRoutesDropdown: externalOnToggleRoutesDropdown
}: LeafletTrailMapProps) => {
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(false);
  const [databaseRoutes, setDatabaseRoutes] = useState<TrailRoute[]>([]);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [internalIsRoutesDropdownVisible, setInternalIsRoutesDropdownVisible] = useState<boolean>(false);
  const webViewRef = useRef<WebView>(null);

  // Determine actual visibility and toggle handler based on props
  const isRoutesDropdownVisible = externalDropdownControl
    ? (externalIsRoutesDropdownVisible || false)
    : internalIsRoutesDropdownVisible;

  const handleToggleRoutes = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (externalDropdownControl && externalOnToggleRoutesDropdown) {
      externalOnToggleRoutesDropdown();
    } else {
      setInternalIsRoutesDropdownVisible(!internalIsRoutesDropdownVisible);
    }
  };

  const handleWebViewMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapReady') {
        setIsMapReady(true);
        console.log('[LEAFLET_MAP] Map is ready');
      } else if (data.type === 'log') {
        console.log('[LEAFLET_MAP_JS]', data.message);
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

  // Update user location on the map
  useEffect(() => {
    if (webViewRef.current && isMapReady && userLocation) {
      const message = JSON.stringify({
        type: 'updateUserLocation',
        location: userLocation,
        isNavigating: isNavigating
      });
      webViewRef.current.postMessage(message);
    }
  }, [userLocation, isMapReady, isNavigating]);

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

    // console.log('[LEAFLET_MAP] Routes prepared:', routes.length);

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
      // Priority 1: Use passed routes if available
      if (routes && routes.length > 0) {
        setIsLoadingRoutes(true);
        try {
          console.log('[LEAFLET_MAP] Using passed routes:', routes.length);
          const mappedRoutes = routes.map(r => {
            // Map external/UI route type to internal TrailRoute type
            // Determine geojson_path
            let geojsonPath: GeoJSONPath = { type: 'LineString', coordinates: [] };
            if (r.coordinates && Array.isArray(r.coordinates) && r.coordinates.length > 0) {
              geojsonPath = { type: 'LineString', coordinates: r.coordinates };
            } else if (r.geojson_path) {
              // Should validation/parsing here if needed, but assuming pre-processed
              geojsonPath = r.geojson_path;
            }

            return {
              id: r.id || r.route_id,
              route_id: r.id || r.route_id,
              route_name: r.route_name || r.name,
              hiking_spot_id: r.hiking_spot_id || selectedHikingSpotId || '',
              difficulty: r.difficulty || 'Moderate',
              distance_km: r.distance_km || r.distance || 0,
              elevation_gain_m: r.elevation_gain_m || r.elevation_gain || 0,
              estimated_duration_min: r.estimated_duration_min || r.estimated_duration || 0,
              start_coordinates: r.start_coordinates,
              end_coordinates: r.end_coordinates,
              geojson_path: geojsonPath,
              color: DIFFICULTY_COLORS[r.difficulty] || '#ff0000',
              isFallback: !!r.isFallback
            } as TrailRoute;
          });
          setDatabaseRoutes(mappedRoutes);
          setRouteError(null);
        } catch (err) {
          console.error('[LEAFLET_MAP] Error processing passed routes:', err);
          setRouteError('Failed to process routes');
        } finally {
          setIsLoadingRoutes(false);
        }
        return;
      }

      // Priority 2: Fetch from API
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

          // console.log('[TRAIL_MAP] Processing route:', route.route_name);
          // console.log('[TRAIL_MAP] Raw geojson_path:', route.geojson_path);

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
              // console.log('[TRAIL_MAP] Using object geojson_path:', geojsonPath);
            }
          }

          // Validate coordinates
          if (!geojsonPath.coordinates || geojsonPath.coordinates.length < 2) {
            console.error('[TRAIL_MAP] Missing or invalid coordinates for route:', route.route_name, 'coords:', geojsonPath.coordinates?.length || 0);
            return null; // Skip invalid routes
          }

          // console.log('[TRAIL_MAP] Valid route:', route.route_name, 'with', geojsonPath.coordinates.length, 'coordinate points');
          // console.log('[TRAIL_MAP] First coord:', geojsonPath.coordinates[0], 'Last coord:', geojsonPath.coordinates[geojsonPath.coordinates.length - 1]);

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
  }, [selectedHikingSpotId, routes]);

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
              <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
              <style>
                body, html {margin: 0; padding: 0; height: 100%; }
                #map {height: 100%; width: 100%; }
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
                .user-marker-container {
                  width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000 !important;
          }
                .user-marker-pulse {
                  position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: #2196F3;
                opacity: 0.3;
                animation: pulse 2s infinite;
          }
                @keyframes pulse {
                  0 % { transform: scale(1); opacity: 0.5; }
             100% {transform: scale(2.5); opacity: 0; }
           }
                /* Hide the itinerary container for cleaner mobile view, 
                   expand if needed or show minimal info */
                .leaflet-routing-container {
                  display: none !important;
           }
              </style>
            </head>
            <body>
              <div id="map"></div>
              <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
              <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
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
                let userMarker = null;
                let navLine = null;
                let routingControl = null;
                let currentRouteStart = null;

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
                const userIcon = L.divIcon({
                  html: '<div class="user-marker-pulse"></div><div style="background-color: #2196F3; width: 100%; height: 100%; border-radius: 50%; border: 2px solid white;"></div>',
                className: 'user-marker-container',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
          });

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

                // Store start point for navigation
                currentRouteStart = coordinates[0];

                currentPolyline = L.polyline(coordinates, {
                  color: color,
                weight: 5,
                opacity: 0.9,
                smoothFactor: 1.5,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(map);

                // Add start marker at first coordinate
                L.marker(coordinates[0], {icon: startIcon }).addTo(map).bindPopup('Start');

                // Add end marker at last coordinate
                L.marker(coordinates[coordinates.length - 1], {icon: endIcon }).addTo(map).bindPopup('End');

                // Fit bounds to the polyline
                const bounds = currentPolyline.getBounds();
                // If user location exists and we are navigating, include it in bounds
                if (userMarker && (navLine || routingControl)) {
                  bounds.extend(userMarker.getLatLng());
            }

                map.fitBounds(bounds, {padding: [30, 30] });
          }

                function selectRoute(routeId) {
            selectedRouteId = routeId;
            console.log('[TRAIL_MAP] Selected trail changed →', routeId);
            
            // Clear previous layers but keep tile layer and user marker
            map.eachLayer(function(layer){
              // Don't remove tile layer
              if (layer._url) return;
              // Don't remove user marker
              if (userMarker && layer === userMarker) return;
              
              // Remove everything else (markers, polylines, controls)
              if (layer !== userMarker && !(layer instanceof L.TileLayer) && layer !== routingControl) {
                  map.removeLayer(layer);
              }
            });
            currentPolyline = null;
            if (navLine) { map.removeLayer(navLine); navLine = null; }
            // Note: We don't remove routingControl here, we update it if it exists
            
            // Find the selected route and draw it
            const route = routes.find(function(r){ return r.id === routeId; });
            if (route) {
              drawRoute(route);
              // Update current route start for navigation usage
              const raw = route.geojson_path && route.geojson_path.coordinates ? route.geojson_path.coordinates : [];
              if (raw.length > 0) {
                  // GeoJSON is [lng, lat], Leaflet needs [lat, lng]
                  const startPoint = raw[0];
                  currentRouteStart = [startPoint[1], startPoint[0]];
                  console.log('[TRAIL_MAP] Updated route start point:', currentRouteStart);
              }

              // If logic required to re-trigger navigation update
              if (userMarker) {
                 const latLng = userMarker.getLatLng();
                 // Re-run update location to refresh routing if active
                 // We need to know 'isNavigating' state here, which we don't store locally in JS variable easily
                 // But React updates will trigger 'updateUserLocation' message anyway relative to state change
              }
            }
          }
          
          
           function updateUserLocation(location, isNavigating) {
                if (!location) return;
                console.log('[TRAIL_MAP] Updating location:', location, 'Navigating:', isNavigating);
                const latLng = [location.latitude, location.longitude];
                
                if (!userMarker) {
                    console.log('[TRAIL_MAP] Creating user marker');
                    userMarker = L.marker(latLng, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
                } else {
                    userMarker.setLatLng(latLng);
                    userMarker.setOpacity(1);
                }

                // Handle Navigation
                if (isNavigating) {
                    if (!currentRouteStart && routes.length > 0) {
                        const r = routes.find(r => r.id === selectedRouteId) || routes[0];
                        if (r && r.geojson_path && r.geojson_path.coordinates && r.geojson_path.coordinates.length > 0) {
                            const sp = r.geojson_path.coordinates[0];
                            currentRouteStart = [sp[1], sp[0]];
                        }
                    }

                    if (currentRouteStart) {
                         const navPoints = [latLng, currentRouteStart];

                         // 1. Always draw dashed line first (Immediate Feedback)
                         if (!navLine) {
                             console.log('[TRAIL_MAP] Drawing fallback navigation line');
                             navLine = L.polyline(navPoints, {
                                 color: '#2196F3',
                                 weight: 4,
                                 opacity: 0.5,
                                 dashArray: '10, 10', 
                                 lineCap: 'round'
                             }).addTo(map);
                             
                             const bounds = L.latLngBounds(navPoints);
                             map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
                         } else {
                             navLine.setLatLngs(navPoints);
                         }

                         // 2. Try to calculate real route (Turn-by-Turn)
                         if (!routingControl) {
                             console.log('[TRAIL_MAP] Initializing Routing Control (Foot Profile)');
                             try {
                                 routingControl = L.Routing.control({
                                      waypoints: [
                                           L.latLng(latLng[0], latLng[1]),
                                           L.latLng(currentRouteStart[0], currentRouteStart[1])
                                      ],
                                      router: L.Routing.osrmv1({
                                          serviceUrl: 'https://router.project-osrm.org/route/v1',
                                          profile: 'foot' // Optimization for hiking
                                      }),
                                      routeWhileDragging: false,
                                      showAlternatives: false,
                                      fitSelectedRoutes: false, // We handle fitting manually
                                      lineOptions: {
                                           styles: [{color: '#2196F3', opacity: 1, weight: 6}]
                                      },
                                      createMarker: function() { return null; },
                                      addWaypoints: false,
                                      draggableWaypoints: false,
                                      show: false // Hide the itinerary container
                                 })
                                 .on('routesfound', function(e) {
                                     console.log('[TRAIL_MAP] Route found!');
                                     // If we found a real road route, hide the fallback dashed line
                                     if (navLine) { 
                                         navLine.setStyle({ opacity: 0 }); 
                                     }
                                 })
                                 .on('routingerror', function(e) {
                                     console.log('[TRAIL_MAP] Routing error:', e);
                                     // Ensure fallback line is visible
                                     if (navLine) { 
                                         navLine.setStyle({ opacity: 0.5 }); 
                                     }
                                 })
                                 .addTo(map);
                             } catch (e) {
                                 console.error('[TRAIL_MAP] Error creating routing control:', e);
                             }
                         } else {
                             // Update Start Point for existing control
                             routingControl.setWaypoints([
                                  L.latLng(latLng[0], latLng[1]),
                                  L.latLng(currentRouteStart[0], currentRouteStart[1])
                             ]);
                         }

                    } else {
                        console.warn('[TRAIL_MAP] No start point for navigation found.');
                    }
                } else {
                    // Stop Navigation: cleanup both
                    if (navLine) {
                         map.removeLayer(navLine);
                         navLine = null;
                    }
                    if (routingControl) {
                         map.removeControl(routingControl);
                         routingControl = null;
                    }
                }
           }

          // Auto-select first route
          if (routes.length > 0) {
            const firstRouteId = ${selectedTrailId ? `'${selectedTrailId}'` : 'routes[0].id'};
            selectRoute(firstRouteId);
          }
          
          // Initial user location centering check
          // If we receive the first location update and map is ready, we could center? 
          // But maybe wait for user to ask for it / navigate.

          // Handle messages from React Native
          const handleMessage = function(event) {
            try {
               const data = JSON.parse(event.data);
               // Send log back to RN for debugging
               if (data.type !== 'log') { // Avoid loop
                   window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'log', message: 'WebView received: ' + data.type }));
               }
               
               if (data.type === 'selectRoute' && data.routeId) {
                 selectRoute(data.routeId);
               } else if (data.type === 'updateUserLocation') {
                 updateUserLocation(data.location, data.isNavigating);
               }
            } catch (e) {
               window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'log', message: 'Error parsing message: ' + e.toString() }));
            }
          };

          // Listen on both window and document for maximum compatibility
          window.addEventListener('message', handleMessage);
          document.addEventListener('message', handleMessage);
          
          // Notify React Native that map is ready
          setTimeout(() => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapReady'
            }));
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'log',
              message: 'Map Ready Event Sent'
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

  const renderRoutesDropdown = () => {
    if (!isRoutesDropdownVisible || isLoadingRoutes || preparedRoutes.length === 0) return null;

    return (
      <View style={styles.routesDropdownContainer}>
        <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={true}>
          {preparedRoutes.map((trail) => (
            <TouchableOpacity
              key={trail.id}
              style={[
                styles.dropdownItem,
                selectedTrailId === trail.id && styles.dropdownItemSelected
              ]}
              onPress={() => {
                handleTrailSelect(trail.id);
                if (!externalDropdownControl) {
                  setInternalIsRoutesDropdownVisible(false); // Auto-close on selection
                } else if (externalOnToggleRoutesDropdown) {
                  externalOnToggleRoutesDropdown(); // Ask parent to close
                }
              }}
            >
              <View style={[styles.difficultyBadge, { backgroundColor: trail.color, marginRight: 12, width: 8, height: 8, paddingHorizontal: 0, minWidth: 8, borderRadius: 4 }]} />
              <View style={styles.dropdownItemContent}>
                <Text style={styles.dropdownItemTitle} numberOfLines={1}>{trail.route_name}</Text>
                <Text style={styles.dropdownItemDetails}>
                  {trail.difficulty} • {trail.distance_km}km • {trail.estimated_duration_min}min
                </Text>
              </View>
              {selectedTrailId === trail.id && (
                <MaterialIcons name="check" size={20} color="#388E3C" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.mapContainer}>
        {renderMap()}
        {/* Render dropdown if external control is active or if we want it in main view */}
        {renderRoutesDropdown()}
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

      <Modal visible={isFullscreen} animationType="fade" onRequestClose={toggleFullscreen}>
        <View style={styles.fullscreenContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <SafeAreaView style={styles.fullscreenSafeArea}>
            {/* Header */}
            <View style={styles.fullscreenHeader}>
              <TouchableOpacity onPress={toggleFullscreen} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <Text style={styles.fullscreenTitle}>Trail Map</Text>

              {/* Optional: Navigation Toggle in Header for cleaner look */}
              {onToggleNavigation && (
                <TouchableOpacity
                  style={{
                    backgroundColor: isNavigating ? '#ffebee' : '#e3f2fd',
                    padding: 8,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 'auto',
                    marginRight: 8
                  }}
                  onPress={onToggleNavigation}
                >
                  <MaterialIcons
                    name={isNavigating ? "navigation" : "directions"}
                    size={20}
                    color={isNavigating ? '#d32f2f' : '#1976d2'}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.fullscreenMapContainer}>
              {renderMap(styles.fullscreenMap)}

              {/* Toggle Button for Routes - Only show if NO external control */}
              {!externalDropdownControl && !isLoadingRoutes && preparedRoutes.length > 0 && (
                <TouchableOpacity
                  style={styles.routesToggleButton}
                  onPress={handleToggleRoutes}
                  activeOpacity={0.8}
                >
                  <Text style={styles.routesToggleText}>
                    {selectedRoute ? selectedRoute.route_name : 'Available Routes'}
                  </Text>
                  <MaterialIcons
                    name={isRoutesDropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                    size={24}
                    color="#333"
                  />
                </TouchableOpacity>
              )}

              {/* Collapsible Routes List */}
              {renderRoutesDropdown()}
            </View>

          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

export default LeafletTrailMap;
