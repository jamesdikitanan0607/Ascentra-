import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabaseClient';
import { Video } from 'expo-av';
import { useUserProfile, seedUserProfilesCache } from '../hooks/useUserProfile';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';

// Palette
const COLORS = {
  bg: '#F9FAFB', // gray background
  text: '#111827', // charcoal text
  subtext: '#6B7280', // gray-500
  primary: '#2563EB', // Trust Blue
  green: '#2F855A', // nature green accent
  card: '#FFFFFF',
  divider: '#E5E7EB',
};

// Storage bucket used elsewhere in the app; not needed directly here but
// we keep naming consistent for future media processing.
const SUPABASE_BUCKET = 'activities';

export default function ForumPage() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { profile: currentProfile } = useProfile();

  // Filters and UI
  const [spots, setSpots] = useState([]); // [{id, name, cover_image_url}]
  const [spotSearch, setSpotSearch] = useState('');
  const [selectedSpot, setSelectedSpot] = useState(null); // {id,name}
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tab, setTab] = useState('public'); // 'public' | 'private'

  // Data
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSpots();
  }, []);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSpot, tab]);

  async function loadSpots() {
    try {
      const { data, error } = await supabase
        .from('hiking_spots')
        .select('id, name, cover_image_url')
        .order('name', { ascending: true });
      if (!error) setSpots(data || []);
    } catch (_) {}
  }

  async function fetchPosts() {
    try {
      setLoading(true);

      // Attempt forum_posts first
      let query = supabase
        .from('forum_posts')
        .select('id, content, title, created_at, user_id, tags')
        .order('created_at', { ascending: false });

      if (selectedSpot?.id) {
        // tags contains selected spot id
        query = query.contains('tags', [selectedSpot.id]);
      }

      let { data: postsData, error: postsError } = await query;

      let usingActivities = false;
      if (postsError && postsError.code === 'PGRST205') {
        // Table missing — fall back to activities
        usingActivities = true;
        let acts = supabase
          .from('activities')
          .select('id, content, title, created_at, user_id, tagged_spots')
          .order('created_at', { ascending: false });
        if (selectedSpot?.id) {
          acts = acts.contains('tagged_spots', [String(selectedSpot.id)]);
        }
        const { data: actsData, error: actsErr } = await acts;
        if (actsErr) throw actsErr;
        postsData = (actsData || []).map(p => ({
          ...p,
          // normalize to forum fields for renderer
          tags: (p.tagged_spots || []).map(s => Number(s)).filter(Boolean),
        }));
      } else if (postsError) {
        throw postsError;
      }

      // Filter out any test posts (e.g., seeded or QA-only content)
      const filteredPosts = (postsData || []).filter(p => !((p.title || '').toLowerCase().includes('test post')));

      // Profiles
      const userIds = [...new Set(filteredPosts.map(p => p.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
      const profilesMap = Object.fromEntries(
        (profilesData || []).map(p => [p.id, p])
      );
      seedUserProfilesCache(profilesData || []);

      // Media for forum_posts only
      let mediaByPost = {};
      if (!usingActivities && filteredPosts.length) {
        const { data: mediaData } = await supabase
          .from('forum_post_media')
          .select('id, post_id, media_url, media_type, thumbnail_url')
          .in('post_id', filteredPosts.map(p => p.id));
        (mediaData || []).forEach(m => {
          mediaByPost[m.post_id] = mediaByPost[m.post_id] || [];
          mediaByPost[m.post_id].push(m);
        });
      }

      // Attach data
      const enriched = filteredPosts.map(p => ({
        ...p,
        profiles: profilesMap[p.user_id] || null,
        media: mediaByPost[p.id] || [],
      }));

      setPosts(enriched);
    } catch (e) {
      // Could log with a logger util if present
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    fetchPosts();
  }

  const filteredSpots = useMemo(() => {
    const q = spotSearch.trim().toLowerCase();
    if (!q) return spots;
    return spots.filter(s => s.name.toLowerCase().includes(q));
  }, [spotSearch, spots]);

  function openPost(post) {
    const media = Array.isArray(post?.media) ? post.media : [];
    navigation.navigate('MediaViewer', { mediaItems: media, initialIndex: 0, post });
  }

  const spotById = useMemo(() => Object.fromEntries(spots.map(s => [s.id, s])), [spots]);

  function PostCard({ item }) {
    const isPublic = (item.visibility || 'public') === 'public';
    const borderColor = isPublic ? COLORS.green : COLORS.divider;

    const media = item.media && item.media.length > 0 ? item.media[0] : null;

    const { displayName, avatarUrl, loading: profileLoading } = useUserProfile(
      item.user_id,
    );
    const isOwn = !!user?.id && item.user_id === user.id;
    const avatarSrc = isOwn && currentProfile?.avatar_url
      ? `${currentProfile.avatar_url}?t=${currentProfile?.updated_at || ''}`
      : (avatarUrl || 'https://www.gravatar.com/avatar/?d=mp');

    return (
      <TouchableOpacity
        onPress={() => openPost(item)}
        activeOpacity={0.85}
        style={[styles.card, { borderLeftColor: borderColor }]}
      >
        <View style={styles.cardHeader}>
          <Image
            source={{ uri: avatarSrc }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.username}>
              {profileLoading ? 'Hiker' : displayName}
            </Text>
            <Text style={styles.metaText}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
          {isPublic ? (
            <Ionicons name="leaf-outline" size={18} color={COLORS.green} />
          ) : (
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.subtext} />
          )}
        </View>

        {/* Spot tag chips (first tag only for preview) */}
        {!!(item.tags && item.tags.length > 0) && (
          <View style={styles.tagsRow}>
            <View style={styles.tagChip}>
              <Ionicons name="pricetag-outline" size={14} color={COLORS.green} />
              <Text style={styles.tagText}>{spotById[item.tags[0]]?.name || `Spot #${item.tags[0]}`}</Text>
            </View>
          </View>
        )}

        {/* Media preview */}
        {media && (
          <View style={styles.mediaPreview}>
            {media.media_type === 'video' ? (
              <View style={styles.videoPreview}>
                <Image
                  source={{ uri: media.thumbnail_url || 'https://via.placeholder.com/600x320?text=Video' }}
                  style={styles.mediaImage}
                />
                <View style={styles.playOverlay}>
                  <Ionicons name="play-circle" size={48} color="#FFF" />
                </View>
              </View>
            ) : (
              <Image source={{ uri: media.media_url }} style={styles.mediaImage} />
            )}
          </View>
        )}

        {/* Text content */}
        {!!item.title && <Text style={styles.cardTitle}>{item.title}</Text>}
        {!!item.content && (
          <Text style={styles.cardContent} numberOfLines={3}>
            {item.content}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Forum Page</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('Posts') /* existing composer */}>
          <Ionicons name="add-circle" size={22} color="#FFF" />
          <Text style={styles.createBtnText}>Create Post</Text>
        </TouchableOpacity>
      </View>

      {/* Filter bar: Spot dropdown and Public/Private tabs */}
      <View style={styles.filterBar}>
        {/* Spot dropdown */}
        <View style={styles.dropdown}>
          <TouchableOpacity style={styles.dropdownToggle} onPress={() => setDropdownOpen(x => !x)}>
            <Ionicons name="map-outline" size={18} color={COLORS.green} />
            <Text style={styles.dropdownText}>{selectedSpot?.name || 'Select Hiking Spot'}</Text>
            <Ionicons name={dropdownOpen ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.subtext} />
          </TouchableOpacity>
          {dropdownOpen && (
            <View style={styles.dropdownPanel}>
              <TextInput
                value={spotSearch}
                onChangeText={setSpotSearch}
                placeholder="Search spots"
                placeholderTextColor={COLORS.subtext}
                style={styles.searchInput}
              />
              <ScrollView style={{ maxHeight: 260 }}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedSpot(null);
                    setDropdownOpen(false);
                  }}
                >
                  <Ionicons name="leaf-outline" size={18} color={COLORS.green} />
                  <Text style={styles.dropdownItemText}>All Spots</Text>
                </TouchableOpacity>
                {filteredSpots.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedSpot(s);
                      setDropdownOpen(false);
                    }}
                  >
                    <Image
                      source={{ uri: s.cover_image_url || 'https://via.placeholder.com/40x40?text=+' }}
                      style={styles.dropdownThumb}
                    />
                    <Text style={styles.dropdownItemText}>{s.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setTab('public')}
            style={[styles.tabBtn, tab === 'public' && styles.tabBtnActive]}
          >
            <Ionicons name="leaf-outline" size={16} color={tab === 'public' ? COLORS.card : COLORS.subtext} />
            <Text style={[styles.tabText, tab === 'public' && styles.tabTextActive]}>Public</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab('private')}
            style={[styles.tabBtn, tab === 'private' && styles.tabBtnActive]}
          >
            <Ionicons name="lock-closed-outline" size={16} color={tab === 'private' ? COLORS.card : COLORS.subtext} />
            <Text style={[styles.tabText, tab === 'private' && styles.tabTextActive]}>Private</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Divider label per view for clarity */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{tab === 'public' ? 'Public Posts' : 'Private Discussions'}</Text>
      </View>

      {/* Posts list */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => <PostCard item={item} />}
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: COLORS.subtext }}>No posts found for the selected filters.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 14 : 8,
    paddingBottom: 12,
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  createBtnText: { marginLeft: 6, color: '#FFF', fontWeight: '600' },

  filterBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: COLORS.bg,
  },
  dropdown: { flex: 1, position: 'relative' },
  dropdownToggle: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownText: { color: COLORS.text, fontSize: 14, flex: 1 },
  dropdownPanel: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
    padding: 10,
    zIndex: 50,
  },
  searchInput: {
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
  },
  dropdownItemText: { marginLeft: 8, color: COLORS.text },
  dropdownThumb: { width: 28, height: 28, borderRadius: 6, backgroundColor: COLORS.bg },

  tabs: { flexDirection: 'row', gap: 8 },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.card,
  },
  tabBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { color: COLORS.subtext, fontWeight: '600' },
  tabTextActive: { color: COLORS.card },

  sectionHeader: { paddingHorizontal: 16, paddingVertical: 8 },
  sectionTitle: { color: COLORS.subtext, fontWeight: '700', fontSize: 12, letterSpacing: 0.5 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.green,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bg },
  username: { fontWeight: '700', color: COLORS.text },
  metaText: { fontSize: 12, color: COLORS.subtext },

  tagsRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: { color: COLORS.text, fontSize: 12 },

  mediaPreview: { borderRadius: 12, overflow: 'hidden', marginBottom: 10, backgroundColor: COLORS.bg },
  mediaImage: { width: '100%', height: 200 },
  videoPreview: { position: 'relative' },
  playOverlay: { position: 'absolute', top: '40%', left: '45%' },

  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  cardContent: { color: COLORS.text, lineHeight: 20 },
});
