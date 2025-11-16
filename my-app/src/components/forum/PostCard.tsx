import React from 'react';
import { View, Text, StyleSheet, Image as RNImage, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ForumPostItem } from '../../types/forum';
import { renderContentWithMentions } from '../../hooks/useMentions';
import { useProfile } from '../../../contexts/ProfileContext';

interface Props {
  item: ForumPostItem;
  onOpenPost?: (post: ForumPostItem) => void;
  onOpenComments?: (post: ForumPostItem) => void;
  onOpenMedia?: (media: any[], index: number) => void;
  onPressSpot?: (spotId: string) => void;
  onToggleLike?: (post: ForumPostItem) => void;
  onDelete?: (post: ForumPostItem) => void;
  currentUserId?: string | null;
}

const PostCard: React.FC<Props> = ({ item, onOpenPost, onOpenComments, onOpenMedia, onPressSpot, onToggleLike, onDelete, currentUserId }) => {
  const { profile: currentProfile } = useProfile();
  const isOwn = !!currentUserId && item.user_id === currentUserId;
  const ownUrl = currentProfile?.avatar_url || null;
  const avatarUri = isOwn && ownUrl
    ? `${ownUrl}?t=${currentProfile?.updated_at || ''}`
    : (item.profiles?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp');

  try { console.log('Post item:', item); } catch {}

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <RNImage source={{ uri: avatarUri }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{item.profiles?.username || 'Anonymous'}</Text>
          <Text style={styles.meta}>{new Date(item.created_at).toLocaleString()}</Text>
        </View>
        <Ionicons name="leaf-outline" size={18} color="#2F855A" />
      </View>

      {!!item.title && (
        <TouchableOpacity activeOpacity={0.8} onPress={() => onOpenPost?.(item)}>
          <Text style={styles.title} numberOfLines={3}>
            {renderContentWithMentions(item.title, (id: string) => onPressSpot?.(id), { style: styles.title })}
          </Text>
        </TouchableOpacity>
      )}

      {!!item.content && (
        <TouchableOpacity activeOpacity={0.8} onPress={() => onOpenPost?.(item)}>
          <Text style={styles.content}>
            {renderContentWithMentions(item.content, (id: string) => onPressSpot?.(id), { style: styles.content })}
          </Text>
        </TouchableOpacity>
      )}

      {!!item.media && item.media.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          {item.media.map((m, i) => (
            <TouchableOpacity key={m.id || `${m.url}-${i}`} style={styles.mediaWrap} onPress={() => onOpenMedia?.(item.media!, i)}>
              {m.type === 'video' ? (
                <View style={styles.videoWrap}>
                  <RNImage source={{ uri: m.thumbnail_url || m.url }} style={styles.media} />
                  <View style={styles.playOverlay}>
                    <Ionicons name="play-circle" size={36} color="#fff" />
                  </View>
                </View>
              ) : (
                <RNImage source={{ uri: m.url }} style={styles.media} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.action} onPress={() => onToggleLike?.(item)}>
          <Ionicons name={item.isLiked ? 'heart' : 'heart-outline'} size={18} color={item.isLiked ? '#EF4444' : '#475569'} />
          <Text style={styles.actionText}>{item.likeCount || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={() => onOpenComments?.(item)}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#475569" />
          <Text style={styles.actionText}>{item.commentCount || 0}</Text>
        </TouchableOpacity>
        {currentUserId && item.user_id === currentUserId && (
          <TouchableOpacity style={[styles.action, { marginLeft: 'auto' }]} onPress={() => onDelete?.(item)}>
            <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
            <Text style={[styles.actionText, { color: '#9CA3AF' }]}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 12, marginHorizontal: 12, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#2F855A', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E7EB' },
  username: { fontWeight: '700', color: '#111827' },
  meta: { fontSize: 12, color: '#6B7280' },
  title: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  content: { color: '#111827', lineHeight: 20 },
  mediaWrap: { width: 180, height: 180, borderRadius: 12, overflow: 'hidden', backgroundColor: '#E5E7EB', marginRight: 8 },
  media: { width: '100%', height: '100%' },
  videoWrap: { width: '100%', height: '100%', position: 'relative' },
  playOverlay: { position: 'absolute', top: '40%', left: '40%' },
  footer: { flexDirection: 'row', gap: 14, marginTop: 10 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { color: '#475569', fontWeight: '600' },
});

export default PostCard;
