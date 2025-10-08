import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TrailRoute } from '../types';
import { getWeatherData } from '../services/supabaseService';

// Interface for the component props
interface TrailInfoProps {
  selectedRoute: TrailRoute | null;
  isLoading?: boolean;
  error?: string | null;
  onFocusOnMap?: (routeId: string) => void;
}

// Interface for weather data
interface WeatherInfo {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  description?: string;
}

// Color constants
const COLORS = {
  primary: '#2E7D32',
  text: '#1F2933',
  textLight: '#546E7A',
  textMuted: '#9BA4AF',
  background: '#FFFFFF',
  card: '#FFFFFF',
  separator: '#E6E8EB',
  error: '#D32F2F',
  warning: '#FFA000',
  success: '#388E3C',
};

// Difficulty level colors
const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#4CAF50',
  moderate: '#FF9800',
  hard: '#F44336',
  challenging: '#9C27B0',
  expert: '#9C27B0',
};

const TrailInfo: React.FC<TrailInfoProps> = ({
  selectedRoute,
  isLoading = false,
  error = null,
  onFocusOnMap,
}) => {
  const { width } = useWindowDimensions();
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const isTablet = width >= 768;

  // Format duration in hours and minutes
  const formatDuration = useMemo(() => {
    return (minutes: number): string => {
      if (!minutes && minutes !== 0) return 'N/A';
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      
      if (hours > 0 && mins > 0) {
        return `${hours}h ${mins}m`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else {
        return `${mins}m`;
      }
    };
  }, []);

  // Format distance with units
  const formatDistance = useMemo(() => {
    return (distance: number): string => {
      if (!distance && distance !== 0) return 'N/A';
      return `${distance.toFixed(1)} km`;
    };
  }, []);

  // Format elevation with units
  const formatElevation = useMemo(() => {
    return (elevation: number): string => {
      if (!elevation && elevation !== 0) return 'N/A';
      return `${Math.round(elevation)} m`;
    };
  }, []);

  // Get difficulty color
  const getDifficultyColor = useMemo(() => {
    return (difficulty?: string): string => {
      if (!difficulty) return COLORS.textMuted;
      const lowerCaseDiff = difficulty.toLowerCase();
      return DIFFICULTY_COLORS[lowerCaseDiff] || COLORS.textMuted;
    };
  }, []);

  // Fetch weather data when selected route changes
  useEffect(() => {
    const fetchWeather = async () => {
      if (!selectedRoute?.start_coordinates) {
        setWeather(null);
        return;
      }
      
      setWeatherLoading(true);
      setWeatherError(null);
      
      try {
        const weatherData = await getWeatherData(
          selectedRoute.start_coordinates.latitude,
          selectedRoute.start_coordinates.longitude
        );
        
        if (weatherData) {
          setWeather({
            temperature: Math.round(weatherData.temperature),
            condition: weatherData.condition,
            humidity: weatherData.humidity,
            windSpeed: weatherData.windSpeed,
            icon: weatherData.icon,
            description: weatherData.description
          });
        } else {
          setWeather(null);
        }
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setWeatherError('Failed to load weather data');
        setWeather(null);
      } finally {
        setWeatherLoading(false);
      }
    };
    
    fetchWeather();
  }, [selectedRoute]);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading trail information...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>Error Loading Trail</Text>
        <Text style={styles.subText}>{error}</Text>
      </View>
    );
  }

  // No route selected state
  if (!selectedRoute) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MaterialIcons name="terrain" size={48} color={COLORS.textMuted} />
        <Text style={styles.title}>No Trail Selected</Text>
        <Text style={styles.subText}>
          Select a trail from the map to view detailed information
        </Text>
      </View>
    );
  }

  // Parse waypoints if they exist
  const waypoints = useMemo(() => {
    if (!selectedRoute.waypoints) return [];
    try {
      if (typeof selectedRoute.waypoints === 'string') {
        return JSON.parse(selectedRoute.waypoints);
      }
      return selectedRoute.waypoints;
    } catch (e) {
      console.error('Error parsing waypoints:', e);
      return [];
    }
  }, [selectedRoute.waypoints]);

  // Split highlights into an array if it's a string
  const highlights = useMemo(() => {
    if (!selectedRoute.highlights) return [];
    if (Array.isArray(selectedRoute.highlights)) {
      return selectedRoute.highlights;
    }
    return selectedRoute.highlights.split(',').map(h => h.trim());
  }, [selectedRoute.highlights]);

  return (
    <ScrollView 
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header with title and map button */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {selectedRoute.route_name || 'Trail Information'}
        </Text>
        {onFocusOnMap && selectedRoute.id && (
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => onFocusOnMap(selectedRoute.id)}
          >
            <MaterialIcons name="map" size={20} color={COLORS.primary} />
            <Text style={styles.mapButtonText}>View on Map</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Trail description */}
      {selectedRoute.route_description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Trail</Text>
          <Text style={styles.description}>
            {selectedRoute.route_description}
          </Text>
        </View>
      )}

      {/* Trail stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <MaterialIcons name="directions-walk" size={24} color={COLORS.primary} />
          <Text style={styles.statValue}>
            {formatDistance(selectedRoute.distance)}
          </Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <MaterialIcons name="terrain" size={24} color={COLORS.primary} />
          <Text style={styles.statValue}>
            {formatElevation(selectedRoute.elevation_gain)}
          </Text>
          <Text style={styles.statLabel}>Elevation</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <MaterialIcons name="timer" size={24} color={COLORS.primary} />
          <Text style={styles.statValue}>
            {formatDuration(selectedRoute.estimated_duration)}
          </Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
      </View>

      {/* Difficulty */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Difficulty</Text>
        <View style={styles.difficultyContainer}>
          <View 
            style={[
              styles.difficultyPill, 
              { backgroundColor: getDifficultyColor(selectedRoute.difficulty) }
            ]}
          >
            <Text style={styles.difficultyText}>
              {selectedRoute.difficulty || 'Unknown'}
            </Text>
          </View>
        </View>
      </View>

      {/* Weather information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Weather</Text>
        {weatherLoading ? (
          <View style={styles.weatherLoading}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.weatherLoadingText}>Loading weather data...</Text>
          </View>
        ) : weatherError ? (
          <View style={styles.weatherError}>
            <MaterialIcons name="error-outline" size={20} color={COLORS.error} />
            <Text style={styles.weatherErrorText}>{weatherError}</Text>
          </View>
        ) : weather ? (
          <View style={styles.weatherContainer}>
            <View style={styles.weatherMain}>
              <Text style={styles.weatherTemp}>{weather.temperature}°C</Text>
              <Text style={styles.weatherCondition}>{weather.condition}</Text>
            </View>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetail}>
                <MaterialIcons name="opacity" size={16} color={COLORS.primary} />
                <Text style={styles.weatherDetailText}>{weather.humidity}%</Text>
              </View>
              <View style={styles.weatherDetail}>
                <MaterialIcons name="air" size={16} color={COLORS.primary} />
                <Text style={styles.weatherDetailText}>{weather.windSpeed} km/h</Text>
              </View>
            </View>
          </View>
        ) : (
          <Text style={styles.noDataText}>Weather data not available</Text>
        )}
      </View>

      {/* Trail highlights */}
      {highlights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trail Highlights</Text>
          <View style={styles.highlightsContainer}>
            {highlights.map((highlight, index) => (
              <View key={index} style={styles.highlightItem}>
                <MaterialIcons name="check-circle" size={16} color={COLORS.primary} />
                <Text style={styles.highlightText}>{highlight}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Waypoints */}
      {waypoints.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Points</Text>
          <View style={styles.waypointsContainer}>
            {waypoints.map((waypoint: any, index: number) => (
              <View key={index} style={styles.waypointItem}>
                <View style={styles.waypointMarker}>
                  <Text style={styles.waypointNumber}>{index + 1}</Text>
                </View>
                <View style={styles.waypointContent}>
                  {waypoint.name && (
                    <Text style={styles.waypointName}>{waypoint.name}</Text>
                  )}
                  {waypoint.description && (
                    <Text style={styles.waypointDescription}>{waypoint.description}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Layout
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    borderRadius: 20,
  },
  mapButtonText: {
    color: COLORS.primary,
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    paddingLeft: 12,
  },
  
  // Description
  description: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(46, 125, 50, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Difficulty
  difficultyContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  difficultyPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Weather
  weatherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  weatherMain: {
    alignItems: 'flex-start',
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
  },
  weatherCondition: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 4,
  },
  weatherDetails: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  weatherDetailText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 4,
  },
  weatherLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  weatherLoadingText: {
    marginLeft: 8,
    color: COLORS.textMuted,
  },
  weatherError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  weatherErrorText: {
    marginLeft: 8,
    color: COLORS.error,
    fontStyle: 'italic',
  },
  
  // Highlights
  highlightsContainer: {
    marginTop: 8,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  highlightText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 8,
    lineHeight: 22,
  },
  
  // Waypoints
  waypointsContainer: {
    marginTop: 8,
  },
  waypointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  waypointMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  waypointNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  waypointContent: {
    flex: 1,
  },
  waypointName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  waypointDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  
  // Loading and error states
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.error,
    marginTop: 12,
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  noDataText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
});

export default TrailInfo;
