import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/colors';
import LeafletTrailMap from '../../../components/LeafletTrailMap';
import { TrailRoute } from '../../../types';

interface TrailMapSectionProps {
  hikingSpotId: string;
  selectedTrailId?: string;
  trailRoutes: TrailRoute[];
  onTrailSelect: (trailId: string) => void;
  onFullscreenPress: () => void;
}

export const TrailMapSection: React.FC<TrailMapSectionProps> = ({
  hikingSpotId,
  selectedTrailId,
  trailRoutes,
  onTrailSelect,
  onFullscreenPress,
}) => {
  const handleTrailSelect = useCallback((trailId: string) => {
    if (trailId) {
      onTrailSelect(trailId);
    }
  }, [onTrailSelect]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trail Map</Text>
        <TouchableOpacity 
          style={styles.fullscreenButton}
          onPress={onFullscreenPress}
          disabled={!trailRoutes || trailRoutes.length === 0}
        >
          <Ionicons name="expand" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.mapContainer}>
        <LeafletTrailMap
          selectedHikingSpotId={hikingSpotId}
          selectedTrailId={selectedTrailId}
          onTrailSelect={handleTrailSelect}
          style={styles.mapStyle}
          showFullscreenButton={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  fullscreenButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(56, 142, 60, 0.1)',
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.lightGray,
  },
  mapStyle: {
    flex: 1,
  },
});
