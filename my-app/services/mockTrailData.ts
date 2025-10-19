// Mock trail data based on insert-trail-routes-data.sql
// This provides fallback data when the database is not available

export interface MockTrailRoute {
  id: string;
  route_id: string;
  route_name: string;
  hiking_spot_id: string;
  difficulty: string;
  distance_km: number;
  elevation_gain_m: number;
  estimated_duration_min: number;
  route_description: string;
  route_features: string;
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  waypoints: Array<{ lat: number; lng: number }>;
  geojson_path: {
    type: 'LineString';
    coordinates: number[][];
  };
}

// Mock data for Mount Naupa (Naga City) - Using exact PostGIS coordinates from SQL
const mountNaupaRoutes: MockTrailRoute[] = [
  {
    id: '1',
    route_id: '1',
    route_name: 'Naupa Village Trail',
    hiking_spot_id: '1',
    difficulty: 'Easy',
    distance_km: 2.6,
    elevation_gain_m: 190,
    estimated_duration_min: 90,
    route_description: 'Accessible trail passing through farms and local settlements.',
    route_features: 'Agricultural scenery, community access',
    start_latitude: 10.2070,
    start_longitude: 123.7480,
    end_latitude: 10.2095,
    end_longitude: 123.7520,
    waypoints: [
      { lat: 10.2075, lng: 123.7490 },
      { lat: 10.2080, lng: 123.7500 },
      { lat: 10.2090, lng: 123.7510 }
    ],
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7480, 10.2070],
        [123.7490, 10.2075],
        [123.7500, 10.2080],
        [123.7510, 10.2090],
        [123.7520, 10.2095]
      ]
    }
  },
  {
    id: '2',
    route_id: '2',
    route_name: 'Naupa Forest Path',
    hiking_spot_id: '1',
    difficulty: 'Moderate',
    distance_km: 4.5,
    elevation_gain_m: 330,
    estimated_duration_min: 150,
    route_description: 'Forest approach with natural springs and birdlife.',
    route_features: 'Secondary forest, shaded canopy',
    start_latitude: 10.2060,
    start_longitude: 123.7470,
    end_latitude: 10.2105,
    end_longitude: 123.7530,
    waypoints: [
      { lat: 10.2070, lng: 123.7485 },
      { lat: 10.2085, lng: 123.7505 },
      { lat: 10.2095, lng: 123.7520 }
    ],
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7470, 10.2060],
        [123.7485, 10.2070],
        [123.7505, 10.2085],
        [123.7520, 10.2095],
        [123.7530, 10.2105]
      ]
    }
  },
  {
    id: '3',
    route_id: '3',
    route_name: 'Naupa Summit Route',
    hiking_spot_id: '1',
    difficulty: 'Moderate',
    distance_km: 5.3,
    elevation_gain_m: 380,
    estimated_duration_min: 180,
    route_description: 'Traditional route to the summit with scenic overlooks.',
    route_features: 'River crossings, open summit views',
    start_latitude: 10.2050,
    start_longitude: 123.7460,
    end_latitude: 10.2115,
    end_longitude: 123.7540,
    waypoints: [
      { lat: 10.2065, lng: 123.7480 },
      { lat: 10.2080, lng: 123.7500 },
      { lat: 10.2100, lng: 123.7525 }
    ],
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7460, 10.2050],
        [123.7480, 10.2065],
        [123.7500, 10.2080],
        [123.7525, 10.2100],
        [123.7540, 10.2115]
      ]
    }
  },
  {
    id: '4',
    route_id: '4',
    route_name: 'Naupa Wilderness Trek',
    hiking_spot_id: '1',
    difficulty: 'Hard',
    distance_km: 7.0,
    elevation_gain_m: 490,
    estimated_duration_min: 260,
    route_description: 'Longer wilderness route for seasoned trekkers.',
    route_features: 'Dense forest, rugged terrain',
    start_latitude: 10.2040,
    start_longitude: 123.7450,
    end_latitude: 10.2125,
    end_longitude: 123.7550,
    waypoints: [
      { lat: 10.2060, lng: 123.7475 },
      { lat: 10.2080, lng: 123.7500 },
      { lat: 10.2105, lng: 123.7530 },
      { lat: 10.2115, lng: 123.7540 }
    ],
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7450, 10.2040],
        [123.7475, 10.2060],
        [123.7500, 10.2080],
        [123.7530, 10.2105],
        [123.7540, 10.2115],
        [123.7550, 10.2125]
      ]
    }
  }
];

