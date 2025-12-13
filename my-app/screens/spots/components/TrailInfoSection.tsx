import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/colors';
import { TrailRoute } from '../../../types';
import { HikingSpotData } from '../../../data/hikingSpotData';

interface TrailInfoSectionProps {
  selectedRoute: TrailRoute | null;
  onFocusOnMap: (routeId: string) => void;
  spot?: HikingSpotData;
}

interface TrailInfoCard {
  id: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  content: string;
}

export const TrailInfoSection: React.FC<TrailInfoSectionProps> = ({
  selectedRoute,
  onFocusOnMap,
  spot,
}) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  // Trail safety tips and information
  const trailInfo: TrailInfoCard[] = [
    {
      id: 'safety',
      title: 'Safety Tips',
      icon: 'security',
      content: spot?.tips ? spot.tips.map(t => `• ${t}`).join('\n') : '• Always carry enough water and snacks\n• Stay on marked trails\n• Check weather conditions before hiking\n• Let someone know your plans\n• Bring a map and compass/GPS',
    },
    {
      id: 'etiquette',
      title: 'Trail Etiquette',
      icon: 'groups',
      content: '• Yield to uphill hikers\n• Keep noise levels down\n• Pack out all trash\n• Respect wildlife from a distance\n• Be considerate of other trail users',
    },
    {
      id: 'preparation',
      title: 'Preparation',
      icon: 'checklist',
      content: '• Wear appropriate footwear\n• Dress in layers\n• Bring sun protection\n• Carry a first-aid kit\n• Know your limits',
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    if (!difficulty) return COLORS.gray;
    const difficultyLower = difficulty.toLowerCase();
    if (difficultyLower.includes('easy')) return COLORS.success;
    if (difficultyLower.includes('moderate')) return COLORS.warning;
    if (difficultyLower.includes('hard') || difficultyLower.includes('expert')) return COLORS.error;
    return COLORS.primary;
  };

  if (!selectedRoute) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Trail Information</Text>

        {spot && spot.highlights && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionSubtitle}>Highlights</Text>
            <View style={{ marginBottom: 16 }}>
              {spot.highlights.map((highlight, index) => (
                <View key={index} style={{ flexDirection: 'row', marginBottom: 4 }}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} style={{ marginRight: 8, marginTop: 2 }} />
                  <Text style={styles.description}>{highlight}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.infoGrid}>
          {trailInfo.map((info) => (
            <View key={info.id} style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <MaterialIcons name={info.icon} size={24} color={COLORS.primary} />
                <Text style={styles.infoTitle}>{info.title}</Text>
              </View>
              <Text style={styles.infoContent}>{info.content}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Trail Information</Text>

      <View style={styles.trailHeader}>
        <Text style={styles.trailName}>{selectedRoute.route_name}</Text>
        <View style={[
          styles.difficultyBadge,
          { backgroundColor: getDifficultyColor(selectedRoute.difficulty) }
        ]}>
          <Text style={styles.difficultyText}>{selectedRoute.difficulty}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="walk" size={20} color={COLORS.primary} />
          <Text style={styles.statValue}>{selectedRoute.distance_km?.toFixed(1) || 'N/A'} km</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="trending-up" size={20} color={COLORS.primary} />
          <Text style={styles.statValue}>{selectedRoute.elevation_gain_m || 'N/A'} m</Text>
          <Text style={styles.statLabel}>Elevation</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="time" size={20} color={COLORS.primary} />
          <Text style={styles.statValue}>
            {selectedRoute.estimated_time_hours ?
              `${Math.floor(selectedRoute.estimated_time_hours)}h ${Math.round((selectedRoute.estimated_time_hours % 1) * 60)}m` : 'N/A'}
          </Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
      </View>

      {(selectedRoute.waypoints && selectedRoute.waypoints.length > 0) && (
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionSubtitle}>Route Details</Text>
          <Text style={styles.description}>
            This route contains {selectedRoute.waypoints.length} waypoints.
          </Text>
        </View>
      )}

      <View style={styles.infoGrid}>
        {trailInfo.map((info) => (
          <View key={info.id} style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialIcons name={info.icon} size={24} color={COLORS.primary} />
              <Text style={styles.infoTitle}>{info.title}</Text>
            </View>
            <Text style={styles.infoContent}>{info.content}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.mapButton}
        onPress={() => onFocusOnMap(selectedRoute.id.toString())}
      >
        <Ionicons name="map" size={20} color="white" />
        <Text style={styles.mapButtonText}>View on Map</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  trailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trailName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: COLORS.grayLighter,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
    marginBottom: 4,
  },
  infoGrid: {
    marginTop: 16,
  },
  infoCard: {
    backgroundColor: COLORS.grayLighter,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  infoContent: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.gray,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 90,
    alignItems: 'center',
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  mapButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 300,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  mapButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  noRouteSelected: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
  },
  noRouteText: {
    color: COLORS.gray,
    fontSize: 16,
  },
});

export default TrailInfoSection;
