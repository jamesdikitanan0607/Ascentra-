import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isInDemoMode } from './supabaseClient';
import { uploadMediaFilesWithTransaction } from './mediaUploadService';
import { SupabaseServiceError, safeSupabaseQuery } from './supabaseService';
import { sanitizeRouteCoordinates } from '../utils/mapHelpers';

// Type definitions
export interface HikeStats {
  distance: number;
  duration: number;
  pace: number;
  elevation: number;
}

export interface MediaItem {
  uri: string;
  type: 'image' | 'video';
  name: string;
}

export interface RouteCoordinate {
  latitude: number;
  longitude: number;
  timestamp?: number;
}

export interface HikeData {
  id?: string;
  title?: string;
  description?: string;
  activityType?: string;
  feeling?: string;
  privateNotes?: string;
  date: string;
  stats: HikeStats;
  distance?: number;
  duration?: number;
  pace?: number;
  elevation?: number;
  routeCoordinates: RouteCoordinate[];
  media: MediaItem[];
  synced?: boolean;
  visibility?: 'public' | 'private';
}

export interface SavedHike {
  id: string;
  title: string;
  description: string;
  activityType: string;
  feeling: string;
  privateNotes: string;
  date: string;
  distance: number;
  duration: number;
  pace: number;
  elevation: number;
  routeCoordinates: RouteCoordinate[];
  media: MediaItem[];
  synced: boolean;
  stats?: HikeStats; // Optional for backward compatibility
  visibility?: 'public' | 'private';
}

export interface SyncResult {
  success: boolean;
  synced?: number;
  total?: number;
  imported?: number;
  errors?: Array<{ hikeId: string; error: string }>;
  reason?: string;
  error?: string;
}

// Helper function to get current user ID - improved version
export const getCurrentUserId = async (): Promise<string> => {
  try {
    if (isInDemoMode) {
      return 'guest';
    }

    // First check if a user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    const loggedIn = !!session?.user;
    
    if (loggedIn) {
      // Get current session from Supabase
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Supabase auth error getting session:', error);
        return 'guest';
      }
      
      const userId = data?.session?.user?.id;
      
      if (userId) {
        return userId;
      }
    }
    
    // If no user is logged in or session retrieval failed, use 'guest'
    return 'guest';
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return 'guest';
  }
};

// Set hike visibility locally and attempt to sync to Supabase (best-effort)
export const setHikeVisibility = async (hikeId: string, visibility: 'public' | 'private'): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    const storageKey = `@ascentra_hikes_${userId}`;
    const hikesStr = await AsyncStorage.getItem(storageKey);
    if (!hikesStr) return false;
    const hikes: SavedHike[] = JSON.parse(hikesStr);
    const idx = hikes.findIndex(h => h.id === hikeId);
    if (idx === -1) return false;
    hikes[idx] = { ...hikes[idx], visibility };
    await AsyncStorage.setItem(storageKey, JSON.stringify(hikes));

    // Try updating Supabase if logged in and table has column (ignore schema errors)
    if (userId !== 'guest' && !isInDemoMode) {
      try {
        const result = await safeSupabaseQuery(
          () => supabase
            .from('saveactivity')
            .update({ visibility })
            .eq('id', hikeId)
            .eq('user_id', userId),
          'Update hike visibility'
        );
        // If the column doesn't exist, ignore
        if (result.error && !String(result.error.message || '').includes('column')) {
          console.warn('Supabase visibility update warning:', result.error.message);
        }
      } catch (e) {
        // Ignore
      }
    }
    return true;
  } catch (e) {
    return false;
  }
};

