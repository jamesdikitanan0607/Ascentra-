// Trail Routes Data for the 5 New Mountains
// This file contains detailed trail route information for Mount Babag, Mount Kan-irag/Sirao Peak, 
// Mount Naupa, Mount Manunggal, and Mount Mago

export interface TrailRoute {
  id: string;
  route_id: string; // Added for TrailMap component compatibility
  hikingSpotId: string; // Updated for consistency
  hiking_spot_id: string; // Keep for backward compatibility
  route_name: string;
  difficulty: 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Hard' | 'Very Hard';
  start_coordinates: {
    latitude: number;
    longitude: number;
  };
  end_coordinates: {
    latitude: number;
    longitude: number;
  };
  distance_km: number;
  elevation_gain_m: number;
  estimated_duration_hr: number;
  highlights: string;
  route_color: string;
  geojson_path: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

export const NEW_TRAIL_ROUTES: TrailRoute[] = [
  // MOUNT BABAG ROUTES (hiking_spot_id: '71')
  {
    id: 'babag-antenna-trail',
    route_id: 'babag-antenna-trail',
    hikingSpotId: '71',
    hiking_spot_id: '71',
    route_name: 'Babag Antenna Trail',
    difficulty: 'Easy',
    start_coordinates: { latitude: 10.3451, longitude: 123.8863 },
    end_coordinates: { latitude: 10.3470, longitude: 123.8885 },
    distance_km: 2.2,
    elevation_gain_m: 170,
    estimated_duration_hr: 1.2,
    highlights: 'Radio towers, city skyline views',
    route_color: '#4CAF50',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8863, 10.3451],
        [123.8870, 10.3458],
        [123.8878, 10.3465],
        [123.8885, 10.3470]
      ]
    }
  },
  {
    id: 'babag-ridge-path',
    route_id: 'babag-ridge-path',
    hiking_spot_id: '71',
    hikingSpotId: '71', // Added for consistency with components expecting hikingSpotId
    route_name: 'Babag Ridge Path',
    difficulty: 'Easy-Moderate',
    start_coordinates: { latitude: 10.3432, longitude: 123.8840 },
    end_coordinates: { latitude: 10.3470, longitude: 123.8885 },
    distance_km: 3.3,
    elevation_gain_m: 250,
    estimated_duration_hr: 1.8,
    highlights: 'Rolling ridge, forest',
    route_color: '#81C784',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8840, 10.3432],
        [123.8850, 10.3445],
        [123.8865, 10.3458],
        [123.8885, 10.3470]
      ]
    }
  },
  {
    id: 'babag-loop-circuit',
    route_id: 'babag-loop-circuit',
    hiking_spot_id: '71',
    hikingSpotId: '71', // Added for consistency with components expecting hikingSpotId
    route_name: 'Babag Loop Circuit',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 10.3410, longitude: 123.8818 },
    end_coordinates: { latitude: 10.3493, longitude: 123.8908 },
    distance_km: 4.8,
    elevation_gain_m: 420,
    estimated_duration_hr: 2.6,
    highlights: 'Ridge + ocean views',
    route_color: '#FF9800',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8818, 10.3410],
        [123.8840, 10.3430],
        [123.8865, 10.3455],
        [123.8885, 10.3475],
        [123.8908, 10.3493]
      ]
    }
  },
  {
    id: 'babag-sirao-traverse',
    route_id: 'babag-sirao-traverse',
    hiking_spot_id: '71',
    hikingSpotId: '71', // Added for consistency with components expecting hikingSpotId
    route_name: 'Babag to Sirao Traverse',
    difficulty: 'Hard',
    start_coordinates: { latitude: 10.3391, longitude: 123.8797 },
    end_coordinates: { latitude: 10.3514, longitude: 123.8931 },
    distance_km: 6.5,
    elevation_gain_m: 570,
    estimated_duration_hr: 3.6,
    highlights: 'Connects to Kan-Irag ridge',
    route_color: '#F44336',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8797, 10.3391],
        [123.8820, 10.3415],
        [123.8850, 10.3445],
        [123.8880, 10.3475],
        [123.8910, 10.3495],
        [123.8931, 10.3514]
      ]
    }
  },
  {
    id: 'babag-extreme-climb',
    route_id: 'babag-extreme-climb',
    hiking_spot_id: '71',
    hikingSpotId: '71', // Added for consistency with components expecting hikingSpotId
    route_name: 'Babag Extreme Climb',
    difficulty: 'Very Hard',
    start_coordinates: { latitude: 10.3369, longitude: 123.8776 },
    end_coordinates: { latitude: 10.3536, longitude: 123.8953 },
    distance_km: 7.9,
    elevation_gain_m: 740,
    estimated_duration_hr: 4.7,
    highlights: 'Steep rocky sections',
    route_color: '#9C27B0',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8776, 10.3369],
        [123.8800, 10.3395],
        [123.8830, 10.3425],
        [123.8865, 10.3460],
        [123.8900, 10.3495],
        [123.8930, 10.3520],
        [123.8953, 10.3536]
      ]
    }
  },

  // MOUNT KAN-IRAG / SIRAO PEAK ROUTES (hiking_spot_id: '72')
  {
    id: 'sirao-garden-trail',
    route_id: 'sirao-garden-trail',
    hiking_spot_id: '72',
    hikingSpotId: '72', // Added for consistency with components expecting hikingSpotId
    route_name: 'Sirao Garden Trail',
    difficulty: 'Easy',
    start_coordinates: { latitude: 10.3941, longitude: 123.8573 },
    end_coordinates: { latitude: 10.3970, longitude: 123.8585 },
    distance_km: 2.2,
    elevation_gain_m: 180,
    estimated_duration_hr: 1.2,
    highlights: 'Flower farm views',
    route_color: '#E91E63',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8573, 10.3941],
        [123.8578, 10.3950],
        [123.8582, 10.3960],
        [123.8585, 10.3970]
      ]
    }
  },
  {
    id: 'kan-irag-grassland',
    route_id: 'kan-irag-grassland',
    hiking_spot_id: '72',
    hikingSpotId: '72', // Added for consistency with components expecting hikingSpotId
    route_name: 'Kan-irag Grassland',
    difficulty: 'Easy-Moderate',
    start_coordinates: { latitude: 10.3919, longitude: 123.8540 },
    end_coordinates: { latitude: 10.3970, longitude: 123.8585 },
    distance_km: 3.1,
    elevation_gain_m: 250,
    estimated_duration_hr: 2.0,
    highlights: 'Rolling hills',
    route_color: '#8BC34A',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8540, 10.3919],
        [123.8555, 10.3935],
        [123.8570, 10.3955],
        [123.8585, 10.3970]
      ]
    }
  },
  {
    id: 'sirao-loop-trail',
    route_id: 'sirao-loop-trail',
    hiking_spot_id: '72',
    hikingSpotId: '72', // Added for consistency with components expecting hikingSpotId
    route_name: 'Sirao Loop Trail',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 10.3890, longitude: 123.8520 },
    end_coordinates: { latitude: 10.3992, longitude: 123.8612 },
    distance_km: 4.8,
    elevation_gain_m: 410,
    estimated_duration_hr: 2.5,
    highlights: 'Peak views',
    route_color: '#FF5722',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8520, 10.3890],
        [123.8540, 10.3920],
        [123.8570, 10.3960],
        [123.8600, 10.3985],
        [123.8612, 10.3992]
      ]
    }
  },
  {
    id: 'kan-irag-traverse',
    route_id: 'kan-irag-traverse',
    hiking_spot_id: '72',
    hikingSpotId: '72', // Added for consistency with components expecting hikingSpotId
    route_name: 'Kan-irag Traverse',
    difficulty: 'Hard',
    start_coordinates: { latitude: 10.3872, longitude: 123.8502 },
    end_coordinates: { latitude: 10.4031, longitude: 123.8625 },
    distance_km: 6.5,
    elevation_gain_m: 580,
    estimated_duration_hr: 3.5,
    highlights: 'Steep scramble',
    route_color: '#795548',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8502, 10.3872],
        [123.8530, 10.3900],
        [123.8570, 10.3950],
        [123.8600, 10.3990],
        [123.8625, 10.4031]
      ]
    }
  },
  {
    id: 'sirao-peak-summit-ridge',
    route_id: 'sirao-peak-summit-ridge',
    hiking_spot_id: '72',
    hikingSpotId: '72', // Added for consistency with components expecting hikingSpotId
    route_name: 'Sirao Peak Summit Ridge',
    difficulty: 'Very Hard',
    start_coordinates: { latitude: 10.3850, longitude: 123.8482 },
    end_coordinates: { latitude: 10.4060, longitude: 123.8635 },
    distance_km: 8.0,
    elevation_gain_m: 720,
    estimated_duration_hr: 4.5,
    highlights: 'Full ridge exposure',
    route_color: '#607D8B',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8482, 10.3850],
        [123.8510, 10.3880],
        [123.8550, 10.3930],
        [123.8590, 10.3980],
        [123.8620, 10.4020],
        [123.8635, 10.4060]
      ]
    }
  },

  // MOUNT NAUPA ROUTES (hiking_spot_id: '73')
  {
    id: 'naupa-base-trail',
    route_id: 'naupa-base-trail',
    hiking_spot_id: '73',
    hikingSpotId: '73', // Added for consistency with components expecting hikingSpotId
    route_name: 'Naupa Base Trail',
    difficulty: 'Easy',
    start_coordinates: { latitude: 10.2550, longitude: 123.7558 },
    end_coordinates: { latitude: 10.2570, longitude: 123.7580 },
    distance_km: 2.8,
    elevation_gain_m: 200,
    estimated_duration_hr: 1.5,
    highlights: 'Accessible trail through agricultural areas, local community interaction, gentle slopes with fruit trees and vegetable gardens',
    route_color: '#4CAF50',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7558, 10.2550],
        [123.7565, 10.2555],
        [123.7572, 10.2560],
        [123.7580, 10.2570]
      ]
    }
  },
  {
    id: 'naupa-eco-trail',
    route_id: 'naupa-eco-trail',
    hiking_spot_id: '73',
    hikingSpotId: '73', // Added for consistency with components expecting hikingSpotId
    route_name: 'Naupa Eco Trail',
    difficulty: 'Easy',
    start_coordinates: { latitude: 10.2560, longitude: 123.7660 },
    end_coordinates: { latitude: 10.2558, longitude: 123.7698 },
    distance_km: 1.8,
    elevation_gain_m: 120,
    estimated_duration_hr: 1.0,
    highlights: 'Grassland',
    route_color: '#CDDC39',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7660, 10.2560],
        [123.7670, 10.2559],
        [123.7685, 10.2558],
        [123.7698, 10.2558]
      ]
    }
  },
  {
    id: 'naupa-ridge-walk',
    route_id: 'naupa-ridge-walk',
    hiking_spot_id: '73',
    hikingSpotId: '73', // Added for consistency with components expecting hikingSpotId
    route_name: 'Naupa Ridge Walk',
    difficulty: 'Easy-Moderate',
    start_coordinates: { latitude: 10.2539, longitude: 123.7645 },
    end_coordinates: { latitude: 10.2558, longitude: 123.7698 },
    distance_km: 2.7,
    elevation_gain_m: 190,
    estimated_duration_hr: 1.5,
    highlights: 'Rolling hills',
    route_color: '#FFC107',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7645, 10.2539],
        [123.7660, 10.2545],
        [123.7680, 10.2552],
        [123.7698, 10.2558]
      ]
    }
  },
  {
    id: 'naupa-loop-trail',
    route_id: 'naupa-loop-trail',
    hiking_spot_id: '73',
    hikingSpotId: '73', // Added for consistency with components expecting hikingSpotId
    route_name: 'Naupa Loop Trail',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 10.2520, longitude: 123.7620 },
    end_coordinates: { latitude: 10.2575, longitude: 123.7722 },
    distance_km: 4.0,
    elevation_gain_m: 320,
    estimated_duration_hr: 2.2,
    highlights: 'Summit views',
    route_color: '#009688',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7620, 10.2520],
        [123.7650, 10.2540],
        [123.7680, 10.2560],
        [123.7710, 10.2570],
        [123.7722, 10.2575]
      ]
    }
  },
  {
    id: 'naupa-kabalas-ridge',
    route_id: 'naupa-kabalas-ridge',
    hiking_spot_id: '73',
    hikingSpotId: '73', // Added for consistency with components expecting hikingSpotId
    route_name: 'Naupa-Kabalas Ridge',
    difficulty: 'Hard',
    start_coordinates: { latitude: 10.2502, longitude: 123.7601 },
    end_coordinates: { latitude: 10.2595, longitude: 123.7740 },
    distance_km: 5.8,
    elevation_gain_m: 460,
    estimated_duration_hr: 3.2,
    highlights: 'Steep ascent',
    route_color: '#3F51B5',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7601, 10.2502],
        [123.7630, 10.2520],
        [123.7670, 10.2550],
        [123.7710, 10.2580],
        [123.7740, 10.2595]
      ]
    }
  },
  {
    id: 'naupa-extreme-traverse',
    route_id: 'naupa-extreme-traverse',
    hiking_spot_id: '73',
    hikingSpotId: '73', // Added for consistency with components expecting hikingSpotId
    route_name: 'Naupa Extreme Traverse',
    difficulty: 'Very Hard',
    start_coordinates: { latitude: 10.2481, longitude: 123.7580 },
    end_coordinates: { latitude: 10.2610, longitude: 123.7758 },
    distance_km: 7.5,
    elevation_gain_m: 610,
    estimated_duration_hr: 4.5,
    highlights: 'Ridge scramble',
    route_color: '#E91E63',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7580, 10.2481],
        [123.7610, 10.2500],
        [123.7650, 10.2530],
        [123.7690, 10.2570],
        [123.7730, 10.2600],
        [123.7758, 10.2610]
      ]
    }
  },

  // MOUNT MANUNGGAL ROUTES (hiking_spot_id: '74')
  {
    id: 'manunggal-heritage-trail',
    route_id: 'manunggal-heritage-trail',
    hiking_spot_id: '74',
    hikingSpotId: '74', // Added for consistency with components expecting hikingSpotId
    route_name: 'Manunggal Heritage Trail',
    difficulty: 'Easy',
    start_coordinates: { latitude: 10.4911, longitude: 123.7800 },
    end_coordinates: { latitude: 10.4939, longitude: 123.7831 },
    distance_km: 2.2,
    elevation_gain_m: 160,
    estimated_duration_hr: 1.3,
    highlights: 'Historic site',
    route_color: '#8D6E63',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7800, 10.4911],
        [123.7810, 10.4920],
        [123.7820, 10.4930],
        [123.7831, 10.4939]
      ]
    }
  },
  {
    id: 'manunggal-grass-ridge',
    route_id: 'manunggal-grass-ridge',
    hiking_spot_id: '74',
    hikingSpotId: '74', // Added for consistency with components expecting hikingSpotId
    route_name: 'Manunggal Grass Ridge',
    difficulty: 'Easy-Moderate',
    start_coordinates: { latitude: 10.4892, longitude: 123.7775 },
    end_coordinates: { latitude: 10.4939, longitude: 123.7831 },
    distance_km: 3.4,
    elevation_gain_m: 250,
    estimated_duration_hr: 1.8,
    highlights: 'Rolling meadows',
    route_color: '#689F38',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7775, 10.4892],
        [123.7790, 10.4905],
        [123.7810, 10.4920],
        [123.7831, 10.4939]
      ]
    }
  },
  {
    id: 'manunggal-ridge-trail',
    route_id: 'manunggal-ridge-trail',
    hiking_spot_id: '74',
    hikingSpotId: '74', // Added for consistency with components expecting hikingSpotId
    route_name: 'Manunggal Ridge Trail',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 10.4870, longitude: 123.7752 },
    end_coordinates: { latitude: 10.4961, longitude: 123.7860 },
    distance_km: 4.9,
    elevation_gain_m: 420,
    estimated_duration_hr: 2.6,
    highlights: 'Summit forest',
    route_color: '#FF7043',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7752, 10.4870],
        [123.7780, 10.4890],
        [123.7810, 10.4920],
        [123.7840, 10.4950],
        [123.7860, 10.4961]
      ]
    }
  },
  {
    id: 'mt-manunggal-traverse',
    route_id: 'mt-manunggal-traverse',
    hiking_spot_id: '74',
    hikingSpotId: '74', // Added for consistency with components expecting hikingSpotId
    route_name: 'Mt. Manunggal Traverse',
    difficulty: 'Hard',
    start_coordinates: { latitude: 10.4851, longitude: 123.7720 },
    end_coordinates: { latitude: 10.4980, longitude: 123.7882 },
    distance_km: 6.2,
    elevation_gain_m: 560,
    estimated_duration_hr: 3.4,
    highlights: 'Forest climb',
    route_color: '#5D4037',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7720, 10.4851],
        [123.7750, 10.4870],
        [123.7790, 10.4910],
        [123.7830, 10.4950],
        [123.7870, 10.4975],
        [123.7882, 10.4980]
      ]
    }
  },
  {
    id: 'mt-manunggal-extreme',
    route_id: 'mt-manunggal-extreme',
    hiking_spot_id: '74',
    hikingSpotId: '74', // Added for consistency with components expecting hikingSpotId
    route_name: 'Mt. Manunggal Extreme',
    difficulty: 'Very Hard',
    start_coordinates: { latitude: 10.4832, longitude: 123.7700 },
    end_coordinates: { latitude: 10.5001, longitude: 123.7905 },
    distance_km: 8.1,
    elevation_gain_m: 720,
    estimated_duration_hr: 4.8,
    highlights: 'Narrow ridge, long',
    route_color: '#424242',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7700, 10.4832],
        [123.7730, 10.4850],
        [123.7770, 10.4880],
        [123.7820, 10.4920],
        [123.7870, 10.4960],
        [123.7900, 10.4990],
        [123.7905, 10.5001]
      ]
    }
  },

  // MOUNT MAGO ROUTES (hiking_spot_id: '75')
  {
    id: 'mago-border-trail',
    route_id: 'mago-border-trail',
    hiking_spot_id: '75',
    hikingSpotId: '75', // Added for consistency with components expecting hikingSpotId
    route_name: 'Mago Border Trail',
    difficulty: 'Easy',
    start_coordinates: { latitude: 10.6311, longitude: 123.9309 },
    end_coordinates: { latitude: 10.6330, longitude: 123.9330 },
    distance_km: 2.3,
    elevation_gain_m: 160,
    estimated_duration_hr: 1.3,
    highlights: 'Tri-boundary marker',
    route_color: '#4CAF50',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9309, 10.6311],
        [123.9315, 10.6318],
        [123.9322, 10.6324],
        [123.9330, 10.6330]
      ]
    }
  },
  {
    id: 'mago-ridge-walk',
    route_id: 'mago-ridge-walk',
    hiking_spot_id: '75',
    hikingSpotId: '75', // Added for consistency with components expecting hikingSpotId
    route_name: 'Mago Ridge Walk',
    difficulty: 'Easy-Moderate',
    start_coordinates: { latitude: 10.6290, longitude: 123.9287 },
    end_coordinates: { latitude: 10.6330, longitude: 123.9330 },
    distance_km: 3.4,
    elevation_gain_m: 250,
    estimated_duration_hr: 1.9,
    highlights: 'Rolling hills and farmland',
    route_color: '#81C784',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9287, 10.6290],
        [123.9300, 10.6305],
        [123.9315, 10.6318],
        [123.9330, 10.6330]
      ]
    }
  },
  {
    id: 'mago-summit-loop',
    route_id: 'mago-summit-loop',
    hiking_spot_id: '75',
    hikingSpotId: '75', // Added for consistency with components expecting hikingSpotId
    route_name: 'Mago Summit Loop',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 10.6269, longitude: 123.9265 },
    end_coordinates: { latitude: 10.6352, longitude: 123.9353 },
    distance_km: 4.9,
    elevation_gain_m: 420,
    estimated_duration_hr: 2.6,
    highlights: '360° summit views',
    route_color: '#FF9800',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9265, 10.6269],
        [123.9285, 10.6290],
        [123.9310, 10.6315],
        [123.9335, 10.6340],
        [123.9353, 10.6352]
      ]
    }
  },
  {
    id: 'mago-long-traverse',
    route_id: 'mago-long-traverse',
    hiking_spot_id: '75',
    hikingSpotId: '75', // Added for consistency with components expecting hikingSpotId
    route_name: 'Mago Long Traverse',
    difficulty: 'Hard',
    start_coordinates: { latitude: 10.6249, longitude: 123.9242 },
    end_coordinates: { latitude: 10.6374, longitude: 123.9375 },
    distance_km: 6.6,
    elevation_gain_m: 580,
    estimated_duration_hr: 3.6,
    highlights: 'Open ridges, rural views',
    route_color: '#F44336',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9242, 10.6249],
        [123.9265, 10.6275],
        [123.9295, 10.6305],
        [123.9330, 10.6340],
        [123.9360, 10.6365],
        [123.9375, 10.6374]
      ]
    }
  },
  {
    id: 'mago-extreme-ridge',
    route_id: 'mago-extreme-ridge',
    hiking_spot_id: '75',
    hikingSpotId: '75', // Added for consistency with components expecting hikingSpotId
    route_name: 'Mago Extreme Ridge',
    difficulty: 'Very Hard',
    start_coordinates: { latitude: 10.6227, longitude: 123.9220 },
    end_coordinates: { latitude: 10.6395, longitude: 123.9398 },
    distance_km: 7.8,
    elevation_gain_m: 730,
    estimated_duration_hr: 4.8,
    highlights: 'Steep grass + clay trails',
    route_color: '#9C27B0',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.9220, 10.6227],
        [123.9245, 10.6255],
        [123.9280, 10.6290],
        [123.9320, 10.6330],
        [123.9360, 10.6365],
        [123.9385, 10.6385],
        [123.9398, 10.6395]
      ]
    }
  },

  // CASINO PEAK ROUTES (hiking_spot_id: '83')
  {
    id: 'casino-easy-path',
    route_id: 'casino-easy-path',
    hiking_spot_id: '83',
    hikingSpotId: '83', // Added for consistency with components expecting hikingSpotId
    route_name: 'Casino Easy Path',
    difficulty: 'Easy',
    start_coordinates: { latitude: 9.8094, longitude: 123.4681 },
    end_coordinates: { latitude: 9.8112, longitude: 123.4702 },
    distance_km: 2.0,
    elevation_gain_m: 160,
    estimated_duration_hr: 1.1,
    highlights: 'Rolling hills, jagged peaks',
    route_color: '#4CAF50',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.4681, 9.8094],
        [123.4688, 9.8100],
        [123.4695, 9.8106],
        [123.4702, 9.8112]
      ]
    }
  },
  {
    id: 'casino-ridge-walk',
    route_id: 'casino-ridge-walk',
    hiking_spot_id: '83',
    hikingSpotId: '83', // Added for consistency with components expecting hikingSpotId
    route_name: 'Casino Ridge Walk',
    difficulty: 'Easy-Moderate',
    start_coordinates: { latitude: 9.8073, longitude: 123.4659 },
    end_coordinates: { latitude: 9.8112, longitude: 123.4702 },
    distance_km: 3.1,
    elevation_gain_m: 230,
    estimated_duration_hr: 1.6,
    highlights: 'Panoramic views',
    route_color: '#81C784',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.4659, 9.8073],
        [123.4670, 9.8083],
        [123.4685, 9.8095],
        [123.4702, 9.8112]
      ]
    }
  },
  {
    id: 'casino-peak-circuit',
    route_id: 'casino-peak-circuit',
    hiking_spot_id: '83',
    hikingSpotId: '83', // Added for consistency with components expecting hikingSpotId
    route_name: 'Casino Peak Circuit',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 9.8052, longitude: 123.4637 },
    end_coordinates: { latitude: 9.8136, longitude: 123.4724 },
    distance_km: 4.7,
    elevation_gain_m: 410,
    estimated_duration_hr: 2.5,
    highlights: 'Sharp limestone hills',
    route_color: '#FF9800',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.4637, 9.8052],
        [123.4660, 9.8075],
        [123.4685, 9.8100],
        [123.4710, 9.8120],
        [123.4724, 9.8136]
      ]
    }
  },
  {
    id: 'casino-osmena-traverse',
    route_id: 'casino-osmena-traverse',
    hiking_spot_id: '83',
    hikingSpotId: '83', // Added for consistency with components expecting hikingSpotId
    route_name: 'Casino to Osmeña Traverse',
    difficulty: 'Hard',
    start_coordinates: { latitude: 9.8031, longitude: 123.4615 },
    end_coordinates: { latitude: 9.8157, longitude: 123.4747 },
    distance_km: 6.3,
    elevation_gain_m: 580,
    estimated_duration_hr: 3.4,
    highlights: 'Connects to Osmeña',
    route_color: '#F44336',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.4615, 9.8031],
        [123.4640, 9.8055],
        [123.4670, 9.8085],
        [123.4705, 9.8120],
        [123.4730, 9.8145],
        [123.4747, 9.8157]
      ]
    }
  },
  {
    id: 'casino-extreme-ridge',
    route_id: 'casino-extreme-ridge',
    hiking_spot_id: '83',
    hikingSpotId: '83', // Added for consistency with components expecting hikingSpotId
    route_name: 'Casino Extreme Ridge',
    difficulty: 'Very Hard',
    start_coordinates: { latitude: 9.8010, longitude: 123.4594 },
    end_coordinates: { latitude: 9.8178, longitude: 123.4769 },
    distance_km: 7.9,
    elevation_gain_m: 750,
    estimated_duration_hr: 4.7,
    highlights: 'Steep rocky cliffs',
    route_color: '#9C27B0',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.4594, 9.8010],
        [123.4620, 9.8040],
        [123.4650, 9.8075],
        [123.4685, 9.8110],
        [123.4720, 9.8145],
        [123.4750, 9.8165],
        [123.4769, 9.8178]
      ]
    }
  },

  // BUDLAAN FALLS ROUTES (hiking_spot_id: '84')
  {
    id: 'budlaan-riverside-path',
    route_id: 'budlaan-riverside-path',
    hiking_spot_id: '84',
    hikingSpotId: '84', // Added for consistency with components expecting hikingSpotId
    route_name: 'Budlaan Riverside Path',
    difficulty: 'Easy',
    start_coordinates: { latitude: 10.3722, longitude: 123.8588 },
    end_coordinates: { latitude: 10.3740, longitude: 123.8610 },
    distance_km: 1.9,
    elevation_gain_m: 130,
    estimated_duration_hr: 1.0,
    highlights: 'River trek, bamboo trees',
    route_color: '#4CAF50',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8588, 10.3722],
        [123.8595, 10.3728],
        [123.8602, 10.3734],
        [123.8610, 10.3740]
      ]
    }
  },
  {
    id: 'budlaan-forest-trail',
    route_id: 'budlaan-forest-trail',
    hiking_spot_id: '84',
    hikingSpotId: '84', // Added for consistency with components expecting hikingSpotId
    route_name: 'Budlaan Forest Trail',
    difficulty: 'Easy-Moderate',
    start_coordinates: { latitude: 10.3701, longitude: 123.8567 },
    end_coordinates: { latitude: 10.3740, longitude: 123.8610 },
    distance_km: 3.0,
    elevation_gain_m: 210,
    estimated_duration_hr: 1.6,
    highlights: 'Forested paths',
    route_color: '#81C784',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8567, 10.3701],
        [123.8580, 10.3715],
        [123.8595, 10.3730],
        [123.8610, 10.3740]
      ]
    }
  },
  {
    id: 'budlaan-falls-loop',
    route_id: 'budlaan-falls-loop',
    hiking_spot_id: '84',
    hikingSpotId: '84', // Added for consistency with components expecting hikingSpotId
    route_name: 'Budlaan Falls Loop',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 10.3679, longitude: 123.8545 },
    end_coordinates: { latitude: 10.3764, longitude: 123.8631 },
    distance_km: 4.5,
    elevation_gain_m: 380,
    estimated_duration_hr: 2.3,
    highlights: 'Waterfall basin',
    route_color: '#FF9800',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8545, 10.3679],
        [123.8570, 10.3700],
        [123.8595, 10.3725],
        [123.8620, 10.3750],
        [123.8631, 10.3764]
      ]
    }
  },
  {
    id: 'budlaan-kabang-traverse',
    route_id: 'budlaan-kabang-traverse',
    hiking_spot_id: '84',
    hikingSpotId: '84', // Added for consistency with components expecting hikingSpotId
    route_name: 'Budlaan to Kabang Traverse',
    difficulty: 'Hard',
    start_coordinates: { latitude: 10.3658, longitude: 123.8523 },
    end_coordinates: { latitude: 10.3785, longitude: 123.8653 },
    distance_km: 6.1,
    elevation_gain_m: 540,
    estimated_duration_hr: 3.2,
    highlights: 'Canyon + river crossing',
    route_color: '#F44336',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8523, 10.3658],
        [123.8550, 10.3685],
        [123.8580, 10.3715],
        [123.8615, 10.3750],
        [123.8640, 10.3770],
        [123.8653, 10.3785]
      ]
    }
  },
  {
    id: 'budlaan-extreme-ascent',
    route_id: 'budlaan-extreme-ascent',
    hiking_spot_id: '84',
    hikingSpotId: '84', // Added for consistency with components expecting hikingSpotId
    route_name: 'Budlaan Extreme Ascent',
    difficulty: 'Very Hard',
    start_coordinates: { latitude: 10.3637, longitude: 123.8501 },
    end_coordinates: { latitude: 10.3807, longitude: 123.8676 },
    distance_km: 7.6,
    elevation_gain_m: 700,
    estimated_duration_hr: 4.5,
    highlights: 'Steep rock scrambling',
    route_color: '#9C27B0',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8501, 10.3637],
        [123.8530, 10.3665],
        [123.8565, 10.3700],
        [123.8600, 10.3735],
        [123.8635, 10.3770],
        [123.8660, 10.3790],
        [123.8676, 10.3807]
      ]
    }
  },

  // SPARTAN TRAIL ROUTES (hiking_spot_id: '85')
  {
    id: 'spartan-beginner-loop',
    route_id: 'spartan-beginner-loop',
    hiking_spot_id: '85',
    hikingSpotId: '85', // Added for consistency with components expecting hikingSpotId
    route_name: 'Spartan Beginner Loop',
    difficulty: 'Easy',
    start_coordinates: { latitude: 10.3482, longitude: 123.8778 },
    end_coordinates: { latitude: 10.3500, longitude: 123.8800 },
    distance_km: 2.4,
    elevation_gain_m: 180,
    estimated_duration_hr: 1.2,
    highlights: 'Grasslands, obstacle markers',
    route_color: '#4CAF50',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8778, 10.3482],
        [123.8785, 10.3488],
        [123.8792, 10.3494],
        [123.8800, 10.3500]
      ]
    }
  },
  {
    id: 'spartan-ridge-path',
    route_id: 'spartan-ridge-path',
    hiking_spot_id: '85',
    hikingSpotId: '85', // Added for consistency with components expecting hikingSpotId
    route_name: 'Spartan Ridge Path',
    difficulty: 'Easy-Moderate',
    start_coordinates: { latitude: 10.3461, longitude: 123.8756 },
    end_coordinates: { latitude: 10.3500, longitude: 123.8800 },
    distance_km: 3.5,
    elevation_gain_m: 260,
    estimated_duration_hr: 1.8,
    highlights: 'Rolling ridge',
    route_color: '#81C784',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8756, 10.3461],
        [123.8770, 10.3475],
        [123.8785, 10.3490],
        [123.8800, 10.3500]
      ]
    }
  },
  {
    id: 'spartan-challenge-circuit',
    route_id: 'spartan-challenge-circuit',
    hiking_spot_id: '85',
    hikingSpotId: '85', // Added for consistency with components expecting hikingSpotId
    route_name: 'Spartan Challenge Circuit',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 10.3440, longitude: 123.8735 },
    end_coordinates: { latitude: 10.3523, longitude: 123.8822 },
    distance_km: 4.9,
    elevation_gain_m: 430,
    estimated_duration_hr: 2.6,
    highlights: 'Mud obstacles, scenic trail',
    route_color: '#FF9800',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8735, 10.3440],
        [123.8755, 10.3465],
        [123.8780, 10.3490],
        [123.8805, 10.3515],
        [123.8822, 10.3523]
      ]
    }
  },
  {
    id: 'spartan-endurance-traverse',
    route_id: 'spartan-endurance-traverse',
    hiking_spot_id: '85',
    hikingSpotId: '85', // Added for consistency with components expecting hikingSpotId
    route_name: 'Spartan Endurance Traverse',
    difficulty: 'Hard',
    start_coordinates: { latitude: 10.3418, longitude: 123.8713 },
    end_coordinates: { latitude: 10.3544, longitude: 123.8843 },
    distance_km: 6.4,
    elevation_gain_m: 590,
    estimated_duration_hr: 3.5,
    highlights: 'Technical terrain, endurance',
    route_color: '#F44336',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8713, 10.3418],
        [123.8740, 10.3445],
        [123.8770, 10.3475],
        [123.8800, 10.3505],
        [123.8825, 10.3530],
        [123.8843, 10.3544]
      ]
    }
  },
  {
    id: 'spartan-extreme-ultra',
    route_id: 'spartan-extreme-ultra',
    hiking_spot_id: '85',
    hikingSpotId: '85', // Added for consistency with components expecting hikingSpotId
    route_name: 'Spartan Extreme Ultra',
    difficulty: 'Very Hard',
    start_coordinates: { latitude: 10.3397, longitude: 123.8692 },
    end_coordinates: { latitude: 10.3566, longitude: 123.8866 },
    distance_km: 7.8,
    elevation_gain_m: 760,
    estimated_duration_hr: 4.9,
    highlights: 'Steep climbs, obstacle walls',
    route_color: '#9C27B0',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8692, 10.3397],
        [123.8720, 10.3425],
        [123.8750, 10.3455],
        [123.8785, 10.3490],
        [123.8820, 10.3525],
        [123.8850, 10.3555],
        [123.8866, 10.3566]
      ]
    }
  },
  {
    id: 'hambubuyog-main-summit',
    route_id: 'hambubuyog-main-summit',
    hiking_spot_id: '85',
    hikingSpotId: '85', // Added for consistency with components expecting hikingSpotId
    route_name: 'Main Summit Trail',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 9.6001, longitude: 123.3204 },
    end_coordinates: { latitude: 9.6072, longitude: 123.3312 },
    distance_km: 4.2,
    elevation_gain_m: 620,
    estimated_duration_hr: 2.5,
    highlights: 'Pine trees, scenic ridges',
    route_color: '#4CAF50',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.3204, 9.6001],
        [123.3220, 9.6015],
        [123.3240, 9.6030],
        [123.3260, 9.6045],
        [123.3280, 9.6060],
        [123.3300, 9.6070],
        [123.3312, 9.6072]
      ]
    }
  },

  // OSMEÑA PEAK ROUTES (hiking_spot_id: '82')
  {
    id: 'osmena-easy-path',
    route_id: 'osmena-easy-path',
    hikingSpotId: '82',
    hiking_spot_id: '82',
    route_name: 'Osmeña Easy Path',
    difficulty: 'Easy',
    start_coordinates: { latitude: 9.8186, longitude: 123.4630 },
    end_coordinates: { latitude: 9.8205, longitude: 123.4652 },
    distance_km: 2.1,
    elevation_gain_m: 170,
    estimated_duration_hr: 1.2,
    highlights: 'Jagged hills, panoramic views',
    route_color: '#4CAF50',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.4630, 9.8186],
        [123.4635, 9.8190],
        [123.4640, 9.8195],
        [123.4645, 9.8200],
        [123.4650, 9.8203],
        [123.4652, 9.8205]
      ]
    }
  },
  {
    id: 'osmena-ridge-walk',
    route_id: 'osmena-ridge-walk',
    hikingSpotId: '82',
    hiking_spot_id: '82',
    route_name: 'Osmeña Ridge Walk',
    difficulty: 'Easy-Moderate',
    start_coordinates: { latitude: 9.8167, longitude: 123.4608 },
    end_coordinates: { latitude: 9.8205, longitude: 123.4652 },
    distance_km: 3.4,
    elevation_gain_m: 250,
    estimated_duration_hr: 1.8,
    highlights: 'Ridge trail, limestone peaks',
    route_color: '#FF9800',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.4608, 9.8167],
        [123.4615, 9.8175],
        [123.4625, 9.8185],
        [123.4635, 9.8195],
        [123.4645, 9.8200],
        [123.4652, 9.8205]
      ]
    }
  },
  {
    id: 'osmena-peak-circuit',
    route_id: 'osmena-peak-circuit',
    hikingSpotId: '82',
    hiking_spot_id: '82',
    route_name: 'Osmeña Peak Circuit',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 9.8148, longitude: 123.4586 },
    end_coordinates: { latitude: 9.8227, longitude: 123.4674 },
    distance_km: 4.9,
    elevation_gain_m: 430,
    estimated_duration_hr: 2.5,
    highlights: 'Full ridge loop, 360° views',
    route_color: '#2196F3',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.4586, 9.8148],
        [123.4600, 9.8160],
        [123.4620, 9.8180],
        [123.4640, 9.8200],
        [123.4660, 9.8220],
        [123.4674, 9.8227]
      ]
    }
  },
  {
    id: 'osmena-casino-traverse',
    route_id: 'osmena-casino-traverse',
    hikingSpotId: '82',
    hiking_spot_id: '82',
    route_name: 'Osmeña to Casino Traverse',
    difficulty: 'Hard',
    start_coordinates: { latitude: 9.8129, longitude: 123.4565 },
    end_coordinates: { latitude: 9.8248, longitude: 123.4696 },
    distance_km: 6.6,
    elevation_gain_m: 590,
    estimated_duration_hr: 3.6,
    highlights: 'Connection to Casino Peak',
    route_color: '#F44336',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.4565, 9.8129],
        [123.4580, 9.8145],
        [123.4600, 9.8165],
        [123.4625, 9.8190],
        [123.4650, 9.8215],
        [123.4675, 9.8235],
        [123.4696, 9.8248]
      ]
    }
  },
  {
    id: 'lantoy-forest-path',
    route_id: 'lantoy-forest-path',
    hikingSpotId: '77',
    hiking_spot_id: '77',
    route_name: 'Lantoy Forest Path',
    difficulty: 'Easy',
    start_coordinates: { latitude: 9.8770, longitude: 123.6051 },
    end_coordinates: { latitude: 9.8790, longitude: 123.6070 },
    distance_km: 2.3,
    elevation_gain_m: 190,
    estimated_duration_hr: 1.3,
    highlights: 'Forest trek, local flora',
    route_color: '#4CAF50',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.6051, 9.8770],
        [123.6055, 9.8773],
        [123.6060, 9.8777],
        [123.6065, 9.8782],
        [123.6070, 9.8790]
      ]
    }
  },
  {
    id: 'lantoy-ridge-walk',
    route_id: 'lantoy-ridge-walk',
    hikingSpotId: '77',
    hiking_spot_id: '77',
    route_name: 'Lantoy Ridge Walk',
    difficulty: 'Easy-Moderate',
    start_coordinates: { latitude: 9.8750, longitude: 123.6032 },
    end_coordinates: { latitude: 9.8790, longitude: 123.6070 },
    distance_km: 3.5,
    elevation_gain_m: 280,
    estimated_duration_hr: 1.9,
    highlights: 'Rolling ridge, farmland',
    route_color: '#FF9800',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.6032, 9.8750],
        [123.6040, 9.8755],
        [123.6048, 9.8762],
        [123.6055, 9.8770],
        [123.6062, 9.8778],
        [123.6070, 9.8790]
      ]
    }
  },
  {
    id: 'lantoy-summit-loop',
    route_id: 'lantoy-summit-loop',
    hikingSpotId: '77',
    hiking_spot_id: '77',
    route_name: 'Lantoy Summit Loop',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 9.8730, longitude: 123.6013 },
    end_coordinates: { latitude: 9.8810, longitude: 123.6090 },
    distance_km: 4.8,
    elevation_gain_m: 440,
    estimated_duration_hr: 2.6,
    highlights: 'Summit views, ridge line',
    route_color: '#2196F3',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.6013, 9.8730],
        [123.6025, 9.8740],
        [123.6040, 9.8755],
        [123.6055, 9.8770],
        [123.6070, 9.8785],
        [123.6080, 9.8795],
        [123.6090, 9.8810]
      ]
    }
  },
  {
    id: 'lanaya-direct-ascent',
    route_id: 'lanaya-direct-ascent',
    hikingSpotId: '80',
    hiking_spot_id: '80',
    route_name: 'Lanaya Direct Ascent',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 9.6451, longitude: 123.3662 },
    end_coordinates: { latitude: 9.6470, longitude: 123.3680 },
    distance_km: 2.5,
    elevation_gain_m: 320,
    estimated_duration_hr: 1.5,
    highlights: 'Steep forest climb',
    route_color: '#2196F3',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.3662, 9.6451],
        [123.3665, 9.6455],
        [123.3670, 9.6460],
        [123.3675, 9.6465],
        [123.3680, 9.6470]
      ]
    }
  },
  {
    id: 'lanaya-ridge-trail',
    route_id: 'lanaya-ridge-trail',
    hikingSpotId: '80',
    hiking_spot_id: '80',
    route_name: 'Lanaya Ridge Trail',
    difficulty: 'Hard',
    start_coordinates: { latitude: 9.6432, longitude: 123.3644 },
    end_coordinates: { latitude: 9.6470, longitude: 123.3680 },
    distance_km: 3.7,
    elevation_gain_m: 500,
    estimated_duration_hr: 2.2,
    highlights: 'Ridge line, coastal views',
    route_color: '#F44336',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.3644, 9.6432],
        [123.3650, 9.6438],
        [123.3655, 9.6445],
        [123.3662, 9.6452],
        [123.3670, 9.6460],
        [123.3675, 9.6465],
        [123.3680, 9.6470]
      ]
    }
  },
  {
    id: 'lanaya-summit-traverse',
    route_id: 'lanaya-summit-traverse',
    hikingSpotId: '80',
    hiking_spot_id: '80',
    route_name: 'Lanaya Summit Traverse',
    difficulty: 'Very Hard',
    start_coordinates: { latitude: 9.6413, longitude: 123.3626 },
    end_coordinates: { latitude: 9.6489, longitude: 123.3698 },
    distance_km: 6.1,
    elevation_gain_m: 730,
    estimated_duration_hr: 3.6,
    highlights: 'Summit views, ocean cliffs',
    route_color: '#9C27B0',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.3626, 9.6413],
        [123.3635, 9.6425],
        [123.3645, 9.6440],
        [123.3655, 9.6455],
        [123.3665, 9.6470],
        [123.3675, 9.6480],
        [123.3685, 9.6485],
        [123.3698, 9.6489]
      ]
    }
  },

  // Additional MOUNT NAUPA ROUTES (hiking_spot_id: '73') - Matching database specifications
  {
    id: 'naupa-forest-path',
    route_id: 'naupa-forest-path',
    hiking_spot_id: '73',
    hikingSpotId: '73',
    route_name: 'Naupa Forest Path',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 10.2558, longitude: 123.7564 },
    end_coordinates: { latitude: 10.2580, longitude: 123.7590 },
    distance_km: 4.5,
    elevation_gain_m: 340,
    estimated_duration_hr: 2.5,
    highlights: 'Moderate climb through secondary forest, diverse bird species, natural springs along the trail, shaded canopy walk',
    route_color: '#FF9800',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7564, 10.2558],
        [123.7570, 10.2562],
        [123.7575, 10.2567],
        [123.7580, 10.2572],
        [123.7585, 10.2577],
        [123.7590, 10.2580]
      ]
    }
  },
  {
    id: 'naupa-summit-route',
    route_id: 'naupa-summit-route',
    hiking_spot_id: '73',
    hikingSpotId: '73',
    route_name: 'Naupa Summit Route',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 10.2565, longitude: 123.7570 },
    end_coordinates: { latitude: 10.2590, longitude: 123.7600 },
    distance_km: 5.2,
    elevation_gain_m: 380,
    estimated_duration_hr: 3.0,
    highlights: 'Traditional summit approach, mixed terrain with river crossings, panoramic views of Naga City and surrounding valleys',
    route_color: '#2196F3',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7570, 10.2565],
        [123.7575, 10.2570],
        [123.7580, 10.2575],
        [123.7585, 10.2580],
        [123.7590, 10.2585],
        [123.7595, 10.2588],
        [123.7600, 10.2590]
      ]
    }
  },
  {
    id: 'naupa-wilderness-trek',
    route_id: 'naupa-wilderness-trek',
    hiking_spot_id: '73',
    hikingSpotId: '73',
    route_name: 'Naupa Wilderness Trek',
    difficulty: 'Hard',
    start_coordinates: { latitude: 10.2545, longitude: 123.7552 },
    end_coordinates: { latitude: 10.2595, longitude: 123.7610 },
    distance_km: 6.8,
    elevation_gain_m: 480,
    estimated_duration_hr: 4.0,
    highlights: 'Challenging wilderness route, dense forest sections, wildlife spotting opportunities, steep rocky ascents',
    route_color: '#F44336',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7552, 10.2545],
        [123.7560, 10.2555],
        [123.7570, 10.2565],
        [123.7580, 10.2575],
        [123.7590, 10.2585],
        [123.7600, 10.2592],
        [123.7610, 10.2595]
      ]
    }
  },
  {
    id: 'naupa-technical-ascent',
    route_id: 'naupa-technical-ascent',
    hiking_spot_id: '73',
    hikingSpotId: '73',
    route_name: 'Naupa Technical Ascent',
    difficulty: 'Very Hard',
    start_coordinates: { latitude: 10.2540, longitude: 123.7545 },
    end_coordinates: { latitude: 10.2600, longitude: 123.7615 },
    distance_km: 8.0,
    elevation_gain_m: 600,
    estimated_duration_hr: 5.0,
    highlights: 'Expert-level technical climbing, rope work required, pristine old-growth forest, spectacular summit views',
    route_color: '#9C27B0',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.7545, 10.2540],
        [123.7555, 10.2550],
        [123.7565, 10.2560],
        [123.7575, 10.2570],
        [123.7585, 10.2580],
        [123.7595, 10.2590],
        [123.7605, 10.2598],
        [123.7615, 10.2600]
      ]
    }
  },
  {
    id: 'mauyog-easy-trail',
    route_id: 'mauyog-easy-trail',
    hikingSpotId: '79',
    hiking_spot_id: '79',
    route_name: 'Mauyog Easy Trail',
    difficulty: 'Easy',
    start_coordinates: { latitude: 10.4310, longitude: 123.8541 },
    end_coordinates: { latitude: 10.4330, longitude: 123.8560 },
    distance_km: 2.0,
    elevation_gain_m: 200,
    estimated_duration_hr: 1.2,
    highlights: 'Forested climb',
    route_color: '#4CAF50',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8541, 10.4310],
        [123.8545, 10.4315],
        [123.8550, 10.4320],
        [123.8555, 10.4325],
        [123.8560, 10.4330]
      ]
    }
  },
  {
    id: 'mauyog-rock-path',
    route_id: 'mauyog-rock-path',
    hikingSpotId: '79',
    hiking_spot_id: '79',
    route_name: 'Mauyog Rock Path',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 10.4290, longitude: 123.8522 },
    end_coordinates: { latitude: 10.4330, longitude: 123.8560 },
    distance_km: 3.2,
    elevation_gain_m: 320,
    estimated_duration_hr: 1.8,
    highlights: 'Rock formations, ridges',
    route_color: '#2196F3',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8522, 10.4290],
        [123.8530, 10.4300],
        [123.8540, 10.4310],
        [123.8545, 10.4315],
        [123.8550, 10.4320],
        [123.8555, 10.4325],
        [123.8560, 10.4330]
      ]
    }
  },
  {
    id: 'mauyog-manunggal-traverse',
    route_id: 'mauyog-manunggal-traverse',
    hikingSpotId: '79',
    hiking_spot_id: '79',
    route_name: 'Mauyog to Manunggal Traverse',
    difficulty: 'Hard',
    start_coordinates: { latitude: 10.4270, longitude: 123.8503 },
    end_coordinates: { latitude: 10.4350, longitude: 123.8579 },
    distance_km: 5.5,
    elevation_gain_m: 600,
    estimated_duration_hr: 3.0,
    highlights: 'Summit traverse, linked to Mt Manunggal',
    route_color: '#F44336',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8503, 10.4270],
        [123.8515, 10.4285],
        [123.8525, 10.4300],
        [123.8535, 10.4315],
        [123.8545, 10.4325],
        [123.8555, 10.4335],
        [123.8565, 10.4345],
        [123.8579, 10.4350]
      ]
    }
  },
  {
    id: 'kapayas-forest-path',
    route_id: 'kapayas-forest-path',
    hikingSpotId: '76',
    hiking_spot_id: '76',
    route_name: 'Kapayas Forest Path',
    difficulty: 'Easy',
    start_coordinates: { latitude: 10.7441, longitude: 124.0045 },
    end_coordinates: { latitude: 10.7470, longitude: 124.0070 },
    distance_km: 2.3,
    elevation_gain_m: 170,
    estimated_duration_hr: 1.3,
    highlights: 'Dense forest',
    route_color: '#4CAF50',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [124.0045, 10.7441],
        [124.0050, 10.7445],
        [124.0055, 10.7450],
        [124.0060, 10.7460],
        [124.0065, 10.7465],
        [124.0070, 10.7470]
      ]
    }
  },
  {
    id: 'kapayas-ridge-walk',
    route_id: 'kapayas-ridge-walk',
    hikingSpotId: '76',
    hiking_spot_id: '76',
    route_name: 'Kapayas Ridge Walk',
    difficulty: 'Easy-Moderate',
    start_coordinates: { latitude: 10.7420, longitude: 124.0021 },
    end_coordinates: { latitude: 10.7470, longitude: 124.0070 },
    distance_km: 3.4,
    elevation_gain_m: 260,
    estimated_duration_hr: 1.9,
    highlights: 'Ridge walk, panoramic views',
    route_color: '#FF9800',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [124.0021, 10.7420],
        [124.0030, 10.7430],
        [124.0040, 10.7440],
        [124.0050, 10.7450],
        [124.0060, 10.7460],
        [124.0070, 10.7470]
      ]
    }
  },
  {
    id: 'kapayas-summit-circuit',
    route_id: 'kapayas-summit-circuit',
    hikingSpotId: '76',
    hiking_spot_id: '76',
    route_name: 'Kapayas Summit Circuit',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 10.7400, longitude: 124.0000 },
    end_coordinates: { latitude: 10.7490, longitude: 124.0090 },
    distance_km: 4.9,
    elevation_gain_m: 450,
    estimated_duration_hr: 2.6,
    highlights: 'Summit view, limestone ridges',
    route_color: '#2196F3',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [124.0000, 10.7400],
        [124.0015, 10.7415],
        [124.0030, 10.7430],
        [124.0045, 10.7445],
        [124.0060, 10.7460],
        [124.0075, 10.7475],
        [124.0090, 10.7490]
      ]
    }
  },
  // Mount Hambubuyog (ID 81) Trail Routes
  {
    id: 'hambubuyog-forest-trail',
    route_id: 'hambubuyog-forest-trail',
    hikingSpotId: '81',
    hiking_spot_id: '81',
    route_name: 'Hambubuyog Forest Trail',
    difficulty: 'Easy',
    start_coordinates: { latitude: 10.2547, longitude: 123.8325 },
    end_coordinates: { latitude: 10.2567, longitude: 123.8345 },
    distance_km: 2.1,
    elevation_gain_m: 180,
    estimated_duration_hr: 1.2,
    highlights: 'Dense forest, wildlife spotting',
    route_color: '#4CAF50',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8325, 10.2547],
        [123.8330, 10.2550],
        [123.8335, 10.2555],
        [123.8340, 10.2560],
        [123.8345, 10.2567]
      ]
    }
  },
  {
    id: 'hambubuyog-ridge-path',
    route_id: 'hambubuyog-ridge-path',
    hikingSpotId: '81',
    hiking_spot_id: '81',
    route_name: 'Hambubuyog Ridge Path',
    difficulty: 'Easy-Moderate',
    start_coordinates: { latitude: 10.2527, longitude: 123.8305 },
    end_coordinates: { latitude: 10.2567, longitude: 123.8345 },
    distance_km: 3.2,
    elevation_gain_m: 250,
    estimated_duration_hr: 1.8,
    highlights: 'Ridge walking, panoramic views',
    route_color: '#FF9800',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8305, 10.2527],
        [123.8315, 10.2535],
        [123.8325, 10.2545],
        [123.8335, 10.2555],
        [123.8345, 10.2567]
      ]
    }
  },
  {
    id: 'hambubuyog-summit-loop',
    route_id: 'hambubuyog-summit-loop',
    hikingSpotId: '81',
    hiking_spot_id: '81',
    route_name: 'Hambubuyog Summit Loop',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 10.2507, longitude: 123.8285 },
    end_coordinates: { latitude: 10.2587, longitude: 123.8365 },
    distance_km: 4.8,
    elevation_gain_m: 420,
    estimated_duration_hr: 2.5,
    highlights: 'Summit views, circular route',
    route_color: '#2196F3',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8285, 10.2507],
        [123.8300, 10.2520],
        [123.8320, 10.2540],
        [123.8340, 10.2560],
        [123.8355, 10.2575],
        [123.8365, 10.2587]
      ]
    }
  },
  {
    id: 'hambubuyog-nature-traverse',
    route_id: 'hambubuyog-nature-traverse',
    hikingSpotId: '81',
    hiking_spot_id: '81',
    route_name: 'Hambubuyog Nature Traverse',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 10.2487, longitude: 123.8265 },
    end_coordinates: { latitude: 10.2607, longitude: 123.8385 },
    distance_km: 5.5,
    elevation_gain_m: 480,
    estimated_duration_hr: 3.0,
    highlights: 'Biodiversity hotspot, nature education',
    route_color: '#8BC34A',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8265, 10.2487],
        [123.8280, 10.2500],
        [123.8300, 10.2520],
        [123.8325, 10.2545],
        [123.8350, 10.2570],
        [123.8370, 10.2590],
        [123.8385, 10.2607]
      ]
    }
  },
  {
    id: 'hambubuyog-challenging-ascent',
    route_id: 'hambubuyog-challenging-ascent',
    hikingSpotId: '81',
    hiking_spot_id: '81',
    route_name: 'Hambubuyog Challenging Ascent',
    difficulty: 'Hard',
    start_coordinates: { latitude: 10.2467, longitude: 123.8245 },
    end_coordinates: { latitude: 10.2627, longitude: 123.8405 },
    distance_km: 6.8,
    elevation_gain_m: 580,
    estimated_duration_hr: 3.8,
    highlights: 'Steep terrain, advanced hiking',
    route_color: '#F44336',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8245, 10.2467],
        [123.8260, 10.2480],
        [123.8280, 10.2500],
        [123.8305, 10.2525],
        [123.8330, 10.2550],
        [123.8355, 10.2575],
        [123.8380, 10.2600],
        [123.8405, 10.2627]
      ]
    }
  }
];

// Helper function to get routes by hiking spot ID
export function getRoutesByHikingSpotId(hikingSpotId: string): TrailRoute[] {
  console.log('Inspecting object in getRoutesByHikingSpotId:', NEW_TRAIL_ROUTES[0]);
  console.log('Looking for hikingSpotId:', hikingSpotId);
  return NEW_TRAIL_ROUTES.filter(route => {
    console.log('Inspecting route object:', route);
    // Check both possible property names for compatibility using optional chaining
    const routeHikingSpotId = route?.hiking_spot_id || route?.hikingSpotId;
    return routeHikingSpotId === hikingSpotId;
  });
}

// Helper function to get route by ID
export function getRouteById(routeId: string): TrailRoute | undefined {
  return NEW_TRAIL_ROUTES.find(route => route.id === routeId);
}

export default NEW_TRAIL_ROUTES;