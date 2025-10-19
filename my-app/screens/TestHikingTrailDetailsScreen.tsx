import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

// Mock hiking spot data for testing
const mockHikingSpots = [
  {
    id: '1',
    name: 'Mount Naupa',
    location: 'Naga, Cebu',
    rating: 4.3,
    reviews: 87,
    description: 'A beautiful grassland mountain in Naga, Cebu offering rolling hills, eco trails, and spectacular ridge walks. Perfect for both beginners and experienced hikers seeking scenic views.'
  },
  {
    id: '2',
    name: 'Mount Babag',
    location: 'Cebu City, Cebu',
    rating: 4.5,
    reviews: 124,
    description: 'Popular hiking destination in Cebu City known for its accessible trails and panoramic city views. Great for weekend adventures and family hikes.'
  },
  {
    id: '3',
    name: 'Mount Kan-irag/Sirao Peak',
    location: 'Cebu City, Cebu',
    rating: 4.2,
    reviews: 95,
    description: 'Famous for its flower gardens and cool mountain climate. Offers stunning views of Cebu City and surrounding islands.'
  }
];

const TestHikingTrailDetailsScreen: React.FC = () => {
  const navigation = useNavigation();

  const navigateToTrailDetails = (hikingSpot: any) => {
    console.log('[TEST] Navigating to HikingTrailDetails with spot:', hikingSpot);
    (navigation as any).navigate('HikingTrailDetails', { hikingSpot });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Trail Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Test Hiking Trail Details Screen</Text>
        <Text style={styles.subtitle}>
          Select a hiking spot to test the trail details functionality:
        </Text>

        {mockHikingSpots.map((spot) => (
          <TouchableOpacity
            key={spot.id}
            style={styles.spotCard}
            onPress={() => navigateToTrailDetails(spot)}
          >
            <View style={styles.spotHeader}>
              <Text style={styles.spotName}>{spot.name}</Text>
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </View>
            <Text style={styles.spotLocation}>{spot.location}</Text>
            <View style={styles.spotRating}>
              <MaterialIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{spot.rating} ({spot.reviews} reviews)</Text>
            </View>
            <Text style={styles.spotDescription} numberOfLines={2}>
              {spot.description}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>What to Test:</Text>
          <Text style={styles.infoText}>• Trail routes loading from mock data</Text>
          <Text style={styles.infoText}>• Interactive map with route polylines</Text>
          <Text style={styles.infoText}>• Trail route carousel selection</Text>
          <Text style={styles.infoText}>• Dynamic trail information updates</Text>
          <Text style={styles.infoText}>• Fullscreen map functionality</Text>
          <Text style={styles.infoText}>• Debug information display</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2ecc71',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  spotCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  spotLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  spotRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  spotDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    paddingLeft: 8,
  },
});

export default TestHikingTrailDetailsScreen;
