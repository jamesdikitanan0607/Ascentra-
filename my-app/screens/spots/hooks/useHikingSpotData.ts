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
          const fallbackRoutes = (localSpot.gpx_files || []).map((gpx: any, index: number) => {
            let routeCoordinates = null;
            let startCoordinates = null;
            let endCoordinates = null;

            // Lugsangan Peak coordinates (simplified from GPX)
            if (gpx.name.includes('Lugsangan Peak')) {
              startCoordinates = { latitude: 9.81116, longitude: 123.4611 };
              endCoordinates = { latitude: 9.8101, longitude: 123.4409 };
              routeCoordinates = [
                { latitude: 9.81116, longitude: 123.4611 },
                { latitude: 9.81193, longitude: 123.46032 },
                { latitude: 9.81199, longitude: 123.45987 },
                { latitude: 9.81153, longitude: 123.45865 },
                { latitude: 9.81223, longitude: 123.45596 },
                { latitude: 9.81162, longitude: 123.45539 },
                { latitude: 9.81110, longitude: 123.45399 },
                { latitude: 9.81197, longitude: 123.45193 },
                { latitude: 9.81155, longitude: 123.45053 },
                { latitude: 9.81145, longitude: 123.44896 },
                { latitude: 9.81178, longitude: 123.44824 },
                { latitude: 9.81236, longitude: 123.44710 },
                { latitude: 9.81216, longitude: 123.44606 },
                { latitude: 9.81158, longitude: 123.44496 },
                { latitude: 9.81189, longitude: 123.44428 },
                { latitude: 9.81297, longitude: 123.44312 },
                { latitude: 9.81331, longitude: 123.44273 },
                { latitude: 9.81213, longitude: 123.44193 },
                { latitude: 9.81089, longitude: 123.44127 },
                { latitude: 9.81010, longitude: 123.44090 }
              ];
            }
            // Mount Labalasan coordinates (simplified from GPX)
            else if (gpx.name.includes('Mount Labalasan')) {
              startCoordinates = { latitude: 9.79578, longitude: 123.4088 };
              endCoordinates = { latitude: 9.81304, longitude: 123.44249 };
              routeCoordinates = [
                { latitude: 9.79578, longitude: 123.4088 },
                { latitude: 9.79609, longitude: 123.4091 },
                { latitude: 9.79554, longitude: 123.41081 },
                { latitude: 9.79524, longitude: 123.41155 },
                { latitude: 9.79449, longitude: 123.4126 },
                { latitude: 9.79335, longitude: 123.413 },
                { latitude: 9.79216, longitude: 123.41379 },
                { latitude: 9.79203, longitude: 123.41607 },
                { latitude: 9.79221, longitude: 123.41705 },
                { latitude: 9.79249, longitude: 123.41853 },
                { latitude: 9.79306, longitude: 123.42002 },
                { latitude: 9.79180, longitude: 123.42258 },
                { latitude: 9.79159, longitude: 123.42451 },
                { latitude: 9.79229, longitude: 123.42555 },
                { latitude: 9.79343, longitude: 123.42674 },
                { latitude: 9.79407, longitude: 123.4281 },
                { latitude: 9.79494, longitude: 123.43004 },
                { latitude: 9.79562, longitude: 123.43129 },
                { latitude: 9.79670, longitude: 123.43293 },
                { latitude: 9.79771, longitude: 123.43363 },
                { latitude: 9.79927, longitude: 123.43441 },
                { latitude: 9.80089, longitude: 123.43526 },
                { latitude: 9.80190, longitude: 123.43626 },
                { latitude: 9.80345, longitude: 123.43696 },
                { latitude: 9.80527, longitude: 123.43744 },
                { latitude: 9.80685, longitude: 123.43899 },
                { latitude: 9.80879, longitude: 123.43949 },
                { latitude: 9.81041, longitude: 123.44109 },
                { latitude: 9.81230, longitude: 123.44387 },
                { latitude: 9.81304, longitude: 123.44249 }
              ];
            }

            return {
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
              start_coordinates: startCoordinates,
              end_coordinates: endCoordinates,
              coordinates: routeCoordinates || [],
              waypoints: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              hiking_spot_id: '84',
              name: gpx.name,
              description: 'Route data loaded from local file',
              length: localSpot.trail_length,
              estimated_time: 120,
              trail_type: 'trail',
              gpx_data: routeCoordinates ? {
                type: 'LineString',
                coordinates: routeCoordinates.map(c => [c.longitude, c.latitude])
              } : null,
              is_active: true,
              route_coordinates: routeCoordinates,
              geojson_path: routeCoordinates ? {
                type: 'LineString',
                coordinates: routeCoordinates.map(c => [c.longitude, c.latitude])
              } : null
            };
          });

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
