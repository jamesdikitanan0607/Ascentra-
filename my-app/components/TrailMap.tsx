import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import MapView, { Polyline, Marker, UrlTile } from 'react-native-maps';
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
  const mapRef = useRef<MapView>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');

  // Center map on selected route
  useEffect(() => {
    if (selectedRoute && mapRef.current) {
      const routeCoords = getRouteCoordinates(selectedRoute);
      if (routeCoords.length > 0) {
        mapRef.current.fitToCoordinates(routeCoords, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [selectedRoute]);

  const getRouteCoordinates = (route: TrailRouteDetails) => {
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
    if (selectedRoute && mapRef.current) {
      const routeCoords = getRouteCoordinates(selectedRoute);
      if (routeCoords.length > 0) {
        mapRef.current.fitToCoordinates(routeCoords, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          mapType={mapType}
          initialRegion={{
            latitude: centerCoordinates.latitude,
            longitude: centerCoordinates.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          {/* OpenStreetMap Tiles */}
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
          />

          {/* Render selected route or all routes */}
          {selectedRoute ? (
            // Show only the selected route
            (() => {
              const routeCoords = getRouteCoordinates(selectedRoute);
              const routeColor = getRouteColor(selectedRoute, 0);

              return (
                <React.Fragment key={selectedRoute.route_id}>
                  {/* Route Polyline */}
                  {routeCoords.length > 1 && (
                    <Polyline
                      coordinates={routeCoords}
                      strokeColor={routeColor}
                      strokeWidth={6}
                      onPress={() => handleRoutePress(selectedRoute)}
                      tappable
                    />
                  )}

                  {/* Start Marker */}
                  {routeCoords.length > 0 && (
                    <Marker
                      coordinate={routeCoords[0]}
                      title={`${selectedRoute.route_name} - Start`}
                      description={`${selectedRoute.difficulty} • ${selectedRoute.distance_km}km`}
                      pinColor="#4CAF50"
                      onPress={() => handleRoutePress(selectedRoute)}
                    />
                  )}

                  {/* End Marker */}
                  {routeCoords.length > 1 && (
                    <Marker
                      coordinate={routeCoords[routeCoords.length - 1]}
                      title={`${selectedRoute.route_name} - End`}
                      description={`Elevation: ${selectedRoute.elevation_gain_m}m`}
                      pinColor="#F44336"
                      onPress={() => handleRoutePress(selectedRoute)}
                    />
                  )}
                </React.Fragment>
              );
            })()
          ) : (
            // Show all routes with reduced opacity
            routes.map((route, index) => {
              const routeCoords = getRouteCoordinates(route);
              const routeColor = getRouteColor(route, index);

              return (
                <React.Fragment key={route.route_id}>
                  {/* Route Polyline */}
                  {routeCoords.length > 1 && (
                    <Polyline
                      coordinates={routeCoords}
                      strokeColor={routeColor}
                      strokeWidth={3}
                      strokePattern={[5, 5]}
                      onPress={() => handleRoutePress(route)}
                      tappable
                    />
                  )}

                  {/* Start Marker */}
                  {routeCoords.length > 0 && (
                    <Marker
                      coordinate={routeCoords[0]}
                      title={`${route.route_name} - Start`}
                      description={`${route.difficulty} • ${route.distance_km}km`}
                      pinColor={routeColor}
                      onPress={() => handleRoutePress(route)}
                    />
                  )}
                </React.Fragment>
              );
            })
          )}
        </MapView>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
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

      {/* Route Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Trail Routes ({routes.length})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {routes.map((route, index) => {
            const routeColor = getRouteColor(route, index);
            const isSelected = selectedRoute?.route_id === route.route_id;

            return (
              <TouchableOpacity
                key={route.route_id}
                style={[
                  styles.legendItem,
                  isSelected && styles.legendItemSelected,
                ]}
                onPress={() => handleRoutePress(route)}
              >
                <View style={styles.legendItemHeader}>
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: routeColor },
                    ]}
                  />
                  <Text style={[
                    styles.legendItemName,
                    isSelected && styles.legendItemNameSelected,
                  ]}>
                    {route.route_name}
                  </Text>
                </View>
                
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(route.difficulty) },
                ]}>
                  <Text style={styles.difficultyText}>{route.difficulty}</Text>
                </View>
                
                <View style={styles.routeStats}>
                  <Text style={styles.routeStatText}>{route.distance_km}km</Text>
                  <Text style={styles.routeStatText}>•</Text>
                  <Text style={styles.routeStatText}>{route.elevation_gain_m}m</Text>
                  <Text style={styles.routeStatText}>•</Text>
                  <Text style={styles.routeStatText}>{route.estimated_duration_hr}h</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
  legendContainer: {
    marginTop: 16,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  legendItem: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 160,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  legendItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E8',
  },
  legendItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  legendItemNameSelected: {
    color: COLORS.primary,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  routeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeStatText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});