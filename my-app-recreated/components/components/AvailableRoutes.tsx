import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#2196F3',
  text: '#212121',
  textLight: '#616161',
  card: '#F9F9F9',
  background: '#FFFFFF',
  error: '#F44336',
  warning: '#FF9800',
  success: '#4CAF50',
};

export interface TrailRoute {
  id: string;
  route_name: string;
  difficulty: 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Hard' | 'Very Hard';
  distance: number;
  elevation_gain: number;
  estimated_duration: number;
  route_description?: string;
  highlights?: string;
  route_color: string;
  start_coordinates: { latitude: number; longitude: number };
  end_coordinates: { latitude: number; longitude: number };
  waypoints?: string;
  coordinates?: [number, number][];
}

interface AvailableRoutesProps {
  routes: TrailRoute[];
  selectedRoute: TrailRoute | null;
  onRouteSelect: (route: TrailRoute) => void;
  isLoading?: boolean;
  error?: string | null;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy':
      return '#4CAF50';
    case 'Easy-Moderate':
      return '#8BC34A';
    case 'Moderate':
      return '#FF9800';
    case 'Hard':
      return '#F44336';
    case 'Very Hard':
      return '#9C27B0';
    default:
      return '#757575';
  }
};

const formatDuration = (hours: number) => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (wholeHours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${wholeHours}h`;
  } else {
    return `${wholeHours}h ${minutes}m`;
  }
};

const formatDistance = (km: number) => {
  return `${km.toFixed(1)}km`;
};

const formatElevation = (m: number) => {
  return `${m}m`;
};

const AvailableRoutes: React.FC<AvailableRoutesProps> = ({
  routes,
  selectedRoute,
  onRouteSelect,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading routes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={32} color={COLORS.error} />
        <Text style={styles.errorText}>Failed to load routes</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
      </View>
    );
  }

  if (!routes || routes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="map" size={48} color={COLORS.textLight} />
        <Text style={styles.emptyTitle}>No Trail Routes Available</Text>
        <Text style={styles.emptyMessage}>
          No trail routes are available for this hiking spot yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Routes</Text>
        <Text style={styles.subtitle}>{routes.length} route{routes.length !== 1 ? 's' : ''} available</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.routesContainer}
        style={styles.scrollView}
      >
        {routes.map((route) => (
          <TouchableOpacity
            key={route.id}
            style={[
              styles.routeCard,
              selectedRoute?.id === route.id && styles.selectedRouteCard,
            ]}
            onPress={() => onRouteSelect(route)}
          >
            {/* Route color indicator */}
            <View style={[styles.colorIndicator, { backgroundColor: route.route_color }]} />

            {/* Route name */}
            <Text style={styles.routeName} numberOfLines={2}>
              {route.route_name}
            </Text>

            {/* Route stats */}
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <MaterialIcons name="straighten" size={14} color={COLORS.textLight} />
                <Text style={styles.statText}>{formatDistance(route.distance)}</Text>
              </View>

              <View style={styles.stat}>
                <MaterialIcons name="schedule" size={14} color={COLORS.textLight} />
                <Text style={styles.statText}>{formatDuration(route.estimated_duration)}</Text>
              </View>
            </View>

            {/* Difficulty badge */}
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(route.difficulty) }]}>
              <Text style={styles.difficultyText}>{route.difficulty.replace('-', '\n')}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  scrollView: {
    maxHeight: 200,
  },
  routesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  routeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    minWidth: 160,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedRouteCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#E3F2FD',
  },
  colorIndicator: {
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  routeName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textLight,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    marginTop: 8,
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AvailableRoutes;