// Share a hike to the forum by creating a forum post (fallback to activities if forum_posts doesn't exist)
export const shareHikeToForum = async (hikeId: string): Promise<{ success: boolean; postId?: string }> => {
  try {
    const hike = await getHikeById(hikeId);
    if (!hike) return { success: false };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    // Preserve original title and description/caption
    const title = hike.title || 'Hiking Activity';
    const content = (hike.description || '').toString();

    // Try forum_posts first
    const insertForum = await supabase
      .from('forum_posts')
      .insert([{ user_id: user.id, title, content, tags: [] }])
      .select('id')
      .single();

    if (!insertForum.error && insertForum.data?.id) {
      const postId = String(insertForum.data.id);
      // Upload media in the same order they were saved
      const mediaFiles = Array.isArray(hike.media) ? hike.media.map((m) => ({
        uri: m.uri,
        type: m.type || (m.uri && m.uri.endsWith('.mp4') ? 'video' : 'image'),
        name: m.name || (m.uri?.split('/')?.pop() || 'media')
      })) : [];

      if (mediaFiles.length > 0) {
        try {
          const inserted = await uploadMediaFilesWithTransaction(supabase, mediaFiles, postId, user.id);
          // Best-effort set media_urls on forum_posts for clients that use fallback
          const mediaUrls = (inserted || []).map((r: any) => ({ url: r.media_url, type: r.media_type, thumbnail_url: r.thumbnail_url }));
          try {
            await supabase.from('forum_posts').update({ media_urls: mediaUrls }).eq('id', postId);
          } catch (_) {}
        } catch (e) {
          // If media upload fails, continue with text-only post
        }
      }

      await setHikeVisibility(hikeId, 'public');
      return { success: true, postId };
    }

    // If forum_posts missing, fallback to activities
    if (insertForum.error && String(insertForum.error.code) === 'PGRST205') {
      const insertAct = await supabase
        .from('activities')
        .insert([{ user_id: user.id, title, content, tagged_spots: [], likes: 0, comments: 0 }])
        .select('id')
        .single();
      if (!insertAct.error && insertAct.data?.id) {
        await setHikeVisibility(hikeId, 'public');
        return { success: true, postId: String(insertAct.data.id) };
      }
    }

    return { success: false };
  } catch (e) {
    return { success: false };
  }
};

// Update user_stats totals with a completed hike
export const updateUserStatsWithHike = async (distance: number, elevation: number): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Fetch existing stats (ignore not found)
    const { data: stats, error } = await supabase
      .from('user_stats')
      .select('total_distance, total_elevation, total_hikes')
      .eq('user_id', user.id)
      .single();

    const prevDistance = stats?.total_distance || 0;
    const prevElevation = stats?.total_elevation || 0;
    const prevHikes = stats?.total_hikes || 0;

    const upsert = await supabase
      .from('user_stats')
      .upsert({
        user_id: user.id,
        total_distance: prevDistance + (distance || 0),
        total_elevation: prevElevation + (elevation || 0),
        total_hikes: prevHikes + 1,
        updated_at: new Date().toISOString(),
      });

    if (upsert.error) return false;
    return true;
  } catch (e) {
    return false;
  }
};

// Helper to get user-specific storage key
const getUserHikesKey = async (): Promise<string> => {
  const userId = await getCurrentUserId();
  return `@ascentra_hikes_${userId}`;
};

// Debug function
export const debugStorage = async (): Promise<boolean> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    
    // Show which users have hike data
    const hikeKeys = keys.filter(key => key.startsWith('@ascentra_hikes_'));
    
    return true;
  } catch (error) {
    return false;
  }
};

// Save hike with user-specific key
export const saveHikeToLocalDB = async (hikeData: HikeData): Promise<string> => {
  try {
    // Generate ID if not provided
    const hikeId = hikeData.id || Date.now().toString();
    
    // Sanitize route coordinates before saving
    const sanitizedCoordinates = sanitizeRouteCoordinates(hikeData.routeCoordinates);
    
    // Prepare data object with all fields
    const hikeToSave = {
      id: hikeId,
      title: hikeData.title || 'Hiking Activity',
      description: hikeData.description || '',
      activityType: hikeData.activityType || 'Hiking',
      feeling: hikeData.feeling || '',
      privateNotes: hikeData.privateNotes || '',
      date: hikeData.date,
      distance: hikeData.stats.distance,
      duration: hikeData.stats.duration,
      pace: hikeData.stats.pace,
      elevation: hikeData.stats.elevation,
      // Make sure route coordinates are saved in the correct format
      routeCoordinates: sanitizedCoordinates,
      // Media
      media: Array.isArray(hikeData.media) ? hikeData.media.map(item => ({
        uri: item.uri,
        type: item.type || (item.uri && item.uri.endsWith('.mp4') ? 'video' : 'image'),
        name: item.name || item.uri.split('/').pop() || 'unknown'
      })) : [],
      synced: false, // Track sync status with Supabase
      visibility: hikeData.visibility || 'private',
    };
    
    // Get user-specific key
    const userId = await getCurrentUserId();
    const storageKey = `@ascentra_hikes_${userId}`;
    
    // Get existing hikes from AsyncStorage
    const hikesStr = await AsyncStorage.getItem(storageKey);
    let hikes = [];
    if (hikesStr) {
      hikes = JSON.parse(hikesStr);
    }
    
    // Add new hike or update existing
    const existingIndex = hikes.findIndex((h: SavedHike) => h.id === hikeId);
    if (existingIndex >= 0) {
      hikes[existingIndex] = hikeToSave;
    } else {
      hikes.push(hikeToSave);
    }
    
    // Save back to AsyncStorage
    await AsyncStorage.setItem(storageKey, JSON.stringify(hikes));
    
    // Try to sync with Supabase
    if (userId !== 'guest') {
      try {
        await syncHikeToSupabase(hikeToSave, userId);
        
        // Mark as synced locally after successful sync
        hikeToSave.synced = true;
        
        // Update the list with synced status
        if (existingIndex >= 0) {
          hikes[existingIndex] = hikeToSave;
        } else {
          // Find the recently added hike
          const newIndex = hikes.findIndex((h: SavedHike) => h.id === hikeId);
          if (newIndex >= 0) {
            hikes[newIndex].synced = true;
          }
        }
        
        // Save updated sync status
        await AsyncStorage.setItem(storageKey, JSON.stringify(hikes));
      } catch (syncError) {
        // We still saved locally, so no need to throw
      }
    }
    
    return hikeId;
  } catch (error) {
    console.error('Error saving hike to local DB:', error);
    throw error;
  }
};

