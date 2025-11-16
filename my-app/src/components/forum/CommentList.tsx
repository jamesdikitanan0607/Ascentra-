import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../services/supabaseClient';
import { useProfile } from '../../../contexts/ProfileContext';
import { useAuth } from '../../../contexts/AuthContext';

interface CommentItem {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { username?: string | null; avatar_url?: string | null } | null;
  parent_id?: string | null;
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
  const [schema, setSchema] = useState<{ 
    idKey: 'forum_post_id' | 'post_id'; 
    textKey: 'comment_text' | 'content'; 
    parentKey: 'parent_comment_id' 
  }>({ 
    idKey: 'forum_post_id', 
    textKey: 'content', 
    parentKey: 'parent_comment_id' 
  });
  const onCountChangeRef = useRef(onCountChange);
  useEffect(() => { onCountChangeRef.current = onCountChange; }, [onCountChange]);
  const refreshTimer = useRef<any>(null);
  const prevHashRef = useRef<string | null>(null);
  const prevCountRef = useRef<number>(-1);
  const [replyTo, setReplyTo] = useState<CommentItem | null>(null);
  const { profile: currentProfile } = useProfile();
  const { user: currentUser } = useAuth();

  const fetchComments = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    
    try {
      // Query using the standardized columns only, with embedding
      let rowsRaw: any[] = [];
      let rows: CommentItem[] = [];
      const { data, error } = await supabase
        .from('forum_comments')
        .select(`
          id,
          forum_post_id,
          user_id,
          content,
          parent_comment_id,
          created_at,
          profiles:user_id (id, username, avatar_url)
        `)
        .eq('forum_post_id', postId)
        .order('created_at', { ascending: true });

      if (error && (error as any).code === 'PGRST200') {
        // Fallback: fetch without embed and then join profiles client-side
        const { data: baseData, error: baseErr } = await supabase
          .from('forum_comments')
          .select('id, forum_post_id, user_id, content, parent_comment_id, created_at')
          .eq('forum_post_id', postId)
          .order('created_at', { ascending: true });
        if (baseErr) throw baseErr;
        rowsRaw = Array.isArray(baseData) ? baseData : [];

        const userIds = Array.from(new Set(rowsRaw.map((r: any) => r.user_id).filter(Boolean)));
        let profMap: Record<string, any> = {};
        if (userIds.length) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', userIds);
          profMap = Object.fromEntries((profs || []).map((p: any) => [p.id, p]));
        }

        rows = rowsRaw.map((r: any) => ({
          id: String(r.id),
          post_id: String(r.forum_post_id),
          user_id: String(r.user_id),
          content: r.content || '',
          created_at: r.created_at,
          profiles: {
            username: (profMap[r.user_id]?.username) || null,
            avatar_url: (profMap[r.user_id]?.avatar_url) || null,
          },
          parent_id: r.parent_comment_id || null,
        }));
      } else {
        if (error) throw error;
        rowsRaw = Array.isArray(data) ? data : [];
        rows = rowsRaw.map((r: any) => {
          const id = String(r.id);
          const postIdStr = String(r.forum_post_id);
          const userId = String(r.user_id);
          const content = r.content || '';
          const parentId = r.parent_comment_id || null;
          const profile = r.profiles || {};
          return {
            id,
            post_id: postIdStr,
            user_id: userId,
            content,
            created_at: r.created_at,
            profiles: {
              username: profile.username || null,
              avatar_url: profile.avatar_url || null
            },
            parent_id: parentId,
          };
        });
      }
      
      // Update the schema based on the first comment (if any)
      if (rowsRaw.length > 0) {
        setSchema({ idKey: 'forum_post_id', textKey: 'content', parentKey: 'parent_comment_id' });
      }
      
      // Update state if the data has changed
      const newHash = rows.map(r => `${r.id}:${r.created_at}`).join('|');
      const changed = newHash !== prevHashRef.current;
      
      if (changed) {
        prevHashRef.current = newHash;
        setComments(rows);
      }
      
