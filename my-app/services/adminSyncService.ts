// Admin Dashboard Sync Service for Mobile App
// Handles real-time synchronization between mobile app and admin dashboard

import { supabase } from './supabaseClient';
import { AdminDashboardBridge, MobileHikingSpot, MobileTrailRoute } from '../shared/api-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SyncStatus {
  lastSync: string;
  hikingSpotsSynced: number;
  trailRoutesSynced: number;
  usersSynced: number;
  errors: string[];
  success: boolean;
}

export interface SyncMetrics {
  totalHikingSpots: number;
  totalTrailRoutes: number;
  totalUsers: number;
  activeHikingSpots: number;
  activeTrailRoutes: number;
  recentActivity: number;
}

class AdminSyncService {
  private static instance: AdminSyncService;
  private syncInProgress = false;
  private lastSyncTime: string | null = null;

  static getInstance(): AdminSyncService {
    if (!AdminSyncService.instance) {
      AdminSyncService.instance = new AdminSyncService();
    }
    return AdminSyncService.instance;
  }

  // Initialize sync service
  async initialize(): Promise<void> {
    try {
      const lastSync = await AsyncStorage.getItem('admin_last_sync');
      this.lastSyncTime = lastSync;
      
      // Set up real-time subscriptions
      this.setupRealtimeSubscriptions();
      
      console.log('Admin sync service initialized');
    } catch (error) {
      console.error('Failed to initialize admin sync service:', error);
    }
  }

  // Full synchronization with admin dashboard
  async performFullSync(): Promise<SyncStatus> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    const startTime = new Date().toISOString();
    const errors: string[] = [];
    let hikingSpotsSynced = 0;
    let trailRoutesSynced = 0;
    let usersSynced = 0;

