import { supabase, isInDemoMode } from './supabaseClient';
import { safeSupabaseQuery } from './supabaseService';

// Get a user's profile by ID
export const getUserProfile = async (userId) => {
  try {
    if (!userId) {
      console.error('getUserProfile: userId is required');
      return null;
    }

    if (isInDemoMode) {
      // Return mock profile data in demo mode
      return {
        username: 'Demo User',
        bio: 'This is a demo profile',
        avatar_url: null
      };
    }

    const result = await safeSupabaseQuery(
      () => supabase
        .from('profiles')
        .select('username, bio, avatar_url')
        .eq('id', userId)
        .single(),
      `Get user profile for ${userId}`
    );
      
    if (!result.success) {
      console.error('Error fetching user profile:', result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Get a user's recent hikes
export const getUserHikes = async (userId, limit = 3) => {
  try {
    if (!userId) {
      console.error('getUserHikes: userId is required');
      return [];
    }

    if (isInDemoMode) {
      // Return mock hikes data in demo mode
      return [];
    }

    const result = await safeSupabaseQuery(
      () => supabase
        .from('hikes')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit),
      `Get user hikes for ${userId}`
    );
      
    if (!result.success) {
      console.error('Error fetching user hikes:', result.error);
      return [];
    }

    return result.data || [];
  } catch (error) {
    console.error('Error fetching user hikes:', error);
    return [];
  }
};

// Get likes and comments for a hike
export const getHikeEngagement = async (hikeId, currentUserId) => {
  try {
    if (!hikeId) {
      console.error('getHikeEngagement: hikeId is required');
      return { likes: 0, comments: 0, isLiked: false };
    }

    if (isInDemoMode) {
      // Return mock engagement data in demo mode
      return { likes: 0, comments: 0, isLiked: false };
    }

    // Get like count
    const likesResult = await safeSupabaseQuery(
      () => supabase
        .from('activity_likes')
        .select('id', { count: 'exact', head: true })
        .eq('activity_id', hikeId),
      `Get likes count for hike ${hikeId}`
    );
      
    // Check if current user has liked this activity
    let userLikeResult = { success: true, data: null };
    if (currentUserId) {
      userLikeResult = await safeSupabaseQuery(
        () => supabase
          .from('activity_likes')
          .select('id')
          .eq('activity_id', hikeId)
          .eq('user_id', currentUserId)
          .maybeSingle(),
        `Check user like for hike ${hikeId}`
      );
    }
      
    // Get comment count
    const commentsResult = await safeSupabaseQuery(
      () => supabase
        .from('activity_comments')
        .select('id', { count: 'exact', head: true })
        .eq('activity_id', hikeId),
      `Get comments count for hike ${hikeId}`
    );
      
    return {
      likes: likesResult.success ? (likesResult.count || 0) : 0,
      comments: commentsResult.success ? (commentsResult.count || 0) : 0,
      isLiked: userLikeResult.success ? !!userLikeResult.data : false
    };
  } catch (error) {
    console.error('Error fetching hike engagement:', error);
    return { likes: 0, comments: 0, isLiked: false };
  }
};
