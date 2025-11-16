import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, FlatList, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../../services/supabaseClient';
import { fetchNotifications, subscribeToNotifications, markAsRead, EnrichedNotification } from '../../../services/notificationsService';
import { sendFriendRequest, acceptFriendRequest, declineFriendRequest, getFriendStatus } from '../../../services/friendService';

const { width } = Dimensions.get('window');

interface SuggestedUser {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  mutualFriends?: number;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onAnyRead?: () => void;
}

const NotificationsDropdown: React.FC<Props> = ({ isVisible, onClose, onAnyRead }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [notifications, setNotifications] = useState<EnrichedNotification[]>([]);
  const [suggested, setSuggested] = useState<SuggestedUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followStatus, setFollowStatus] = useState<Record<string, { status: 'none' | 'pending_outgoing' | 'pending_incoming' | 'accepted'; requestId?: string | null }>>({});
  const [followBusy, setFollowBusy] = useState<Record<string, boolean>>({});
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.4,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id || null;
      if (!mounted) return;
      setCurrentUserId(uid);
      if (!uid) return;
      const rows = await fetchNotifications(uid, activeTab === 'unread');
      if (!mounted) return;
      setNotifications(rows);
      const s = subscribeToNotifications(uid, (n) => {
        setNotifications(prev => [n, ...prev]);
      });
      unsub = s;
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .neq('id', uid)
        .limit(10);
      if (!mounted) return;
      setSuggested((profs as any) || []);

      // Build follow status map for actors in current notifications
      const actorIds = Array.from(new Set((rows || []).map(r => r.actor?.id).filter(Boolean))) as string[];
      if (actorIds.length) {
        try {
          const results = await Promise.all(actorIds.map(async (id) => ({ id, ...(await getFriendStatus(id)) })));
          if (!mounted) return;
          const map: Record<string, any> = {};
          results.forEach(r => { map[r.id] = { status: r.status, requestId: r.requestId || null }; });
          setFollowStatus(map);
        } catch {}
      }
    })();
    return () => {
      mounted = false;
      if (unsub) try { unsub(); } catch {}
    };
  }, [isVisible, activeTab]);

  const onPressNotification = async (item: EnrichedNotification) => {
    if (!item) return;
    try {
      if (item.target_type === 'post' || item.target_type === 'comment') {
        if (item.target_id) navigation.navigate('Comments', { postId: item.target_id });
      } else if (item.target_type === 'profile' || item.type === 'follow') {
        const pid = item.actor?.id || item.target_id;
        if (pid) navigation.navigate('Profile', { userId: pid });
      } else if (item.target_type === 'activity') {
        const pid = item.actor?.id || item.target_id;
        if (pid) navigation.navigate('Profile', { userId: pid });
      }
      await markAsRead(item.id);
      if (onAnyRead) onAnyRead();
    } catch {}
  };

  const renderNotificationItem = ({ item }: { item: EnrichedNotification }) => {
    const aid = item.actor?.id as string | undefined;
    const statusObj = aid ? followStatus[aid] : undefined;
    const status = statusObj?.status || 'none';
    const isSelf = aid && currentUserId && aid === currentUserId;
    const canShowFollow = !!aid && !isSelf && item.type !== 'friend_request';

    const onFollowPress = async () => {
      if (!aid) return;
      if (followBusy[aid]) return;
      setFollowBusy(prev => ({ ...prev, [aid]: true }));
      try {
        if (status === 'pending_incoming' && statusObj?.requestId) {
          await acceptFriendRequest(statusObj.requestId);
          setFollowStatus(prev => ({ ...prev, [aid]: { status: 'accepted', requestId: null } }));
        } else if (status === 'none') {
          const res = await sendFriendRequest(aid);
          if (res.success) {
            setFollowStatus(prev => ({ ...prev, [aid]: { status: 'pending_outgoing', requestId: null } }));
          }
        }
      } finally {
        setFollowBusy(prev => { const cp = { ...prev }; delete cp[aid!]; return cp; });
      }
    };

    return (
      <TouchableOpacity style={styles.notificationItem} onPress={() => onPressNotification(item)}>
        <View style={styles.notificationLeft}>
          <Image source={{ uri: item.actor?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp' }} style={styles.avatar} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationText}>
            <Text style={styles.userName}>{item.actor?.username || 'User'} </Text>
            <Text>{item.message || item.content || item.verb || item.type}</Text>
          </Text>
          <Text style={styles.timeAgo}>{new Date(item.created_at).toLocaleString()}</Text>
        </View>
        {item.type === 'friend_request' && (
          <View style={styles.friendRequestActions}>
            <TouchableOpacity style={styles.acceptButton} onPress={async () => { await acceptFriendRequest(String(item.target_id || item.id)); if (onAnyRead) onAnyRead(); }}>
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.declineButton} onPress={async () => { await declineFriendRequest(String(item.target_id || item.id)); if (onAnyRead) onAnyRead(); }}>
              <Ionicons name="close" size={18} color="#1F2933" />
            </TouchableOpacity>
          </View>
        )}
        {canShowFollow && (
          <TouchableOpacity
            style={[styles.smallFollowBtn, (status === 'accepted' || status === 'pending_outgoing') && styles.smallFollowBtnDisabled]}
            disabled={status === 'accepted' || status === 'pending_outgoing' || !!followBusy[aid!]}
            onPress={onFollowPress}
          >
            <Text style={[styles.smallFollowText, (status === 'accepted' || status === 'pending_outgoing') && styles.smallFollowTextMuted]}>
              {status === 'accepted' ? 'Following' : status === 'pending_outgoing' ? 'Requested' : (status === 'pending_incoming' ? 'Add Back' : 'Follow')}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderSuggestedUser = ({ item }: { item: SuggestedUser }) => (
    <View style={styles.suggestedUser}>
      <Image source={{ uri: item.avatar_url || 'https://www.gravatar.com/avatar/?d=mp' }} style={styles.suggestedUserAvatar} />
      <View style={styles.suggestedUserInfo}>
        <Text style={styles.suggestedUserName}>{item.full_name || item.username || 'User'}</Text>
        <Text style={styles.mutualFriends}>People you may know</Text>
        <View style={styles.suggestedUserActions}>
          <TouchableOpacity style={styles.addFriendButton} onPress={async () => { if (item.id) await sendFriendRequest(item.id); }}>
            <Text style={styles.addFriendButtonText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewProfileButton} onPress={() => navigation.navigate('Profile', { userId: item.id })}>
            <Text style={styles.viewProfileButtonText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (!isVisible) return null;

  return (
    <>
      <Animated.View 
        style={[
          styles.overlay, 
          { opacity: fadeAnim }
        ]} 
        onTouchEnd={onClose}
      />
      <Animated.View 
        style={[
          styles.dropdown,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        <View style={styles.dropdownHeader}>
          <Text style={styles.dropdownTitle}>Notifications</Text>
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'all' && styles.activeTab]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
              onPress={() => setActiveTab('unread')}
            >
              <Text style={[styles.tabText, activeTab === 'unread' && styles.activeTabText]}>
                Unread
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.notificationsList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={48} color="#CFD8DC" />
              <Text style={styles.emptyStateText}>No new notifications</Text>
              <Text style={styles.emptyStateSubtext}>When you get notifications, they'll appear here</Text>
            </View>
          }
        />

        <View style={styles.suggestedSection}>
          <Text style={styles.sectionTitle}>People You May Know</Text>
          <FlatList
            data={suggested}
            renderItem={renderSuggestedUser}
            keyExtractor={(item) => `suggested-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestedUsersList}
          />
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 100,
  },
  smallFollowBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'center',
  },
  smallFollowBtnDisabled: {
    backgroundColor: '#E5E7EB',
  },
  smallFollowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  smallFollowTextMuted: {
    color: '#6B7280',
  },
  dropdown: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.85,
    height: '100%',
    backgroundColor: '#FAFAF7',
    zIndex: 101,
    borderRightWidth: 1,
    borderRightColor: '#E6E8EB',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  dropdownHeader: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E8EB',
  },
  dropdownTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 12,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E8EB',
    marginBottom: 8,
  },
  tab: {
    paddingBottom: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2E7D32',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9BA4AF',
  },
  activeTabText: {
    color: '#1F2933',
  },
  notificationsList: {
    paddingBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
    alignItems: 'flex-start',
  },
  notificationLeft: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E9ECEF',
  },
  reactionBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FAFAF7',
  },
  notificationContent: {
    flex: 1,
    marginRight: 8,
  },
  notificationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1F2933',
    marginBottom: 2,
  },
  userName: {
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 12,
    color: '#9BA4AF',
  },
  postImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  friendRequestActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  declineButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9BA4AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  suggestedSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6E8EB',
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  suggestedUsersList: {
    paddingHorizontal: 12,
  },
  suggestedUser: {
    width: 160,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    overflow: 'hidden',
  },
  suggestedUserAvatar: {
    width: '100%',
    height: 100,
    backgroundColor: '#E9ECEF',
  },
  suggestedUserInfo: {
    padding: 12,
  },
  suggestedUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 2,
  },
  mutualFriends: {
    fontSize: 12,
    color: '#9BA4AF',
    marginBottom: 8,
  },
  suggestedUserActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addFriendButton: {
    flex: 1,
    backgroundColor: '#2E7D32',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 6,
  },
  addFriendButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  viewProfileButton: {
    width: 40,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewProfileButtonText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default NotificationsDropdown;
