import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, Platform } from 'react-native';
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

const ForumPage: React.FC = () => {
  const navigation: any = useNavigation();
  const [spotFilter, setSpotFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const { posts, loading, refreshing, hasMore, refresh, loadMore, setPosts } = usePosts({ spotFilter, sortBy });
  const { toggleLike, deletePost } = usePostInteractions();
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data?.user?.id || null));
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Forum</Text>
        <View style={styles.sortRow}>
          <TouchableOpacity onPress={() => setSortBy('newest')} style={[styles.sortChip, sortBy === 'newest' && styles.sortChipActive]}>
            <Ionicons name="time-outline" size={14} color={sortBy === 'newest' ? '#fff' : '#475569'} />
            <Text style={[styles.sortText, sortBy === 'newest' && styles.sortTextActive]}>Newest</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortBy('most_liked')} style={[styles.sortChip, sortBy === 'most_liked' && styles.sortChipActive]}>
            <Ionicons name="heart-outline" size={14} color={sortBy === 'most_liked' ? '#fff' : '#475569'} />
            <Text style={[styles.sortText, sortBy === 'most_liked' && styles.sortTextActive]}>Most Liked</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortBy('most_commented')} style={[styles.sortChip, sortBy === 'most_commented' && styles.sortChipActive]}>
            <Ionicons name="chatbubble-ellipses-outline" size={14} color={sortBy === 'most_commented' ? '#fff' : '#475569'} />
            <Text style={[styles.sortText, sortBy === 'most_commented' && styles.sortTextActive]}>Most Commented</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ListHeaderComponent={<PostComposer onPosted={refresh} />}
        data={posts}
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
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 14 : 8, paddingBottom: 12, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  sortRow: { flexDirection: 'row', gap: 8 },
  sortChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  sortChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  sortText: { color: '#475569', fontWeight: '600' },
  sortTextActive: { color: '#fff' },
});

export default ForumPage;
