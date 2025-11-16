import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../services/supabaseClient';
import { ForumPostItem, SortOption } from '../types/forum';

const PAGE_SIZE = 10;

interface UsePostsOptions {
  spotFilter?: string | null; // hiking spot id
  sortBy?: SortOption;
  userId?: string | null; // author filter for profile feed
}

export function usePosts({ spotFilter, sortBy = 'newest', userId }: UsePostsOptions) {
  const [posts, setPosts] = useState<ForumPostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<string | null>(null);

  const cacheKey = useMemo(() => {
    const parts = ['forum-cache', sortBy];
    if (spotFilter) parts.push(`spot-${spotFilter}`);
    if (userId) parts.push(`user-${userId}`);
    return parts.join(':');
  }, [spotFilter, sortBy, userId]);

  const loadFromCache = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setPosts(parsed);
        }
      }
    } catch {}
  }, [cacheKey]);

  const saveToCache = useCallback(async (items: ForumPostItem[]) => {
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(items));
    } catch {}
  }, [cacheKey]);

  const sortQuery = (query: any) => {
    // Always order by created_at at the DB level
    return query.order('created_at', { ascending: false });
  };

  const fetchPage = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      // Try forum_posts first
      let base = supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id ( id, username, avatar_url )
        `);

      if (spotFilter) {
        base = base.contains('tags', [Number(spotFilter)]);
      }
      if (userId) {
        base = base.eq('user_id', userId);
      }
      base = sortQuery(base);

      // Offset pagination using range
      const currentCount = reset ? 0 : posts.length;
      const from = currentCount;
      const to = currentCount + PAGE_SIZE - 1;

      const { data: postsData, error } = await base.range(from, to);

      // If embedding is not supported (no FK to profiles), retry without embed
      if (error && (error as any).code === 'PGRST200') {
        let base2 = supabase
          .from('forum_posts')
          .select('*');
        if (spotFilter) {
          base2 = base2.contains('tags', [Number(spotFilter)]);
        }
        if (userId) {
          base2 = base2.eq('user_id', userId);
        }
        base2 = sortQuery(base2);
        const { data: data2, error: err2 } = await base2.range(from, to);
        if (err2) throw err2;
        const rowsNoEmbed = Array.isArray(data2) ? data2 : [];
        const userIds = [...new Set(rowsNoEmbed.map((p: any) => p.user_id).filter(Boolean))];
        if (userIds.length) {
          try { console.warn('Embedding failed — using client-side join'); } catch {}
          const { data: profs } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', userIds);
          const profMap: Record<string, any> = Object.fromEntries((profs || []).map((p: any) => [p.id, p]));
          const enriched = rowsNoEmbed.map((post: any) => ({
            ...post,
            profiles: profMap[post.user_id] || null,
          }));
          return { primary: true, rows: enriched };
        }
        return { primary: true, rows: rowsNoEmbed };
      }

      if (error && error.code === 'PGRST205') {
        // Fallback: activities
        let acts = supabase
          .from('activities')
          .select('id, content, title, created_at, user_id, tagged_spots, visibility')
          .eq('visibility', 'public');
        if (spotFilter) {
          acts = acts.contains('tagged_spots', [String(spotFilter)]);
        }
        if (userId) {
          acts = acts.eq('user_id', userId);
        }
        const { data: aData, error: aErr } = await acts.order('created_at', { ascending: false }).range(from, to);
        if (aErr) throw aErr;
        const normalized = (aData || []).map((p: any) => ({
          ...p,
          tags: (p.tagged_spots || []).map((s: string) => Number(s)).filter(Boolean),
        }));
        return { primary: false, rows: normalized };
      }
      if (error) throw error;

      // If embed returned but any row lacks profiles, do client-side join
      let rowsOut: any[] = Array.isArray(postsData) ? postsData : [];
      const needsClientJoin = rowsOut.some((p: any) => {
        const prof = p?.profiles;
        return !prof || !(prof.id || prof.username || prof.avatar_url);
      });
      if (rowsOut.length && needsClientJoin) {
        try { console.warn('Embedding failed — using client-side join'); } catch {}
        const userIds = [...new Set(rowsOut.map((p: any) => p.user_id).filter(Boolean))];
        if (userIds.length) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', userIds);
          const profMap: Record<string, any> = Object.fromEntries((profs || []).map((p: any) => [p.id, p]));
          rowsOut = rowsOut.map((post: any) => ({
            ...post,
            profiles: post.profiles && (post.profiles.id || post.profiles.username || post.profiles.avatar_url)
              ? post.profiles
              : (profMap[post.user_id] || null),
          }));
        }
      }
      return { primary: true, rows: rowsOut };
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotFilter, sortBy, posts.length, userId]);

  const enrich = useCallback(async (rows: any[], primary: boolean) => {
    const userIds = [...new Set(rows.map(r => r.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds);
    const profilesMap: Record<string, any> = Object.fromEntries((profiles || []).map(p => [p.id, p]));

    let mediaByPost: Record<string, any[]> = {};
    if (rows.length) {
      const ids = rows.map(r => r.id);
      let media: any[] | null = null;
      let errCode: string | undefined;
      try {
        const { data, error } = await supabase
          .from('forum_post_media')
          .select('id, post_id, media_url, media_type, thumbnail_url, created_at')
          .in('post_id', ids)
          .order('created_at', { ascending: true });
        if (error) {
          errCode = (error as any)?.code;
          try { console.warn('[usePosts] media fetch by post_id error', { code: errCode }); } catch {}
        }
        media = Array.isArray(data) ? data : [];
      } catch (_) {
        media = [];
      }

      (media || []).forEach((m: any) => {
        const key = m.post_id;
        if (!key) return;
        mediaByPost[key] = mediaByPost[key] || [];
        mediaByPost[key].push(m);
      });

      try { console.log('[usePosts] media enrichment', { posts: ids.length, mediaItems: (media || []).length }); } catch {}
    }

    // Like and comment counts (best effort)
    let likeCounts: Record<string, number> = {};
    let commentCounts: Record<string, number> = {};
    if (rows.length) {
      const ids = rows.map(r => r.id);
      
      // Try to get likes (table may not exist)
      try {
        const { data: likes, error: likesError } = await supabase
          .from('forum_likes')
          .select('forum_post_id, id')
          .in('forum_post_id', ids);
        if (!likesError && likes) {
          (likes || []).forEach((l: any) => {
            likeCounts[l.forum_post_id] = (likeCounts[l.forum_post_id] || 0) + 1;
          });
        }
      } catch (e) {
        // Table doesn't exist, skip likes
      }

      // Try to get comments (table may not exist)
      try {
        const { data: comments, error: commentsError } = await supabase
          .from('forum_comments')
          .select('forum_post_id, id')
          .in('forum_post_id', ids);
        if (!commentsError && comments) {
          (comments || []).forEach((c: any) => {
            commentCounts[c.forum_post_id] = (commentCounts[c.forum_post_id] || 0) + 1;
          });
        }
      } catch (e) {
        // Table doesn't exist, skip comments
      }
    }

    // Fallback: if no mediaByPost for some rows, try to read media_urls from forum_posts
    const missingMediaIds = rows.filter((r: any) => !(mediaByPost[r.id] && mediaByPost[r.id].length)).map((r: any) => r.id);
    if (missingMediaIds.length) {
      try {
        const { data, error } = await supabase
          .from('forum_posts')
          .select('id, media_urls')
          .in('id', missingMediaIds);
        if (!error && Array.isArray(data)) {
          data.forEach((row: any) => {
            const mu = row?.media_urls;
            if (Array.isArray(mu) && mu.length) {
              mediaByPost[row.id] = (mu || []).map((m: any) => {
                if (typeof m === 'string') return { id: `${row.id}-${m}`, media_url: m, media_type: 'image' };
                return { id: `${row.id}-${m.url || m.media_url}`, media_url: m.url || m.media_url, media_type: m.type || m.media_type || 'image', thumbnail_url: m.thumbnail_url };
              });
            }
          });
          try { console.log('[usePosts] media_urls fallback applied', { count: missingMediaIds.length }); } catch {}
        }
      } catch (_) {}
    }

    const enriched: ForumPostItem[] = rows.map((r: any) => {
      const embeddedProfile = r?.profiles && (r.profiles.id || r.profiles.username || r.profiles.avatar_url) ? r.profiles : null;
      return {
        ...r,
        media: (mediaByPost[r.id] || []).map((m: any) => ({ id: String(m.id), url: m.media_url, type: m.media_type, thumbnail_url: m.thumbnail_url })),
        profiles: embeddedProfile || profilesMap[r.user_id] || null,
        likeCount: likeCounts[r.id] || 0,
        commentCount: commentCounts[r.id] || 0,
      };
    });
    return enriched;
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const { rows, primary } = await fetchPage(true);
      let enriched = await enrich(rows, primary);
      // client-side sort for non-newest modes
      if (sortBy === 'most_liked') {
        enriched = [...enriched].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      } else if (sortBy === 'most_commented') {
        enriched = [...enriched].sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
      }
      setPosts(enriched);
      setHasMore((rows || []).length === PAGE_SIZE);
      await saveToCache(enriched);
    } finally {
      setRefreshing(false);
    }
  }, [enrich, fetchPage, saveToCache]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    const { rows, primary } = await fetchPage(false);
    let enriched = await enrich(rows, primary);
    if (sortBy === 'most_liked') {
      enriched = [...enriched].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    } else if (sortBy === 'most_commented') {
      enriched = [...enriched].sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
    }
    const merged = [...posts, ...enriched];
    setPosts(merged);
    setHasMore((rows || []).length === PAGE_SIZE);
    await saveToCache(merged);
  }, [enrich, fetchPage, hasMore, loading, posts, saveToCache, sortBy]);

  useEffect(() => {
    loadFromCache();
    refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotFilter, sortBy]);

  return { posts, loading, refreshing, hasMore, refresh, loadMore, setPosts };
}
