import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../../services/supabaseClient';
import { usePosts } from '../../hooks/usePosts';
import { usePostInteractions } from '../../hooks/usePostInteractions';
import PostCard from '../forum/PostCard';
import CommentList from '../forum/CommentList';
import { findSpotById } from '../../data/hikingSpotsAdapter';

interface Props {
  userId: string | null | undefined;
  isOwnProfile?: boolean;
  navigation: any;
}

const ProfilePostsFeed: React.FC<Props> = ({ userId, isOwnProfile, navigation }) => {
  const { posts, loading, refreshing, hasMore, refresh, loadMore, setPosts } = usePosts({ userId: userId || null });
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
    } else {
      navigation.navigate('HikingSpotLandingPage', { hiking_spot_id: spot.id });
    }
  }, [navigation]);

  const onOpenPost = useCallback((post: any) => {
    const media = Array.isArray(post?.media) ? post.media : [];
    navigation.navigate('MediaViewer', { mediaItems: media, initialIndex: 0, post });
  }, [navigation]);

  const renderItem = useCallback(({ item }: any) => (
    <View>
      <PostCard
        item={item}
        onOpenPost={onOpenPost}
        onOpenComments={(p) => setExpandedComments(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
        onOpenMedia={(media, index) => navigation.navigate('MediaViewer', { mediaItems: media, initialIndex: index, post: item })}
        onPressSpot={onPressSpot}
        onToggleLike={(p) => toggleLike(p, (updater) => setPosts(prev => updater(prev)))}
        onDelete={(p) => {
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

  if (!userId) return null;

  return (
    <FlatList
      data={posts}
      keyExtractor={(i) => i.id}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={["#2E7D32"]} />}
      onEndReachedThreshold={0.4}
      onEndReached={() => { if (hasMore && !loading) loadMore(); }}
      ListEmptyComponent={!loading ? (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Text style={{ color: '#6B7280' }}>No posts yet</Text>
        </View>
      ) : null}
      ListFooterComponent={loading && posts.length > 0 ? (
        <View style={{ padding: 16 }}>
          <ActivityIndicator color="#2E7D32" />
        </View>
      ) : <View style={{ height: 40 }} />}
    />
  );
};

export default ProfilePostsFeed;
