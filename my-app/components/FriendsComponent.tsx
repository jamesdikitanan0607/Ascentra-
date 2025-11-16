import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabaseClient';
import { getFriendsList, sendFriendRequest, removeFriend } from '../services/friendService';

interface FriendsComponentProps {
  navigation: any;
  userId?: string;
  ListHeaderComponent?: React.ReactElement | null;
}

interface Friend {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  skill_level?: string;
  mutual_friends?: number;
  is_following?: boolean;
}

const FriendsComponent: React.FC<FriendsComponentProps> = ({
  navigation,
  userId,
  ListHeaderComponent,
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'suggestions'>('friends');
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [pendingOutgoing, setPendingOutgoing] = useState<Set<string>>(new Set());
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFriends();
  }, [userId, activeTab]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`friends-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friend_requests', filter: `sender_id=eq.${userId}` }, () => fetchFriends())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friend_requests', filter: `receiver_id=eq.${userId}` }, () => fetchFriends())
      .subscribe();
    return () => { try { supabase.removeChannel(channel); } catch {} };
  }, [userId, activeTab]);

  const fetchFriends = async () => {
    try {
      if (!userId) {
        setLoading(false);
        return;
      }
      // Accepted follows via service (supports local fallback)
      const acceptedProfiles = await getFriendsList(userId);
      const acceptedIds = new Set<string>((acceptedProfiles || []).map((p: any) => p.id));
      const { data: pendingRows } = await supabase
        .from('friend_requests')
        .select('receiver_id')
        .eq('sender_id', userId)
        .eq('status', 'pending');
      const pendingSet = new Set<string>((pendingRows || []).map((r: any) => r.receiver_id));

      setFollowingIds(acceptedIds);
      setPendingOutgoing(pendingSet);

      if (activeTab === 'friends') {
        // Following tab: show accepted profiles + pending outgoing (as following, with pending icon)
        const acceptedMapped: Friend[] = (acceptedProfiles || []).map((p: any) => ({
          id: p.id,
          username: p.username || 'User',
          full_name: p.full_name || undefined,
          avatar_url: p.avatar_url || undefined,
          skill_level: p.skill_level || undefined,
          is_following: true,
        }));
        let pendingMapped: Friend[] = [];
        const pendingIds = Array.from(pendingSet);
        if (pendingIds.length) {
          const { data: pendProfs } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, skill_level')
            .in('id', pendingIds);
          pendingMapped = (pendProfs || []).map((p: any) => ({
            id: p.id,
            username: p.username || 'User',
            full_name: p.full_name || undefined,
            avatar_url: p.avatar_url || undefined,
            skill_level: p.skill_level || undefined,
            is_following: true,
          }));
        }
        setFriends([...acceptedMapped, ...pendingMapped]);
      } else {
        // Discover tab: users not yet followed nor pending
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, skill_level')
          .neq('id', userId)
          .limit(50);
        if (error) {
          console.error('Error fetching suggestions:', error);
          return;
        }
        const filtered = (data || []).filter((p: any) => !acceptedIds.has(p.id) && !pendingSet.has(p.id));
        setFriends(filtered);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFriends();
  };

  const handleFollowToggle = async (friendId: string) => {
    if (!userId) return;
    if (busyIds.has(friendId)) return;
    const nextBusy = new Set(busyIds); nextBusy.add(friendId); setBusyIds(nextBusy);

    try {
      if (activeTab === 'suggestions') {
        // Optimistic: mark as pending and remove from discover list
        setPendingOutgoing(prev => new Set<string>(prev).add(friendId));
        setFriends(prev => prev.filter(f => f.id !== friendId));

        const res = await sendFriendRequest(friendId);
        if (!res.success) {
          // rollback by reloading list
          await fetchFriends();
          Alert.alert('Could not follow user', res.message || 'Please try again.');
        } else {
          try {
            const just = friends.find(f => f.id === friendId);
            Alert.alert('Following', `You're now following @${just?.username || 'user'}.`);
            // Refresh lists so Following tab shows the user immediately as accepted/pending
            fetchFriends();
          } catch {}
        }
      } else {
        // Following tab: attempt to remove (unfollow) if already accepted
        if (followingIds.has(friendId)) {
          const res = await removeFriend(friendId);
          if (res.success) {
            setFollowingIds(prev => { const cp = new Set(prev); cp.delete(friendId); return cp; });
            setFriends(prev => prev.filter(f => f.id !== friendId));
          } else if (res.message) {
            Alert.alert('Unable to remove', res.message);
          }
        }
      }
    } finally {
      const cp = new Set(busyIds); cp.delete(friendId); setBusyIds(cp);
    }
  };

  const navigateToProfile = (friendId: string) => {
    navigation.navigate('Profile', { userId: friendId });
  };

  const getSkillLevelColor = (skillLevel?: string) => {
    switch (skillLevel) {
      case 'rookie_rambler':
        return '#4CAF50';
      case 'weekend_warrior':
        return '#FF9800';
      case 'trail_master':
        return '#2196F3';
      case 'summit_seeker':
        return '#9C27B0';
      default:
        return '#666';
    }
  };

  const getSkillLevelLabel = (skillLevel?: string) => {
    switch (skillLevel) {
      case 'rookie_rambler':
        return 'Rookie Rambler';
      case 'weekend_warrior':
        return 'Weekend Warrior';
      case 'trail_master':
        return 'Trail Master';
      case 'summit_seeker':
        return 'Summit Seeker';
      default:
        return 'Hiker';
    }
  };

  const renderFriend = ({ item }: { item: Friend }) => {
    const isPending = pendingOutgoing.has(item.id);
    const isFollowing = followingIds.has(item.id) || isPending || !!item.is_following;
    const disabled = activeTab === 'suggestions' && isFollowing;
    const iconName = activeTab === 'friends' ? (isPending ? 'time-outline' : 'person-remove-outline') : (isFollowing ? 'checkmark-circle' : 'person-add-outline');
    const iconColor = activeTab === 'friends' ? (isPending ? '#9CA3AF' : '#4CAF50') : (isFollowing ? '#9CA3AF' : '#4CAF50');

    return (
      <TouchableOpacity
        style={styles.friendItem}
        onPress={() => navigateToProfile(item.id)}
      >
        <View style={styles.friendInfo}>
          <View style={styles.avatarContainer}>
            {item.avatar_url ? (
              <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={24} color="#666" />
              </View>
            )}
          </View>
          
          <View style={styles.friendDetails}>
            <Text style={styles.friendName}>
              {item.full_name || item.username}
            </Text>
            <Text style={styles.friendUsername}>@{item.username}</Text>
            <View style={styles.skillLevelContainer}>
              <View
                style={[
                  styles.skillLevelBadge,
                  { backgroundColor: getSkillLevelColor(item.skill_level) },
                ]}
              >
                <Text style={styles.skillLevelText}>
                  {getSkillLevelLabel(item.skill_level)}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.actionButton, disabled && { opacity: 0.6 }]}
          onPress={() => handleFollowToggle(item.id)}
          disabled={disabled || busyIds.has(item.id)}
        >
          <Ionicons
            name={iconName as any}
            size={20}
            color={iconColor}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Following
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'suggestions' && styles.activeTab]}
          onPress={() => setActiveTab('suggestions')}
        >
          <Text style={[styles.tabText, activeTab === 'suggestions' && styles.activeTabText]}>
            Discover
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={(item) => item.id}
        nestedScrollEnabled={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={ListHeaderComponent || null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {activeTab === 'friends' ? 'No friends yet' : 'No suggestions available'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'friends'
                ? 'Start following other hikers!'
                : 'Check back later for new hikers to follow'}
            </Text>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  skillLevelContainer: {
    flexDirection: 'row',
  },
  skillLevelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  skillLevelText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  actionButton: {
    padding: 8,
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

export default FriendsComponent;