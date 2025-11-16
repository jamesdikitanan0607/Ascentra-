import { supabase } from './supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_FOLLOWING_KEY = (uid: string) => `local_following_${uid}`;

async function getLocalFollowingIds(uid: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_FOLLOWING_KEY(uid));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

async function setLocalFollowingIds(uid: string, ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCAL_FOLLOWING_KEY(uid), JSON.stringify(Array.from(new Set(ids))));
  } catch {}
}

async function addLocalFollowing(uid: string, targetId: string) {
  const ids = await getLocalFollowingIds(uid);
  if (!ids.includes(targetId)) {
    ids.push(targetId);
    await setLocalFollowingIds(uid, ids);
  }
}

async function removeLocalFollowing(uid: string, targetId: string) {
  const ids = await getLocalFollowingIds(uid);
  const next = ids.filter(id => id !== targetId);
  await setLocalFollowingIds(uid, next);
}

export async function sendFriendRequest(recipientId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Not authenticated' };
    if (user.id === recipientId) return { success: false, message: 'Cannot add yourself' };

    {
      const existing = await supabase
        .from('friend_requests')
        .select('id, sender_id, receiver_id, status')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user.id})`)
        .limit(1)
        .maybeSingle();

      if (!existing.error && existing.data) {
        const row = existing.data as any;
        if (row.status === 'accepted') return { success: false, message: 'Already friends' };
        if (row.status === 'pending' && row.sender_id === user.id) return { success: false, message: 'Request already sent' };
        if (row.status === 'pending' && row.receiver_id === user.id) return { success: false, message: 'User already requested you' };
      }

      const { data, error } = await supabase
        .from('friend_requests')
        .insert([{ sender_id: user.id, receiver_id: recipientId, status: 'pending' }])
        .select('id')
        .single();
      if (!error) {
        await createNotification({
          actorId: user.id,
          recipientId,
          type: 'friend_request',
          message: 'sent you a friend request',
          targetType: 'profile',
          targetId: String(data?.id || '')
        });
        // Optimistic local cache to immediately reflect Following
        await addLocalFollowing(user.id, recipientId);
        return { success: true };
      }
      if ((error as any)?.code !== 'PGRST205') {
        return { success: false, message: (error as any)?.message || 'Unable to send friend request' };
      }
    }

    // Final fallback: local cache only so UI works across environments
    await addLocalFollowing(user.id, recipientId);
    return { success: true };
  } catch (e: any) {
    return { success: false, message: e?.message || 'Unexpected error' };
  }
}

export async function acceptFriendRequest(requestId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId)
      .select('id, sender_id, receiver_id')
      .single();
    if (!error) {
      const row = data as any;
      const actorId = row.receiver_id;
      const recipientId = row.sender_id;
      await createNotification({
        actorId,
        recipientId,
        type: 'friend_request_accepted',
        message: 'accepted your friend request',
        targetType: 'profile',
        targetId: String(actorId)
      });
      return { success: true };
    }
    if ((error as any)?.code === 'PGRST205') {
      return { success: false, message: 'Friend requests are not enabled in this environment.' };
    }
    return { success: false, message: (error as any)?.message || 'Unable to accept request' };
  } catch (e: any) {
    return { success: false, message: e?.message || 'Unexpected error' };
  }
}

export async function declineFriendRequest(requestId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'declined' })
      .eq('id', requestId);
    if (!error) return { success: true };
    if ((error as any)?.code === 'PGRST205') {
      return { success: false, message: 'Friend requests are not enabled in this environment.' };
    }
    return { success: false, message: (error as any)?.message || 'Unable to decline request' };
  } catch (e: any) {
    return { success: false, message: e?.message || 'Unexpected error' };
  }
}

export type FriendStatus = 'none' | 'pending_outgoing' | 'pending_incoming' | 'accepted';

export async function getFriendStatus(targetUserId: string): Promise<{ status: FriendStatus; requestId?: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id === targetUserId) return { status: 'none' };
  const { data, error } = await supabase
    .from('friend_requests')
    .select('id, sender_id, receiver_id, status')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`)
    .limit(1)
    .maybeSingle();
  if (error) {
    // Local fallback
    const locals = await getLocalFollowingIds(user.id);
    if (locals.includes(targetUserId)) return { status: 'accepted' };
    return { status: 'none' };
  }
  if (!data) return { status: 'none' };
  const row = data as any;
  if (row.status === 'accepted') return { status: 'accepted', requestId: row.id };
  if (row.status === 'pending' && row.sender_id === user.id) return { status: 'pending_outgoing', requestId: row.id };
  if (row.status === 'pending' && row.receiver_id === user.id) return { status: 'pending_incoming', requestId: row.id };
  return { status: 'none' };
}

export async function getFriendsList(userId?: string): Promise<Array<{ id: string; username?: string | null; avatar_url?: string | null }>> {
  const target = userId || (await supabase.auth.getUser()).data.user?.id;
  if (!target) return [];
  const { data, error } = await supabase
    .from('friend_requests')
    .select('sender_id, receiver_id, status')
    .or(`sender_id.eq.${target},receiver_id.eq.${target}`)
    .eq('status', 'accepted');
  let ids: string[] = [];
  if (!error && Array.isArray(data) && data.length > 0) {
    ids = Array.from(new Set((data as any[]).map(r => (r.sender_id === target ? r.receiver_id : r.sender_id))));
  } else {
    // Local fallback
    ids = await getLocalFollowingIds(target);
  }
  if (!ids.length) return [];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', ids);
  return (profiles as any[]) || [];
}

export async function getPendingRequests(): Promise<Array<{ id: string; sender_id: string; recipient_id: string }>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('friend_requests')
    .select('id, sender_id, receiver_id')
    .eq('receiver_id', user.id)
    .eq('status', 'pending');
  return (data as any[]) || [];
}

export async function removeFriend(targetUserId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Not authenticated' };
    const { error } = await supabase
      .from('friend_requests')
      .delete()
      .eq('status', 'accepted')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`);
    if (!error) {
      await removeLocalFollowing(user.id, targetUserId);
      return { success: true };
    }
    if ((error as any)?.code === 'PGRST205') {
      // Local fallback only
      await removeLocalFollowing(user.id, targetUserId);
      return { success: true };
    }
    return { success: false, message: (error as any)?.message || 'Unable to remove friend' };
  } catch (e: any) {
    return { success: false, message: e?.message || 'Unexpected error' };
  }
}

async function createNotification(args: { actorId: string; recipientId: string; type: string; message?: string; targetType?: string; targetId?: string }) {
  try {
    await supabase
      .from('notifications')
      .insert([{
        actor_id: args.actorId,
        recipient_id: args.recipientId,
        type: args.type,
        target_type: args.targetType || 'profile',
        target_id: args.targetId || args.actorId,
        message: args.message || null,
        content: args.message || null,
      }]);
  } catch {}
}
