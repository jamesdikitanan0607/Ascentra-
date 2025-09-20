import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { getHikeById } from '../services/databaseService';
import { formatDistance, formatDuration } from '../utils/formatters';

const { width, height } = Dimensions.get('window');

export default function SaveConfirmationScreen({ navigation, route }) {
  const { hikeId } = route.params;
  const [loading, setLoading] = useState(true);
  const [hike, setHike] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHikeDetails = async () => {
      try {
        setLoading(true);
        // Fetch the saved hike details
        const hikeData = await getHikeById(hikeId);
        
        if (!hikeData) {
          setError('Could not load activity details');
          return;
        }
        
        setHike(hikeData);
      } catch (err) {
        console.error('Error loading activity details:', err);
        setError('Failed to load activity details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHikeDetails();
  }, [hikeId]);



  const handleViewDetails = () => {
    navigation.replace('HikeDetail', { hikeId });
  };

  const handleGoToHistory = () => {
    navigation.replace('HikeHistory');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading activity details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={60} color="#D32F2F" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={handleGoToHistory}
        >
          <Text style={styles.errorButtonText}>Go to Activity History</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity Saved</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={handleGoToHistory}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.successCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={60} color="#2E7D32" />
          </View>
          
          <Text style={styles.successTitle}>Success!</Text>
          <Text style={styles.successText}>
            Your {hike?.activityType || 'activity'} has been saved successfully.
          </Text>
          
          <View style={styles.statsSummary}>
            <View style={styles.statItem}>
              <Ionicons name="navigate" size={20} color="#2E7D32" />
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>
                {formatDistance(hike?.stats?.distance || 0)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="time" size={20} color="#2E7D32" />
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>
                {formatDuration(hike?.stats?.duration || 0)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="trending-up" size={20} color="#2E7D32" />
              <Text style={styles.statLabel}>Elevation</Text>
              <Text style={styles.statValue}>
                {(hike?.stats?.elevation || 0).toFixed(0)}m
              </Text>
            </View>
          </View>
        </View>
        
        {/* Map preview */}
        {hike?.routeCoordinates && hike.routeCoordinates.length > 0 && (
          <View style={styles.mapContainer}>
            <WebView
              style={styles.map}
              source={{
                html: `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                    <style>
                      body { margin: 0; padding: 0; }
                      #map { height: 100vh; width: 100vw; }
                    </style>
                  </head>
                  <body>
                    <div id="map"></div>
                    <script>
                      const coordinates = ${JSON.stringify(hike.routeCoordinates || [])};
                      
                      if (coordinates.length > 0) {
                        const map = L.map('map', {
                          zoomControl: false,
                          scrollWheelZoom: false,
                          doubleClickZoom: false,
                          boxZoom: false,
                          keyboard: false,
                          dragging: false,
                          touchZoom: false
                        });
                        
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                          attribution: '© OpenStreetMap contributors'
                        }).addTo(map);
                        
                        // Convert coordinates to Leaflet format
                        const leafletCoords = coordinates.map(coord => [coord.latitude, coord.longitude]);
                        
                        // Add polyline
                        L.polyline(leafletCoords, {
                          color: '#2E7D32',
                          weight: 4,
                          opacity: 1
                        }).addTo(map);
                        
                        // Add start marker
                        const startIcon = L.divIcon({
                          html: '<div style="width: 16px; height: 16px; border-radius: 8px; background-color: rgba(46, 125, 50, 0.3); display: flex; justify-content: center; align-items: center;"><div style="width: 8px; height: 8px; border-radius: 4px; background-color: #2E7D32;"></div></div>',
                          className: 'custom-marker',
                          iconSize: [16, 16],
                          iconAnchor: [8, 8]
                        });
                        L.marker([coordinates[0].latitude, coordinates[0].longitude], { icon: startIcon }).addTo(map);
                        
                        // Add end marker
                        const endIcon = L.divIcon({
                          html: '<div style="width: 16px; height: 16px; border-radius: 8px; background-color: rgba(211, 47, 47, 0.3); display: flex; justify-content: center; align-items: center;"><div style="width: 8px; height: 8px; border-radius: 4px; background-color: #D32F2F;"></div></div>',
                          className: 'custom-marker',
                          iconSize: [16, 16],
                          iconAnchor: [8, 8]
                        });
                        L.marker([coordinates[coordinates.length - 1].latitude, coordinates[coordinates.length - 1].longitude], { icon: endIcon }).addTo(map);
                        
                        // Fit bounds to show entire route
                        const bounds = L.latLngBounds(leafletCoords);
                        map.fitBounds(bounds, { padding: [20, 20] });
                      }
                    </script>
                  </body>
                  </html>
                `
              }}
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={handleViewDetails}
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.historyButton}
            onPress={handleGoToHistory}
          >
            <Text style={styles.historyButtonText}>Go to Activity History</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F8F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F8F5',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#2E7D32',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  successCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  iconContainer: {
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  successText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  statsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  statValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  mapContainer: {
    height: height * 0.3,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  detailsButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  historyButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  startMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(46, 125, 50, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
  },
  endMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(211, 47, 47, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D32F2F',
  },
});
