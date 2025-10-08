import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TrailRoute } from '../types';

interface TrailInfoCarouselProps {
  routes: TrailRoute[];
  selectedRouteId: string | null;
  onSelectRoute: (route: TrailRoute) => void;
}

export const TrailInfoCarousel: React.FC<TrailInfoCarouselProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
}) => {
  if (routes.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Trail Information</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        snapToInterval={Dimensions.get('window').width * 0.8 + 16}
        decelerationRate="fast"
      >
        {routes.map((route) => (
          <TouchableOpacity
            key={route.id}
            style={[
              styles.card,
              selectedRouteId === route.id && styles.selectedCard,
            ]}
            onPress={() => onSelectRoute(route)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.routeName} numberOfLines={1}>
                {route.route_name}
              </Text>
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: route.route_color },
                ]}
              >
                <Text style={styles.difficultyText}>{route.difficulty}</Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialIcons name="directions-walk" size={20} color="#666" />
                <Text style={styles.statValue}>
                  {route.distance.toFixed(1)} km
                </Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>

              <View style={styles.statItem}>
                <MaterialIcons name="schedule" size={20} color="#666" />
                <Text style={styles.statValue}>
                  {Math.round(route.estimated_duration / 60)} min
                </Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>

              <View style={styles.statItem}>
                <MaterialIcons name="terrain" size={20} color="#666" />
                <Text style={styles.statValue}>
                  {route.elevation_gain} m
                </Text>
                <Text style={styles.statLabel}>Elevation</Text>
              </View>
            </View>

            {route.highlights && (
              <View style={styles.highlightsContainer}>
                <Text style={styles.highlightsTitle}>Highlights:</Text>
                <Text style={styles.highlightsText} numberOfLines={2}>
                  {route.highlights}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 12,
    color: '#333',
  },
  carouselContainer: {
    paddingHorizontal: 8,
  },
  card: {
    width: Dimensions.get('window').width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedCard: {
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
    color: '#333',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  difficultyText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  highlightsContainer: {
    marginTop: 8,
  },
  highlightsTitle: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#444',
  },
  highlightsText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
