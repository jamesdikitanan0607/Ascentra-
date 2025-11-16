import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { supabase } from '../services/supabaseClient';
import { logInfo, logError, logApiCall } from '../utils/logger';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { Video } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Share } from 'react-native';
import MentionSpotDropdown from '../components/MentionSpotDropdown';
import { debounce } from '../utils/debounce';
import { insertMentionAtCursor, computeMentionQuery } from '../utils/mentions';
import { SUPABASE_BUCKET } from '../config/storage';

// Supabase Storage bucket imported from centralized config

export default function PostsScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  // Title and @-mention tagging state
  const [titleText, setTitleText] = useState('');
  const [spotSuggestions, setSpotSuggestions] = useState([]);
  const [mentionedSpots, setMentionedSpots] = useState([]); // [{id, name}]
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState([]); // [{id, username}]
  const [mentionFollowers, setMentionFollowers] = useState(false);
  const [mentionHighlight, setMentionHighlight] = useState(false);
  const mentionDebounceRef = useRef(null);
  const [titleSelection, setTitleSelection] = useState({ start: 0, end: 0 });
  const [mentionQuery, setMentionQuery] = useState('');

  // Visibility
  const [visibility, setVisibility] = useState('public'); // 'public' | 'private'

  useEffect(() => {
    getUser();
    checkTablesExist();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
    }, [user])
  );

  // Realtime updates for likes and comments
  useEffect(() => {
    let currentUserId = null;
    supabase.auth.getUser().then(({ data }) => { currentUserId = data?.user?.id || null; }).catch(() => {});
    const channel = supabase
      .channel('realtime-post-interactions')
      // Forum likes: handle both forum_post_id and legacy post_id
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forum_likes' }, (payload) => {
        const row = payload?.new || {};
        const pid = row.forum_post_id || row.post_id;
        if (!pid) return;
        if (currentUserId && row.user_id === currentUserId) return; // ignore own optimistic update
        setPosts(prev => prev.map(p => p.id === pid ? { ...p, likeCount: (p.likeCount || 0) + 1 } : p));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'forum_likes' }, (payload) => {
        const row = payload?.old || {};
        const pid = row.forum_post_id || row.post_id;
        if (!pid) return;
        if (currentUserId && row.user_id === currentUserId) return; // ignore own optimistic update
        setPosts(prev => prev.map(p => p.id === pid ? { ...p, likeCount: Math.max(0, (p.likeCount || 0) - 1) } : p));
      })
      // Forum comments: handle both forum_post_id and legacy post_id
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'forum_comments' }, (payload) => {
        const row = payload?.new || {};
        const pid = row.forum_post_id || row.post_id;
        if (!pid) return;
        if (currentUserId && row.user_id === currentUserId) return; // ignore own optimistic update
        setPosts(prev => prev.map(p => p.id === pid ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'forum_comments' }, (payload) => {
        const row = payload?.old || {};
        const pid = row.forum_post_id || row.post_id;
        if (!pid) return;
        if (currentUserId && row.user_id === currentUserId) return; // ignore own optimistic update
        setPosts(prev => prev.map(p => p.id === pid ? { ...p, commentCount: Math.max(0, (p.commentCount || 0) - 1) } : p));
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, []);

  async function getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  async function fetchPosts() {
    setRefreshing(true);
    try {
      // Try forum_posts first (legacy). If table is missing, fall back to activities.
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select('id, content, title, created_at, user_id, tags')
        .order('created_at', { ascending: false });

      if (postsError && postsError.code === 'PGRST205') {
        // Fallback: use activities as the source of posts
        const { data: acts, error: actsErr } = await supabase
          .from('activities')
          .select('id, content, title, created_at, user_id, tagged_spots')
          .order('created_at', { ascending: false });

        if (actsErr) {
          logError('Error fetching activities as fallback:', actsErr);
          Alert.alert('Error', 'Failed to load posts');
          return;
        }

        const userIds = [...new Set((acts || []).map(p => p.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);
        const profilesMap = {};
        (profilesData || []).forEach(p => { profilesMap[p.id] = p; });

        // Resolve hiking spot tags
        const allSpotIdsStr = Array.from(new Set((acts || []).flatMap(p => Array.isArray(p.tagged_spots) ? p.tagged_spots : []))).filter(Boolean);
        const allSpotIdsNum = allSpotIdsStr.map(s => {
          const n = Number(s);
          return Number.isNaN(n) ? null : n;
        }).filter(v => v !== null);
        let spotsMap = {};
        if (allSpotIdsNum.length > 0) {
          const { data: spots } = await supabase
            .from('hiking_spots')
            .select('id, name')
            .in('id', allSpotIdsNum);
          (spots || []).forEach(s => { spotsMap[s.id] = s; });
        }

        const composedFromActivities = (acts || []).map(p => ({
          ...p,
          // Normalize fields expected by renderer
          tags: [],
          media: [],
          likeCount: 0,
          commentCount: 0,
          isLiked: false,
          profiles: profilesMap[p.user_id] || { username: 'Unnamed User', avatar_url: null },
          spotTags: (Array.isArray(p.tagged_spots) ? p.tagged_spots : [])
            .map(idStr => spotsMap[Number(idStr)])
            .filter(Boolean),
        }));

        setPosts(composedFromActivities);
        return;
      } else if (postsError) {
        logError('Error fetching forum posts:', postsError);
        Alert.alert('Error', 'Failed to load forum posts');
        return;
      }

      const postIds = postsData.map(p => p.id);
      const userIds = [...new Set(postsData.map(p => p.user_id))];

      // Fetch media for posts
      const { data: mediaData } = await supabase
        .from('forum_post_media')
        .select('id, post_id, media_url, media_type, thumbnail_url')
        .in('post_id', postIds);

      const mediaByPost = {};
      (mediaData || []).forEach(m => {
        if (!mediaByPost[m.post_id]) mediaByPost[m.post_id] = [];
        mediaByPost[m.post_id].push(m);
      });

      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
      const profilesMap = {};
      (profilesData || []).forEach(p => { profilesMap[p.id] = p; });

      // Likes
      const { data: likesData } = await supabase
        .from('forum_likes')
        .select('forum_post_id, id')
        .in('forum_post_id', postIds);
      const likeCounts = {};
      (likesData || []).forEach(l => { likeCounts[l.forum_post_id] = (likeCounts[l.forum_post_id] || 0) + 1; });

      // User liked posts
      let likedMap = {};
      const { data: auth } = await supabase.auth.getUser();
      const currentUser = auth?.user || null;
      setUser(currentUser);
      if (currentUser) {
        const { data: userLikes } = await supabase
          .from('forum_likes')
          .select('forum_post_id')
          .eq('user_id', currentUser.id)
          .in('forum_post_id', postIds);
        (userLikes || []).forEach(ul => { likedMap[ul.forum_post_id] = true; });
      }

      // Comments count
      const { data: commentData } = await supabase
        .from('forum_comments')
        .select('forum_post_id, id')
        .in('forum_post_id', postIds);
      const commentCounts = {};
      (commentData || []).forEach(c => { commentCounts[c.forum_post_id] = (commentCounts[c.forum_post_id] || 0) + 1; });

      // Resolve hiking spot tags
      const allSpotIds = Array.from(new Set(postsData.flatMap(p => Array.isArray(p.tags) ? p.tags : []))).filter(Boolean);
      let spotsMap = {};
      if (allSpotIds.length > 0) {
        const { data: spots } = await supabase
          .from('hiking_spots')
          .select('id, name')
          .in('id', allSpotIds);
        (spots || []).forEach(s => { spotsMap[s.id] = s; });
      }

      // Compose posts with normalized media
      const composed = postsData.map(p => ({
        ...p,
        profiles: profilesMap[p.user_id] || { username: 'Unnamed User', avatar_url: null },
        media: (mediaByPost[p.id] || []).map(m => ({
          id: m.id,
          url: m.media_url,
          type: m.media_type,
          thumbnail_url: m.thumbnail_url,
        })),
        likeCount: likeCounts[p.id] || 0,
        commentCount: commentCounts[p.id] || 0,
        isLiked: !!likedMap[p.id],
        spotTags: (Array.isArray(p.tags) ? p.tags : []).map(id => spotsMap[id]).filter(Boolean),
      }));

      setPosts(composed);
    } catch (err) {
      logError('Unexpected error:', err);
    } finally {
      setRefreshing(false);
    }
  }

  async function checkTablesExist() {
    try {
      logInfo('Checking if tables and buckets exist...');
      // ... (rest of the function remains the same)
    } catch (error) {
      logError('Error checking tables and buckets:', error);
    }
  }

  async function pickMedia(mediaType = 'all') {
    try {
      // Request media library permission where required
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photos to attach images or videos to your post.'
        );
        return;
      }

      // Configure picker options
      const MT = ImagePicker.MediaType;
      const mediaTypes =
        mediaType === 'image'
          ? (MT ? MT.Images : 'images')
          : mediaType === 'video'
          ? (MT ? MT.Videos : 'videos')
          : (MT ? [MT.Images, MT.Videos] : undefined);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing: false,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 20, // best-effort, may be ignored by some pickers
      });

      if (result.canceled) return;

      const picked = (result.assets || []).map((a) => ({
        uri: a.uri,
        type: a.type === 'video' ? 'video' : 'image',
      }));

      if (picked.length === 0) return;

      setSelectedMedia((prev) => [...prev, ...picked]);
    } catch (e) {
      logError('pickMedia error:', e);
      Alert.alert('Error', 'Unable to open your gallery. Please try again.');
    }
  }

  async function uploadMedia(mediaFiles) {
    try {
      logInfo('Starting media upload process...');
      const bucketName = SUPABASE_BUCKET;
      logInfo(`Using bucket: ${bucketName}`);
      const uploadPromises = mediaFiles.map(async (media, index) => {
        logInfo(`Processing media file ${index + 1}/${mediaFiles.length}, type: ${media.type}`);
        const isVideo = media.type === 'video';
        const folderPath = isVideo ? 'videos' : 'images';

        // Ensure we have a file:// URI we can read
        let sourceUri = media.uri;
        if (sourceUri.startsWith('content://')) {
          const tmpName = `upload-${Date.now()}-${index}`;
          const tmpExt = isVideo ? 'mp4' : 'jpg';
          const destUri = `${FileSystem.cacheDirectory}${tmpName}.${tmpExt}`;
          await FileSystem.copyAsync({ from: sourceUri, to: destUri });
          sourceUri = destUri;
        }

        // Determine extension and content type
        const uriExt = (sourceUri.split('.').pop() || '').toLowerCase();
        let extension = isVideo ? 'mp4' : (['jpg','jpeg','png','webp','heic','heif'].includes(uriExt) ? uriExt : 'jpg');
        let contentType = isVideo ? 'video/mp4' : (extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg');

        const filePath = `${folderPath}/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
        logInfo(`Uploading to ${bucketName}/${filePath}`);
        const base64 = await FileSystem.readAsStringAsync(sourceUri, {
          encoding: 'base64',
        });
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, decode(base64), { contentType });
        if (error) {
          logError(`Upload error for file ${index + 1} (check if bucket exists: ${bucketName}):`, error?.message || error);
          throw error;
        }
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
        const publicUrl = urlData?.publicUrl;
        logInfo(`Successfully uploaded file ${index + 1}, URL: ${publicUrl}`);
        return {
          url: publicUrl,
          type: media.type
        };
      });
      const results = await Promise.all(uploadPromises);
      logInfo(`Successfully uploaded ${results.length} files`);
      return results;
    } catch (error) {
      logError('Error in uploadMedia function:', error);
      throw error;
    }
  }

  async function createPost() {
    if (!titleText.trim() && !newPostText.trim() && selectedMedia.length === 0) {
      Alert.alert('Empty Post', 'Please add some text or media to create a post');
      return;
    }
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to create a post');
      return;
    }
    setIsPosting(true);
    try {
      let mediaUrls = [];
      if (selectedMedia.length > 0) {
        try {
          logInfo(`Uploading ${selectedMedia.length} media files...`);
          mediaUrls = await uploadMedia(selectedMedia);
          logInfo(`Successfully uploaded ${mediaUrls.length} files`);
        } catch (uploadError) {
          logError('Media upload failed:', uploadError);
          Alert.alert(
            'Upload Error', 
            'Failed to upload media. Please try again later or check your internet connection.'
          );
          setIsPosting(false);
          return;
        }
      }
      // Insert forum post with hiking spot tags (store spot IDs in tags array)
      let insertedPost = null;
      let createdViaActivities = false;
      const { data: forumInsert, error: insertError } = await supabase
        .from('forum_posts')
        .insert([
          {
            user_id: user.id,
            title: (titleText || newPostText).trim().substring(0, 100) || 'Forum Post',
            content: newPostText.trim(),
            tags: mentionedSpots.map(s => s.id),
          },
        ])
        .select('id')
        .single();

      if (insertError && insertError.code === 'PGRST205') {
        // forum_posts table missing: fall back to activities only
        try {
          const tagged = mentionedSpots.map((s) => String(s.id));
          await supabase.from('activities').insert([
            {
              user_id: user.id,
              title: (titleText || newPostText).trim().substring(0, 100) || 'Forum Post',
              content: newPostText.trim(),
              tagged_spots: tagged,
              likes: 0,
              comments: 0,
            },
          ]);
          createdViaActivities = true;
        } catch (activityInsertError) {
          logError('Activities insert error on fallback:', activityInsertError);
          throw activityInsertError;
        }
      } else if (insertError) {
        logError('Database insert error:', insertError);
        throw insertError;
      } else {
        insertedPost = forumInsert;
        // Also insert a corresponding activity record for Profile feed
        try {
          const tagged = mentionedSpots.map((s) => String(s.id));
          await supabase
            .from('activities')
            .insert([
              {
                user_id: user.id,
                title: (titleText || newPostText).trim().substring(0, 100) || 'Forum Post',
                content: newPostText.trim(),
                tagged_spots: tagged,
                likes: 0,
                comments: 0,
              },
            ]);
        } catch (activityInsertError) {
          logError('Activities insert error (non-fatal):', activityInsertError);
          // Continue even if activities insert fails
        }
      }

      if (mediaUrls.length > 0 && insertedPost && insertedPost.id) {
        // Insert media references for this post
        const mediaRows = mediaUrls.map(m => ({
          post_id: insertedPost.id,
          media_url: m.url,
          media_type: m.type,
        }));
        const { error: mediaRefError } = await supabase
          .from('forum_post_media')
          .insert(mediaRows);
        if (mediaRefError) {
          logError('Error inserting media refs:', mediaRefError);
        }
      }

      Alert.alert('Success', 'Your post has been created!');
      setTitleText('');
      setNewPostText('');
      setSelectedMedia([]);
      setMentionedSpots([]);
      fetchPosts();
    } catch (error) {
      logError('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again later.');
    } finally {
      setIsPosting(false);
    }
  }

  async function toggleLike(postId, isLiked) {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to like posts');
      return;
    }
    try {
      const currentPost = posts.find(post => post.id === postId);
      if (!currentPost) return;
      if (currentPost.likeInProgress) return;
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, likeInProgress: true };
        }
        return post;
      }));
      if (isLiked) {
        const { error } = await supabase
          .from('forum_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('forum_post_id', postId);
        if (error) throw error;
      } else {
        const { data: existingLike } = await supabase
          .from('forum_likes')
          .select('*')
          .eq('user_id', user.id)
          .eq('forum_post_id', postId)
          .single();
        if (!existingLike) {
          const { error } = await supabase
            .from('forum_likes')
            .insert([{ user_id: user.id, forum_post_id: postId }]);
          if (error) throw error;
        }
      }
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likeCount: isLiked ? Math.max(0, post.likeCount - 1) : post.likeCount + 1,
            isLiked: !isLiked,
            likeInProgress: false
          };
        }
        return post;
      }));
    } catch (error) {
      logError('Error toggling like:', error);
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, likeInProgress: false };
        }
        return post;
      }));
    }
  }

  function navigateToComments(postId) {
    navigation.navigate('Comments', { postId });
  }

  async function loadSpotSuggestions(text) {
    if (!text || text.length < 1) {
      setSpotSuggestions([]);
      return;
    }
    try {
      // Special tokens
      const specials = [
        { id: '__followers', name: 'followers', type: 'special' },
        { id: '__highlight', name: 'highlight', type: 'special' },
      ].filter(t => t.name.toLowerCase().includes(text.toLowerCase()));

      // Friends/users
      const { data: users } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${text}%`)
        .limit(8);
      const userItems = (users || []).map(u => ({ id: u.id, username: u.username, avatar_url: u.avatar_url, type: 'user' }));

      // Hiking spots
      const { data: spots } = await supabase
        .from('hiking_spots')
        .select('id, name, cover_image_url, image_url')
        .ilike('name', `%${text}%`)
        .limit(10);
      const spotItems = (spots || []).map(s => ({ ...s, type: 'spot' }));

      setSpotSuggestions([...
        specials,
        ...userItems,
        ...spotItems,
      ]);
    } catch (e) {
      // ignore
    }
  }

  function navigateToProfile(userId) {
    navigation.navigate('Profile', { userId });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <LinearGradient
          colors={['#2C5F2D', '#3A7F40']}
          style={styles.headerGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Trails & Adventures</Text>
            <Ionicons name="leaf" size={18} color="rgba(255,255,255,0.7)" style={styles.headerIcon} />
          </View>
          <TouchableOpacity style={styles.headerRight}>
            <Ionicons name="search-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
      </View>
      <ScrollView
        nestedScrollEnabled={true}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchPosts} />
        }
      >
        <View style={styles.createPostContainer}>
          {/* Visibility selector */}
          <View style={styles.visibilityRow}>
            <TouchableOpacity
              style={[styles.visibilityChip, visibility === 'public' && styles.visibilityChipActive]}
              onPress={() => setVisibility('public')}
            >
              <Ionicons name="globe-outline" size={16} color={visibility === 'public' ? '#155E75' : '#555'} />
              <Text style={[styles.visibilityText, visibility === 'public' && styles.visibilityTextActive]}>Public</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.visibilityChip, visibility === 'private' && styles.visibilityChipActive]}
              onPress={() => setVisibility('private')}
            >
              <Ionicons name="lock-closed-outline" size={16} color={visibility === 'private' ? '#155E75' : '#555'} />
              <Text style={[styles.visibilityText, visibility === 'private' && styles.visibilityTextActive]}>Private</Text>
            </TouchableOpacity>
          </View>

          {/* Title with @-mention support */}
          <View style={{ position: 'relative' }}>
            <TextInput
              style={styles.titleInput}
              placeholder="Title your activity… Use @ to tag a hiking spot"
              placeholderTextColor="#7F9C8F"
              value={titleText}
              onSelectionChange={(e) => setTitleSelection(e.nativeEvent.selection)}
              selection={titleSelection}
              onChangeText={(text) => {
                setTitleText(text);
                const selStart = titleSelection?.start ?? text.length;
                const { hasTrigger, query } = computeMentionQuery(text, selStart);
                if (mentionDebounceRef.current) clearTimeout(mentionDebounceRef.current);
                mentionDebounceRef.current = setTimeout(() => {
                  setMentionQuery(query);
                }, 200);
                setShowMentionDropdown(!!hasTrigger);
              }}
            />
            <MentionSpotDropdown
              visible={showMentionDropdown}
              query={mentionQuery}
              onSelect={(spot) => {
                const selStart = titleSelection?.start ?? titleText.length;
                const { newText, newPos } = insertMentionAtCursor(titleText, selStart, `@${spot.name} `);
                setTitleText(newText);
                setTitleSelection({ start: newPos, end: newPos });
                if (!mentionedSpots.find((m) => m.id === spot.id)) {
                  setMentionedSpots([...mentionedSpots, { id: spot.id, name: spot.name }]);
                }
                console.info('Inserted mention:', spot.id, spot.name);
                setShowMentionDropdown(false);
              }}
            />
          </View>

          {/* Post content */}
          <TextInput
            style={styles.postInput}
            placeholder="Share details about your adventure…"
            placeholderTextColor="#A0A0A0"
            multiline={true}
            value={newPostText}
            onChangeText={setNewPostText}
          />
          
          {/* Tagging moved into title via @-mentions */}
          {selectedMedia.length > 0 && (
            <View style={styles.mediaPreviewContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mediaPreviewScrollContent}
              >
                {selectedMedia.map((media, index) => (
                  <View key={index} style={styles.mediaPreviewWrapper}>
                    {media.type === 'video' ? (
                      <View style={styles.mediaPreviewVideoContainer}>
                        <Video
                          source={{ uri: media.uri }}
                          style={styles.mediaPreview}
                          resizeMode="cover"
                          shouldPlay={false}
                          isLooping={false}
                          usePoster={true}
                        />
                        <View style={styles.mediaTypeIndicator}>
                          <Ionicons name="videocam" size={14} color="#FFFFFF" />
                        </View>
                      </View>
                    ) : (
                      <Image source={{ uri: media.uri }} style={styles.mediaPreview} />
                    )}
                    <TouchableOpacity 
                      style={styles.removeMediaButton}
                      onPress={() => {
                        setSelectedMedia(prevMedia => prevMedia.filter((_, i) => i !== index));
                      }}
                    >
                      <Ionicons name="close-circle-sharp" size={22} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
          <View style={styles.postActionBar}>
            <View style={styles.mediaButtons}>
              <TouchableOpacity style={styles.addMediaButton} onPress={() => pickMedia('image')}>
                <Ionicons name="image-outline" size={20} color="#4A6572" />
                <Text style={styles.addMediaText}>Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addMediaButton} onPress={() => pickMedia('video')}>
                <Ionicons name="videocam-outline" size={20} color="#4A6572" />
                <Text style={styles.addMediaText}>Video</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addMediaButton} onPress={() => pickMedia('all')}>
                <Ionicons name="images-outline" size={20} color="#4A6572" />
                <Text style={styles.addMediaText}>Gallery</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.postButton, (!newPostText.trim() && selectedMedia.length === 0) && styles.postButtonDisabled]}
              onPress={createPost}
              disabled={isPosting || (!newPostText.trim() && selectedMedia.length === 0)}
            >
              {isPosting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.postButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        {posts.map(post => (
          <View key={post.id} style={styles.postCard}>
            <TouchableOpacity 
              style={styles.postHeader}
              onPress={() => navigateToProfile(post.user_id)}
            >
              <Image 
                source={{ 
                  uri: post.profiles?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp' 
                }} 
                style={styles.avatar} 
              />
              <View>
                <Text style={styles.username}>{post.profiles?.username || 'Unnamed User'}</Text>
                <Text style={styles.timestamp}>
                  {new Date(post.created_at).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
            {post.content && (
              <Text style={styles.postContent}>{post.content}</Text>
            )}
            
            {post.spotTags && post.spotTags.length > 0 && (
              <View style={styles.tagChipsRow}>
                {post.spotTags.map(spot => (
                  <TouchableOpacity
                    key={spot.id}
                    style={styles.tagChip}
                    onPress={() => navigation.navigate('HikingSpotLandingPage', { hiking_spot_id: String(spot.id) })}
                  >
                    <Ionicons name="pricetag" size={14} color="#2F855A" />
                    <Text style={styles.tagChipText}>{spot.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {(post.media || post.media_urls) && (
              <View style={styles.postMediaContainer}>
                {(() => {
                  const mediaArray = post.media || post.media_urls || [];
                  if (!mediaArray || mediaArray.length === 0) return null;
                  if (mediaArray.length === 1) {
                    const media = mediaArray[0];
                    return media.type === 'video' ? (
                      <View style={styles.videoWrapper}>
                        <Video
                          source={{ uri: media.url }}
                          style={styles.singlePostMedia}
                          useNativeControls
                          resizeMode="contain"
                          isLooping
                          shouldPlay={false}
                          usePoster={true}
                        />
                        <View style={styles.singleVideoIndicator}>
                          <Ionicons name="play-circle" size={40} color="#fff" />
                        </View>
                      </View>
                    ) : (
                      <Image 
                        source={{ uri: media.url }} 
                        style={styles.singlePostMedia} 
                        resizeMode="cover"
                      />
                    );
                  }
                  if (mediaArray.length === 2) {
                    return (
                      <View style={styles.mediaGrid}>
                        {mediaArray.map((media, index) => (
                          <TouchableOpacity 
                            key={index} 
                            style={styles.gridItemHalf}
                            onPress={() => navigation.navigate('MediaViewer', { media: mediaArray, initialIndex: index })}
                          >
                            {media.type === 'video' ? (
                              <View style={styles.videoContainer}>
                                <Image 
                                  source={{ uri: media.url }} 
                                  style={styles.gridMedia} 
                                />
                                <View style={styles.videoIndicator}>
                                  <Ionicons name="play-circle" size={28} color="#fff" />
                                </View>
                              </View>
                            ) : (
                              <Image 
                                source={{ uri: media.url }} 
                                style={styles.gridMedia} 
                              />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    );
                  }
                  if (mediaArray.length === 3) {
                    return (
                      <View style={styles.mediaGridThree}>
                        <TouchableOpacity 
                          style={styles.gridItemLarge}
                          onPress={() => navigation.navigate('MediaViewer', { media: mediaArray, initialIndex: 0 })}
                        >
                          {mediaArray[0].type === 'video' ? (
                            <View style={styles.videoContainer}>
                              <Image source={{ uri: mediaArray[0].url }} style={styles.gridMedia} />
                              <View style={styles.videoIndicator}>
                                <Ionicons name="play-circle" size={28} color="#fff" />
                              </View>
                            </View>
                          ) : (
                            <Image source={{ uri: mediaArray[0].url }} style={styles.gridMedia} />
                          )}
                        </TouchableOpacity>
                        <View style={styles.gridItemStackContainer}>
                          {mediaArray.slice(1, 3).map((media, index) => (
                            <TouchableOpacity 
                              key={index} 
                              style={styles.gridItemStack}
                              onPress={() => navigation.navigate('MediaViewer', { media: mediaArray, initialIndex: index + 1 })}
                            >
                              {media.type === 'video' ? (
                                <View style={styles.videoContainer}>
                                  <Image source={{ uri: media.url }} style={styles.gridMedia} />
                                  <View style={styles.videoIndicator}>
                                    <Ionicons name="play-circle" size={22} color="#fff" />
                                  </View>
                                </View>
                              ) : (
                                <Image source={{ uri: media.url }} style={styles.gridMedia} />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    );
                  }
                  return (
                    <View style={styles.mediaGridFour}>
                      {mediaArray.slice(0, 4).map((media, index) => (
                        <TouchableOpacity 
                          key={index} 
                          style={styles.gridItemQuarter}
                          onPress={() => navigation.navigate('MediaViewer', { media: mediaArray, initialIndex: index })}
                        >
                          {media.type === 'video' ? (
                            <View style={styles.videoContainer}>
                              <Image source={{ uri: media.url }} style={styles.gridMedia} />
                              <View style={styles.videoIndicator}>
                                <Ionicons name="play-circle" size={22} color="#fff" />
                              </View>
                            </View>
                          ) : (
                            <Image source={{ uri: media.url }} style={styles.gridMedia} />
                          )}
                          {mediaArray.length > 4 && index === 3 && (
                            <View style={styles.moreIndicator}>
                              <Text style={styles.moreIndicatorText}>+{mediaArray.length - 4}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  );
                })()}
              </View>
            )}
            <View style={styles.postStats}>
              <Text style={styles.statsText}>
                {post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'} • {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
              </Text>
            </View>
            <View style={styles.postActions}>
              <TouchableOpacity 
                style={[styles.actionButton, post.likeInProgress && styles.actionButtonDisabled]} 
                onPress={() => toggleLike(post.id, post.isLiked)}
                disabled={post.likeInProgress}
              >
                <Ionicons 
                  name={post.isLiked ? "heart" : "heart-outline"} 
                  size={20} 
                  color={post.isLiked ? "#E57373" : "#757575"} 
                />
                <Text style={[styles.actionText, post.isLiked && styles.likedText]}>Like</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigateToComments(post.id)}
              >
                <Ionicons name="chatbubble-outline" size={20} color="#757575" />
                <Text style={styles.actionText}>Comment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={async () => {
                  try {
                    await Share.share({
                      message: `Check out this Ascentra forum post: ${post.title || ''}\n${post.content || ''}`.trim(),
                    });
                  } catch (e) {}
                }}
              >
                <Ionicons name="share-social-outline" size={20} color="#757575" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {posts.length === 0 && !refreshing && (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="trail-sign-outline" size={56} color="#CFD8DC" />
            <Text style={styles.emptyStateText}>No posts yet</Text>
            <Text style={styles.emptyStateSubtext}>Be the first to share your hiking adventure!</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    overflow: 'hidden',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginBottom: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 50 : 12,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginRight: 10,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerIcon: {
    marginLeft: 6,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  createPostContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 6,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3A5A40', // Medium forest green accent
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  titleInput: {
    minHeight: 44,
    fontSize: 16,
    color: '#1F2937',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#F0F7F4',
    borderRadius: 8,
    marginBottom: 10,
  },
  postInput: {
    minHeight: 85,
    fontSize: 16,
    color: '#37474F',
    textAlignVertical: 'top',
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  taggingContainer: {
    marginTop: 10,
  },
  tagInput: {
    marginTop: 8,
    backgroundColor: '#F0F7F4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#2C5F2D',
  },
  suggestionsBox: {
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E5E0',
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F1',
  },
  suggestionThumb: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#E5E7EB',
  },
  suggestionText: {
    marginLeft: 8,
    color: '#1F2937',
    fontSize: 14,
  },
  selectedChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    color: '#2F855A',
    marginRight: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  mediaPreviewContainer: {
    marginTop: 12,
    marginBottom: 6,
  },
  mediaPreviewScrollContent: {
    paddingRight: 6,
  },
  mediaPreviewWrapper: {
    position: 'relative',
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E5E0',
  },
  mediaPreviewVideoContainer: {
    position: 'relative',
  },
  mediaPreview: {
    width: 110,
    height: 110,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  mediaTypeIndicator: {
    position: 'absolute',
    bottom: 6, 
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    padding: 3,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 2,
  },
  postActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E5E0',
  },
  mediaButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  addMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#F0F4F0',
  },
  addMediaText: {
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '500',
    color: '#2C5F2D', // Dark forest green
  },
  postButton: {
    backgroundColor: '#4A7C59', // Medium forest green
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#A3B18A', // Light forest green
    opacity: 0.7,
  },
  postButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
    borderTopWidth: 3,
    borderTopColor: '#3A5A40', // Medium forest green
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FCFCFC',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#4A7C59', // Medium forest green
  },
  username: {
    fontWeight: '600',
    fontSize: 16,
    color: '#263238',
  },
  timestamp: {
    fontSize: 12,
    color: '#78909C',
    marginTop: 2,
  },
  postContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    fontSize: 15,
    color: '#37474F',
    lineHeight: 22,
  },
  postMediaContainer: {
    width: '100%', 
  },
  singlePostMedia: {
    width: '100%',
    height: 320,
    resizeMode: 'cover',
  },
  videoWrapper: {
    position: 'relative',
  },
  singleVideoIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    zIndex: 1,
  },
  mediaGrid: {
    flexDirection: 'row',
    width: '100%',
    height: 300,
  },
  gridItemHalf: {
    width: '50%',
    height: '100%',
    borderWidth: 1,
    borderColor: '#fff',
  },
  mediaGridThree: {
    flexDirection: 'row',
    width: '100%',
    height: 300,
  },
  gridItemLarge: {
    width: '66.66%',
    height: '100%',
    borderWidth: 1,
    borderColor: '#fff',
  },
  gridItemStackContainer: {
    width: '33.33%',
    height: '100%',
  },
  gridItemStack: {
    width: '100%',
    height: '50%',
    borderWidth: 1,
    borderColor: '#fff',
  },
  mediaGridFour: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: 300,
  },
  gridItemQuarter: {
    width: '50%',
    height: '50%',
    borderWidth: 1,
    borderColor: '#fff',
  },
  gridMedia: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -14 }, { translateY: -14 }],
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
  },
  moreIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIndicatorText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  postStats: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E5E0',
    backgroundColor: '#FCFCFC',
  },
  statsText: {
    fontSize: 13,
    color: '#4A7C59', // Medium forest green
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    padding: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 4,
    backgroundColor: '#F5F7F5',
    borderRadius: 8,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#4A7C59', // Medium forest green
  },
  likedText: {
    color: '#2C5F2D', // Dark forest green
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A7C59', // Medium forest green
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#90A4AE',
    textAlign: 'center',
    marginTop: 6,
  },
});