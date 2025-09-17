import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  StatusBar,
  Dimensions,
  FlatList,
  TextInput,
} from 'react-native';
import { supabase } from '../services/supabaseClient';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useProfile } from '../contexts/ProfileContext';
import { User } from '@supabase/supabase-js';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HikingSpot {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  image_url?: string;
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

// Mapping function to convert spot IDs to individual screen names
const getSpotScreenName = (spotId: string): keyof RootStackParamList => {
  const screenMap: { [key: string]: keyof RootStackParamList } = {
    '1': 'MountBabag',
    '2': 'MountKanirag', 
    '3': 'MountNaupa',
    '4': 'MountManunggal',
    '5': 'MountMago',
    '6': 'MountKapayas',
    '7': 'MountLantoy',
    '8': 'MountKalbasaan',
    '9': 'MountMauyog',
    '10': 'MountLanaya',
    '11': 'MountHambubuyog',
    '12': 'OsmenaPeak',
    '13': 'CasinoPeak',
    '14': 'BudlaanFalls',
    '15': 'SpartanTrail'
  };
  return screenMap[spotId] || 'HikingSpotDetails';
};

// Get image source for hiking spots
const getHikingSpotImageSource = (spot: HikingSpot) => {
  const imageMap: { [key: string]: any } = {
    '1': require('../assets/images/mount-babag/thumbnail.webp'), // Mount Babag - using actual mount-babag folder
    '2': require('../assets/images/mt kan-irag/thumbnail.jpg'), // Mount Kan-irag
    '3': require('../assets/images/mt naupa/thumbnail.jpg'), // Mount Naupa
    '4': require('../assets/images/mt manunggal/thumbnail.jpg'), // Mount Manunggal
    '5': require('../assets/images/mt mago/thumbnail.jpg'), // Mount Mago
    '6': require('../assets/images/mt kapayas/thumbnail.webp'), // Mount Kapayas - updated to webp format
    '7': require('../assets/images/mount latoy/thumbnail.webp'), // Mount Lantoy - corrected folder name and format
    '8': require('../assets/images/mt kalbasan/thumbnail.jpg'), // Mount Kalbasaan - corrected folder name
    '9': require('../assets/images/mt mauyog/thumbnail.jpg'), // Mount Mauyog
    '10': require('../assets/images/mt lanaya/thumbnail.jpg'), // Mount Lanaya
    '11': require('../assets/images/mount hambubuyog/thumbnail.jpg'), // Mount Hambubuyog
    '12': require('../assets/images/osmena peak/thumbnail.jpg'), // Osmeña Peak
    '13': require('../assets/images/casino peak/thumbnail.jpg'), // Casino Peak
    '14': require('../assets/images/budlaanfalls/thumbnail.jpg'), // Budlaan Falls
    '15': require('../assets/images/spartantrail/thumbnail.jpg') // Spartan Trail - updated to HEIC format
  };
  
  return imageMap[spot.id] || require('../assets/images/mt manunggal/thumbnail.jpg');
};

// Top Rated Card Component
const TopRatedCard = React.memo(({ spot, navigation }: { spot: HikingSpot; navigation: HomeScreenNavigationProp }) => {
  const handlePress = useCallback(() => {
    const screenName = getSpotScreenName(spot.id);
    navigation.navigate(screenName);
  }, [navigation, spot.id]);

  return (
    <TouchableOpacity style={styles.topRatedCard} onPress={handlePress} activeOpacity={0.8}>
      <Image
        source={getHikingSpotImageSource(spot)}
        style={styles.topRatedImage}
        resizeMode="cover"
      />
      <View style={styles.topRatedOverlay}>
        <View style={styles.topRatedBadge}>
          <FontAwesome name="star" size={12} color="#FFD700" />
          <Text style={styles.topRatedBadgeText}>Top Rated</Text>
        </View>
        <View style={styles.topRatedInfo}>
          <Text style={styles.topRatedTitle} numberOfLines={1}>{spot.name}</Text>
          <View style={styles.topRatedRating}>
            <FontAwesome name="star" size={14} color="#FFD700" />
            <Text style={styles.topRatedRatingText}>
              {spot.average_rating ? spot.average_rating.toFixed(1) : '0.0'}
            </Text>
            <Text style={styles.topRatedReviews}>({spot.rating_count || 0})</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// Hiking Spot Grid Card Component
const HikingSpotGridCard = React.memo(({ spot, navigation }: { spot: HikingSpot; navigation: HomeScreenNavigationProp }) => {
  const handlePress = useCallback(() => {
    const screenName = getSpotScreenName(spot.id);
    navigation.navigate(screenName);
  }, [navigation, spot.id]);

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <TouchableOpacity style={styles.gridCard} onPress={handlePress} activeOpacity={0.8}>
      <Image
        source={getHikingSpotImageSource(spot)}
        style={styles.gridCardImage}
        resizeMode="cover"
      />
      <View style={styles.gridCardContent}>
        <Text style={styles.gridCardTitle} numberOfLines={2}>{spot.name}</Text>
        
        {spot.difficulty && (
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(spot.difficulty) }]}>
            <Text style={styles.difficultyText}>{spot.difficulty}</Text>
          </View>
        )}
        
        <View style={styles.gridCardStats}>
          {spot.distance_km && (
            <View style={styles.statItem}>
              <MaterialIcons name="straighten" size={12} color="#666" />
              <Text style={styles.statText}>{spot.distance_km}km</Text>
            </View>
          )}
          {spot.elevation_gain_m && (
            <View style={styles.statItem}>
              <MaterialIcons name="trending-up" size={12} color="#666" />
              <Text style={styles.statText}>{spot.elevation_gain_m}m</Text>
            </View>
          )}
        </View>
        
        <View style={styles.gridCardRating}>
          <FontAwesome name="star" size={12} color="#FFD700" />
          <Text style={styles.gridCardRatingText}>
            {spot.average_rating ? spot.average_rating.toFixed(1) : '0.0'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// Main HomeScreen Component
const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, user }) => {
  const [hikingSpots, setHikingSpots] = useState<HikingSpot[]>([]);
  const [topRatedSpots, setTopRatedSpots] = useState<HikingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { profile } = useProfile();

  // Load hiking spots data
  const loadHikingSpots = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all spots from Supabase
      const { data: spots, error } = await supabase
        .from('hiking_spots')
        .select(`
          hiking_spot_id,
          name,
          latitude,
          longitude
        `);

      if (error) {
        // Error loading spots
        // Fallback to mock data if Supabase fails
        setHikingSpots(getMockHikingSpots());
        setTopRatedSpots(getMockHikingSpots().slice(0, 3));
        return;
      }

      // Process spots with ratings
      const processedSpots = spots?.map(spot => {
        // Generate random ratings for now since reviews table is empty
        const averageRating = Math.round((Math.random() * 2 + 3) * 10) / 10; // 3.0 - 5.0
        const ratingCount = Math.floor(Math.random() * 200 + 50); // 50 - 250
        
        // Convert database ID (31-45) back to app ID (1-15) for internal use
        const appId = spot.hiking_spot_id ? (spot.hiking_spot_id - 30).toString() : spot.id?.toString();
        
        return {
          ...spot,
          id: appId,
          slug: spot.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '',
          average_rating: averageRating,
          rating_count: ratingCount,
          difficulty: getRandomDifficulty(),
          distance_km: Math.round((Math.random() * 10 + 2) * 10) / 10,
          elevation_gain_m: Math.round(Math.random() * 800 + 200)
        };
      }) || [];

      setHikingSpots(processedSpots);
      
      // Get top rated spots (sorted by rating)
      const topRated = processedSpots
        .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
        .slice(0, 3);
      setTopRatedSpots(topRated);
      
    } catch (error) {
      // Error loading hiking spots
      // Fallback to mock data
      setHikingSpots(getMockHikingSpots());
      setTopRatedSpots(getMockHikingSpots().slice(0, 3));
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHikingSpots();
    setRefreshing(false);
  }, [loadHikingSpots]);

  useEffect(() => {
    loadHikingSpots();
  }, [loadHikingSpots]);

  // Filter hiking spots based on search query
  const filteredHikingSpots = hikingSpots.filter(spot =>
    spot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render grid item
  const renderGridItem = useCallback(({ item }: { item: HikingSpot }) => (
    <HikingSpotGridCard spot={item} navigation={navigation} />
  ), [navigation]);

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
             <Image 
               source={require('../assets/images/ascentra.png')}
               style={styles.logo}
               resizeMode="contain"
             />
           </View>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search hiking spots..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Top Rated Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Rated</Text>
            <TouchableOpacity onPress={() => {/* Navigate to full top rated list */}}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topRatedContainer}
          >
            {topRatedSpots.map((spot) => (
              <TopRatedCard key={spot.id} spot={spot} navigation={navigation} />
            ))}
          </ScrollView>
        </View>

        {/* 15 Hiking Spots Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? 'Search Results' : 'All Hiking Spots'}
            </Text>
            <Text style={styles.countText}>
              {filteredHikingSpots.length} {filteredHikingSpots.length === 1 ? 'spot' : 'spots'}
            </Text>
          </View>
          
          {filteredHikingSpots.length > 0 ? (
            <FlatList
              data={filteredHikingSpots}
              renderItem={renderGridItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.gridContainer}
              columnWrapperStyle={styles.gridRow}
            />
          ) : searchQuery ? (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search" size={48} color="#ccc" />
              <Text style={styles.noResultsText}>No hiking spots found</Text>
              <Text style={styles.noResultsSubtext}>Try searching with different keywords</Text>
            </View>
          ) : null}
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

const getMockHikingSpots = (): HikingSpot[] => [
  { id: '1', name: 'Mount Babag', slug: 'mount-babag', latitude: 10.3157, longitude: 123.9621, average_rating: 4.5, rating_count: 128 },
  { id: '2', name: 'Mount Kan-irag', slug: 'mt-kan-irag', latitude: 10.3200, longitude: 123.9500, average_rating: 4.3, rating_count: 95 },
  { id: '3', name: 'Mount Naupa', slug: 'mt-naupa', latitude: 10.2800, longitude: 123.9200, average_rating: 4.7, rating_count: 156 },
  { id: '4', name: 'Mount Manunggal', slug: 'mt-manunggal', latitude: 10.4500, longitude: 124.0200, average_rating: 4.2, rating_count: 87 },
  { id: '5', name: 'Mount Mago', slug: 'mt-mago', latitude: 10.3800, longitude: 123.9800, average_rating: 4.4, rating_count: 112 },
  { id: '6', name: 'Mount Kapayas', slug: 'mt-kapayas', latitude: 10.3600, longitude: 123.9400, average_rating: 4.1, rating_count: 73 },
  { id: '7', name: 'Mount Lantoy', slug: 'mount-lantoy', latitude: 10.3300, longitude: 123.9700, average_rating: 4.6, rating_count: 134 },
  { id: '8', name: 'Mount Kalbasan', slug: 'mt-kalbasan', latitude: 10.3100, longitude: 123.9300, average_rating: 4.0, rating_count: 65 },
  { id: '9', name: 'Mount Mauyog', slug: 'mt-mauyog', latitude: 10.3400, longitude: 123.9600, average_rating: 4.3, rating_count: 98 },
  { id: '10', name: 'Mount Lanaya', slug: 'mt-lanaya', latitude: 10.3700, longitude: 123.9900, average_rating: 4.5, rating_count: 121 },
  { id: '11', name: 'Mount Hambubuyog', slug: 'mount-hambubuyog', latitude: 10.2900, longitude: 123.9100, average_rating: 4.2, rating_count: 89 },
  { id: '12', name: 'Osmeña Peak', slug: 'osmena-peak', latitude: 10.2600, longitude: 123.8900, average_rating: 4.8, rating_count: 203 },
  { id: '13', name: 'Casino Peak', slug: 'casino-peak', latitude: 10.2700, longitude: 123.9000, average_rating: 4.4, rating_count: 145 },
  { id: '14', name: 'Budlaan Falls', slug: 'budlaan-falls', latitude: 10.3500, longitude: 123.9800, average_rating: 4.6, rating_count: 167 },
  { id: '15', name: 'Spartan Trail', slug: 'spartan-trail', latitude: 10.3000, longitude: 123.9500, average_rating: 4.1, rating_count: 78 }
];

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
    marginBottom: 24,
    marginTop: 8,
  },
  logo: {
    width: 180,
    height: 60,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
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
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  gridCardImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  gridCardContent: {
    padding: 12,
  },
  gridCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 18,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  gridCardStats: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
  },
  gridCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridCardRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 4,
  },
});

export default HomeScreen;
