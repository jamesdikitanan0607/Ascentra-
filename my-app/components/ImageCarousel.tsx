import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Image, Dimensions, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getHikingSpotImages } from '../utils/imageHelpers';

interface ImageCarouselProps {
  spotName: string;
  customImages?: any[];
  height?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

const { width: screenWidth } = Dimensions.get('window');
const DEFAULT_HEIGHT = 250;

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  spotName,
  customImages,
  height = DEFAULT_HEIGHT,
  resizeMode = 'cover'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (customImages && customImages.length > 0) {
      setImages(customImages);
    } else {
      const spotImages = getHikingSpotImages(spotName);
      setImages(spotImages);
    }
  }, [spotName, customImages]);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;
    const pageNum = Math.floor(contentOffset.x / viewSize.width);
    setCurrentIndex(pageNum);
  };

  const goToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    goToSlide(prevIndex);
  };

  const goToNext = () => {
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    goToSlide(nextIndex);
  };

  if (!images || images.length === 0) return null;

  return (
    <View style={[styles.container, { height }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        style={[styles.scrollView, { height }]}
      >
        {images.map((image, index) => (
          <View key={index} style={[styles.imageContainer, { height }]}>
            <Image
              source={typeof image === 'string' ? { uri: image } : image}
              style={styles.image}
              resizeMode={resizeMode}
            />
          </View>
        ))}
      </ScrollView>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <TouchableOpacity
            style={[styles.navButton, styles.leftButton]}
            onPress={goToPrevious}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Previous image"
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.rightButton]}
            onPress={goToNext}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Next image"
          >
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        </>
      )}

      {/* Pagination dots */}
      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dot, index === currentIndex ? styles.activeDot : styles.inactiveDot]}
              onPress={() => goToSlide(index)}
              accessibilityRole="button"
              accessibilityLabel={`Go to image ${index + 1}`}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Height is set via prop
    position: 'relative',
  },
  scrollView: {
    // Height is set via prop
  },
  imageContainer: {
    width: screenWidth,
    // Height is set via prop
  },
  image: {
    width: '100%',
    height: '100%',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  leftButton: {
    left: 10,
  },
  rightButton: {
    right: 10,
  },
  pagination: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});

export default ImageCarousel;