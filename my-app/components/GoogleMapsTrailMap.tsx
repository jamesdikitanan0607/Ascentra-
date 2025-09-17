import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { TrailRouteDetails } from '../services/supabaseService';
import Constants from 'expo-constants';

interface GoogleMapsTrailMapProps {
  routes: TrailRouteDetails[];
  selectedRoute: TrailRouteDetails | null;
  onRouteSelect: (route: TrailRouteDetails | null) => void;
  centerCoordinates: {
    latitude: number;
    longitude: number;
  };
}

const COLORS = {
  primary: '#388E3C',
  text: '#212121',
  textLight: '#616161',
  card: '#F9F9F9',
  background: '#FFFFFF',
};

export default function GoogleMapsTrailMap({
  routes,
  selectedRoute,
  onRouteSelect,
  centerCoordinates,
}: GoogleMapsTrailMapProps) {
  const webViewRef = useRef<WebView>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedTrailKey, setSelectedTrailKey] = useState<string | null>(null);

  // Build available trails from props
  const availableTrails = Array.isArray(routes) ? routes : [];

  useEffect(() => {
    if (selectedRoute && isMapLoaded) {
      const key = getRouteKey(selectedRoute);
      if (key) selectTrailOnMap(key);
    }
  }, [selectedRoute, isMapLoaded]);

  function getRouteKey(route: TrailRouteDetails): string {
    return String((route as any).route_id ?? (route as any).id ?? route.route_name);
  }

  function getDifficultyColor(difficulty: string | undefined): string {
    if (!difficulty) return COLORS.primary;
    switch (String(difficulty).toLowerCase()) {
      case 'easy': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'hard': return '#F44336';
      case 'advanced': return '#9C27B0';
      default: return COLORS.primary;
    }
  }

  function getRouteColor(route: TrailRouteDetails): string {
    const explicit = (route as any).route_color as string | undefined;
    if (explicit && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(explicit)) return explicit;
    return getDifficultyColor((route as any).difficulty);
  }

  type LatLng = { lat: number; lng: number };

  function parsePointString(value: string): LatLng | null {
    // Supports formats like 'POINT(lon lat)' or 'lon, lat' or '(lon,lat)'
    const trimmed = value.trim();
    try {
      if (trimmed.startsWith('POINT')) {
        const inside = trimmed.slice(trimmed.indexOf('(') + 1, trimmed.indexOf(')'));
        const [lonStr, latStr] = inside.split(/[\s,]+/).filter(Boolean);
        const lat = parseFloat(latStr);
        const lng = parseFloat(lonStr);
        if (isFinite(lat) && isFinite(lng)) return { lat, lng };
        return null;
      }
      const cleaned = trimmed.replace(/[()]/g, '');
      const [a, b] = cleaned.split(',').map(s => s.trim());
      const lat = parseFloat(a);
      const lng = parseFloat(b);
      if (isFinite(lat) && isFinite(lng)) return { lat, lng };
      // Might be lon,lat order
      const lat2 = parseFloat(b);
      const lng2 = parseFloat(a);
      if (isFinite(lat2) && isFinite(lng2)) return { lat: lat2, lng: lng2 };
      return null;
    } catch {
      return null;
    }
  }

  function normalizeAnyCoord(c: any): LatLng | null {
    if (!c) return null;
    if (typeof c === 'string') return parsePointString(c);
    if (Array.isArray(c)) {
      // Could be [lat, lon] or [lon, lat]
      const [a, b] = c;
      if (typeof a === 'number' && typeof b === 'number') {
        // Heuristic: lat is between -90..90
        if (Math.abs(a) <= 90 && Math.abs(b) <= 180) return { lat: a, lng: b };
        return { lat: b, lng: a };
      }
      return null;
    }
    if (typeof c === 'object') {
      if (typeof c.latitude === 'number' && typeof c.longitude === 'number') return { lat: c.latitude, lng: c.longitude };
      if (typeof c.lat === 'number' && typeof c.lng === 'number') return { lat: c.lat, lng: c.lng };
      if (Array.isArray(c.coordinates) && c.coordinates.length >= 2) {
        // GeoJSON Point [lon, lat]
        const [lon, lat] = c.coordinates;
        if (typeof lat === 'number' && typeof lon === 'number') return { lat, lng: lon };
      }
    }
    return null;
  }

  function normalizeRouteCoordinates(route: TrailRouteDetails): LatLng[] {
    const acc: LatLng[] = [];

    const rc = (route as any).route_coordinates as any[] | undefined;
    if (Array.isArray(rc) && rc.length) {
      for (const p of rc) {
        const n = normalizeAnyCoord(p);
        if (n) acc.push(n);
      }
    }

    if (acc.length === 0) {
      const start = normalizeAnyCoord((route as any).start_coordinates);
      const end = normalizeAnyCoord((route as any).end_coordinates);
      if (start) acc.push(start);
      if (end) acc.push(end);
    }
    return acc;
  }

  function buildPreparedRoutes(): Record<string, { name: string; coordinates: LatLng[]; color: string }> {
    const map: Record<string, { name: string; coordinates: LatLng[]; color: string }> = {};
    for (const r of availableTrails) {
      const key = getRouteKey(r);
      const coords = normalizeRouteCoordinates(r);
      if (coords.length === 0) continue;
      map[key] = {
        name: (r as any).route_name || 'Trail',
        coordinates: coords,
        color: getRouteColor(r),
      };
    }
    return map;
  }

  function selectTrailOnMap(trailKey: string) {
    if (webViewRef.current) {
      const message = JSON.stringify({ action: 'selectTrail', trail: trailKey });
      webViewRef.current.postMessage(message);
      setSelectedTrailKey(trailKey);
    }
  }

  function handleTrailSelect(trailKey: string) {
    selectTrailOnMap(trailKey);
    const found = availableTrails.find(r => getRouteKey(r) === trailKey) || null;
    if (onRouteSelect) onRouteSelect(found);
  }

  function handleDefaultView() {
    if (webViewRef.current) {
      const message = JSON.stringify({ action: 'selectTrail', trail: 'default' });
      webViewRef.current.postMessage(message);
      setSelectedTrailKey(null);
      if (onRouteSelect) onRouteSelect(null);
    }
  }

  function handleWebViewMessage(event: any) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Message from WebView:', data);
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  }

  function handleWebViewLoad() {
    setIsMapLoaded(true);
  }

  function handleWebViewError(error: any) {
    console.error('WebView error:', error);
    Alert.alert(
      'Map Loading Error',
      'Failed to load the trail map. Please check your internet connection and try again.',
      [{ text: 'OK' }]
    );
  }

  // Generate the HTML content with the Google Maps template
  function generateMapHTML() {
    const GOOGLE_MAPS_API_KEY =
      (Constants as any)?.expoConfig?.extra?.googleMapsApiKey ||
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
      '';

    const preparedRoutes = buildPreparedRoutes();
    const defaultCenter = {
      lat: centerCoordinates?.latitude ?? 0,
      lng: centerCoordinates?.longitude ?? 0,
    };

    const preparedRoutesJSON = JSON.stringify(preparedRoutes);
    const defaultCenterJSON = JSON.stringify(defaultCenter);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trail Map</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        #map { height: 100vh; width: 100%; }
        .loading { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 2000; text-align: center; font-size: 16px; color: #388E3C; }
        .error { color: #F44336; }
        .legend { position: absolute; bottom: 16px; left: 16px; background: rgba(255,255,255,0.95); padding: 10px 12px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); font-size: 12px; color: #333; }
        .legend-row { display: flex; align-items: center; margin-bottom: 6px; }
        .legend-swatch { width: 24px; height: 4px; margin-right: 8px; border-radius: 2px; }
        .legend-marker { width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
    </style>
</head>
<body>
    <div id="loading" class="loading">Loading trail map...</div>
    <div id="map"></div>
    <div class="legend" id="legend"></div>

    <script>
        let map;
        let currentPolyline = null;
        let startMarker = null;
        let endMarker = null;
        let selectedTrail = null;

        const trailRoutes = ${preparedRoutesJSON};
        const defaultCenter = ${defaultCenterJSON};

        function initMap() {
            try {
                document.getElementById('loading').style.display = 'none';
                map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 13,
                    center: defaultCenter,
                    mapTypeId: google.maps.MapTypeId.TERRAIN,
                    styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
                    mapTypeControl: true,
                    streetViewControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                    gestureHandling: 'greedy'
                });
                showDefaultView();
                buildLegend();
                sendMessageToRN({ action: 'mapLoaded' });
            } catch (error) {
                console.error('Error initializing map:', error);
                showError('Failed to initialize map');
            }
        }

        function buildLegend() {
            const legend = document.getElementById('legend');
            if (!legend) return;
            legend.innerHTML = '';
            // Markers legend
            const markers = document.createElement('div');
            markers.className = 'legend-row';
            markers.innerHTML = '<span class="legend-marker" style="background:#4CAF50"></span>Start <span style="width:8px;display:inline-block"></span><span class="legend-marker" style="background:#F44336"></span>End';
            legend.appendChild(markers);
            // Routes legend
            for (const key in trailRoutes) {
                const row = document.createElement('div');
                row.className = 'legend-row';
                const swatch = document.createElement('div');
                swatch.className = 'legend-swatch';
                swatch.style.background = trailRoutes[key].color || '#388E3C';
                const label = document.createElement('span');
                label.textContent = trailRoutes[key].name || 'Trail';
                row.appendChild(swatch);
                row.appendChild(label);
                legend.appendChild(row);
            }
        }

        function showDefaultView() {
            clearTrail();
            selectedTrail = null;
            map.setCenter(defaultCenter);
            map.setZoom(13);
        }

        function showTrail(trailKey) {
            const trail = trailRoutes[trailKey];
            if (!trail) return;
            clearTrail();
            selectedTrail = trailKey;
            try {
                currentPolyline = new google.maps.Polyline({
                    path: trail.coordinates,
                    geodesic: true,
                    strokeColor: trail.color || '#388E3C',
                    strokeOpacity: 1.0,
                    strokeWeight: 4,
                    map: map
                });
                if (trail.coordinates && trail.coordinates.length) {
                    const start = trail.coordinates[0];
                    startMarker = new google.maps.Marker({
                        position: start,
                        map: map,
                        title: (trail.name || 'Trail') + ' - Start',
                        icon: {
                            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#4CAF50" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="white"/></svg>'),
                            scaledSize: new google.maps.Size(24, 24),
                            anchor: new google.maps.Point(12, 12)
                        }
                    });
                    const endPoint = trail.coordinates[trail.coordinates.length - 1];
                    endMarker = new google.maps.Marker({
                        position: endPoint,
                        map: map,
                        title: (trail.name || 'Trail') + ' - End',
                        icon: {
                            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#F44336" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="white"/></svg>'),
                            scaledSize: new google.maps.Size(24, 24),
                            anchor: new google.maps.Point(12, 12)
                        }
                    });
                    const bounds = new google.maps.LatLngBounds();
                    trail.coordinates.forEach(coord => bounds.extend(coord));
                    map.fitBounds(bounds, { padding: 50 });
                }
                sendMessageToRN({ action: 'trailSelected', trail: trailKey, name: trail.name });
            } catch (error) {
                console.error('Error showing trail:', error);
                showError('Failed to display trail');
            }
        }

        function clearTrail() {
            if (currentPolyline) { currentPolyline.setMap(null); currentPolyline = null; }
            if (startMarker) { startMarker.setMap(null); startMarker = null; }
            if (endMarker) { endMarker.setMap(null); endMarker = null; }
        }

        function showError(message) {
            const loading = document.getElementById('loading');
            loading.innerHTML = message;
            loading.className = 'loading error';
            loading.style.display = 'block';
        }

        window.addEventListener('message', function(event) {
            try {
                const data = JSON.parse(event.data);
                if (data.action === 'selectTrail') {
                    if (data.trail === 'default') showDefaultView();
                    else showTrail(data.trail);
                }
            } catch (error) {
                console.error('Error handling message:', error);
            }
        });

        function sendMessageToRN(message) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify(message));
            }
        }

        window.addEventListener('error', function(e) {
            console.error('Map error:', e);
            showError('Error loading map. Please check your internet connection.');
        });

        window.gm_authFailure = function() {
            showError('Google Maps API authentication failed. Please check your API key.');
        };
    </script>
    <script async defer src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap&libraries=geometry" onerror="showError('Failed to load Google Maps API')"></script>
