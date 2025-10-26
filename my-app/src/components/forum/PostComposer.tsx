import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../../services/supabaseClient';
import { SUPABASE_BUCKET } from '../../../config/storage';
import MentionDropdown from './MentionDropdown';
import { computeMentionQuery, insertMentionAtCursor, replaceNamesWithIds } from '../../hooks/useMentions';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  handleDatabaseError, 
  insertForumPostMediaWithErrorHandling,
  checkMediaInsertionPermission 
} from '../../../utils/databaseErrorHandler';
import { 
  uploadMediaFilesWithTransaction,
  validateMediaFiles 
} from '../../../services/mediaUploadService';

interface MediaItem {
  uri: string;
  type: 'image' | 'video';
}

interface Props {
  onPosted?: () => void;
}

const PostComposer: React.FC<Props> = ({ onPosted }) => {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [titleSel, setTitleSel] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const [captionSel, setCaptionSel] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const [activeField, setActiveField] = useState<'title' | 'caption' | null>(null);

  const [mentionQuery, setMentionQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSpots, setSelectedSpots] = useState<Array<{ id: string; name: string }>>([]);

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [posting, setPosting] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const onChangeTitle = (text: string) => {
    setTitle(text);
    const sel = titleSel?.start ?? text.length;
    const { hasTrigger, query } = computeMentionQuery(text, sel);
    setShowDropdown(hasTrigger && activeField === 'title');
    setMentionQuery(query);
  };

  const onChangeCaption = (text: string) => {
    setCaption(text);
    const sel = captionSel?.start ?? text.length;
    const { hasTrigger, query } = computeMentionQuery(text, sel);
    setShowDropdown(hasTrigger && activeField === 'caption');
    setMentionQuery(query);
  };

  const onSelectSpot = (spot: { id: string; name: string }) => {
    if (activeField === 'title') {
      const sel = titleSel?.start ?? title.length;
      const { newText, newPos } = insertMentionAtCursor(title, sel, `@${spot.name} `);
      setTitle(newText);
      setTitleSel({ start: newPos, end: newPos });
    } else if (activeField === 'caption') {
      const sel = captionSel?.start ?? caption.length;
      const { newText, newPos } = insertMentionAtCursor(caption, sel, `@${spot.name} `);
      setCaption(newText);
      setCaptionSel({ start: newPos, end: newPos });
    }
    if (!selectedSpots.find(s => s.id === spot.id)) {
      setSelectedSpots(prev => [...prev, { id: spot.id, name: spot.name }]);
    }
    setShowDropdown(false);
  };

  const pickMedia = async (kind: 'image' | 'video' | 'all' = 'all') => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Allow photo access to add media.');
      return;
    }
    const MT: any = (ImagePicker as any).MediaType;
    const mediaTypesParam: any = kind === 'image'
      ? (MT ? MT.IMAGE || MT.Images : 'images')
      : kind === 'video'
      ? (MT ? MT.VIDEO || MT.Videos : 'videos')
      : (MT ? [MT.IMAGE || MT.Images, MT.VIDEO || MT.Videos] : undefined);
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: mediaTypesParam, allowsEditing: false, allowsMultipleSelection: Platform.OS === 'ios', quality: 0.8 });
    if (result.canceled) return;
    const assets = result.assets || [];
    const valid: MediaItem[] = [];
    const MAX_BYTES = 15 * 1024 * 1024; // 15MB
    const allowedImg = ['jpg','jpeg','png','webp','heic','heif'];
    const allowedVid = ['mp4','mov','m4v'];
    for (const a of assets) {
      const info = await FileSystem.getInfoAsync(a.uri);
      if ((info as any)?.size && (info as any).size > MAX_BYTES) {
        Alert.alert('File too large', 'Please pick files up to 15MB.');
        continue;
      }
      const ext = (a.uri.split('.').pop() || '').toLowerCase();
      const isVid = a.type === 'video';
      if (isVid ? !allowedVid.includes(ext) : !allowedImg.includes(ext)) {
        Alert.alert('Unsupported file', 'Please pick a common image/video format.');
        continue;
      }
      valid.push({ uri: a.uri, type: isVid ? 'video' : 'image' });
    }
    const all = [...media, ...valid].slice(0, 5);
    setMedia(all);
  };

  const removeMediaAt = (idx: number) => setMedia(prev => prev.filter((_, i) => i !== idx));

  const uploadMedia = async (userId: string, items: MediaItem[]) => {
    const uploaded: Array<{ url: string; type: 'image' | 'video' }> = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      setUploadingIndex(i);
      let sourceUri = it.uri;
      if (sourceUri.startsWith('content://')) {
        const docDir = (FileSystem as any).documentDirectory ?? (FileSystem as any).cacheDirectory ?? '';
        const tmpBase = `${docDir}upload-cache/`;
        try { await FileSystem.makeDirectoryAsync(tmpBase, { intermediates: true }); } catch {}
        const tmp = `${tmpBase}upload-${Date.now()}-${i}.${it.type === 'video' ? 'mp4' : 'jpg'}`;
        await FileSystem.copyAsync({ from: sourceUri, to: tmp });
        sourceUri = tmp;
      }
      const extGuess = (sourceUri.split('.').pop() || '').toLowerCase();
      const ext = extGuess || (it.type === 'video' ? 'mp4' : 'jpg');
      const contentType = it.type === 'video' ? 'video/mp4' : (extGuess === 'png' ? 'image/png' : extGuess === 'webp' ? 'image/webp' : 'image/jpeg');
      const path = `${it.type === 'video' ? 'videos' : 'images'}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const base64 = await FileSystem.readAsStringAsync(sourceUri, { encoding: 'base64' });
      const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(path, decode(base64), { contentType });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
      uploaded.push({ url: urlData?.publicUrl || '', type: it.type });
    }
    setUploadingIndex(null);
    return uploaded;
  };

  const onPublish = async () => {
    if (!title.trim() && !caption.trim() && media.length === 0) {
      Alert.alert('Empty post', 'Add a title, caption, or media.');
      return;
    }

    // Validate media files before proceeding
    if (media.length > 0) {
      const validation = validateMediaFiles(media);
      if (!validation.isValid) {
        Alert.alert('Invalid Media', validation.errors.join('\n'));
        return;
      }
    }

    try {
      setPosting(true);
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        Alert.alert('Sign in required', 'Please log in to post.');
        setPosting(false);
        return;
      }

      const replacedTitle = replaceNamesWithIds(title, selectedSpots);
      const replacedCaption = replaceNamesWithIds(caption, selectedSpots);
      const tagIds = selectedSpots.map(s => Number(s.id)).filter(Boolean);

      const { data: fp, error: insertErr } = await supabase
        .from('forum_posts')
        .insert([{ 
          user_id: user.id, 
          title: (replacedTitle || replacedCaption).trim().slice(0, 100) || 'Post', 
          content: replacedCaption.trim(), 
          tags: tagIds.map(id => id.toString()) // Convert to string array
        }])
        .select('id')
        .single();

      let postId: string | null = null;
      let isActivities = false;
      if (insertErr && insertErr.code === 'PGRST205') {
        // fallback to activities only
        const { data: act, error: actErr } = await supabase
          .from('activities')
          .insert([{ user_id: user.id, title: (replacedTitle || replacedCaption).trim().slice(0, 100) || 'Post', content: replacedCaption.trim(), tagged_spots: selectedSpots.map(s => s.id) }])
          .select('id')
          .single();
        if (actErr) throw actErr;
        postId = act?.id || null;
        isActivities = true;
      } else if (insertErr) {
        const processedError = handleDatabaseError(insertErr, 'forum post creation');
        throw processedError;
      } else {
        postId = fp?.id;
      }

      if (media.length > 0 && postId && !isActivities) {
        try {
          // Use the enhanced media upload service
          await uploadMediaFilesWithTransaction(
            supabase,
            media,
            postId,
            user.id,
            (progress) => {
              // Progress updates could be shown in UI if needed
              console.log(`Upload progress: ${progress.current}/${progress.total} - ${progress.status}`);
            }
          );
        } catch (mErr) {
          const processedError = handleDatabaseError(mErr, 'forum post media insertion', {
            postId,
            userId: user.id,
            mediaCount: media.length,
          });
          
          console.warn('Media upload failed:', processedError);
          Alert.alert(
            'Media Upload Warning', 
            processedError.userMessage + '\n\nYour post was created, but media could not be attached.'
          );
        }
      }

      setTitle('');
      setCaption('');
      setSelectedSpots([]);
      setMedia([]);
      Alert.alert('Success', 'Post published');
      onPosted?.();
    } catch (e: any) {
      console.error(e);
      const processedError = handleDatabaseError(e, 'post creation');
      Alert.alert('Error', processedError.userMessage || e?.message || 'Failed to publish');
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Share an update</Text>

      <View style={{ position: 'relative' }}>
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          placeholderTextColor="#7F9C8F"
          value={title}
          onFocus={() => setActiveField('title')}
          onSelectionChange={e => setTitleSel(e.nativeEvent.selection)}
          onChangeText={onChangeTitle}
        />
        <MentionDropdown visible={showDropdown && activeField === 'title'} query={mentionQuery} onSelect={onSelectSpot} />
      </View>

      <View style={{ position: 'relative' }}>
        <TextInput
          style={styles.captionInput}
          placeholder="Share your latest hike… use @ to tag a hiking spot"
          placeholderTextColor="#A0A0A0"
          multiline
          value={caption}
          onFocus={() => setActiveField('caption')}
          onSelectionChange={e => setCaptionSel(e.nativeEvent.selection)}
          onChangeText={onChangeCaption}
        />
        <MentionDropdown visible={showDropdown && activeField === 'caption'} query={mentionQuery} onSelect={onSelectSpot} />
      </View>

      {media.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          {media.map((m, i) => (
            <View key={`${m.uri}-${i}`} style={styles.mediaItemWrap}>
              <Image source={{ uri: m.uri }} style={styles.mediaItem} />
              {posting && uploadingIndex === i && (
                <View style={styles.mediaOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeMediaAt(i)}>
                <Ionicons name="close-circle" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.actionsRow}>
        <View style={styles.mediaBtns}>
          <TouchableOpacity style={styles.mediaBtn} onPress={() => pickMedia('image')}>
            <Ionicons name="image-outline" size={18} color="#4A6572" />
            <Text style={styles.mediaBtnText}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaBtn} onPress={() => pickMedia('video')}>
            <Ionicons name="videocam-outline" size={18} color="#4A6572" />
            <Text style={styles.mediaBtnText}>Video</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity disabled={posting || (!title.trim() && !caption.trim() && media.length === 0)} onPress={onPublish}>
          {posting ? (
            <View style={[styles.postBtnBase, styles.postBtnDisabled]}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : (!title.trim() && !caption.trim() && media.length === 0) ? (
            <View style={[styles.postBtnBase, styles.postBtnDisabled]}>
              <Text style={styles.postBtnText}>Post</Text>
            </View>
          ) : (
            <LinearGradient colors={["#2E7D32", "#0F766E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.postBtnBase}>
              <Text style={styles.postBtnText}>Post</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, margin: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  heading: { fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  titleInput: { backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 10, color: '#1a1a1a', marginBottom: 8 },
  captionInput: { backgroundColor: '#F9FAFB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, color: '#1a1a1a', minHeight: 80, textAlignVertical: 'top' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  mediaBtns: { flexDirection: 'row', gap: 10 },
  mediaBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF2F7', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999 },
  mediaBtnText: { color: '#4A6572', fontWeight: '600' },
  postBtnBase: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, minWidth: 90, alignItems: 'center' },
  postBtnDisabled: { backgroundColor: '#93C5FD' },
  postBtnText: { color: '#fff', fontWeight: '700' },
  mediaItemWrap: { width: 72, height: 72, borderRadius: 10, overflow: 'hidden', marginRight: 8, position: 'relative', backgroundColor: '#E5E7EB' },
  mediaItem: { width: '100%', height: '100%' },
  mediaOverlay: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  removeBtn: { position: 'absolute', top: 4, right: 4 },
});

export default PostComposer;
