import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  StatusBar, 
  FlatList, 
  Text, 
  Share, 
  ActivityIndicator,
  Alert,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { renderContentWithMentions } from '../src/hooks/useMentions';
import { supabase } from '../services/supabaseClient';

const { width, height } = Dimensions.get('window');

// Helper function to normalize different media formats
const normalizeMediaArray = (mediaArray) => {
  if (!Array.isArray(mediaArray)) return [];
  
  return mediaArray
    .map((item, index) => {
      if (typeof item === 'string') {
        return { 
          id: `string-${index}`, 
          url: item, 
          type: 'image' 
        };
      }
      
      if (item && typeof item === 'object') {
        const url = item.url || item.media_url;
        if (!url) return null;
        
        return {
          id: item.id || `object-${index}`,
          url: url,
          type: item.type || item.media_type || 'image',
          thumbnail_url: item.thumbnail_url
        };
      }
      
      return null;
    })
    .filter(Boolean);
};

export default function OptimizedMediaViewerScreen({ route, navigation }) {
  const { media, mediaItems, post, initialIndex = 0 } = route.params || {};
  
  const [resolvedSources, setResolvedSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  
  const flatListRef = useRef(null);
  const hasResolvedRef = useRef(false);

  // Optimized media resolution with retry logic
  const resolveMediaSources = useCallback(async (forceRefresh = false) => {
    if (hasResolvedRef.current && !forceRefresh) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('[OptimizedMediaViewer] 🔍 Resolving media sources...');
      
      // Strategy 1: Use direct media parameter (highest priority)
      if (media && Array.isArray(media) && media.length > 0) {
        const normalized = normalizeMediaArray(media);
        if (normalized.length > 0) {
          setResolvedSources(normalized);
          setLoading(false);
          console.log('[OptimizedMediaViewer] ✅ Using direct media parameter:', normalized);
          return;
        }
      }
      
      // Strategy 2: Use mediaItems parameter
      if (mediaItems && Array.isArray(mediaItems) && mediaItems.length > 0) {
        const normalized = normalizeMediaArray(mediaItems);
        if (normalized.length > 0) {
          setResolvedSources(normalized);
          setLoading(false);
          console.log('[OptimizedMediaViewer] ✅ Using mediaItems parameter:', normalized);
          return;
        }
      }
      
      // Strategy 3: Use post.media
      if (post?.media && Array.isArray(post.media) && post.media.length > 0) {
        const normalized = normalizeMediaArray(post.media);
        if (normalized.length > 0) {
          setResolvedSources(normalized);
          setLoading(false);
          console.log('[OptimizedMediaViewer] ✅ Using post.media:', normalized);
          return;
        }
      }
      
      // Strategy 4: Query database by post ID with authentication check
      if (post?.id) {
        console.log('[OptimizedMediaViewer] 🔍 Querying database for post:', post.id);
        
        // Check authentication first
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error('Authentication required to view media');
        }
        
        const { data, error } = await supabase
          .from('forum_post_media')
          .select('id, media_url, media_type, thumbnail_url')
          .eq('post_id', post.id)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.warn('[OptimizedMediaViewer] ⚠️ Database query error:', error);
          
          // Handle specific RLS errors
          if (error.code === '42501') {
            throw new Error('You do not have permission to view this media');
          }
          
          throw new Error(`Database error: ${error.message}`);
        }
        
        if (data && data.length > 0) {
          const dbMedia = data.map(m => ({
            id: m.id,
            url: m.media_url,
            type: m.media_type || 'image',
            thumbnail_url: m.thumbnail_url
          }));
          
          setResolvedSources(dbMedia);
          setLoading(false);
          console.log('[OptimizedMediaViewer] ✅ Loaded from database:', dbMedia);
          return;
        }
      }
      
      // No media found
      setResolvedSources([]);
      setLoading(false);
      console.log('[OptimizedMediaViewer] ℹ️ No media found - this is normal for text-only posts');
      
    } catch (err) {
      console.error('[OptimizedMediaViewer] ❌ Error resolving media:', err);
      setError(err.message || 'Failed to load media');
      setResolvedSources([]);
      setLoading(false);
    } finally {
      hasResolvedRef.current = true;
    }
  }, [media, mediaItems, post]);

  // Initial load
  useEffect(() => {
    resolveMediaSources();
  }, [resolveMediaSources]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    hasResolvedRef.current = false;
    await resolveMediaSources(true);
    setRefreshing(false);
  }, [resolveMediaSources]);

  // Handle image load error with retry
  const handleImageError = useCallback((url, index) => {
    console.warn(`[OptimizedMediaViewer] Image load error for index ${index}:`, url);
    setImageLoadErrors(prev => ({
      ...prev,
      [index]: (prev[index] || 0) + 1
    }));
  }, []);

  // Retry loading an image
  const retryImage = useCallback((index) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [index]: 0
    }));
  }, []);

  // Handle FlatList scroll
  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };

  // Share functionality
  const handleShare = useCallback(async () => {
    if (resolvedSources.length === 0) return;
    
    const currentMedia = resolvedSources[currentIndex];
    if (!currentMedia) return;

    try {
      await Share.share({
        message: `Check out this ${currentMedia.type}!`,
        url: currentMedia.url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [resolvedSources, currentIndex]);
  // Handle hiking spot mention taps
  const onPressSpot = useCallback((spot) => {
    try {
      console.log('[OptimizedMediaViewer] onPressSpot', spot);
      let candidate = spot;
      if (spot && typeof spot === 'object') {
        candidate = spot.id ?? spot.hiking_spot_id ?? spot.spotId ?? spot.spot_id;
      }
      let normalizedId = null;
      if (typeof candidate === 'string') {
        const match = candidate.trim().match(/\d+/);
        const num = match ? parseInt(match[0], 10) : NaN;
        if (Number.isFinite(num) && num > 0) normalizedId = String(num);
      } else if (typeof candidate === 'number') {
        if (Number.isFinite(candidate) && candidate > 0) normalizedId = String(Math.trunc(candidate));
      }
      if (!normalizedId) {
        console.warn('[OptimizedMediaViewer] Invalid spot id', spot);
        Alert.alert('Invalid Hiking Spot', 'Unable to open the tagged hiking spot because the ID is invalid.');
        return;
      }
      if (normalizedId === '85') {
        console.log('[OptimizedMediaViewer] -> SpartanTrailScreen', normalizedId);
        navigation.navigate('SpartanTrailScreen', { spotId: normalizedId });
        return;
      }
      if (normalizedId === '72') {
        console.log('[OptimizedMediaViewer] -> MountKanirag');
        navigation.navigate('MountKanirag');
        return;
      }
      console.log('[OptimizedMediaViewer] -> HikingSpotLandingPage', normalizedId);
      navigation.navigate('HikingSpotLandingPage', { hiking_spot_id: normalizedId });
    } catch (e) {
      console.error('[OptimizedMediaViewer] onPressSpot error', e);
      Alert.alert('Error', 'Something went wrong while opening the hiking spot.');
    }
  }, [navigation]);

  // Render individual media item
  const renderMediaItem = useCallback(({ item, index }) => {
    const errorCount = imageLoadErrors[index] || 0;
    const maxRetries = 3;
    if (errorCount >= maxRetries) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="image-outline" size={64} color="#666" />
          <Text style={styles.errorText}>Failed to load image</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => retryImage(index)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.mediaContainer}>
        <Image
          source={{ uri: item.url }}
          style={styles.media}
          resizeMode="contain"
          onError={() => handleImageError(item.url, index)}
          onLoad={() => console.log(`[OptimizedMediaViewer] ✅ Image loaded: ${index}`)}
        />
        {errorCount > 0 && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Retrying... ({errorCount}/{maxRetries})</Text>
          </View>
        )}
      </View>
    );
  }, [imageLoadErrors, handleImageError, retryImage]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading media...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => onRefresh()}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No media state
  if (resolvedSources.length === 0) {
    return (
      <View style={styles.noMediaContainer}>
        <Ionicons name="images-outline" size={64} color="#666" />
        <Text style={styles.noMediaText}>No media to display</Text>
        <Text style={styles.noMediaSubtext}>This post doesn't contain any images or videos</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentIndex + 1} of {resolvedSources.length}
        </Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Media List */}
      <FlatList
        ref={flatListRef}
        data={resolvedSources}
        renderItem={renderMediaItem}
        keyExtractor={(item, index) => item.id || `media-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      />

      {/* Post info if available */}
      {post && (
        <View style={styles.postInfo}>
          <Text style={styles.postContent} numberOfLines={3}>
            {renderContentWithMentions(post.content || post.title || '', onPressSpot)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  noMediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mediaContainer: {
    width: width,
    height: height - 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: width,
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  noMediaText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  noMediaSubtext: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  postInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
  },
  postContent: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
});