// Mock data for Mount Tagaytay (Toledo City) - placeholder routes per requirements
const mountTagaytayRoutes: MockTrailRoute[] = [
  {
    id: '84_1',
    route_id: '84_1',
    route_name: 'Mount Tagaytay — Easy Trail',
    hiking_spot_id: '84',
    difficulty: 'Easy',
    distance_km: 2.5,
    elevation_gain_m: 160,
    estimated_duration_min: 90,
    route_description: 'Beginner-friendly route with gradual slopes and lake view at Malubog.',
    route_features: 'Gradual slopes, lake view, beginner-friendly',
    start_latitude: 10.3635,
    start_longitude: 123.7285,
    end_latitude: 10.3665,
    end_longitude: 123.7315,
    waypoints: [
      { lat: 10.3645, lng: 123.7295 },
      { lat: 10.3655, lng: 123.7305 },
      { lat: 10.3660, lng: 123.7310 }
    ],
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7285, 10.3635],
        [123.7295, 10.3645],
        [123.7305, 10.3655],
        [123.7310, 10.3660],
        [123.7315, 10.3665]
      ]
    }
  },
  {
    id: '84_2',
    route_id: '84_2',
    route_name: 'Mount Tagaytay — Medium Trail',
    hiking_spot_id: '84',
    difficulty: 'Moderate',
    distance_km: 4.2,
    elevation_gain_m: 320,
    estimated_duration_min: 150,
    route_description: 'Ridge-to-summit route with moderate elevation gain and scenic overlooks.',
    route_features: 'Ridge sections, scenic overlooks, moderate gain',
    start_latitude: 10.3625,
    start_longitude: 123.7275,
    end_latitude: 10.3675,
    end_longitude: 123.7325,
    waypoints: [
      { lat: 10.3640, lng: 123.7288 },
      { lat: 10.3655, lng: 123.7302 },
      { lat: 10.3665, lng: 123.7315 }
    ],
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7275, 10.3625],
        [123.7288, 10.3640],
        [123.7302, 10.3655],
        [123.7315, 10.3665],
        [123.7325, 10.3675]
      ]
    }
  },
  {
    id: '84_3',
    route_id: '84_3',
    route_name: 'Mount Tagaytay — Hard Trail',
    hiking_spot_id: '84',
    difficulty: 'Hard',
    distance_km: 6.8,
    elevation_gain_m: 520,
    estimated_duration_min: 240,
    route_description: "Full circuit trail around Malubog Lake leading to Tagaytay's highest point with steep ascents.",
    route_features: 'Circuit route, steep ascents, highest point',
    start_latitude: 10.3615,
    start_longitude: 123.7265,
    end_latitude: 10.3685,
    end_longitude: 123.7335,
    waypoints: [
      { lat: 10.3635, lng: 123.7285 },
      { lat: 10.3655, lng: 123.7305 },
      { lat: 10.3670, lng: 123.7320 }
    ],
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7265, 10.3615],
        [123.7285, 10.3635],
        [123.7305, 10.3655],
        [123.7320, 10.3670],
        [123.7335, 10.3685]
      ]
    }
  }
];

