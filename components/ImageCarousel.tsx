import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface ImageCarouselProps {
  images?: string[];
  height?: number;
  spotName?: string;
  customImages?: any[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  height = 300, 
  spotName,
  customImages
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;
    const pageNum = Math.floor(contentOffset.x / viewSize.width);
    setCurrentIndex(pageNum);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
  };

  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    goToSlide(newIndex);
  };

  if (!images || images.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.placeholderContainer}>
          <Ionicons name="image-outline" size={48} color="#CCCCCC" />
          <Text style={styles.placeholderText}>No images available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
      >
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image
              source={{ uri: image }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <TouchableOpacity
            style={[styles.navButton, styles.leftButton]}
            onPress={goToPrevious}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.rightButton]}
            onPress={goToNext}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </>
      )}

      {/* Pagination Indicators */}
      {images.length > 1 && (
        <View style={styles.paginationContainer}>
          {images.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.activePaginationDot,
              ]}
              onPress={() => goToSlide(index)}
              activeOpacity={0.7}
            />
          ))}
        </View>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {images.length}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screenWidth,
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
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
    left: 16,
  },
  rightButton: {
    right: 16,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activePaginationDot: {
    backgroundColor: '#FFFFFF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  counterContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ImageCarousel;