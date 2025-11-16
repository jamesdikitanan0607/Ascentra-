import { useCallback, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { ForumPostItem } from '../types/forum';

export function usePostInteractions() {
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const toggleLike = useCallback(async (post: ForumPostItem, setPosts: (updater: (prev: ForumPostItem[]) => ForumPostItem[]) => void) => {
    try {
      const key = post.id;
      if (busy[key]) return;
      setBusy(prev => ({ ...prev, [key]: true }));

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return;

      // optimistic update
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isLiked: !p.isLiked, likeCount: (p.likeCount || 0) + (p.isLiked ? -1 : 1) } : p));

      if (post.isLiked) {
        await supabase.from('forum_likes').delete().eq('forum_post_id', post.id).eq('user_id', user.id);
      } else {
        // Try forum_likes with forum_post_id
        const { error } = await supabase.from('forum_likes').insert([{ forum_post_id: post.id, user_id: user.id }]);
        if (error && error.code === '42883') {
          // older schema uses post_id
          await supabase.from('forum_likes').insert([{ post_id: post.id, user_id: user.id }]);
        }
      }
    } catch (e) {
      // revert on error best-effort
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isLiked: post.isLiked, likeCount: post.likeCount } : p));
    } finally {
      setBusy(prev => { const cp = { ...prev }; delete cp[post.id]; return cp; });
    }
  }, [busy]);

  const deletePost = useCallback(async (post: ForumPostItem, setPosts: (updater: (prev: ForumPostItem[]) => ForumPostItem[]) => void) => {
    try {
      const key = `del-${post.id}`;
      if (busy[key]) return;
      setBusy(prev => ({ ...prev, [key]: true }));

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user || user.id !== post.user_id) {
        throw new Error('Not authorized');
      }

      // Fetch media rows first to delete storage objects
      let mediaRows: Array<{ media_url?: string; thumbnail_url?: string }> = [];
      try {
        const { data: media } = await supabase
          .from('forum_post_media')
          .select('media_url, thumbnail_url')
          .or(`post_id.eq.${post.id},forum_post_id.eq.${post.id}`);
        mediaRows = media || [];
      } catch {}

      // Remove objects from storage bucket if URLs are public
      const { SUPABASE_BUCKET } = await import('../../config/storage.js');
      const pathsToRemove: string[] = [];
      const extractPath = (url?: string) => {
        if (!url) return null;
        const marker = `/object/public/${SUPABASE_BUCKET}/`;
        const idx = url.indexOf(marker);
        if (idx === -1) return null;
        return url.substring(idx + marker.length);
      };
      for (const r of mediaRows) {
        const p1 = extractPath(r.media_url);
        const p2 = extractPath(r.thumbnail_url);
        if (p1) pathsToRemove.push(p1);
        if (p2) pathsToRemove.push(p2);
      }
      if (pathsToRemove.length) {
        try {
          await supabase.storage.from(SUPABASE_BUCKET).remove(pathsToRemove);
        } catch {}
      }

      // Best-effort delete related rows first
      try {
        const { error: delErr1 } = await supabase.from('forum_comments').delete().eq('forum_post_id', post.id);
        if (delErr1) {
          await supabase.from('forum_comments').delete().eq('post_id', post.id);
        }
      } catch {}
      await supabase.from('forum_likes').delete().or(`forum_post_id.eq.${post.id},post_id.eq.${post.id}`);
      await supabase.from('forum_post_media').delete().or(`forum_post_id.eq.${post.id},post_id.eq.${post.id}`);

      // Delete the post from primary table; fallback to activities
      const { error } = await supabase.from('forum_posts').delete().eq('id', post.id);
      if (error && (error as any).code === 'PGRST205') {
        await supabase.from('activities').delete().eq('id', post.id);
      } else if (error) {
        throw error;
      }

      // Optimistically remove from UI
      setPosts(prev => prev.filter(p => p.id !== post.id));
    } finally {
      setBusy(prev => { const cp = { ...prev }; delete cp[`del-${post.id}`]; return cp; });
    }
  }, [busy]);

  return { toggleLike, deletePost };
}
