import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TrailRouteDetails } from '../services/supabaseService';

interface TrailLegendProps {
  routes: TrailRouteDetails[];
  selectedRoute: TrailRouteDetails | null;
  onRouteSelect: (route: TrailRouteDetails) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const COLORS = {
  primary: '#388E3C',
  text: '#212121',
  textLight: '#616161',
  textMuted: '#9E9E9E',
  card: '#FFFFFF',
  cardSelected: '#E8F5E8',
  separator: '#EEEEEE',
  background: 'rgba(255, 255, 255, 0.95)',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return '#4CAF50';
    case 'easy-moderate':
      return '#8BC34A';
    case 'moderate':
      return '#FF9800';
    case 'hard':
      return '#F44336';
    case 'very hard':
      return '#9C27B0';
    default:
      return '#FF9800';
  }
};

export default function TrailLegend({
  routes,
  selectedRoute,
  onRouteSelect,
  isVisible,
  onToggleVisibility,
}: TrailLegendProps) {
  if (!isVisible) {
    return (
      <TouchableOpacity 
        style={styles.toggleButton} 
        onPress={onToggleVisibility}
        accessibilityRole="button"
        accessibilityLabel="Show trail legend"
        accessibilityHint="Opens the trail legend showing map symbols and available routes"
      >
        <MaterialIcons name="info" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    );
  }

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityLabel="Trail legend and route information"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="map" size={20} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Trail Legend</Text>
        </View>
        <TouchableOpacity 
          onPress={onToggleVisibility} 
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close trail legend"
          accessibilityHint="Hides the trail legend and route information"
        >
          <MaterialIcons name="close" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Legend Items */}
      <View style={styles.legendSection}>
        <Text style={styles.sectionTitle}>Map Symbols</Text>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendIcon, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Trail Start</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendIcon, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Trail End</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendIcon, { backgroundColor: '#2196F3' }]} />
          <Text style={styles.legendText}>Hiking Spot</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={styles.selectedTrailIndicator} />
          <Text style={styles.legendText}>Selected Trail (Bold)</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={styles.unselectedTrailIndicator} />
          <Text style={styles.legendText}>Other Trails (Dashed)</Text>
        </View>
      </View>

      {/* Route List */}
      <View style={styles.routesSection}>
        <Text style={styles.sectionTitle}>Available Routes</Text>
        <ScrollView style={styles.routesList} showsVerticalScrollIndicator={false}>
          {routes.map((route) => {
            const isSelected = selectedRoute?.route_id === route.route_id;
            const routeColor = route.route_color || getDifficultyColor(route.difficulty || 'Unknown');
            
            return (
              <TouchableOpacity
                key={route.route_id}
                style={[
                  styles.routeItem,
                  isSelected && styles.selectedRouteItem,
                ]}
                onPress={() => onRouteSelect(route)}
                accessibilityRole="button"
                accessibilityLabel={`${route.route_name} trail route`}
                accessibilityHint={`${route.difficulty} difficulty, ${route.distance_km} kilometers, ${route.estimated_duration_hr} hours. ${isSelected ? 'Currently selected' : 'Tap to select this route'}`}
                accessibilityState={{ selected: isSelected }}
              >
                <View style={styles.routeHeader}>
                  <View style={[styles.routeColorIndicator, { backgroundColor: routeColor }]} />
                  <Text style={[styles.routeName, isSelected && styles.selectedRouteName]} numberOfLines={1}>
                    {route.route_name}
                  </Text>
                  {isSelected && (
                    <MaterialIcons name="check-circle" size={16} color={COLORS.primary} />
                  )}
                </View>
                
                <View style={styles.routeStats}>
                  <View style={styles.statRow}>
                    <MaterialIcons name="straighten" size={12} color={COLORS.textMuted} />
                    <Text style={styles.statText}>{route.distance_km}km</Text>
                  </View>
                  <View style={styles.statRow}>
                    <MaterialIcons name="trending-up" size={12} color={COLORS.textMuted} />
                    <Text style={styles.statText}>{route.elevation_gain_m}m</Text>
                  </View>
                  <View style={styles.statRow}>
                    <MaterialIcons name="schedule" size={12} color={COLORS.textMuted} />
                    <Text style={styles.statText}>{route.estimated_duration_hr}h</Text>
                  </View>
                </View>
                
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(route.difficulty || 'Unknown') }]}>
                  <Text style={styles.difficultyText}>{route.difficulty}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    right: 16,
    width: Platform.select({
      ios: 280,
      android: 280,
      web: 320,
    }),
    maxHeight: '70%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    // Ensure it doesn't overflow on small screens
    maxWidth: '90%',
  },
  toggleButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    right: 16,
    width: Platform.select({
      ios: 48,
      android: 56, // Larger touch target for Android
      web: 48,
    }),
    height: Platform.select({
      ios: 48,
      android: 56, // Larger touch target for Android
      web: 48,
    }),
    backgroundColor: COLORS.background,
    borderRadius: Platform.select({
      ios: 24,
      android: 28,
      web: 24,
    }),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  closeButton: {
    padding: 4,
  },
  legendSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  legendIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  selectedTrailIndicator: {
    width: 20,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 1.5,
  },
  unselectedTrailIndicator: {
    width: 20,
    height: 1,
    backgroundColor: COLORS.textMuted,
    borderRadius: 0.5,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  routesSection: {
    flex: 1,
    padding: 16,
  },
  routesList: {
    flex: 1,
  },
  routeItem: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  selectedRouteItem: {
    backgroundColor: COLORS.cardSelected,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  routeColorIndicator: {
    width: 3,
    height: 16,
    borderRadius: 1.5,
  },
  routeName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  selectedRouteName: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
});