// Export the sync function so it can be used by other components
export const syncHikeToSupabase = async (hike: SavedHike, userId: string): Promise<boolean> => {
  try {
    if (isInDemoMode) {
      return false;
    }

    // Check if userId is guest, if so, we can't sync
    if (!userId || userId === 'guest') {
      return false;
    }
    
    // First verify the user is actually logged in
    const { data: { session } } = await supabase.auth.getSession();
    const isLoggedIn = !!session?.user;
    if (!isLoggedIn) {
      return false;
    }
    
    // Prepare data for Supabase
    const supabaseHike = {
      id: hike.id,
      user_id: userId,
      title: hike.title,
      description: hike.description,
      activity_type: hike.activityType,
      feeling: hike.feeling,
      private_notes: hike.privateNotes,
      date: hike.date,
      distance: typeof hike.distance === 'number' ? hike.distance : hike.stats?.distance,
      duration: typeof hike.duration === 'number' ? hike.duration : hike.stats?.duration,
      pace: typeof hike.pace === 'number' ? hike.pace : hike.stats?.pace,
      elevation: typeof hike.elevation === 'number' ? hike.elevation : hike.stats?.elevation,
      route_coordinates: hike.routeCoordinates,
      media: hike.media
    };

    // Verify the table exists using safe query
    const tableCheckResult = await safeSupabaseQuery(
      () => supabase
        .from('saveactivity')
        .select('id')
        .limit(1),
      'Check saveactivity table'
    );
        
    if (tableCheckResult.error) {
      if (tableCheckResult.error.message.includes('does not exist')) {
        throw new Error('The "saveactivity" table does not exist in your Supabase database');
      }
      throw new Error(`Table verification failed: ${tableCheckResult.error.message}`);
    }

    // Do the upsert operation using safe query
    const upsertResult = await safeSupabaseQuery(
      () => supabase
        .from('saveactivity')
        .upsert(supabaseHike),
      `Sync hike ${hike.id} to Supabase`
    );

    if (upsertResult.error) {
      throw new Error(`Supabase sync error: ${upsertResult.error.message || 'Unknown error'}`);
    }
    
    // Update local storage to mark as synced
    const storageKey = `@ascentra_hikes_${userId}`;
    try {
      const hikesStr = await AsyncStorage.getItem(storageKey);
      if (hikesStr) {
        const hikes = JSON.parse(hikesStr);
        const updatedHikes = hikes.map((h: SavedHike) => {
          if (h.id === hike.id) {
            return { ...h, synced: true };
          }
          return h;
        });
        
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedHikes));
      }
    } catch (storageError) {
      console.error('Error updating local sync status:', storageError);
      // Don't fail the sync for this
    }
    
    return true;
  } catch (error) {
    console.error('Sync hike to Supabase failed:', error);
    throw error;
  }
};

