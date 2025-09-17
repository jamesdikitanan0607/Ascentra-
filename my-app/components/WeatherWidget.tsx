import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  visibility: number;
  uvIndex: number;
  feelsLike: number;
  icon: string;
}

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
  locationName: string;
}

const COLORS = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  background: '#F5F5F5',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#666666',
  border: '#E0E0E0',
  warning: '#FF9800',
  danger: '#F44336',
};

// AccuWeather API configuration
const ACCUWEATHER_API_KEY = process.env.EXPO_PUBLIC_ACCUWEATHER_API_KEY;
const ACCUWEATHER_BASE_URL = 'http://dataservice.accuweather.com';

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  latitude,
  longitude,
  locationName,
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchWeatherData();
  }, [latitude, longitude]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if API key is configured
      if (!ACCUWEATHER_API_KEY || ACCUWEATHER_API_KEY === 'your_accuweather_api_key_here') {
        throw new Error('AccuWeather API key not configured');
      }

      // First, get location key from coordinates
      const locationResponse = await fetch(
        `${ACCUWEATHER_BASE_URL}/locations/v1/cities/geoposition/search?apikey=${ACCUWEATHER_API_KEY}&q=${latitude},${longitude}`
      );
      
      if (!locationResponse.ok) {
        throw new Error('Failed to get location data');
      }
      
      const locationData = await locationResponse.json();
      const locationKey = locationData.Key;

      // Get current weather conditions
      const weatherResponse = await fetch(
        `${ACCUWEATHER_BASE_URL}/currentconditions/v1/${locationKey}?apikey=${ACCUWEATHER_API_KEY}&details=true`
      );
      
      if (!weatherResponse.ok) {
        throw new Error('Failed to get weather data');
      }
      
      const weatherArray = await weatherResponse.json();
      const currentWeather = weatherArray[0];

      const weather: WeatherData = {
        temperature: Math.round(currentWeather.Temperature.Metric.Value),
        condition: currentWeather.WeatherText,
        humidity: currentWeather.RelativeHumidity,
        windSpeed: Math.round(currentWeather.Wind.Speed.Metric.Value),
        windDirection: currentWeather.Wind.Direction.English,
        visibility: Math.round(currentWeather.Visibility.Metric.Value),
        uvIndex: currentWeather.UVIndex,
        feelsLike: Math.round(currentWeather.RealFeelTemperature.Metric.Value),
        icon: currentWeather.WeatherIcon.toString().padStart(2, '0'),
      };

      setWeatherData(weather);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Unable to load weather data');
      
      // Fallback to mock data for development
      setWeatherData({
        temperature: 28,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12,
        windDirection: 'NE',
        visibility: 10,
        uvIndex: 6,
        feelsLike: 31,
        icon: '03',
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string): string => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
      return 'sunny';
    } else if (lowerCondition.includes('cloud')) {
      return 'cloud';
    } else if (lowerCondition.includes('rain')) {
      return 'water-drop';
    } else if (lowerCondition.includes('storm')) {
      return 'thunderstorm';
    } else if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) {
      return 'foggy';
    }
    return 'cloud';
  };

  const getUVIndexColor = (uvIndex: number): string => {
    if (uvIndex <= 2) return COLORS.primary;
    if (uvIndex <= 5) return COLORS.warning;
    return COLORS.danger;
  };

  const getUVIndexLabel = (uvIndex: number): string => {
    if (uvIndex <= 2) return 'Low';
    if (uvIndex <= 5) return 'Moderate';
    if (uvIndex <= 7) return 'High';
    if (uvIndex <= 10) return 'Very High';
    return 'Extreme';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading weather...</Text>
        </View>
      </View>
    );
  }

  if (error && !weatherData) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={24} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchWeatherData} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!weatherData) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.weatherHeader} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <MaterialIcons 
            name={getWeatherIcon(weatherData.condition) as any} 
            size={32} 
            color={COLORS.primary} 
          />
          <View style={styles.headerInfo}>
            <Text style={styles.temperature}>{weatherData.temperature}°C</Text>
            <Text style={styles.condition}>{weatherData.condition}</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <Text style={styles.feelsLike}>Feels like {weatherData.feelsLike}°C</Text>
          <MaterialIcons 
            name={expanded ? 'expand-less' : 'expand-more'} 
            size={24} 
            color={COLORS.lightText} 
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <MaterialIcons name="opacity" size={20} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Humidity</Text>
              <Text style={styles.detailValue}>{weatherData.humidity}%</Text>
            </View>
            
            <View style={styles.detailItem}>
              <MaterialIcons name="air" size={20} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Wind</Text>
              <Text style={styles.detailValue}>{weatherData.windSpeed} km/h {weatherData.windDirection}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <MaterialIcons name="visibility" size={20} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Visibility</Text>
              <Text style={styles.detailValue}>{weatherData.visibility} km</Text>
            </View>
            
            <View style={styles.detailItem}>
              <MaterialIcons name="wb-sunny" size={20} color={getUVIndexColor(weatherData.uvIndex)} />
              <Text style={styles.detailLabel}>UV Index</Text>
              <Text style={[styles.detailValue, { color: getUVIndexColor(weatherData.uvIndex) }]}>
                {weatherData.uvIndex} ({getUVIndexLabel(weatherData.uvIndex)})
              </Text>
            </View>
          </View>
          
          <Text style={styles.locationText}>📍 {locationName}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.lightText,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.danger,
    marginVertical: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerInfo: {
    marginLeft: 12,
  },
  temperature: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  condition: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  feelsLike: {
    fontSize: 12,
    color: COLORS.lightText,
    marginBottom: 4,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.lightText,
    marginLeft: 6,
    flex: 1,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.lightText,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default WeatherWidget;