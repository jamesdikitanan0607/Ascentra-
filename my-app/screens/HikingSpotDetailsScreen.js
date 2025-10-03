import { useState, useEffect } from 'react'
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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../services/supabaseClient'
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons'
import { useProfile } from '../contexts/ProfileContext'
import TrailMapComponent from '../components/TrailMapComponent'
import WeatherWidget from '../components/WeatherWidget'
import { formatDistance, formatElevation } from '../utils/formatters'

// Define a consistent color palette
const COLORS = {
  primary: '#388E3C',       // Dark green for primary elements
  secondary: '#388E3C',     // Same green for secondary elements
  text: '#212121',          // Almost black for text
  textLight: '#616161',     // Medium gray for secondary text
  textMuted: '#9E9E9E',     // Light gray for tertiary text
  background: '#FFFFFF',    // White background
  card: '#F9F9F9',          // Very light gray for cards
  separator: '#EEEEEE',     // Very light gray for separators
  star: '#388E3C',          // Green for star ratings
  error: '#F44336',         // Red for errors
  success: '#4CAF50',       // Green for success
  mapPlaceholder: '#F5F5F5' // Light gray for map placeholder
}

export default function HikingSpotDetailsScreen({ route, navigation }) {
  // Add null checks for route.params and extract spot data
  if (!route.params || !route.params.spot) {
    console.error('HikingSpotDetailsScreen: Missing spot parameter');
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

  const { spot: spotParam } = route.params;
  const spotId = spotParam.id || spotParam.spotId;
  const [spot, setSpot] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [userRating, setUserRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState(null)
  const [coordinates, setCoordinates] = useState(null)
  const [userEmails, setUserEmails] = useState({});
  
  // Profile context for favorites functionality
  const { addToFavorites, removeFromFavorites, isSpotFavorited, favoritesLoading } = useProfile();

  const getImageSource = (path) => {
    if (path && (path.startsWith('http://') || path.startsWith('https://'))) {
      return { uri: path };
    }
    
    const imageMap = {
      '../assets/images/spot1.jpg': require('../assets/images/mt manunggal/thumbnail.jpg'),
      '../assets/images/spot2.jpg': require('../assets/images/budlaanfalls/thumbnail.jpg'),
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
    fetchSpotDetails()
    fetchUser()
  }, [spotId])

  async function fetchUser() {
    const { data } = await supabase.auth.getUser()
    if (data?.user) {
      setUser(data.user)
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
    try {
      setLoading(true)
      
      const { data: spotData, error: spotError } = await supabase
        .from('hiking_spots')
        .select('*')
        .eq('id', spotId)
        .single()
      
      if (spotError) throw spotError
      setSpot(spotData)
      
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
        .order('created_at', { ascending: false })
      
      if (commentError) throw commentError
      
      // Fetch usernames separately
      const commentsWithUsernames = await Promise.all(
        (commentData || []).map(async (comment) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', comment.user_id)
            .single()
          
          return {
            ...comment,
            profiles: profileData ? { username: profileData.username } : { username: 'Unknown User' }
          }
        })
      )
      
      setComments(commentsWithUsernames)
      
      fetchUserEmails(commentData);

      if (spotData.latitude && spotData.longitude) {
        setCoordinates({
          latitude: spotData.latitude,
          longitude: spotData.longitude
        })
      } else {
        setCoordinates({ latitude: 10.3157, longitude: 123.8854 })
      }
      
    } catch (error) {
      console.error('Error fetching spot details:', error.message)
      Alert.alert('Error', 'Failed to load hiking spot details')
    } finally {
      setLoading(false)
    }
  }

  async function submitComment() {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to leave a review')
      return
    }
    
    if (!userRating) {
      Alert.alert('Rating Required', 'Please select a rating')
      return
    }
    
    if (!commentText.trim()) {
      Alert.alert('Comment Required', 'Please share your experience')
      return
    }
    
    try {
      setSubmitting(true)
      
      const { error } = await supabase
        .from('hiking_spot_comments')
        .insert({
          hiking_spot_id: spotId,
          user_id: user.id,
          comment_text: commentText.trim(),
          rating: userRating
        })
      
      if (error) throw error
      
      setCommentText('')
      setUserRating(0)
      
      fetchSpotDetails()
      
      Alert.alert('Success', 'Your review has been submitted!')
    } catch (error) {
      console.error('Error submitting comment:', error.message)
      Alert.alert('Error', 'Failed to submit your review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFavoriteToggle = async () => {
    if (favoritesLoading || !spot) return;
    
    try {
      const isCurrentlyFavorited = isSpotFavorited(spot.id);
      if (isCurrentlyFavorited) {
        await removeFromFavorites(spot.id);
      } else {
        await addToFavorites({
          id: spot.id,
          name: spot.name,
          location: spot.location,
          image_path: spot.image_path
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
    )
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
    )
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
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image 
            source={getImageSource(spot.image_url)}
            style={styles.heroImage} 
            resizeMode="cover"
          />
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
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
              <Text style={styles.statValue}>{spot.distance_km ? formatDistance(spot.distance_km) : 'N/A'}</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="terrain" size={20} color={COLORS.primary} />
              <Text style={styles.statValue}>{spot.elevation_gain_m ? formatElevation(spot.elevation_gain_m) : 'N/A'}</Text>
              <Text style={styles.statLabel}>Elevation</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="fitness-center" size={20} color={COLORS.primary} />
              <Text style={styles.statValue}>{spot.difficulty || 'N/A'}</Text>
              <Text style={styles.statLabel}>Difficulty</Text>
            </View>
          </View>
          
          {/* Favorite Button */}
          <TouchableOpacity 
            style={[
              styles.favoriteButton,
              isSpotFavorited(spot?.id) && styles.favoriteButtonActive
            ]}
            onPress={handleFavoriteToggle}
            disabled={favoritesLoading}
          >
            <Ionicons 
              name={isSpotFavorited(spot?.id) ? 'heart' : 'heart-outline'} 
              size={24} 
              color={isSpotFavorited(spot?.id) ? '#FF6B6B' : COLORS.primary} 
            />
            <Text style={[
              styles.favoriteButtonText,
              isSpotFavorited(spot?.id) && styles.favoriteButtonTextActive
            ]}>
              {isSpotFavorited(spot?.id) ? 'Remove from Favorites' : 'Add to Favorites'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Description</Text>
            <Text style={styles.description}>{spot.description}</Text>
          </View>

          <View style={styles.divider} />

          {/* Trail Map */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🗺️ Trail Map</Text>
            <TrailMapComponent
              hikingSpotId={spot.id.toString()}
              spotName={spot.name}
              latitude={parseFloat(spot.latitude) || 0}
              longitude={parseFloat(spot.longitude) || 0}
            />
          </View>

          <View style={styles.divider} />

          {/* Trail Routes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🥾 Trail Routes</Text>
            <View style={styles.routesContainer}>
              <View style={styles.routeCard}>
                <View style={styles.routeHeader}>
                  <Text style={styles.routeName}>Main Trail</Text>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(spot.difficulty) }]}>
                    <Text style={styles.difficultyText}>{spot.difficulty}</Text>
                  </View>
                </View>
                <View style={styles.routeStats}>
                  <View style={styles.routeStat}>
                    <Ionicons name="trail-sign-outline" size={16} color={COLORS.textMuted} />
                    <Text style={styles.routeStatText}>{spot.distance_km ? formatDistance(spot.distance_km) : 'N/A'}</Text>
                  </View>
                  <View style={styles.routeStat}>
                    <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
                    <Text style={styles.routeStatText}>{spot.duration || 'N/A'}</Text>
                  </View>
                  <View style={styles.routeStat}>
                    <Ionicons name="trending-up-outline" size={16} color={COLORS.textMuted} />
                    <Text style={styles.routeStatText}>{spot.elevation_gain_m ? formatElevation(spot.elevation_gain_m) : 'N/A'}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Trail Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ Trail Information</Text>
            <View style={styles.trailInfoContainer}>
              <View style={styles.infoItem}>
                <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Best Time to Visit</Text>
                  <Text style={styles.infoText}>Early morning (6:00 AM - 9:00 AM) for cooler weather and better visibility</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="warning-outline" size={20} color={COLORS.accent} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Safety Tips</Text>
                  <Text style={styles.infoText}>Bring plenty of water, wear proper hiking shoes, and inform someone of your hiking plans</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="leaf-outline" size={20} color={COLORS.secondary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Trail Conditions</Text>
                  <Text style={styles.infoText}>Well-maintained trail with clear markers. Some rocky sections may require careful footing</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Current Weather */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌤️ Current Weather</Text>
            <WeatherWidget
              latitude={parseFloat(spot.latitude) || 0}
              longitude={parseFloat(spot.longitude) || 0}
              locationName={spot.location}
            />
          </View>

          <View style={styles.divider} />
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Write a Review</Text>
            <View style={styles.reviewCard}>
              <Text style={styles.ratingLabel}>Your Rating:</Text>
              <RatingStars rating={userRating} onRatingChange={setUserRating} />
              
              <TextInput
                style={styles.commentInput}
                placeholder="Share your experience..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
                textAlignVertical="top"
                placeholderTextColor={COLORS.textMuted}
              />
              
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  submitting && styles.submitButtonDisabled
                ]}
                onPress={submitComment}
                disabled={submitting}
              >
                {submitting ? (
                  <View style={styles.submitButtonContent}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.submitButtonText}>Submitting...</Text>
                  </View>
                ) : (
                  <View style={styles.submitButtonContent}>
                    <Text style={styles.submitButtonText}>Submit Review</Text>
                    <Ionicons name="send" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
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
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    position: 'relative',
    height: 280,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: COLORS.textLight,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  goBackButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    minWidth: 120,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  goBackButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  heroImage: {
    height: '100%',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 35,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  contentContainer: {
    padding: 24,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    letterSpacing: -0.5,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  ratingCount: {
    color: COLORS.textLight,
    marginLeft: 5,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    fontSize: 16,
    color: COLORS.textLight,
    marginLeft: 5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.separator,
    marginVertical: 16,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  mapSection: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    elevation: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: COLORS.mapPlaceholder,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  mapPlaceholderText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginTop: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  map: {
    height: 200,
    width: '100%',
    borderRadius: 16,
  },
  directionsButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    margin: 12,
    borderRadius: 30,
    elevation: 0,
  },
  directionsButtonText: {
    color: 'white',
    fontWeight: '600',
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  reviewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    elevation: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  ratingLabel: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  ratingStarsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  starButton: {
    padding: 2,
    marginRight: 6,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: COLORS.separator,
    borderRadius: 12,
    padding: 14,
    minHeight: 100,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 0,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginHorizontal: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  favoriteButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: '#FF6B6B',
  },
  favoriteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  favoriteButtonTextActive: {
    color: '#FF6B6B',
  },
  emptyReviewsContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.separator,
    borderStyle: 'dashed',
  },
  noReviewsText: {
    fontStyle: 'italic',
    color: COLORS.textMuted,
    marginTop: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  reviewsContainer: {
    gap: 16,
  },
  commentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
    elevation: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
    backgroundColor: 'rgba(56, 142, 60, 0.05)', // Very light green background
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '80%',
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
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  commentUser: {
    fontWeight: '600',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  commentDate: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  ratingBadge: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    minWidth: 50,
  },
  ratingBadgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  ratingBadgeStar: {
    marginBottom: 1,
  },
  commentBodyContainer: {
    padding: 16,
    backgroundColor: COLORS.background,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  // New section styles
  routesContainer: {
    gap: 12,
  },
  routeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.separator,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeStatText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  trailInfoContainer: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  errorBackButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorBackButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
})