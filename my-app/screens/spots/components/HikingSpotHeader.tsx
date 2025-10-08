import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../styles/colors';
import { ImageCarousel } from '../../../components/ImageCarousel';

interface HikingSpotHeaderProps {
  name: string;
  rating?: number;
  location: string;
  images: string[];
  onBackPress: () => void;
}

export const HikingSpotHeader: React.FC<HikingSpotHeaderProps> = ({
  name,
  rating = 4.5,
  location,
  images = [],
  onBackPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Image Carousel */}
      <View style={styles.imageContainer}>
        <ImageCarousel images={images} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradientOverlay}
        />
        
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        {/* Header Content */}
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {name}
          </Text>
          
          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(rating) ? 'star' : 'star-outline'}
                  size={16}
                  color="#FFD700"
                />
              ))}
            </View>
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
          
          {/* Location */}
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="white" />
            <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
              {location}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 300,
    width: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    paddingBottom: 30,
    zIndex: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: 'white',
    marginLeft: 4,
    fontSize: 14,
    opacity: 0.9,
    maxWidth: '90%',
  },
});
