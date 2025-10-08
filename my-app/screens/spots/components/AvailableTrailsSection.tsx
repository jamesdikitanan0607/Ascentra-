import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../../styles/colors';
import { TrailRoute } from '../../../types';

interface AvailableTrailsSectionProps {
  trailRoutes: TrailRoute[];
  selectedTrailId?: string;
  onSelectTrail: (trail: TrailRoute) => void;
  hikingSpotId: string;
}

export const AvailableTrailsSection: React.FC<AvailableTrailsSectionProps> = ({
  trailRoutes,
  selectedTrailId,
  onSelectTrail,
  hikingSpotId,
}) => {
  const handleSelectTrail = (trail: TrailRoute) => {
    onSelectTrail(trail);
  };

  const getDifficultyColor = (difficulty: string) => {
    const difficultyLower = difficulty.toLowerCase();
    if (difficultyLower.includes('easy')) return COLORS.success;
    if (difficultyLower.includes('moderate')) return COLORS.warning;
    if (difficultyLower.includes('hard') || difficultyLower.includes('expert')) return COLORS.error;
    return COLORS.primary;
  };

  if (!trailRoutes || trailRoutes.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Trails</Text>
        <View style={styles.noRoutesContainer}>
          <Text style={styles.noRoutesText}>No trail routes available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Available Trails</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        style={styles.scrollView}
      >
        {trailRoutes.map((trail) => {
          const isSelected = selectedTrailId === trail.id?.toString();
          
          return (
            <TouchableOpacity
              key={trail.id?.toString()}
              style={[
                styles.trailChip,
                isSelected && styles.trailChipSelected,
              ]}
              onPress={() => handleSelectTrail(trail)}
            >
              <Text
                style={[
                  styles.trailChipText,
                  isSelected && styles.trailChipTextSelected,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {trail.route_name || 'Unnamed Trail'}
              </Text>
              <View
                style={[
                  styles.difficultyBadge,
                  {
                    backgroundColor: getDifficultyColor(trail.difficulty || 'Unknown'),
                  },
                ]}
              >
                <Text style={styles.difficultyText}>
                  {trail.difficulty || 'Unknown'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollViewContent: {
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  trailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 40,
    maxWidth: 200,
  },
  trailChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  trailChipText: {
    color: COLORS.text,
    marginRight: 6,
    flexShrink: 1,
  },
  trailChipTextSelected: {
    color: 'white',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  noRoutesContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 24,
  },
  noRoutesText: {
    color: COLORS.textTertiary,
    fontSize: 16,
    textAlign: 'center',
  },
});
