import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import MapView, { 
  Marker, 
  Polyline, 
  Region, 
  PROVIDER_GOOGLE,
  Callout,
  CalloutSubview 
} from 'react-native-maps';
import { TrailWithSpot, DIFFICULTY_COLORS } from '../services/trailService';
import { Ionicons } from '@expo/vector-icons';

interface TrailMapViewProps {
  trails: TrailWithSpot[];
  selectedTrail?: TrailWithSpot | null;
  onTrailSelect?: (trail: TrailWithSpot) => void;
  showAllTrails?: boolean;
  initialRegion?: Region;
}

const { width, height } = Dimensions.get('window');

// Default region centered on Cebu, Philippines
const DEFAULT_REGION: Region = {
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
}: TrailMapViewProps) {
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);

  // Focus on selected trail
  useEffect(() => {
    if (selectedTrail && mapReady && mapRef.current) {
      focusOnTrail(selectedTrail);
    }
  }, [selectedTrail, mapReady]);

  const focusOnTrail = (trail: TrailWithSpot) => {
    if (!mapRef.current || !trail.start_coordinates || !trail.end_coordinates) return;

    const coordinates = [
      {
        latitude: trail.start_coordinates[0],
        longitude: trail.start_coordinates[1],
      },
      {
        latitude: trail.end_coordinates[0],
        longitude: trail.end_coordinates[1],
      },
    ];

    // Add some padding around the trail
    const padding = {
      top: 100,
      right: 50,
      bottom: 100,
      left: 50,
    };

    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: padding,
      animated: true,
    });
  };

  const getPolylineCoordinates = (trail: TrailWithSpot) => {
    if (!trail.start_coordinates || !trail.end_coordinates) return [];

    // For now, create a simple line from start to end
    // In a real app, you'd use the actual trail path from GPX data
    return [
      {
        latitude: trail.start_coordinates[0],
        longitude: trail.start_coordinates[1],
      },
      {
        latitude: trail.end_coordinates[0],
        longitude: trail.end_coordinates[1],
      },
    ];
  };

  const getMarkerIcon = (isStart: boolean) => {
    return isStart ? 'play-circle' : 'flag';
  };

  const renderTrailMarkers = (trail: TrailWithSpot) => {
    if (!trail.start_coordinates || !trail.end_coordinates) return null;

    const isSelected = selectedTrail?.id === trail.id;
    const difficultyColor = DIFFICULTY_COLORS[trail.difficulty];

    return (
      <React.Fragment key={`trail-${trail.id}`}>
        {/* Start Marker */}
        <Marker
          coordinate={{
            latitude: trail.start_coordinates[0],
            longitude: trail.start_coordinates[1],
          }}
          title={`${trail.name} - Start`}
          description={`${trail.difficulty} • ${trail.distance_km}km`}
          pinColor={difficultyColor}
          onPress={() => onTrailSelect?.(trail)}
        >
          <View style={[styles.markerContainer, { backgroundColor: difficultyColor }]}>
            <Ionicons 
              name="play-circle" 
              size={isSelected ? 28 : 24} 
              color="#fff" 
            />
          </View>
          <Callout tooltip>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutTitle}>{trail.name}</Text>
              <Text style={styles.calloutSubtitle}>Start Point</Text>
              <Text style={styles.calloutDetails}>
                {trail.difficulty} • {trail.distance_km}km • {Math.round(trail.duration_hr * 60)}min
              </Text>
            </View>
          </Callout>
        </Marker>

        {/* End Marker */}
        <Marker
          coordinate={{
            latitude: trail.end_coordinates[0],
            longitude: trail.end_coordinates[1],
          }}
          title={`${trail.name} - End`}
          description={trail.highlights}
          pinColor={difficultyColor}
          onPress={() => onTrailSelect?.(trail)}
        >
          <View style={[styles.markerContainer, { backgroundColor: difficultyColor }]}>
            <Ionicons 
              name="flag" 
              size={isSelected ? 28 : 24} 
              color="#fff" 
            />
          </View>
          <Callout tooltip>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutTitle}>{trail.name}</Text>
              <Text style={styles.calloutSubtitle}>End Point</Text>
              <Text style={styles.calloutDetails}>{trail.highlights}</Text>
            </View>
          </Callout>
        </Marker>
      </React.Fragment>
    );
  };

  const renderTrailPolyline = (trail: TrailWithSpot) => {
    const coordinates = getPolylineCoordinates(trail);
    if (coordinates.length === 0) return null;

    const isSelected = selectedTrail?.id === trail.id;
    const difficultyColor = DIFFICULTY_COLORS[trail.difficulty];

    return (
      <Polyline
        key={`polyline-${trail.id}`}
        coordinates={coordinates}
        strokeColor={difficultyColor}
        strokeWidth={isSelected ? 6 : 4}
        strokePattern={isSelected ? undefined : [10, 5]}
        onPress={() => onTrailSelect?.(trail)}
      />
    );
  };

  const trailsToShow = showAllTrails ? trails : (selectedTrail ? [selectedTrail] : []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        onMapReady={() => setMapReady(true)}
        mapType="terrain"
        pitchEnabled={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
      >
        {/* Render polylines first (so they appear under markers) */}
        {trailsToShow.map(trail => renderTrailPolyline(trail))}
        
        {/* Render markers */}
        {trailsToShow.map(trail => renderTrailMarkers(trail))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    minWidth: 200,
    maxWidth: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  calloutSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  calloutDetails: {
    fontSize: 12,
    color: '#888',
    lineHeight: 16,
  },
});