import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DIFFICULTY_COLORS } from '../services/trailService';

interface MapLegendProps {
  isVisible?: boolean;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
}

const DIFFICULTIES = ['Easy', 'Moderate', 'Hard', 'Advanced'];

export default function MapLegend({
  isVisible = true,
  position = 'top-right',
}: MapLegendProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    setIsExpanded(!isExpanded);
  };

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      zIndex: 1000,
    };

    switch (position) {
      case 'top-right':
        return { ...baseStyles, top: 60, right: 16 };
      case 'bottom-right':
        return { ...baseStyles, bottom: 100, right: 16 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 100, left: 16 };
      case 'top-left':
        return { ...baseStyles, top: 60, left: 16 };
      default:
        return { ...baseStyles, top: 60, right: 16 };
    }
  };

  const contentHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // Adjust based on content
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  if (!isVisible) return null;

  return (
    <View style={[styles.container, getPositionStyles()]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.8}
      >
        <View style={styles.headerContent}>
          <Ionicons name="map" size={20} color="#333" />
          <Text style={styles.headerText}>Legend</Text>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#666"
        />
      </TouchableOpacity>

      {/* Expandable Content */}
      <Animated.View
        style={[
          styles.content,
          {
            height: contentHeight,
            opacity,
          },
        ]}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trail Difficulty</Text>
          {DIFFICULTIES.map((difficulty) => (
            <View key={difficulty} style={styles.legendItem}>
              <View
                style={[
                  styles.colorIndicator,
                  { backgroundColor: DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS] },
                ]}
              />
              <Text style={styles.legendText}>{difficulty}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Markers</Text>
          
          <View style={styles.legendItem}>
            <View style={styles.markerExample}>
              <Ionicons name="play-circle" size={16} color="#fff" />
            </View>
            <Text style={styles.legendText}>Start Point</Text>
          </View>
          
          <View style={styles.legendItem}>
            <View style={styles.markerExample}>
              <Ionicons name="flag" size={16} color="#fff" />
            </View>
            <Text style={styles.legendText}>End Point</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trail Lines</Text>
          
          <View style={styles.legendItem}>
            <View style={styles.solidLine} />
            <Text style={styles.legendText}>Selected Trail</Text>
          </View>
          
          <View style={styles.legendItem}>
            <View style={styles.dashedLine} />
            <Text style={styles.legendText}>Other Trails</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: 200,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  content: {
    overflow: 'hidden',
  },
  section: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  markerExample: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#e1e5e9',
    marginHorizontal: 12,
  },
  solidLine: {
    width: 24,
    height: 3,
    backgroundColor: '#007AFF',
    borderRadius: 1.5,
    marginRight: 8,
  },
  dashedLine: {
    width: 24,
    height: 3,
    backgroundColor: '#007AFF',
    borderRadius: 1.5,
    marginRight: 8,
    opacity: 0.6,
  },
});