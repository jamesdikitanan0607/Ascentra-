import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { TrailRouteDetails } from '../services/supabaseService';

const { width } = Dimensions.get('window');

interface TrailMapProps {
  routes: TrailRouteDetails[];
  selectedRoute: TrailRouteDetails | null;
  onRouteSelect: (route: TrailRouteDetails) => void;
  centerCoordinates: {
    latitude: number;
    longitude: number;
  };
}

const COLORS = {
  primary: '#388E3C',
  text: '#212121',
  textLight: '#616161',
  card: '#F9F9F9',
  background: '#FFFFFF',
};

const ROUTE_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
];

export default function TrailMap({
  routes,
  selectedRoute,
  onRouteSelect,
  centerCoordinates,
}: TrailMapProps) {
  const webViewRef = useRef<WebView>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');

  // Update map when selected route changes
  useEffect(() => {
    if (selectedRoute && webViewRef.current) {
      const routeCoords = getRouteCoordinates(selectedRoute);
      if (routeCoords.length > 0) {
        const message = JSON.stringify({
          type: 'focusOnRoute',
          coordinates: routeCoords.map((coord: { latitude: number; longitude: number }) => [coord.latitude, coord.longitude])
        });
        webViewRef.current.postMessage(message);
      }
    }
  }, [selectedRoute]);

  const getRouteCoordinates = (route: TrailRouteDetails) => {
    // First, try to parse waypoints field (primary source from database)
    if (route.waypoints) {
      try {
        const waypoints = JSON.parse(route.waypoints);
        if (Array.isArray(waypoints) && waypoints.length > 0) {
          return waypoints.map((wp: any) => ({
            latitude: wp.latitude || wp.lat || 0,
            longitude: wp.longitude || wp.lng || 0,
          }));
        }
      } catch (error) {
        console.error('Error parsing waypoints:', error);
      }
    }

    if (route.geojson_path?.coordinates) {
      // Handle GeoJSON LineString coordinates
      return route.geojson_path.coordinates.map((coord: [number, number]) => ({
        latitude: coord[1],
        longitude: coord[0],
      }));
    }
    
    // Fallback to route_coordinates if available
    if (route.route_coordinates && Array.isArray(route.route_coordinates)) {
      return route.route_coordinates;
    }
    
    // Fallback to start/end coordinates
    const coords = [];
    if (route.start_coordinates?.coordinates) {
      coords.push({
        latitude: route.start_coordinates.coordinates[1],
        longitude: route.start_coordinates.coordinates[0],
      });
    }
    if (route.end_coordinates?.coordinates) {
      coords.push({
        latitude: route.end_coordinates.coordinates[1],
        longitude: route.end_coordinates.coordinates[0],
      });
    }
    return coords;
  };

  const getRouteColor = (route: TrailRouteDetails, index: number) => {
    return route.route_color || ROUTE_COLORS[index % ROUTE_COLORS.length];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'hard': return '#F44336';
      case 'advanced': return '#9C27B0';
      default: return COLORS.primary;
    }
  };

  const handleRoutePress = (route: TrailRouteDetails) => {
    onRouteSelect(route);
  };

  const centerMapOnRoute = () => {
    if (selectedRoute && webViewRef.current) {
      const routeCoords = getRouteCoordinates(selectedRoute);
      if (routeCoords.length > 0) {
        const message = JSON.stringify({
          type: 'focusOnRoute',
          coordinates: routeCoords.map((coord: { latitude: number; longitude: number }) => [coord.latitude, coord.longitude])
        });
        webViewRef.current.postMessage(message);
      }
    }
  };

  const toggleMapType = () => {
    const newMapType = mapType === 'standard' ? 'satellite' : 'standard';
    setMapType(newMapType);
    
    if (webViewRef.current) {
      const message = JSON.stringify({
        type: 'changeMapType',
        mapType: newMapType
      });
      webViewRef.current.postMessage(message);
    }
  };

  const normalizeCoordinates = (coords: { latitude: number; longitude: number }[]) => {
    return coords.map(coord => [coord.latitude, coord.longitude]);
  };

  const prepareMapData = () => {
    const mapData = {
      center: [centerCoordinates.latitude, centerCoordinates.longitude],
      zoom: 13,
      mapType: mapType,
      routes: routes.map((route, index) => ({
        id: route.route_id,
        name: route.route_name,
        coordinates: normalizeCoordinates(getRouteCoordinates(route)),
        color: getRouteColor(route, index),
        difficulty: route.difficulty,
        distance: route.distance_km,
        elevation: route.elevation_gain_m,
        isSelected: selectedRoute?.route_id === route.route_id
      })),
      selectedRoute: selectedRoute ? {
        id: selectedRoute.route_id,
        name: selectedRoute.route_name,
        coordinates: normalizeCoordinates(getRouteCoordinates(selectedRoute)),
        color: getRouteColor(selectedRoute, 0)
      } : null
    };
    return JSON.stringify(mapData);
  };

  const generateMapHTML = () => {
    const mapDataJson = prepareMapData();
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Trail Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100%; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
            let mapData = ${mapDataJson};
            let map;
            let currentTileLayer;
            let routeLayers = [];
            
            // Initialize map
            function initMap() {
                map = L.map('map').setView(mapData.center, mapData.zoom);
                
                // Add initial tile layer
                updateTileLayer();
                
                // Add routes
                updateRoutes();
            }
            
            function updateTileLayer() {
                if (currentTileLayer) {
                    map.removeLayer(currentTileLayer);
                }
                
                if (mapData.mapType === 'satellite') {
                    currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                        attribution: '© Esri'
                    });
                } else {
                    currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors'
                    });
                }
                
                currentTileLayer.addTo(map);
            }
            
            function updateRoutes() {
                // Clear existing route layers
                routeLayers.forEach(layer => map.removeLayer(layer));
                routeLayers = [];
                
                if (mapData.selectedRoute && mapData.selectedRoute.coordinates.length > 0) {
                    // Show only selected route
                    addRoute(mapData.selectedRoute, true);
                } else {
                    // Show all routes
                    mapData.routes.forEach(route => {
                        if (route.coordinates.length > 0) {
                            addRoute(route, false);
                        }
                    });
                }
            }
            
            function addRoute(route, isSelected) {
                if (route.coordinates.length === 0) return;
                
                const strokeWidth = isSelected ? 6 : 3;
                const opacity = isSelected ? 0.8 : 0.6;
                
                // Add route polyline
                if (route.coordinates.length > 1) {
                    const polyline = L.polyline(route.coordinates, {
                        color: route.color,
                        weight: strokeWidth,
                        opacity: opacity
                    }).addTo(map);
                    
                    polyline.on('click', function() {
                        window.ReactNativeWebView?.postMessage(JSON.stringify({
                            type: 'routePress',
                            routeId: route.id
                        }));
                    });
                    
                    routeLayers.push(polyline);
                }
                
                // Add start marker
                const startIcon = L.divIcon({
                    html: '<div style="background-color: #4CAF50; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>',
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                    className: 'custom-div-icon'
                });
                
                const startMarker = L.marker(route.coordinates[0], { icon: startIcon })
                    .addTo(map)
                    .bindPopup('<b>' + route.name + ' - Start</b><br>' + route.difficulty + ' • ' + route.distance + 'km');
                
                startMarker.on('click', function() {
                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'routePress',
                        routeId: route.id
                    }));
                });
                
                routeLayers.push(startMarker);
                
                // Add end marker for routes with multiple points
                if (route.coordinates.length > 1) {
                    const endIcon = L.divIcon({
                        html: '<div style="background-color: #F44336; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>',
                        iconSize: [16, 16],
                        iconAnchor: [8, 8],
                        className: 'custom-div-icon'
                    });
                    
                    const endCoords = route.coordinates[route.coordinates.length - 1];
                    const endMarker = L.marker(endCoords, { icon: endIcon })
                        .addTo(map)
                        .bindPopup('<b>' + route.name + ' - End</b><br>Elevation: ' + route.elevation + 'm');
                    
                    endMarker.on('click', function() {
                        window.ReactNativeWebView?.postMessage(JSON.stringify({
                            type: 'routePress',
                            routeId: route.id
                        }));
                    });
                    
                    routeLayers.push(endMarker);
                }
            }
            
            // Handle messages from React Native
            window.addEventListener('message', function(event) {
                const data = JSON.parse(event.data);
                
                if (data.type === 'focusOnRoute' && data.coordinates.length > 0) {
                    const bounds = L.latLngBounds(data.coordinates);
                    map.fitBounds(bounds, { padding: [20, 20] });
                } else if (data.type === 'changeMapType') {
                    mapData.mapType = data.mapType;
                    updateTileLayer();
                } else if (data.type === 'updateData') {
                    mapData = data.mapData;
                    updateRoutes();
                }
            });
            
            // Handle map interactions
            map.on('click', function(e) {
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'mapClick',
                    coordinates: [e.latlng.lat, e.latlng.lng]
                }));
            });
            
            // Initialize map when page loads
            initMap();
        </script>
    </body>
    </html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'routePress') {
        const route = routes.find(r => r.route_id === data.routeId);
        if (route) {
          handleRoutePress(route);
        }
      } else if (data.type === 'mapClick') {
        console.log('Map clicked at:', data.coordinates);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Update WebView when routes or selected route changes
  useEffect(() => {
    if (webViewRef.current) {
      const message = JSON.stringify({
        type: 'updateData',
        mapData: JSON.parse(prepareMapData())
      });
      webViewRef.current.postMessage(message);
    }
  }, [routes, selectedRoute]);

  return (
    <View style={styles.container}>
      {/* Map */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          style={styles.map}
          source={{ html: generateMapHTML() }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={toggleMapType}
          >
            <MaterialIcons
              name={mapType === 'standard' ? 'satellite' : 'map'}
              size={20}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={centerMapOnRoute}
          >
            <MaterialIcons name="my-location" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'column',
    gap: 8,
  },
  mapControlButton: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});