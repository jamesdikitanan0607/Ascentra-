import React, { useState, useRef } from 'react';
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
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { renderContentWithMentions } from '../src/hooks/useMentions';
import { supabase } from '../services/supabaseClient';

// Note: expo-av is deprecated in SDK 54+, using basic video support
// For full video support, consider using expo-video package

const { width, height } = Dimensions.get('window');
const SUPABASE_URL = 'https://tppimfexrhptzdxlxcbj.supabase.co';
const getAbsoluteUrl = (url) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `${SUPABASE_URL}/${url.startsWith('/') ? url.substring(1) : url}`;
};

// Helper function to normalize different media formats
const normalizeMediaArray = (mediaArray) => {
  if (!Array.isArray(mediaArray)) return [];
  
  return mediaArray
    .map((item, index) => {
      if (typeof item === 'string') {
        return { 
          id: `string-${index}`, 
          url: getAbsoluteUrl(item), 
          type: 'image' 
        };
      }
      
      if (item && typeof item === 'object') {
        const url = getAbsoluteUrl(item.url || item.media_url);
        if (!url) return null;
        
        return {
          id: item.id || `object-${index}`,
          url: url,
          type: item.type || item.media_type || 'image',
          thumbnail_url: getAbsoluteUrl(item.thumbnail_url)
        };
      }
      
      return null;
    })
    .filter(Boolean);
};

