import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabaseClient';
import { formatDate } from '../utils/formatters';

interface ActivityFeedComponentProps {
  navigation: any;
  userId?: string;
  showCreatePost?: boolean;
}

interface Activity {
  id: string;
  title: string;
  description?: string;
  activity_type: string;
  distance?: number;
  duration?: number;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

const ActivityFeedComponent: React.FC<ActivityFeedComponentProps> = ({
  navigation,
  userId,
  showCreatePost = false,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = async () => {
    try {
      let query = supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activities:', error);
        Alert.alert('Error', 'Failed to load activities');
        return;
      }

      // Fetch usernames separately and normalize fields for UI
      const activitiesWithProfiles = await Promise.all(
        (data || []).map(async (activity: any) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url')
            .eq('id', activity.user_id)
            .single();

          // Normalize to match UI expectations
          const normalized = {
            ...activity,
            description:
              (activity as any).description ?? (activity as any).content ?? undefined,
            activity_type: (activity as any).activity_type ?? 'post',
          } as Activity & { content?: string };

          return {
            ...normalized,
            profiles: profileData || {
              username: 'Unnamed User',
              full_name: '',
              avatar_url: null,
            },
          } as Activity;
        })
      );

      setActivities(activitiesWithProfiles || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      Alert.alert('Error', 'Failed to load activities');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => navigation.navigate('ActivityDetails', { activityId: item.id })}
    >
      <View style={styles.activityHeader}>
        <View style={styles.activityInfo}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          <Text style={styles.activityType}>{item.activity_type}</Text>
        </View>
        <Text style={styles.activityDate}>{formatDate(item.created_at)}</Text>
      </View>
      
      {item.description && (
        <Text style={styles.activityDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.activityStats}>
        {item.distance && typeof item.distance === 'number' && (
          <View style={styles.statItem}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.distance.toFixed(1)} km</Text>
          </View>
        )}
        {item.duration && (
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.statText}>{Math.round(item.duration)} min</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading activities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showCreatePost && (
        <TouchableOpacity
          style={styles.createPostButton}
          onPress={() => navigation.navigate('SaveActivity')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
          <Text style={styles.createPostText}>Share an Activity</Text>
        </TouchableOpacity>
      )}
      
      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        nestedScrollEnabled={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {userId ? 'No activities yet' : 'No activities to show'}
            </Text>
            {showCreatePost && (
              <Text style={styles.emptySubtext}>
                Start tracking your hikes and activities!
              </Text>
            )}
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    color: '#666',
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  createPostText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  activityItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  activityType: {
    fontSize: 14,
    color: '#4CAF50',
    textTransform: 'capitalize',
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  activityStats: {
    flexDirection: 'row',
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default ActivityFeedComponent;