// Sync all local hikes to Supabase
export const syncAllHikesToSupabase = async (): Promise<SyncResult> => {
  try {
    if (isInDemoMode) {
      return { success: false, reason: 'Cannot sync in demo mode' };
    }

    const userId = await getCurrentUserId();
    
    // Only sync for logged in users
    if (userId === 'guest') {
      return { success: false, reason: 'Not logged in' };
    }
    
    // Get local hikes
    const storageKey = `@ascentra_hikes_${userId}`;
    const hikesStr = await AsyncStorage.getItem(storageKey);
    
    if (!hikesStr) {
      return { success: true, synced: 0 };
    }
    
    const hikes = JSON.parse(hikesStr);
    let syncedCount = 0;
    let errors = [];
    
    // Sync each hike
    for (const hike of hikes) {
      try {
        await syncHikeToSupabase(hike, userId);
        
        // Mark as synced
        hike.synced = true;
        syncedCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
        errors.push({ hikeId: hike.id, error: errorMessage });
        console.error(`Failed to sync hike ${hike.id}:`, error);
      }
    }
    
    // Save updated sync status
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(hikes));
    } catch (storageError) {
      console.error('Error updating local sync status:', storageError);
      // Don't fail the entire sync for this
    }
    
    return { 
      success: errors.length === 0, 
      synced: syncedCount, 
      total: hikes.length,
      errors: errors
    };
  } catch (error) {
    console.error('Sync all hikes failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown sync error'
    };
  }
};

// Fetch hikes from Supabase (useful when user logs in on a new device)
export const fetchHikesFromSupabase = async (): Promise<SyncResult> => {
  try {
    if (isInDemoMode) {
      return { success: false, reason: 'Cannot fetch in demo mode' };
    }

    const userId = await getCurrentUserId();
    
    // Only fetch for logged in users
    if (userId === 'guest') {
      return { success: false, reason: 'Not logged in' };
    }
    
    // Fetch from Supabase using saveactivity table with safe query
    const fetchResult = await safeSupabaseQuery(
      () => supabase
        .from('saveactivity')
        .select('*')
        .eq('user_id', userId),
      'Fetch hikes from Supabase'
    );
      
    if (fetchResult.error) {
      throw new Error(`Supabase fetch error: ${fetchResult.error.message || 'Unknown error'}`);
    }
    
    const data = fetchResult.data as any[] || [];
    
    if (!data || data.length === 0) {
      return { success: true, imported: 0 };
    }
    
    // Convert Supabase format to app format
    const appHikes: SavedHike[] = data.map((h: any) => ({
      id: h.id,
      title: h.title,
      description: h.description,
      activityType: h.activity_type,
      feeling: h.feeling,
      privateNotes: h.private_notes,
      date: h.date,
      distance: h.distance,
      duration: h.duration,
      pace: h.pace,
      elevation: h.elevation,
      routeCoordinates: h.route_coordinates || [],
      media: h.media || [],
      synced: true
    }));
    
    // Merge with local hikes
    const storageKey = `@ascentra_hikes_${userId}`;
    const hikesStr = await AsyncStorage.getItem(storageKey);
    let localHikes = hikesStr ? JSON.parse(hikesStr) : [];
    
    // Create a map of existing hike IDs
    const existingHikeIds = new Set(localHikes.map((h: SavedHike) => h.id));
    
    // Add only new hikes from Supabase
    let importedCount = 0;
    for (const hike of appHikes) {
      if (!existingHikeIds.has(hike.id)) {
        localHikes.push(hike);
        importedCount++;
      }
    }
    
    // Save merged hikes
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(localHikes));
    } catch (storageError) {
      console.error('Error saving merged hikes to local storage:', storageError);
      throw new Error('Failed to save imported hikes locally');
    }
    
    return { 
      success: true, 
      imported: importedCount, 
      total: appHikes.length 
    };
  } catch (error: any) {
    console.error('Fetch hikes from Supabase failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown fetch error'
    };
  }
};

// Update the delete function to also delete from Supabase
export const deleteHike = async (hikeId: string): Promise<boolean> => {
  try {
    // Get user-specific key
    const userId = await getCurrentUserId();
    const storageKey = `@ascentra_hikes_${userId}`;
    
    // Get current hikes for this user
    const hikesStr = await AsyncStorage.getItem(storageKey);
    if (!hikesStr) {
      throw new Error('No hikes found in storage');
    }
    
    const hikes = JSON.parse(hikesStr);
    
    // Filter out the one to delete
    const updatedHikes = hikes.filter((hike: SavedHike) => hike.id !== hikeId);
    
    // Save back to AsyncStorage
    await AsyncStorage.setItem(storageKey, JSON.stringify(updatedHikes));
    
    // Also delete from Supabase if user is logged in and not in demo mode
    if (userId !== 'guest' && !isInDemoMode) {
      try {
        const deleteResult = await safeSupabaseQuery(
          () => supabase
            .from('saveactivity')
            .delete()
            .eq('id', hikeId)
            .eq('user_id', userId),
          `Delete hike ${hikeId} from Supabase`
        );
          
        if (deleteResult.error) {
          console.error('Failed to delete hike from Supabase:', deleteResult.error.message);
          // Continue anyway since local delete succeeded
        }
      } catch (supabaseError) {
        console.error('Error deleting hike from Supabase:', supabaseError instanceof Error ? supabaseError.message : 'Unknown error');
        // Continue anyway since local delete succeeded
      }
    }
    
    return true;
  } catch (error) {
    console.error('Delete hike failed:', error);
    throw error;
  }
};

