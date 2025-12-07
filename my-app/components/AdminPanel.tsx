import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import { supabase } from '../services/supabaseClient';
import { AdminDashboardBridge, MobileHikingSpot, MobileTrailRoute } from '../shared/api-config';

interface AdminStats {
  totalSpots: number;
  totalRoutes: number;
  activeSpots: number;
  activeRoutes: number;
  totalUsers: number;
  recentActivity: number;
}

export default function AdminPanel({ navigation }: any) {
  const [stats, setStats] = useState<AdminStats>({
    totalSpots: 0,
    totalRoutes: 0,
    activeSpots: 0,
    activeRoutes: 0,
    totalUsers: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<string>('Never');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Get hiking spots count
      const { count: totalSpots } = await supabase
        .from('hiking_spots')
        .select('*', { count: 'exact', head: true });

      // Get active spots count
      const { count: activeSpots } = await supabase
        .from('hiking_spots')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get trail routes count
      const { count: totalRoutes } = await supabase
        .from('trail_routes')
        .select('*', { count: 'exact', head: true });

      // Get active routes count
      const { count: activeRoutes } = await supabase
        .from('trail_routes')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentActivity } = await supabase
        .from('hike_records')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      setStats({
        totalSpots: totalSpots || 0,
        totalRoutes: totalRoutes || 0,
        activeSpots: activeSpots || 0,
        activeRoutes: activeRoutes || 0,
        totalUsers: totalUsers || 0,
        recentActivity: recentActivity || 0
      });

      setLastSync(new Date().toLocaleString());
      
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load admin dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAdminData();
  };

  const handleSyncWithAdmin = async () => {
    try {
      setLoading(true);
      const result = await AdminDashboardBridge.syncWithAdmin(supabase);
      
      if (result.success) {
        Alert.alert(
          'Sync Successful',
          `Synced ${result.hikingSpots.length} hiking spots and ${result.trailRoutes.length} trail routes`
        );
      } else {
        Alert.alert('Sync Issues', result.errors.join('\n'));
      }
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Sync Error', 'Failed to sync with admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const navigateToHikingSpots = () => {
    navigation.navigate('HikingSpotLandingPage', { hiking_spot_id: 'admin' });
  };

  const navigateToUsers = () => {
    navigation.navigate('Profile', { userId: 'admin' });
  };

  const navigateToActivities = () => {
    navigation.navigate('HikeHistory', { userId: 'admin' });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading Admin Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Last sync: {lastSync}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalSpots}</Text>
          <Text style={styles.statLabel}>Total Spots</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.activeSpots}</Text>
          <Text style={styles.statLabel}>Active Spots</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalRoutes}</Text>
          <Text style={styles.statLabel}>Total Routes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.activeRoutes}</Text>
          <Text style={styles.statLabel}>Active Routes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.recentActivity}</Text>
          <Text style={styles.statLabel}>7-Day Activity</Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleSyncWithAdmin}>
          <Text style={styles.actionButtonText}>Sync with Admin Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={navigateToHikingSpots}>
          <Text style={styles.actionButtonText}>Manage Hiking Spots</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={navigateToUsers}>
          <Text style={styles.actionButtonText}>Manage Users</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={navigateToActivities}>
          <Text style={styles.actionButtonText}>View Activities</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Integration Info</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>• Connected to Admin Dashboard Supabase</Text>
          <Text style={styles.infoText}>• Real-time data synchronization</Text>
          <Text style={styles.infoText}>• Shared hiking spots and trails</Text>
          <Text style={styles.infoText}>• Admin features available</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  actionsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});
