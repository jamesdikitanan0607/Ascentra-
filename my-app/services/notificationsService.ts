import { supabase } from './supabaseClient';

export type NotificationTargetType = 'post' | 'comment' | 'profile' | 'message' | 'activity' | string;

export interface NotificationItem {
  id: string;
  actor_id?: string | null;
  recipient_id?: string | null;
  type?: string | null; // e.g., like, comment, follow
  verb?: string | null; // optional alternative to type
  target_type?: NotificationTargetType | null;
  target_id?: string | null;
  content?: string | null; // message text
  message?: string | null; // alternative field
  created_at: string;
  read_at?: string | null;
  is_read?: boolean | null;
  post_image_url?: string | null;
}

export interface ActorProfile {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
}

export interface EnrichedNotification extends NotificationItem {
  actor?: ActorProfile | null;
}

let notificationsSupportedFlag = true;
let warnedOnce = false;

export function isNotificationsSupported(): boolean {
  return notificationsSupportedFlag;
}

export async function fetchUnreadCount(userId: string): Promise<number> {
  if (!notificationsSupportedFlag) return 0;
  // Try to count unread by read_at null or is_read false
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .or('read_at.is.null,is_read.eq.false');

  if (error) {
    if ((error as any).code === 'PGRST205') {
      notificationsSupportedFlag = false;
      if (!warnedOnce) {
        console.warn('[notificationsService] Notifications table not found. Disabling notifications for this session.');
        warnedOnce = true;
      }
    } else {
      if (!warnedOnce) {
        console.warn('[notificationsService] unread count error', error);
        warnedOnce = true;
      }
    }
    return 0;
  }
  return count || 0;
}

export async function fetchNotifications(userId: string, onlyUnread = false, limit = 30): Promise<EnrichedNotification[]> {
  if (!notificationsSupportedFlag) return [];
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (onlyUnread) {
    query = query.or('read_at.is.null,is_read.eq.false');
  }

  const { data, error } = await query;
  if (error) {
    if ((error as any).code === 'PGRST205') {
      notificationsSupportedFlag = false;
      if (!warnedOnce) {
        console.warn('[notificationsService] Notifications table not found. Disabling notifications for this session.');
        warnedOnce = true;
      }
    } else {
      if (!warnedOnce) {
        console.warn('[notificationsService] fetch error', error);
        warnedOnce = true;
      }
    }
    return [];
  }

  const rows = Array.isArray(data) ? (data as NotificationItem[]) : [];

  // Enrich with actor profile
  const actorIds = [...new Set(rows.map(r => r.actor_id).filter(Boolean))] as string[];
  let profilesMap: Record<string, ActorProfile> = {};
  if (actorIds.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', actorIds);
    profilesMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
  }

  return rows.map(r => ({ ...r, actor: r.actor_id ? profilesMap[r.actor_id] : null }));
}

export async function markAsRead(notificationId: string): Promise<void> {
  if (!notificationsSupportedFlag) return;
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString(), is_read: true })
    .eq('id', notificationId);
  if (error) {
    // Silently ignore if table missing
    if ((error as any).code === 'PGRST205') {
      notificationsSupportedFlag = false;
    } else if (!warnedOnce) {
      console.warn('[notificationsService] markAsRead error', error);
      warnedOnce = true;
    }
  }
}

export function subscribeToNotifications(userId: string, onInsert: (n: EnrichedNotification) => void) {
  if (!notificationsSupportedFlag) {
    return () => {};
  }
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}` }, async (payload) => {
      const row = payload.new as NotificationItem;
      let actor: ActorProfile | null = null;
      if (row.actor_id) {
        const { data: p } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .eq('id', row.actor_id)
          .single();
        actor = (p as any) || null;
      }
      onInsert({ ...(row as NotificationItem), actor });
    })
    .subscribe();

  return () => {
    try { supabase.removeChannel(channel); } catch {}
  };
}
