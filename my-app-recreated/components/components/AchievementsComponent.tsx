import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabaseClient';

interface AchievementsComponentProps {
  userId: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  target?: number;
}

const AchievementsComponent: React.FC<AchievementsComponentProps> = ({ userId }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHikes: 0,
    totalDistance: 0,
    totalDuration: 0,
  });

  useEffect(() => {
    fetchUserStats();
  }, [userId]);

  const fetchUserStats = async () => {
    try {
      if (!userId) {
        setLoading(false);
        return;
      }

      // Fetch user's hiking statistics
      const { data: activities, error } = await supabase
        .from('activities')
        .select('distance, duration')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user stats:', error);
        setLoading(false);
        return;
      }

      const totalHikes = activities?.length || 0;
      const totalDistance = activities?.reduce((sum, activity) => sum + (activity.distance || 0), 0) || 0;
      const totalDuration = activities?.reduce((sum, activity) => sum + (activity.duration || 0), 0) || 0;

      setStats({ totalHikes, totalDistance, totalDuration });
      generateAchievements(totalHikes, totalDistance, totalDuration);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAchievements = (hikes: number, distance: number, duration: number) => {
    const achievementsList: Achievement[] = [
      {
        id: '1',
        title: 'First Steps',
        description: 'Complete your first hike',
        icon: 'footsteps-outline',
        earned: hikes >= 1,
        earnedDate: hikes >= 1 ? new Date().toISOString() : undefined,
      },
      {
        id: '2',
        title: 'Trail Explorer',
        description: 'Complete 5 hikes',
        icon: 'map-outline',
        earned: hikes >= 5,
        progress: hikes,
        target: 5,
      },
      {
        id: '3',
        title: 'Distance Walker',
        description: 'Walk 50km total',
        icon: 'walk-outline',
        earned: distance >= 50,
        progress: distance,
        target: 50,
      },
      {
        id: '4',
        title: 'Endurance Hiker',
        description: 'Spend 20 hours hiking',
        icon: 'time-outline',
        earned: duration >= 1200, // 20 hours in minutes
        progress: Math.round(duration / 60), // Convert to hours
        target: 20,
      },
      {
        id: '5',
        title: 'Dedicated Hiker',
        description: 'Complete 25 hikes',
        icon: 'trophy-outline',
        earned: hikes >= 25,
        progress: hikes,
        target: 25,
      },
      {
        id: '6',
        title: 'Century Walker',
        description: 'Walk 100km total',
        icon: 'medal-outline',
        earned: distance >= 100,
        progress: distance,
        target: 100,
      },
    ];

    setAchievements(achievementsList);
  };

  const renderAchievement = ({ item }: { item: Achievement }) => {
    const progressPercentage = item.target ? Math.min((item.progress || 0) / item.target * 100, 100) : 0;

    return (
      <View style={[styles.achievementItem, item.earned && styles.earnedAchievement]}>
        <View style={styles.achievementIcon}>
          <Ionicons
            name={item.icon as any}
            size={32}
            color={item.earned ? '#4CAF50' : '#ccc'}
          />
        </View>
        <View style={styles.achievementContent}>
          <Text style={[styles.achievementTitle, item.earned && styles.earnedTitle]}>
            {item.title}
          </Text>
          <Text style={styles.achievementDescription}>{item.description}</Text>
          {!item.earned && item.target && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progressPercentage}%` }]}
                />
              </View>
              <Text style={styles.progressText}>
                {typeof item.progress === 'number' ? item.progress.toFixed(item.title.includes('Distance') ? 1 : 0) : 0} / {item.target}
              </Text>
            </View>
          )}
          {item.earned && (
            <View style={styles.earnedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.earnedText}>Earned</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading achievements...</Text>
      </View>
    );
  }

  const earnedCount = achievements.filter(a => a.earned).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Achievements</Text>
        <Text style={styles.headerSubtitle}>
          {earnedCount} of {achievements.length} earned
        </Text>
      </View>
      
      <FlatList
        data={achievements}
        renderItem={renderAchievement}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No achievements yet</Text>
            <Text style={styles.emptySubtext}>Start hiking to earn achievements!</Text>
          </View>
        }
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  achievementItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  earnedAchievement: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  achievementIcon: {
    marginRight: 15,
    justifyContent: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  earnedTitle: {
    color: '#4CAF50',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  earnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  earnedText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
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

export default AchievementsComponent;