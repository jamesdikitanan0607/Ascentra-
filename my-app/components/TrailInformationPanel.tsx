import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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
}

interface TrailInformationPanelProps {
  selectedRoute: TrailRoute | null;
  onShareRoute?: () => void;
  onSaveRoute?: () => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  'Easy': '#2ecc71',
  'Moderate': '#f39c12',
  'Hard': '#e74c3c',
  'Expert': '#8e44ad',
};

const TrailInformationPanel: React.FC<TrailInformationPanelProps> = ({
  selectedRoute,
  onShareRoute,
  onSaveRoute,
}) => {
  if (!selectedRoute) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="info-outline" size={48} color="#ccc" />
        <Text style={styles.emptyText}>Select a trail to view details</Text>
      </View>
    );
  }

  const difficultyColor = DIFFICULTY_COLORS[selectedRoute.difficulty] || '#3498db';
  const durationHours = Math.floor(selectedRoute.estimated_duration_min / 60);
  const durationMinutes = selectedRoute.estimated_duration_min % 60;

  const formatDuration = () => {
    if (durationHours > 0) {
      return durationMinutes > 0 
        ? `${durationHours}h ${durationMinutes}m`
        : `${durationHours}h`;
    }
    return `${durationMinutes}m`;
  };

  const parseFeatures = (features: string) => {
    return features.split(',').map(feature => feature.trim()).filter(Boolean);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Trail Information</Text>
      
      <View style={styles.infoCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.routeTitle} numberOfLines={2}>
              {selectedRoute.route_name}
            </Text>
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
              <Text style={styles.difficultyText}>{selectedRoute.difficulty}</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            {onSaveRoute && (
              <TouchableOpacity style={styles.actionButton} onPress={onSaveRoute}>
                <MaterialIcons name="bookmark-border" size={20} color="#666" />
              </TouchableOpacity>
            )}
            {onShareRoute && (
              <TouchableOpacity style={styles.actionButton} onPress={onShareRoute}>
                <MaterialIcons name="share" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialIcons name="straighten" size={24} color="#2ecc71" />
            <Text style={styles.statValue}>{selectedRoute.distance_km}</Text>
            <Text style={styles.statLabel}>Distance (km)</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialIcons name="trending-up" size={24} color="#e74c3c" />
            <Text style={styles.statValue}>{selectedRoute.elevation_gain_m}</Text>
            <Text style={styles.statLabel}>Elevation (m)</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialIcons name="schedule" size={24} color="#f39c12" />
            <Text style={styles.statValue}>{formatDuration()}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </View>

        {/* Description */}
        {selectedRoute.route_description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {selectedRoute.route_description}
            </Text>
          </View>
        )}

        {/* Features */}
        {selectedRoute.route_features && (
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>Trail Features</Text>
            <View style={styles.featuresContainer}>
              {parseFeatures(selectedRoute.route_features).map((feature, index) => (
                <View key={index} style={styles.featureTag}>
                  <MaterialIcons name="check-circle" size={14} color="#2ecc71" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Coordinates Info */}
        <View style={styles.coordinatesSection}>
          <Text style={styles.coordinatesTitle}>Trail Coordinates</Text>
          
          <View style={styles.coordinateRow}>
            <View style={styles.coordinateItem}>
              <MaterialIcons name="play-arrow" size={16} color="#2ecc71" />
              <Text style={styles.coordinateLabel}>Start</Text>
              <Text style={styles.coordinateValue}>
                {selectedRoute.start_latitude.toFixed(4)}, {selectedRoute.start_longitude.toFixed(4)}
              </Text>
            </View>
            
            <View style={styles.coordinateItem}>
              <MaterialIcons name="stop" size={16} color="#e74c3c" />
              <Text style={styles.coordinateLabel}>End</Text>
              <Text style={styles.coordinateValue}>
                {selectedRoute.end_latitude.toFixed(4)}, {selectedRoute.end_longitude.toFixed(4)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.primaryButton}>
            <MaterialIcons name="directions" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Get Directions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <MaterialIcons name="download" size={20} color="#2ecc71" />
            <Text style={styles.secondaryButtonText}>Download GPX</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  routeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  featuresSection: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
    fontWeight: '500',
  },
  coordinatesSection: {
    marginBottom: 20,
  },
  coordinatesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  coordinateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordinateItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  coordinateLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
    marginBottom: 2,
  },
  coordinateValue: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2ecc71',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#2ecc71',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default TrailInformationPanel;
