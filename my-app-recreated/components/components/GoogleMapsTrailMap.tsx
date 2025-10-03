import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { HIKING_SPOTS_DATA } from '../data/hikingSpotData';
import { NEW_TRAIL_ROUTES } from '../data/trailRoutesData';

interface GoogleMapsTrailMapProps {
  selectedHikingSpotId?: string;
  selectedTrailId?: string;
  onTrailSelect?: (trailId: string) => void;
  style?: any;
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

const GoogleMapsTrailMap: React.FC<GoogleMapsTrailMapProps> = ({
  selectedHikingSpotId,
  selectedTrailId,
  onTrailSelect,
  style
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentSpotId, setCurrentSpotId] = useState<string | undefined>(selectedHikingSpotId);

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

  // Build prepared routes for the map
  const buildPreparedRoutes = (): TrailRoute[] => {
    return NEW_TRAIL_ROUTES.map(route => ({
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
      geojson_path: route.geojson_path || {
        type: 'LineString',
        coordinates: [
          [normalizeCoordinate(route.start_coordinates).longitude, normalizeCoordinate(route.start_coordinates).latitude],
          [normalizeCoordinate(route.end_coordinates).longitude, normalizeCoordinate(route.end_coordinates).latitude]
        ]
      }
    }));
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

  // Select trail when selectedTrailId changes
  useEffect(() => {
    if (selectedTrailId && isMapReady) {
      selectTrailOnMap(selectedTrailId);
    }
  }, [selectedTrailId, isMapReady]);

  // Generate HTML for the Leaflet map
  const generateMapHTML = () => {
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
        
        // Initialize map
        const map = L.map('map').setView([10.3157, 123.8854], 10);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);
        
        // Store map elements
        const trailLayers = {};
        const spotMarkers = {};
        let selectedTrailId = null;
        
        // Create custom icons with enhanced mobile-friendly design
        const createCustomIcon = (color = '#FF0000', size = 'medium', type = 'default') => {
            const iconSize = size === 'large' ? [28, 44] : [22, 35];
            const iconAnchor = size === 'large' ? [14, 44] : [11, 35];
            
            let iconHtml = '';
            
            if (type === 'start') {
                iconHtml = \`<div style="
                    background: linear-gradient(135deg, #4CAF50, #2E7D32);
                    width: \${iconSize[0]}px;
                    height: \${iconSize[1]}px;
                    border-radius: 50% 50% 50% 0;
                    border: 3px solid white;
                    transform: rotate(-45deg);
                    box-shadow: 0 3px 8px rgba(0,0,0,0.4);
                    position: relative;
                ">
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) rotate(45deg);
                        color: white;
                        font-weight: bold;
                        font-size: 12px;
                    ">S</div>
                </div>\`;
            } else if (type === 'end') {
                iconHtml = \`<div style="
                    background: linear-gradient(135deg, #F44336, #C62828);
                    width: \${iconSize[0]}px;
                    height: \${iconSize[1]}px;
                    border-radius: 50% 50% 50% 0;
                    border: 3px solid white;
                    transform: rotate(-45deg);
                    box-shadow: 0 3px 8px rgba(0,0,0,0.4);
                    position: relative;
                ">
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) rotate(45deg);
                        color: white;
                        font-weight: bold;
                        font-size: 12px;
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
        
        // Add trail routes
        trailRoutes.forEach(route => {
            // Safely validate and extract coordinates
            if (!route || !route.geojson_path || !Array.isArray(route.geojson_path.coordinates) || route.geojson_path.coordinates.length === 0) {
                console.warn('Invalid route coordinates for route:', route?.route_name || 'Unknown');
                return;
            }
            
            // Determine if this route is selected
            const isSelected = selectedTrailId === route.id;
            
            // Create polyline for trail path with enhanced styling for selected route
            const coordinates = route.geojson_path.coordinates.map(coord => [coord[1], coord[0]]);
            const polyline = L.polyline(coordinates, {
                color: route.route_color || '#2196F3',
                weight: isSelected ? 6 : 4,
                opacity: isSelected ? 1.0 : 0.8,
                dashArray: isSelected ? null : '5, 5'
            }).addTo(map);
            
            // Add start marker with safe coordinate access
            if (route.start_coordinates && typeof route.start_coordinates.latitude === 'number' && typeof route.start_coordinates.longitude === 'number') {
                const startMarker = L.marker([route.start_coordinates.latitude, route.start_coordinates.longitude], {
                    icon: createCustomIcon('#4CAF50', isSelected ? 'large' : 'medium', 'start')
                }).addTo(map);
                
                startMarker.bindPopup(\`<strong>🟢 Trail Start:</strong> \${route.route_name}\`);
                startMarker.on('click', () => selectTrail(route.id));
            }
            
            // Add end marker with safe coordinate access
            if (route.end_coordinates && typeof route.end_coordinates.latitude === 'number' && typeof route.end_coordinates.longitude === 'number') {
                const endMarker = L.marker([route.end_coordinates.latitude, route.end_coordinates.longitude], {
                    icon: createCustomIcon('#F44336', isSelected ? 'large' : 'medium', 'end')
                }).addTo(map);
                
                endMarker.bindPopup(\`<strong>🔴 Trail End:</strong> \${route.route_name}\`);
                endMarker.on('click', () => selectTrail(route.id));
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
            
            // Bind popups
            polyline.bindPopup(popupContent);
            startMarker.bindPopup(\`<strong>Start:</strong> \${route.route_name}\`);
            endMarker.bindPopup(\`<strong>End:</strong> \${route.route_name}\`);
            
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
            
            // Store trail elements
            trailLayers[route.id] = {
                polyline: polyline,
                startMarker: startMarker,
                endMarker: endMarker
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
        
        // Focus on hiking spot
        function focusOnSpot(spotId, coordinates) {
            map.setView([coordinates.latitude, coordinates.longitude], 14);
            
            // Show trails for this spot
            const spotTrails = trailRoutes.filter(route => route.hiking_spot_id === spotId);
            if (spotTrails.length > 0) {
                const group = new L.featureGroup(spotTrails.map(route => trailLayers[route.id].polyline));
                map.fitBounds(group.getBounds(), { padding: [20, 20] });
            }
        }
        
        // Select specific trail
        function selectTrail(trailId) {
            // Reset previous selection
            Object.values(trailLayers).forEach(layer => {
                layer.polyline.setStyle({ weight: 4, opacity: 0.8 });
            });
            
            // Highlight selected trail
            if (trailLayers[trailId]) {
                trailLayers[trailId].polyline.setStyle({ weight: 6, opacity: 1.0 });
                selectedTrailId = trailId;
            }
        }
        
        // Hide loading indicator and notify React Native
        document.getElementById('loading').style.display = 'none';
        
        // Notify React Native that map is ready
        window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'mapReady'
        }));
    </script>
</body>
</html>
    `;
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: generateMapHTML() }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={Platform.OS === 'android'}
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default GoogleMapsTrailMap;