export default function MediaViewerScreen({ route, navigation }) {
  // Safely extract params with defaults
  const params = route?.params || {};
  const { 
    mediaItems = [], 
    media = [], 
    initialIndex = 0, 
    post = null 
  } = params;
  
  // State management
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [resolvedSources, setResolvedSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);
  const hasResolvedRef = useRef(false);
  
  // Debug logging
  React.useEffect(() => {
    console.log('[MediaViewerScreen] Received params:', {
      mediaItemsCount: Array.isArray(mediaItems) ? mediaItems.length : 0,
      mediaCount: Array.isArray(media) ? media.length : 0,
      postMediaCount: Array.isArray(post?.media) ? post.media.length : 0,
      postId: post?.id,
      initialIndex,
      mediaItems,
      media,
      postMedia: post?.media
    });
  }, []);

  // Hide status bar when component mounts
  React.useEffect(() => {
    StatusBar.setHidden(true);
    return () => StatusBar.setHidden(false);
  }, []);

  // Handle initial scroll to the correct index when media is loaded
  React.useEffect(() => {
    if (resolvedSources.length > 0 && initialIndex > 0 && flatListRef.current) {
      setTimeout(() => {
        try {
          flatListRef.current?.scrollToIndex({ 
            index: Math.min(initialIndex, resolvedSources.length - 1), 
            animated: false 
          });
        } catch (error) {
          console.warn('[MediaViewerScreen] Failed to scroll to initial index:', error);
        }
      }, 100);
    }
  }, [resolvedSources.length, initialIndex]);

  // Resolve media sources with comprehensive fallback strategy
  React.useEffect(() => {
    // Prevent infinite loops by checking if we've already resolved
    if (hasResolvedRef.current) {
      return;
    }
    
    let isMounted = true;
    
    const resolveMedia = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('[MediaViewerScreen] Starting media resolution...');
        
        // Strategy 1: Use directly passed mediaItems
        if (Array.isArray(mediaItems) && mediaItems.length > 0) {
          const normalized = normalizeMediaArray(mediaItems);
          if (normalized.length > 0) {
            if (isMounted) {
              setResolvedSources(normalized);
              setLoading(false);
              console.log('[MediaViewerScreen] ✅ Using mediaItems:', normalized);
              return;
            }
          }
        }
        
        // Strategy 2: Use media parameter
        if (Array.isArray(media) && media.length > 0) {
          const normalized = normalizeMediaArray(media);
          if (normalized.length > 0) {
            if (isMounted) {
              setResolvedSources(normalized);
              setLoading(false);
              console.log('[MediaViewerScreen] ✅ Using media param:', normalized);
              return;
            }
          }
        }
        
        // Strategy 3: Use post.media
        if (post?.media && Array.isArray(post.media) && post.media.length > 0) {
          const normalized = normalizeMediaArray(post.media);
          if (normalized.length > 0) {
            if (isMounted) {
              setResolvedSources(normalized);
              setLoading(false);
              console.log('[MediaViewerScreen] ✅ Using post.media:', normalized);
              return;
            }
          }
        }
        
        // Strategy 4: Query database by post ID
        if (post?.id) {
          console.log('[MediaViewerScreen] 🔍 Querying database for post:', post.id);
          
          const { data, error } = await supabase
            .from('forum_post_media')
            .select('id, media_url, media_type, thumbnail_url')
            .eq('post_id', post.id);
          
          if (error) {
            console.warn('[MediaViewerScreen] ⚠️ Database query error:', error);
            throw new Error(`Database error: ${error.message}`);
          }
          
          if (data && data.length > 0) {
            const dbMedia = data.map(m => ({
              id: m.id,
              url: getAbsoluteUrl(m.media_url),
              type: m.media_type || 'image',
              thumbnail_url: getAbsoluteUrl(m.thumbnail_url)
            }));
            
            if (isMounted) {
              setResolvedSources(dbMedia);
              setLoading(false);
              console.log('[MediaViewerScreen] ✅ Loaded from database:', dbMedia);
              return;
            }
          }
        }
        
        // No media found anywhere
        if (isMounted) {
          setResolvedSources([]);
          setLoading(false);
          console.log('[MediaViewerScreen] ℹ️ No media found - this is normal for text-only posts');
        }
        
      } catch (err) {
        console.error('[MediaViewerScreen] ❌ Error resolving media:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load media');
          setResolvedSources([]);
          setLoading(false);
        }
      } finally {
        // Mark as resolved to prevent re-runs
        hasResolvedRef.current = true;
      }
    };
    
    resolveMedia();
    return () => { isMounted = false; };
  }, []); // Empty dependency array - only run once on mount


  // Handle FlatList scroll to update active index
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < resolvedSources.length) {
      setActiveIndex(newIndex);
    }
  };

  // Render individual media item for FlatList
  const renderMediaItem = ({ item, index }) => {
    const url = item?.url;
    const type = item?.type || 'image';
    
    if (!url) {
      return (
        <View style={styles.slideContainer}>
          <View style={styles.errorContainer}>
            <Ionicons name="image-outline" size={48} color="#666" />
            <Text style={styles.errorText}>Invalid media</Text>
          </View>
        </View>
      );
    }

    // For videos, show a placeholder with play button (since expo-av is deprecated)
    if (type === 'video') {
      return (
        <View style={styles.slideContainer}>
          <TouchableOpacity 
            style={styles.videoPlaceholder}
            onPress={() => {
              Alert.alert(
                'Video Playback',
                'Video playback requires expo-video package for SDK 54+. Opening in browser...',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Open', onPress: () => {
                    // You can implement video opening logic here
                    console.log('Opening video:', url);
                  }}
                ]
              );
            }}
          >
            <Image
              source={{ uri: item.thumbnail_url || url }}
              style={styles.media}
              resizeMode="contain"
            />
            <View style={styles.videoOverlay}>
              <Ionicons name="play-circle" size={64} color="rgba(255,255,255,0.9)" />
              <Text style={styles.videoText}>Tap to play video</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    // Render image
    return (
      <View style={styles.slideContainer}>
        <Image
          source={{ uri: url }}
          style={styles.media}
          resizeMode="contain"
          onError={(error) => {
            console.error('[MediaViewerScreen] Image load error:', error.nativeEvent?.error);
          }}
          onLoad={() => {
            console.log('[MediaViewerScreen] ✅ Image loaded successfully:', url);
          }}
          onLoadStart={() => {
            console.log('[MediaViewerScreen] 🔄 Loading image:', url);
          }}
        />
      </View>
    );
  };

  // Get item layout for FlatList optimization
  const getItemLayout = (data, index) => ({
    length: width,
    offset: width * index,
    index,
  });

  const onPressSpot = (spotId) => {
    navigation.navigate('HikingSpotLandingPage', { hiking_spot_id: String(spotId) });
  };

  const onShare = async () => {
    try {
      const url = resolvedSources?.[activeIndex]?.url;
      await Share.share({ message: post?.title || 'Check this out!', url });
    } catch {}
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Media Display */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Loading media...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>Failed to load media</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              // Trigger re-resolution by updating a dependency
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : resolvedSources.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={resolvedSources}
          renderItem={renderMediaItem}
          keyExtractor={(item, index) => item.id || `media-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          getItemLayout={getItemLayout}
          initialScrollIndex={resolvedSources.length > 0 ? Math.min(Math.max(0, initialIndex), resolvedSources.length - 1) : 0}
          onScrollToIndexFailed={(info) => {
            console.warn('[MediaViewerScreen] Scroll to index failed:', info);
            // Fallback to scroll to beginning
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ index: 0, animated: false });
            }, 100);
          }}
        />
      ) : (
        <View style={styles.noMediaContainer}>
          <Ionicons name="image-outline" size={64} color="#666" />
          <Text style={styles.noMediaText}>No media in this post</Text>
          <Text style={styles.noMediaSubtext}>
            This post contains only text content
          </Text>
          {__DEV__ && (
            <Text style={styles.debugText}>
              Debug: mediaItems={Array.isArray(mediaItems) ? mediaItems.length : 'null'}, 
              media={Array.isArray(media) ? media.length : 'null'}, 
              post.media={Array.isArray(post?.media) ? post.media.length : 'null'}
            </Text>
          )}
        </View>
      )}

      {/* Pagination */}
      {resolvedSources && resolvedSources.length > 1 && (
        <View style={styles.pagination}>
          {resolvedSources.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeIndex ? styles.paginationDotActive : {}
              ]}
            />
          ))}
        </View>
      )}



      {/* Bottom overlay: title, caption, actions */}
      {post && (
        <View style={styles.bottomOverlay}>
          {!!post.title && (
            <Text style={styles.titleText} numberOfLines={2}>
              {renderContentWithMentions(post.title, onPressSpot, { style: styles.titleText })}
            </Text>
          )}
          {!!post.content && (
            <Text style={styles.captionText} numberOfLines={3}>
              {renderContentWithMentions(post.content, onPressSpot, { style: styles.captionText })}
            </Text>
          )}
          <View style={styles.actionRow}>
            <View style={styles.actionLeft}>
              <View style={styles.actionBtn}>
                <Ionicons name="heart-outline" size={18} color="#FFF" />
                <Text style={styles.actionLabel}>{post.likeCount || 0}</Text>
              </View>
              <View style={styles.actionBtn}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFF" />
                <Text style={styles.actionLabel}>{post.commentCount || 0}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
              <Ionicons name="share-social-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slideContainer: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: width,
    height: height * 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 8,
  },
  
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 16,
  },
  
  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  errorSubtext: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // No media states
  noMediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noMediaText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  noMediaSubtext: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  debugText: {
    color: '#666',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'monospace',
  },
  
  // Video-specific styles
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  videoText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  
  // Pagination
  pagination: {
    position: 'absolute',
    bottom: 120,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#FFF',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  
  // Bottom overlay
  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  titleText: { 
    color: '#FFF', 
    fontWeight: '700', 
    fontSize: 16,
    marginBottom: 4,
  },
  captionText: { 
    color: '#EEE', 
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 12,
  },
  actionLeft: { 
    flexDirection: 'row', 
    gap: 16,
  },
  actionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6,
  },
  actionLabel: { 
    color: '#FFF', 
    fontWeight: '600',
    fontSize: 14,
  },
  shareBtn: { 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20,
  },
});