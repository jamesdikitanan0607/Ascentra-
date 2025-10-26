/**
 * Database Error Handler Utility
 * Handles specific database errors including RLS policy violations
 */

import { logger } from './logger';

// PostgreSQL error codes
export const DB_ERROR_CODES = {
  RLS_POLICY_VIOLATION: '42501',
  FOREIGN_KEY_VIOLATION: '23503',
  UNIQUE_VIOLATION: '23505',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
  CONNECTION_ERROR: '08000',
  TIMEOUT: '57014',
};

// User-friendly error messages
const ERROR_MESSAGES = {
  [DB_ERROR_CODES.RLS_POLICY_VIOLATION]: 'You do not have permission to perform this action.',
  [DB_ERROR_CODES.FOREIGN_KEY_VIOLATION]: 'Referenced data does not exist.',
  [DB_ERROR_CODES.UNIQUE_VIOLATION]: 'This data already exists.',
  [DB_ERROR_CODES.NOT_NULL_VIOLATION]: 'Required information is missing.',
  [DB_ERROR_CODES.CHECK_VIOLATION]: 'Invalid data provided.',
  [DB_ERROR_CODES.CONNECTION_ERROR]: 'Database connection failed. Please check your internet connection.',
  [DB_ERROR_CODES.TIMEOUT]: 'Operation timed out. Please try again.',
};

/**
 * Handle database errors with specific logic for different error types
 * @param {Object} error - The database error object
 * @param {string} operation - Description of the operation that failed
 * @param {Object} context - Additional context for debugging
 * @returns {Object} - Processed error with user-friendly message and retry info
 */
export function handleDatabaseError(error, operation = 'database operation', context = {}) {
  const errorCode = error?.code;
  const errorMessage = error?.message || 'Unknown database error';
  
  // Log the full error for debugging
  logger.error(`Database error during ${operation}:`, {
    code: errorCode,
    message: errorMessage,
    details: error?.details,
    hint: error?.hint,
    context,
    stack: error?.stack,
  });

  // Determine if the error is retryable
  const retryableErrors = [
    DB_ERROR_CODES.CONNECTION_ERROR,
    DB_ERROR_CODES.TIMEOUT,
  ];
  
  const isRetryable = retryableErrors.includes(errorCode) || 
                     errorMessage.toLowerCase().includes('network') ||
                     errorMessage.toLowerCase().includes('timeout') ||
                     errorMessage.toLowerCase().includes('connection');

  // Get user-friendly message
  const userMessage = ERROR_MESSAGES[errorCode] || 
                     'An unexpected error occurred. Please try again.';

  // Special handling for RLS policy violations
  if (errorCode === DB_ERROR_CODES.RLS_POLICY_VIOLATION) {
    logger.error('RLS Policy Violation Details:', {
      operation,
      context,
      suggestion: 'Check user authentication and table permissions',
    });
    
    return {
      code: errorCode,
      message: userMessage,
      userMessage: 'You do not have permission to perform this action. Please make sure you are logged in.',
      isRetryable: false,
      requiresAuth: true,
      originalError: error,
    };
  }

  // Special handling for media insertion errors
  if (operation.includes('media') && errorCode === DB_ERROR_CODES.FOREIGN_KEY_VIOLATION) {
    return {
      code: errorCode,
      message: userMessage,
      userMessage: 'The post you are trying to add media to does not exist or has been deleted.',
      isRetryable: false,
      requiresAuth: false,
      originalError: error,
    };
  }

  return {
    code: errorCode,
    message: errorMessage,
    userMessage,
    isRetryable,
    requiresAuth: false,
    originalError: error,
  };
}

/**
 * Retry database operation with exponential backoff
 * @param {Function} operation - The database operation to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - Result of the operation or throws final error
 */
export async function retryDatabaseOperation(operation, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      
      // Log successful retry if it wasn't the first attempt
      if (attempt > 1) {
        logger.info(`Database operation succeeded on attempt ${attempt}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      const processedError = handleDatabaseError(error, 'retry operation');
      
      // Don't retry if the error is not retryable
      if (!processedError.isRetryable || attempt === maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(`Database operation failed on attempt ${attempt}, retrying in ${delay}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All retries failed, throw the last error
  throw lastError;
}

/**
 * Validate media insertion data before attempting database operation
 * @param {Array} mediaData - Array of media objects to insert
 * @param {string} postId - The post ID to associate media with
 * @param {string} userId - The user ID performing the operation
 * @returns {Object} - Validation result
 */
export function validateMediaInsertionData(mediaData, postId, userId) {
  const errors = [];
  
  if (!postId) {
    errors.push('Post ID is required');
  }
  
  if (!userId) {
    errors.push('User ID is required');
  }
  
  if (!Array.isArray(mediaData) || mediaData.length === 0) {
    errors.push('Media data must be a non-empty array');
  }
  
  mediaData.forEach((media, index) => {
    if (!media.media_url) {
      errors.push(`Media item ${index + 1}: URL is required`);
    }
    
    if (!media.media_type || !['image', 'video'].includes(media.media_type)) {
      errors.push(`Media item ${index + 1}: Valid media type is required (image or video)`);
    }
    
    if (!media.post_id && !media.forum_post_id) {
      errors.push(`Media item ${index + 1}: Post reference is required`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Enhanced media insertion with proper error handling and validation
 * @param {Object} supabase - Supabase client instance
 * @param {Array} mediaData - Array of media objects to insert
 * @param {string} postId - The post ID to associate media with
 * @param {string} userId - The user ID performing the operation
 * @returns {Promise} - Result of the insertion operation
 */
export async function insertForumPostMediaWithErrorHandling(supabase, mediaData, postId, userId) {
  // Validate input data
  const validation = validateMediaInsertionData(mediaData, postId, userId);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }
  
  // Ensure all media items have the correct post_id
  const normalizedMediaData = mediaData.map(media => ({
    ...media,
    post_id: postId, // Ensure consistent column naming
  }));
  
  // Attempt the insertion with retry logic
  return await retryDatabaseOperation(async () => {
    const { data, error } = await supabase
      .from('forum_post_media')
      .insert(normalizedMediaData)
      .select();
    
    if (error) {
      throw error;
    }
    
    logger.info(`Successfully inserted ${normalizedMediaData.length} media items for post ${postId}`);
    return data;
  }, 2, 1000); // Max 2 retries with 1 second base delay
}

/**
 * Check if user has permission to add media to a specific post
 * @param {Object} supabase - Supabase client instance
 * @param {string} postId - The post ID to check
 * @param {string} userId - The user ID to check permissions for
 * @returns {Promise<boolean>} - Whether user has permission
 */
export async function checkMediaInsertionPermission(supabase, postId, userId) {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('user_id')
      .eq('id', postId)
      .single();
    
    if (error) {
      logger.error('Error checking post ownership:', error);
      return false;
    }
    
    return data?.user_id === userId;
  } catch (error) {
    logger.error('Error in permission check:', error);
    return false;
  }
}