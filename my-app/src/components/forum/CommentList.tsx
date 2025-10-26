import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../services/supabaseClient';

interface CommentItem {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { username?: string | null; avatar_url?: string | null } | null;
}

interface Props {
  postId: string;
  onCountChange?: (count: number) => void;
}

const CommentList: React.FC<Props> = ({ postId, onCountChange }) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select('id, post_id, user_id, content, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      if (error) throw error;

      const userIds = [...new Set((data || []).map(d => d.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
      const profilesMap: Record<string, any> = Object.fromEntries((profiles || []).map(p => [p.id, p]));
      const rows: CommentItem[] = (data || []).map((r: any) => ({ ...r, profiles: profilesMap[r.user_id] || null }));
      setComments(rows);
      onCountChange?.(rows.length);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [onCountChange, postId]);

  useEffect(() => {
    fetchComments();
    // Optional realtime subscription
    const channel = supabase
      .channel(`comments-${postId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_comments', filter: `post_id=eq.${postId}` }, payload => {
        fetchComments();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchComments, postId]);

  const addComment = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    try {
      setBusy(true);
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        Alert.alert('Sign in required', 'Please log in to comment.');
        return;
      }
      const optimistic: CommentItem = { id: `tmp-${Date.now()}`, post_id: postId, user_id: user.id, content: text, created_at: new Date().toISOString(), profiles: null };
      setComments(prev => [...prev, optimistic]);
      onCountChange?.(comments.length + 1);
      setInput('');
      const { error } = await supabase.from('forum_comments').insert([{ post_id: postId, user_id: user.id, content: text }]);
      if (error) throw error;
    } catch (e: any) {
      Alert.alert('Failed to comment', e?.message || 'Please try again');
      fetchComments();
    } finally { setBusy(false); }
  }, [comments.length, fetchComments, input, onCountChange, postId]);

  const deleteComment = useCallback(async (id: string) => {
    try {
      await supabase.from('forum_comments').delete().eq('id', id);
      setComments(prev => prev.filter(c => c.id !== id));
      onCountChange?.(comments.length - 1);
    } catch (e: any) {
      Alert.alert('Failed to delete comment', e?.message || 'Please try again');
    }
  }, [comments.length, onCountChange]);

  const renderItem = ({ item }: { item: CommentItem }) => (
    <View style={styles.commentRow}>
      <Image source={{ uri: item.profiles?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp' }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.commentHeader}>{item.profiles?.username || 'User'} · {new Date(item.created_at).toLocaleString()}</Text>
        <Text style={styles.commentText}>{item.content}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteComment(item.id)}>
        <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color="#2E7D32" style={{ padding: 8 }} />
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(c) => c.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No comments yet</Text>}
        />
      )}
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Write a comment..."
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={addComment} disabled={busy || !input.trim()}>
          <Ionicons name="send" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E7EB', paddingTop: 8 },
  commentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 6 },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E5E7EB' },
  commentHeader: { fontSize: 12, color: '#6B7280' },
  commentText: { color: '#111827' },
  empty: { color: '#9CA3AF', fontSize: 12, paddingVertical: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  input: { flex: 1, backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, color: '#111827' },
  sendBtn: { backgroundColor: '#2E7D32', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999 },
});

export default CommentList;