// Mock data for Mount Babag (Cebu City) - Using exact PostGIS coordinates from SQL
const mountBabagRoutes: MockTrailRoute[] = [
  {
    id: '5',
    route_id: '5',
    route_name: 'Babag Ridge Easy Trail',
    hiking_spot_id: '2',
    difficulty: 'Easy',
    distance_km: 2.4,
    elevation_gain_m: 160,
    estimated_duration_min: 80,
    route_description: 'A short, well-marked trail ideal for beginners with multiple rest points.',
    route_features: 'Gentle slopes, pine trees, family-friendly',
    start_latitude: 10.3140,
    start_longitude: 123.9620,
    end_latitude: 10.3170,
    end_longitude: 123.9660,
    waypoints: [
      { lat: 10.3145, lng: 123.9630 },
      { lat: 10.3150, lng: 123.9635 },
      { lat: 10.3155, lng: 123.9645 },
      { lat: 10.3165, lng: 123.9655 }
    ],
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9620, 10.3140],
        [123.9630, 10.3145],
        [123.9635, 10.3150],
        [123.9645, 10.3155],
        [123.9655, 10.3165],
        [123.9660, 10.3170]
      ]
    }
  },
  {
    id: '6',
    route_id: '6',
    route_name: 'Babag Summit Classic',
    hiking_spot_id: '2',
    difficulty: 'Moderate',
    distance_km: 4.6,
    elevation_gain_m: 620,
    estimated_duration_min: 200,
    route_description: 'Standard route to the summit with panoramic views of the city and coast.',
    route_features: 'Steeper ascent, rocky sections, great summit views',
    start_latitude: 10.3130,
    start_longitude: 123.9610,
    end_latitude: 10.3180,
    end_longitude: 123.9680,
    waypoints: [
      { lat: 10.3140, lng: 123.9625 },
      { lat: 10.3150, lng: 123.9640 },
      { lat: 10.3160, lng: 123.9655 },
      { lat: 10.3170, lng: 123.9670 }
    ],
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9610, 10.3130],
        [123.9625, 10.3140],
        [123.9640, 10.3150],
        [123.9655, 10.3160],
        [123.9670, 10.3170],
        [123.9680, 10.3180]
      ]
    }
  },
  {
    id: '7',
    route_id: '7',
    route_name: 'Babag Sunrise Route',
    hiking_spot_id: '2',
    difficulty: 'Moderate',
    distance_km: 3.5,
    elevation_gain_m: 480,
    estimated_duration_min: 150,
    route_description: 'Popular early-morning hike for sunrise photography.',
    route_features: 'Sunrise viewpoint, photography spots',
    start_latitude: 10.3135,
    start_longitude: 123.9615,
    end_latitude: 10.3175,
    end_longitude: 123.9665,
    waypoints: [
      { lat: 10.3145, lng: 123.9630 },
      { lat: 10.3155, lng: 123.9645 },
      { lat: 10.3165, lng: 123.9655 }
    ],
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9615, 10.3135],
        [123.9630, 10.3145],
        [123.9645, 10.3155],
        [123.9655, 10.3165],
        [123.9665, 10.3175]
      ]
    }
  }
];

// Mock data mapping by hiking spot ID
const mockTrailData: Record<string, MockTrailRoute[]> = {
  '1': mountNaupaRoutes,
  '2': mountBabagRoutes,
  '84': mountTagaytayRoutes,
  // Add more hiking spots as needed
};

// Mock hiking spot names for reference
export const mockHikingSpots: Record<string, string> = {
  '1': 'Mount Naupa',
  '2': 'Mount Babag',
  '3': 'Mount Kan-Irag',
  '4': 'Mount Manunggal',
  '5': 'Mount Mago',
  '6': 'Mount Kapayas',
  '7': 'Mount Lantoy',
  '8': 'Mount Kalbasaan',
  '9': 'Mount Mauyog',
  '10': 'Mount Lanaya',
  '11': 'Mount Hambubuyog',
  '12': 'Mount Kalawisan',
  '13': 'Osmeña Peak',
  '14': 'Casino Peak',
  '15': 'Budlaan Falls',
  '84': 'Mount Tagaytay (Toledo City)'
};

// Function to get mock trail routes for a hiking spot
export const getMockTrailRoutes = (hikingSpotId: string): MockTrailRoute[] => {
  console.log('[MOCK] Getting trail routes for hiking spot:', hikingSpotId);
  
  const routes = mockTrailData[hikingSpotId] || [];
  
  // If no specific routes exist, generate some generic ones
  if (routes.length === 0) {
    const spotName = mockHikingSpots[hikingSpotId] || `Hiking Spot ${hikingSpotId}`;
    const baseCoords = getBaseCoordinates(hikingSpotId);
    
    return generateGenericRoutes(hikingSpotId, spotName, baseCoords);
  }
  
  console.log('[MOCK] Found', routes.length, 'routes for spot', hikingSpotId);
  return routes;
};

