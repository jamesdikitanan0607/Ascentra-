import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Dimensions,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabaseClient';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { formatDistance, formatElevation } from '../utils/formatters';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useProfile } from '../contexts/ProfileContext';
import { User } from '@supabase/supabase-js';
import { hikingSpots, getAllHikingSpots, getTopRatedHikingSpots } from '../data/hikingSpots';
import HikingSpotCard from '../components/HikingSpotCard';
import { getSpotScreenName } from '../utils/navigationUtils';


type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HikingSpot {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  thumbnail?: any;
  average_rating?: number;
  rating_count?: number;
  difficulty?: string;
  distance_km?: number;
  elevation_gain_m?: number;
}

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
  user: User | null;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with 16px margins
const LOGO_ASPECT = 3; // width:height ratio for the logo
const LOGO_TARGET_WIDTH = Math.min(width * 0.7, 360); // responsive logo width with an upper bound

// Top Rated Card Component
const TopRatedCard = React.memo(({ spot, navigation }: { spot: HikingSpot; navigation: HomeScreenNavigationProp }) => {
  const handlePress = useCallback(() => {
    const screenName = getSpotScreenName(parseInt(spot.id));
    if (screenName === 'HikingSpotDetails') {
      // Pass the spot object for the generic details screen
      navigation.navigate(screenName, { spot });
    } else {
      // For specific spot screens, navigate without parameters
      navigation.navigate(screenName as any);
    }
  }, [navigation, spot]);

  return (
    <TouchableOpacity style={styles.topRatedCard} onPress={handlePress}>
      <Image source={spot.thumbnail} style={styles.topRatedImage} resizeMode="cover" />
      <View style={styles.topRatedOverlay}>
        <View style={styles.topRatedBadge}>
          <MaterialIcons name="star" size={14} color="#FFD700" />
          <Text style={styles.topRatedBadgeText}>Top Rated</Text>
        </View>
        <View style={styles.topRatedInfo}>
          <Text style={styles.topRatedTitle}>{spot.name}</Text>
          <View style={styles.topRatedRating}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.topRatedRatingText}>{spot.average_rating}</Text>
            <Text style={styles.topRatedReviews}>({spot.rating_count} reviews)</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, user }) => {
  const [hikingSpots, setHikingSpots] = useState<HikingSpot[]>([]);
  const [filteredSpots, setFilteredSpots] = useState<HikingSpot[]>([]);
  const [topRatedSpots, setTopRatedSpots] = useState<HikingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { profile } = useProfile();

  // Load hiking spots from centralized data
  const loadHikingSpots = useCallback(async () => {
    try {
      setLoading(true);

      // Get all hiking spots from centralized data
      const allSpots = getAllHikingSpots();
      const topRated = getTopRatedHikingSpots(5);

      setHikingSpots(allSpots);
      setFilteredSpots(allSpots);
      setTopRatedSpots(topRated);
    } catch (error) {
      console.error('Error loading hiking spots:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHikingSpots();
  }, [loadHikingSpots]);

  // Filter spots based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSpots(hikingSpots);
    } else {
      const filtered = hikingSpots.filter(spot =>
        spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.difficulty?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSpots(filtered);
    }
  }, [searchQuery, hikingSpots]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHikingSpots();
    setRefreshing(false);
  }, [loadHikingSpots]);

  const renderTopRatedSpots = useCallback(() => (
    <FlatList
      data={topRatedSpots}
      renderItem={({ item }) => <TopRatedCard spot={item} navigation={navigation} />}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.topRatedContainer}
    />
  ), [topRatedSpots, navigation]);

  const renderGridSpots = useCallback(() => {
    const rows = [];
    for (let i = 0; i < filteredSpots.length; i += 2) {
      const rowSpots = filteredSpots.slice(i, i + 2);
      rows.push(
        <View key={i} style={[styles.gridRow, { flexDirection: 'row' }]}>
          {rowSpots.map((spot) => (
            <HikingSpotCard key={spot.id} spot={spot as any} thumbnail={spot.thumbnail} />
          ))}
          {rowSpots.length === 1 && <View style={{ width: CARD_WIDTH }} />}
        </View>
      );
    }
    return rows;
  }, [filteredSpots]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading hiking spots...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/ascentra.png')}
              style={[styles.logo, { width: LOGO_TARGET_WIDTH, height: LOGO_TARGET_WIDTH / LOGO_ASPECT }]}
              resizeMode="contain"
            />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search hiking spots..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>


        </View>

        {/* No Results */}
        {searchQuery && filteredSpots.length === 0 && (
          <View style={styles.noResultsContainer}>
            <MaterialIcons name="search-off" size={48} color="#ccc" />
            <Text style={styles.noResultsText}>No spots found</Text>
            <Text style={styles.noResultsSubtext}>Try searching with different keywords</Text>
          </View>
        )}

        {/* Top Rated Section */}
        {!searchQuery && topRatedSpots.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Rated</Text>
              <Text style={styles.countText}>{topRatedSpots.length} spots</Text>
            </View>
            {renderTopRatedSpots()}
          </View>
        )}



        {/* All Hiking Spots Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? 'Search Results' : 'All Hiking Spots'}
            </Text>
            <Text style={styles.countText}>{filteredSpots.length} spots</Text>
          </View>
          <View style={styles.gridContainer}>
            {renderGridSpots()}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper functions
const getRandomDifficulty = () => {
  const difficulties = ['Easy', 'Moderate', 'Advanced'];
  return difficulties[Math.floor(Math.random() * difficulties.length)];
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  logo: {

  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },

  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  countText: {
    fontSize: 14,
    color: '#666',
  },
  topRatedContainer: {
    paddingLeft: 20,
  },
  topRatedCard: {
    width: 280,
    height: 160,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  topRatedImage: {
    width: '100%',
    height: '100%',
  },
  topRatedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: 12,
  },
  topRatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  topRatedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  topRatedInfo: {
    alignSelf: 'stretch',
  },
  topRatedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  topRatedRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topRatedRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  topRatedReviews: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginLeft: 4,
  },
  gridContainer: {
    paddingHorizontal: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
});

export default HomeScreen;
