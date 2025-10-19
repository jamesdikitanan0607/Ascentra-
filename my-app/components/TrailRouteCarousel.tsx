import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface TrailRoute {
  id: string;
  route_name: string;
  difficulty: string;
  distance_km: number;
  elevation_gain_m: number;
  estimated_duration_min: number;
  route_features?: string;
  route_description?: string;
  start_latitude?: number;
  start_longitude?: number;
  end_latitude?: number;
  end_longitude?: number;
  waypoints?: Array<{ lat: number; lng: number }>;
  geojson_path?: {
    type: 'LineString';
    coordinates: number[][];
  };
}

interface TrailRouteCarouselProps {
  routes: TrailRoute[];
  selectedRouteId: string | null;
  onRouteSelect: (routeId: string) => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  'Easy': '#2ecc71',
  'Moderate': '#f39c12',
  'Hard': '#e74c3c',
  'Expert': '#8e44ad',
};

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.35; // Approximately 35% of screen width

const TrailRouteCarousel: React.FC<TrailRouteCarouselProps> = ({
  routes,
  selectedRouteId,
  onRouteSelect,
}) => {
  if (!routes || routes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="hiking" size={48} color="#ccc" />
        <Text style={styles.emptyText}>No trail routes available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Trail Routes</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        decelerationRate="fast"
        snapToInterval={cardWidth + 12} // Card width + margin
        snapToAlignment="start"
      >
        {routes.map((route, index) => {
          const isSelected = selectedRouteId === route.id;
          const difficultyColor = DIFFICULTY_COLORS[route.difficulty] || '#3498db';
          
          return (
            <TouchableOpacity
              key={route.id}
              style={[
                styles.routeCard,
                { width: cardWidth },
                isSelected && styles.selectedCard,
                index === 0 && styles.firstCard,
                index === routes.length - 1 && styles.lastCard,
              ]}
              onPress={() => onRouteSelect(route.id)}
              activeOpacity={0.7}
            >
              {/* Difficulty Badge */}
              <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
                <Text style={styles.difficultyText}>{route.difficulty}</Text>
              </View>
              
              {/* Route Name */}
              <Text style={styles.routeName} numberOfLines={2}>
                {route.route_name}
              </Text>
              
              {/* Distance */}
              <Text style={styles.routeDistance}>{route.distance_km} km</Text>
              
              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <MaterialIcons name="trending-up" size={14} color="#666" />
                  <Text style={styles.statText}>{route.elevation_gain_m}m</Text>
                </View>
                
                <View style={styles.statItem}>
                  <MaterialIcons name="schedule" size={14} color="#666" />
                  <Text style={styles.statText}>
                    {Math.round(route.estimated_duration_min / 60)}h
                  </Text>
                </View>
              </View>
              
              {/* Selection Indicator */}
              {isSelected && (
                <View style={styles.selectionIndicator}>
                  <MaterialIcons name="check-circle" size={16} color="#2ecc71" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  routeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  selectedCard: {
    borderColor: '#2ecc71',
    backgroundColor: '#f0fff4',
    elevation: 4,
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  firstCard: {
    marginLeft: 0,
  },
  lastCard: {
    marginRight: 20,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
    minHeight: 40, // Ensure consistent height
  },
  routeDistance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default TrailRouteCarousel;
