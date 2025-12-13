import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { fetchHikingSpotById, getTrailRoutesBySpotId } from '../../../services/supabaseService';
import { HikingSpot } from '../../../types/database';
import { TrailRouteDetails } from '../../../services/supabaseService';
import { normalizeTrailRoute } from '../../../contexts/TrailContext';

export const useHikingSpotData = (hikingSpotId: string) => {
  const [hikingSpot, setHikingSpot] = useState<HikingSpot | null>(null);
  const [trailRoutes, setTrailRoutes] = useState<TrailRouteDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHikingSpotData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!hikingSpotId) {
        throw new Error('Hiking spot ID is required');
      }

      // Fetch hiking spot details
      const spotData = await fetchHikingSpotById(hikingSpotId);
      const spot = spotData?.data as unknown as HikingSpot | null;

      if (!spot) {
        throw new Error('Hiking spot not found');
      }

      setHikingSpot(spot);

      // Fetch trail routes for this spot
      const routesResponse = await getTrailRoutesBySpotId(hikingSpotId);
      const routes = routesResponse?.data || [];

      if (routesResponse?.error) {
        console.error('Error fetching trail routes:', routesResponse.error);
      }

      // Convert to TrailRoute format and update context with null checks
      const validRoutes = Array.isArray(routes) ? routes : [];
      console.log('Fetched trail routes:', validRoutes);
      setTrailRoutes(validRoutes);

      // Transform database routes to match the TrailRoute interface
      const normalizedTrails = validRoutes
        .filter(route => route && route.route_id)
        .map(route => {
          console.log('Processing route:', route);
          return {
            id: route.route_id.toString(),
            route_id: route.route_id.toString(),
            route_name: route.route_name || 'Unnamed Route',
            difficulty: route.difficulty || route.difficulty_level || 'Moderate',
            distance: route.distance || route.distance_km || 0,
            elevation_gain: route.elevation_gain || route.elevation_gain_m || 0,
            estimated_duration: route.estimated_duration || (route.estimated_duration_minutes || (route.estimated_duration_hr || 0) * 60),
            route_description: route.route_description || route.highlights || '',
            highlights: route.highlights || '',
            route_color: route.route_color || '#388E3C',
            start_coordinates: route.start_coordinates || null,
            end_coordinates: route.end_coordinates || null,
            coordinates: Array.isArray(route.coordinates) ? route.coordinates : [],
            waypoints: route.waypoints || '',
            created_at: route.created_at || new Date().toISOString(),
            updated_at: route.updated_at || new Date().toISOString(),
            hiking_spot_id: route.hiking_spot_id || hikingSpotId,
            // Add any additional fields that might be needed by the UI
            name: route.route_name || 'Unnamed Route', // For backward compatibility
            description: route.route_description || route.highlights || '', // For backward compatibility
            length: route.distance || route.distance_km || 0, // For backward compatibility
            estimated_time: route.estimated_duration || (route.estimated_duration_minutes || (route.estimated_duration_hr || 0) * 60), // For backward compatibility
            trail_type: 'trail', // For backward compatibility
            gpx_data: null, // For backward compatibility
            is_active: true, // For backward compatibility
            route_coordinates: route.coordinates || null, // For backward compatibility
            geojson_path: route.geojson_path || null // For backward compatibility
          };
        });

      console.log('Normalized trail routes:', normalizedTrails);

      return { spot, routes: normalizedTrails };
    } catch (err) {
      if (hikingSpotId === '84') {
        // Fallback for Lugsangan Peak which might be missing in remote DB
        console.log('Falling back to local data for Lugsangan Peak (ID 84)');
        const { HIKING_SPOTS_DATA } = require('../../../data/hikingSpotData');
        const localSpot = HIKING_SPOTS_DATA.find((s: any) => s.id === '81'); // Map 84 -> 81 (Lugsangan)

        if (localSpot) {
          const fallbackSpot: HikingSpot = {
            id: '84', // Keep the requested ID
            name: localSpot.name,
            description: localSpot.description,
            difficulty: localSpot.difficulty,
            average_rating: localSpot.rating,
            number_of_reviews: localSpot.review_count,
            location_text: `Lat: ${localSpot.latitude}, Long: ${localSpot.longitude}`,
            coordinates: { type: 'Point', coordinates: [localSpot.longitude, localSpot.latitude] },
            cover_image_url: localSpot.image_url,
            images: localSpot.imageSource ? [localSpot.imageSource] : [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // Generate mocks for routes from GPX files if available
          const fallbackRoutes = (localSpot.gpx_files || []).map((gpx: any, index: number) => ({
            id: `fallback-${index}`,
            route_id: `fallback-${index}`,
            route_name: gpx.name,
            difficulty: localSpot.difficulty,
            distance: localSpot.trail_length,
            elevation_gain: localSpot.elevation,
            estimated_duration: 120, // Default 2 hours
            route_description: 'Route data loaded from local file',
            highlights: (localSpot.highlights || []).join(', '),
            route_color: '#388E3C',
            start_coordinates: null,
            end_coordinates: null,
            coordinates: [],
            waypoints: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            hiking_spot_id: '84',
            name: gpx.name,
            description: 'Route data loaded from local file',
            length: localSpot.trail_length,
            estimated_time: 120,
            trail_type: 'trail',
            gpx_data: null,
            is_active: true,
            route_coordinates: null,
            geojson_path: null
          }));

          setHikingSpot(fallbackSpot);
          setTrailRoutes(fallbackRoutes);
          setLoading(false);
          return { spot: fallbackSpot, routes: fallbackRoutes };
        }
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to load hiking spot data';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      if (hikingSpotId !== '84' || error) {
        setLoading(false);
      }
    }
  }, [hikingSpotId]);

  // Auto-fetch when hikingSpotId changes
  useEffect(() => {
    fetchHikingSpotData();
  }, [fetchHikingSpotData]);

  return {
    hikingSpot,
    trailRoutes,
    loading,
    error,
    fetchHikingSpotData,
    setHikingSpot,
    setTrailRoutes
  };
};
