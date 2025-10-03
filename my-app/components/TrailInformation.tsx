import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AvailableRoutes, { TrailRoute } from './AvailableRoutes';

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

interface TrailInformationProps {
  selectedRoute: TrailRoute | null;
  onRouteSelect?: (route: TrailRoute) => void;
  availableRoutes?: TrailRoute[];
  isLoadingRoutes?: boolean;
  routesError?: string | null;
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
    return `${minutes} minutes`;
  } else if (minutes === 0) {
    return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''}`;
  } else {
    return `${wholeHours}h ${minutes}m`;
  }
};

const formatDistance = (km: number) => {
  return `${km.toFixed(1)} km`;
};

const formatElevation = (m: number) => {
  return `${m} m`;
};

const TrailInformation: React.FC<TrailInformationProps> = ({
  selectedRoute,
  onRouteSelect,
  availableRoutes = [],
  isLoadingRoutes = false,
  routesError = null,
}) => {
  if (!selectedRoute) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <MaterialIcons name="info-outline" size={48} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Select a Route</Text>
          <Text style={styles.emptyMessage}>
            Choose a trail route above to see detailed information including stats, description, and safety tips.
          </Text>
        </View>

        {/* Still show available routes even when no route is selected */}
        <AvailableRoutes
          routes={availableRoutes}
          selectedRoute={null}
          onRouteSelect={onRouteSelect || (() => {})}
          isLoading={isLoadingRoutes}
          error={routesError}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Trail Header */}
      <View style={styles.header}>
        <View style={[styles.difficultyIndicator, { backgroundColor: getDifficultyColor(selectedRoute.difficulty) }]} />
        <View style={styles.headerContent}>
          <Text style={styles.trailName}>{selectedRoute.route_name}</Text>
          <Text style={[styles.difficulty, { color: getDifficultyColor(selectedRoute.difficulty) }]}>
            {selectedRoute.difficulty}
          </Text>
        </View>
      </View>

      {/* Trail Description */}
      {selectedRoute.route_description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{selectedRoute.route_description}</Text>
        </View>
      )}

      {/* Trail Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trail Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <MaterialIcons name="straighten" size={20} color={COLORS.primary} />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{formatDistance(selectedRoute.distance)}</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <MaterialIcons name="trending-up" size={20} color={COLORS.primary} />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{formatElevation(selectedRoute.elevation_gain)}</Text>
              <Text style={styles.statLabel}>Elevation Gain</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <MaterialIcons name="schedule" size={20} color={COLORS.primary} />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{formatDuration(selectedRoute.estimated_duration)}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Highlights */}
      {selectedRoute.highlights && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          <View style={styles.highlightsList}>
            <Text style={styles.highlight}>{selectedRoute.highlights}</Text>
          </View>
        </View>
      )}

      {/* Safety Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Information</Text>
        <View style={styles.safetyCard}>
          <MaterialIcons name="warning" size={24} color={COLORS.warning} />
          <View style={styles.safetyContent}>
            <Text style={styles.safetyTitle}>Trail Safety</Text>
            <Text style={styles.safetyText}>
              • Wear appropriate footwear and clothing{'\n'}
              • Carry sufficient water and snacks{'\n'}
              • Check weather conditions before starting{'\n'}
              • Inform someone of your hiking plans{'\n'}
              • Stay on marked trails
            </Text>
          </View>
        </View>
      </View>

      {/* Trail Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trail Status</Text>
        <View style={styles.statusCard}>
          <MaterialIcons name="check-circle" size={20} color={COLORS.success} />
          <Text style={styles.statusText}>Open</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  difficultyIndicator: {
    width: 6,
    height: 40,
    borderRadius: 3,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  trailName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  difficulty: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  statContent: {
    marginLeft: 8,
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  highlightsList: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 8,
  },
  highlight: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  safetyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  safetyContent: {
    marginLeft: 12,
    flex: 1,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  safetyText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 8,
  },
});

export default TrailInformation;
