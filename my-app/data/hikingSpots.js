export const hikingSpots = [
  { 
    id: '71',
    name: "Mount Babag", 
    slug: "mount-babag", 
    thumbnail: require("../assets/images/mount-babag/thumbnail.webp"),
    latitude: 10.3157, 
    longitude: 123.9621, 
    average_rating: 4.5, 
    rating_count: 128,
    difficulty: 'Moderate',
    distance_km: 3.2,
    elevation_gain_m: 450
  },
  { 
    id: '72',
    name: "Mount Kan-Irag", 
    slug: "mt kan-irag", 
    thumbnail: require("../assets/images/mt kan-irag/thumbnail.jpg"),
    latitude: 10.3970, 
    longitude: 123.8585, 
    average_rating: 4.3, 
    rating_count: 95,
    difficulty: 'Moderate',
    distance_km: 4.1,
    elevation_gain_m: 520
  },
  { 
    id: '73',
    name: "Mount Naupa", 
    slug: "mt naupa", 
    thumbnail: require("../assets/images/mt naupa/thumbnail.jpg"),
    latitude: 10.2800, 
    longitude: 123.9200, 
    average_rating: 4.7, 
    rating_count: 156,
    difficulty: 'Hard',
    distance_km: 5.8,
    elevation_gain_m: 680
  },
  { 
    id: '74',
    name: "Mount Manunggal", 
    slug: "mt manunggal", 
    thumbnail: require("../assets/images/mt manunggal/thumbnail.jpg"),
    latitude: 10.4500, 
    longitude: 124.0200, 
    average_rating: 4.2, 
    rating_count: 87,
    difficulty: 'Moderate',
    distance_km: 3.7,
    elevation_gain_m: 390
  },
  { 
    id: '75',
    name: "Mount Mago", 
    slug: "mt mago", 
    thumbnail: require("../assets/images/mt mago/thumbnail.jpg"),
    latitude: 10.3800, 
    longitude: 123.9800, 
    average_rating: 4.4, 
    rating_count: 112,
    difficulty: 'Easy',
    distance_km: 2.5,
    elevation_gain_m: 280
  },
  { 
    id: '76',
    name: "Mount Kapayas", 
    slug: "mt kapayas", 
    thumbnail: require("../assets/images/mt kapayas/thumbnail.webp"),
    latitude: 10.3600, 
    longitude: 123.9400, 
    average_rating: 4.1, 
    rating_count: 73,
    difficulty: 'Moderate',
    distance_km: 4.3,
    elevation_gain_m: 510
  },
  { 
    id: '77',
    name: "Mount Lantoy", 
    slug: "mount latoy", 
    thumbnail: require("../assets/images/mount latoy/thumbnail.webp"),
    latitude: 10.3300, 
    longitude: 123.9700, 
    average_rating: 4.6, 
    rating_count: 134,
    difficulty: 'Hard',
    distance_km: 6.2,
    elevation_gain_m: 750
  },
  { 
    id: '78',
    name: "Mount Kalbasaan", 
    slug: "mt kalbasan", 
    thumbnail: require("../assets/images/mt kalbasan/thumbnail.jpg"),
    latitude: 10.3100, 
    longitude: 123.9300, 
    average_rating: 4.0, 
    rating_count: 65,
    difficulty: 'Easy',
    distance_km: 2.8,
    elevation_gain_m: 320
  },
  { 
    id: '79',
    name: "Mount Mauyog", 
    slug: "mt mauyog", 
    thumbnail: require("../assets/images/mt mauyog/thumbnail.jpg"),
    latitude: 10.3400, 
    longitude: 123.9600, 
    average_rating: 4.3, 
    rating_count: 98,
    difficulty: 'Moderate',
    distance_km: 3.9,
    elevation_gain_m: 460
  },
  { 
    id: '80',
    name: "Mount Lanaya", 
    slug: "mt lanaya", 
    thumbnail: require("../assets/images/mt lanaya/thumbnail.jpg"),
    latitude: 10.3700, 
    longitude: 123.9900, 
    average_rating: 4.5, 
    rating_count: 121,
    difficulty: 'Moderate',
    distance_km: 4.0,
    elevation_gain_m: 480
  },
  { 
    id: '81',
    name: "Lugsangan Peak", 
    slug: "lugsangan peak", 
    thumbnail: require("../assets/images/Lugsangan Peak/1.jpg"),
    latitude: 9.6072, 
    longitude: 123.3312, 
    average_rating: 4.3, 
    rating_count: 45,
    difficulty: 'Moderate',
    distance_km: 4.2,
    elevation_gain_m: 620
  },
  { 
    id: '82',
    name: "Osmeña Peak", 
    slug: "osmena peak", 
    thumbnail: require("../assets/images/osmena peak/thumbnail.jpg"),
    latitude: 10.2600, 
    longitude: 123.8900, 
    average_rating: 4.8, 
    rating_count: 203,
    difficulty: 'Easy',
    distance_km: 1.8,
    elevation_gain_m: 180
  },
  { 
    id: '83',
    name: "Casino Peak", 
    slug: "casino peak", 
    thumbnail: require("../assets/images/casino peak/thumbnail.jpg"),
    latitude: 10.2700, 
    longitude: 123.9000, 
    average_rating: 4.4, 
    rating_count: 145,
    difficulty: 'Moderate',
    distance_km: 3.5,
    elevation_gain_m: 420
  },
  { 
    id: '84',
    name: "Mount Tagaytay", 
    slug: "mount tagaytay", 
    thumbnail: require("../assets/images/Mount Tagaytay/5.jpg"),
    latitude: 10.3650, 
    longitude: 123.7300, 
    average_rating: 4.2, 
    rating_count: 0,
    difficulty: 'Moderate',
    distance_km: 3.5,
    elevation_gain_m: 420
  },
  { 
    id: '85',
    name: "Spartan Trail", 
    slug: "spartantrail", 
    thumbnail: require("../assets/images/spartantrail/thumbnail.jpg"),
    latitude: 10.3000, 
    longitude: 123.9500, 
    average_rating: 4.1, 
    rating_count: 78,
    difficulty: 'Hard',
    distance_km: 7.2,
    elevation_gain_m: 890
  }
];

// Helper function to get hiking spot by ID
export const getHikingSpotById = (id) => {
  return hikingSpots.find(spot => spot.id === id);
};

// Helper function to get hiking spot by slug
export const getHikingSpotBySlug = (slug) => {
  return hikingSpots.find(spot => spot.slug === slug);
};

// Helper function to get all hiking spots
export const getAllHikingSpots = () => {
  return hikingSpots;
};

// Helper function to get top rated hiking spots
export const getTopRatedHikingSpots = (limit = 5) => {
  return hikingSpots
    .sort((a, b) => b.average_rating - a.average_rating)
    .slice(0, limit);
};