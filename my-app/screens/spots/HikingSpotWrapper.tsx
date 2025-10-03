import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import HikingSpotTemplate from './HikingSpotTemplate';
import { HIKING_SPOTS_DATA } from '../../data/hikingSpotData';
import ErrorBoundary from '../../components/ErrorBoundary';

interface HikingSpotWrapperProps {
  navigation: any;
  route: {
    params: {
      hiking_spot_id: string;
    };
  };
}

interface HikingSpotData {
  id: string;
  hiking_spot_id?: string;
  name: string;
  description?: string;
  difficulty: string;
  elevation: number;
  trail_length: number;
  estimated_duration: string;
  latitude: number;
  longitude: number;
  rating: number;
  review_count: number;
  image_url?: string;
  amenities: string[];
  best_season: string[];
  highlights: string[];
  tips: string[];
  imageSource?: any;
  location?: string;
}

const COLORS = {
  primary: '#2E7D32',
  text: '#1F2933',
  background: '#FAFAF7',
  error: '#F44336',
};

export default function HikingSpotWrapper({ navigation, route }: HikingSpotWrapperProps) {
  const [spotData, setSpotData] = useState<HikingSpotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { hiking_spot_id } = route.params;

  useEffect(() => {
    loadSpotData();
  }, [hiking_spot_id]);

  const loadSpotData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('HikingSpotWrapper: Loading data for hiking_spot_id:', hiking_spot_id);

      // Find the hiking spot data from local data
      const spot = HIKING_SPOTS_DATA.find(s => s.id === hiking_spot_id);
      
      if (!spot) {
        throw new Error(`Hiking spot with ID ${hiking_spot_id} not found`);
      }

      console.log('HikingSpotWrapper: Found spot data:', spot.name);

      // Transform the data to match HikingSpotTemplate expectations
      const transformedSpotData: HikingSpotData = {
        id: spot.id,
        hiking_spot_id: hiking_spot_id,
        name: spot.name,
        description: spot.description,
        difficulty: spot.difficulty,
        elevation: spot.elevation,
        trail_length: spot.trail_length,
        estimated_duration: spot.estimated_duration,
        latitude: spot.latitude,
        longitude: spot.longitude,
        rating: spot.rating,
        review_count: spot.review_count,
        image_url: spot.image_url,
        amenities: spot.amenities || [],
        best_season: spot.best_season || [],
        highlights: spot.highlights || [],
        tips: spot.tips || [],
        imageSource: spot.imageSource,
        location: spot.location,
      };

      setSpotData(transformedSpotData);
    } catch (err) {
      console.error('HikingSpotWrapper: Error loading spot data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load hiking spot data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading hiking spot...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorHint}>
          Hiking Spot ID: {hiking_spot_id}
        </Text>
      </View>
    );
  }

  if (!spotData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Not Found</Text>
        <Text style={styles.errorText}>
          Hiking spot with ID {hiking_spot_id} was not found.
        </Text>
      </View>
    );
  }

  return (
    <ErrorBoundary 
      navigation={navigation}
      screenName={`HikingSpot-${spotData.name}`}
      onError={(error, errorInfo) => {
        console.error(`Error in ${spotData.name} hiking spot:`, error);
        console.error('Error info:', errorInfo);
      }}
    >
      <HikingSpotTemplate 
        navigation={navigation} 
        spotData={spotData} 
      />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.7,
    textAlign: 'center',
  },
});