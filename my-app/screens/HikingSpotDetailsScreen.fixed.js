import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabaseClient';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useProfile } from '../contexts/ProfileContext';
import TrailMapComponent from '../components/TrailMapComponent';
import WeatherWidget from '../components/WeatherWidget';
import { formatDistance, formatElevation } from '../utils/formatters';

// Define a consistent color palette
const COLORS = {
  primary: '#388E3C',       // Dark green for primary elements
  secondary: '#388E3C',     // Same green for secondary elements
  text: '#212121',          // Almost black for text
  textLight: '#616161',     // Medium gray for secondary text
  textMuted: '#9E9E9E',     // Light gray for tertiary text
  background: '#FFFFFF',    // White background
  card: '#F9F9F9',         // Very light gray for cards
  separator: '#EEEEEE',    // Very light gray for separators
  star: '#388E3C',         // Green for star ratings
  error: '#F44336',        // Red for errors
  success: '#4CAF50',      // Green for success
  mapPlaceholder: '#F5F5F5' // Light gray for map placeholder
};

export default function HikingSpotDetailsScreen({ route, navigation }) {
  // Add null checks for route.params and extract spot data
  if (!route.params || (!route.params.spot && !route.params.spotId)) {
    console.error('HikingSpotDetailsScreen: Missing spot parameter or spotId');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: Missing hiking spot information</Text>
          <TouchableOpacity
            style={styles.errorBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const spotId = route.params.spot?.hiking_spot_id || route.params.spotId;
  const [spot, setSpot] = useState(route.params.spot || null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(!route.params.spot);
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [coordinates, setCoordinates] = useState(
    route.params.spot?.latitude && route.params.spot?.longitude
      ? {
        latitude: parseFloat(route.params.spot.latitude),
        longitude: parseFloat(route.params.spot.longitude)
      }
      : null
  );
  const [userEmails, setUserEmails] = useState({});
  const [commentsError, setCommentsError] = useState(null);

  // Profile context for favorites functionality
  const { addToFavorites, removeFromFavorites, isSpotFavorited, favoritesLoading } = useProfile();

  const getImageSource = (path) => {
    if (path && (path.startsWith('http://') || path.startsWith('https://'))) {
      return { uri: path };
    }

    const imageMap = {
      '../assets/images/spot1.jpg': require('../assets/images/mt manunggal/thumbnail.jpg'),
      '../assets/images/spot2.jpg': require('../assets/images/mt manunggal/thumbnail.jpg'),
      '../assets/images/spot3.jpg': require('../assets/images/mt naupa/thumbnail.jpg'),
      '../assets/images/spot4.jpg': require('../assets/images/mt mago/thumbnail.jpg'),
      '../assets/images/spot5.jpg': require('../assets/images/mt manunggal/thumbnail.jpg'),
    };

    try {
      return imageMap[path] || require('../assets/images/mt manunggal/thumbnail.jpg');
    } catch (error) {
      console.warn('Failed to load image:', path, error);
      return require('../assets/images/mt manunggal/thumbnail.jpg');
    }
  };

  useEffect(() => {
    fetchSpotDetails();
    fetchUser();
  }, [spotId]);

  async function fetchUser() {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setUser(data.user);
    }
  }

  async function fetchUserEmails(commentData) {
    if (!commentData.length || !user) return;

    try {
      const emails = {};

      if (user.email) {
        emails[user.id] = user.email;
      }

      setUserEmails(emails);
    } catch (error) {
      console.error("Error fetching user emails:", error);
    }
  }

  async function fetchSpotDetails() {
    if (!spotId) return;

    try {
      setLoading(true);

      // Only fetch spot details if not already provided in route params
      if (!spot) {
        const { data: spotData, error: spotError } = await supabase
          .from('hiking_spots')
          .select('*')
          .eq('hiking_spot_id', spotId)
          .single();

        if (spotError) throw spotError;
        setSpot(spotData);

        if (spotData.latitude && spotData.longitude) {
          setCoordinates({
            latitude: parseFloat(spotData.latitude),
            longitude: parseFloat(spotData.longitude)
          });
        }
      }

      try {
        // Try to fetch comments, but don't fail if the table doesn't exist
        const { data: commentData, error: commentError } = await supabase
          .from('hiking_spot_comments')
          .select(`
            id,
            comment_text,
            rating,
            created_at,
            user_id
          `)
          .eq('hiking_spot_id', spotId)
          .order('created_at', { ascending: false });

        if (!commentError && commentData) {
          // Only process comments if we got data back
          const commentsWithUsernames = await Promise.all(
            (commentData || []).map(async (comment) => {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', comment.user_id)
                .single();

              return {
                ...comment,
                profiles: profileData ? { username: profileData.username } : { username: 'Unknown User' }
              };
            })
          );

          setComments(commentsWithUsernames);
          fetchUserEmails(commentData);
        }
      } catch (commentsError) {
        console.warn('Could not load comments:', commentsError.message);
        setCommentsError('Could not load comments');
      }

    } catch (error) {
      console.error('Error fetching spot details:', error.message);
      Alert.alert('Error', 'Failed to load hiking spot details');
    } finally {
      setLoading(false);
    }
  }

  async function submitComment() {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to leave a review');
      return;
    }

    if (!userRating) {
      Alert.alert('Rating Required', 'Please select a rating');
      return;
    }

    if (!commentText.trim()) {
      Alert.alert('Comment Required', 'Please share your experience');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('hiking_spot_comments')
        .insert({
          hiking_spot_id: spotId,
          user_id: user.id,
          comment_text: commentText.trim(),
          rating: userRating
        });

      if (error) throw error;

      setCommentText('');
      setUserRating(0);

      fetchSpotDetails();

      Alert.alert('Success', 'Your review has been submitted!');
    } catch (error) {
      console.error('Error submitting comment:', error.message);
      Alert.alert('Error', 'Failed to submit your review');
    } finally {
      setSubmitting(false);
    }
  }

  const handleFavoriteToggle = async () => {
    if (favoritesLoading || !spot || !spot.hiking_spot_id) return;

    try {
      const isCurrentlyFavorited = isSpotFavorited(spot.hiking_spot_id);
      if (isCurrentlyFavorited) {
        await removeFromFavorites(spot.hiking_spot_id);
      } else {
        await addToFavorites({
          id: spot.hiking_spot_id,
          name: spot.name,
          location: spot.location || spot.location_text || 'Unknown Location',
          image_path: spot.image_url || spot.cover_image_url || null
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const openInMaps = (coords, label) => {
    const { latitude, longitude } = coords;
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${latitude},${longitude}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    Linking.openURL(url);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return '#4CAF50';
      case 'moderate':
        return '#FF9800';
      case 'hard':
      case 'difficult':
        return '#F44336';
      default:
        return COLORS.primary;
    }
  };

  function RatingStars({ rating, onRatingChange, disabled = false, size = 24 }) {
    return (
      <View style={styles.ratingStarsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            disabled={disabled}
            onPress={() => onRatingChange && onRatingChange(star)}
            style={styles.starButton}
          >
            <FontAwesome
              name={star <= rating ? "star" : "star-o"}
              size={size}
              color={COLORS.star}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading spot details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!spot) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={60} color={COLORS.error} />
          <Text style={styles.errorText}>Hiking spot not found</Text>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{spot.name}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>
                {spot.average_rating ? spot.average_rating.toFixed(1) : 'N/A'}
              </Text>
              <FontAwesome name="star" size={18} color={COLORS.star} />
              <Text style={styles.ratingCount}>
                ({spot.rating_count || 0} {spot.rating_count === 1 ? 'rating' : 'ratings'})
              </Text>
            </View>
          </View>

          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={18} color={COLORS.textLight} />
            <Text style={styles.location}>{spot.location}</Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialIcons name="straighten" size={20} color={COLORS.primary} />
              <Text style={styles.statValue}>
                {spot.distance_km ? formatDistance(spot.distance_km) : 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="terrain" size={20} color={COLORS.primary} />
              <Text style={styles.statValue}>
                {spot.elevation_gain_m ? formatElevation(spot.elevation_gain_m) : 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Elevation</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="fitness-center" size={20} color={COLORS.primary} />
              <Text style={[styles.statValue, { color: getDifficultyColor(spot.difficulty) }]}>
                {spot.difficulty || 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Difficulty</Text>
            </View>
          </View>

          {/* Favorite Button */}
          <TouchableOpacity
            style={[
              styles.favoriteButton,
              isSpotFavorited(spot?.hiking_spot_id) && styles.favoriteButtonActive
            ]}
            onPress={handleFavoriteToggle}
            disabled={favoritesLoading}
          >
            <Ionicons
              name={isSpotFavorited(spot?.hiking_spot_id) ? 'heart' : 'heart-outline'}
              size={24}
              color={isSpotFavorited(spot?.hiking_spot_id) ? '#FF6B6B' : COLORS.primary}
            />
            <Text style={[
              styles.favoriteButtonText,
              isSpotFavorited(spot?.hiking_spot_id) && styles.favoriteButtonTextActive
            ]}>
              {isSpotFavorited(spot?.hiking_spot_id) ? 'Remove from Favorites' : 'Add to Favorites'}
            </Text>
          </TouchableOpacity>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Trail</Text>
            <Text style={styles.descriptionText}>
              {spot.description || 'No description available.'}
            </Text>
          </View>

          {/* Map Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapContainer}>
              {coordinates ? (
                <TrailMapComponent
                  latitude={coordinates.latitude}
                  longitude={coordinates.longitude}
                  locationName={spot.location}
                />
              ) : (
                <View style={styles.mapPlaceholder}>
                  <Ionicons name="map-outline" size={40} color={COLORS.textMuted} />
                  <Text style={styles.mapPlaceholderText}>Map not available</Text>
                </View>
              )}
            </View>
          </View>

          {/* Weather Widget */}
          {coordinates && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Weather</Text>
              <WeatherWidget
                latitude={coordinates.latitude}
                longitude={coordinates.longitude}
              />
            </View>
          )}

          {/* Reviews Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Reviews {comments.length > 0 && `(${comments.length})`}
            </Text>

            {comments.length === 0 ? (
              <View style={styles.emptyReviewsContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={40} color={COLORS.textMuted} />
                <Text style={styles.noReviewsText}>No reviews yet. Be the first to review!</Text>
              </View>
            ) : (
              <View style={styles.reviewsContainer}>
                {comments.map(comment => (
                  <View key={comment.id} style={styles.commentCard}>
                    <View style={styles.commentHeader}>
                      <View style={styles.userInfo}>
                        <View style={styles.userAvatar}>
                          <Text style={styles.userInitial}>
                            {comment.profiles?.username
                              ? comment.profiles.username[0].toUpperCase()
                              : (userEmails[comment.user_id] ? userEmails[comment.user_id][0].toUpperCase() : 'A')}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.commentUser}>
                            {comment.profiles?.username ||
                              (userEmails[comment.user_id] ? userEmails[comment.user_id] : 'Anonymous')}
                          </Text>
                          <Text style={styles.commentDate}>
                            {new Date(comment.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.ratingBadge}>
                        <Text style={styles.ratingBadgeText}>{(comment.rating || 0).toFixed(1)}</Text>
                        <FontAwesome name="star" size={12} color="white" style={styles.ratingBadgeStar} />
                      </View>
                    </View>
                    <View style={styles.commentBodyContainer}>
                      <Text style={styles.commentText}>{comment.comment_text}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Add Review Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Leave a Review</Text>
            {user ? (
              <View>
                <View style={styles.ratingInputContainer}>
                  <Text style={styles.ratingLabel}>Your Rating:</Text>
                  <RatingStars
                    rating={userRating}
                    onRatingChange={setUserRating}
                    disabled={submitting}
                  />
                </View>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Share your experience..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={4}
                  value={commentText}
                  onChangeText={setCommentText}
                  editable={!submitting}
                />
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (submitting || !userRating || !commentText.trim()) && styles.submitButtonDisabled
                  ]}
                  onPress={submitComment}
                  disabled={submitting || !userRating || !commentText.trim()}
                >
                  {submitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Review</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.signInButton}
                onPress={() => navigation.navigate('Auth')}
              >
                <Text style={styles.signInButtonText}>Sign in to leave a review</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Add bottom spacing */}
          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorBackButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorBackButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 4,
  },
  ratingCount: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  location: {
    fontSize: 16,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  favoriteButtonActive: {
    backgroundColor: 'rgba(56, 142, 60, 0.1)',
  },
  favoriteButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  favoriteButtonTextActive: {
    color: COLORS.primary,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.mapPlaceholder,
    marginBottom: 16,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.mapPlaceholder,
  },
  mapPlaceholderText: {
    marginTop: 8,
    color: COLORS.textMuted,
  },
  emptyReviewsContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.card,
    borderRadius: 12,
  },
  noReviewsText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  reviewsContainer: {
    marginTop: 8,
  },
  commentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  commentUser: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  commentDate: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingBadgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 4,
  },
  ratingBadgeStar: {
    marginLeft: 2,
  },
  commentBodyContainer: {
    marginTop: 8,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
  ratingInputContainer: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  ratingStarsContainer: {
    flexDirection: 'row',
  },
  starButton: {
    padding: 4,
  },
  commentInput: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textMuted,
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  signInButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  signInButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.separator,
    marginVertical: 20,
  },
  goBackButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  goBackButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
