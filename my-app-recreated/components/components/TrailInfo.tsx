import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TrailRouteDetails } from '../services/supabaseService';

interface TrailInfoProps {
  selectedRoute: TrailRouteDetails | null;
  isLoading?: boolean;
  error?: string | null;
  onFocusOnMap?: (routeId: string) => void;
}

const COLORS = {
  primary: '#2E7D32',
  text: '#1F2933',
  textLight: '#546E7A',
  textMuted: '#9BA4AF',
  background: '#FFFFFF',
  card: '#FFFFFF',
  separator: '#E6E8EB',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#4CAF50',
  moderate: '#FF9800',
  hard: '#F44336',
  advanced: '#9C27B0',
  expert: '#9C27B0',
};

export default function TrailInfo({ selectedRoute, isLoading, error, onFocusOnMap }: TrailInfoProps) {
  const dimensions = useWindowDimensions();
  const { width = 0, height = 0 } = dimensions || {};
  
  // Responsive breakpoints with safety checks
  const isTablet = width >= 768;
  // Note: isLandscape is not needed here; remove to avoid unused variable warnings

  // Early return if dimensions are not available yet
  if (!width || !height) {
    return (
      <View style={{ padding: 16, backgroundColor: '#FFFFFF', borderRadius: 16 }}>
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
          <Text style={{ fontSize: 16, color: '#9BA4AF' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Create responsive styles
  const getResponsiveStyles = () => StyleSheet.create({
    container: {
      backgroundColor: COLORS.card,
      borderRadius: 16,
      padding: isTablet ? 24 : 16,
      margin: isTablet ? 24 : 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
    },
    loadingText: {
      fontSize: 16,
      color: COLORS.textMuted,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    placeholderContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
    },
    placeholderTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: COLORS.text,
      marginTop: 12,
      marginBottom: 8,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    },
    placeholderText: {
      fontSize: 14,
      color: COLORS.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: isTablet ? 20 : 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: COLORS.text,
      flex: 1,
      marginRight: 12,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    },
    difficultyBadge: {
      backgroundColor: 'rgba(46, 125, 50, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    difficultyText: {
      fontSize: 14,
      fontWeight: '600',
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
    },
    statLabel: {
      fontSize: 12,
      color: COLORS.textMuted,
      marginTop: 4,
      marginBottom: 2,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    statValue: {
      fontSize: isTablet ? 18 : 16,
      fontWeight: '600',
      color: COLORS.text,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    },
    highlightsSection: {
      borderTopWidth: 1,
      borderTopColor: COLORS.separator,
      paddingTop: 16,
    },
    sectionTitle: {
      fontSize: isTablet ? 18 : 16,
      fontWeight: '600',
      color: COLORS.primary,
      marginBottom: isTablet ? 12 : 8,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    },
    highlightsText: {
      fontSize: isTablet ? 16 : 14,
      color: COLORS.text,
      lineHeight: isTablet ? 24 : 20,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
  });

  const styles = getResponsiveStyles();

  // Error handling for invalid props
  if (isLoading === undefined || isLoading === null) {
    console.warn('TrailInfo: isLoading prop is undefined or null, defaulting to false');
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading trail information...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholderContainer}>
          <MaterialIcons name="error" size={48} color={COLORS.textMuted} />
          <Text style={styles.placeholderTitle}>Error Loading Trail Data</Text>
          <Text style={styles.placeholderText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!selectedRoute) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholderContainer}>
          <MaterialIcons name="map" size={48} color={COLORS.textMuted} />
          <Text style={styles.placeholderTitle}>Select a Trail Route</Text>
          <Text style={styles.placeholderText}>
            Choose a route from the list above to view detailed trail information
          </Text>
        </View>
      </View>
    );
  }

  // Validate selectedRoute has required properties
  const routeId = selectedRoute.route_id;
  if (!routeId) {
    console.error('TrailInfo: selectedRoute missing route_id or id:', selectedRoute);
    return (
      <View style={styles.container}>
        <View style={styles.placeholderContainer}>
          <MaterialIcons name="error" size={48} color={COLORS.textMuted} />
          <Text style={styles.placeholderTitle}>Invalid Route Data</Text>
          <Text style={styles.placeholderText}>
            This trail route has incomplete coordinate data. Please update the trail information.
          </Text>
        </View>
      </View>
    );
  }

  // Validate that the route has coordinate data
  const hasCoordinates = (selectedRoute.route_coordinates && selectedRoute.route_coordinates.length > 0) || 
                        (selectedRoute.geojson_path && selectedRoute.geojson_path.coordinates && selectedRoute.geojson_path.coordinates.length > 0) ||
                        (selectedRoute.start_coordinates && selectedRoute.end_coordinates);
  
  if (!hasCoordinates) {
    console.error('TrailInfo: selectedRoute missing coordinate data:', selectedRoute);
    return (
      <View style={styles.container}>
        <View style={styles.placeholderContainer}>
          <MaterialIcons name="error" size={48} color={COLORS.textMuted} />
          <Text style={styles.placeholderTitle}>Invalid Route Data</Text>
          <Text style={styles.placeholderText}>
            This trail route has incomplete coordinate data. Please update the trail information.
          </Text>
        </View>
      </View>
    );
  }

  const formatDuration = (hours: number) => {
    try {
      // Validate input
      if (typeof hours !== 'number' || isNaN(hours) || hours < 0) {
        console.warn('TrailInfo: Invalid duration value:', hours);
        return 'N/A';
      }

      if (hours < 1) {
        const minutes = Math.round(hours * 60);
        return `${minutes} min`;
      } else if (hours < 24) {
        const wholeHours = Math.floor(hours);
        const minutes = Math.round((hours - wholeHours) * 60);
        return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
      } else {
        const days = Math.floor(hours / 24);
        const remainingHours = Math.floor(hours % 24);
        return `${days}d ${remainingHours}h`;
      }
    } catch (error) {
      console.error('TrailInfo: Error formatting duration:', error);
      return 'N/A';
    }
  };

  const formatDistance = (distanceKm: number) => {
    try {
      if (typeof distanceKm !== 'number' || isNaN(distanceKm) || distanceKm < 0) {
        console.warn('TrailInfo: Invalid distance value:', distanceKm);
        return 'N/A';
      }
      return `${distanceKm.toFixed(1)} km`;
    } catch (error) {
      console.error('TrailInfo: Error formatting distance:', error);
      return 'N/A';
    }
  };

  const formatElevation = (elevationM: number) => {
    try {
      if (typeof elevationM !== 'number' || isNaN(elevationM)) {
        console.warn('TrailInfo: Invalid elevation value:', elevationM);
        return 'N/A';
      }
      return elevationM >= 0 ? `+${elevationM}m` : `${elevationM}m`;
    } catch (error) {
      console.error('TrailInfo: Error formatting elevation:', error);
      return 'N/A';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    try {
      if (!difficulty || typeof difficulty !== 'string') {
        console.warn('TrailInfo: Invalid difficulty value:', difficulty);
        return COLORS.primary;
      }
      const key = difficulty.toLowerCase();
      return DIFFICULTY_COLORS[key] || COLORS.primary;
    } catch (error) {
      console.error('TrailInfo: Error getting difficulty color:', error);
      return COLORS.primary;
    }
  };

  // Get route name
  const routeName = selectedRoute.route_name;
  
  // Don't render if no valid route name
  if (!routeName || routeName.trim() === '') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{routeName}</Text>
        <View style={styles.difficultyBadge}>
          <Text
            style={[
              styles.difficultyText,
              { color: getDifficultyColor(selectedRoute.difficulty || selectedRoute.difficulty_level) },
            ]}
          >
            {(selectedRoute.difficulty || selectedRoute.difficulty_level) ? (selectedRoute.difficulty || selectedRoute.difficulty_level) : 'Unknown'}
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <MaterialIcons name="straighten" size={20} color={COLORS.primary} />
          <Text style={styles.statLabel}>Distance</Text>
          <Text style={styles.statValue}>{formatDistance(selectedRoute.distance_km || 0)}</Text>
        </View>

        <View style={styles.statItem}>
          <MaterialIcons name="trending-up" size={20} color={COLORS.primary} />
          <Text style={styles.statLabel}>Elevation</Text>
          <Text style={styles.statValue}>{formatElevation(selectedRoute.elevation_gain_m || 0)}</Text>
        </View>

        <View style={styles.statItem}>
          <MaterialIcons name="schedule" size={20} color={COLORS.primary} />
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>{formatDuration(selectedRoute.estimated_duration_hr || 0)}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <MaterialIcons name="flag" size={20} color={COLORS.primary} />
          <Text style={styles.statLabel}>Start</Text>
          <Text style={styles.statValue}>
            {selectedRoute.start_coordinates
              ? `${selectedRoute.start_coordinates.latitude.toFixed(5)}, ${selectedRoute.start_coordinates.longitude.toFixed(5)}`
              : 'N/A'}
          </Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="outlined-flag" size={20} color={COLORS.primary} />
          <Text style={styles.statLabel}>End</Text>
          <Text style={styles.statValue}>
            {selectedRoute.end_coordinates
              ? `${selectedRoute.end_coordinates.latitude.toFixed(5)}, ${selectedRoute.end_coordinates.longitude.toFixed(5)}`
              : 'N/A'}
          </Text>
        </View>
      </View>

      {(() => {
        const routeId = selectedRoute.route_id;
        if (!routeId) return null;
        return (
          <View style={{ alignItems: 'center', marginBottom: 8 }}>
            <View
              accessible
              accessibilityRole="button"
              accessibilityLabel="View selected trail on map"
              style={{
                flexDirection: 'row',
                backgroundColor: '#F0FDF4',
                borderColor: '#BBF7D0',
                borderWidth: 1,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 999,
              }}
              onStartShouldSetResponder={() => true}
              onResponderRelease={() => onFocusOnMap && onFocusOnMap(routeId.toString())}
            >
              <MaterialIcons name="map" size={18} color={COLORS.primary} />
              <Text style={{ marginLeft: 8, color: COLORS.primary, fontWeight: '600' }}>View on Map</Text>
            </View>
          </View>
        );
      })()}

      {(() => {
        const highlights = typeof selectedRoute.highlights === "string" 
          ? selectedRoute.highlights.trim() 
          : "";
        return highlights && (
          <View style={styles.highlightsSection}>
            <Text style={styles.sectionTitle}>Trail Highlights</Text>
            <Text style={styles.highlightsText}>{highlights}</Text>
          </View>
        );
      })()}
    </View>
  );
}