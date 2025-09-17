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
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../services/supabaseClient';

interface Route {
  id: string;
  route_name: string;
  route_description: string;
  difficulty: string;
  distance: number;
  estimated_duration: number;
  elevation_gain: number;
  route_type: string;
  trail_conditions: string;
  safety_notes: string;
  best_time_to_hike: string[];
  route_features: string[];
  is_main_route: boolean;
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
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  useEffect(() => {
    fetchRoutes();
  }, [hikingSpotId]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trail_routes')
        .select('*')
        .eq('hiking_spot_id', hikingSpotId)
        .order('difficulty');

      if (error) {
        console.error('Error fetching routes:', error);
        Alert.alert('Error', 'Failed to load trail routes');
        return;
      }

      if (data && data.length > 0) {
        const routesWithCoords = data.map(route => ({
          ...route,
          route_coordinates: generateRouteCoordinates(route, latitude, longitude)
        }));
        setRoutes(routesWithCoords);
        // Auto-select main route
        const mainRoute = routesWithCoords.find(r => r.is_main_route);
        setSelectedRoute(mainRoute || routesWithCoords[0]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      Alert.alert('Error', 'Failed to load trail routes');
    } finally {
      setLoading(false);
    }
  };

  // Generate sample route coordinates based on route data
  const generateRouteCoordinates = (route: Route, baseLat: number, baseLng: number) => {
    const coords = [];
    const distance = route.distance || 5;
    const points = Math.max(10, Math.floor(distance * 2)); // More points for longer routes
    
    // Create a realistic trail path
    for (let i = 0; i <= points; i++) {
      const progress = i / points;
      const angle = progress * Math.PI * 2 * (route.route_type === 'loop' ? 1 : 0.5);
      
      // Add some randomness for realistic trail curves
      const randomOffset = (Math.random() - 0.5) * 0.002;
      const elevationFactor = route.elevation_gain ? route.elevation_gain / 1000 : 0.5;
      
      const lat = baseLat + Math.cos(angle) * 0.01 * elevationFactor + randomOffset;
      const lng = baseLng + Math.sin(angle) * 0.01 * elevationFactor + randomOffset;
      
      coords.push({ latitude: lat, longitude: lng });
    }
    
    return coords;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return COLORS.easy;
      case 'moderate': return COLORS.moderate;
      case 'hard': return COLORS.hard;
      case 'expert': return COLORS.hard;
      default: return COLORS.moderate;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const getRouteTypeIcon = (type: string) => {
    switch (type) {
      case 'loop': return 'loop';
      case 'out_and_back': return 'compare-arrows';
      case 'point_to_point': return 'trending-up';
      default: return 'route';
    }
  };

  if (loading) {
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
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {/* Hiking Spot Marker */}
          <Marker
            coordinate={{
              latitude: latitude,
              longitude: longitude,
            }}
            title={spotName}
            description="Hiking Spot"
          />
          
          {/* Selected Route Polyline */}
          {selectedRoute && selectedRoute.route_coordinates && (
            <Polyline
              coordinates={selectedRoute.route_coordinates}
              strokeColor={COLORS.primary}
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          )}
        </MapView>
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
                selectedRoute?.id === route.id && styles.selectedRouteCard,
              ]}
              onPress={() => setSelectedRoute(route)}
              activeOpacity={0.7}
            >
              <View style={styles.routeHeader}>
                <MaterialIcons
                  name={getRouteTypeIcon(route.route_type)}
                  size={20}
                  color={selectedRoute?.id === route.id ? COLORS.white : COLORS.primary}
                />
                <Text
                  style={[
                    styles.routeName,
                    selectedRoute?.id === route.id && styles.selectedRouteName,
                  ]}
                >
                  {route.route_name}
                </Text>
              </View>
              
              <View style={styles.routeInfo}>
                <Text
                  style={[
                    styles.routeDistance,
                    selectedRoute?.id === route.id && styles.selectedRouteText,
                  ]}
                >
                  {route.distance} km
                </Text>
                <Text
                  style={[
                    styles.routeDuration,
                    selectedRoute?.id === route.id && styles.selectedRouteText,
                  ]}
                >
                  {formatDuration(route.estimated_duration)}
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
      {selectedRoute && (
        <View style={styles.routeDetails}>
          <Text style={styles.detailsTitle}>Route Details</Text>
          <Text style={styles.routeDescription}>{selectedRoute.route_description}</Text>
          
          {selectedRoute.route_features && selectedRoute.route_features.length > 0 && (
            <View style={styles.waypointsSection}>
              <Text style={styles.waypointsTitle}>Route Features</Text>
              {selectedRoute.route_features.slice(0, 3).map((feature, index) => (
                <Text key={index} style={styles.waypointItem}>
                  • {feature}
                </Text>
              ))}
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
});

TrailMapComponent.displayName = 'TrailMapComponent';

export default TrailMapComponent;