// Get hikes for a specific user (for profile viewing)
export const getHikesForUser = async (userId?: string): Promise<SavedHike[]> => {
  try {
    // Fall back to current user if no ID provided
    const targetUserId = userId || await getCurrentUserId();
    const storageKey = `@ascentra_hikes_${targetUserId}`;
    
    // Get hikes with user-specific key
    const hikesStr = await AsyncStorage.getItem(storageKey);
    
    if (!hikesStr) {
      return [];
    }
    
    const hikes = JSON.parse(hikesStr);
    return hikes;
  } catch (error) {
    return [];
  }
};

// Get a specific hike by its ID
export const getHikeById = async (hikeId: string): Promise<SavedHike | null> => {
  try {
    if (!hikeId) {
      console.error('getHikeById: hikeId is required');
      return null;
    }

    // Get user-specific key
    const userId = await getCurrentUserId();
    const storageKey = `@ascentra_hikes_${userId}`;
    
    // Get all hikes from storage with error handling
    let hikesStr: string | null = null;
    try {
      hikesStr = await AsyncStorage.getItem(storageKey);
    } catch (storageError) {
      console.error('Error reading from AsyncStorage:', storageError);
      return null;
    }
    
    if (!hikesStr) {
      return null;
    }
    
    // Parse hikes with error handling
    let hikes: SavedHike[];
    try {
      hikes = JSON.parse(hikesStr);
      if (!Array.isArray(hikes)) {
        console.error('Invalid hikes data format in storage');
        return null;
      }
    } catch (parseError) {
      console.error('Error parsing hikes data from storage:', parseError);
      return null;
    }
    
    // Find the hike with matching ID
    const hike = hikes.find((h: SavedHike) => h.id.toString() === hikeId.toString());
    
    if (!hike) {
      return null;
    }
    
    // Make sure route coordinates are valid
    if (hike.routeCoordinates && Array.isArray(hike.routeCoordinates)) {
      try {
        // Use our sanitization utility
        hike.routeCoordinates = sanitizeRouteCoordinates(hike.routeCoordinates);
      } catch (sanitizeError) {
        console.error('Error sanitizing route coordinates:', sanitizeError);
        // Continue with original coordinates if sanitization fails
      }
    }
    
    return hike;
  } catch (error) {
    console.error('getHikeById failed:', error);
    return null;
  }
};

// Get all hikes for current user only
export const getAllHikes = async (): Promise<SavedHike[]> => {
  try {
    // Get user-specific key
    const userId = await getCurrentUserId();
    const storageKey = `@ascentra_hikes_${userId}`;
    
    // Get hikes with user-specific key and error handling
    let hikesStr: string | null = null;
    try {
      hikesStr = await AsyncStorage.getItem(storageKey);
    } catch (storageError) {
      console.error('Error reading hikes from AsyncStorage:', storageError);
      return [];
    }
    
    if (!hikesStr) {
      return [];
    }
    
    // Parse hikes with error handling
    let hikes: SavedHike[];
    try {
      hikes = JSON.parse(hikesStr);
      if (!Array.isArray(hikes)) {
        console.error('Invalid hikes data format in storage');
        return [];
      }
    } catch (parseError) {
      console.error('Error parsing hikes data from storage:', parseError);
      return [];
    }
    
    // If user is logged in and not in demo mode, try to sync from Supabase
    if (userId !== 'guest' && !isInDemoMode) {
      try {
        // Try to sync down from Supabase if we're online
        const syncResult = await fetchHikesFromSupabase();
        
        if (syncResult.success) {
          // Re-fetch local data after successful sync
          try {
            const updatedHikesStr = await AsyncStorage.getItem(storageKey);
            if (updatedHikesStr) {
              const updatedHikes = JSON.parse(updatedHikesStr);
              if (Array.isArray(updatedHikes)) {
                return updatedHikes;
              }
            }
          } catch (refetchError) {
            console.error('Error re-fetching after sync:', refetchError);
            // Continue with original local data
          }
        } else {
          console.warn('Sync from Supabase failed:', syncResult.error);
          // Continue with local data
        }
      } catch (syncError) {
        console.warn('Error during Supabase sync:', syncError);
        // Continue with local data if sync fails
      }
    }
    
    return hikes;
  } catch (error) {
    console.error('getAllHikes failed:', error);
    return [];
  }
};