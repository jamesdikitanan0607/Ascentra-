import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, Platform, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import PostComposer from '../components/forum/PostComposer';
import PostCard from '../components/forum/PostCard';
import CommentList from '../components/forum/CommentList';
import { usePosts } from '../hooks/usePosts';
import { usePostInteractions } from '../hooks/usePostInteractions';
import { SortOption } from '../types/forum';
import { supabase } from '../../services/supabaseClient';
import { findSpotById } from '../data/hikingSpotsAdapter';
import NotificationsDropdown from '../components/notifications/NotificationsDropdown';
import NotificationBell from '../components/notifications/NotificationBell';
import { fetchUnreadCount, subscribeToNotifications } from '../../services/notificationsService';

const ForumPage: React.FC = () => {
  const navigation: any = useNavigation();
  const [spotFilter, setSpotFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const headerAnim = useRef(new Animated.Value(0)).current;

  const { posts, loading, refreshing, hasMore, refresh, loadMore, setPosts } = usePosts({ spotFilter, sortBy });
  const { toggleLike, deletePost } = usePostInteractions();
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data?.user?.id || null;
      setCurrentUserId(uid);
      if (uid) {
        try {
          const count = await fetchUnreadCount(uid);
          setUnreadCount(count);
        } catch {}
      }
    });
    
    // Animate header on mount
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    const unsub = subscribeToNotifications(currentUserId, () => {
      setUnreadCount((c) => c + 1);
    });
    return () => { try { unsub(); } catch {} };
  }, [currentUserId]);

  // Realtime post interaction counters (likes/comments)
  useEffect(() => {
    let uid: string | null = null;
    supabase.auth.getUser().then(({ data }) => { uid = data?.user?.id || null; }).catch(() => {});
    const channel = supabase
      .channel('forumpage-post-interactions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forum_likes' }, (payload) => {
        const row: any = payload?.new || {};
        const pid = row.forum_post_id || row.post_id;
        if (!pid) return;
        if (uid && row.user_id === uid) return;
        setPosts(prev => (prev || []).map((p: any) => p.id === pid ? { ...p, likeCount: (p.likeCount || 0) + 1 } : p));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'forum_likes' }, (payload) => {
        const row: any = payload?.old || {};
        const pid = row.forum_post_id || row.post_id;
        if (!pid) return;
        if (uid && row.user_id === uid) return;
        setPosts(prev => (prev || []).map((p: any) => p.id === pid ? { ...p, likeCount: Math.max(0, (p.likeCount || 0) - 1) } : p));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forum_comments' }, (payload) => {
        const row: any = payload?.new || {};
        const pid = row.forum_post_id || row.post_id;
        if (!pid) return;
        if (uid && row.user_id === uid) return;
        setPosts(prev => (prev || []).map((p: any) => p.id === pid ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'forum_comments' }, (payload) => {
        const row: any = payload?.old || {};
        const pid = row.forum_post_id || row.post_id;
        if (!pid) return;
        if (uid && row.user_id === uid) return;
        setPosts(prev => (prev || []).map((p: any) => p.id === pid ? { ...p, commentCount: Math.max(0, (p.commentCount || 0) - 1) } : p));
      })
      .subscribe();

    return () => { try { supabase.removeChannel(channel); } catch {} };
  }, [setPosts]);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  const handleNotificationClose = useCallback(() => {
    setShowNotifications(false);
  }, []);

  const onPressSpot = useCallback((spotId: string) => {
    const spot = findSpotById(spotId);
    if (!spot) {
      console.warn('Spot not found:', spotId);
      return;
    }
    const isSpartan = spot.id === '85' || spot.name?.toLowerCase?.().includes('spartan');
    if (isSpartan) {
      navigation.navigate('SpartanTrailScreen', { spotId: spot.id });
      return;
    }
    const isKanirag = spot.id === '72' || spot.name?.toLowerCase?.().includes('kan-irag');
    if (isKanirag) {
      navigation.navigate('MountKanirag');
      return;
    }
    navigation.navigate('HikingSpotLandingPage', { hiking_spot_id: spot.id });
  }, [navigation]);

  const onOpenPost = useCallback((post: any) => {
    const media = Array.isArray(post?.media) ? post.media : [];
    try { console.log('[ForumPage] onOpenPost', { postId: post?.id, mediaCount: media.length, first: media[0] }); } catch {}
    navigation.navigate('MediaViewer', { mediaItems: media, initialIndex: 0, post });
  }, [navigation]);

  const filteredPosts = useMemo(() => {
    return (posts || []).filter((p: any) => {
      const title = String(p?.title ?? '').trim();
      const content = String(p?.content ?? '').trim();
      const isTestPost = title === 'Test Post' && content === 'This is a test post.';
      return !isTestPost;
    });
  }, [posts]);

  const renderItem = useCallback(({ item }: any) => (
    <View>
      <PostCard
        item={item}
        onOpenPost={onOpenPost}
        onOpenComments={(p) => setExpandedComments(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
        onOpenMedia={(media, index) => {
          try { console.log('[ForumPage] onOpenMedia', { postId: item.id, count: (item.media || []).length, index, sample: (item.media || [])[index] }); } catch {}
          navigation.navigate('MediaViewer', { mediaItems: media, initialIndex: index, post: item });
        }}
        onPressSpot={onPressSpot}
        onToggleLike={(p) => toggleLike(p, (updater) => setPosts(prev => updater(prev)))}
        onDelete={(p) => {
          // simple confirm
          // Use dynamic import of Alert to keep imports minimal
          const { Alert } = require('react-native');
          Alert.alert('Delete post?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deletePost(p, (updater) => setPosts(prev => updater(prev))) },
          ]);
        }}
        currentUserId={currentUserId}
      />
      {expandedComments[item.id] && (
        <CommentList postId={item.id} onCountChange={(c) => setPosts(prev => prev.map(p => p.id === item.id ? { ...p, commentCount: c } : p))} />
      )}
    </View>
  ), [currentUserId, deletePost, navigation, onOpenPost, onPressSpot, setPosts, toggleLike, expandedComments]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  const headerTranslateY = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.header,
          { 
            transform: [{ translateY: headerTranslateY }],
            opacity: headerAnim
          }
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Forum</Text>
          <View style={styles.headerActions}>
            <NotificationBell 
              count={unreadCount} 
              onPress={toggleNotifications} 
            />
          </View>
        </View>
        
        <View style={styles.sortRow}>
          <TouchableOpacity 
            onPress={() => setSortBy('newest')} 
            style={[styles.sortChip, sortBy === 'newest' && styles.sortChipActive]}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="time-outline" 
              size={16} 
              color={sortBy === 'newest' ? '#fff' : '#475569'} 
              style={styles.sortIcon} 
            />
            <Text style={[styles.sortText, sortBy === 'newest' && styles.sortTextActive]}>
              Newest
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setSortBy('most_liked')} 
            style={[styles.sortChip, sortBy === 'most_liked' && styles.sortChipActive]}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="heart-outline" 
              size={16} 
              color={sortBy === 'most_liked' ? '#fff' : '#475569'} 
              style={styles.sortIcon} 
            />
            <Text style={[styles.sortText, sortBy === 'most_liked' && styles.sortTextActive]}>
              Most Liked
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setSortBy('most_commented')} 
            style={[styles.sortChip, sortBy === 'most_commented' && styles.sortChipActive]}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="chatbubble-ellipses-outline" 
              size={16} 
              color={sortBy === 'most_commented' ? '#fff' : '#475569'} 
              style={styles.sortIcon} 
            />
            <Text style={[styles.sortText, sortBy === 'most_commented' && styles.sortTextActive]}>
              Most Commented
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <NotificationsDropdown 
        isVisible={showNotifications} 
        onClose={handleNotificationClose}
        onAnyRead={async () => {
          if (currentUserId) {
            try {
              const count = await fetchUnreadCount(currentUserId);
              setUnreadCount(count);
            } catch {}
          }
        }}
      />

      <FlatList
        ListHeaderComponent={<PostComposer onPosted={refresh} />}
        data={filteredPosts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReachedThreshold={0.4}
        onEndReached={() => { if (hasMore && !loading) loadMore(); }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={["#2E7D32"]} />}
        ListEmptyComponent={!loading ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Ionicons name="leaf-outline" size={32} color="#9CA3AF" />
            <Text style={{ color: '#6B7280', marginTop: 6 }}>No posts yet</Text>
          </View>
        ) : null}
        ListFooterComponent={loading && posts.length > 0 ? (
          <View style={{ padding: 16 }}>
            <ActivityIndicator color="#2E7D32" />
          </View>
        ) : <View style={{ height: 40 }} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FAFAF7',
  },
  header: { 
    paddingTop: Platform.OS === 'android' ? 14 : 8,
    paddingBottom: 12, 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: StyleSheet.hairlineWidth, 
    borderBottomColor: '#E6E8EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#1F2933',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortRow: { 
    flexDirection: 'row', 
    paddingHorizontal: 16,
    paddingBottom: 4,
    overflow: 'scroll',
  },
  sortChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#E6E8EB', 
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  sortChipActive: { 
    backgroundColor: '#2E7D32', 
    borderColor: '#2E7D32',
  },
  sortIcon: {
    marginRight: 2,
  },
  sortText: { 
    color: '#546E7A', 
    fontWeight: '600',
    fontSize: 13,
  },
  sortTextActive: { 
    color: '#FFFFFF',
  },
});

export default ForumPage;
