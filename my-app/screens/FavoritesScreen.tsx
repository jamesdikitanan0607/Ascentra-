import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { useProfile } from '../contexts/ProfileContext';
import HikingSpotCard from '../components/HikingSpotCard';
import { getAllHikingSpots } from '../data/hikingSpots';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type FavoritesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Favorites'
>;

interface FavoritesScreenProps {
  navigation: FavoritesScreenNavigationProp;
}

const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ navigation }) => {
  const {
    favorites,
    favoritesLoading: loading,
    refreshFavorites,
  } = useProfile();
  const [refreshing, setRefreshing] = useState(false);
  const [localSpots, setLocalSpots] = useState<any[]>([]);

  // Load local spots once on mount - EXACTLY as HomeScreen does
  useEffect(() => {
    const spots = getAllHikingSpots();
    setLocalSpots(spots);
  }, []);

  // Refresh favorites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const load = async () => {
        // Only refresh if we're not already loading to prevent loops
        if (!loading) {
          try {
            console.log('[FavoritesScreen] Screen focused, refreshing favorites...');
            await refreshFavorites();
          } catch (error) {
            console.error('[FavoritesScreen] Error refreshing favorites:', error);
          }
        }
      };

      load();

      return () => {
        isActive = false;
      };
    }, [refreshFavorites]) // Removed loading dependency to prevent flip-flop loop
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshFavorites();
    } catch (error) {
      console.error('[FavoritesScreen] Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshFavorites]);

  // Map favorites to local hiking spots to ensure UI and Navigation consistency
  // This logic mirrors how HomeScreen filters spots, but based on favorites list
  const displaySpots = useMemo(() => {
    if (localSpots.length === 0 || favorites.length === 0) return [];

    // Create a set of favorite IDs for O(1) lookup
    // Prioritize f.id as it is normalized by ProfileContext to match local data IDs (e.g. '71')
    const favoriteIds = new Set(favorites.map(f => String(f.id || f.hiking_spot_id)));

    // Filter local spots that are in the favorites list
    // This ensures we use the EXACT same objects as HomeScreen, guaranteeing
    // that navigation params (ID, slug, etc.) are identical.
    return localSpots.filter(spot => favoriteIds.has(String(spot.id)));
  }, [favorites, localSpots]);

  const renderGridSpots = useCallback(() => {
    const rows = [];
    for (let i = 0; i < displaySpots.length; i += 2) {
      const rowSpots = displaySpots.slice(i, i + 2);
      rows.push(
        <View key={i} style={[styles.gridRow, { flexDirection: 'row' }]}>
          {rowSpots.map((spot) => (
            <HikingSpotCard
              key={spot.id}
              spot={spot as any}
              thumbnail={spot.thumbnail}
            />
          ))}
          {rowSpots.length === 1 && <View style={{ width: CARD_WIDTH }} />}
        </View>
      );
    }
    return rows;
  }, [displaySpots]);

  if (loading && !refreshing && favorites.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle='light-content' backgroundColor='#2E7D32' />
        <ActivityIndicator size='large' color='#2E7D32' />
        <Text style={styles.loadingText}>Loading your favorites...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor='#2E7D32' />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'MainTabs',
                    params: { screen: 'Profile' },
                  },
                ],
              }),
            )
          }
        >
          <Ionicons name='arrow-back' size={24} color='#FFFFFF' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <View style={styles.headerRight}>
          <Text style={styles.favoriteCount}>{favorites.length}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2E7D32']}
            tintColor='#2E7D32'
          />
        }
        contentContainerStyle={favorites.length === 0 ? styles.scrollViewEmpty : null}
      >
        {favorites.length > 0 ? (
          <View style={styles.gridContainer}>
            {renderGridSpots()}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name='heart-outline' size={80} color='#666666' />
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start exploring and save your favorite hiking spots!
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.exploreButtonText}>Explore Spots</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#2E7D32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRight: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  favoriteCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewEmpty: {
    flexGrow: 1,
  },
  gridContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: 400, // Ensure it takes up space in ScrollView
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default FavoritesScreen;
