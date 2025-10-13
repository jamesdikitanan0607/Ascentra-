import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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
  route_description?: string;
}

interface TrailRoutesSectionProps {
  routes: TrailRoute[];
  onRoutePress?: (routeId: string) => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  'Easy': '#2ecc71',
  'Moderate': '#f39c12',
  'Hard': '#e74c3c',
  'Advanced': '#8e44ad',
  'Expert': '#2c3e50'
};

const TrailRoutesSection: React.FC<TrailRoutesSectionProps> = ({ routes, onRoutePress }) => {
  if (!routes || routes.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trail Routes</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {routes.map((route) => (
          <TouchableOpacity 
            key={route.id} 
            style={styles.routeCard}
            onPress={() => onRoutePress?.(route.id)}
          >
            <View style={[styles.difficultyBadge, { 
              backgroundColor: DIFFICULTY_COLORS[route.difficulty] || '#2ecc71' 
            }]}>
              <Text style={styles.difficultyText}>{route.difficulty}</Text>
            </View>
            
            <Text style={styles.routeName} numberOfLines={1}>{route.route_name}</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialIcons name="directions-walk" size={16} color="#666" />
                <Text style={styles.statText}>{route.distance_km} km</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialIcons name="schedule" size={16} color="#666" />
                <Text style={styles.statText}>{Math.round(route.estimated_duration_min / 60)} hrs</Text>
              </View>
            </View>
            
            <Text style={styles.description} numberOfLines={2}>{route.route_description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 8,
  },
  routeCard: {
    width: 200,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    elevation: 2,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  description: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});

export default TrailRoutesSection;
