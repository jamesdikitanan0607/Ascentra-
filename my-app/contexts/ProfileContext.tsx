import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { HikingSpot, Profile, FavoriteSpot } from '../types';
import { hikingSpots as localHikingSpots } from '../data/hikingSpots';

interface ProfileContextType {
  profile: Profile | null;
  favorites: FavoriteSpot[];
  loading: boolean;
  favoritesLoading: boolean;
  error: string | null;
  fetchProfile: (userId?: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  forceRefreshProfile: () => Promise<void>;
  addToFavorites: (spot: HikingSpot) => Promise<boolean>;
  removeFromFavorites: (spotId: number) => Promise<boolean>;
  isSpotFavorited: (spotId: number) => boolean;
  refreshFavorites: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const PROFILE_STORAGE_KEY = 'user_profile_cache';
const FAVORITES_STORAGE_KEY = 'user_favorites_cache';

// Skill levels definition
export const SKILL_LEVELS = {
  rookie_rambler: { emoji: '🌱', name: 'Rookie Rambler', color: '#4CAF50' },
  climb_chaser: { emoji: '🌄', name: 'Climb Chaser', color: '#FF9800' },
  rock_scrambler: { emoji: '🔗', name: 'Rock Scrambler', color: '#795548' },
  summit_strider: { emoji: '🧗', name: 'Summit Strider', color: '#9C27B0' },
  earth_roamer: { emoji: '🌍', name: 'Earth Roamer', color: '#2196F3' },
};

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favorites, setFavorites] = useState<FavoriteSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load profile and favorites from cache on mount
  useEffect(() => {
    loadProfileFromCache();
    loadFavoritesFromCache();
  }, []);

  const loadProfileFromCache = async () => {
    try {
      const cachedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (cachedProfile) {
        const parsedProfile = JSON.parse(cachedProfile);
        setProfile(parsedProfile);
      }
    } catch (error) {
      console.error('Error loading profile from cache:', error);
    }
  };

