// Mock hiking spots data for the Ascentra app

export interface HikingSpot {
  id: string;
  name: string;
  description?: string;
  difficulty?: string;
  location?: string;
  image_url?: string;
  average_rating?: number;
  rating_count?: number;
  type?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  upvotes?: number;
  downvotes?: number;
  vote_score?: number;
  combined_score?: number;
}

// List of allowed hiking spot IDs
export const ALLOWED_HIKING_SPOTS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
];

// Mock hiking spots data
const MOCK_HIKING_SPOTS: HikingSpot[] = [
  {
    id: '1',
    name: 'Mount Babag',
    description: 'A popular hiking destination with stunning views of Cebu City.',
    difficulty: 'Moderate',
    location: 'Cebu City',
    image_url: '../assets/images/mt manunggal/thumbnail.jpg',
    average_rating: 4.5,
    rating_count: 120,
    type: 'Mountain',
    category: 'hiking',
    latitude: 10.3157,
    longitude: 123.8854,
    upvotes: 0,
    downvotes: 0,
    vote_score: 0,
    combined_score: 0
  },
  {
    id: '2',
    name: 'Mount Kan-irag / Sirao Peak',
    description: 'A scenic mountain peak offering panoramic views of Cebu City and surrounding areas.',
    difficulty: 'Moderate',
    location: 'Cebu City',
    image_url: '../assets/images/mt kalbasan/thumbnail.jpg',
    average_rating: 4.6,
    rating_count: 95,
    type: 'Mountain',
    category: 'hiking',
    latitude: 10.3440,
    longitude: 123.8695,
    upvotes: 0,
    downvotes: 0,
    vote_score: 0,
    combined_score: 0
  },
  {
    id: '3',
    name: 'Mount Naupa',
    description: 'A beautiful mountain with lush vegetation and scenic hiking trails.',
    difficulty: 'Moderate',
    location: 'Naga City',
    image_url: '../assets/images/spot3.jpg',
    average_rating: 4.3,
    rating_count: 78,
    type: 'Mountain',
    category: 'hiking',
    latitude: 10.2167,
    longitude: 123.7667,
    upvotes: 0,
    downvotes: 0,
    vote_score: 0,
    combined_score: 0
  },
  {
    id: '4',
    name: 'Mount Manunggal',
    description: 'Historic mountain with memorial significance and rewarding summit views.',
    difficulty: 'Moderate',
    location: 'Balamban',
    image_url: '../assets/images/spot4.jpg',
    average_rating: 4.4,
    rating_count: 65,
    type: 'Mountain',
    category: 'hiking',
    latitude: 10.4833,
    longitude: 123.7167,
    upvotes: 0,
    downvotes: 0,
    vote_score: 0,
    combined_score: 0
  },
  {
    id: '5',
    name: 'Mount Mago',
    description: 'A challenging mountain hike with rewarding views at the Carmen/Danao boundary.',
    difficulty: 'Hard',
    location: 'Carmen/Danao boundary',
    image_url: '../assets/images/spot5.jpg',
    average_rating: 4.6,
    rating_count: 42,
    type: 'Mountain',
    category: 'hiking',
    latitude: 10.5833,
    longitude: 124.0167,
    upvotes: 0,
    downvotes: 0,
    vote_score: 0,
    combined_score: 0
  },
  {
    id: '6',
    name: 'Mount Kapayas',
    description: 'A scenic mountain trail offering beautiful views and diverse flora.',
    difficulty: 'Moderate',
    location: 'Catmon',
    image_url: '../assets/images/spot6.jpg',
    average_rating: 4.3,
    rating_count: 38,
    type: 'Mountain',
    category: 'hiking',
    latitude: 10.7167,
    longitude: 124.0167,
    upvotes: 0,
    downvotes: 0,
    vote_score: 0,
    combined_score: 0
  },
  {
    id: '7',
    name: 'Mount Lantoy',
    description: 'A scenic mountain trail with beautiful coastal views and diverse flora.',
    difficulty: 'Moderate',
    location: 'Argao',
    image_url: '../assets/images/spot7.jpg',
    average_rating: 4.2,
    rating_count: 29,
    type: 'Mountain',
    category: 'hiking',
    latitude: 9.8833,
    longitude: 123.6167,
    upvotes: 0,
    downvotes: 0,
    vote_score: 0,
    combined_score: 0
  },
  {
    id: '8',
    name: 'Mount Kalbasaan',
    description: 'A beautiful mountain offering panoramic views and challenging trails.',
    difficulty: 'Moderate',
    location: 'Minglanilla',
    image_url: '../assets/images/spot8.jpg',
    average_rating: 4.1,
    rating_count: 25,
    type: 'Mountain',
    category: 'hiking',
    latitude: 10.2333,
    longitude: 123.7833,
    upvotes: 0,
    downvotes: 0,
    vote_score: 0,
    combined_score: 0
  },
  {
    id: '9',
    name: 'Mount Mauyog',
    description: 'A scenic mountain trail with diverse flora near Mt. Manunggal.',
    difficulty: 'Moderate',
    location: 'Balamban, near Mt. Manunggal',
    image_url: '../assets/images/spot9.jpg',
    average_rating: 4.3,
    rating_count: 31,
    type: 'Mountain',
    category: 'hiking',
    latitude: 10.4667,
    longitude: 123.7333,
    upvotes: 0,
    downvotes: 0,
    vote_score: 0,
    combined_score: 0
  },
  {
    id: '10',
    name: 'Mount Lanaya',
    description: 'A beautiful mountain offering stunning views and peaceful hiking experience.',
    difficulty: 'Moderate',
    location: 'Alegria',
    image_url: '../assets/images/spot10.jpg',
    average_rating: 4.2,
    rating_count: 27,
    type: 'Mountain',
    category: 'hiking',
    latitude: 9.7667,
    longitude: 123.4167,
    upvotes: 0,
    downvotes: 0,
    vote_score: 0,
    combined_score: 0
  },
  {
    id: '11',
    name: 'Mount Hambubuyog',
    description: 'A scenic mountain offering beautiful views and challenging hiking trails.',
    difficulty: 'Moderate',
    location: 'Ginatilan',
    image_url: '../assets/images/spot11.jpg',
    average_rating: 4.1,
    rating_count: 52,
    type: 'Mountain',
    category: 'hiking',
    latitude: 9.6167,
    longitude: 123.3333,
    upvotes: 0,
    downvotes: 0,
    vote_score: 0,
    combined_score: 0
  },
  {
    id: '12',
    name: 'Osmeña Peak',
    description: 'The highest peak in Cebu offering breathtaking panoramic views.',
    difficulty: 'Easy',
    location: 'Dalaguete',
    image_url: '../assets/images/spot12.jpg',
    average_rating: 4.8,
    rating_count: 156,
    type: 'Mountain',
    category: 'hiking',
    latitude: 9.7167,
    longitude: 123.5167,
    upvotes: 0,
    downvotes: 0,
    vote_score: 0,
    combined_score: 0
  },
  {
    id: '13',
    name: 'Casino Peak',
    description: 'A scenic peak near Osmeña Peak offering stunning mountain views.',
    difficulty: 'Easy',
    location: 'Dalaguete, near Osmeña Peak',
    image_url: '../assets/images/spot13.jpg',
    average_rating: 4.5,
    rating_count: 89,
    type: 'Mountain',
    category: 'hiking',
    latitude: 9.7100,
    longitude: 123.5200,
    upvotes: 0,
    downvotes: 0,
    vote_score: 0,
    combined_score: 0
  },
  {
    id: '14',
    name: 'Budlaan Falls',
    description: 'A beautiful waterfall with trekking trail to Mt. Kan-irag, perfect for nature lovers.',
    difficulty: 'Moderate',
    location: 'Cebu City – trekking trail to Mt. Kan-irag',
    image_url: '../assets/images/spot14.jpg',
    average_rating: 4.4,
    rating_count: 34,
    type: 'Waterfall',
    category: 'hiking',
    latitude: 10.3300,
    longitude: 123.8600,
    upvotes: 0,
    downvotes: 0,
    vote_score: 0,
    combined_score: 0
  },
  {
    id: '15',
    name: 'Spartan Trail',
    description: 'Challenging urban trail through the city offering great workout and views.',
    difficulty: 'Hard',
    location: 'Cebu City',
    image_url: '../assets/images/spot15.jpg',
    average_rating: 4.4,
    rating_count: 67,
    type: 'Trail',
    category: 'hiking',
    latitude: 10.3167,
    longitude: 123.8833,
    upvotes: 0,
    downvotes: 0,
    vote_score: 0,
    combined_score: 0
  }
];