// Generate generic routes for spots without specific data
const generateGenericRoutes = (
  hikingSpotId: string, 
  spotName: string, 
  baseCoords: { lat: number; lng: number }
): MockTrailRoute[] => {
  const difficulties = ['Easy', 'Moderate', 'Hard'];
  const routes: MockTrailRoute[] = [];
  
  difficulties.forEach((difficulty, index) => {
    const offset = (index + 1) * 0.005;
    const route: MockTrailRoute = {
      id: `${hikingSpotId}_${index + 1}`,
      route_id: `${hikingSpotId}_${index + 1}`,
      route_name: `${spotName} ${difficulty} Trail`,
      hiking_spot_id: hikingSpotId,
      difficulty,
      distance_km: 2 + index * 1.5,
      elevation_gain_m: 150 + index * 100,
      estimated_duration_min: 60 + index * 30,
      route_description: `A ${difficulty.toLowerCase()} trail on ${spotName} with scenic views.`,
      route_features: `${difficulty} terrain, mountain views`,
      start_latitude: baseCoords.lat - offset,
      start_longitude: baseCoords.lng - offset,
      end_latitude: baseCoords.lat + offset,
      end_longitude: baseCoords.lng + offset,
      waypoints: [
        { lat: baseCoords.lat - offset/2, lng: baseCoords.lng - offset/2 },
        { lat: baseCoords.lat, lng: baseCoords.lng },
        { lat: baseCoords.lat + offset/2, lng: baseCoords.lng + offset/2 }
      ],
      geojson_path: {
        type: 'LineString',
        coordinates: [
          [baseCoords.lng - offset, baseCoords.lat - offset],
          [baseCoords.lng - offset/2, baseCoords.lat - offset/2],
          [baseCoords.lng, baseCoords.lat],
          [baseCoords.lng + offset/2, baseCoords.lat + offset/2],
          [baseCoords.lng + offset, baseCoords.lat + offset]
        ]
      }
    };
    routes.push(route);
  });
  
  return routes;
};

// Get base coordinates for different hiking spots
const getBaseCoordinates = (hikingSpotId: string): { lat: number; lng: number } => {
  const coordinates: Record<string, { lat: number; lng: number }> = {
    '1': { lat: 10.2075, lng: 123.7605 }, // Mount Naupa
    '2': { lat: 10.3475, lng: 123.9495 }, // Mount Babag
    '3': { lat: 10.3167, lng: 123.9167 }, // Mount Kan-irag/Sirao Peak
    '4': { lat: 10.4500, lng: 123.7833 }, // Mount Manunggal
    '5': { lat: 10.4167, lng: 124.0000 }, // Mount Mago
    '6': { lat: 10.6167, lng: 124.0167 }, // Mount Kapayas
    '7': { lat: 9.8833, lng: 123.3667 }, // Mount Lantoy
    '8': { lat: 10.2500, lng: 123.8000 }, // Mount Kalbasaan
    '9': { lat: 10.5000, lng: 123.7000 }, // Mount Mauyog
    '10': { lat: 9.7667, lng: 123.4000 }, // Mount Lanaya
    '11': { lat: 9.6000, lng: 123.3167 }, // Mount Hambubuyog
    '12': { lat: 10.3167, lng: 124.0167 }, // Mount Kalawisan
    '13': { lat: 9.9167, lng: 123.3333 }, // Osmeña Peak
    '14': { lat: 9.9100, lng: 123.3250 }, // Casino Peak
    '15': { lat: 10.3500, lng: 123.9000 },  // Budlaan Falls
    '84': { lat: 10.3650, lng: 123.7300 }   // Mount Tagaytay (Toledo City)
  };
  
  return coordinates[hikingSpotId] || { lat: 10.3157, lng: 123.8854 };
};

// Check if mock data should be used (when database is unavailable)
export const shouldUseMockData = (): boolean => {
  // Only use mock data when explicitly enabled via environment variable
  // This prevents random coordinate generation and ensures actual SQL data is used
  return process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true';
};

export default {
  getMockTrailRoutes,
  mockHikingSpots,
  shouldUseMockData
};
