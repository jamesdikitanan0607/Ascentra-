import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableOpacity, Modal, Text, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { getTrailRoutesBySpotId, TrailRouteDetails } from '../services/supabaseService';
import { HIKING_SPOTS_DATA } from '../data/hikingSpotData';
import { NEW_TRAIL_ROUTES } from '../data/trailRoutesData';

interface LeafletTrailMapProps {
  selectedHikingSpotId?: string;
  selectedTrailId?: string;
  onTrailSelect?: (trailId: string) => void;
  style?: any;
  showFullscreenButton?: boolean;
  navigation?: any;
}

interface TrailRoute {
  id: string;
  hiking_spot_id: string;
  route_name: string;
  difficulty: string;
  start_coordinates: { latitude: number; longitude: number };
  end_coordinates: { latitude: number; longitude: number };
  distance_km: number;
  elevation_gain_m: number;
  estimated_duration_hr: number;
  highlights: string;
  route_color: string;
  geojson_path: {
    type: string;
    coordinates: number[][];
  };
}

const LeafletTrailMap: React.FC<LeafletTrailMapProps> = ({
  selectedHikingSpotId,
  selectedTrailId,
  onTrailSelect,
  style,
  showFullscreenButton = false,
  navigation
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentSpotId, setCurrentSpotId] = useState<string | undefined>(selectedHikingSpotId);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [databaseRoutes, setDatabaseRoutes] = useState<TrailRoute[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Normalize coordinates to ensure consistent format
  const normalizeCoordinate = (coord: any): { latitude: number; longitude: number } => {
    if (typeof coord === 'object' && coord !== null) {
      if ('latitude' in coord && 'longitude' in coord) {
        return {
          latitude: parseFloat(coord.latitude.toString()),
          longitude: parseFloat(coord.longitude.toString())
        };
      }
      if ('lat' in coord && 'lng' in coord) {
        return {
          latitude: parseFloat(coord.lat.toString()),
          longitude: parseFloat(coord.lng.toString())
        };
      }
    }
    return { latitude: 0, longitude: 0 };
  };

  // Get difficulty color for badges
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '#4CAF50';
      case 'easy-moderate':
        return '#81C784';
      case 'moderate':
        return '#FF9800';
      case 'hard':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  // Generate realistic trail coordinates with proper interpolation
  const generateRealisticTrailPath = (route: TrailRoute): [number, number][] => {
    // Safely validate and extract coordinates
    if (!route || !route.geojson_path || !Array.isArray(route.geojson_path.coordinates)) {
      console.warn('Invalid route coordinates for route:', route?.route_name || 'Unknown');
      return [];
    }
    
    const originalCoords = route.geojson_path.coordinates;
    if (originalCoords.length < 2) return originalCoords as [number, number][];

    const enhancedCoords: [number, number][] = [];
    
    for (let i = 0; i < originalCoords.length - 1; i++) {
      const start = originalCoords[i];
      const end = originalCoords[i + 1];
      
      // Add the start point
      enhancedCoords.push([start[0], start[1]]);
      
      // Calculate distance between points
      const latDiff = end[1] - start[1];
      const lngDiff = end[0] - start[0];
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
      
      // Determine number of interpolated points based on distance
      const numPoints = Math.max(3, Math.floor(distance * 10000)); // More points for longer segments
      
      // Generate interpolated points with natural variations
      for (let j = 1; j < numPoints; j++) {
        const ratio = j / numPoints;
        
        // Basic linear interpolation
        const baseLat = start[1] + (latDiff * ratio);
        const baseLng = start[0] + (lngDiff * ratio);
        
        // Add natural trail variations (small random offsets)
        const variation = 0.0001; // Small variation for realistic trail meandering
        const latVariation = (Math.random() - 0.5) * variation * Math.sin(ratio * Math.PI * 4);
        const lngVariation = (Math.random() - 0.5) * variation * Math.cos(ratio * Math.PI * 3);
        
        // Apply elevation-based curvature (trails follow contours)
        const elevationFactor = Math.sin(ratio * Math.PI) * 0.00005;
        
        enhancedCoords.push([
          baseLng + lngVariation + elevationFactor,
          baseLat + latVariation + elevationFactor
        ]);
      }
    }
    
    // Add the final point
    const lastCoord = originalCoords[originalCoords.length - 1];
    enhancedCoords.push([lastCoord[0], lastCoord[1]]);
    
    return enhancedCoords;
  };

  // Build prepared routes for the map
  const buildPreparedRoutes = (): TrailRoute[] => {
    // Use database routes if available, otherwise fall back to static data
    const routesToUse = databaseRoutes.length > 0 ? databaseRoutes : NEW_TRAIL_ROUTES;
    
    return routesToUse.map(route => {
      // If route already has geojson_path with coordinates, use it; otherwise generate enhanced path
      let pathCoordinates;
      if (route.geojson_path?.coordinates && route.geojson_path.coordinates.length > 0) {
        pathCoordinates = route.geojson_path.coordinates;
      } else {
        pathCoordinates = generateRealisticTrailPath(route);
      }
      
      return {
        id: route.id,
        hiking_spot_id: route.hiking_spot_id,
        route_name: route.route_name,
        difficulty: route.difficulty,
        start_coordinates: normalizeCoordinate(route.start_coordinates),
        end_coordinates: normalizeCoordinate(route.end_coordinates),
        distance_km: route.distance_km,
        elevation_gain_m: route.elevation_gain_m,
        estimated_duration_hr: route.estimated_duration_hr,
        highlights: route.highlights,
        route_color: route.route_color || '#FF0000',
        geojson_path: {
          type: 'LineString',
          coordinates: pathCoordinates
        }
      };
    });
  };

  // Select trail on map
  const selectTrailOnMap = (trailId: string) => {
    if (webViewRef.current && isMapReady) {
      const message = JSON.stringify({
        type: 'selectTrail',
        trailId: trailId
      });
      webViewRef.current.postMessage(message);
    }
  };

  // Handle messages from WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'mapReady':
          setIsMapReady(true);
          break;
        case 'trailSelected':
          if (onTrailSelect && typeof onTrailSelect === 'function') {
            onTrailSelect(data.trailId);
          }
          break;
        case 'error':
          console.error('Map error:', data.message);
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Load trail routes from database when hiking spot changes
  useEffect(() => {
    if (selectedHikingSpotId) {
      loadTrailRoutesFromDatabase(selectedHikingSpotId);
    }
  }, [selectedHikingSpotId]);

  // Update map when hiking spot changes
  useEffect(() => {
    if (selectedHikingSpotId !== currentSpotId) {
      setCurrentSpotId(selectedHikingSpotId);
      
      if (webViewRef.current && isMapReady && selectedHikingSpotId) {
        const spot = HIKING_SPOTS_DATA.find(s => s.id === selectedHikingSpotId);
        if (spot) {
          const message = JSON.stringify({
            type: 'focusOnSpot',
            spotId: selectedHikingSpotId,
            coordinates: normalizeCoordinate({ latitude: spot.latitude, longitude: spot.longitude })
          });
          webViewRef.current.postMessage(message);
        }
      }
    }
  }, [selectedHikingSpotId, currentSpotId, isMapReady]);

  // Load trail routes from database with enhanced error handling
  const loadTrailRoutesFromDatabase = async (spotId: string) => {
    setIsLoadingRoutes(true);
    setRouteError(null);
    
    try {
      const routesResponse = await getTrailRoutesBySpotId(spotId);
      const routes = routesResponse?.data || [];
      
      if (routesResponse?.error) {
        console.error('Error fetching trail routes:', routesResponse.error);
        setRouteError('Failed to load trail routes from database');
        // Fall back to static data
        setDatabaseRoutes([]);
        return;
      }
      
      // Transform database routes to component format with safe defaults
      const transformedRoutes = Array.isArray(routes) ? routes.map((route: TrailRouteDetails) => ({
        id: route.route_id?.toString() || '',
        hiking_spot_id: route.hiking_spot_id?.toString() || spotId,
        route_name: route.route_name || 'Unnamed Route',
        difficulty: route.difficulty_level || route.difficulty || 'Moderate',
        start_coordinates: route.start_coordinates || { latitude: 0, longitude: 0 },
        end_coordinates: route.end_coordinates || { latitude: 0, longitude: 0 },
        distance_km: route.distance_km || 0,
        elevation_gain_m: route.elevation_gain_m || 0,
        estimated_duration_hr: route.estimated_duration_hr || 0,
        highlights: route.highlights || '',
        route_color: route.route_color || '#FF6B6B',
        geojson_path: route.geojson_path || {
          type: 'LineString',
          coordinates: []
        }
      })) : [];
      
      setDatabaseRoutes(transformedRoutes);
    } catch (error) {
      console.error('Error loading trail routes:', error);
      setRouteError('Failed to load trail routes');
      setDatabaseRoutes([]);
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  // Select trail when selectedTrailId changes
  useEffect(() => {
    if (selectedTrailId && isMapReady) {
      selectTrailOnMap(selectedTrailId);
    }
  }, [selectedTrailId, isMapReady]);

  // Generate HTML for the Leaflet map with error handling
  const generateMapHTML = () => {
    try {
      const preparedRoutes = buildPreparedRoutes();
      const hikingSpots = HIKING_SPOTS_DATA;

      return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leaflet Trail Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #map {
            height: 100vh;
            width: 100vw;
        }
        .trail-popup {
            font-size: 14px;
            line-height: 1.4;
        }
        .trail-popup h3 {
            margin: 0 0 8px 0;
            color: #333;
            font-size: 16px;
        }
        .trail-popup .difficulty {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .difficulty.Easy { background: #4CAF50; color: white; }
        .difficulty.Easy-Moderate { background: #81C784; color: white; }
        .difficulty.Moderate { background: #FF9800; color: white; }
        .difficulty.Hard { background: #F44336; color: white; }
        .difficulty.Very-Hard { background: #9C27B0; color: white; }
        .trail-info {
            margin: 4px 0;
        }
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        
        /* Enhanced popup styles for mobile */
        .leaflet-popup-content-wrapper {
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            border: none;
        }
        
        .leaflet-popup-content {
            margin: 16px 20px;
            line-height: 1.5;
            font-size: 14px;
        }
        
        .leaflet-popup-tip {
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .trail-popup-container .leaflet-popup-content-wrapper {
            background: linear-gradient(135deg, #ffffff, #f8f9fa);
        }
        
        .marker-popup-container .leaflet-popup-content-wrapper {
            background: linear-gradient(135deg, #ffffff, #f0f8ff);
        }
        
        /* Touch-friendly close button */
        .leaflet-popup-close-button {
            width: 32px !important;
            height: 32px !important;
            font-size: 18px !important;
            line-height: 30px !important;
            border-radius: 50%;
            background: rgba(0,0,0,0.1);
            color: #666 !important;
            text-decoration: none !important;
        }
        
        .leaflet-popup-close-button:hover {
            background: rgba(0,0,0,0.2);
            color: #333 !important;
        }
        
        .selected-trail-glow {
            filter: drop-shadow(0 0 8px rgba(255, 107, 53, 0.6));
        }
        
        @keyframes pulse {
            0% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.1);
                opacity: 0.8;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
    </style>
</head>
<body>
    <div id="loading" class="loading">Loading map...</div>
    <div id="map"></div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        // Trail routes data
        const trailRoutes = ${JSON.stringify(preparedRoutes)};
        const hikingSpots = ${JSON.stringify(hikingSpots)};
        
        // Initialize map with enhanced mobile-friendly options
        const map = L.map('map', {
            center: [10.3157, 123.8854],
            zoom: 10,
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            touchZoom: true,
            dragging: true,
            tap: true,
            tapTolerance: 15,
            zoomSnap: 0.5,
            zoomDelta: 0.5,
            wheelPxPerZoomLevel: 60,
            maxZoom: 18,
            minZoom: 8
        });
        
        // Position zoom controls for better mobile accessibility
        map.zoomControl.setPosition('topright');
        
        // Add OpenStreetMap tiles with better mobile performance
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            tileSize: 256,
            zoomOffset: 0,
            detectRetina: true
        }).addTo(map);
        
        // Store map elements
        const trailLayers = {};
        const spotMarkers = {};
        let selectedTrailId = null;
        
        // Create custom icons with enhanced mobile-friendly design
        const createCustomIcon = (color = '#FF0000', size = 'medium', type = 'default') => {
            const iconSize = size === 'large' ? [32, 48] : [26, 39];
            const iconAnchor = size === 'large' ? [16, 48] : [13, 39];
            
            let iconHtml = '';
            
            if (type === 'start') {
                iconHtml = \`<div style="
                    background: linear-gradient(135deg, #4CAF50, #2E7D32);
                    width: \${iconSize[0]}px;
                    height: \${iconSize[1]}px;
                    border-radius: 50% 50% 50% 0;
                    border: 4px solid white;
                    transform: rotate(-45deg);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                    position: relative;
                    z-index: 1000;
                ">
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) rotate(45deg);
                        color: white;
                        font-weight: bold;
                        font-size: 14px;
                        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                    ">S</div>
                </div>\`;
            } else if (type === 'end') {
                iconHtml = \`<div style="
                    background: linear-gradient(135deg, #F44336, #C62828);
                    width: \${iconSize[0]}px;
                    height: \${iconSize[1]}px;
                    border-radius: 50% 50% 50% 0;
                    border: 4px solid white;
                    transform: rotate(-45deg);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                    position: relative;
                    z-index: 1000;
                ">
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) rotate(45deg);
                        color: white;
                        font-weight: bold;
                        font-size: 14px;
                        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                    ">E</div>
                </div>\`;
            } else {
                iconHtml = \`<div style="
                    background: linear-gradient(135deg, \${color}, \${color}dd);
                    width: \${iconSize[0]}px;
                    height: \${iconSize[1]}px;
                    border-radius: 50% 50% 50% 0;
                    border: 3px solid white;
                    transform: rotate(-45deg);
                    box-shadow: 0 3px 8px rgba(0,0,0,0.4);
                "></div>\`;
            }
            
            return L.divIcon({
                className: 'custom-marker',
                html: iconHtml,
                iconSize: iconSize,
                iconAnchor: iconAnchor
            });
        };
        
        // Add hiking spot markers
        hikingSpots.forEach(spot => {
            const marker = L.marker([spot.coordinates.latitude, spot.coordinates.longitude], {
                icon: createCustomIcon('#2196F3', 'large')
            }).addTo(map);
            
            marker.bindPopup(\`
                <div class="trail-popup">
                    <h3>\${spot.name}</h3>
                    <div class="trail-info"><strong>Location:</strong> \${spot.location}</div>
                    <div class="trail-info"><strong>Elevation:</strong> \${spot.elevation_m}m</div>
                    <div class="trail-info"><strong>Trails:</strong> \${spot.trail_count} routes</div>
                    <div class="trail-info">\${spot.description}</div>
                </div>
            \`);
            
            spotMarkers[spot.id] = marker;
        });
        
        // Create trail layers but don't add them to map initially
        trailRoutes.forEach(route => {
            // Validate route has required coordinates
            if (!route.start_coordinates || !route.end_coordinates || 
                !route.geojson_path || !route.geojson_path.coordinates || 
                route.geojson_path.coordinates.length === 0) {
                console.warn('LeafletTrailMap: Route missing coordinates:', {
                    routeId: route.id,
                    routeName: route.route_name,
                    hasStart: !!route.start_coordinates,
                    hasEnd: !!route.end_coordinates,
                    hasPath: !!(route.geojson_path && route.geojson_path.coordinates && route.geojson_path.coordinates.length > 0)
                });
                return; // Skip this route
            }
            
            // Create polyline for trail path with enhanced styling (but don't add to map yet)
            const coordinates = route.geojson_path.coordinates.map(coord => [coord[1], coord[0]]);
            const polyline = L.polyline(coordinates, {
                color: route.route_color,
                weight: 6,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round'
            });
            
            // Create start marker with enhanced styling (but don't add to map yet)
            const startMarker = L.marker([route.start_coordinates.latitude, route.start_coordinates.longitude], {
                icon: createCustomIcon('#4CAF50', 'medium', 'start')
            });
            
            // Create end marker with enhanced styling (but don't add to map yet)
            const endMarker = L.marker([route.end_coordinates.latitude, route.end_coordinates.longitude], {
                icon: createCustomIcon('#F44336', 'medium', 'end')
            });
            
            // Create waypoint markers (small blue markers) along the trail (but don't add to map yet)
            const waypoints = [];
            const waypointInterval = Math.max(1, Math.floor(coordinates.length / 6)); // 4-6 waypoints per trail
            
            for (let i = waypointInterval; i < coordinates.length - waypointInterval; i += waypointInterval) {
                const waypointCoord = coordinates[i];
                const waypoint = L.circleMarker([waypointCoord[0], waypointCoord[1]], {
                    radius: 6,
                    fillColor: '#2196F3',
                    color: '#ffffff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9
                });
                
                waypoint.bindPopup(\`
                    <div class="trail-popup">
                        <h3 style="color: #2196F3; margin: 0 0 8px 0;">📍 Waypoint</h3>
                        <div class="trail-info"><strong>\${route.route_name}</strong></div>
                        <div class="trail-info">Trail marker point</div>
                    </div>
                \`, {
                    maxWidth: 180,
                    className: 'marker-popup-container'
                });
                
                waypoints.push(waypoint);
            }
            
            // Create popup content
            const popupContent = \`
                <div class="trail-popup">
                    <h3>\${route.route_name}</h3>
                    <div class="difficulty \${(route.difficulty || '').replace(/\\s+/g, '-')}">\${route.difficulty || 'Unknown'}</div>
                    <div class="trail-info"><strong>Distance:</strong> \${route.distance_km} km</div>
                    <div class="trail-info"><strong>Elevation Gain:</strong> \${route.elevation_gain_m}m</div>
                    <div class="trail-info"><strong>Duration:</strong> \${route.estimated_duration_hr} hours</div>
                    <div class="trail-info"><strong>Highlights:</strong> \${route.highlights}</div>
                </div>
            \`;
            
            // Bind enhanced popups with mobile-friendly design
            polyline.bindPopup(popupContent, {
                maxWidth: 280,
                className: 'trail-popup-container'
            });
            
            startMarker.bindPopup(\`
                <div class="trail-popup">
                    <h3 style="color: #4CAF50; margin: 0 0 8px 0;">🚀 Trail Start</h3>
                    <div class="trail-info"><strong>\${route.route_name}</strong></div>
                    <div class="trail-info">Tap trail line for more details</div>
                </div>
            \`, {
                maxWidth: 200,
                className: 'marker-popup-container'
            });
            
            endMarker.bindPopup(\`
                <div class="trail-popup">
                    <h3 style="color: #F44336; margin: 0 0 8px 0;">🏁 Trail End</h3>
                    <div class="trail-info"><strong>\${route.route_name}</strong></div>
                    <div class="trail-info">Tap trail line for more details</div>
                </div>
            \`, {
                maxWidth: 200,
                className: 'marker-popup-container'
            });
            
            // Add click handlers
            const selectTrail = () => {
                selectedTrailId = route.id;
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'trailSelected',
                    trailId: route.id
                }));
            };
            
            polyline.on('click', selectTrail);
            startMarker.on('click', selectTrail);
            endMarker.on('click', selectTrail);
            
            // Store trail elements (not added to map yet)
            trailLayers[route.id] = {
                polyline: polyline,
                startMarker: startMarker,
                endMarker: endMarker,
                waypoints: waypoints,
                isVisible: false
            };
        });
        
        // Handle messages from React Native
        window.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                
                switch (data.type) {
                    case 'focusOnSpot':
                        focusOnSpot(data.hiking_spot_id, data.coordinates);
                        break;
                    case 'selectTrail':
                        selectTrail(data.trailId);
                        break;
                }
            } catch (error) {
                console.error('Error handling message:', error);
            }
        });
        
        // Auto-fit map bounds to show all trails for a hiking spot
        function autoFitTrailBounds(spotId) {
            const spotTrails = trailRoutes.filter(route => route.hiking_spot_id === spotId);
            if (spotTrails.length === 0) return;
            
            const allCoordinates = [];
            spotTrails.forEach(route => {
                if (route.geojson_path && route.geojson_path.coordinates) {
                    route.geojson_path.coordinates.forEach(coord => {
                        allCoordinates.push([coord[1], coord[0]]); // Leaflet uses [lat, lng]
                    });
                }
                if (route.start_coordinates) {
                    allCoordinates.push([route.start_coordinates.latitude, route.start_coordinates.longitude]);
                }
                if (route.end_coordinates) {
                    allCoordinates.push([route.end_coordinates.latitude, route.end_coordinates.longitude]);
                }
            });
            
            if (allCoordinates.length > 0) {
                const bounds = L.latLngBounds(allCoordinates);
                map.fitBounds(bounds, { 
                    padding: [40, 40],
                    maxZoom: 16,
                    animate: true,
                    duration: 1.2
                });
            }
        }

        // Focus on hiking spot with improved centering
        function focusOnSpot(spotId, coordinates) {
            // Show trails for this spot
            const spotTrails = trailRoutes.filter(route => route.hiking_spot_id === spotId);
            if (spotTrails.length > 0) {
                // Use auto-fit bounds for better view
                autoFitTrailBounds(spotId);
            } else {
                // No trails found, center on spot
                map.setView([coordinates.latitude, coordinates.longitude], 14);
            }
        }
        
        // Select specific trail - show only the selected trail
        function selectTrail(trailId) {
            // First, remove all currently visible trails from the map
            Object.keys(trailLayers).forEach(layerId => {
                const layer = trailLayers[layerId];
                if (layer.isVisible) {
                    // Remove from map
                    map.removeLayer(layer.polyline);
                    map.removeLayer(layer.startMarker);
                    map.removeLayer(layer.endMarker);
                    if (layer.waypoints) {
                        layer.waypoints.forEach(waypoint => {
                            map.removeLayer(waypoint);
                        });
                    }
                    layer.isVisible = false;
                }
            });
            
            // Now show only the selected trail
            if (trailLayers[trailId]) {
                const selectedLayer = trailLayers[trailId];
                
                // Add selected trail to map with enhanced styling
                selectedLayer.polyline.setStyle({ 
                    weight: 6, 
                    opacity: 0.9,
                    color: '#ff6b35', // Bright orange for selection
                    lineCap: 'round',
                    lineJoin: 'round'
                });
                
                // Add to map
                selectedLayer.polyline.addTo(map);
                selectedLayer.startMarker.addTo(map);
                selectedLayer.endMarker.addTo(map);
                
                // Add waypoints with staggered animation
                if (selectedLayer.waypoints) {
                    selectedLayer.waypoints.forEach((waypoint, index) => {
                        setTimeout(() => {
                            waypoint.addTo(map);
                        }, index * 100);
                    });
                }
                
                selectedLayer.isVisible = true;
                
                // Auto-center and zoom on the selected trail with enhanced bounds
                setTimeout(() => {
                    // Include start and end markers in bounds calculation for better framing
                    const trailElements = [
                        selectedLayer.polyline,
                        selectedLayer.startMarker,
                        selectedLayer.endMarker
                    ];
                    
                    const group = new L.featureGroup(trailElements);
                    const bounds = group.getBounds();
                    
                    map.fitBounds(bounds, { 
                        padding: [60, 60], // Increased padding for better visibility
                        maxZoom: 17,
                        animate: true,
                        duration: 1.2
                    });
                    
                    // Highlight the selected trail with a subtle animation
                    selectedLayer.polyline.setStyle({
                        weight: 8,
                        opacity: 1.0
                    });
                    
                    // Reset style after animation
                    setTimeout(() => {
                        if (selectedLayer.polyline) {
                            selectedLayer.polyline.setStyle({
                                weight: 6,
                                opacity: 0.9
                            });
                        }
                    }, 1500);
                }, 100);
                
                selectedTrailId = trailId;
            }
        }
        
        // Initialize map with selected trail if provided
        function initializeMap() {
            // Hide loading indicator
            document.getElementById('loading').style.display = 'none';
            
            // If there's a selected trail from React Native, show it
            const initialTrailId = '${selectedTrailId || ''}';
            if (initialTrailId && trailLayers[initialTrailId]) {
                selectTrail(initialTrailId);
            }
            
            // Notify React Native that map is ready
            window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'mapReady'
            }));
        }
        
        // Initialize the map
        initializeMap();
    </script>
</body>
</html>
    `;
    } catch (error) {
      console.error('Error generating map HTML:', error);
      return '<p>Failed to load map.</p>';
    }
  };

  const renderMap = (fullscreenStyle?: any) => (
    <WebView
      ref={webViewRef}
      source={{ html: generateMapHTML() }}
      style={[styles.webview, fullscreenStyle]}
      onMessage={handleWebViewMessage}
      javaScriptEnabled={true}
    />
  );

  return (
    <>
      <View style={[styles.container, style]}>
        {renderMap()}
        {showFullscreenButton && (
          <TouchableOpacity 
            style={styles.fullscreenButton}
            onPress={() => setIsFullscreen(true)}
          >
            <MaterialIcons name="fullscreen" size={24} color="#388E3C" />
          </TouchableOpacity>
        )}
      </View>

      {/* Fullscreen Modal */}
      <Modal
        visible={isFullscreen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsFullscreen(false)}
      >
        <View style={styles.fullscreenContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <SafeAreaView style={styles.fullscreenSafeArea}>
            <View style={styles.fullscreenHeader}>
              {navigation && selectedHikingSpotId && (
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => {
                    setIsFullscreen(false);
                    navigation.navigate('HikingSpotLandingPage', { hiking_spot_id: selectedHikingSpotId });
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="arrow-back" size={24} color="#212121" />
                </TouchableOpacity>
              )}
              <Text style={styles.fullscreenTitle}>Trail Map</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsFullscreen(false)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={24} color="#212121" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          <View style={styles.fullscreenMapContainer}>
            {renderMap(styles.fullscreenMapStyle)}
          </View>
          
          {/* Available Trails List in Fullscreen */}
          {selectedHikingSpotId && (
            <View style={styles.fullscreenTrailListContainer}>
              <Text style={styles.trailListTitle}>Available Trails</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.trailList}
                contentContainerStyle={styles.trailListContent}
              >
                {isLoadingRoutes ? (
                   <View style={styles.loadingContainer}>
                     <Text style={styles.loadingText}>Loading trail routes...</Text>
                   </View>
                 ) : routeError ? (
                   <View style={styles.errorContainer}>
                     <Text style={styles.errorText}>{routeError}</Text>
                     <Text style={styles.errorSubtext}>Using static trail data</Text>
                   </View>
                 ) : null}
                 {(databaseRoutes.length > 0 ? databaseRoutes : NEW_TRAIL_ROUTES.filter(route => route.hiking_spot_id === selectedHikingSpotId))
                   .map((trail) => (
                    <TouchableOpacity
                      key={trail.id}
                      style={[
                        styles.trailItem,
                        selectedTrailId === trail.id && styles.selectedTrailItem
                      ]}
                      onPress={() => {
                        if (onTrailSelect) {
                          onTrailSelect(trail.id);
                        }
                        selectTrailOnMap(trail.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.trailHeader}>
                        <Text style={styles.trailName} numberOfLines={1}>
                          {trail.route_name}
                        </Text>
                        <View style={[
                          styles.difficultyBadge,
                          { backgroundColor: getDifficultyColor(trail.difficulty) }
                        ]}>
                          <Text style={styles.difficultyText}>
                            {trail.difficulty}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.trailStats}>
                        <View style={styles.trailStat}>
                          <MaterialIcons name="straighten" size={14} color="#666" />
                          <Text style={styles.trailStatText}>{trail.distance_km}km</Text>
                        </View>
                        <View style={styles.trailStat}>
                          <MaterialIcons name="trending-up" size={14} color="#666" />
                          <Text style={styles.trailStatText}>{trail.elevation_gain_m}m</Text>
                        </View>
                        <View style={styles.trailStat}>
                          <MaterialIcons name="schedule" size={14} color="#666" />
                          <Text style={styles.trailStatText}>{trail.estimated_duration_hr}h</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fullscreenButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: '100%',
  },
  fullscreenSafeArea: {
    backgroundColor: '#FFFFFF',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  fullscreenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  closeButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenMapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullscreenMapStyle: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullscreenTrailListContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: Dimensions.get('window').height * 0.25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  trailListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  trailList: {
    flexGrow: 0,
  },
  trailListContent: {
    paddingHorizontal: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
    marginHorizontal: 6,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  trailItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 6,
    minWidth: 160,
    maxWidth: 180,
    borderWidth: 1,
    borderColor: 'rgba(224, 224, 224, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedTrailItem: {
    borderColor: '#388E3C',
    borderWidth: 2,
    backgroundColor: 'rgba(56, 142, 60, 0.1)',
  },
  trailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  trailName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  trailStats: {
    gap: 4,
  },
  trailStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trailStatText: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});

export default LeafletTrailMap;