import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/colors';
import { TrailRoute } from '../../../types';

interface TrailRoutesSectionProps {
  trailRoutes: TrailRoute[];
  onTrailSelect: (trailId: string) => void;
  selectedTrailId?: string | null;
}

export const TrailRoutesSection: React.FC<TrailRoutesSectionProps> = ({
  trailRoutes,
  onTrailSelect,
  selectedTrailId,
}) => {
  const { width } = useWindowDimensions();
  const CARD_WIDTH = width * 0.8;
  const CARD_MARGIN = 12;
  const scrollRef = useRef<ScrollView>(null);
  const lastXRef = useRef(0);

  // Map various difficulty strings into canonical buckets with emojis and colors
  const DIFFICULTY_ORDER = ['Easy', 'Moderate', 'Challenging', 'Hard', 'Expert'] as const;
  const DIFFICULTY_COLOR: Record<string, string> = {
    Easy: '#4CAF50', // green
    Moderate: '#FFC107', // yellow
    Challenging: '#FF9800', // orange
    Hard: '#2196F3', // blue
    Expert: '#F44336', // red
  };
  
  const DIFFICULTY_EMOJI: Record<string, string> = {
    Easy: '🟢',
    Moderate: '🟡',
    Challenging: '🟠',
    Hard: '🔵',
    Expert: '🔴'
  };

  function toCanonicalDifficulty(raw?: string): typeof DIFFICULTY_ORDER[number] {
    if (!raw) return 'Moderate';
    const d = raw.trim().toLowerCase();
    if (d.includes('easy') && !d.includes('moderate')) return 'Easy'; // "Easy" or "Very Easy"
    if (d.includes('easy') && d.includes('moderate')) return 'Moderate'; // "Easy-Moderate"
    if (d === 'moderate') return 'Moderate';
    if (d.includes('very hard') || d.includes('expert')) return 'Expert';
    if (d.includes('hard')) return 'Hard';
    // Fallback bucket representing between moderate and hard per design intent
    return 'Challenging';
  }

  function getDifficultyColor(difficulty?: string): string {
    const canonical = toCanonicalDifficulty(difficulty);
    return DIFFICULTY_COLOR[canonical] || COLORS.primary;
  }

  // Process and sort routes by difficulty level
  const processedRoutes = React.useMemo(() => {
    if (!Array.isArray(trailRoutes) || trailRoutes.length === 0) return [];
    
    // Sort by difficulty order first, then by distance
    return [...trailRoutes]
      .sort((a, b) => {
        const aDiff = DIFFICULTY_ORDER.indexOf(toCanonicalDifficulty(a.difficulty));
        const bDiff = DIFFICULTY_ORDER.indexOf(toCanonicalDifficulty(b.difficulty));
        if (aDiff !== bDiff) return aDiff - bDiff;
        return (a.distance ?? 0) - (b.distance ?? 0);
      })
      .slice(0, 5); // Take first 5 routes
  }, [trailRoutes]);
  
  // Auto-select the first route if none selected
  useEffect(() => {
    if (processedRoutes.length > 0 && !selectedTrailId && onTrailSelect) {
      onTrailSelect(processedRoutes[0].id);
    }
  }, [processedRoutes, selectedTrailId, onTrailSelect]);

  const formatDuration = (minutes: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const renderTrailCard = (trail: TrailRoute) => {
    if (!trail) return null;
    
    const isSelected = selectedTrailId === trail.id;
    const difficulty = toCanonicalDifficulty(trail.difficulty);
    const emoji = DIFFICULTY_EMOJI[difficulty] || '🟣';
    
    return (
      <TouchableOpacity
        key={trail.id}
        style={[
          styles.trailCard,
          isSelected && styles.selectedTrailCard,
          { width: CARD_WIDTH, marginRight: CARD_MARGIN }
        ]}
        onPress={() => onTrailSelect(trail.id)}
        activeOpacity={0.8}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${difficulty} trail: ${trail.route_name}, ${trail.distance?.toFixed?.(1) ?? 'N/A'} kilometers`}
      >
        <View style={styles.trailHeader}>
          <Text style={styles.emoji}>
            {emoji}
          </Text>
          <View style={styles.nameColumn}>
            <Text 
              style={styles.trailName} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {trail.route_name}
            </Text>
            <Text style={styles.distanceText}>
              {trail.distance ? `${trail.distance.toFixed(1)} km` : 'N/A'}
            </Text>
          </View>
          <View 
            style={[
              styles.difficultyBadge, 
              { backgroundColor: getDifficultyColor(trail.difficulty) }
            ]}
          >
            <Text style={styles.difficultyText}>
              {difficulty}
            </Text>
          </View>
        </View>
        
        <View style={styles.trailStats}>
          <View style={styles.statItem}>
            <MaterialIcons name="terrain" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>
              {trail.elevation_gain ? `${Math.round(trail.elevation_gain)} m` : 'N/A'} gain
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialIcons name="access-time" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>
              {formatDuration(trail.estimated_duration || 0)}
            </Text>
          </View>
        </View>
        
        {trail.highlights && (
          <Text 
            style={styles.trailHighlights} 
            numberOfLines={2} 
            ellipsizeMode="tail"
          >
            {trail.highlights}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (!trailRoutes || trailRoutes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="terrain" size={48} color={COLORS.grayLight} />
        <Text style={styles.emptyTitle}>No Trail Routes Available</Text>
        <Text style={styles.emptyText}>
          Check back later for detailed trail maps and routes.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Trail Routes</Text>
      <View>
        {/* Left/Right navigation arrows */}
        <TouchableOpacity
          style={[styles.navButton, styles.navLeft]}
          accessibilityRole="button"
          accessibilityLabel="Scroll left"
          onPress={() => {
            const dx = CARD_WIDTH + CARD_MARGIN;
            const nextX = Math.max(0, lastXRef.current - dx);
            scrollRef.current?.scrollTo({ x: nextX, animated: true });
            lastXRef.current = nextX;
          }}
        >
          <MaterialIcons name="chevron-left" size={28} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.navRight]}
          accessibilityRole="button"
          accessibilityLabel="Scroll right"
          onPress={() => {
            const dx = CARD_WIDTH + CARD_MARGIN;
            const nextX = lastXRef.current + dx;
            scrollRef.current?.scrollTo({ x: nextX, animated: true });
            lastXRef.current = nextX;
          }}
        >
          <MaterialIcons name="chevron-right" size={28} color={COLORS.primary} />
        </TouchableOpacity>

        <ScrollView 
          ref={scrollRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trailsContainer}
          snapToInterval={CARD_WIDTH + CARD_MARGIN}
          decelerationRate="fast"
          onScroll={(e) => {
            lastXRef.current = e.nativeEvent.contentOffset.x;
          }}
          scrollEventThrottle={16}
        >
          {processedRoutes.map(trail => (
            <View key={trail.id} accessibilityLabel={`Trail ${trail.route_name}`}>
              {renderTrailCard(trail)}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  trailsContainer: {
    paddingRight: 20,
    paddingBottom: 8,
  },
  navButton: {
    position: 'absolute',
    top: 34,
    zIndex: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  navLeft: {
    left: 6,
  },
  navRight: {
    right: 6,
  },
  trailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    height: 160,
    justifyContent: 'space-between',
  },
  selectedTrailCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  trailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  nameColumn: {
    flex: 1,
    marginRight: 8,
  },
  trailName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  distanceText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trailStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    backgroundColor: COLORS.grayLighter,
    borderRadius: 10,
    padding: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  trailHighlights: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  viewTrailContainer: {
    flexDirection: 'row',
  },
  viewTrailText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayLighter,
    borderRadius: 16,
    margin: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

