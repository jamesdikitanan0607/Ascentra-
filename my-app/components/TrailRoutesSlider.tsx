import React, { useRef, useState, useEffect, FC } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ViewToken,
  useWindowDimensions,
  FlatList,
  ActivityIndicator,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
  ListRenderItemInfo
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TrailRouteDetails } from '../services/supabaseService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.8;
const CARD_MARGIN = 10;
const CARD_TOTAL_WIDTH = CARD_WIDTH + CARD_MARGIN * 2;

type ViewabilityConfig = {
  itemVisiblePercentThreshold: number;
  minimumViewTime: number;
};

type ViewabilityConfigCallbackPair = {
  viewabilityConfig: ViewabilityConfig;
  onViewableItemsChanged: (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void;
};

interface TrailRoutesSliderProps {
  routes: TrailRouteDetails[];
  selectedRoute: TrailRouteDetails | null;
  onRouteSelect: (route: TrailRouteDetails) => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

const COLORS = {
  primary: '#388E3C',
  primaryLight: '#C8E6C9',
  text: '#212121',
  textLight: '#616161',
  textMuted: '#9E9E9E',
  card: '#FFFFFF',
  cardSelected: '#E8F5E9',
  separator: '#EEEEEE',
  error: '#F44336',
  background: '#F5F5F5',
  easy: '#4CAF50',
  moderate: '#FFC107',
  challenging: '#FF9800',
  hard: '#F44336',
  expert: '#9C27B0',
};

const DIFFICULTY_LEVELS = {
  easy: { color: COLORS.easy, icon: 'terrain' },
  moderate: { color: COLORS.moderate, icon: 'terrain' },
  challenging: { color: COLORS.challenging, icon: 'terrain' },
  hard: { color: COLORS.hard, icon: 'terrain' },
  expert: { color: COLORS.expert, icon: 'terrain' },
};

const getDifficultyConfig = (difficulty: string) => {
  const normalized = difficulty?.toLowerCase();
  return DIFFICULTY_LEVELS[normalized as keyof typeof DIFFICULTY_LEVELS] || 
         { color: COLORS.primary, icon: 'terrain' };
};

const TrailRouteCard = React.memo(({ 
  route, 
  isSelected, 
  onPress 
}: { 
  route: TrailRouteDetails; 
  isSelected: boolean; 
  onPress: () => void 
}) => {
  const { color: difficultyColor, icon } = getDifficultyConfig(route.difficulty_level || 'moderate');
  
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        { borderLeftWidth: 6, borderLeftColor: difficultyColor }
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${route.route_name}. Difficulty: ${route.difficulty_level}. ${route.distance_km} kilometers.`}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.routeName} numberOfLines={1} ellipsizeMode="tail">
          {route.route_name}
        </Text>
        <View style={[styles.difficultyBadge, { backgroundColor: `${difficultyColor}20` }]}>
          <MaterialIcons 
            name={icon as any} 
            size={16} 
            color={difficultyColor} 
            style={styles.difficultyIcon}
          />
          <Text style={[styles.difficultyText, { color: difficultyColor }]}>
            {route.difficulty_level}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.metric}>
          <MaterialIcons name="directions-walk" size={20} color={COLORS.textLight} />
          <Text style={styles.metricText}>
            {route.distance_km ? `${route.distance_km} km` : 'N/A'}
          </Text>
        </View>
        
        <View style={styles.metric}>
          <MaterialIcons name="terrain" size={20} color={COLORS.textLight} />
          <Text style={styles.metricText}>
            {route.elevation_gain_m ? `${route.elevation_gain_m} m` : 'N/A'}
          </Text>
        </View>
        
        <View style={styles.metric}>
          <MaterialIcons name="schedule" size={20} color={COLORS.textLight} />
          <Text style={styles.metricText}>
            {route.estimated_duration_hr ? `${route.estimated_duration_hr}h` : 'N/A'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const TrailRoutesSlider: FC<TrailRoutesSliderProps> = ({
  routes = [],
  selectedRoute,
  onRouteSelect = () => {},
  loading = false,
  error,
  onRetry,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [viewableItems, setViewableItems] = useState<ViewToken[]>([]);
  const { width: windowWidth } = useWindowDimensions();

  // Auto-select the first route if none is selected
  useEffect(() => {
    if (routes.length > 0 && !selectedRoute) {
      onRouteSelect(routes[0]);
    }
  }, [routes, selectedRoute, onRouteSelect]);

  // Handle viewable items change
  const onViewableItemsChanged = useRef(({ viewableItems: vItems }: { viewableItems: ViewToken[] }) => {
    if (vItems.length > 0) {
      setViewableItems(vItems);
      // Auto-select the first viewable item if none is selected
      if (!selectedRoute || !vItems.some(vi => vi.item.route_id === selectedRoute?.route_id)) {
        onRouteSelect(vItems[0].item);
      }
    }
  }).current;

  // Set up viewability config
  const viewabilityConfig = useRef<ViewabilityConfig>({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
  }).current;

  // Scroll to selected route
  useEffect(() => {
    if (selectedRoute && flatListRef.current) {
      const index = routes.findIndex(r => r.route_id === selectedRoute.route_id);
      if (index >= 0) {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }
    }
  }, [selectedRoute, routes]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading trail routes...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <MaterialIcons name="refresh" size={16} color="white" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Default routes if none available
  const routesToDisplay = routes.length > 0 ? routes : [
    { 
      route_id: '1', 
      hiking_spot_id: '1',
      route_name: 'Summit Trail', 
      difficulty_level: 'Easy',
      difficulty: 'Easy', 
      distance_km: 2.5, 
      elevation_gain_m: 200, 
      estimated_duration_hr: 1.5,
      start_coordinates: null,
      end_coordinates: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      route_color: COLORS.easy,
      route_description: 'A gentle trail with beautiful views',
      is_featured: true,
      is_public: true,
      created_by: 'system',
      updated_by: 'system',
      highlights: 'Beautiful views and gentle slopes',
      geojson_path: null,
    },
    { 
      route_id: '2', 
      hiking_spot_id: '1',
      route_name: 'Summit Route', 
      difficulty_level: 'Moderate',
      difficulty: 'Moderate', 
      distance_km: 4.2, 
      elevation_gain_m: 450, 
      estimated_duration_hr: 2.5,
      start_coordinates: null,
      end_coordinates: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      route_color: COLORS.moderate,
      route_description: 'Scenic route with moderate challenges',
      is_featured: true,
      is_public: true,
      created_by: 'system',
      updated_by: 'system',
      highlights: 'Moderate trail with scenic views',
      geojson_path: null,
    },
    { 
      route_id: '3', 
      hiking_spot_id: '1',
      route_name: 'Scenic Path', 
      difficulty_level: 'Challenging',
      difficulty: 'Challenging', 
      distance_km: 6.1, 
      elevation_gain_m: 680, 
      estimated_duration_hr: 3.5,
      start_coordinates: null,
      end_coordinates: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      route_color: COLORS.challenging,
      route_description: 'Challenging trail with beautiful scenery',
      is_featured: true,
      is_public: true,
      created_by: 'system',
      updated_by: 'system',
      highlights: 'Challenging trail with beautiful scenery',
      geojson_path: null,
    },
    { 
      route_id: '4', 
      hiking_spot_id: '1',
      route_name: 'Advanced Trail', 
      difficulty_level: 'Hard',
      difficulty: 'Hard', 
      distance_km: 8.3, 
      elevation_gain_m: 920, 
      estimated_duration_hr: 4.5,
      start_coordinates: null,
      end_coordinates: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      route_color: COLORS.hard,
      route_description: 'Advanced trail for experienced hikers',
      is_featured: true,
      is_public: true,
      created_by: 'system',
      updated_by: 'system',
      highlights: 'Advanced trail for experienced hikers',
      geojson_path: null,
    },
    { 
      route_id: '5', 
      hiking_spot_id: '1',
      route_name: 'Expert Route', 
      difficulty_level: 'Expert',
      difficulty: 'Expert', 
      distance_km: 10.7, 
      elevation_gain_m: 1200, 
      estimated_duration_hr: 6.0,
      start_coordinates: null,
      end_coordinates: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      route_color: COLORS.expert,
      route_description: 'Expert level trail with extreme challenges',
      is_featured: true,
      is_public: true,
      created_by: 'system',
      updated_by: 'system',
      highlights: 'Expert level trail with extreme challenges',
      geojson_path: null,
    },
  ] as unknown as TrailRouteDetails[];

  const renderRouteCard = ({ item: route }: ListRenderItemInfo<TrailRouteDetails>) => {
    const isSelected = selectedRoute?.route_id === route.route_id;
    const { color: difficultyColor, icon } = getDifficultyConfig(route.difficulty_level || 'moderate');
    
    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          key={route.route_id}
          style={[
            styles.card,
            isSelected && styles.cardSelected,
            { borderLeftColor: difficultyColor }
          ]}
          onPress={() => onRouteSelect(route)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.routeName} numberOfLines={1} ellipsizeMode="tail">
              {route.route_name}
            </Text>
            <View style={[styles.difficultyBadge, { backgroundColor: `${difficultyColor}20` }]}>
              <MaterialIcons 
                name={icon as any} 
                size={16} 
                color={difficultyColor} 
                style={styles.difficultyIcon} 
              />
              <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                {route.difficulty_level}
              </Text>
            </View>
          </View>
          
          <View style={styles.cardBody}>
            <View style={styles.metric}>
              <MaterialIcons name="directions-walk" size={20} color={COLORS.textLight} />
              <Text style={styles.metricText}>
                {route.distance_km ? `${route.distance_km} km` : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.metric}>
              <MaterialIcons name="terrain" size={20} color={COLORS.textLight} />
              <Text style={styles.metricText}>
                {route.elevation_gain_m ? `${route.elevation_gain_m} m` : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.metric}>
              <MaterialIcons name="schedule" size={20} color={COLORS.textLight} />
              <Text style={styles.metricText}>
                {route.estimated_duration_hr ? `${route.estimated_duration_hr}h` : 'N/A'}
              </Text>
            </View>
          </View>
          
          {isSelected && (
            <View style={styles.selectionIndicator}>
              <MaterialIcons name="check-circle" size={16} color={COLORS.primary} />
              <Text style={styles.selectedText}>Selected</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={routesToDisplay}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={CARD_TOTAL_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContainer}
        keyExtractor={(item) => item.route_id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={renderRouteCard}
        getItemLayout={(data, index) => ({
          length: CARD_TOTAL_WIDTH,
          offset: CARD_TOTAL_WIDTH * index,
          index,
        })}
      />
      
      {/* Swipe Hint */}
      <View style={styles.swipeHint}>
        <MaterialIcons name="swipe" size={16} color={COLORS.textMuted} />
        <Text style={styles.swipeHintText}>Swipe to explore routes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    position: 'relative',
    minHeight: 200,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scrollIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
    backgroundColor: '#E0E0E0',
  },
  scrollContainer: {
    paddingHorizontal: CARD_MARGIN,
    paddingVertical: 8,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    height: 180,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: COLORS.cardSelected,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  difficultyIcon: {
    marginRight: 4,
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    flex: 1,
  },
  metric: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  metricText: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectionIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  selectedText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  selectedRouteCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E8',
    elevation: 4,
    shadowOpacity: 0.15,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  colorIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 8,
  },
  routeStats: {
    flexDirection: 'column',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  swipeHintText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  loadingContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  errorContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
});

export default TrailRoutesSlider;