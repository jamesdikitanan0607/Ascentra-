/**
 * Fixed Media Upload Service - Ensures media_type is always populated
 * Addresses the "null value in column media_type" error
 */

import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { logger } from '../utils/logger';
import { SUPABASE_BUCKET } from '../config/storage';

/**
 * Determine media type from file URI or MIME type
 * @param {string} uri - File URI
 * @param {string} mimeType - MIME type if available
 * @returns {string} - 'image' or 'video'
 */
function determineMediaType(uri, mimeType = null) {
  // Check MIME type first if available
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
  }
  
  // Fallback to file extension
  const extension = uri.split('.').pop()?.toLowerCase() || '';
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'heif'];
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'm4v', '3gp', 'webm'];
  
  if (imageExtensions.includes(extension)) return 'image';
  if (videoExtensions.includes(extension)) return 'video';
  
  // Default to image if uncertain
  logger.warn(`Could not determine media type for ${uri}, defaulting to 'image'`);
  return 'image';
}

/**
 * Enhanced media upload with guaranteed media_type population
 * @param {Object} supabase - Supabase client
 * @param {Array} mediaFiles - Array of media files
 * @param {string} postId - Post ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Uploaded media records
 */
export async function uploadMediaWithFixedTypes(supabase, mediaFiles, postId, userId) {
  if (!mediaFiles || mediaFiles.length === 0) {
    return [];
  }

  // Validate authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User must be authenticated to upload media');
  }

  if (user.id !== userId) {
    throw new Error('User ID mismatch - authentication required');
  }

  // Enforce maximum of 20 media files per post
  const filesToUpload = (Array.isArray(mediaFiles) ? mediaFiles : []).slice(0, 20);
  const uploadedMedia = [];

  for (let i = 0; i < filesToUpload.length; i++) {
    const media = filesToUpload[i];
    
    try {
      logger.info(`Uploading media ${i + 1}/${mediaFiles.length}: ${media.uri}`);

      // Ensure media_type is properly determined
      const mediaType = media.type || determineMediaType(media.uri, media.mimeType);
      
      if (!mediaType || !['image', 'video'].includes(mediaType)) {
        throw new Error(`Invalid media type: ${mediaType}. Must be 'image' or 'video'`);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 10);
      const fileExt = media.uri.split('.').pop() || (mediaType === 'video' ? 'mp4' : 'jpg');
      const fileName = `${timestamp}_${randomId}.${fileExt}`;
      const filePath = `posts/${userId}/${fileName}`;

      let fileToUpload = media.uri;
      const contentType = mediaType === 'image' ? 'image/jpeg' : 'video/mp4';

      // For images, create a copy to ensure accessibility
      if (mediaType === 'image') {
        try {
          const newPath = FileSystem.documentDirectory + `temp_image_${randomId}.jpg`;
          await FileSystem.copyAsync({
            from: media.uri,
            to: newPath,
          });
          fileToUpload = newPath;
        } catch (copyError) {
          logger.warn('Error copying image file:', copyError);
          // Continue with original URI
        }
      }

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(fileToUpload, {
        encoding: 'base64',
      });

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(filePath, decode(base64), {
          contentType: contentType,
          upsert: true,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(filePath);

      const mediaUrl = urlData?.publicUrl;

      if (!mediaUrl) {
        throw new Error('Failed to get public URL for uploaded media');
      }

      // Handle video thumbnail
      let thumbnailUrl = null;
      if (mediaType === 'video' && media.thumbnail) {
        try {
          const thumbTimestamp = Date.now();
          const thumbId = Math.random().toString(36).substring(2, 10);
          const thumbnailName = `thumb_${thumbTimestamp}_${thumbId}.jpg`;
          const thumbnailPath = `posts/${userId}/${thumbnailName}`;

          const thumbNewPath = FileSystem.documentDirectory + `temp_thumb_${thumbId}.jpg`;
          await FileSystem.copyAsync({
            from: media.thumbnail,
            to: thumbNewPath,
          });

          const thumbBase64 = await FileSystem.readAsStringAsync(thumbNewPath, {
            encoding: 'base64',
          });

          const { data: thumbData, error: thumbError } = await supabase.storage
            .from(SUPABASE_BUCKET)
            .upload(thumbnailPath, decode(thumbBase64), {
              contentType: 'image/jpeg',
              upsert: true,
            });

          if (!thumbError) {
            const { data: thumbUrlData } = supabase.storage
              .from(SUPABASE_BUCKET)
              .getPublicUrl(thumbnailPath);
            thumbnailUrl = thumbUrlData?.publicUrl;
          }
        } catch (thumbnailError) {
          logger.warn('Error uploading video thumbnail:', thumbnailError);
        }
      }

      // Create media record with guaranteed media_type
      const mediaRecord = {
        post_id: postId,
        user_id: userId,
        media_url: mediaUrl,
        media_type: mediaType, // GUARANTEED to be 'image' or 'video'
        thumbnail_url: thumbnailUrl,
      };

      // Validate the record before adding
      if (!mediaRecord.post_id || !mediaRecord.media_url || !mediaRecord.media_type) {
        throw new Error('Invalid media record: missing required fields');
      }

      uploadedMedia.push(mediaRecord);
      logger.info(`Successfully uploaded media ${i + 1}: ${mediaType} - ${mediaUrl}`);

    } catch (error) {
      logger.error(`Error uploading media ${i + 1}:`, error);
      throw new Error(`Failed to upload ${media.type || 'media'}: ${error.message}`);
    }
  }

  // Insert all media records to database with authentication check
  if (uploadedMedia.length > 0) {
    logger.info(`Inserting ${uploadedMedia.length} media records to database`);
    
    const { data, error } = await supabase
      .from('forum_post_media')
      .insert(uploadedMedia)
      .select();

    if (error) {
      logger.error('Database insertion error:', error);
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
    }

    logger.info(`Successfully inserted ${uploadedMedia.length} media records`);
    return data;
  }

  return [];
}

/**
 * Validate media files before upload
 * @param {Array} mediaFiles - Media files to validate
 * @returns {Object} - Validation result
 */
export function validateMediaForUpload(mediaFiles) {
  const errors = [];
  
  if (!Array.isArray(mediaFiles)) {
    errors.push('Media files must be an array');
    return { isValid: false, errors };
  }

  mediaFiles.forEach((media, index) => {
    if (!media.uri) {
      errors.push(`Media ${index + 1}: URI is required`);
    }
    
    const mediaType = media.type || determineMediaType(media.uri);
    if (!['image', 'video'].includes(mediaType)) {
      errors.push(`Media ${index + 1}: Invalid type (${mediaType})`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}