    try {
      console.log('Starting full sync with admin dashboard...');

      // Sync hiking spots
      try {
        const spotsResult = await AdminDashboardBridge.syncWithAdmin(supabase);
        if (spotsResult.success) {
          hikingSpotsSynced = spotsResult.hikingSpots.length;
          await this.cacheHikingSpots(spotsResult.hikingSpots);
        } else {
          errors.push(...spotsResult.errors);
        }
      } catch (error) {
        errors.push(`Hiking spots sync failed: ${error}`);
      }

      // Sync trail routes
      try {
        const routesResult = await AdminDashboardBridge.syncWithAdmin(supabase);
        if (routesResult.success) {
          trailRoutesSynced = routesResult.trailRoutes.length;
          await this.cacheTrailRoutes(routesResult.trailRoutes);
        } else {
          errors.push(...routesResult.errors);
        }
      } catch (error) {
        errors.push(`Trail routes sync failed: ${error}`);
      }

      // Sync users
      try {
        const usersResult = await this.syncUsers();
        if (usersResult.success) {
          usersSynced = usersResult.count;
        } else {
          errors.push(...usersResult.errors);
        }
      } catch (error) {
        errors.push(`Users sync failed: ${error}`);
      }

      // Update last sync time
      this.lastSyncTime = new Date().toISOString();
      await AsyncStorage.setItem('admin_last_sync', this.lastSyncTime);

      const success = errors.length === 0;
      console.log(`Sync completed: ${success ? 'SUCCESS' : 'PARTIAL'}`);

      return {
        lastSync: this.lastSyncTime,
        hikingSpotsSynced,
        trailRoutesSynced,
        usersSynced,
        errors,
        success
      };

    } catch (error) {
      errors.push(`Sync failed: ${error}`);
      return {
        lastSync: startTime,
        hikingSpotsSynced,
        trailRoutesSynced,
        usersSynced,
        errors,
        success: false
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  // Get sync metrics
  async getSyncMetrics(): Promise<SyncMetrics> {
    try {
      const [
        totalSpots,
        activeSpots,
        totalRoutes,
        activeRoutes,
        totalUsers,
        recentActivity
      ] = await Promise.all([
        supabase.from('hiking_spots').select('*', { count: 'exact', head: true }),
        supabase.from('hiking_spots').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('trail_routes').select('*', { count: 'exact', head: true }),
        supabase.from('trail_routes').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        this.getRecentActivityCount()
      ]);

      return {
        totalHikingSpots: totalSpots.count || 0,
        totalTrailRoutes: totalRoutes.count || 0,
        totalUsers: totalUsers.count || 0,
        activeHikingSpots: activeSpots.count || 0,
        activeTrailRoutes: activeRoutes.count || 0,
        recentActivity
      };
    } catch (error) {
      console.error('Failed to get sync metrics:', error);
      throw error;
    }
  }

  // Check if sync is needed
  async needsSync(): Promise<boolean> {
    if (!this.lastSyncTime) return true;

    try {
      // Check if any data has been updated since last sync
      const { data: recentUpdates } = await supabase
        .from('hiking_spots')
        .select('updated_at')
        .gt('updated_at', this.lastSyncTime)
        .limit(1);

      return Boolean(recentUpdates && recentUpdates.length > 0);
    } catch (error) {
      console.error('Failed to check sync status:', error);
      return true; // Default to sync if we can't check
    }
  }

  // Get cached hiking spots
  async getCachedHikingSpots(): Promise<MobileHikingSpot[]> {
    try {
      const cached = await AsyncStorage.getItem('cached_hiking_spots');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to get cached hiking spots:', error);
      return [];
    }
  }

  // Get cached trail routes
  async getCachedTrailRoutes(): Promise<MobileTrailRoute[]> {
    try {
      const cached = await AsyncStorage.getItem('cached_trail_routes');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to get cached trail routes:', error);
      return [];
    }
  }

  // Private methods
  private async cacheHikingSpots(spots: MobileHikingSpot[]): Promise<void> {
    try {
      await AsyncStorage.setItem('cached_hiking_spots', JSON.stringify(spots));
    } catch (error) {
      console.error('Failed to cache hiking spots:', error);
    }
  }

  private async cacheTrailRoutes(routes: MobileTrailRoute[]): Promise<void> {
    try {
      await AsyncStorage.setItem('cached_trail_routes', JSON.stringify(routes));
    } catch (error) {
      console.error('Failed to cache trail routes:', error);
    }
  }

  private async syncUsers(): Promise<{ success: boolean; count: number; errors: string[] }> {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      await AsyncStorage.setItem('cached_users', JSON.stringify(users || []));

      return {
        success: true,
        count: users?.length || 0,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        count: 0,
        errors: [`User sync failed: ${error}`]
      };
    }
  }

  private async getRecentActivityCount(): Promise<number> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count } = await supabase
        .from('hike_records')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      return count || 0;
    } catch (error) {
      console.error('Failed to get recent activity:', error);
      return 0;
    }
  }

  private setupRealtimeSubscriptions(): void {
    // Subscribe to hiking spots changes
    const spotsSubscription = supabase
      .channel('admin-hiking-spots')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'hiking_spots' },
        (payload) => {
          console.log('Hiking spots changed:', payload);
          // Trigger incremental sync
          this.performIncrementalSync('hiking_spots');
        }
      )
      .subscribe();

    // Subscribe to trail routes changes
    const routesSubscription = supabase
      .channel('admin-trail-routes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'trail_routes' },
        (payload) => {
          console.log('Trail routes changed:', payload);
          // Trigger incremental sync
          this.performIncrementalSync('trail_routes');
        }
      )
      .subscribe();

    // Subscribe to users changes
    const usersSubscription = supabase
      .channel('admin-users')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('Users changed:', payload);
          // Trigger incremental sync
          this.performIncrementalSync('users');
        }
      )
      .subscribe();
  }

  private async performIncrementalSync(table: string): Promise<void> {
    try {
      console.log(`Performing incremental sync for ${table}`);
      
      switch (table) {
        case 'hiking_spots':
          const spotsResult = await AdminDashboardBridge.syncWithAdmin(supabase);
          if (spotsResult.success) {
            await this.cacheHikingSpots(spotsResult.hikingSpots);
          }
          break;
        
        case 'trail_routes':
          const routesResult = await AdminDashboardBridge.syncWithAdmin(supabase);
          if (routesResult.success) {
            await this.cacheTrailRoutes(routesResult.trailRoutes);
          }
          break;
        
        case 'users':
          await this.syncUsers();
          break;
      }
    } catch (error) {
      console.error(`Incremental sync failed for ${table}:`, error);
    }
  }

  // Clean up subscriptions
  cleanup(): void {
    supabase.channel('admin-hiking-spots').unsubscribe();
    supabase.channel('admin-trail-routes').unsubscribe();
    supabase.channel('admin-users').unsubscribe();
  }
}

export default AdminSyncService.getInstance();
