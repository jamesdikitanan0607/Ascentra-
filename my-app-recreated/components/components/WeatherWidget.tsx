import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getWeatherData } from '../services/supabaseService';
import ErrorHandlingService from '../services/ErrorHandlingService';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  description?: string;
}

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
  locationName?: string;
  style?: any;
  compact?: boolean;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  latitude,
  longitude,
  locationName = 'Location',
  style,
  compact = false,
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  const fetchWeatherData = useCallback(async (isRetry = false) => {
    // Validate coordinates
    if (!latitude || !longitude || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      setError('Invalid coordinates provided');
      setLoading(false);
      return;
    }

    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
      }

      const weather = await getWeatherData(latitude, longitude);
      
      if (!weather) {
        throw new Error('No weather data received');
      }

      // Validate weather data structure
      if (typeof weather.temperature !== 'number' || !weather.condition) {
        throw new Error('Invalid weather data format');
      }

      setWeatherData(weather);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      ErrorHandlingService.logError(err, 'weather', { latitude, longitude, locationName });
      
      const errorInfo = ErrorHandlingService.analyzeError(err, 'weather');
      
      // Implement retry logic for retryable errors
      if (retryCount < MAX_RETRY_ATTEMPTS && errorInfo.retryable) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchWeatherData(true);
        }, RETRY_DELAY * retryCount);
        return;
      }

      const contextualMessage = ErrorHandlingService.getContextualErrorMessage(err, 'weather');
      setError(contextualMessage);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, retryCount]);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  const handleRetry = () => {
    setRetryCount(0);
    fetchWeatherData();
  };

  const getWeatherIcon = (condition: string, iconName?: string): keyof typeof Ionicons.glyphMap => {
    if (iconName && iconName in Ionicons.glyphMap) {
      return iconName as keyof typeof Ionicons.glyphMap;
    }

    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return 'sunny';
    } else if (conditionLower.includes('cloud')) {
      return 'cloudy';
    } else if (conditionLower.includes('rain')) {
      return 'rainy';
    } else if (conditionLower.includes('storm')) {
      return 'thunderstorm';
    } else if (conditionLower.includes('snow')) {
      return 'snow';
    } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
      return 'cloudy';
    }
    
    return 'partly-sunny';
  };

  const renderLoadingState = () => (
    <View style={[styles.container, styles.loadingContainer, style]}>
      <ActivityIndicator size="small" color="#2E7D32" />
      <Text style={styles.loadingText}>
        {retryCount > 0 ? `Retrying... (${retryCount}/${MAX_RETRY_ATTEMPTS})` : 'Loading weather...'}
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={[styles.container, styles.errorContainer, style]}>
      <View style={styles.errorContent}>
        <Ionicons name="warning-outline" size={24} color="#F44336" />
        <Text style={styles.errorTitle}>Weather Unavailable</Text>
        <Text style={styles.errorMessage}>
          {error === 'Invalid coordinates provided' 
            ? 'Location data not available for this hiking spot' 
            : error?.includes('network') || error?.includes('fetch')
            ? 'Network connection issue - check your internet'
            : 'Unable to load current weather data'}
        </Text>
        <Text style={styles.errorSubtext}>
          {error === 'Invalid coordinates provided' 
            ? 'You can still plan your hike using general weather forecasts for the area.'
            : 'Weather data helps plan safer hikes. Try refreshing or check local forecasts.'}
        </Text>
        {error !== 'Invalid coordinates provided' && (
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Ionicons name="refresh" size={16} color="#2E7D32" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderWeatherContent = () => {
    if (!weatherData) return null;

    const iconName = getWeatherIcon(weatherData.condition, weatherData.icon);

    if (compact) {
      return (
        <View style={[styles.container, styles.compactContainer, style]}>
          <View style={styles.compactHeader}>
            <Ionicons name={iconName} size={20} color="#2E7D32" />
            <Text style={styles.compactTemperature}>{Math.round(weatherData.temperature)}°C</Text>
          </View>
          <Text style={styles.compactCondition} numberOfLines={1}>
            {weatherData.condition}
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <Ionicons name={iconName} size={32} color="#2E7D32" />
          <View style={styles.temperatureContainer}>
            <Text style={styles.temperature}>{Math.round(weatherData.temperature)}°C</Text>
            <Text style={styles.location} numberOfLines={1}>{locationName}</Text>
          </View>
        </View>
        
        <Text style={styles.condition}>{weatherData.condition}</Text>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="water-outline" size={16} color="#757575" />
            <Text style={styles.detailText}>Humidity: {weatherData.humidity}%</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="leaf-outline" size={16} color="#757575" />
            <Text style={styles.detailText}>Wind: {weatherData.windSpeed} km/h</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  return renderWeatherContent();
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  errorContainer: {
    minHeight: 80,
  },
  errorContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
    marginTop: 8,
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  retryButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  temperatureContainer: {
    marginLeft: 12,
    flex: 1,
  },
  temperature: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  location: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  condition: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 12,
    fontWeight: '500',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#757575',
  },
  compactContainer: {
    padding: 12,
    minHeight: 60,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  compactTemperature: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 8,
  },
  compactCondition: {
    fontSize: 12,
    color: '#757575',
  },
});

export default WeatherWidget;