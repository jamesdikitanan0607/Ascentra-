import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, Alert } from 'react-native';
import { getHikingSpotById, getTrailRoutesBySpotId, TrailRouteDetails } from '../../services/supabaseService';
import { HikingSpot } from '../../types/database';
import { getSpotById } from '../../data/hikingSpotData';
import HikingSpotTemplate from './HikingSpotTemplate';

interface HikingSpotWrapperProps {
  navigation: any;
  route: {
    params: {
      spotId: string;
    };
  };
}

const COLORS = {
  primary: '#388E3C',
  background: '#FFFFFF',
};

export default function HikingSpotWrapper({ navigation, route }: HikingSpotWrapperProps) {
  const { spotId } = route.params;
  const [hikingSpot, setHikingSpot] = useState<HikingSpot | null>(null);
  const [trailRoutes, setTrailRoutes] = useState<TrailRouteDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHikingSpotData();
  }, [spotId]);

  async function fetchHikingSpotData() {
    try {
      // Try to fetch from Supabase first
      const [spotData, routesData] = await Promise.all([
        getHikingSpotById(spotId),
        getTrailRoutesBySpotId(spotId)
      ]);
      
      if (spotData) {
        setHikingSpot(spotData);
        setTrailRoutes(routesData || []);
      } else {
        // Fallback to local data
        const localSpotData = getSpotById(spotId);
        if (localSpotData) {
          // Convert local data to HikingSpot format
          const convertedSpot: HikingSpot = {
            hiking_spot_id: parseInt(spotId),
            name: localSpotData.name,
            description: localSpotData.description,
            coordinates: {
              coordinates: [localSpotData.longitude, localSpotData.latitude]
            },
            average_rating: localSpotData.rating,
            number_of_reviews: localSpotData.review_count,
            cover_image_url: localSpotData.image_url
          };
          setHikingSpot(convertedSpot);
          setTrailRoutes([]); // No trail routes in local data
        }
      }
    } catch (error) {
      console.error('Error fetching hiking spot data:', error);
      // Fallback to local data on error
      const localSpotData = getSpotById(spotId);
      if (localSpotData) {
        const convertedSpot: HikingSpot = {
          hiking_spot_id: parseInt(spotId),
          name: localSpotData.name,
          description: localSpotData.description,
          coordinates: {
            coordinates: [localSpotData.longitude, localSpotData.latitude]
          },
          average_rating: localSpotData.rating,
          number_of_reviews: localSpotData.review_count,
          cover_image_url: localSpotData.image_url
        };
        setHikingSpot(convertedSpot);
        setTrailRoutes([]);
      } else {
        Alert.alert('Error', 'Failed to load hiking spot details');
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!hikingSpot) {
    return null;
  }

  // Convert HikingSpot to HikingSpotData format expected by template
  // Use trail route data to populate missing properties, or fallback to local data
  const localSpotData = getSpotById(spotId);
  const primaryRoute = trailRoutes.length > 0 ? trailRoutes[0] : null;
  
  const spotData = {
    id: hikingSpot.hiking_spot_id?.toString() || spotId,
    name: hikingSpot.name,
    description: hikingSpot.description,
    difficulty: primaryRoute?.difficulty || localSpotData?.difficulty || 'Moderate',
    elevation: primaryRoute?.elevation_gain_m || localSpotData?.elevation || 0,
    trail_length: primaryRoute?.distance_km || localSpotData?.trail_length || 0,
    estimated_duration: primaryRoute ? `${primaryRoute.estimated_duration_hr} hours` : localSpotData?.estimated_duration || '2-3 hours',
    latitude: hikingSpot.coordinates?.coordinates?.[1] || localSpotData?.latitude || 0,
    longitude: hikingSpot.coordinates?.coordinates?.[0] || localSpotData?.longitude || 0,
    rating: hikingSpot.average_rating || localSpotData?.rating || 0,
    review_count: hikingSpot.number_of_reviews || localSpotData?.review_count || 0,
    image_url: hikingSpot.cover_image_url || localSpotData?.image_url || '',
    amenities: localSpotData?.amenities || ['Parking', 'Trail markers'],
    best_season: localSpotData?.best_season || ['Dry season (November - April)'],
    highlights: primaryRoute?.highlights ? [primaryRoute.highlights] : localSpotData?.highlights || [],
    tips: localSpotData?.tips || ['Bring plenty of water', 'Wear proper hiking shoes', 'Start early to avoid heat'],
    imageSource: localSpotData?.imageSource || (hikingSpot.cover_image_url ? { uri: hikingSpot.cover_image_url } : null),
   };

  return (
    <HikingSpotTemplate 
      navigation={navigation} 
      spotData={spotData} 
    />
  );
}