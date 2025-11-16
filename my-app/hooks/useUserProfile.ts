import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export type ProfileShape = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  email?: string | null;
};

type Listener = (profile: ProfileShape | null, deleted: boolean) => void;

const profileCache: Record<string, ProfileShape | null> = {};
const deletedUsers = new Set<string>();
const listeners = new Map<string, Set<Listener>>();
let subscriptionInitialized = false;

export const getDisplayName = (
  profile: Pick<ProfileShape, 'username' | 'email'> | null | undefined,
  opts?: { deleted?: boolean },
): string => {
  if (opts?.deleted) return 'Deleted User';
  if (!profile) return 'Hiker';
  if (profile.username && profile.username.trim().length > 0) return profile.username;
  if (profile.email && profile.email.includes('@')) return profile.email.split('@')[0];
  return 'Hiker';
};

function notify(userId: string, profile: ProfileShape | null, deleted: boolean) {
  const set = listeners.get(userId);
  if (set) {
    set.forEach(fn => fn(profile, deleted));
  }
}

function ensureSubscription() {
  if (subscriptionInitialized) return;
  const channel = supabase
    .channel('profiles_live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'profiles' },
      payload => {
        // @ts-ignore
        const newRow = payload.new as ProfileShape | null;
        // @ts-ignore
        const oldRow = payload.old as ProfileShape | null;
        const id = (newRow?.id || oldRow?.id) as string | undefined;
        if (!id) return;

        if (payload.eventType === 'DELETE') {
          deletedUsers.add(id);
          profileCache[id] = null;
          notify(id, null, true);
          return;
        }

        if (newRow) {
          deletedUsers.delete(id);
          profileCache[id] = newRow;
          notify(id, newRow, false);
        }
      },
    )
    .subscribe();

  // Best-effort: no explicit unsubscribe singleton (lifetime of app)
  subscriptionInitialized = true;
}

async function fetchProfileOnce(userId: string): Promise<ProfileShape | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', userId)
      .single();
    if (error) throw error;
    const profile: ProfileShape = {
      id: data.id,
      username: data.username ?? null,
      avatar_url: data.avatar_url ?? null,
    };
    profileCache[userId] = profile;
    return profile;
  } catch (e) {
    // Leave cache unchanged on error
    return null;
  }
}

export function useUserProfile(userId?: string) {
  const [profile, setProfile] = useState<ProfileShape | null>(null);
  const [loading, setLoading] = useState<boolean>(!!userId);
  const [error, setError] = useState<Error | null>(null);
  const [deleted, setDeleted] = useState<boolean>(false);

  useEffect(() => {
    ensureSubscription();
  }, []);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setDeleted(false);
      setLoading(false);
      return;
    }

    // Immediate cached value
    if (userId in profileCache) {
      setProfile(profileCache[userId]);
      setDeleted(deletedUsers.has(userId));
      setLoading(false);
    } else {
      setLoading(true);
      fetchProfileOnce(userId)
        .then(p => {
          setProfile(p);
          setDeleted(deletedUsers.has(userId));
        })
        .catch(err => setError(err))
        .finally(() => setLoading(false));
    }

    // Subscribe for updates for this userId
    const cb: Listener = (p, d) => {
      setProfile(p);
      setDeleted(d);
    };
    const set = listeners.get(userId) || new Set<Listener>();
    set.add(cb);
    listeners.set(userId, set);

    return () => {
      const s = listeners.get(userId);
      if (s) {
        s.delete(cb);
        if (s.size === 0) listeners.delete(userId);
      }
    };
  }, [userId]);

  const displayName = getDisplayName(profile, { deleted });
  const avatarUrl = profile?.avatar_url ?? null;

  return { profile, displayName, avatarUrl, loading, error, deleted };
}

// Seed cache from bulk queries
export function seedUserProfilesCache(list: Array<Partial<ProfileShape> & { id: string }>) {
  if (!Array.isArray(list)) return;
  for (const p of list) {
    if (!p?.id) continue;
    const existing = profileCache[p.id];
    const merged: ProfileShape = {
      id: p.id,
      username: p.username ?? existing?.username ?? null,
      avatar_url: p.avatar_url ?? existing?.avatar_url ?? null,
      email: p.email ?? existing?.email ?? null,
    };
    profileCache[p.id] = merged;
  }
}
