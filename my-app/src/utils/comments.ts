import { supabase } from '../../services/supabaseClient';

type Comment = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  parent_comment_id: string | null;
  forum_post_id: string | null;
  post_id: string | null;
};

export const fetchComments = async (postId: string): Promise<Comment[]> => {
  try {
    // First try the function-based approach
    const { data: functionData, error: functionError } = await supabase
      .rpc('get_comments_for_post', { post_id_param: postId });

    if (!functionError && functionData) {
      return functionData as Comment[];
    }

    // Fall back to direct table query (with embedding). If embedding fails due to missing FK, join client-side.
    console.warn('Falling back to direct table query for comments');
    const { data: tableData, error: tableError } = await supabase
      .from('forum_comments')
      .select(`
        *,
        profiles:user_id (id, username, full_name, avatar_url, role)
      `)
      .eq('forum_post_id', postId)
      .order('created_at', { ascending: true });

    if (tableError && (tableError as any).code === 'PGRST200') {
      // No FK in schema cache for embedding; fetch comments then profiles separately
      const { data: base, error: baseErr } = await supabase
        .from('forum_comments')
        .select('id, content, created_at, updated_at, user_id, parent_comment_id, forum_post_id')
        .eq('forum_post_id', postId)
        .order('created_at', { ascending: true });
      if (baseErr) throw baseErr;
      const comments = Array.isArray(base) ? base : [];
      const userIds = Array.from(new Set(comments.map((c: any) => c.user_id).filter(Boolean)));
      let profMap: Record<string, any> = {};
      if (userIds.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, role')
          .in('id', userIds);
        profMap = Object.fromEntries((profs || []).map((p: any) => [p.id, p]));
      }
      return comments.map((c: any) => ({
        ...c,
        username: profMap[c.user_id]?.username || 'Anonymous',
        full_name: profMap[c.user_id]?.full_name || null,
        avatar_url: profMap[c.user_id]?.avatar_url || null,
        role: profMap[c.user_id]?.role || null,
      }));
    }

    if (tableError) throw tableError;

    // Transform the data to match the expected format
    return (tableData || []).map((comment: any) => ({
      ...comment,
      username: comment.profiles?.username || 'Anonymous',
      full_name: comment.profiles?.full_name || null,
      avatar_url: comment.profiles?.avatar_url || null,
      role: comment.profiles?.role || null,
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

export const addComment = async ({
  content,
  postId,
  userId,
  parentCommentId = null,
}: {
  content: string;
  postId: string;
  userId: string;
  parentCommentId?: string | null;
}) => {
  try {
    const { data, error } = await supabase
      .from('forum_comments')
      .insert([
        {
          content,
          user_id: userId,
          forum_post_id: postId,
          parent_comment_id: parentCommentId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};