</body>
</html>
    `;
  };

  return (
    <View style={styles.container}>
      {/* Trail Selection Controls */}
      <View style={styles.controlsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.controlsScrollView}>
          <TouchableOpacity
            style={[styles.trailButton, styles.defaultButton, selectedTrailKey === null && styles.trailButtonSelected]}
            onPress={handleDefaultView}
          >
            <MaterialIcons name="map" size={16} color="white" />
            <Text style={styles.trailButtonText}>Default View</Text>
          </TouchableOpacity>

          {availableTrails.map((route) => {
            const trailKey = getRouteKey(route);
            return (
              <TouchableOpacity
                key={trailKey}
                style={[
                  styles.trailButton,
                  { backgroundColor: getRouteColor(route) },
                  selectedTrailKey === trailKey && styles.trailButtonSelected,
                ]}
                onPress={() => handleTrailSelect(trailKey)}
              >
                <Text style={styles.trailButtonText}>{(route as any).route_name || 'Trail'}</Text>
                {(route as any).difficulty ? (
                  <Text style={styles.trailDifficultyText}>{String((route as any).difficulty)}</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Google Maps WebView */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: generateMapHTML() }}
          style={styles.webView}
          onLoad={handleWebViewLoad}
          onError={handleWebViewError}
          onMessage={handleWebViewMessage}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          scalesPageToFit
          scrollEnabled={false}
          bounces={false}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      </View>

      {/* Trail Information Panel */}
      {selectedTrailKey && (
        <View style={styles.infoPanel}>
          {(() => {
            const route = availableTrails.find(r => getRouteKey(r) === selectedTrailKey) as any;
            if (!route) return null;
            return (
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{route.route_name || 'Trail'}</Text>
                <View style={styles.infoStats}>
                  {route.distance_km ? (
                    <View style={styles.infoStat}>
                      <MaterialIcons name="straighten" size={16} color={COLORS.primary} />
                      <Text style={styles.infoStatText}>{route.distance_km}km</Text>
                    </View>
                  ) : null}
                  {route.elevation_gain_m ? (
                    <View style={styles.infoStat}>
                      <MaterialIcons name="terrain" size={16} color={COLORS.primary} />
                      <Text style={styles.infoStatText}>{route.elevation_gain_m}m</Text>
                    </View>
                  ) : null}
                  {route.estimated_duration_hr ? (
                    <View style={styles.infoStat}>
                      <MaterialIcons name="schedule" size={16} color={COLORS.primary} />
                      <Text style={styles.infoStatText}>{route.estimated_duration_hr}h</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  controlsContainer: { paddingVertical: 12, backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  controlsScrollView: { paddingHorizontal: 16 },
  trailButton: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 12, flexDirection: 'row', alignItems: 'center', minWidth: 120, justifyContent: 'center' },
  defaultButton: { backgroundColor: '#616161' },
  trailButtonSelected: { backgroundColor: '#1B5E20', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  trailButtonText: { color: 'white', fontSize: 14, fontWeight: '600', marginLeft: 4 },
  trailDifficultyText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  mapContainer: { flex: 1, backgroundColor: COLORS.card },
  webView: { flex: 1 },
  infoPanel: { backgroundColor: COLORS.card, padding: 16, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  infoContent: { alignItems: 'center' },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  infoStats: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  infoStat: { flexDirection: 'row', alignItems: 'center' },
  infoStatText: { marginLeft: 4, fontSize: 14, color: COLORS.textLight, fontWeight: '500' },
});