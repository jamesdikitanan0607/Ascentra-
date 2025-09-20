import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../services/supabaseClient';
import { useTrail, normalizeTrailRoute, getTrailCoordinates, TrailRoute } from '../contexts/TrailContext';

interface Route {
  id: string;
  route_id: string;
  hiking_spot_id: string;
  name: string;
  description: string;
  difficulty: string;
  length: number;
  elevation_gain: number;
  estimated_time: number;
  trail_type: string;
  waypoints: string;
  gpx_data: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  route_coordinates?: { latitude: number; longitude: number }[];
}

interface TrailMapComponentProps {
  hikingSpotId: string;
  spotName: string;
  latitude: number;
  longitude: number;
}

const COLORS = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  accent: '#FF6B35',
  background: '#F5F5F5',
  text: '#333333',
  lightText: '#666666',
  border: '#E0E0E0',
  white: '#FFFFFF',
  easy: '#4CAF50',
  moderate: '#FF9800',
  hard: '#F44336',
};

const TrailMapComponent: React.FC<TrailMapComponentProps> = ({
  hikingSpotId,
  spotName,
  latitude,
  longitude,
}) => {
  const { 
    selectedTrail, 
    setSelectedTrail, 
    trails, 
    setTrails, 
    isLoading, 
    setIsLoading, 
    error, 
    setError 
  } = useTrail();
  
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    fetchRoutes();
  }, [hikingSpotId]);

  const fetchRoutes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('trail_routes')
        .select('*')
        .eq('hiking_spot_id', hikingSpotId)
        .eq('is_active', true);

      if (fetchError) {
        console.error('Error fetching routes:', fetchError);
        setError('Failed to load trail routes');
        Alert.alert('Error', 'Failed to load trail routes');
        return;
      }

      const routesWithCoordinates = data?.map((route) => ({
        ...route,
        route_coordinates: generateRouteCoordinates(route),
      })) || [];

      // Convert to TrailRoute format and update context
      const normalizedTrails = routesWithCoordinates.map(route => normalizeTrailRoute(route));
      setTrails(normalizedTrails);
      setRoutes(routesWithCoordinates);
      
      // Set first route as selected if none is selected
      if (normalizedTrails.length > 0 && !selectedTrail) {
        setSelectedTrail(normalizedTrails[0]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      setError('Failed to load trail routes');
      Alert.alert('Error', 'Failed to load trail routes');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRouteCoordinates = (route: Route) => {
    if (route.waypoints) {
      try {
        const waypoints = JSON.parse(route.waypoints);
        if (Array.isArray(waypoints) && waypoints.length > 0) {
          return waypoints.map((wp: any) => ({
            latitude: parseFloat(wp.latitude || wp.lat || '0'),
            longitude: parseFloat(wp.longitude || wp.lng || '0'),
          }));
        }
      } catch (error) {
        console.error('Error parsing waypoints:', error);
      }
    }

    // Fallback: generate simple route coordinates
    const distance = route.length || 1;
    const points = Math.max(3, Math.min(10, Math.floor(distance * 2)));
    const coordinates = [];
    
    for (let i = 0; i < points; i++) {
      const factor = i / (points - 1);
      const latOffset = (Math.random() - 0.5) * 0.01 * distance;
      const lngOffset = (Math.random() - 0.5) * 0.01 * distance;
      
      coordinates.push({
        latitude: latitude + latOffset + (factor * 0.005),
        longitude: longitude + lngOffset + (factor * 0.005),
      });
    }
    
    return coordinates;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return COLORS.easy;
      case 'moderate': return COLORS.moderate;
      case 'hard': return COLORS.hard;
      default: return COLORS.moderate;
    }
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const getRouteTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'loop': return 'loop';
      case 'out_and_back': 
      case 'out and back': return 'compare-arrows';
      case 'point_to_point': 
      case 'point to point': return 'trending-up';
      default: return 'route';
    }
  };

  const normalizeCoordinates = (coords: { latitude: number; longitude: number }[]) => {
    return coords.map(coord => [coord.latitude, coord.longitude]);
  };

  const prepareMapData = () => {
    const mapData = {
      center: [latitude, longitude],
      zoom: 13,
      hikingSpot: {
        name: spotName,
        coordinates: [latitude, longitude]
      },
      selectedRoute: selectedTrail ? {
        id: selectedTrail.id,
        name: selectedTrail.name,
        coordinates: getTrailCoordinates(selectedTrail),
        color: COLORS.primary
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
            const mapData = ${mapDataJson};
            
            // Initialize map
            const map = L.map('map').setView(mapData.center, mapData.zoom);
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            // Add hiking spot marker
            const hikingSpotIcon = L.divIcon({
                html: '<div style="background-color: ${COLORS.accent}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
                className: 'custom-div-icon'
            });
            
            L.marker(mapData.hikingSpot.coordinates, { icon: hikingSpotIcon })
                .addTo(map)
                .bindPopup('<b>' + mapData.hikingSpot.name + '</b><br>Hiking Spot');
            
            // Add selected route if available
            if (mapData.selectedRoute && mapData.selectedRoute.coordinates.length > 0) {
                // Add route polyline
                const polyline = L.polyline(mapData.selectedRoute.coordinates, {
                    color: mapData.selectedRoute.color,
                    weight: 4,
                    opacity: 0.8
                }).addTo(map);
                
                // Add start marker
                const startIcon = L.divIcon({
                    html: '<div style="background-color: #4CAF50; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>',
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                    className: 'custom-div-icon'
                });
                
                L.marker(mapData.selectedRoute.coordinates[0], { icon: startIcon })
                    .addTo(map)
                    .bindPopup('<b>Start Point</b><br>' + mapData.selectedRoute.name);
                
                // Add end marker
                const endIcon = L.divIcon({
                    html: '<div style="background-color: #F44336; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>',
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                    className: 'custom-div-icon'
                });
                
                const endCoords = mapData.selectedRoute.coordinates[mapData.selectedRoute.coordinates.length - 1];
                L.marker(endCoords, { icon: endIcon })
                    .addTo(map)
                    .bindPopup('<b>End Point</b><br>' + mapData.selectedRoute.name);
                
                // Fit map to show the route
                if (mapData.selectedRoute.coordinates.length > 1) {
                    map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
                }
            }
            
            // Handle map interactions
            map.on('click', function(e) {
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'mapClick',
                    coordinates: [e.latlng.lat, e.latlng.lng]
                }));
            });
        </script>
    </body>
    </html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapClick') {
        console.log('Map clicked at:', data.coordinates);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading trail routes...</Text>
      </View>
    );
  }

  if (routes.length === 0) {
    return (
      <View style={styles.noRoutesContainer}>
        <MaterialIcons name="map" size={48} color={COLORS.lightText} />
        <Text style={styles.noRoutesText}>No trail routes available</Text>
        <Text style={styles.noRoutesSubtext}>Check back later for updated trail information</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <WebView
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
      </View>

      {/* Route Selection */}
      <View style={styles.routeSelection}>
        <Text style={styles.sectionTitle}>Available Trail Routes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.routeList}>
          {routes.map((route) => (
            <TouchableOpacity
              key={route.id}
              style={[
                styles.routeCard,
                selectedTrail?.id === route.id && styles.selectedRouteCard,
              ]}
              onPress={() => {
                const normalizedRoute = normalizeTrailRoute(route);
                setSelectedTrail(normalizedRoute);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.routeHeader}>
                <MaterialIcons
                  name={getRouteTypeIcon(route.trail_type)}
                  size={20}
                  color={selectedTrail?.id === route.id ? COLORS.white : COLORS.primary}
                />
                <Text
                  style={[
                    styles.routeName,
                    selectedTrail?.id === route.id && styles.selectedRouteName,
                  ]}
                >
                  {route.name}
                </Text>
              </View>
              
              <View style={styles.routeInfo}>
                <Text
                  style={[
                    styles.routeDistance,
                    selectedTrail?.id === route.id && styles.selectedRouteText,
                  ]}
                >
                  {route.length} km • {route.elevation_gain}m ↗
                </Text>
                <Text
                  style={[
                    styles.routeDuration,
                    selectedTrail?.id === route.id && styles.selectedRouteText,
                  ]}
                >
                  {formatDuration(route.estimated_time)}
                </Text>
              </View>
              
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(route.difficulty) },
                ]}
              >
                <Text style={styles.difficultyText}>{route.difficulty}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Selected Route Details */}
      {selectedTrail && (
        <View style={styles.routeDetails}>
          <Text style={styles.detailsTitle}>Route Details</Text>
          <Text style={styles.routeDescription}>{selectedTrail.description}</Text>
          
          {/* Route Statistics */}
          <View style={styles.routeStats}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <MaterialIcons name="straighten" size={16} color={COLORS.primary} />
                <Text style={styles.statLabel}>Distance</Text>
                <Text style={styles.statValue}>{selectedTrail.distance} km</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="schedule" size={16} color={COLORS.primary} />
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{formatDuration(selectedTrail.estimatedTime || 0)}</Text>
              </View>
            </View>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <MaterialIcons name="trending-up" size={16} color={COLORS.primary} />
                <Text style={styles.statLabel}>Elevation</Text>
                <Text style={styles.statValue}>{selectedTrail.elevationGain}m</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="fitness-center" size={16} color={COLORS.primary} />
                <Text style={styles.statLabel}>Difficulty</Text>
                <Text style={styles.statValue}>{selectedTrail.difficulty}</Text>
              </View>
            </View>
          </View>

          {/* Start/End Coordinates */}
          {selectedTrail.coordinates && selectedTrail.coordinates.length > 0 && (
            <View style={styles.coordinatesSection}>
              <Text style={styles.coordinatesTitle}>Route Coordinates</Text>
              <View style={styles.coordinateRow}>
                <MaterialIcons name="play-arrow" size={16} color="green" />
                <Text style={styles.coordinateLabel}>Start:</Text>
                <Text style={styles.coordinateValue}>
                  {selectedTrail.coordinates[0][0].toFixed(4)}, {selectedTrail.coordinates[0][1].toFixed(4)}
                </Text>
              </View>
              <View style={styles.coordinateRow}>
                <MaterialIcons name="stop" size={16} color="red" />
                <Text style={styles.coordinateLabel}>End:</Text>
                <Text style={styles.coordinateValue}>
                  {selectedTrail.coordinates[selectedTrail.coordinates.length - 1][0].toFixed(4)}, {selectedTrail.coordinates[selectedTrail.coordinates.length - 1][1].toFixed(4)}
                </Text>
              </View>
            </View>
          )}
          
          {selectedTrail.trailType && (
            <View style={styles.waypointsSection}>
              <Text style={styles.waypointsTitle}>Route Highlights</Text>
              <Text style={styles.waypointItem}>
                • Trail type: {selectedTrail.trailType}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  noRoutesContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  noRoutesText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
    textAlign: 'center',
  },
  noRoutesSubtext: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 8,
    textAlign: 'center',
  },
  mapContainer: {
    height: 200,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
  routeSelection: {
    padding: 16,
    backgroundColor: COLORS.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  routeList: {
    marginBottom: 8,
  },
  routeCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 160,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedRouteCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  selectedRouteName: {
    color: COLORS.white,
  },
  routeInfo: {
    marginBottom: 8,
  },
  routeDistance: {
    fontSize: 14,
    color: COLORS.lightText,
    fontWeight: '500',
  },
  routeDuration: {
    fontSize: 12,
    color: COLORS.lightText,
    marginTop: 2,
  },
  selectedRouteText: {
    color: COLORS.white,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  routeDetails: {
    padding: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  routeDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.lightText,
    marginBottom: 12,
  },
  waypointsSection: {
    marginTop: 8,
  },
  waypointsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  waypointItem: {
    fontSize: 13,
    color: COLORS.lightText,
    marginBottom: 3,
    lineHeight: 18,
  },
  routeStats: {
    marginTop: 12,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.lightText,
    marginTop: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 2,
  },
  coordinatesSection: {
    marginTop: 12,
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  coordinatesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  coordinateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  coordinateLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: 6,
    marginRight: 8,
    minWidth: 40,
  },
  coordinateValue: {
    fontSize: 12,
    color: COLORS.lightText,
    fontFamily: 'monospace',
  },
});

TrailMapComponent.displayName = 'TrailMapComponent';

export default TrailMapComponent;