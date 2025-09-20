import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TrailRouteDetails } from '../services/supabaseService';

const { width } = Dimensions.get('window');

interface TrailRoutesSliderProps {
  routes: TrailRouteDetails[];
  selectedRoute: TrailRouteDetails | null;
  onRouteSelect: (route: TrailRouteDetails) => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

const COLORS = {
  primary: '#388E3C',
  text: '#212121',
  textLight: '#616161',
  textMuted: '#9E9E9E',
  card: '#F9F9F9',
  separator: '#EEEEEE',
  error: '#F44336',
  background: '#FFFFFF',
};

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return '#4CAF50';
    case 'moderate':
      return '#FF9800';
    case 'hard':
      return '#F44336';
    case 'very hard':
      return '#9C27B0';
    case 'expert':
      return '#212121';
    default:
      return '#FF9800';
  }
};

export default function TrailRoutesSlider({
  routes,
  selectedRoute,
  onRouteSelect,
  loading = false,
  error,
  onRetry,
}: TrailRoutesSliderProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="hiking" size={32} color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading trail routes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={32} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <MaterialIcons name="refresh" size={16} color="white" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const routesToDisplay = routes.length > 0 ? routes : [
    { 
      route_id: 1, 
      hiking_spot_id: 1,
      route_name: 'Main Trail', 
      difficulty: 'Easy' as const, 
      distance_km: 2.5, 
      elevation_gain_m: 200, 
      estimated_duration_hr: 1.5,
      start_coordinates: null,
      highlights: 'Easy trail suitable for beginners',
      geojson_path: null,
      route_color: '#4CAF50'
    },
    { 
      route_id: 2, 
      hiking_spot_id: 1,
      route_name: 'Summit Route', 
      difficulty: 'Moderate' as const, 
      distance_km: 4.2, 
      elevation_gain_m: 450, 
      estimated_duration_hr: 2.5,
      start_coordinates: null,
      highlights: 'Moderate trail with scenic views',
      geojson_path: null,
      route_color: '#FF9800'
    },
    { 
      route_id: 3, 
      hiking_spot_id: 1,
      route_name: 'Scenic Path', 
      difficulty: 'Hard' as const, 
      distance_km: 6.1, 
      elevation_gain_m: 680, 
      estimated_duration_hr: 3.5,
      start_coordinates: null,
      highlights: 'Challenging trail with beautiful scenery',
      geojson_path: null,
      route_color: '#F44336'
    },
    { 
      route_id: 4, 
      hiking_spot_id: 1,
      route_name: 'Advanced Trail', 
      difficulty: 'Advanced' as const, 
      distance_km: 8.3, 
      elevation_gain_m: 920, 
      estimated_duration_hr: 4.5,
      start_coordinates: null,
      highlights: 'Advanced trail for experienced hikers',
      geojson_path: null,
      route_color: '#9C27B0'
    },
    { 
      route_id: 5, 
      hiking_spot_id: 1,
      route_name: 'Expert Route', 
      difficulty: 'Advanced' as const, 
      distance_km: 10.7, 
      elevation_gain_m: 1200, 
      estimated_duration_hr: 6.0,
      start_coordinates: null,
      highlights: 'Expert level trail with extreme challenges',
      geojson_path: null,
      route_color: '#795548'
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        decelerationRate="fast"
        snapToInterval={width * 0.75 + 16}
        snapToAlignment="start"
      >
        {routesToDisplay.map((route, index) => {
          const isSelected = selectedRoute?.route_id === route.route_id;
          const difficultyColor = getDifficultyColor(route.difficulty || 'moderate');

          return (
            <TouchableOpacity
              key={route.route_id || index}
              style={[
                styles.routeCard,
                isSelected && styles.selectedRouteCard,
              ]}
              onPress={() => onRouteSelect(route)}
              activeOpacity={0.8}
            >
              {/* Route Header */}
              <View style={styles.routeHeader}>
                <Text style={styles.routeName} numberOfLines={1}>
                  {route.route_name || `Route ${index + 1}`}
                </Text>
                <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
                  <Text style={styles.difficultyText}>
                    {route.difficulty || 'Moderate'}
                  </Text>
                </View>
              </View>

              {/* Route Stats */}
              <View style={styles.routeStats}>
                <View style={styles.statItem}>
                  <MaterialIcons name="straighten" size={16} color={COLORS.primary} />
                  <Text style={styles.statValue}>{route.distance_km || '2.5'}km</Text>
                </View>
                
                <View style={styles.statItem}>
                  <MaterialIcons name="trending-up" size={16} color={COLORS.primary} />
                  <Text style={styles.statValue}>{route.elevation_gain_m || '200'}m</Text>
                </View>
                
                <View style={styles.statItem}>
                  <MaterialIcons name="schedule" size={16} color={COLORS.primary} />
                  <Text style={styles.statValue}>{route.estimated_duration_hr || '1.5'}h</Text>
                </View>
              </View>

              {/* Selection Indicator */}
              {isSelected && (
                <View style={styles.selectionIndicator}>
                  <MaterialIcons name="check-circle" size={20} color={COLORS.primary} />
                  <Text style={styles.selectedText}>Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      {/* Swipe Hint */}
      <View style={styles.swipeHint}>
        <MaterialIcons name="swipe" size={16} color={COLORS.textMuted} />
        <Text style={styles.swipeHintText}>Swipe to explore routes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingRight: 32,
  },
  routeCard: {
    width: width * 0.75,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedRouteCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E8',
    elevation: 4,
    shadowOpacity: 0.15,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  routeStats: {
    flexDirection: 'column',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  selectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.separator,
    gap: 4,
  },
  selectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 4,
  },
  swipeHintText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  loadingContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  errorContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
});