  const saveProfileToCache = async (profileData: Profile) => {
    try {
      await AsyncStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(profileData),
      );
    } catch (error) {
      console.error('Error saving profile to cache:', error);
    }
  };

  const loadFavoritesFromCache = async () => {
    try {
      const cachedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (cachedFavorites) {
        const parsedFavorites = JSON.parse(cachedFavorites);
        setFavorites(parsedFavorites);
      }
    } catch (error) {
      console.error('Error loading favorites from cache:', error);
    }
  };

  const saveFavoritesToCache = async (favoritesData: FavoriteSpot[]) => {
    try {
      await AsyncStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(favoritesData),
      );
    } catch (error) {
      console.error('Error saving favorites to cache:', error);
    }
  };

  const fetchProfile = useCallback(async (userId?: string) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        const profileData: Profile = {
          id: data.id,
          user_id: data.id, // Use id as user_id since profiles.id references auth.users(id)
          username: data.username || '',
          full_name: data.full_name || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url,
          skill_level: data.skill_level || 'rookie_rambler',
          cover_photo_url: data.cover_photo_url,
          total_km_traveled: data.total_km_traveled || 0,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        setProfile(profileData);
        await saveProfileToCache(profileData);
      } else {
        // Create default profile if none exists
        const defaultProfile = {
          id: targetUserId, // Use id as the primary key that references auth.users(id)
          username: '',
          full_name: '',
          bio: '',
          skill_level: 'rookie_rambler',
        };

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([defaultProfile])
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        if (newProfile) {
          const profileData: Profile = {
            id: newProfile.id,
            user_id: newProfile.id, // Use id as user_id since profiles.id references auth.users(id)
            username: newProfile.username || '',
            full_name: newProfile.full_name || '',
            bio: newProfile.bio || '',
            avatar_url: newProfile.avatar_url,
            skill_level: newProfile.skill_level || 'rookie_rambler',
            cover_photo_url: newProfile.cover_photo_url,
            total_km_traveled: newProfile.total_km_traveled || 0,
            created_at: newProfile.created_at,
            updated_at: newProfile.updated_at,
          };

          setProfile(profileData);
          await saveProfileToCache(profileData);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to fetch profile',
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>): Promise<boolean> => {
      if (!user || !profile) {
        setError('No user or profile found');
        return false;
      }

      try {
        setError(null);

        // Optimistically update local state
        const updatedProfile = {
          ...profile,
          ...updates,
          updated_at: new Date().toISOString(),
        };
        setProfile(updatedProfile);
        await saveProfileToCache(updatedProfile);

        // Update in database
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          // Revert optimistic update on error
          setProfile(profile);
          await saveProfileToCache(profile);
          throw updateError;
        }

        // Force refresh to ensure data consistency
        await fetchProfile(user.id);

        return true;
      } catch (error) {
        console.error('Error updating profile:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to update profile',
        );
        return false;
      }
    },
    [user, profile, fetchProfile],
  );

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  // Force immediate profile refresh - useful for signup and critical updates
  const forceRefreshProfile = useCallback(async (): Promise<void> => {
    if (!user) return;

    // Clear cache first to ensure fresh data
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);

    // Fetch fresh profile data
    await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const lastFavoritesRef = React.useRef<string>('');

  const fetchFavorites = useCallback(async () => {
    if (!user?.id) return;

    try {
      setFavoritesLoading(true);

      // First get the favorites
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (favoritesError) {
        console.error('Error fetching favorites:', favoritesError);
        return;
      }

      if (!favoritesData || favoritesData.length === 0) {
        if (lastFavoritesRef.current !== '[]') {
          setFavorites([]);
          await saveFavoritesToCache([]);
          lastFavoritesRef.current = '[]';
        }
        return;
      }

      // Get the spot IDs from favorites
      // Handle both hiking_spot_id (new standard) and spot_id (legacy/fix script)
      const spotIds = favoritesData.map((fav: any) => String(fav.hiking_spot_id || fav.spot_id));

      // Separate UUIDs (for remote fetch) from others
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validUuids = spotIds.filter(id => uuidRegex.test(id));

      let spotsData: any[] = [];

      // Only query Supabase for valid UUIDs to avoid "invalid input syntax for type uuid"
      if (validUuids.length > 0) {
        const { data, error } = await supabase
          .from('hiking_spots')
          .select(`
            id,
            hiking_spot_id,
            name,
            description,
            difficulty,
            image_url,
            latitude,
            longitude,
            rating,
            review_count,
            elevation,
            trail_length,
            estimated_duration
          `)
          .in('id', validUuids);

        if (error) {
          console.error('Error fetching hiking spots:', error);
        } else if (data) {
          spotsData = data;
        }
      }

      const combinedData: FavoriteSpot[] = favoritesData.map((fav: any) => {
        const favId = String(fav.hiking_spot_id || fav.spot_id);

        // Match remote spot by ID (UUID) OR hiking_spot_id (legacy)
        const remoteSpot = spotsData.find((spot: any) =>
          String(spot.id) === favId || String(spot.hiking_spot_id) === favId
        );

        // Robust matching strategy for local spots:
        // 1. Try exact ID match
        let localSpot = localHikingSpots.find((s: any) => String(s.id) === favId);

        // 2. If no ID match, try name match (fuzzy/normalized)
        if (!localSpot && remoteSpot) {
          const remoteName = (remoteSpot.name || '').toLowerCase().trim();
          localSpot = localHikingSpots.find((s: any) =>
            (s.name || '').toLowerCase().trim() === remoteName ||
            (s.slug || '').toLowerCase().trim() === remoteName
          );
        }

        if (!remoteSpot && !localSpot) return null;

        const spotData = (remoteSpot || {}) as any;
        const localData = (localSpot || {}) as any;

        // CRITICAL: Use local ID if available to ensure navigation works (e.g. 82 -> OsmenaPeakScreen)
        const effectiveId = localSpot ? String(localSpot.id) : favId;

        return {
          id: effectiveId, // Use the ID that maps to the correct screen
          name: localData.name || spotData.name || '',
          description: spotData.description || '',
          coordinates: {
            latitude: localData.latitude || spotData.latitude || 0,
            longitude: localData.longitude || spotData.longitude || 0,
          },
          cover_image_url: spotData.image_url || null,
          thumbnail: localData.thumbnail,

          // Prioritize local data for consistency with Home screen
          average_rating: localData.average_rating || spotData.rating || 0,
          number_of_reviews: localData.rating_count || spotData.review_count || 0,
          difficulty: localData.difficulty || spotData.difficulty || null,
          elevation: localData.elevation_gain_m || spotData.elevation || null,
          trail_length: localData.distance_km || spotData.trail_length || null,

          estimated_duration: spotData.estimated_duration || null,
          image_url: spotData.image_url || null,
          images: spotData.photos || spotData.images || null,
          amenities: spotData.amenities || null,
          best_season: spotData.best_season || null,
          created_by: spotData.created_by || null,
          is_verified: spotData.is_verified || false,
          rating: localData.average_rating || spotData.rating || null,
          review_count: localData.rating_count || spotData.review_count || null,
          latitude: localData.latitude || spotData.latitude || null,
          longitude: localData.longitude || spotData.longitude || null,
          location_text: spotData.location_name || spotData.location_text || null,
          elevation_m: localData.elevation_gain_m || spotData.elevation || null,
          trail_length_km: localData.distance_km || spotData.trail_length || null,
          estimated_duration_min: spotData.estimated_duration || null,
          created_at: spotData.created_at || new Date().toISOString(),
          updated_at: spotData.updated_at || new Date().toISOString(),
          favorited_at: fav.created_at,
          is_favorited: true,
          hiking_spot_id: favId, // Ensure consistency
        } as FavoriteSpot;
      }).filter(Boolean) as FavoriteSpot[];

      // Deep comparison to prevent unnecessary re-renders
      const newFavoritesString = JSON.stringify(combinedData);
      if (newFavoritesString !== lastFavoritesRef.current) {
        console.log('Favorites changed, updating state', { count: combinedData.length });
        lastFavoritesRef.current = newFavoritesString;
        setFavorites(combinedData);
        await saveFavoritesToCache(combinedData);
      } else {
        console.log('Favorites unchanged, skipping update');
      }

    } catch (error) {
      console.error('Error in fetchFavorites:', error);
    } finally {
      setFavoritesLoading(false);
    }
  }, [user]);

  const addToFavorites = useCallback(
    async (spot: HikingSpot): Promise<boolean> => {
      console.log('[ProfileContext] addToFavorites called with spot:', spot?.id, spot?.name);
      if (!user) {
        console.error('[ProfileContext] No user logged in');
        return false;
      }

      try {
        // Normalize hiking spot id from various possible shapes
        const rawId: any = (spot as any)?.id ?? (spot as any)?.hiking_spot_id ?? (spot as any)?.spot_id;

        if (!rawId) {
          console.error('[ProfileContext] addToFavorites: invalid hiking spot id', { rawId, spot });
          return false;
        }

        const rawIdStr = String(rawId);
        console.log('[ProfileContext] Normalized ID for favorite:', rawIdStr);

        if (favorites.some(f => String(f.id || f.hiking_spot_id) === rawIdStr)) {
          console.log('[ProfileContext] Spot already in favorites, skipping');
          return true;
        }

        // Normalize ID to local ID if possible (to match Home Screen logic immediately)
        let effectiveId = rawIdStr;

        // Try to find matching local spot
        // 1. Exact ID match (if rawId is already "82")
        let localMatch = localHikingSpots.find(s => String(s.id) === rawIdStr);

        // 2. If valid UUID or not found, try name match
        if (!localMatch) {
          const nameToMatch = (spot.name || '').toLowerCase().trim();
          localMatch = localHikingSpots.find(s => (s.name || '').toLowerCase().trim() === nameToMatch);
        }

        if (localMatch) {
          effectiveId = String(localMatch.id);
        }

        // Optimistically update local state
        const newFavorite: FavoriteSpot = {
          ...(spot as any),
          id: effectiveId, // Use the ID that matches local data (e.g. "82")
          hiking_spot_id: rawIdStr, // Always store the original ID as the reference
          favorited_at: new Date().toISOString(),
          is_favorited: true,
        };
        console.log('[ProfileContext] Optimistically adding favorite:', newFavorite);
        const updatedFavorites = [newFavorite, ...favorites];
        setFavorites(updatedFavorites);
        await saveFavoritesToCache(updatedFavorites);

        // Update database
        console.log('[ProfileContext] Sending insert to Supabase...');
        const { error } = await supabase.from('favorites').insert({
          user_id: user.id,
          hiking_spot_id: rawIdStr,
        });

        if (error) {
          const code = (error as any).code || '';
          const msg = (error as any).message || '';
          console.error('[ProfileContext] Supabase insert error:', error);

          if (code === '23505' || /duplicate key/i.test(msg)) {
            console.log('[ProfileContext] Duplicate key error, treating as success');
            return true;
          }
          // Revert optimistic update on error
          console.warn('[ProfileContext] Reverting optimistic update due to error');
          setFavorites(favorites);
          await saveFavoritesToCache(favorites);
          console.error('Error adding to favorites:', error);
          return false;
        }

        console.log('[ProfileContext] Successfully added to favorites in DB');
        return true;
      } catch (error) {
        console.error('[ProfileContext] Error in addToFavorites:', error);
        return false;
      }
    },
    [user, favorites],
  );

  const removeFromFavorites = useCallback(
    async (spotId: number | string): Promise<boolean> => {
      console.log('[ProfileContext] removeFromFavorites called for ID:', spotId);
      if (!user) {
        console.error('[ProfileContext] No user logged in');
        return false;
      }

      try {
        const targetId = String(spotId);

        // Optimistically update local state
        console.log('[ProfileContext] Optimistically removing favorite:', targetId);
        const updatedFavorites = favorites.filter((fav) =>
          String(fav.id) !== targetId &&
          String(fav.hiking_spot_id) !== targetId
        );
        setFavorites(updatedFavorites);
        await saveFavoritesToCache(updatedFavorites);

        // Update database
        console.log('[ProfileContext] Sending delete to Supabase...');
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('hiking_spot_id', targetId);

        if (error) {
          console.error('[ProfileContext] Supabase delete error:', error);
          // Revert optimistic update on error
          setFavorites(favorites);
          await saveFavoritesToCache(favorites);
          console.error('Error removing from favorites:', error);
          return false;
        }

        console.log('[ProfileContext] Successfully removed from favorites in DB');
        return true;
      } catch (error) {
        console.error('[ProfileContext] Error in removeFromFavorites:', error);
        return false;
      }
    },
    [user, favorites],
  );

  const isSpotFavorited = useCallback(
    (spotId: number | string): boolean => {
      const target = String(spotId);
      // Check both the effective ID (which might be local '84') AND the original hiking_spot_id (which might be UUID)
      const isFav = favorites.some((fav) =>
        String(fav.id) === target ||
        String(fav.hiking_spot_id) === target
      );
      return isFav;
    },
    [favorites],
  );

  const refreshFavorites = useCallback(async () => {
    await fetchFavorites();
  }, [fetchFavorites]);

  const forceRefresh = useCallback(async () => {
    if (user) {
      await Promise.all([
        fetchProfile(),
        fetchFavorites()
      ]);
    }
  }, [user, fetchProfile, fetchFavorites]);

  const clearProfile = useCallback(() => {
    setProfile(null);
    setFavorites([]);
    setError(null);
    setLoading(false);
    setFavoritesLoading(false);
    AsyncStorage.removeItem(PROFILE_STORAGE_KEY).catch(console.error);
    AsyncStorage.removeItem(FAVORITES_STORAGE_KEY).catch(console.error);
  }, []);

  // Fetch profile and favorites when user changes
  useEffect(() => {
    if (!authLoading && user) {
      fetchProfile();
      fetchFavorites();
    } else if (!authLoading && !user) {
      clearProfile();
    }
  }, [user, authLoading, fetchProfile, fetchFavorites, clearProfile]);

  // Realtime subscription to favorites for current user
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to INSERT/UPDATE/DELETE on favorites for this user
    const channel = supabase
      .channel(`favorites-user-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'favorites', filter: `user_id=eq.${user.id}` },
        () => {
          // Re-fetch to merge latest spot details and ensure consistency
          fetchFavorites();
        },
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        // no-op
      }
    };
  }, [user?.id, fetchFavorites]);

  const value: ProfileContextType = useMemo(() => ({
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    refreshProfile,
    forceRefreshProfile,
    favorites,
    favoritesLoading,
    addToFavorites,
    removeFromFavorites,
    isSpotFavorited,
    refreshFavorites,
    forceRefresh,
  }), [
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    refreshProfile,
    forceRefreshProfile,
    favorites,
    favoritesLoading,
    addToFavorites,
    removeFromFavorites,
    isSpotFavorited,
    refreshFavorites,
    forceRefresh,
  ]);

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

export default ProfileContext;
