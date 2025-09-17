import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../contexts/ProfileContext';
import { supabase } from '../services/supabaseClient';

interface Review {
  id: string;
  user_id: string;
  hiking_spot_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

interface ReviewSystemProps {
  hikingSpotId: string;
  onReviewAdded?: () => void;
}

const COLORS = {
  primary: '#388E3C',
  secondary: '#4CAF50',
  text: '#212121',
  textLight: '#616161',
  textMuted: '#9E9E9E',
  background: '#FFFFFF',
  card: '#F9F9F9',
  separator: '#EEEEEE',
  star: '#FFD700',
  error: '#F44336',
  success: '#4CAF50',
};

export default function ReviewSystem({ hikingSpotId, onReviewAdded }: ReviewSystemProps) {
  const { profile } = useProfile();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [hikingSpotId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      // Fetch reviews with user information
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('hiking_spot_id', hikingSpotId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        return;
      }

      const formattedReviews = reviewsData?.map(review => ({
        ...review,
        user_name: review.profiles?.full_name || 'Anonymous User',
        user_avatar: review.profiles?.avatar_url,
      })) || [];

      setReviews(formattedReviews);
      
      // Calculate average rating
      if (formattedReviews.length > 0) {
        const avgRating = formattedReviews.reduce((sum, review) => sum + review.rating, 0) / formattedReviews.length;
        setAverageRating(avgRating);
        setTotalReviews(formattedReviews.length);
      } else {
        setAverageRating(0);
        setTotalReviews(0);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!profile?.id) {
      Alert.alert('Authentication Required', 'Please sign in to leave a review.');
      return;
    }

    if (newRating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }

    if (newComment.trim().length < 10) {
      Alert.alert('Comment Too Short', 'Please write at least 10 characters in your review.');
      return;
    }

    try {
      setSubmitting(true);

      // Check if user already reviewed this spot
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('hiking_spot_id', hikingSpotId)
        .eq('user_id', profile.id)
        .single();

      if (existingReview) {
        Alert.alert('Review Exists', 'You have already reviewed this hiking spot. You can edit your existing review.');
        return;
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          hiking_spot_id: hikingSpotId,
          user_id: profile.id,
          rating: newRating,
          comment: newComment.trim(),
        });

      if (error) {
        console.error('Error submitting review:', error);
        Alert.alert('Error', 'Failed to submit review. Please try again.');
        return;
      }

      // Reset form
      setNewRating(0);
      setNewComment('');
      setShowAddReview(false);
      
      // Refresh reviews
      await fetchReviews();
      
      // Notify parent component
      onReviewAdded?.();
      
      Alert.alert('Success', 'Your review has been submitted!');
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onPress?: (rating: number) => void) => {
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
            size={interactive ? 24 : 16}
            color={COLORS.star}
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
      {/* Reviews Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {totalReviews > 0 && (
            <View style={styles.ratingOverview}>
              {renderStars(Math.round(averageRating))}
              <Text style={styles.averageRating}>
                {averageRating.toFixed(1)} ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.addReviewButton}
          onPress={() => setShowAddReview(true)}
        >
          <Ionicons name="add" size={20} color={COLORS.primary} />
          <Text style={styles.addReviewButtonText}>Add Review</Text>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <ScrollView style={styles.reviewsList} showsVerticalScrollIndicator={false}>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={20} color={COLORS.textLight} />
                  </View>
                  <View style={styles.reviewerDetails}>
                    <Text style={styles.reviewerName}>{review.user_name}</Text>
                    <Text style={styles.reviewDate}>{formatDate(review.created_at)}</Text>
                  </View>
                </View>
                {renderStars(review.rating)}
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noReviewsContainer}>
          <Ionicons name="chatbubble-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.noReviewsText}>
            No reviews yet. Be the first to share your experience!
          </Text>
        </View>
      )}

      {/* Add Review Modal */}
      <Modal
        visible={showAddReview}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddReview(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowAddReview(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Write a Review</Text>
            <TouchableOpacity
              onPress={submitReview}
              disabled={submitting || newRating === 0}
              style={[
                styles.modalSubmitButton,
                (submitting || newRating === 0) && styles.modalSubmitButtonDisabled
              ]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.background} />
              ) : (
                <Text style={styles.modalSubmitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.ratingLabel}>Rating *</Text>
            {renderStars(newRating, true, setNewRating)}

            <Text style={styles.commentLabel}>Your Review *</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Share your experience hiking here..."
              placeholderTextColor={COLORS.textMuted}
              value={newComment}
              onChangeText={setNewComment}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.characterCount}>
              {newComment.length}/500 characters
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageRating: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addReviewButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  reviewsList: {
    maxHeight: 400,
  },
  reviewCard: {
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
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.separator,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  noReviewsContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.separator,
    borderStyle: 'dashed',
  },
  noReviewsText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starButton: {
    marginRight: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalSubmitButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  modalSubmitButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  modalSubmitButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.separator,
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 8,
  },
});