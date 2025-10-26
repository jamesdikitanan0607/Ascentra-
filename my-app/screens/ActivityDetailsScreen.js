import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, StatusBar, TouchableOpacity, Platform, Image, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { supabase } from '../services/supabaseClient';

export default function ActivityDetailsScreen({ route, navigation }) {
  const { post, postId, activity, activityId } = route.params || {};
  const initial = post || activity || null;
  const [data, setData] = useState(initial); // { id, title, content, created_at, user_id, profiles?, media? }
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState(null);
  const mediaList = data?.media || [];
  const flatRef = useRef(null);
  const SCREEN_WIDTH = Dimensions.get('window').width;

  useEffect(() => {
    if (initial) return; // already have full data
    let cancelled = false;
    async function fetchPost() {
      try {
        setLoading(true);
        setError(null);
        const id = (route.params?.post?.id) || postId || (route.params?.activity?.id) || activityId;
        if (!id) {
          throw new Error('Missing activity id');
        }
        console.info('Activity load start:', id);
        // Try forum_posts then fallback to activities
        const { data: postRow, error: postErr } = await supabase
          .from('forum_posts')
          .select('id, title, content, created_at, user_id')
          .eq('id', id)
          .single();

        let postData = postRow;
        if (postErr && postErr.code === 'PGRST205') {
          // Fall back to activities
          const { data: actRow, error: actErr } = await supabase
            .from('activities')
            .select('id, title, content, created_at, user_id')
            .eq('id', id)
            .single();
          if (!actErr) postData = actRow;
        }

        if (!postData) {
          throw new Error('Post not found');
        }

        // Profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', postData.user_id)
          .single();

        // Media (forum_posts only)
        let media = [];
        if (!postErr || postErr?.code !== 'PGRST205') {
          const { data: mediaRows } = await supabase
            .from('forum_post_media')
            .select('id, media_url, media_type, thumbnail_url')
            .eq('post_id', postData.id);
          media = mediaRows || [];
        }

        if (!cancelled) {
          console.info('Activity loaded:', postData.id);
          setData({ ...postData, profiles: profile || null, media });
        }
      } catch (e) {
        console.error('Activity load error:', e);
        if (!cancelled) {
          setError(e);
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    const anyId = (route.params?.post?.id) || postId || (route.params?.activity?.id) || activityId;
    if (anyId) fetchPost();
    return () => {
      cancelled = true;
    };
  }, [post, postId, activity, activityId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading…</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={[styles.content, { alignItems: 'center', paddingTop: 40 }] }>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading post…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
          <Text style={{ marginTop: 12, color: '#6B7280' }}>{String(error?.message || 'Failed to load post')}</Text>
          <TouchableOpacity onPress={() => {
            setError(null);
            setLoading(true);
            // trigger effect by updating a dummy state: rely on params dependency
            setTimeout(() => setLoading(false), 0);
          }} style={{ marginTop: 16, backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}>
            <Text style={{ color: '#FFF', fontWeight: '700' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: 24 }} />
      </View>
      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {data ? (
          <>
            {/* Media carousel (images/videos) */}
            {mediaList.length > 0 && (
              <FlatList
                ref={flatRef}
                data={mediaList}
                keyExtractor={(m) => String(m.id || m.media_url)}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={{ width: SCREEN_WIDTH, height: 300, backgroundColor: '#E5E7EB' }}>
                    {item.media_type === 'video' ? (
                      <Video
                        source={{ uri: item.media_url }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="contain"
                        useNativeControls
                      />
                    ) : (
                      <Image source={{ uri: item.media_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    )}
                  </View>
                )}
              />
            )}

            {/* Title and caption */}
            {!!data.title && <Text style={styles.title}>{data.title}</Text>}
            {!!data.content && <Text style={styles.caption}>{data.content}</Text>}

            {/* User row */}
            <View style={styles.userRow}>
              <Image
                source={{ uri: data.profiles?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp' }}
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.username}>{data.profiles?.username || 'User'}</Text>
                <Text style={styles.dateText}>{new Date(data.created_at).toLocaleString()}</Text>
              </View>
            </View>

            {/* Bottom actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="heart-outline" size={22} color="#2563EB" />
                <Text style={styles.actionText}>Like</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color="#2563EB" />
                <Text style={styles.actionText}>Comment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="share-social-outline" size={22} color="#2563EB" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.notFound}>
            <Ionicons name="alert-circle-outline" size={60} color="#2563EB" />
            <Text style={styles.notFoundText}>Post not found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 50 : 10,
    paddingBottom: 16,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  content: { paddingBottom: 24 },

  title: { fontSize: 22, fontWeight: '800', color: '#111827', paddingHorizontal: 16, paddingTop: 16 },
  caption: { fontSize: 15, color: '#111827', paddingHorizontal: 16, paddingTop: 8, lineHeight: 22 },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  avatar: { width: 42, height: 42, borderRadius: 21, marginRight: 10, backgroundColor: '#E5E7EB' },
  username: { fontWeight: '700', color: '#111827' },
  dateText: { fontSize: 12, color: '#6B7280' },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionText: { color: '#2563EB', fontWeight: '600' },

  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  notFoundText: { fontSize: 18, color: '#6B7280', marginTop: 16 },
});