/**
 * Load hiking spots data
 * @returns Promise<HikingSpot[]> Array of hiking spots
 */
export async function loadHikingSpots(): Promise<HikingSpot[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return MOCK_HIKING_SPOTS.map(spot => ({
    ...spot,
    upvotes: 0,
    downvotes: 0,
    vote_score: 0,
    combined_score: 0
  }));
}

/**
 * Get a specific hiking spot by ID
 * @param id - The hiking spot ID
 * @returns Promise<HikingSpot | null> The hiking spot or null if not found
 */
export async function getHikingSpotById(id: string): Promise<HikingSpot | null> {
  const spots = await loadHikingSpots();
  return spots.find(spot => spot.id === id) || null;
}

/**
 * Search hiking spots by name or location
 * @param query - Search query
 * @returns Promise<HikingSpot[]> Filtered hiking spots
 */
export async function searchHikingSpots(query: string): Promise<HikingSpot[]> {
  const spots = await loadHikingSpots();
  const lowercaseQuery = query.toLowerCase();
  
  return spots.filter(spot => 
    spot.name.toLowerCase().includes(lowercaseQuery) ||
    spot.location?.toLowerCase().includes(lowercaseQuery) ||
    spot.description?.toLowerCase().includes(lowercaseQuery)
  );
}

export { MOCK_HIKING_SPOTS };
export default MOCK_HIKING_SPOTS;