      // Notify parent component if the count has changed
      if (rows.length !== prevCountRef.current) {
        prevCountRef.current = rows.length;
        onCountChangeRef.current?.(rows.length);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
    const channel = supabase
      .channel(`comments-${postId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_comments' }, () => {
        if (refreshTimer.current) clearTimeout(refreshTimer.current);
        refreshTimer.current = setTimeout(() => fetchComments({ silent: true }), 250);
      })
      .subscribe();
    return () => { if (refreshTimer.current) { clearTimeout(refreshTimer.current); refreshTimer.current = null; } supabase.removeChannel(channel); };
  }, [postId]);

  // Build a flat threaded list for rendering with levels
  const threadedRows = useMemo(() => {
    // Create a map of comments by ID for quick lookup
    const byId: Record<string, CommentItem> = {};
    const children: Record<string, CommentItem[]> = {};
    
    // First pass: index all comments by ID
    for (const comment of comments) {
      byId[comment.id] = comment;
      // Initialize children array for each comment
      if (!children[comment.id]) {
        children[comment.id] = [];
      }
    }
    
    // Second pass: build the comment tree
    const roots: CommentItem[] = [];
    
    for (const comment of comments) {
      const parentId = comment.parent_id;
      
      if (parentId && byId[parentId]) {
        // This is a reply to another comment
        if (!children[parentId]) {
          children[parentId] = [];
        }
        children[parentId].push(comment);
      } else {
        // This is a top-level comment
        roots.push(comment);
      }
    }
    
    // Sort comments by creation date (oldest first)
    const sortByDate = (a: CommentItem, b: CommentItem) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    
    // Sort root comments
    roots.sort(sortByDate);
    
    // Sort replies for each comment
    Object.values(children).forEach(replies => replies.sort(sortByDate));
    
    // Flatten the tree for rendering with proper indentation levels
    const flat: Array<{ item: CommentItem; level: number }> = [];
    
    const walk = (node: CommentItem, level: number) => {
      flat.push({ item: node, level });
      
      // Recursively process replies
      const replies = children[node.id] || [];
      for (const reply of replies) {
        walk(reply, level + 1);
      }
    };
    
    // Start with root comments
    roots.forEach(root => walk(root, 0));
    
    return flat;
  }, [comments]);

  const addComment = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    
    try {
      setBusy(true);
      
      // Get the current authenticated user
      const { data: auth, error: authError } = await supabase.auth.getUser();
      const user = auth?.user;
      
      if (!user || authError) {
        Alert.alert('Sign in required', 'Please log in to comment.');
        return;
      }
      
      // Create optimistic update
      const optimisticComment: CommentItem = { 
        id: `tmp-${Date.now()}`, 
        post_id: postId, 
        user_id: user.id, 
        content: text, 
        created_at: new Date().toISOString(), 
        profiles: null, 
        parent_id: replyTo?.id || null 
      };
      
      // Update UI optimistically
      setComments(prev => [...(prev || []), optimisticComment]);
      setInput('');
      
      // Prepare and insert the comment using standardized columns
      const commentData = {
        forum_post_id: postId,
        user_id: user.id,
        content: text,
        parent_comment_id: replyTo?.id || null
      };

      const { error: insertError } = await supabase
        .from('forum_comments')
        .insert([commentData]);

      if (insertError) {
        throw insertError;
      }
      
      // Refresh comments to ensure consistency
      await fetchComments({ silent: true });
      setReplyTo(null);
    } catch (e: any) {
      Alert.alert('Failed to comment', e?.message || 'Please try again');
      fetchComments({ silent: true });
    } finally { setBusy(false); }
  }, [comments, fetchComments, input, onCountChange, postId]);

  const deleteComment = useCallback(async (id: string) => {
    try {
      await supabase.from('forum_comments').delete().eq('id', id);
      setComments(prev => (prev || []).filter(c => c.id !== id));
      onCountChange?.(((comments || []).length) - 1);
    } catch (e: any) {
      Alert.alert('Failed to delete comment', e?.message || 'Please try again');
    }
  }, [comments, onCountChange]);

  const renderItem = ({ item }: { item: { item: CommentItem; level: number } }) => {
    const row = item.item;
    const isOwn = !!currentUser?.id && row.user_id === currentUser.id;
    const ownUrl = currentProfile?.avatar_url || null;
    const avatarUri = isOwn && ownUrl
      ? `${ownUrl}?t=${currentProfile?.updated_at || ''}`
      : (row.profiles?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp');
    return (
      <View style={{ paddingLeft: item.level * 16 }}>
        <View style={styles.commentRow}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.commentHeader}>{row.profiles?.username || 'Anonymous'} · {new Date(row.created_at).toLocaleString()}</Text>
            <Text style={styles.commentText}>{row.content}</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
              <TouchableOpacity onPress={() => setReplyTo(row)}>
                <Text style={{ color: '#2E7D32', fontWeight: '600' }}>Reply</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteComment(row.id)}>
                <Text style={{ color: '#9CA3AF', fontWeight: '600' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {replyTo?.id === row.id && (
          <View style={[styles.inputRow, { marginLeft: 44 }]}> 
            <TextInput
              placeholder={`Reply to ${row.profiles?.username || 'user'}...`}
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={addComment} disabled={busy || !input.trim()}>
              <Ionicons name="send" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color="#2E7D32" style={{ padding: 8 }} />
      ) : (
        <FlatList
          data={threadedRows}
          keyExtractor={(c) => c.item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No comments yet</Text>}
        />
      )}
      {!replyTo && (
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
      )}
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
