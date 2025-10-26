/**
 * Enhanced Media Upload Service
 * Handles media upload with proper transaction management, error handling, and rollback
 */

import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { logger } from '../utils/logger';
import { 
  handleDatabaseError, 
  insertForumPostMediaWithErrorHandling,
  checkMediaInsertionPermission 
} from '../utils/databaseErrorHandler';
import { SUPABASE_BUCKET } from '../config/storage';

/**
 * Upload a single media file to Supabase Storage
 * @param {Object} supabase - Supabase client instance
 * @param {Object} media - Media object with uri, type, etc.
 * @param {string} userId - User ID for file path organization
 * @returns {Promise<Object>} - Upload result with URL and metadata
 */
async function uploadSingleMediaFile(supabase, media, userId) {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 10);
  const fileExt = media.uri.split('.').pop() || (media.type === 'video' ? 'mp4' : 'jpg');
  const fileName = `${timestamp}_${randomId}.${fileExt}`;
  const filePath = `posts/${userId}/${fileName}`;

  let fileToUpload = media.uri;
  const contentType = media.type === 'image' ? 'image/jpeg' : 'video/mp4';

  // For images, create a copy to ensure the file is accessible
  if (media.type === 'image') {
    try {
      const newPath = FileSystem.documentDirectory + `temp_image_${randomId}.jpg`;
      await FileSystem.copyAsync({
        from: media.uri,
        to: newPath,
      });
      fileToUpload = newPath;
    } catch (copyError) {
      logger.warn('Error copying image file:', copyError);
      // Continue with original URI if copy fails
    }
  }

  // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(fileToUpload, {
    encoding: 'base64',
  });

  // Upload the file to Supabase Storage
  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(filePath, decode(base64), {
      contentType: contentType,
      upsert: true,
    });

  if (error) {
    throw error;
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(filePath);

  const mediaUrl = urlData?.publicUrl;

  // Handle thumbnail for videos
  let thumbnailUrl = null;
  if (media.type === 'video' && media.thumbnail) {
    try {
      const thumbTimestamp = Date.now();
      const thumbId = Math.random().toString(36).substring(2, 10);
      const thumbnailName = `thumb_${thumbTimestamp}_${thumbId}.jpg`;
      const thumbnailPath = `posts/${userId}/${thumbnailName}`;

      // Copy thumbnail to known location
      const thumbNewPath = FileSystem.documentDirectory + `temp_thumb_${thumbId}.jpg`;
      await FileSystem.copyAsync({
        from: media.thumbnail,
        to: thumbNewPath,
      });

      // Read thumbnail as base64
      const thumbBase64 = await FileSystem.readAsStringAsync(thumbNewPath, {
        encoding: 'base64',
      });

      // Upload thumbnail to Supabase Storage
      const { data: thumbData, error: thumbError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(thumbnailPath, decode(thumbBase64), {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (thumbError) {
        logger.warn('Error uploading video thumbnail:', thumbError);
        // Continue without thumbnail if upload fails
      } else {
        // Get thumbnail public URL
        const { data: thumbUrlData } = supabase.storage
          .from(SUPABASE_BUCKET)
          .getPublicUrl(thumbnailPath);

        thumbnailUrl = thumbUrlData?.publicUrl;
      }
    } catch (thumbnailError) {
      logger.warn('Error processing video thumbnail:', thumbnailError);
      // Continue without thumbnail if processing fails
    }
  }

  return {
    filePath,
    mediaUrl,
    thumbnailUrl,
    contentType,
    originalMedia: media,
  };
}

/**
 * Delete uploaded files from storage (for rollback purposes)
 * @param {Object} supabase - Supabase client instance
 * @param {Array} filePaths - Array of file paths to delete
 */
async function deleteUploadedFiles(supabase, filePaths) {
  if (!filePaths || filePaths.length === 0) {
    return;
  }

  try {
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .remove(filePaths);

    if (error) {
      logger.warn('Error deleting uploaded files during rollback:', error);
    } else {
      logger.info(`Successfully deleted ${filePaths.length} files during rollback`);
    }
  } catch (error) {
    logger.warn('Error in file deletion rollback:', error);
  }
}

/**
 * Upload multiple media files with transaction-like behavior
 * @param {Object} supabase - Supabase client instance
 * @param {Array} mediaFiles - Array of media files to upload
 * @param {string} postId - Post ID to associate media with
 * @param {string} userId - User ID performing the upload
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<Array>} - Array of uploaded media records
 */
export async function uploadMediaFilesWithTransaction(
  supabase, 
  mediaFiles, 
  postId, 
  userId, 
  onProgress = null
) {
  if (!mediaFiles || mediaFiles.length === 0) {
    return [];
  }

  const uploadedFiles = [];
  const uploadedFilePaths = [];
  const mediaRecords = [];

  try {
    logger.info(`Starting upload of ${mediaFiles.length} media files for post ${postId}`);

    // Check permission before starting upload
    const hasPermission = await checkMediaInsertionPermission(supabase, postId, userId);
    if (!hasPermission) {
      throw new Error('You do not have permission to add media to this post');
    }

    // Upload each media file
    for (let i = 0; i < mediaFiles.length; i++) {
      const media = mediaFiles[i];
      
      try {
        // Report progress
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: mediaFiles.length,
            status: 'uploading',
            fileName: media.name || `media-${i + 1}`,
          });
        }

        logger.info(`Uploading media file ${i + 1}/${mediaFiles.length}: ${media.type}`);

        const uploadResult = await uploadSingleMediaFile(supabase, media, userId);
        
        uploadedFiles.push(uploadResult);
        uploadedFilePaths.push(uploadResult.filePath);
        
        // Create media record for database insertion
        mediaRecords.push({
          post_id: postId,
          media_url: uploadResult.mediaUrl,
          media_type: media.type,
          thumbnail_url: uploadResult.thumbnailUrl,
        });

        logger.info(`Successfully uploaded media file ${i + 1}/${mediaFiles.length}`);

      } catch (uploadError) {
        logger.error(`Error uploading media file ${i + 1}:`, uploadError);
        
        // Rollback: Delete any files that were successfully uploaded
        if (uploadedFilePaths.length > 0) {
          logger.info('Rolling back uploaded files due to upload failure...');
          await deleteUploadedFiles(supabase, uploadedFilePaths);
        }
        
        throw new Error(`Failed to upload ${media.type} file: ${uploadError.message}`);
      }
    }

    // Report upload completion
    if (onProgress) {
      onProgress({
        current: mediaFiles.length,
        total: mediaFiles.length,
        status: 'saving',
        fileName: 'Saving to database...',
      });
    }

    // Insert all media records to database
    logger.info(`Inserting ${mediaRecords.length} media records to database`);
    
    const insertedRecords = await insertForumPostMediaWithErrorHandling(
      supabase, 
      mediaRecords, 
      postId, 
      userId
    );

    // Report completion
    if (onProgress) {
      onProgress({
        current: mediaFiles.length,
        total: mediaFiles.length,
        status: 'completed',
        fileName: 'Upload completed!',
      });
    }

    logger.info(`Successfully uploaded and saved ${mediaFiles.length} media files for post ${postId}`);
    
    return insertedRecords;

  } catch (error) {
    logger.error('Error in media upload transaction:', error);

    // Rollback: Delete any uploaded files
    if (uploadedFilePaths.length > 0) {
      logger.info('Rolling back uploaded files due to database error...');
      await deleteUploadedFiles(supabase, uploadedFilePaths);
    }

    // Report error
    if (onProgress) {
      onProgress({
        current: 0,
        total: mediaFiles.length,
        status: 'error',
        fileName: 'Upload failed',
        error: error.message,
      });
    }

    // Process and re-throw the error
    const processedError = handleDatabaseError(error, 'media upload transaction', {
      postId,
      userId,
      mediaCount: mediaFiles.length,
    });

    throw processedError;
  }
}

