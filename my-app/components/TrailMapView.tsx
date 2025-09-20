import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { TrailWithSpot, DIFFICULTY_COLORS } from '../services/trailService';

interface TrailMapViewProps {
  trails: TrailWithSpot[];
  selectedTrail?: TrailWithSpot | null;
  onTrailSelect?: (trail: TrailWithSpot) => void;
  showAllTrails?: boolean;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  style?: any;
}

const { width, height } = Dimensions.get('window');

// Default region centered on Cebu, Philippines
const DEFAULT_REGION = {
  latitude: 10.3157,
  longitude: 123.8854,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function TrailMapView({
  trails,
  selectedTrail,
  onTrailSelect,
  showAllTrails = true,
  initialRegion = DEFAULT_REGION,
  style,
}: TrailMapViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);

  // Normalize coordinates to ensure they're in [lat, lng] format
  const normalizeCoordinates = (coords: [number, number] | undefined): [number, number] | null => {
    if (!coords || coords.length < 2) return null;
    return [coords[0], coords[1]];
  };

  // Prepare trail data for the map
  const prepareTrailsData = () => {
    const trailsToShow = showAllTrails ? trails : (selectedTrail ? [selectedTrail] : []);
    
    return trailsToShow.map(trail => {
      const startCoords = normalizeCoordinates(trail.start_coordinates);
      const endCoords = normalizeCoordinates(trail.end_coordinates);
      
      if (!startCoords || !endCoords) return null;
      
      return {
        id: trail.id,
        name: trail.name,
        difficulty: trail.difficulty,
        distance_km: trail.distance_km,
        duration_hr: trail.duration_hr,
        highlights: trail.highlights,
        startCoords,
        endCoords,
        color: DIFFICULTY_COLORS[trail.difficulty] || '#007AFF',
        isSelected: selectedTrail?.id === trail.id,
      };
    }).filter(Boolean);
  };

  // Focus on selected trail
  useEffect(() => {
    if (selectedTrail && mapReady && webViewRef.current) {
      const startCoords = normalizeCoordinates(selectedTrail.start_coordinates);
      const endCoords = normalizeCoordinates(selectedTrail.end_coordinates);
      
      if (startCoords && endCoords) {
        const bounds = [startCoords, endCoords];
        webViewRef.current.postMessage(JSON.stringify({
          type: 'fitBounds',
          bounds: bounds,
        }));
      }
    }
  }, [selectedTrail, mapReady]);

  // Handle messages from WebView
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'mapReady') {
        setMapReady(true);
      } else if (data.type === 'trailSelected' && onTrailSelect) {
        const trail = trails.find(t => t.id === data.trailId);
        if (trail) {
          onTrailSelect(trail);
        }
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const trailsData = prepareTrailsData();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Trail Map</title>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
        .custom-marker {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        }
        .custom-marker.selected {
          width: 48px;
          height: 48px;
          font-size: 24px;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .popup-content {
          padding: 8px;
          min-width: 200px;
        }
        .popup-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }
        .popup-subtitle {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }
        .popup-details {
          font-size: 12px;
          color: #888;
          line-height: 16px;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        // Initialize map
        const map = L.map('map', {
          center: [${initialRegion.latitude}, ${initialRegion.longitude}],
          zoom: 10,
          zoomControl: true,
          attributionControl: true,
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map);

        // Store trail data
        const trailsData = ${JSON.stringify(trailsData)};
        const markers = [];
        const polylines = [];

        // Function to create custom marker icon
        function createMarkerIcon(color, icon, isSelected = false) {
          const size = isSelected ? 48 : 40;
          const fontSize = isSelected ? 24 : 20;
          
          return L.divIcon({
            className: 'custom-div-icon',
            html: \`<div class="custom-marker \${isSelected ? 'selected' : ''}" style="background-color: \${color}; width: \${size}px; height: \${size}px; font-size: \${fontSize}px;">\${icon}</div>\`,
            iconSize: [size, size],
            iconAnchor: [size/2, size/2],
          });
        }

        // Function to add trail to map
        function addTrail(trail) {
          if (!trail || !trail.startCoords || !trail.endCoords) return;

          const { id, name, difficulty, distance_km, duration_hr, highlights, startCoords, endCoords, color, isSelected } = trail;

          // Create polyline
          const polyline = L.polyline([startCoords, endCoords], {
            color: color,
            weight: isSelected ? 6 : 4,
            opacity: 0.8,
          }).addTo(map);

          polyline.on('click', () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'trailSelected',
              trailId: id,
            }));
          });

          polylines.push(polyline);

          // Start marker
          const startMarker = L.marker(startCoords, {
            icon: createMarkerIcon(color, '▶', isSelected)
          }).addTo(map);

          startMarker.bindPopup(\`
            <div class="popup-content">
              <div class="popup-title">\${name}</div>
              <div class="popup-subtitle">Start Point</div>
              <div class="popup-details">\${difficulty} • \${distance_km}km • \${Math.round(duration_hr * 60)}min</div>
            </div>
          \`);

          startMarker.on('click', () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'trailSelected',
              trailId: id,
            }));
          });

          markers.push(startMarker);

          // End marker
          const endMarker = L.marker(endCoords, {
            icon: createMarkerIcon(color, '🏁', isSelected)
          }).addTo(map);

          endMarker.bindPopup(\`
            <div class="popup-content">
              <div class="popup-title">\${name}</div>
              <div class="popup-subtitle">End Point</div>
              <div class="popup-details">\${highlights || 'Trail endpoint'}</div>
            </div>
          \`);

          endMarker.on('click', () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'trailSelected',
              trailId: id,
            }));
          });

          markers.push(endMarker);
        }

        // Function to clear all trails
        function clearTrails() {
          markers.forEach(marker => map.removeLayer(marker));
          polylines.forEach(polyline => map.removeLayer(polyline));
          markers.length = 0;
          polylines.length = 0;
        }

        // Function to update trails
        function updateTrails(newTrailsData) {
          clearTrails();
          newTrailsData.forEach(addTrail);
        }

        // Add initial trails
        updateTrails(trailsData);

        // Handle messages from React Native
        window.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'updateTrails') {
              updateTrails(data.trails);
            } else if (data.type === 'fitBounds' && data.bounds) {
              const bounds = L.latLngBounds(data.bounds);
              map.fitBounds(bounds, { padding: [20, 20] });
            }
          } catch (error) {
            console.error('Error handling message:', error);
          }
        });

        // Notify React Native that map is ready
        map.whenReady(() => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mapReady'
          }));
        });
      </script>
    </body>
    </html>
  `;

  // Update trails when data changes
  useEffect(() => {
    if (mapReady && webViewRef.current) {
      const updatedTrailsData = prepareTrailsData();
      webViewRef.current.postMessage(JSON.stringify({
        type: 'updateTrails',
        trails: updatedTrailsData,
      }));
    }
  }, [trails, selectedTrail, showAllTrails, mapReady]);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={Platform.OS === 'android'}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});