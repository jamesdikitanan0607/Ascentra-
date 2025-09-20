// Trail Routes Data for the 5 New Mountains
// This file contains detailed trail route information for Mount Babag, Mount Kan-irag/Sirao Peak, 
// Mount Naupa, Mount Manunggal, and Mount Mago

export interface TrailRoute {
  id: string;
  hiking_spot_id: string;
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
  // MOUNT BABAG ROUTES (hiking_spot_id: '1')
  {
    id: 'babag-eco-trail',
    hiking_spot_id: '1',
    route_name: 'Babag Eco Trail',
    difficulty: 'Easy',
    start_coordinates: { latitude: 10.3600, longitude: 123.8830 },
    end_coordinates: { latitude: 10.3613, longitude: 123.8860 },
    distance_km: 2.5,
    elevation_gain_m: 150,
    estimated_duration_hr: 1.5,
    highlights: 'Forest path, shaded',
    route_color: '#4CAF50',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8830, 10.3600],
        [123.8840, 10.3605],
        [123.8850, 10.3610],
        [123.8860, 10.3613]
      ]
    }
  },
  {
    id: 'babag-ridge-walk',
    hiking_spot_id: '1',
    route_name: 'Babag Ridge Walk',
    difficulty: 'Easy-Moderate',
    start_coordinates: { latitude: 10.3582, longitude: 123.8805 },
    end_coordinates: { latitude: 10.3613, longitude: 123.8860 },
    distance_km: 3.2,
    elevation_gain_m: 210,
    estimated_duration_hr: 2.0,
    highlights: 'Scenic ridge',
    route_color: '#81C784',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8805, 10.3582],
        [123.8820, 10.3590],
        [123.8840, 10.3600],
        [123.8860, 10.3613]
      ]
    }
  },
  {
    id: 'babag-spur-loop',
    hiking_spot_id: '1',
    route_name: 'Babag Spur Loop',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 10.3628, longitude: 123.8842 },
    end_coordinates: { latitude: 10.3665, longitude: 123.8887 },
    distance_km: 4.5,
    elevation_gain_m: 350,
    estimated_duration_hr: 2.5,
    highlights: 'Mixed terrain',
    route_color: '#FF9800',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8842, 10.3628],
        [123.8855, 10.3640],
        [123.8870, 10.3655],
        [123.8887, 10.3665]
      ]
    }
  },
  {
    id: 'babag-peak-traverse',
    hiking_spot_id: '1',
    route_name: 'Babag Peak Traverse',
    difficulty: 'Hard',
    start_coordinates: { latitude: 10.3559, longitude: 123.8790 },
    end_coordinates: { latitude: 10.3689, longitude: 123.8890 },
    distance_km: 6.0,
    elevation_gain_m: 520,
    estimated_duration_hr: 3.5,
    highlights: 'Steep sections',
    route_color: '#F44336',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8790, 10.3559],
        [123.8820, 10.3580],
        [123.8850, 10.3620],
        [123.8880, 10.3660],
        [123.8890, 10.3689]
      ]
    }
  },
  {
    id: 'babag-extreme-ridge',
    hiking_spot_id: '1',
    route_name: 'Babag Extreme Ridge',
    difficulty: 'Very Hard',
    start_coordinates: { latitude: 10.3530, longitude: 123.8782 },
    end_coordinates: { latitude: 10.3721, longitude: 123.8910 },
    distance_km: 7.8,
    elevation_gain_m: 670,
    estimated_duration_hr: 4.5,
    highlights: 'Knife-edge ridge',
    route_color: '#9C27B0',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8782, 10.3530],
        [123.8810, 10.3560],
        [123.8840, 10.3600],
        [123.8870, 10.3650],
        [123.8900, 10.3700],
        [123.8910, 10.3721]
      ]
    }
  },

  // MOUNT KAN-IRAG / SIRAO PEAK ROUTES (hiking_spot_id: '2')
  {
    id: 'sirao-garden-trail',
    hiking_spot_id: '2',
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
    hiking_spot_id: '2',
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
    hiking_spot_id: '2',
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
    hiking_spot_id: '2',
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
    hiking_spot_id: '2',
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

  // MOUNT NAUPA ROUTES (hiking_spot_id: '3')
  {
    id: 'naupa-eco-trail',
    hiking_spot_id: '3',
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
    hiking_spot_id: '3',
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
    hiking_spot_id: '3',
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
    hiking_spot_id: '3',
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
    hiking_spot_id: '3',
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

  // MOUNT MANUNGGAL ROUTES (hiking_spot_id: '4')
  {
    id: 'manunggal-heritage-trail',
    hiking_spot_id: '4',
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
    hiking_spot_id: '4',
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
    hiking_spot_id: '4',
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
    hiking_spot_id: '4',
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
    hiking_spot_id: '4',
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

  // MOUNT MAGO ROUTES (hiking_spot_id: '5')
  {
    id: 'mago-meadow-trail',
    hiking_spot_id: '5',
    route_name: 'Mago Meadow Trail',
    difficulty: 'Easy',
    start_coordinates: { latitude: 10.7081, longitude: 123.8972 },
    end_coordinates: { latitude: 10.7100, longitude: 123.9000 },
    distance_km: 2.0,
    elevation_gain_m: 140,
    estimated_duration_hr: 1.0,
    highlights: 'Meadows',
    route_color: '#66BB6A',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8972, 10.7081],
        [123.8980, 10.7085],
        [123.8990, 10.7092],
        [123.9000, 10.7100]
      ]
    }
  },
  {
    id: 'mago-farm-ridge',
    hiking_spot_id: '5',
    route_name: 'Mago Farm Ridge',
    difficulty: 'Easy-Moderate',
    start_coordinates: { latitude: 10.7060, longitude: 123.8950 },
    end_coordinates: { latitude: 10.7100, longitude: 123.9000 },
    distance_km: 2.9,
    elevation_gain_m: 200,
    estimated_duration_hr: 1.5,
    highlights: 'Rolling farms',
    route_color: '#FFA726',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8950, 10.7060],
        [123.8965, 10.7070],
        [123.8980, 10.7085],
        [123.9000, 10.7100]
      ]
    }
  },
  {
    id: 'mago-hill-loop',
    hiking_spot_id: '5',
    route_name: 'Mago Hill Loop',
    difficulty: 'Moderate',
    start_coordinates: { latitude: 10.7040, longitude: 123.8931 },
    end_coordinates: { latitude: 10.7125, longitude: 123.9022 },
    distance_km: 4.6,
    elevation_gain_m: 360,
    estimated_duration_hr: 2.4,
    highlights: 'Summit views',
    route_color: '#26A69A',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8931, 10.7040],
        [123.8950, 10.7060],
        [123.8980, 10.7090],
        [123.9010, 10.7115],
        [123.9022, 10.7125]
      ]
    }
  },
  {
    id: 'mago-traverse-ridge',
    hiking_spot_id: '5',
    route_name: 'Mago Traverse Ridge',
    difficulty: 'Hard',
    start_coordinates: { latitude: 10.7015, longitude: 123.8910 },
    end_coordinates: { latitude: 10.7141, longitude: 123.9050 },
    distance_km: 6.1,
    elevation_gain_m: 500,
    estimated_duration_hr: 3.3,
    highlights: 'Long ridge',
    route_color: '#AB47BC',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8910, 10.7015],
        [123.8930, 10.7040],
        [123.8960, 10.7070],
        [123.9000, 10.7110],
        [123.9030, 10.7135],
        [123.9050, 10.7141]
      ]
    }
  },
  {
    id: 'mago-extreme-climb',
    hiking_spot_id: '5',
    route_name: 'Mago Extreme Climb',
    difficulty: 'Very Hard',
    start_coordinates: { latitude: 10.6992, longitude: 123.8889 },
    end_coordinates: { latitude: 10.7162, longitude: 123.9080 },
    distance_km: 7.8,
    elevation_gain_m: 680,
    estimated_duration_hr: 4.5,
    highlights: 'Continuous climb',
    route_color: '#D32F2F',
    geojson_path: {
      type: 'LineString',
      coordinates: [
        [123.8889, 10.6992],
        [123.8910, 10.7015],
        [123.8940, 10.7050],
        [123.8980, 10.7090],
        [123.9020, 10.7130],
        [123.9050, 10.7155],
        [123.9080, 10.7162]
      ]
    }
  },
  {
    id: 'hambubuyog-main-summit',
    hiking_spot_id: '16',
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
  }
];

// Helper function to get routes by hiking spot ID
export function getRoutesByHikingSpotId(hikingSpotId: string): TrailRoute[] {
  return NEW_TRAIL_ROUTES.filter(route => route.hiking_spot_id === hikingSpotId);
}

// Helper function to get route by ID
export function getRouteById(routeId: string): TrailRoute | undefined {
  return NEW_TRAIL_ROUTES.find(route => route.id === routeId);
}

export default NEW_TRAIL_ROUTES;