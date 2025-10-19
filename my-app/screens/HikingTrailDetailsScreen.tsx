import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getTrailRoutesBySpotId } from '../services/supabaseService';
import LeafletTrailMapDebug from '../components/LeafletTrailMapDebug';
import TrailRouteCarousel from '../components/TrailRouteCarousel';
import TrailInformationPanel from '../components/TrailInformationPanel';

interface HikingSpot {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  description: string;
}

interface TrailRoute {
  id: string;
  route_name: string;
  difficulty: string;
  distance_km: number;
  elevation_gain_m: number;
  estimated_duration_min: number;
  route_features?: string;
  route_description?: string;
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  waypoints: Array<{ lat: number; lng: number }>;
  geojson_path?: {
    type: 'LineString';
    coordinates: number[][];
  };
}

interface HikingTrailDetailsScreenProps {
  route: {
    params: {
      hikingSpot: HikingSpot;
    };
  };
  navigation?: any;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  'Easy': '#2ecc71',
  'Moderate': '#f39c12',
  'Hard': '#e74c3c',
  'Expert': '#8e44ad',
};

const HikingTrailDetailsScreen: React.FC<HikingTrailDetailsScreenProps> = ({ route, navigation }) => {
  const { hikingSpot } = route.params;
  const [selectedTrailId, setSelectedTrailId] = useState<string | null>(null);
  const [trailRoutes, setTrailRoutes] = useState<TrailRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch trail routes
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setIsLoading(true);
        console.log('[TRAIL_DETAILS] Fetching routes for hiking spot:', hikingSpot.id, hikingSpot.name);
        
        const { data: routes, error } = await getTrailRoutesBySpotId(hikingSpot.id);
        
        console.log('[TRAIL_DETAILS] Received routes data:', routes);
        console.log('[TRAIL_DETAILS] Received error:', error);
        
        if (error) {
          console.error('[TRAIL_DETAILS] Error fetching routes:', error);
          // Don't return early, let it fall through to use empty array
        }

        const processedRoutes = Array.isArray(routes) ? routes.map((route: any) => ({
          ...route,
          id: route.route_id || route.id,
          waypoints: typeof route.waypoints === 'string' 
            ? JSON.parse(route.waypoints) 
            : route.waypoints || [],
        })) : [];

        console.log('[TRAIL_DETAILS] Processed routes with geometry:');
        processedRoutes.forEach((route, index) => {
          console.log(`[TRAIL_DETAILS] Route ${index + 1}: ${route.route_name}`);
          console.log(`[TRAIL_DETAILS] - Has geojson_path: ${!!route.geojson_path}`);
          console.log(`[TRAIL_DETAILS] - Coordinates count: ${route.geojson_path?.coordinates?.length || 0}`);
          console.log(`[TRAIL_DETAILS] - Waypoints count: ${route.waypoints?.length || 0}`);
        });

        console.log('[TRAIL_DETAILS] Processed routes:', processedRoutes);
        console.log('[TRAIL_DETAILS] Number of routes:', processedRoutes.length);

        setTrailRoutes(processedRoutes);
        if (processedRoutes.length > 0) {
          setSelectedTrailId(processedRoutes[0].id);
          console.log('[TRAIL_DETAILS] Selected first route:', processedRoutes[0].route_name);
        } else {
          console.log('[TRAIL_DETAILS] No routes available for this hiking spot');
        }
      } catch (err) {
        console.error('[TRAIL_DETAILS] Error processing routes:', err);
        setTrailRoutes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();
  }, [hikingSpot.id]);

  const selectedTrail = trailRoutes.find(trail => trail.id === selectedTrailId);

  const handleTrailSelect = (trailId: string) => {
    setSelectedTrailId(trailId);
  };


  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <MaterialIcons
          key={i}
          name={i <= rating ? 'star' : 'star-border'}
          size={16}
          color="#FFD700"
        />
      );
    }
    return stars;
  };

  const handleShareRoute = () => {
    // Implement share functionality
    console.log('Share route:', selectedTrail?.route_name);
  };

  const handleSaveRoute = () => {
    // Implement save functionality
    console.log('Save route:', selectedTrail?.route_name);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Loading trail details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>{hikingSpot.name}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(hikingSpot.rating)}
            </View>
            <Text style={styles.ratingText}>
              {hikingSpot.rating} ({hikingSpot.reviews} reviews)
            </Text>
          </View>
          
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={16} color="#fff" />
            <Text style={styles.locationText}>{hikingSpot.location}</Text>
          </View>
          
          <TouchableOpacity style={styles.favoriteButton}>
            <MaterialIcons name="favorite-border" size={20} color="#fff" />
            <Text style={styles.favoriteButtonText}>Add to Favorites</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{hikingSpot.description}</Text>
        </View>

        {/* Trail Map */}
        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>Trail Map</Text>
          <View style={styles.mapContainer}>
            <LeafletTrailMapDebug
              selectedHikingSpotId={hikingSpot.id}
              selectedTrailId={selectedTrailId || undefined}
              onTrailSelect={handleTrailSelect}
              showFullscreenButton={true}
            />
          </View>
        </View>

        {/* Trail Routes Carousel */}
        <TrailRouteCarousel
          routes={trailRoutes}
          selectedRouteId={selectedTrailId}
          onRouteSelect={handleTrailSelect}
        />

        {/* Debug Information */}
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>Debug Information</Text>
          <Text style={styles.debugText}>
            Hiking Spot ID: {hikingSpot.id}
          </Text>
          <Text style={styles.debugText}>
            Routes loaded: {trailRoutes.length}
          </Text>
          <Text style={styles.debugText}>
            Selected route: {selectedTrail?.route_name || 'none'}
          </Text>
          <Text style={styles.debugText}>
            Has geometry: {selectedTrail?.geojson_path ? 'yes' : 'no'}
          </Text>
          <Text style={styles.debugText}>
            Coordinates: {selectedTrail?.geojson_path?.coordinates?.length || 0}
          </Text>
          <Text style={styles.debugText}>
            Waypoints: {selectedTrail?.waypoints?.length || 0}
          </Text>
          <Text style={styles.debugText}>
            Loading: {isLoading ? 'yes' : 'no'}
          </Text>
        </View>

        {/* Trail Information */}
        <TrailInformationPanel
          selectedRoute={selectedTrail || null}
          onShareRoute={handleShareRoute}
          onSaveRoute={handleSaveRoute}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  headerSection: {
    backgroundColor: '#666',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    color: '#fff',
    fontSize: 14,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
  favoriteButton: {
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'stretch',
  },
  favoriteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  descriptionSection: {
    backgroundColor: '#fff',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  mapSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
  },
  debugSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});

export default HikingTrailDetailsScreen;
