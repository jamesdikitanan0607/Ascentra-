import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrailWithSpot, DIFFICULTY_COLORS } from '../services/trailService';

interface TrailCardProps {
  trail: TrailWithSpot;
  onPress: (trail: TrailWithSpot) => void;
  isSelected?: boolean;
}

const { width } = Dimensions.get('window');

export default function TrailCard({ trail, onPress, isSelected = false }: TrailCardProps) {
  const difficultyColor = DIFFICULTY_COLORS[trail.difficulty as keyof typeof DIFFICULTY_COLORS] || '#666666';

  const formatDuration = (hours: number): string => {
    if (typeof hours !== "number") {
      return "N/A";
    }
    if (hours < 1) {
      return `${Math.round(hours * 60)}min`;
    }
    return `${hours.toFixed(1)}h`;
  };

  const formatDistance = (km: number): string => {
    if (typeof km !== "number") {
      return "N/A";
    }
    return `${km.toFixed(1)}km`;
  };

  const formatElevation = (meters: number): string => {
    return `${meters}m`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        { borderLeftColor: difficultyColor }
      ]}
      onPress={() => onPress(trail)}
      activeOpacity={0.7}
    >
      {/* Header with trail name and difficulty */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.trailName} numberOfLines={1}>
            {trail.name}
          </Text>
          <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
            <Text style={styles.difficultyText}>{trail.difficulty}</Text>
          </View>
        </View>
      </View>

      {/* Trail stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="trail-sign-outline" size={16} color="#666" />
          <Text style={styles.statText}>{formatDistance(trail.distance_km)}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="trending-up-outline" size={16} color="#666" />
          <Text style={styles.statText}>{formatElevation(trail.elevation_m)}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.statText}>{formatDuration(trail.duration_hr)}</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.statText}>{trail.trail_type || 'Trail'}</Text>
        </View>
      </View>

      {/* Highlights */}
      <Text style={styles.highlights} numberOfLines={2}>
        {typeof trail.highlights === 'string' ? trail.highlights : ''}
      </Text>

      {/* Mountain name */}
      <View style={styles.mountainContainer}>
        <Ionicons name="location-outline" size={14} color="#888" />
        <Text style={styles.mountainText}>{trail.hiking_spot.name}</Text>
      </View>

      {/* Selection indicator */}
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedContainer: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  header: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  trailName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: width * 0.2,
    marginBottom: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  highlights: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  mountainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mountainText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});