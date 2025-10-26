# Implementation Plan

- [x] 1. Fix Supabase RLS policies and database security issues





  - [ ] 1.1 Diagnose and fix forum_post_media RLS policy violations
    - Investigate current RLS policies on forum_post_media table
    - Create or update RLS policy to allow authenticated users to insert media for their own posts
    - Implement policy: `auth.uid() = (SELECT user_id FROM forum_posts WHERE id = post_id)`
    - Test policy with sample insert operations to verify fix


    - _Requirements: Critical bug fix for media insertion_

  - [ ] 1.2 Verify and fix media upload and insertion flow
    - Review current media upload code to identify where forum_post_media insert fails
    - Ensure proper error handling and transaction management for media uploads

    - Verify that post_id, user_id, and media_url are correctly populated during insert
    - Add proper validation and error logging for media insertion operations
    - _Requirements: Critical bug fix for media persistence_

  - [ ] 1.3 Create database migration scripts for RLS policies
    - Write SQL migration to create/update forum_post_media RLS policies

    - Add policies for SELECT, INSERT, UPDATE, DELETE operations
    - Ensure policies are secure and only allow access to user's own media
    - Test policies with different user scenarios and edge cases
    - _Requirements: Database security and policy management_

  - [ ] 1.4 Add comprehensive error handling for database operations
    - Implement specific error handling for RLS policy violations (42501)
    - Add retry logic for transient database errors
    - Create user-friendly error messages for different database failure scenarios
    - Add logging and monitoring for database operation failures
    - _Requirements: Robust error handling and user feedback_

- [ ] 2. Fix media upload and insertion backend logic
  - [ ] 2.1 Identify and fix media upload service issues
    - Locate the media upload service/function that handles forum post media
    - Debug why forum_post_media insert is failing with RLS violations
    - Ensure proper user authentication context is passed to database operations
    - Verify that media upload waits for database insert completion before proceeding
    - _Requirements: Critical bug fix for media upload flow_

  - [ ] 2.2 Implement robust media insertion with proper error handling
    - Add transaction management for media upload and database insert operations
    - Implement rollback logic if media insert fails after successful storage upload
    - Add comprehensive logging for debugging media upload failures
    - Ensure proper cleanup of uploaded files if database operations fail
    - _Requirements: Data consistency and error recovery_

  - [ ] 2.3 Add media upload validation and security checks
    - Validate media file types, sizes, and formats before upload
    - Implement proper user authorization checks before allowing media uploads
    - Add rate limiting and abuse prevention for media uploads
    - Ensure uploaded media URLs are properly validated and sanitized
    - _Requirements: Security and data validation_

  - [ ] 2.4 Test media upload flow end-to-end
    - Create test cases for successful media upload and insertion
    - Test error scenarios including RLS violations and network failures
    - Verify that media appears correctly in MediaViewerScreen after upload
    - Test with different user roles and permissions
    - _Requirements: Comprehensive testing of upload flow_

- [ ] 3. Install and configure required dependencies
  - Install expo-image package for optimized image rendering
  - Install expo-video package for video support (replacing deprecated expo-av)
  - Install @react-native-community/netinfo for network monitoring
  - Update package.json and verify compatibility with Expo SDK 54+
  - _Requirements: 1.1, 2.4, 4.4, 5.4_

- [ ] 4. Create core utility modules and interfaces
  - [ ] 4.1 Create TypeScript interfaces for media data models
    - Define MediaItem, CacheMetadata, MediaViewerState interfaces
    - Create RouteParams and error handling type definitions
    - Add performance monitoring and cache statistics types
    - _Requirements: 1.2, 4.1, 6.1_

  - [ ] 4.2 Implement CacheManager utility class
    - Create memory and disk cache management system
    - Implement LRU cache eviction strategy
    - Add cache statistics and monitoring capabilities
    - Implement automatic cleanup and memory management
    - _Requirements: 2.2, 2.3, 2.4, 6.3_

  - [ ] 4.3 Create MediaResolver utility class
    - Implement media source resolution with priority handling (params > cache > database)
    - Add retry logic with exponential backoff for failed requests
    - Implement timeout handling and fallback strategies
    - Add comprehensive error classification and handling
    - _Requirements: 1.2, 1.3, 1.4, 4.2_

  - [ ] 4.4 Write unit tests for utility classes
    - Create tests for CacheManager functionality
    - Test MediaResolver priority and fallback logic
    - Add error handling and edge case tests
    - _Requirements: 4.1, 4.2_

- [ ] 5. Implement optimized media rendering components
  - [ ] 5.1 Create OptimizedMediaItem component
    - Replace React Native Image with expo-image for better performance
    - Implement progressive loading (placeholder → low quality → high quality)
    - Add loading states, error handling, and retry functionality
    - Implement proper image sizing and aspect ratio handling
    - _Requirements: 1.1, 2.1, 3.1, 6.4_

  - [ ] 5.2 Create MediaCarousel component with FlatList optimization
    - Implement FlatList with getItemLayout, keyExtractor, and removeClippedSubviews
    - Add smart prefetching for adjacent images based on scroll direction
    - Implement proper index tracking and smooth navigation
    - Add pagination indicators and gesture handling
    - _Requirements: 2.1, 2.2, 5.5, 6.1_

  - [ ] 5.3 Implement video support component for Expo SDK 54+
    - Create VideoMediaItem component using expo-video package
    - Add video thumbnail display and play button overlay
    - Implement proper video loading states and error handling
    - Add video controls and fullscreen support
    - _Requirements: 5.4_

  - [ ] 5.4 Write component tests
    - Test OptimizedMediaItem loading states and error handling
    - Test MediaCarousel scrolling and prefetching behavior
    - Test video component functionality
    - _Requirements: 1.1, 2.1_