/**
 * Validate media files before upload
 * @param {Array} mediaFiles - Array of media files to validate
 * @returns {Object} - Validation result
 */
export function validateMediaFiles(mediaFiles) {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(mediaFiles)) {
    errors.push('Media files must be an array');
    return { isValid: false, errors, warnings };
  }

  if (mediaFiles.length === 0) {
    return { isValid: true, errors, warnings };
  }

  if (mediaFiles.length > 20) {
    errors.push('Maximum 20 media files allowed per post');
  }

  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
  const allowedImageTypes = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
  const allowedVideoTypes = ['mp4', 'mov', 'm4v'];

  mediaFiles.forEach((media, index) => {
    if (!media.uri) {
      errors.push(`Media file ${index + 1}: URI is required`);
      return;
    }

    if (!media.type || !['image', 'video'].includes(media.type)) {
      errors.push(`Media file ${index + 1}: Valid type is required (image or video)`);
      return;
    }

    // Check file extension
    const fileExt = (media.uri.split('.').pop() || '').toLowerCase();
    const allowedTypes = media.type === 'image' ? allowedImageTypes : allowedVideoTypes;
    
    if (!allowedTypes.includes(fileExt)) {
      errors.push(`Media file ${index + 1}: Unsupported file format (.${fileExt})`);
    }

    // Check file size if available
    if (media.fileSize && media.fileSize > MAX_FILE_SIZE) {
      errors.push(`Media file ${index + 1}: File too large (max 15MB)`);
    }

    // Warnings for video files without thumbnails
    if (media.type === 'video' && !media.thumbnail) {
      warnings.push(`Video file ${index + 1}: No thumbnail provided`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Clean up temporary files created during upload process
 * @param {Array} tempFiles - Array of temporary file paths to clean up
 */
export async function cleanupTempFiles(tempFiles) {
  if (!tempFiles || tempFiles.length === 0) {
    return;
  }

  for (const filePath of tempFiles) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(filePath);
        logger.debug(`Cleaned up temp file: ${filePath}`);
      }
    } catch (error) {
      logger.warn(`Error cleaning up temp file ${filePath}:`, error);
    }
  }
}