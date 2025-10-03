import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { HikingSpot, Profile, FavoriteSpot } from '../types';

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
  removeFromFavorites: (spotId: string) => Promise<boolean>;
  isSpotFavorited: (spotId: string) => boolean;
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

  // Fetch profile and favorites when user changes
  useEffect(() => {
    if (!authLoading && user) {
      fetchProfile();
      fetchFavorites();
    } else if (!authLoading && !user) {
      clearProfile();
    }
  }, [user, authLoading]);

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

  const fetchProfile = async (userId?: string) => {
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
  };

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
    [user, profile],
  );

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user]);

  // Force immediate profile refresh - useful for signup and critical updates
   const forceRefreshProfile = useCallback(async (): Promise<void> => {
     if (!user) return;
     
     // Clear cache first to ensure fresh data
     await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
     
     // Fetch fresh profile data
     await fetchProfile(user.id);
   }, [user, fetchProfile]);

  const fetchFavorites = async () => {
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
        setFavorites([]);
        await saveFavoritesToCache([]);
        return;
      }

      // Get the spot IDs from favorites
      const spotIds = favoritesData.map(fav => fav.spot_id);

      // Then get the hiking spots data
      const { data: spotsData, error: spotsError } = await supabase
        .from('hiking_spots')
        .select(`
          id,
          name,
          description,
          difficulty,
          image_url,
          latitude,
          longitude,
          rating,
          review_count
        `)
        .in('id', spotIds);

      const error = spotsError;

      if (error) {
        console.error('Error fetching hiking spots:', error);
        return;
      }

      // Combine favorites with hiking spots data
      const combinedData: FavoriteSpot[] = favoritesData.map((fav: any) => {
        const spot = spotsData?.find((spot: any) => spot.id === fav.spot_id);
        if (!spot) return null;
        
        const spotData = spot as any;
        return {
          id: spotData.id || fav.spot_id,
          name: spotData.name || '',
          description: spotData.description || '',
          coordinates: spotData.coordinates || null,
          cover_image_url: spotData.image_url || spotData.cover_image_url || null,
          average_rating: spotData.rating || spotData.average_rating || 0,
          number_of_reviews: spotData.review_count || spotData.number_of_reviews || 0,
          difficulty: spotData.difficulty || spotData.difficulty_level || null,
          elevation: spotData.elevation || spotData.elevation_gain || null,
          trail_length: spotData.trail_length || spotData.distance || null,
          estimated_duration: spotData.estimated_duration || null,
          image_url: spotData.image_url || null,
          images: spotData.photos || spotData.images || null,
          amenities: spotData.amenities || null,
          best_season: spotData.best_season || null,
          created_by: spotData.created_by || null,
          is_verified: spotData.is_verified || false,
          rating: spotData.rating || null,
          review_count: spotData.review_count || null,
          latitude: spotData.latitude || null,
          longitude: spotData.longitude || null,
          location_text: spotData.location_name || spotData.location_text || null,
          elevation_m: spotData.elevation || spotData.elevation_gain || null,
          trail_length_km: spotData.trail_length || spotData.distance || null,
          estimated_duration_min: spotData.estimated_duration || null,
          created_at: spotData.created_at || new Date().toISOString(),
          updated_at: spotData.updated_at || new Date().toISOString(),
          favorited_at: fav.created_at,
          is_favorited: true,
        } as FavoriteSpot;
      }).filter(Boolean) as FavoriteSpot[]; // Remove any undefined entries

      setFavorites(combinedData);
      await saveFavoritesToCache(combinedData);
    } catch (error) {
      console.error('Error in fetchFavorites:', error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const addToFavorites = useCallback(
    async (spot: HikingSpot): Promise<boolean> => {
      if (!user) return false;

      try {
        // Optimistically update local state
        const newFavorite: FavoriteSpot = {
          ...spot,
          favorited_at: new Date().toISOString(),
          is_favorited: true,
        };
        const updatedFavorites = [newFavorite, ...favorites];
        setFavorites(updatedFavorites);
        await saveFavoritesToCache(updatedFavorites);

        // Update database
        const { error } = await supabase.from('favorites').insert({
          user_id: user.id,
          spot_id: spot.id,
        });

        if (error) {
          // Revert optimistic update on error
          setFavorites(favorites);
          await saveFavoritesToCache(favorites);
          console.error('Error adding to favorites:', error);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error in addToFavorites:', error);
        return false;
      }
    },
    [user, favorites],
  );

  const removeFromFavorites = useCallback(
    async (spotId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        // Optimistically update local state
        const updatedFavorites = favorites.filter((fav) => fav.id !== parseInt(spotId));
        setFavorites(updatedFavorites);
        await saveFavoritesToCache(updatedFavorites);

        // Update database
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('spot_id', spotId);

        if (error) {
          // Revert optimistic update on error
          setFavorites(favorites);
          await saveFavoritesToCache(favorites);
          console.error('Error removing from favorites:', error);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error in removeFromFavorites:', error);
        return false;
      }
    },
    [user, favorites],
  );

  const isSpotFavorited = useCallback(
    (spotId: string): boolean => {
      return favorites.some((fav) => fav.id === parseInt(spotId));
    },
    [favorites],
  );

  const refreshFavorites = useCallback(async () => {
    await fetchFavorites();
  }, [user]);

  const forceRefresh = useCallback(async () => {
    if (user) {
      await Promise.all([
        fetchProfile(),
        fetchFavorites()
      ]);
    }
  }, [user]);

  const clearProfile = useCallback(() => {
    setProfile(null);
    setFavorites([]);
    setError(null);
    setLoading(false);
    setFavoritesLoading(false);
    AsyncStorage.removeItem(PROFILE_STORAGE_KEY).catch(console.error);
    AsyncStorage.removeItem(FAVORITES_STORAGE_KEY).catch(console.error);
  }, []);

  const value: ProfileContextType = {
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
  };

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
