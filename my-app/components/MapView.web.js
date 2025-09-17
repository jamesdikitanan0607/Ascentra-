import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Web-compatible MapView component that renders a placeholder
const MapView = ({ children, style, ...props }) => {
  return (
    <View style={[styles.mapContainer, style]}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.placeholderText}>Map View</Text>
        <Text style={styles.placeholderSubtext}>
          Interactive map available on mobile devices
        </Text>
      </View>
      {children}
    </View>
  );
};

// Placeholder components for map elements
const Marker = ({ children, ...props }) => (
  <View style={styles.marker}>
    <Text style={styles.markerText}>📍</Text>
    {children}
  </View>
);

const Polyline = ({ ...props }) => (
  <View style={styles.polyline}>
    <Text style={styles.polylineText}>Route Path</Text>
  </View>
);

const Callout = ({ children, ...props }) => (
  <View style={styles.callout}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  mapContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    minHeight: 200,
    padding: 20,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388E3C',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  marker: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  markerText: {
    fontSize: 16,
  },
  polyline: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(56, 142, 60, 0.9)',
    padding: 6,
    borderRadius: 4,
  },
  polylineText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  callout: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

// Export components
export default MapView;
export { Marker, Polyline, Callout };
export const PROVIDER_GOOGLE = 'google';