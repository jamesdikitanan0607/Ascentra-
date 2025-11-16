import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabaseClient';

interface Review {
  id: string;
  user_id: string;
  hiking_spot_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
  profiles?: {
    username?: string;
  }[];
}

interface ReviewSystemProps {
  hikingSpotId: string;
  onReviewsUpdate?: (reviews: Review[]) => void;
}

const COLORS = {
  primary: '#2E7D32',
  text: '#1F2933',
  textLight: '#546E7A',
  textMuted: '#9BA4AF',
  background: '#FFFFFF',
  card: '#F9F9F9',
  separator: '#E6E8EB',
  star: '#FFD700',
  error: '#F44336',
  success: '#4CAF50',
};

export default function ReviewSystem({ hikingSpotId, onReviewsUpdate }: ReviewSystemProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchReviews();
    getCurrentUser();
  }, [hikingSpotId]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error getting user:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          user_id,
          hiking_spot_id,
          rating,
          comment,
          created_at,
          profiles!inner(username)
        `)
        .eq('hiking_spot_id', hikingSpotId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reviewsWithUsernames = data?.map(review => ({
        ...review,
        user_name: review.profiles?.[0]?.username || 'Unnamed User'
      })) || [];

      setReviews(reviewsWithUsernames);
      onReviewsUpdate?.(reviewsWithUsernames);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to submit a review.');
      return;
    }

    if (userRating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }

    if (!userComment.trim()) {
      Alert.alert('Comment Required', 'Please write a comment before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          hiking_spot_id: hikingSpotId,
          rating: userRating,
          comment: userComment.trim(),
        });

      if (error) throw error;

      Alert.alert('Success', 'Your review has been submitted!');
      setUserRating(0);
      setUserComment('');
      fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onPress?: (rating: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => interactive && onPress?.(i)}
          disabled={!interactive}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={20}
            color={i <= rating ? COLORS.star : COLORS.textMuted}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Reviews & Ratings</Text>

      {/* Submit Review Section */}
      {user && (
        <View style={styles.submitSection}>
          <Text style={styles.submitTitle}>Share Your Experience</Text>
          
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Your Rating:</Text>
            {renderStars(userRating, true, setUserRating)}
          </View>

          <TextInput
            style={styles.commentInput}
            placeholder="Write your review here..."
            value={userComment}
            onChangeText={setUserComment}
            multiline
            numberOfLines={4}
            maxLength={500}
          />

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={submitReview}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Review</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Reviews List */}
      <View style={styles.reviewsList}>
        {reviews.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.user_name}</Text>
                  <Text style={styles.reviewDate}>{formatDate(review.created_at)}</Text>
                </View>
                
                <View style={styles.reviewRating}>
                  {renderStars(review.rating)}
                </View>
                
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noReviewsContainer}>
            <Ionicons name="chatbubble-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.noReviewsText}>No reviews yet</Text>
            <Text style={styles.noReviewsSubtext}>Be the first to share your experience!</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: COLORS.textLight,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  submitSection: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  submitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starButton: {
    padding: 2,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: COLORS.separator,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    textAlignVertical: 'top',
    marginBottom: 12,
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsList: {
    maxHeight: 400,
  },
  reviewItem: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  reviewRating: {
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textLight,
  },
  noReviewsContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noReviewsText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 12,
    marginBottom: 4,
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});