import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';

interface TrailRoute {
  id: string;
  route_name: string;
  difficulty: string;
  distance_km: number;
  elevation_gain_m: number;
  estimated_duration_min: number;
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  waypoints: Array<{ lat: number; lng: number }>;
  route_features?: string;
  route_description?: string;
  geojson_path?: {
    type: 'LineString';
    coordinates: number[][];
  };
}

interface EnhancedTrailMapProps {
  routes: TrailRoute[];
  selectedRouteId: string | null;
  onRouteSelect: (routeId: string) => void;
  showFullscreenButton?: boolean;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  'Easy': '#2ecc71',
  'Moderate': '#f39c12', 
  'Hard': '#e74c3c',
  'Expert': '#8e44ad',
};

const EnhancedTrailMap: React.FC<EnhancedTrailMapProps> = ({
  routes,
  selectedRouteId,
  onRouteSelect,
  showFullscreenButton = true,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  const selectedRoute = routes.find(route => route.id === selectedRouteId);

  const handleRouteSelect = useCallback((routeId: string) => {
    onRouteSelect(routeId);
    
    if (webViewRef.current && isMapReady) {
      const message = JSON.stringify({
        type: 'selectRoute',
        routeId
      });
      webViewRef.current.postMessage(message);
    }
  }, [onRouteSelect, isMapReady]);

  const generateMapHTML = () => {
    const centerLat = selectedRoute?.start_latitude || 10.3157;
    const centerLng = selectedRoute?.start_longitude || 123.8854;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Enhanced Trail Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          body, html { 
            margin: 0; 
            padding: 0; 
            height: 100%; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          #map { height: 100%; width: 100%; }
          
          .custom-marker {
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
          
          .start-marker {
            background: #2ecc71;
            width: 28px;
            height: 28px;
          }
          
          .end-marker {
            background: #e74c3c;
            width: 28px;
            height: 28px;
          }
          
          .waypoint-marker {
            background: #3498db;
            width: 16px;
            height: 16px;
            font-size: 8px;
          }
          
          .leaflet-popup-content-wrapper {
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          
          .leaflet-popup-content {
            margin: 12px 16px;
            font-size: 14px;
            line-height: 1.4;
          }
          
          .popup-title {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 4px;
          }
          
          .popup-details {
            color: #7f8c8d;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          // Initialize map
          const map = L.map('map', {
            zoomControl: true,
            attributionControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            touchZoom: true,
            dragging: true
          }).setView([${centerLat}, ${centerLng}], 14);
          
          // Add tile layer with better styling
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
            tileSize: 256,
            zoomOffset: 0
          }).addTo(map);
          
          // Route management
          let routeLayers = new Map();
          let routeMarkers = new Map();
          let selectedRouteId = null;
          
          // Route colors
          const difficultyColors = {
            'Easy': '#2ecc71',
            'Moderate': '#f39c12',
            'Hard': '#e74c3c',
            'Expert': '#8e44ad'
          };
          
          function clearRoute(routeId) {
            if (routeLayers.has(routeId)) {
              map.removeLayer(routeLayers.get(routeId));
              routeLayers.delete(routeId);
            }
            
            if (routeMarkers.has(routeId)) {
              routeMarkers.get(routeId).forEach(marker => map.removeLayer(marker));
              routeMarkers.delete(routeId);
            }
          }
          
          function drawRoute(route) {
            clearRoute(route.id);
            
            // Use actual GeoJSON geometry if available, otherwise fallback to waypoints
            let coordinates = [];
            
            if (route.geojson_path && route.geojson_path.coordinates) {
              // Use PostGIS geometry data - coordinates are in [lng, lat] format
              coordinates = route.geojson_path.coordinates.map(function(coord){ return [coord[1], coord[0]]; });
            } else {
              // Fallback to building from waypoints (may be less curved)
              coordinates.push([route.start_latitude, route.start_longitude]);
              if (route.waypoints && Array.isArray(route.waypoints)) {
                route.waypoints.forEach(function(wp){ coordinates.push([wp.lat, wp.lng]); });
              }
              coordinates.push([route.end_latitude, route.end_longitude]);
            }
            
            // Validate coordinates
            if (!coordinates || coordinates.length < 3) {
              console.error('[TRAIL_MAP] Invalid coordinate set for route', route.id, 'count:', coordinates ? coordinates.length : 0);
              return null;
            }
            
            // Debug logs
            console.log('[TRAIL_MAP] Redrawing polyline + markers for', route.route_name);
            console.log('[TRAIL_MAP] Coordinate count:', coordinates.length);
            console.log('[TRAIL_MAP] Example point:', coordinates[0]);
            
            // Create polyline with consistent styling
            const color = difficultyColors[route.difficulty] || '#3498db';
            const polyline = L.polyline(coordinates, {
              color: color,
              weight: 5,
              opacity: 0.9,
              smoothFactor: 1.5,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(map);
            
            routeLayers.set(route.id, polyline);
            
            // Add markers at polyline endpoints
            const markers = [];
            const startMarker = L.marker(coordinates[0], {
              icon: L.divIcon({
                className: 'custom-marker start-marker',
                html: 'S',
                iconSize: [28, 28],
                iconAnchor: [14, 14]
              }),
              zIndexOffset: 1000
            }).addTo(map);
            startMarker.bindPopup('Start');
            markers.push(startMarker);
            console.log('[TRAIL_MAP] Added Start marker at', coordinates[0]);
            
            // Waypoint markers (only for selected route)
            if (selectedRouteId === route.id && route.waypoints) {
              route.waypoints.forEach(function(wp, index){
                const wpMarker = L.marker([wp.lat, wp.lng], {
                  icon: L.divIcon({
                    className: 'custom-marker waypoint-marker',
                    html: (index + 1).toString(),
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                  }),
                  zIndexOffset: 500
                }).addTo(map);
                wpMarker.bindPopup('Waypoint ' + (index + 1));
                markers.push(wpMarker);
              });
            }
            
            const endMarker = L.marker(coordinates[coordinates.length - 1], {
              icon: L.divIcon({
                className: 'custom-marker end-marker',
                html: 'E',
                iconSize: [28, 28],
                iconAnchor: [14, 14]
              }),
              zIndexOffset: 1000
            }).addTo(map);
            endMarker.bindPopup('End');
            markers.push(endMarker);
            console.log('[TRAIL_MAP] Added End marker at', coordinates[coordinates.length - 1]);
            
            routeMarkers.set(route.id, markers);
            
            return polyline;
          }
          
          function selectRoute(routeId) {
            console.log('[TRAIL_MAP] Selected trail changed →', routeId);
            selectedRouteId = routeId;
            
            // Clear previous non-tile layers (keep tile layer)
            map.eachLayer(function(layer){
              if (!layer._url) {
                map.removeLayer(layer);
              }
            });
            routeLayers.clear();
            routeMarkers.clear();
            
            // Redraw all routes with updated styling
            const routes = ${JSON.stringify(routes)};
            routes.forEach(route => {
              if (routeLayers.has(route.id)) {
                clearRoute(route.id);
                drawRoute(route);
              }
              // If it was cleared above, draw the selected one regardless
              if (route.id === routeId && !routeLayers.has(route.id)) {
                drawRoute(route);
              }
            });
            
            // Fit bounds to selected route with better padding
            if (routeLayers.has(routeId)) {
              const bounds = routeLayers.get(routeId).getBounds();
              console.log('[TRAIL_MAP] Fit bounds applied for route:', routeId);
              map.fitBounds(bounds, { 
                padding: [40, 40],
                maxZoom: 15,
                animate: true,
                duration: 1.0
              });
            }
          }
          
          // Initialize with all routes
          function initializeRoutes() {
            const routes = ${JSON.stringify(routes)};
            console.log('[ENHANCED_MAP] Initializing routes:', routes.length);
            
            routes.forEach(route => {
              console.log('[ENHANCED_MAP] Drawing route:', route.route_name, 'with', route.geojson_path?.coordinates?.length || 0, 'coordinates');
              drawRoute(route);
            });
            
            // Select initial route
            if (routes.length > 0) {
              const initialRouteId = '${selectedRouteId}' || routes[0].id;
              console.log('[ENHANCED_MAP] Selecting initial route:', initialRouteId);
              selectRoute(initialRouteId);
            }
          }
          
          // Handle messages from React Native
          window.addEventListener('message', function(event) {
            try {
              const data = JSON.parse(event.data);
              
              if (data.type === 'selectRoute') {
                selectRoute(data.routeId);
              } else if (data.type === 'refreshRoutes') {
                // Clear all and redraw
                routeLayers.forEach((layer, id) => clearRoute(id));
                initializeRoutes();
              }
            } catch (error) {
              console.error('Error handling message:', error);
            }
          });
          
          // Initialize map
          setTimeout(() => {
            initializeRoutes();
            
            // Notify React Native that map is ready
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapReady'
              }));
            }
          }, 500);
        </script>
      </body>
      </html>
    `;
  };

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapReady') {
        setIsMapReady(true);
        setIsLoading(false);
        console.log('[ENHANCED_MAP] Map is ready, routes available:', routes.length);
        
        // Auto-select first route if none selected
        if (routes.length > 0 && !selectedRouteId) {
          console.log('[ENHANCED_MAP] Auto-selecting first route:', routes[0].id);
          onRouteSelect(routes[0].id);
        }
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  }, [routes, selectedRouteId, onRouteSelect]);

  // Sync external route selection to WebView
  useEffect(() => {
    if (webViewRef.current && isMapReady && selectedRouteId) {
      console.log('[ENHANCED_MAP] Syncing external selection to WebView:', selectedRouteId);
      const message = JSON.stringify({
        type: 'selectRoute',
        routeId: selectedRouteId
      });
      webViewRef.current.postMessage(message);
    }
  }, [selectedRouteId, isMapReady]);

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#2ecc71" />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
        
        <WebView
          ref={webViewRef}
          source={{ html: generateMapHTML() }}
          style={styles.webview}
          onLoadEnd={() => setIsMapReady(true)}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
        />
        
        {showFullscreenButton && (
          <TouchableOpacity 
            style={styles.fullscreenButton}
            onPress={() => setIsFullscreen(true)}
          >
            <MaterialIcons name="fullscreen" size={24} color="#2ecc71" />
          </TouchableOpacity>
        )}
      </View>

      {/* Fullscreen Modal */}
      <Modal
        visible={isFullscreen}
        animationType="slide"
        onRequestClose={() => setIsFullscreen(false)}
      >
        <SafeAreaView style={styles.fullscreenContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          
          <View style={styles.fullscreenHeader}>
            <TouchableOpacity 
              onPress={() => setIsFullscreen(false)}
              style={styles.headerButton}
            >
              <MaterialIcons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.fullscreenTitle}>Trail Map</Text>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setIsFullscreen(false)}
            >
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.fullscreenMapContainer}>
            <WebView
              ref={webViewRef}
              source={{ html: generateMapHTML() }}
              style={styles.fullscreenWebview}
              onMessage={handleWebViewMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={false}
            />
          </View>
          
          {/* Available Trails Overlay */}
          <View style={styles.trailsOverlay}>
            <Text style={styles.overlayTitle}>Available Trails</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.overlayScrollContent}
            >
              {routes.map((route) => (
                <TouchableOpacity
                  key={route.id}
                  style={[
                    styles.overlayTrailCard,
                    selectedRouteId === route.id && styles.selectedOverlayCard
                  ]}
                  onPress={() => handleRouteSelect(route.id)}
                >
                  <Text style={styles.overlayTrailName} numberOfLines={1}>
                    {route.route_name}
                  </Text>
                  <View style={[
                    styles.overlayDifficultyBadge,
                    { backgroundColor: DIFFICULTY_COLORS[route.difficulty] || '#3498db' }
                  ]}>
                    <Text style={styles.overlayDifficultyText}>
                      {route.difficulty}
                    </Text>
                  </View>
                  <Text style={styles.overlayTrailDistance}>
                    {route.distance_km} km
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
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
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  fullscreenButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  fullscreenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  fullscreenMapContainer: {
    flex: 1,
  },
  fullscreenWebview: {
    flex: 1,
  },
  trailsOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  overlayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  overlayScrollContent: {
    paddingRight: 16,
  },
  overlayTrailCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOverlayCard: {
    borderColor: '#2ecc71',
    backgroundColor: '#f0fff4',
  },
  overlayTrailName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  overlayDifficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  overlayDifficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  overlayTrailDistance: {
    fontSize: 11,
    color: '#666',
  },
});

export default EnhancedTrailMap;