- [ ] 6. Implement state management and hooks
  - [ ] 6.1 Create useMediaResolver custom hook
    - Implement media resolution logic with proper cleanup
    - Add loading state management and error handling
    - Implement useEffect cleanup to prevent memory leaks
    - Add network status monitoring and adaptive behavior
    - _Requirements: 1.2, 1.5, 4.3, 4.4_

  - [ ] 6.2 Create useImageCache custom hook
    - Implement image prefetching and caching logic
    - Add memory usage monitoring and automatic cleanup
    - Implement cache hit/miss tracking and statistics
    - Add background cache maintenance and optimization
    - _Requirements: 2.2, 2.3, 6.2, 6.3_

  - [ ] 6.3 Create useLoadingState custom hook
    - Implement comprehensive loading state management
    - Add progress tracking and estimated time calculations
    - Implement retry logic and error state handling
    - Add timeout management and fallback strategies
    - _Requirements: 1.4, 1.5, 3.1, 3.2_

  - [ ] 6.4 Write hook tests
    - Test useMediaResolver with different scenarios
    - Test useImageCache memory management
    - Test useLoadingState transitions
    - _Requirements: 4.3, 4.4_

- [ ] 7. Refactor MediaViewerScreen with new architecture
  - [ ] 7.1 Update MediaViewerScreen main component structure
    - Integrate new utility classes and custom hooks
    - Implement proper component lifecycle management
    - Add comprehensive error boundaries and fallback UI
    - Implement accessibility features and screen reader support
    - _Requirements: 1.1, 1.5, 4.3, 4.4_

  - [ ] 7.2 Implement enhanced media resolution logic
    - Replace existing media resolution with new MediaResolver
    - Add proper priority handling for different data sources
    - Implement database query optimization and caching
    - Add comprehensive logging and debugging capabilities
    - _Requirements: 1.2, 5.1, 5.2, 5.3_

  - [ ] 7.3 Integrate optimized rendering components
    - Replace existing FlatList with new MediaCarousel component
    - Integrate OptimizedMediaItem for better image rendering
    - Add video support using new VideoMediaItem component
    - Implement proper component memoization and optimization
    - _Requirements: 2.1, 2.5, 5.4, 6.5_

  - [ ] 7.4 Add comprehensive error handling and user feedback
    - Implement different error states with appropriate UI
    - Add manual retry functionality and progress indicators
    - Implement fallback strategies for different error types
    - Add user-friendly error messages and recovery options
    - _Requirements: 1.3, 1.4, 3.3, 3.5_

- [ ] 8. Implement performance optimizations and monitoring
  - [ ] 8.1 Add memory management and monitoring
    - Implement memory usage tracking and alerts
    - Add automatic cache cleanup based on memory pressure
    - Implement image recycling and garbage collection optimization
    - Add performance metrics collection and reporting
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 8.2 Implement network-aware optimizations
    - Add network quality detection and adaptive behavior
    - Implement connection-based image quality adjustment
    - Add offline support and cached content fallbacks
    - Implement request deduplication and concurrent limits
    - _Requirements: 3.2, 3.3, 6.2_

  - [ ] 8.3 Add prefetching and lazy loading optimizations
    - Implement intelligent prefetching based on user behavior
    - Add lazy loading for off-screen images
    - Implement progressive image loading with quality tiers
    - Add background prefetching for frequently accessed content
    - _Requirements: 2.2, 3.4, 6.1_

  - [ ] 8.4 Add performance monitoring and analytics
    - Implement loading time tracking and optimization metrics
    - Add cache hit rate monitoring and reporting
    - Create performance dashboard for debugging
    - Add automated performance regression detection
    - _Requirements: 6.1, 6.2_

- [ ] 9. Create navigation examples and integration guides
  - [ ] 9.1 Create example navigation implementations
    - Write example code for navigating with postId only
    - Create examples for pre-loaded media array navigation
    - Add examples for mixed navigation scenarios
    - Document proper parameter passing and error handling
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 9.2 Update existing navigation calls throughout the app
    - Find and update all existing MediaViewerScreen navigation calls
    - Ensure proper parameter passing and error handling
    - Add proper TypeScript types for navigation parameters
    - Test all navigation scenarios and edge cases
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ] 10. Final integration testing and optimization
  - [ ] 10.1 Perform comprehensive integration testing
    - Test complete media loading flow from navigation to display
    - Test error scenarios and recovery mechanisms
    - Verify performance improvements and memory usage
    - Test on different devices and network conditions
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 10.2 Optimize and fine-tune performance
    - Profile memory usage and optimize cache settings
    - Fine-tune prefetching algorithms and cache policies
    - Optimize image loading and rendering performance
    - Adjust timeout values and retry strategies based on testing
    - _Requirements: 2.1, 2.2, 6.1, 6.2, 6.3_

  - [ ] 10.3 Create comprehensive documentation
    - Document new architecture and component usage
    - Create troubleshooting guide for common issues
    - Add performance tuning guide and best practices
    - Document cache management and optimization strategies
    - _Requirements: 4.1, 4.2_