// Enhanced Trail Routes Data for Better Map Visualization
// This file contains detailed trail route information with enhanced geojson paths,
// waypoints, elevation profiles, and metadata for improved map rendering

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
  // Enhanced fields for better visualization
  waypoints?: {
    latitude: number;
    longitude: number;
    name: string;
    description: string;
    elevation_m: number;
  }[];
  elevation_profile?: {
    latitude: number;
    longitude: number;
    elevation_m: number;
    distance_from_start_km: number;
  }[];
  enhanced_metadata?: {
    total_coordinate_points: number;
    path_smoothness: 'smooth' | 'moderate' | 'rough';
    terrain_type: 'forest' | 'ridge' | 'rocky' | 'mixed';
    scenic_rating: number; // 1-5 scale
    technical_difficulty: number; // 1-5 scale
  };
}

export const NEW_TRAIL_ROUTES: TrailRoute[] = [
  {
    "id": "babag-antenna-trail",
    "route_id": "babag-antenna-trail",
    "hikingSpotId": "71",
    "hiking_spot_id": "71",
    "route_name": "Babag Antenna Trail",
    "difficulty": "Easy",
    "start_coordinates": {
      "latitude": 10.3451,
      "longitude": 123.8863
    },
    "end_coordinates": {
      "latitude": 10.347,
      "longitude": 123.8885
    },
    "distance_km": 2.2,
    "elevation_gain_m": 170,
    "estimated_duration_hr": 1.2,
    "highlights": "Radio towers, city skyline views",
    "route_color": "#4CAF50",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8863,
          10.3451
        ],
        [
          123.88680552331067,
          10.345543722472062
        ],
        [
          123.8874,
          10.34605
        ],
        [
          123.8878572366233,
          10.346558005122738
        ],
        [
          123.8885,
          10.347
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.34605,
        "longitude": 123.8874,
        "name": "Waypoint 1",
        "description": "Radio towers",
        "elevation_m": 190
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.3451,
        "longitude": 123.8863,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.345543722472062,
        "longitude": 123.88680552331067,
        "elevation_m": 143,
        "distance_from_start_km": 0.125
      },
      {
        "latitude": 10.34605,
        "longitude": 123.8874,
        "elevation_m": 185,
        "distance_from_start_km": 0.25
      },
      {
        "latitude": 10.346558005122738,
        "longitude": 123.8878572366233,
        "elevation_m": 228,
        "distance_from_start_km": 0.375
      },
      {
        "latitude": 10.347,
        "longitude": 123.8885,
        "elevation_m": 270,
        "distance_from_start_km": 0.5
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 5,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 4,
      "technical_difficulty": 1
    }
  },
  {
    "id": "babag-ridge-path",
    "route_id": "babag-ridge-path",
    "hiking_spot_id": "71",
    "hikingSpotId": "71",
    "route_name": "Babag Ridge Path",
    "difficulty": "Easy-Moderate",
    "start_coordinates": {
      "latitude": 10.3432,
      "longitude": 123.884
    },
    "end_coordinates": {
      "latitude": 10.347,
      "longitude": 123.8885
    },
    "distance_km": 3.3,
    "elevation_gain_m": 250,
    "estimated_duration_hr": 1.8,
    "highlights": "Rolling ridge, forest",
    "route_color": "#81C784",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.884,
          10.3432
        ],
        [
          123.88463102712606,
          10.343649533671712
        ],
        [
          123.88533365732047,
          10.344377161952846
        ],
        [
          123.88596697245667,
          10.344871204750502
        ],
        [
          123.88655317859205,
          10.34541925156604
        ],
        [
          123.8873236693395,
          10.345954031443796
        ],
        [
          123.88794409216474,
          10.346428112899574
        ],
        [
          123.8885,
          10.347
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.344377161952846,
        "longitude": 123.88533365732047,
        "name": "Waypoint 1",
        "description": "Rolling ridge",
        "elevation_m": 162
      },
      {
        "latitude": 10.345954031443796,
        "longitude": 123.8873236693395,
        "name": "Waypoint 2",
        "description": " forest",
        "elevation_m": 163
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.3432,
        "longitude": 123.884,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.343649533671712,
        "longitude": 123.88463102712606,
        "elevation_m": 160,
        "distance_from_start_km": 0.11428571428571428
      },
      {
        "latitude": 10.344377161952846,
        "longitude": 123.88533365732047,
        "elevation_m": 161,
        "distance_from_start_km": 0.22857142857142856
      },
      {
        "latitude": 10.344871204750502,
        "longitude": 123.88596697245667,
        "elevation_m": 188,
        "distance_from_start_km": 0.34285714285714286
      },
      {
        "latitude": 10.34541925156604,
        "longitude": 123.88655317859205,
        "elevation_m": 262,
        "distance_from_start_km": 0.45714285714285713
      },
      {
        "latitude": 10.345954031443796,
        "longitude": 123.8873236693395,
        "elevation_m": 289,
        "distance_from_start_km": 0.5714285714285715
      },
      {
        "latitude": 10.346428112899574,
        "longitude": 123.88794409216474,
        "elevation_m": 290,
        "distance_from_start_km": 0.6857142857142857
      },
      {
        "latitude": 10.347,
        "longitude": 123.8885,
        "elevation_m": 350,
        "distance_from_start_km": 0.8
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 8,
      "path_smoothness": "smooth",
      "terrain_type": "forest",
      "scenic_rating": 3,
      "technical_difficulty": 2
    }
  },
  {
    "id": "babag-loop-circuit",
    "route_id": "babag-loop-circuit",
    "hiking_spot_id": "71",
    "hikingSpotId": "71",
    "route_name": "Babag Loop Circuit",
    "difficulty": "Moderate",
    "start_coordinates": {
      "latitude": 10.341,
      "longitude": 123.8818
    },
    "end_coordinates": {
      "latitude": 10.3493,
      "longitude": 123.8908
    },
    "distance_km": 4.8,
    "elevation_gain_m": 420,
    "estimated_duration_hr": 2.6,
    "highlights": "Ridge + ocean views",
    "route_color": "#FF9800",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8818,
          10.341
        ],
        [
          123.88255801499504,
          10.341660900210579
        ],
        [
          123.88324034334153,
          10.34213899188614
        ],
        [
          123.88401000681418,
          10.342906235209307
        ],
        [
          123.88452135102702,
          10.343611313385207
        ],
        [
          123.88536312134434,
          10.34428046341798
        ],
        [
          123.8859591351762,
          10.344786977515652
        ],
        [
          123.88664798253198,
          10.345422920137034
        ],
        [
          123.88726520222416,
          10.34609512974604
        ],
        [
          123.888078943964,
          10.346806851837396
        ],
        [
          123.88865115708983,
          10.347571396231574
        ],
        [
          123.8895605819309,
          10.348059757846187
        ],
        [
          123.89002723591987,
          10.34858346150793
        ],
        [
          123.8908,
          10.3493
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.342906235209307,
        "longitude": 123.88401000681418,
        "name": "Waypoint 1",
        "description": "Ridge + ocean views",
        "elevation_m": 106
      },
      {
        "latitude": 10.345422920137034,
        "longitude": 123.88664798253198,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 167
      },
      {
        "latitude": 10.347571396231574,
        "longitude": 123.88865115708983,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 170
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.341,
        "longitude": 123.8818,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.341660900210579,
        "longitude": 123.88255801499504,
        "elevation_m": 167,
        "distance_from_start_km": 0.10769230769230771
      },
      {
        "latitude": 10.34213899188614,
        "longitude": 123.88324034334153,
        "elevation_m": 204,
        "distance_from_start_km": 0.21538461538461542
      },
      {
        "latitude": 10.342906235209307,
        "longitude": 123.88401000681418,
        "elevation_m": 207,
        "distance_from_start_km": 0.3230769230769231
      },
      {
        "latitude": 10.343611313385207,
        "longitude": 123.88452135102702,
        "elevation_m": 201,
        "distance_from_start_km": 0.43076923076923085
      },
      {
        "latitude": 10.34428046341798,
        "longitude": 123.88536312134434,
        "elevation_m": 220,
        "distance_from_start_km": 0.5384615384615385
      },
      {
        "latitude": 10.344786977515652,
        "longitude": 123.8859591351762,
        "elevation_m": 274,
        "distance_from_start_km": 0.6461538461538462
      },
      {
        "latitude": 10.345422920137034,
        "longitude": 123.88664798253198,
        "elevation_m": 346,
        "distance_from_start_km": 0.7538461538461538
      },
      {
        "latitude": 10.34609512974604,
        "longitude": 123.88726520222416,
        "elevation_m": 400,
        "distance_from_start_km": 0.8615384615384617
      },
      {
        "latitude": 10.346806851837396,
        "longitude": 123.888078943964,
        "elevation_m": 419,
        "distance_from_start_km": 0.9692307692307692
      },
      {
        "latitude": 10.347571396231574,
        "longitude": 123.88865115708983,
        "elevation_m": 413,
        "distance_from_start_km": 1.076923076923077
      },
      {
        "latitude": 10.348059757846187,
        "longitude": 123.8895605819309,
        "elevation_m": 416,
        "distance_from_start_km": 1.1846153846153846
      },
      {
        "latitude": 10.34858346150793,
        "longitude": 123.89002723591987,
        "elevation_m": 453,
        "distance_from_start_km": 1.2923076923076924
      },
      {
        "latitude": 10.3493,
        "longitude": 123.8908,
        "elevation_m": 520,
        "distance_from_start_km": 1.4000000000000001
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 14,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 3
    }
  },
  {
    "id": "babag-sirao-traverse",
    "route_id": "babag-sirao-traverse",
    "hiking_spot_id": "71",
    "hikingSpotId": "71",
    "route_name": "Babag to Sirao Traverse",
    "difficulty": "Hard",
    "start_coordinates": {
      "latitude": 10.3391,
      "longitude": 123.8797
    },
    "end_coordinates": {
      "latitude": 10.3514,
      "longitude": 123.8931
    },
    "distance_km": 6.5,
    "elevation_gain_m": 570,
    "estimated_duration_hr": 3.6,
    "highlights": "Connects to Kan-Irag ridge",
    "route_color": "#F44336",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8797,
          10.3391
        ],
        [
          123.88036950169857,
          10.339666880942584
        ],
        [
          123.88084441654357,
          10.34029398143156
        ],
        [
          123.88161804716161,
          10.340722361788231
        ],
        [
          123.88211539833183,
          10.341342023184708
        ],
        [
          123.8826871062171,
          10.342063064448784
        ],
        [
          123.88353094290675,
          10.342893315755049
        ],
        [
          123.8842586980477,
          10.343454626620272
        ],
        [
          123.88493829115777,
          10.343743866534155
        ],
        [
          123.88552210868741,
          10.344355326406632
        ],
        [
          123.8860956627714,
          10.344913304577796
        ],
        [
          123.88676300043927,
          10.345542504859742
        ],
        [
          123.88735274010862,
          10.346242738555869
        ],
        [
          123.8879184610413,
          10.346777386777587
        ],
        [
          123.88837413289848,
          10.347088244447244
        ],
        [
          123.88915896129605,
          10.347830261674533
        ],
        [
          123.88961308054517,
          10.348467799550493
        ],
        [
          123.89066679584744,
          10.348851186412405
        ],
        [
          123.8911011625605,
          10.349719644107957
        ],
        [
          123.89184799242769,
          10.350251603602429
        ],
        [
          123.8924224448535,
          10.350797779891824
        ],
        [
          123.8931,
          10.3514
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.342063064448784,
        "longitude": 123.8826871062171,
        "name": "Waypoint 1",
        "description": "Connects to Kan-Irag ridge",
        "elevation_m": 229
      },
      {
        "latitude": 10.345542504859742,
        "longitude": 123.88676300043927,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 239
      },
      {
        "latitude": 10.348467799550493,
        "longitude": 123.88961308054517,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 207
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.3391,
        "longitude": 123.8797,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.339666880942584,
        "longitude": 123.88036950169857,
        "elevation_m": 159,
        "distance_from_start_km": 0.10476190476190475
      },
      {
        "latitude": 10.34029398143156,
        "longitude": 123.88084441654357,
        "elevation_m": 207,
        "distance_from_start_km": 0.2095238095238095
      },
      {
        "latitude": 10.340722361788231,
        "longitude": 123.88161804716161,
        "elevation_m": 237,
        "distance_from_start_km": 0.3142857142857143
      },
      {
        "latitude": 10.341342023184708,
        "longitude": 123.88211539833183,
        "elevation_m": 247,
        "distance_from_start_km": 0.419047619047619
      },
      {
        "latitude": 10.342063064448784,
        "longitude": 123.8826871062171,
        "elevation_m": 244,
        "distance_from_start_km": 0.5238095238095238
      },
      {
        "latitude": 10.342893315755049,
        "longitude": 123.88353094290675,
        "elevation_m": 238,
        "distance_from_start_km": 0.6285714285714286
      },
      {
        "latitude": 10.343454626620272,
        "longitude": 123.8842586980477,
        "elevation_m": 241,
        "distance_from_start_km": 0.7333333333333334
      },
      {
        "latitude": 10.343743866534155,
        "longitude": 123.88493829115777,
        "elevation_m": 260,
        "distance_from_start_km": 0.838095238095238
      },
      {
        "latitude": 10.344355326406632,
        "longitude": 123.88552210868741,
        "elevation_m": 300,
        "distance_from_start_km": 0.942857142857143
      },
      {
        "latitude": 10.344913304577796,
        "longitude": 123.8860956627714,
        "elevation_m": 355,
        "distance_from_start_km": 1.0476190476190477
      },
      {
        "latitude": 10.345542504859742,
        "longitude": 123.88676300043927,
        "elevation_m": 415,
        "distance_from_start_km": 1.1523809523809525
      },
      {
        "latitude": 10.346242738555869,
        "longitude": 123.88735274010862,
        "elevation_m": 470,
        "distance_from_start_km": 1.2571428571428571
      },
      {
        "latitude": 10.346777386777587,
        "longitude": 123.8879184610413,
        "elevation_m": 510,
        "distance_from_start_km": 1.3619047619047622
      },
      {
        "latitude": 10.347088244447244,
        "longitude": 123.88837413289848,
        "elevation_m": 529,
        "distance_from_start_km": 1.4666666666666668
      },
      {
        "latitude": 10.347830261674533,
        "longitude": 123.88915896129605,
        "elevation_m": 532,
        "distance_from_start_km": 1.5714285714285716
      },
      {
        "latitude": 10.348467799550493,
        "longitude": 123.88961308054517,
        "elevation_m": 526,
        "distance_from_start_km": 1.676190476190476
      },
      {
        "latitude": 10.348851186412405,
        "longitude": 123.89066679584744,
        "elevation_m": 523,
        "distance_from_start_km": 1.780952380952381
      },
      {
        "latitude": 10.349719644107957,
        "longitude": 123.8911011625605,
        "elevation_m": 533,
        "distance_from_start_km": 1.885714285714286
      },
      {
        "latitude": 10.350251603602429,
        "longitude": 123.89184799242769,
        "elevation_m": 563,
        "distance_from_start_km": 1.9904761904761905
      },
      {
        "latitude": 10.350797779891824,
        "longitude": 123.8924224448535,
        "elevation_m": 611,
        "distance_from_start_km": 2.0952380952380953
      },
      {
        "latitude": 10.3514,
        "longitude": 123.8931,
        "elevation_m": 670,
        "distance_from_start_km": 2.2
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 22,
      "path_smoothness": "moderate",
      "terrain_type": "ridge",
      "scenic_rating": 5,
      "technical_difficulty": 4
    }
  },
  {
    "id": "babag-extreme-climb",
    "route_id": "babag-extreme-climb",
    "hiking_spot_id": "71",
    "hikingSpotId": "71",
    "route_name": "Babag Extreme Climb",
    "difficulty": "Very Hard",
    "start_coordinates": {
      "latitude": 10.3369,
      "longitude": 123.8776
    },
    "end_coordinates": {
      "latitude": 10.3536,
      "longitude": 123.8953
    },
    "distance_km": 7.9,
    "elevation_gain_m": 740,
    "estimated_duration_hr": 4.7,
    "highlights": "Steep rocky sections",
    "route_color": "#9C27B0",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8776,
          10.3369
        ],
        [
          123.87822513444145,
          10.337529980486577
        ],
        [
          123.87880060249053,
          10.338050201322481
        ],
        [
          123.87918534489269,
          10.338682654637106
        ],
        [
          123.87993909697798,
          10.339313846883597
        ],
        [
          123.88026793400769,
          10.339998812591668
        ],
        [
          123.88111518302924,
          10.339920498280842
        ],
        [
          123.88190863123849,
          10.34043216324316
        ],
        [
          123.88226996544637,
          10.341019322694727
        ],
        [
          123.88272404565734,
          10.342060927379137
        ],
        [
          123.88325576007948,
          10.342273428223287
        ],
        [
          123.8840920063506,
          10.342853950774227
        ],
        [
          123.8846315591733,
          10.343412273246782
        ],
        [
          123.88540484376628,
          10.344104137236844
        ],
        [
          123.88591514640049,
          10.344630979052782
        ],
        [
          123.88645,
          10.34525
        ],
        [
          123.88706953210428,
          10.345800192344011
        ],
        [
          123.88755470999371,
          10.34640340398763
        ],
        [
          123.88825450941926,
          10.346884533912684
        ],
        [
          123.8888653087778,
          10.347692157385769
        ],
        [
          123.88967000116705,
          10.348305318006664
        ],
        [
          123.8900931048579,
          10.348240683444914
        ],
        [
          123.89095732133909,
          10.349443438609395
        ],
        [
          123.89144041720336,
          10.35002436390355
        ],
        [
          123.89195480460094,
          10.350486965044638
        ],
        [
          123.89252721741398,
          10.351146946464809
        ],
        [
          123.89298881225841,
          10.351226963158
        ],
        [
          123.89347900219225,
          10.351849798017303
        ],
        [
          123.89415888001047,
          10.352587604945358
        ],
        [
          123.89475022600462,
          10.352990620277401
        ],
        [
          123.8953,
          10.3536
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.34043216324316,
        "longitude": 123.88190863123849,
        "name": "Waypoint 1",
        "description": "Steep rocky sections",
        "elevation_m": 296
      },
      {
        "latitude": 10.34525,
        "longitude": 123.88645,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 140
      },
      {
        "latitude": 10.35002436390355,
        "longitude": 123.89144041720336,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 143
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.3369,
        "longitude": 123.8776,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.337529980486577,
        "longitude": 123.87822513444145,
        "elevation_m": 155,
        "distance_from_start_km": 0.10333333333333333
      },
      {
        "latitude": 10.338050201322481,
        "longitude": 123.87880060249053,
        "elevation_m": 204,
        "distance_from_start_km": 0.20666666666666667
      },
      {
        "latitude": 10.338682654637106,
        "longitude": 123.87918534489269,
        "elevation_m": 244,
        "distance_from_start_km": 0.31000000000000005
      },
      {
        "latitude": 10.339313846883597,
        "longitude": 123.87993909697798,
        "elevation_m": 272,
        "distance_from_start_km": 0.41333333333333333
      },
      {
        "latitude": 10.339998812591668,
        "longitude": 123.88026793400769,
        "elevation_m": 287,
        "distance_from_start_km": 0.5166666666666666
      },
      {
        "latitude": 10.339920498280842,
        "longitude": 123.88111518302924,
        "elevation_m": 291,
        "distance_from_start_km": 0.6200000000000001
      },
      {
        "latitude": 10.34043216324316,
        "longitude": 123.88190863123849,
        "elevation_m": 288,
        "distance_from_start_km": 0.7233333333333334
      },
      {
        "latitude": 10.341019322694727,
        "longitude": 123.88226996544637,
        "elevation_m": 282,
        "distance_from_start_km": 0.8266666666666667
      },
      {
        "latitude": 10.342060927379137,
        "longitude": 123.88272404565734,
        "elevation_m": 279,
        "distance_from_start_km": 0.9299999999999999
      },
      {
        "latitude": 10.342273428223287,
        "longitude": 123.88325576007948,
        "elevation_m": 283,
        "distance_from_start_km": 1.0333333333333332
      },
      {
        "latitude": 10.342853950774227,
        "longitude": 123.8840920063506,
        "elevation_m": 298,
        "distance_from_start_km": 1.1366666666666665
      },
      {
        "latitude": 10.343412273246782,
        "longitude": 123.8846315591733,
        "elevation_m": 326,
        "distance_from_start_km": 1.2400000000000002
      },
      {
        "latitude": 10.344104137236844,
        "longitude": 123.88540484376628,
        "elevation_m": 366,
        "distance_from_start_km": 1.3433333333333335
      },
      {
        "latitude": 10.344630979052782,
        "longitude": 123.88591514640049,
        "elevation_m": 415,
        "distance_from_start_km": 1.4466666666666668
      },
      {
        "latitude": 10.34525,
        "longitude": 123.88645,
        "elevation_m": 470,
        "distance_from_start_km": 1.55
      },
      {
        "latitude": 10.345800192344011,
        "longitude": 123.88706953210428,
        "elevation_m": 525,
        "distance_from_start_km": 1.6533333333333333
      },
      {
        "latitude": 10.34640340398763,
        "longitude": 123.88755470999371,
        "elevation_m": 574,
        "distance_from_start_km": 1.7566666666666668
      },
      {
        "latitude": 10.346884533912684,
        "longitude": 123.88825450941926,
        "elevation_m": 614,
        "distance_from_start_km": 1.8599999999999999
      },
      {
        "latitude": 10.347692157385769,
        "longitude": 123.8888653087778,
        "elevation_m": 642,
        "distance_from_start_km": 1.9633333333333334
      },
      {
        "latitude": 10.348305318006664,
        "longitude": 123.88967000116705,
        "elevation_m": 657,
        "distance_from_start_km": 2.0666666666666664
      },
      {
        "latitude": 10.348240683444914,
        "longitude": 123.8900931048579,
        "elevation_m": 661,
        "distance_from_start_km": 2.17
      },
      {
        "latitude": 10.349443438609395,
        "longitude": 123.89095732133909,
        "elevation_m": 658,
        "distance_from_start_km": 2.273333333333333
      },
      {
        "latitude": 10.35002436390355,
        "longitude": 123.89144041720336,
        "elevation_m": 652,
        "distance_from_start_km": 2.376666666666667
      },
      {
        "latitude": 10.350486965044638,
        "longitude": 123.89195480460094,
        "elevation_m": 649,
        "distance_from_start_km": 2.4800000000000004
      },
      {
        "latitude": 10.351146946464809,
        "longitude": 123.89252721741398,
        "elevation_m": 653,
        "distance_from_start_km": 2.583333333333334
      },
      {
        "latitude": 10.351226963158,
        "longitude": 123.89298881225841,
        "elevation_m": 668,
        "distance_from_start_km": 2.686666666666667
      },
      {
        "latitude": 10.351849798017303,
        "longitude": 123.89347900219225,
        "elevation_m": 696,
        "distance_from_start_km": 2.7900000000000005
      },
      {
        "latitude": 10.352587604945358,
        "longitude": 123.89415888001047,
        "elevation_m": 736,
        "distance_from_start_km": 2.8933333333333335
      },
      {
        "latitude": 10.352990620277401,
        "longitude": 123.89475022600462,
        "elevation_m": 785,
        "distance_from_start_km": 2.996666666666667
      },
      {
        "latitude": 10.3536,
        "longitude": 123.8953,
        "elevation_m": 840,
        "distance_from_start_km": 3.1
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 31,
      "path_smoothness": "rough",
      "terrain_type": "rocky",
      "scenic_rating": 4,
      "technical_difficulty": 5
    }
  },
  {
    "id": "sirao-garden-trail",
    "route_id": "sirao-garden-trail",
    "hiking_spot_id": "72",
    "hikingSpotId": "72",
    "route_name": "Sirao Garden Trail",
    "difficulty": "Easy",
    "start_coordinates": {
      "latitude": 10.3941,
      "longitude": 123.8573
    },
    "end_coordinates": {
      "latitude": 10.397,
      "longitude": 123.8585
    },
    "distance_km": 2.2,
    "elevation_gain_m": 180,
    "estimated_duration_hr": 1.2,
    "highlights": "Flower farm views",
    "route_color": "#E91E63",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8573,
          10.3941
        ],
        [
          123.85755704136189,
          10.394773801884215
        ],
        [
          123.8579,
          10.39555
        ],
        [
          123.85823178082381,
          10.396271747777915
        ],
        [
          123.8585,
          10.397
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.39555,
        "longitude": 123.8579,
        "name": "Waypoint 1",
        "description": "Flower farm views",
        "elevation_m": 242
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.3941,
        "longitude": 123.8573,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.394773801884215,
        "longitude": 123.85755704136189,
        "elevation_m": 145,
        "distance_from_start_km": 0.125
      },
      {
        "latitude": 10.39555,
        "longitude": 123.8579,
        "elevation_m": 190,
        "distance_from_start_km": 0.25
      },
      {
        "latitude": 10.396271747777915,
        "longitude": 123.85823178082381,
        "elevation_m": 235,
        "distance_from_start_km": 0.375
      },
      {
        "latitude": 10.397,
        "longitude": 123.8585,
        "elevation_m": 280,
        "distance_from_start_km": 0.5
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 5,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 4,
      "technical_difficulty": 1
    }
  },
  {
    "id": "kan-irag-grassland",
    "route_id": "kan-irag-grassland",
    "hiking_spot_id": "72",
    "hikingSpotId": "72",
    "route_name": "Kan-irag Grassland",
    "difficulty": "Easy-Moderate",
    "start_coordinates": {
      "latitude": 10.3919,
      "longitude": 123.854
    },
    "end_coordinates": {
      "latitude": 10.397,
      "longitude": 123.8585
    },
    "distance_km": 3.1,
    "elevation_gain_m": 250,
    "estimated_duration_hr": 2,
    "highlights": "Rolling hills",
    "route_color": "#8BC34A",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.854,
          10.3919
        ],
        [
          123.85478932112197,
          10.392861224791156
        ],
        [
          123.85545655439172,
          10.393661268311048
        ],
        [
          123.85625,
          10.394449999999999
        ],
        [
          123.85706119045068,
          10.39542925690885
        ],
        [
          123.85784401046246,
          10.396165216313987
        ],
        [
          123.8585,
          10.397
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.393661268311048,
        "longitude": 123.85545655439172,
        "name": "Waypoint 1",
        "description": "Rolling hills",
        "elevation_m": 100
      },
      {
        "latitude": 10.39542925690885,
        "longitude": 123.85706119045068,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 269
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.3919,
        "longitude": 123.854,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.392861224791156,
        "longitude": 123.85478932112197,
        "elevation_m": 163,
        "distance_from_start_km": 0.11666666666666665
      },
      {
        "latitude": 10.393661268311048,
        "longitude": 123.85545655439172,
        "elevation_m": 162,
        "distance_from_start_km": 0.2333333333333333
      },
      {
        "latitude": 10.394449999999999,
        "longitude": 123.85625,
        "elevation_m": 225,
        "distance_from_start_km": 0.35000000000000003
      },
      {
        "latitude": 10.39542925690885,
        "longitude": 123.85706119045068,
        "elevation_m": 288,
        "distance_from_start_km": 0.4666666666666666
      },
      {
        "latitude": 10.396165216313987,
        "longitude": 123.85784401046246,
        "elevation_m": 287,
        "distance_from_start_km": 0.5833333333333334
      },
      {
        "latitude": 10.397,
        "longitude": 123.8585,
        "elevation_m": 350,
        "distance_from_start_km": 0.7000000000000001
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 7,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 2
    }
  },
  {
    "id": "sirao-loop-trail",
    "route_id": "sirao-loop-trail",
    "hiking_spot_id": "72",
    "hikingSpotId": "72",
    "route_name": "Sirao Loop Trail",
    "difficulty": "Moderate",
    "start_coordinates": {
      "latitude": 10.389,
      "longitude": 123.852
    },
    "end_coordinates": {
      "latitude": 10.3992,
      "longitude": 123.8612
    },
    "distance_km": 4.8,
    "elevation_gain_m": 410,
    "estimated_duration_hr": 2.5,
    "highlights": "Peak views",
    "route_color": "#FF5722",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.852,
          10.389
        ],
        [
          123.85275978288992,
          10.38983615343647
        ],
        [
          123.85338564275492,
          10.390613035948983
        ],
        [
          123.85419195879544,
          10.391397135931326
        ],
        [
          123.8549102463747,
          10.392062364601362
        ],
        [
          123.8555739858949,
          10.392807808058365
        ],
        [
          123.85619844830582,
          10.393722503311201
        ],
        [
          123.85697062225216,
          10.394530501612646
        ],
        [
          123.85774273551279,
          10.39536808105499
        ],
        [
          123.85852277465257,
          10.39600072964073
        ],
        [
          123.85909587437125,
          10.396688415396438
        ],
        [
          123.85986362889544,
          10.397754277262923
        ],
        [
          123.86050953546076,
          10.398467285037695
        ],
        [
          123.8612,
          10.3992
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.391397135931326,
        "longitude": 123.85419195879544,
        "name": "Waypoint 1",
        "description": "Peak views",
        "elevation_m": 197
      },
      {
        "latitude": 10.394530501612646,
        "longitude": 123.85697062225216,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 168
      },
      {
        "latitude": 10.396688415396438,
        "longitude": 123.85909587437125,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 284
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.389,
        "longitude": 123.852,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.38983615343647,
        "longitude": 123.85275978288992,
        "elevation_m": 165,
        "distance_from_start_km": 0.10769230769230771
      },
      {
        "latitude": 10.390613035948983,
        "longitude": 123.85338564275492,
        "elevation_m": 201,
        "distance_from_start_km": 0.21538461538461542
      },
      {
        "latitude": 10.391397135931326,
        "longitude": 123.85419195879544,
        "elevation_m": 204,
        "distance_from_start_km": 0.3230769230769231
      },
      {
        "latitude": 10.392062364601362,
        "longitude": 123.8549102463747,
        "elevation_m": 199,
        "distance_from_start_km": 0.43076923076923085
      },
      {
        "latitude": 10.392807808058365,
        "longitude": 123.8555739858949,
        "elevation_m": 217,
        "distance_from_start_km": 0.5384615384615385
      },
      {
        "latitude": 10.393722503311201,
        "longitude": 123.85619844830582,
        "elevation_m": 270,
        "distance_from_start_km": 0.6461538461538462
      },
      {
        "latitude": 10.394530501612646,
        "longitude": 123.85697062225216,
        "elevation_m": 340,
        "distance_from_start_km": 0.7538461538461538
      },
      {
        "latitude": 10.39536808105499,
        "longitude": 123.85774273551279,
        "elevation_m": 393,
        "distance_from_start_km": 0.8615384615384617
      },
      {
        "latitude": 10.39600072964073,
        "longitude": 123.85852277465257,
        "elevation_m": 411,
        "distance_from_start_km": 0.9692307692307692
      },
      {
        "latitude": 10.396688415396438,
        "longitude": 123.85909587437125,
        "elevation_m": 406,
        "distance_from_start_km": 1.076923076923077
      },
      {
        "latitude": 10.397754277262923,
        "longitude": 123.85986362889544,
        "elevation_m": 409,
        "distance_from_start_km": 1.1846153846153846
      },
      {
        "latitude": 10.398467285037695,
        "longitude": 123.86050953546076,
        "elevation_m": 445,
        "distance_from_start_km": 1.2923076923076924
      },
      {
        "latitude": 10.3992,
        "longitude": 123.8612,
        "elevation_m": 510,
        "distance_from_start_km": 1.4000000000000001
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 14,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 3
    }
  },
  {
    "id": "kan-irag-traverse",
    "route_id": "kan-irag-traverse",
    "hiking_spot_id": "72",
    "hikingSpotId": "72",
    "route_name": "Kan-irag Traverse",
    "difficulty": "Hard",
    "start_coordinates": {
      "latitude": 10.3872,
      "longitude": 123.8502
    },
    "end_coordinates": {
      "latitude": 10.4031,
      "longitude": 123.8625
    },
    "distance_km": 6.5,
    "elevation_gain_m": 580,
    "estimated_duration_hr": 3.5,
    "highlights": "Steep scramble",
    "route_color": "#795548",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8502,
          10.3872
        ],
        [
          123.85077641027284,
          10.387984613664438
        ],
        [
          123.85150600334386,
          10.38867114672631
        ],
        [
          123.85200940638421,
          10.389632926661417
        ],
        [
          123.85249155468668,
          10.390348228303417
        ],
        [
          123.85318564766709,
          10.391162431388981
        ],
        [
          123.8537680355387,
          10.391841967279293
        ],
        [
          123.85448668084048,
          10.392530554587362
        ],
        [
          123.8548089140531,
          10.393345501589462
        ],
        [
          123.85557228439512,
          10.394059557776648
        ],
        [
          123.85608062139259,
          10.394767579138097
        ],
        [
          123.85661646375041,
          10.39552418169261
        ],
        [
          123.85711650947577,
          10.396252403928987
        ],
        [
          123.8579574552081,
          10.397216694292633
        ],
        [
          123.85846156036743,
          10.397637286742423
        ],
        [
          123.85899145980662,
          10.398782753437734
        ],
        [
          123.85930129212969,
          10.39902205552263
        ],
        [
          123.86009454337676,
          10.400343016268081
        ],
        [
          123.8608262777731,
          10.40096975114278
        ],
        [
          123.86128212572748,
          10.401611648255717
        ],
        [
          123.86184278953273,
          10.402300287409338
        ],
        [
          123.8625,
          10.4031
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.391162431388981,
        "longitude": 123.85318564766709,
        "name": "Waypoint 1",
        "description": "Steep scramble",
        "elevation_m": 188
      },
      {
        "latitude": 10.39552418169261,
        "longitude": 123.85661646375041,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 283
      },
      {
        "latitude": 10.39902205552263,
        "longitude": 123.85930129212969,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 141
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.3872,
        "longitude": 123.8502,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.387984613664438,
        "longitude": 123.85077641027284,
        "elevation_m": 160,
        "distance_from_start_km": 0.10476190476190475
      },
      {
        "latitude": 10.38867114672631,
        "longitude": 123.85150600334386,
        "elevation_m": 209,
        "distance_from_start_km": 0.2095238095238095
      },
      {
        "latitude": 10.389632926661417,
        "longitude": 123.85200940638421,
        "elevation_m": 239,
        "distance_from_start_km": 0.3142857142857143
      },
      {
        "latitude": 10.390348228303417,
        "longitude": 123.85249155468668,
        "elevation_m": 250,
        "distance_from_start_km": 0.419047619047619
      },
      {
        "latitude": 10.391162431388981,
        "longitude": 123.85318564766709,
        "elevation_m": 247,
        "distance_from_start_km": 0.5238095238095238
      },
      {
        "latitude": 10.391841967279293,
        "longitude": 123.8537680355387,
        "elevation_m": 241,
        "distance_from_start_km": 0.6285714285714286
      },
      {
        "latitude": 10.392530554587362,
        "longitude": 123.85448668084048,
        "elevation_m": 243,
        "distance_from_start_km": 0.7333333333333334
      },
      {
        "latitude": 10.393345501589462,
        "longitude": 123.8548089140531,
        "elevation_m": 263,
        "distance_from_start_km": 0.838095238095238
      },
      {
        "latitude": 10.394059557776648,
        "longitude": 123.85557228439512,
        "elevation_m": 303,
        "distance_from_start_km": 0.942857142857143
      },
      {
        "latitude": 10.394767579138097,
        "longitude": 123.85608062139259,
        "elevation_m": 359,
        "distance_from_start_km": 1.0476190476190477
      },
      {
        "latitude": 10.39552418169261,
        "longitude": 123.85661646375041,
        "elevation_m": 421,
        "distance_from_start_km": 1.1523809523809525
      },
      {
        "latitude": 10.396252403928987,
        "longitude": 123.85711650947577,
        "elevation_m": 477,
        "distance_from_start_km": 1.2571428571428571
      },
      {
        "latitude": 10.397216694292633,
        "longitude": 123.8579574552081,
        "elevation_m": 517,
        "distance_from_start_km": 1.3619047619047622
      },
      {
        "latitude": 10.397637286742423,
        "longitude": 123.85846156036743,
        "elevation_m": 537,
        "distance_from_start_km": 1.4666666666666668
      },
      {
        "latitude": 10.398782753437734,
        "longitude": 123.85899145980662,
        "elevation_m": 539,
        "distance_from_start_km": 1.5714285714285716
      },
      {
        "latitude": 10.39902205552263,
        "longitude": 123.85930129212969,
        "elevation_m": 533,
        "distance_from_start_km": 1.676190476190476
      },
      {
        "latitude": 10.400343016268081,
        "longitude": 123.86009454337676,
        "elevation_m": 530,
        "distance_from_start_km": 1.780952380952381
      },
      {
        "latitude": 10.40096975114278,
        "longitude": 123.8608262777731,
        "elevation_m": 541,
        "distance_from_start_km": 1.885714285714286
      },
      {
        "latitude": 10.401611648255717,
        "longitude": 123.86128212572748,
        "elevation_m": 571,
        "distance_from_start_km": 1.9904761904761905
      },
      {
        "latitude": 10.402300287409338,
        "longitude": 123.86184278953273,
        "elevation_m": 620,
        "distance_from_start_km": 2.0952380952380953
      },
      {
        "latitude": 10.4031,
        "longitude": 123.8625,
        "elevation_m": 680,
        "distance_from_start_km": 2.2
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 22,
      "path_smoothness": "moderate",
      "terrain_type": "mixed",
      "scenic_rating": 4,
      "technical_difficulty": 4
    }
  },
  {
    "id": "sirao-peak-summit-ridge",
    "route_id": "sirao-peak-summit-ridge",
    "hiking_spot_id": "72",
    "hikingSpotId": "72",
    "route_name": "Sirao Peak Summit Ridge",
    "difficulty": "Very Hard",
    "start_coordinates": {
      "latitude": 10.385,
      "longitude": 123.8482
    },
    "end_coordinates": {
      "latitude": 10.406,
      "longitude": 123.8635
    },
    "distance_km": 8,
    "elevation_gain_m": 720,
    "estimated_duration_hr": 4.5,
    "highlights": "Full ridge exposure",
    "route_color": "#607D8B",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8482,
          10.385
        ],
        [
          123.84873953606478,
          10.38559705011647
        ],
        [
          123.84907101308436,
          10.386361058335682
        ],
        [
          123.84947971543554,
          10.386950368327309
        ],
        [
          123.85038013160714,
          10.387706731191503
        ],
        [
          123.85060125933575,
          10.388262773854244
        ],
        [
          123.85086145208902,
          10.389202608754983
        ],
        [
          123.85163495501833,
          10.38966823152763
        ],
        [
          123.85240989937365,
          10.390526961500305
        ],
        [
          123.85278499556276,
          10.39104733208368
        ],
        [
          123.85336217232945,
          10.391449125537777
        ],
        [
          123.85383765750566,
          10.392291877517286
        ],
        [
          123.85407940142063,
          10.393198479825156
        ],
        [
          123.854423821148,
          10.39387291073402
        ],
        [
          123.85500981072113,
          10.394554319163063
        ],
        [
          123.85563258456834,
          10.395138241188285
        ],
        [
          123.85606311182177,
          10.395803727898347
        ],
        [
          123.85658002012119,
          10.396571297663884
        ],
        [
          123.85704210565468,
          10.397210416106534
        ],
        [
          123.85776168632586,
          10.397990353541934
        ],
        [
          123.85837333804481,
          10.398411266504258
        ],
        [
          123.85851679163426,
          10.39902275529548
        ],
        [
          123.85906777416956,
          10.399992972539511
        ],
        [
          123.85922738296921,
          10.400268122509628
        ],
        [
          123.86017961042845,
          10.401549566392987
        ],
        [
          123.86042593175438,
          10.402020905235851
        ],
        [
          123.86083467413398,
          10.40288627499905
        ],
        [
          123.86160263723747,
          10.403465311382785
        ],
        [
          123.86217856417372,
          10.403917190844856
        ],
        [
          123.86259919719357,
          10.404492323714797
        ],
        [
          123.86307976509987,
          10.4053171112069
        ],
        [
          123.8635,
          10.406
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.390526961500305,
        "longitude": 123.85240989937365,
        "name": "Waypoint 1",
        "description": "Full ridge exposure",
        "elevation_m": 202
      },
      {
        "latitude": 10.395803727898347,
        "longitude": 123.85606311182177,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 283
      },
      {
        "latitude": 10.401549566392987,
        "longitude": 123.86017961042845,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 252
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.385,
        "longitude": 123.8482,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.38559705011647,
        "longitude": 123.84873953606478,
        "elevation_m": 152,
        "distance_from_start_km": 0.1032258064516129
      },
      {
        "latitude": 10.386361058335682,
        "longitude": 123.84907101308436,
        "elevation_m": 199,
        "distance_from_start_km": 0.2064516129032258
      },
      {
        "latitude": 10.386950368327309,
        "longitude": 123.84947971543554,
        "elevation_m": 237,
        "distance_from_start_km": 0.3096774193548387
      },
      {
        "latitude": 10.387706731191503,
        "longitude": 123.85038013160714,
        "elevation_m": 265,
        "distance_from_start_km": 0.4129032258064516
      },
      {
        "latitude": 10.388262773854244,
        "longitude": 123.85060125933575,
        "elevation_m": 281,
        "distance_from_start_km": 0.5161290322580645
      },
      {
        "latitude": 10.389202608754983,
        "longitude": 123.85086145208902,
        "elevation_m": 286,
        "distance_from_start_km": 0.6193548387096774
      },
      {
        "latitude": 10.38966823152763,
        "longitude": 123.85163495501833,
        "elevation_m": 284,
        "distance_from_start_km": 0.7225806451612904
      },
      {
        "latitude": 10.390526961500305,
        "longitude": 123.85240989937365,
        "elevation_m": 279,
        "distance_from_start_km": 0.8258064516129032
      },
      {
        "latitude": 10.39104733208368,
        "longitude": 123.85278499556276,
        "elevation_m": 274,
        "distance_from_start_km": 0.9290322580645163
      },
      {
        "latitude": 10.391449125537777,
        "longitude": 123.85336217232945,
        "elevation_m": 275,
        "distance_from_start_km": 1.032258064516129
      },
      {
        "latitude": 10.392291877517286,
        "longitude": 123.85383765750566,
        "elevation_m": 286,
        "distance_from_start_km": 1.135483870967742
      },
      {
        "latitude": 10.393198479825156,
        "longitude": 123.85407940142063,
        "elevation_m": 308,
        "distance_from_start_km": 1.238709677419355
      },
      {
        "latitude": 10.39387291073402,
        "longitude": 123.854423821148,
        "elevation_m": 341,
        "distance_from_start_km": 1.3419354838709678
      },
      {
        "latitude": 10.394554319163063,
        "longitude": 123.85500981072113,
        "elevation_m": 384,
        "distance_from_start_km": 1.4451612903225808
      },
      {
        "latitude": 10.395138241188285,
        "longitude": 123.85563258456834,
        "elevation_m": 434,
        "distance_from_start_km": 1.5483870967741937
      },
      {
        "latitude": 10.395803727898347,
        "longitude": 123.85606311182177,
        "elevation_m": 486,
        "distance_from_start_km": 1.6516129032258065
      },
      {
        "latitude": 10.396571297663884,
        "longitude": 123.85658002012119,
        "elevation_m": 536,
        "distance_from_start_km": 1.7548387096774194
      },
      {
        "latitude": 10.397210416106534,
        "longitude": 123.85704210565468,
        "elevation_m": 579,
        "distance_from_start_km": 1.8580645161290326
      },
      {
        "latitude": 10.397990353541934,
        "longitude": 123.85776168632586,
        "elevation_m": 612,
        "distance_from_start_km": 1.9612903225806453
      },
      {
        "latitude": 10.398411266504258,
        "longitude": 123.85837333804481,
        "elevation_m": 634,
        "distance_from_start_km": 2.064516129032258
      },
      {
        "latitude": 10.39902275529548,
        "longitude": 123.85851679163426,
        "elevation_m": 645,
        "distance_from_start_km": 2.1677419354838707
      },
      {
        "latitude": 10.399992972539511,
        "longitude": 123.85906777416956,
        "elevation_m": 646,
        "distance_from_start_km": 2.270967741935484
      },
      {
        "latitude": 10.400268122509628,
        "longitude": 123.85922738296921,
        "elevation_m": 641,
        "distance_from_start_km": 2.374193548387097
      },
      {
        "latitude": 10.401549566392987,
        "longitude": 123.86017961042845,
        "elevation_m": 636,
        "distance_from_start_km": 2.47741935483871
      },
      {
        "latitude": 10.402020905235851,
        "longitude": 123.86042593175438,
        "elevation_m": 634,
        "distance_from_start_km": 2.5806451612903225
      },
      {
        "latitude": 10.40288627499905,
        "longitude": 123.86083467413398,
        "elevation_m": 639,
        "distance_from_start_km": 2.6838709677419357
      },
      {
        "latitude": 10.403465311382785,
        "longitude": 123.86160263723747,
        "elevation_m": 655,
        "distance_from_start_km": 2.7870967741935484
      },
      {
        "latitude": 10.403917190844856,
        "longitude": 123.86217856417372,
        "elevation_m": 683,
        "distance_from_start_km": 2.8903225806451616
      },
      {
        "latitude": 10.404492323714797,
        "longitude": 123.86259919719357,
        "elevation_m": 721,
        "distance_from_start_km": 2.9935483870967743
      },
      {
        "latitude": 10.4053171112069,
        "longitude": 123.86307976509987,
        "elevation_m": 768,
        "distance_from_start_km": 3.0967741935483875
      },
      {
        "latitude": 10.406,
        "longitude": 123.8635,
        "elevation_m": 820,
        "distance_from_start_km": 3.2
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 32,
      "path_smoothness": "rough",
      "terrain_type": "ridge",
      "scenic_rating": 4,
      "technical_difficulty": 5
    }
  },
  {
    "id": "naupa-eco-trail",
    "route_id": "naupa-eco-trail",
    "hiking_spot_id": "73",
    "hikingSpotId": "73",
    "route_name": "Naupa Eco Trail",
    "difficulty": "Easy",
    "start_coordinates": {
      "latitude": 10.256,
      "longitude": 123.766
    },
    "end_coordinates": {
      "latitude": 10.2558,
      "longitude": 123.7698
    },
    "distance_km": 1.8,
    "elevation_gain_m": 120,
    "estimated_duration_hr": 1,
    "highlights": "Grassland",
    "route_color": "#CDDC39",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.766,
          10.256
        ],
        [
          123.76702417789141,
          10.255854721673705
        ],
        [
          123.7679,
          10.2559
        ],
        [
          123.76881820295385,
          10.255773161651351
        ],
        [
          123.7698,
          10.2558
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.2559,
        "longitude": 123.7679,
        "name": "Waypoint 1",
        "description": "Grassland",
        "elevation_m": 136
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.256,
        "longitude": 123.766,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.255854721673705,
        "longitude": 123.76702417789141,
        "elevation_m": 130,
        "distance_from_start_km": 0.125
      },
      {
        "latitude": 10.2559,
        "longitude": 123.7679,
        "elevation_m": 160,
        "distance_from_start_km": 0.25
      },
      {
        "latitude": 10.255773161651351,
        "longitude": 123.76881820295385,
        "elevation_m": 190,
        "distance_from_start_km": 0.375
      },
      {
        "latitude": 10.2558,
        "longitude": 123.7698,
        "elevation_m": 220,
        "distance_from_start_km": 0.5
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 5,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 1
    }
  },
  {
    "id": "naupa-ridge-walk",
    "route_id": "naupa-ridge-walk",
    "hiking_spot_id": "73",
    "hikingSpotId": "73",
    "route_name": "Naupa Ridge Walk",
    "difficulty": "Easy-Moderate",
    "start_coordinates": {
      "latitude": 10.2539,
      "longitude": 123.7645
    },
    "end_coordinates": {
      "latitude": 10.2558,
      "longitude": 123.7698
    },
    "distance_km": 2.7,
    "elevation_gain_m": 190,
    "estimated_duration_hr": 1.5,
    "highlights": "Rolling hills",
    "route_color": "#FFC107",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.7645,
          10.2539
        ],
        [
          123.76547603835654,
          10.254306541409829
        ],
        [
          123.7665475588414,
          10.25467600880238
        ],
        [
          123.76763439442594,
          10.25495958115635
        ],
        [
          123.76867145760794,
          10.255386355662624
        ],
        [
          123.7698,
          10.2558
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.25467600880238,
        "longitude": 123.7665475588414,
        "name": "Waypoint 1",
        "description": "Rolling hills",
        "elevation_m": 292
      },
      {
        "latitude": 10.255386355662624,
        "longitude": 123.76867145760794,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 261
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.2539,
        "longitude": 123.7645,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.254306541409829,
        "longitude": 123.76547603835654,
        "elevation_m": 149,
        "distance_from_start_km": 0.12000000000000002
      },
      {
        "latitude": 10.25467600880238,
        "longitude": 123.7665475588414,
        "elevation_m": 158,
        "distance_from_start_km": 0.24000000000000005
      },
      {
        "latitude": 10.25495958115635,
        "longitude": 123.76763439442594,
        "elevation_m": 232,
        "distance_from_start_km": 0.36
      },
      {
        "latitude": 10.255386355662624,
        "longitude": 123.76867145760794,
        "elevation_m": 241,
        "distance_from_start_km": 0.4800000000000001
      },
      {
        "latitude": 10.2558,
        "longitude": 123.7698,
        "elevation_m": 290,
        "distance_from_start_km": 0.6000000000000001
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 6,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 4,
      "technical_difficulty": 2
    }
  },
  {
    "id": "naupa-loop-trail",
    "route_id": "naupa-loop-trail",
    "hiking_spot_id": "73",
    "hikingSpotId": "73",
    "route_name": "Naupa Loop Trail",
    "difficulty": "Moderate",
    "start_coordinates": {
      "latitude": 10.252,
      "longitude": 123.762
    },
    "end_coordinates": {
      "latitude": 10.2575,
      "longitude": 123.7722
    },
    "distance_km": 4,
    "elevation_gain_m": 320,
    "estimated_duration_hr": 2.2,
    "highlights": "Summit views",
    "route_color": "#009688",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.762,
          10.252
        ],
        [
          123.76293226932573,
          10.252450319506899
        ],
        [
          123.7639601717607,
          10.252955090278636
        ],
        [
          123.76484758025686,
          10.253681121050423
        ],
        [
          123.76581339182097,
          10.2539653530418
        ],
        [
          123.76665984518804,
          10.254448266980821
        ],
        [
          123.7675779944315,
          10.255022905427383
        ],
        [
          123.76854029514354,
          10.255425965237766
        ],
        [
          123.76923496530884,
          10.255960236914719
        ],
        [
          123.7702284518153,
          10.25660464068105
        ],
        [
          123.77120176834616,
          10.256894520807775
        ],
        [
          123.7722,
          10.2575
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.253681121050423,
        "longitude": 123.76484758025686,
        "name": "Waypoint 1",
        "description": "Summit views",
        "elevation_m": 272
      },
      {
        "latitude": 10.255022905427383,
        "longitude": 123.7675779944315,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 149
      },
      {
        "latitude": 10.25660464068105,
        "longitude": 123.7702284518153,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 190
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.252,
        "longitude": 123.762,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.252450319506899,
        "longitude": 123.76293226932573,
        "elevation_m": 158,
        "distance_from_start_km": 0.10909090909090909
      },
      {
        "latitude": 10.252955090278636,
        "longitude": 123.7639601717607,
        "elevation_m": 182,
        "distance_from_start_km": 0.21818181818181817
      },
      {
        "latitude": 10.253681121050423,
        "longitude": 123.76484758025686,
        "elevation_m": 178,
        "distance_from_start_km": 0.32727272727272727
      },
      {
        "latitude": 10.2539653530418,
        "longitude": 123.76581339182097,
        "elevation_m": 185,
        "distance_from_start_km": 0.43636363636363634
      },
      {
        "latitude": 10.254448266980821,
        "longitude": 123.76665984518804,
        "elevation_m": 228,
        "distance_from_start_km": 0.5454545454545454
      },
      {
        "latitude": 10.255022905427383,
        "longitude": 123.7675779944315,
        "elevation_m": 292,
        "distance_from_start_km": 0.6545454545454545
      },
      {
        "latitude": 10.255425965237766,
        "longitude": 123.76854029514354,
        "elevation_m": 335,
        "distance_from_start_km": 0.7636363636363637
      },
      {
        "latitude": 10.255960236914719,
        "longitude": 123.76923496530884,
        "elevation_m": 342,
        "distance_from_start_km": 0.8727272727272727
      },
      {
        "latitude": 10.25660464068105,
        "longitude": 123.7702284518153,
        "elevation_m": 338,
        "distance_from_start_km": 0.9818181818181819
      },
      {
        "latitude": 10.256894520807775,
        "longitude": 123.77120176834616,
        "elevation_m": 362,
        "distance_from_start_km": 1.0909090909090908
      },
      {
        "latitude": 10.2575,
        "longitude": 123.7722,
        "elevation_m": 420,
        "distance_from_start_km": 1.2000000000000002
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 12,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 3
    }
  },
  {
    "id": "naupa-kabalas-ridge",
    "route_id": "naupa-kabalas-ridge",
    "hiking_spot_id": "73",
    "hikingSpotId": "73",
    "route_name": "Naupa-Kabalas Ridge",
    "difficulty": "Hard",
    "start_coordinates": {
      "latitude": 10.2502,
      "longitude": 123.7601
    },
    "end_coordinates": {
      "latitude": 10.2595,
      "longitude": 123.774
    },
    "distance_km": 5.8,
    "elevation_gain_m": 460,
    "estimated_duration_hr": 3.2,
    "highlights": "Steep ascent",
    "route_color": "#3F51B5",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.7601,
          10.2502
        ],
        [
          123.76086909402414,
          10.25062388066608
        ],
        [
          123.76141268148447,
          10.251066923294667
        ],
        [
          123.76248636819889,
          10.251472300948986
        ],
        [
          123.76327135676935,
          10.252227330548335
        ],
        [
          123.76374075966402,
          10.25284782859724
        ],
        [
          123.7644954826511,
          10.253264524934636
        ],
        [
          123.76519687681191,
          10.253741555165318
        ],
        [
          123.766051876634,
          10.253991464195824
        ],
        [
          123.76668969363227,
          10.254649592888038
        ],
        [
          123.76738325053412,
          10.25512895365544
        ],
        [
          123.76815994314056,
          10.255530162097326
        ],
        [
          123.76890655727567,
          10.255895692125364
        ],
        [
          123.76980549733332,
          10.256795564344895
        ],
        [
          123.77025056221855,
          10.257075142544785
        ],
        [
          123.77079575404755,
          10.257811834068812
        ],
        [
          123.77195932375326,
          10.258053427377016
        ],
        [
          123.77259408429953,
          10.25850484602415
        ],
        [
          123.77333721345522,
          10.258969439495859
        ],
        [
          123.774,
          10.2595
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.25284782859724,
        "longitude": 123.76374075966402,
        "name": "Waypoint 1",
        "description": "Steep ascent",
        "elevation_m": 136
      },
      {
        "latitude": 10.25512895365544,
        "longitude": 123.76738325053412,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 205
      },
      {
        "latitude": 10.257811834068812,
        "longitude": 123.77079575404755,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 183
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.2502,
        "longitude": 123.7601,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.25062388066608,
        "longitude": 123.76086909402414,
        "elevation_m": 152,
        "distance_from_start_km": 0.10526315789473684
      },
      {
        "latitude": 10.251066923294667,
        "longitude": 123.76141268148447,
        "elevation_m": 193,
        "distance_from_start_km": 0.21052631578947367
      },
      {
        "latitude": 10.251472300948986,
        "longitude": 123.76248636819889,
        "elevation_m": 215,
        "distance_from_start_km": 0.31578947368421056
      },
      {
        "latitude": 10.252227330548335,
        "longitude": 123.76327135676935,
        "elevation_m": 219,
        "distance_from_start_km": 0.42105263157894735
      },
      {
        "latitude": 10.25284782859724,
        "longitude": 123.76374075966402,
        "elevation_m": 213,
        "distance_from_start_km": 0.5263157894736842
      },
      {
        "latitude": 10.253264524934636,
        "longitude": 123.7644954826511,
        "elevation_m": 211,
        "distance_from_start_km": 0.6315789473684211
      },
      {
        "latitude": 10.253741555165318,
        "longitude": 123.76519687681191,
        "elevation_m": 224,
        "distance_from_start_km": 0.736842105263158
      },
      {
        "latitude": 10.253991464195824,
        "longitude": 123.766051876634,
        "elevation_m": 255,
        "distance_from_start_km": 0.8421052631578947
      },
      {
        "latitude": 10.254649592888038,
        "longitude": 123.76668969363227,
        "elevation_m": 303,
        "distance_from_start_km": 0.9473684210526315
      },
      {
        "latitude": 10.25512895365544,
        "longitude": 123.76738325053412,
        "elevation_m": 357,
        "distance_from_start_km": 1.0526315789473684
      },
      {
        "latitude": 10.255530162097326,
        "longitude": 123.76815994314056,
        "elevation_m": 405,
        "distance_from_start_km": 1.1578947368421053
      },
      {
        "latitude": 10.255895692125364,
        "longitude": 123.76890655727567,
        "elevation_m": 436,
        "distance_from_start_km": 1.2631578947368423
      },
      {
        "latitude": 10.256795564344895,
        "longitude": 123.76980549733332,
        "elevation_m": 449,
        "distance_from_start_km": 1.368421052631579
      },
      {
        "latitude": 10.257075142544785,
        "longitude": 123.77025056221855,
        "elevation_m": 447,
        "distance_from_start_km": 1.473684210526316
      },
      {
        "latitude": 10.257811834068812,
        "longitude": 123.77079575404755,
        "elevation_m": 441,
        "distance_from_start_km": 1.5789473684210529
      },
      {
        "latitude": 10.258053427377016,
        "longitude": 123.77195932375326,
        "elevation_m": 445,
        "distance_from_start_km": 1.6842105263157894
      },
      {
        "latitude": 10.25850484602415,
        "longitude": 123.77259408429953,
        "elevation_m": 467,
        "distance_from_start_km": 1.7894736842105265
      },
      {
        "latitude": 10.258969439495859,
        "longitude": 123.77333721345522,
        "elevation_m": 508,
        "distance_from_start_km": 1.894736842105263
      },
      {
        "latitude": 10.2595,
        "longitude": 123.774,
        "elevation_m": 560,
        "distance_from_start_km": 2
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 20,
      "path_smoothness": "moderate",
      "terrain_type": "mixed",
      "scenic_rating": 3,
      "technical_difficulty": 4
    }
  },
  {
    "id": "naupa-extreme-traverse",
    "route_id": "naupa-extreme-traverse",
    "hiking_spot_id": "73",
    "hikingSpotId": "73",
    "route_name": "Naupa Extreme Traverse",
    "difficulty": "Very Hard",
    "start_coordinates": {
      "latitude": 10.2481,
      "longitude": 123.758
    },
    "end_coordinates": {
      "latitude": 10.261,
      "longitude": 123.7758
    },
    "distance_km": 7.5,
    "elevation_gain_m": 610,
    "estimated_duration_hr": 4.5,
    "highlights": "Ridge scramble",
    "route_color": "#E91E63",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.758,
          10.2481
        ],
        [
          123.75861971342009,
          10.248626730281607
        ],
        [
          123.75921399441563,
          10.249012503808114
        ],
        [
          123.75975845919,
          10.249568258705471
        ],
        [
          123.76053462590998,
          10.249976033818152
        ],
        [
          123.76126044255246,
          10.250079268908223
        ],
        [
          123.76166407469888,
          10.250472240920951
        ],
        [
          123.76211908254206,
          10.251352781240278
        ],
        [
          123.76311017632946,
          10.251798417971376
        ],
        [
          123.76367781902668,
          10.252372999591294
        ],
        [
          123.76405350137476,
          10.252651686690662
        ],
        [
          123.76453981283836,
          10.252961711048947
        ],
        [
          123.76532822454534,
          10.25330588271508
        ],
        [
          123.76594784615955,
          10.25380661474356
        ],
        [
          123.76662281940627,
          10.254356365213079
        ],
        [
          123.76724240016283,
          10.25481147450178
        ],
        [
          123.76785474907727,
          10.255289911418675
        ],
        [
          123.76826863925525,
          10.255605145630359
        ],
        [
          123.76915731120569,
          10.256321812642817
        ],
        [
          123.76988763720156,
          10.256641665424253
        ],
        [
          123.77044982616586,
          10.25733223712064
        ],
        [
          123.77077565883718,
          10.257199403595912
        ],
        [
          123.77188230134749,
          10.258016438380599
        ],
        [
          123.77189306761966,
          10.258102014780068
        ],
        [
          123.77277224707467,
          10.258804182079508
        ],
        [
          123.77318277164143,
          10.259499477191348
        ],
        [
          123.77394842918896,
          10.259426185550009
        ],
        [
          123.7746286669668,
          10.260221423466367
        ],
        [
          123.77517051522351,
          10.260518727431771
        ],
        [
          123.7758,
          10.261
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.251352781240278,
        "longitude": 123.76211908254206,
        "name": "Waypoint 1",
        "description": "Ridge scramble",
        "elevation_m": 126
      },
      {
        "latitude": 10.25481147450178,
        "longitude": 123.76724240016283,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 247
      },
      {
        "latitude": 10.258016438380599,
        "longitude": 123.77188230134749,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 243
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.2481,
        "longitude": 123.758,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.248626730281607,
        "longitude": 123.75861971342009,
        "elevation_m": 147,
        "distance_from_start_km": 0.10344827586206898
      },
      {
        "latitude": 10.249012503808114,
        "longitude": 123.75921399441563,
        "elevation_m": 189,
        "distance_from_start_km": 0.20689655172413796
      },
      {
        "latitude": 10.249568258705471,
        "longitude": 123.75975845919,
        "elevation_m": 222,
        "distance_from_start_km": 0.3103448275862069
      },
      {
        "latitude": 10.249976033818152,
        "longitude": 123.76053462590998,
        "elevation_m": 244,
        "distance_from_start_km": 0.4137931034482759
      },
      {
        "latitude": 10.250079268908223,
        "longitude": 123.76126044255246,
        "elevation_m": 256,
        "distance_from_start_km": 0.5172413793103449
      },
      {
        "latitude": 10.250472240920951,
        "longitude": 123.76166407469888,
        "elevation_m": 258,
        "distance_from_start_km": 0.6206896551724138
      },
      {
        "latitude": 10.251352781240278,
        "longitude": 123.76211908254206,
        "elevation_m": 254,
        "distance_from_start_km": 0.7241379310344829
      },
      {
        "latitude": 10.251798417971376,
        "longitude": 123.76311017632946,
        "elevation_m": 249,
        "distance_from_start_km": 0.8275862068965518
      },
      {
        "latitude": 10.252372999591294,
        "longitude": 123.76367781902668,
        "elevation_m": 247,
        "distance_from_start_km": 0.9310344827586207
      },
      {
        "latitude": 10.252651686690662,
        "longitude": 123.76405350137476,
        "elevation_m": 254,
        "distance_from_start_km": 1.0344827586206897
      },
      {
        "latitude": 10.252961711048947,
        "longitude": 123.76453981283836,
        "elevation_m": 270,
        "distance_from_start_km": 1.1379310344827587
      },
      {
        "latitude": 10.25330588271508,
        "longitude": 123.76532822454534,
        "elevation_m": 299,
        "distance_from_start_km": 1.2413793103448276
      },
      {
        "latitude": 10.25380661474356,
        "longitude": 123.76594784615955,
        "elevation_m": 337,
        "distance_from_start_km": 1.3448275862068968
      },
      {
        "latitude": 10.254356365213079,
        "longitude": 123.76662281940627,
        "elevation_m": 381,
        "distance_from_start_km": 1.4482758620689657
      },
      {
        "latitude": 10.25481147450178,
        "longitude": 123.76724240016283,
        "elevation_m": 429,
        "distance_from_start_km": 1.5517241379310347
      },
      {
        "latitude": 10.255289911418675,
        "longitude": 123.76785474907727,
        "elevation_m": 473,
        "distance_from_start_km": 1.6551724137931036
      },
      {
        "latitude": 10.255605145630359,
        "longitude": 123.76826863925525,
        "elevation_m": 511,
        "distance_from_start_km": 1.7586206896551724
      },
      {
        "latitude": 10.256321812642817,
        "longitude": 123.76915731120569,
        "elevation_m": 540,
        "distance_from_start_km": 1.8620689655172413
      },
      {
        "latitude": 10.256641665424253,
        "longitude": 123.76988763720156,
        "elevation_m": 556,
        "distance_from_start_km": 1.9655172413793105
      },
      {
        "latitude": 10.25733223712064,
        "longitude": 123.77044982616586,
        "elevation_m": 563,
        "distance_from_start_km": 2.0689655172413794
      },
      {
        "latitude": 10.257199403595912,
        "longitude": 123.77077565883718,
        "elevation_m": 561,
        "distance_from_start_km": 2.1724137931034484
      },
      {
        "latitude": 10.258016438380599,
        "longitude": 123.77188230134749,
        "elevation_m": 556,
        "distance_from_start_km": 2.2758620689655173
      },
      {
        "latitude": 10.258102014780068,
        "longitude": 123.77189306761966,
        "elevation_m": 552,
        "distance_from_start_km": 2.3793103448275867
      },
      {
        "latitude": 10.258804182079508,
        "longitude": 123.77277224707467,
        "elevation_m": 554,
        "distance_from_start_km": 2.4827586206896552
      },
      {
        "latitude": 10.259499477191348,
        "longitude": 123.77318277164143,
        "elevation_m": 566,
        "distance_from_start_km": 2.586206896551724
      },
      {
        "latitude": 10.259426185550009,
        "longitude": 123.77394842918896,
        "elevation_m": 588,
        "distance_from_start_km": 2.6896551724137936
      },
      {
        "latitude": 10.260221423466367,
        "longitude": 123.7746286669668,
        "elevation_m": 621,
        "distance_from_start_km": 2.793103448275862
      },
      {
        "latitude": 10.260518727431771,
        "longitude": 123.77517051522351,
        "elevation_m": 663,
        "distance_from_start_km": 2.8965517241379315
      },
      {
        "latitude": 10.261,
        "longitude": 123.7758,
        "elevation_m": 710,
        "distance_from_start_km": 3
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 30,
      "path_smoothness": "rough",
      "terrain_type": "mixed",
      "scenic_rating": 3,
      "technical_difficulty": 5
    }
  },
  {
    "id": "manunggal-heritage-trail",
    "route_id": "manunggal-heritage-trail",
    "hiking_spot_id": "74",
    "hikingSpotId": "74",
    "route_name": "Manunggal Heritage Trail",
    "difficulty": "Easy",
    "start_coordinates": {
      "latitude": 10.4911,
      "longitude": 123.78
    },
    "end_coordinates": {
      "latitude": 10.4939,
      "longitude": 123.7831
    },
    "distance_km": 2.2,
    "elevation_gain_m": 160,
    "estimated_duration_hr": 1.3,
    "highlights": "Historic site",
    "route_color": "#8D6E63",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.78,
          10.4911
        ],
        [
          123.78071388000097,
          10.491799158523083
        ],
        [
          123.78155000000001,
          10.4925
        ],
        [
          123.7824004947391,
          10.493259663186107
        ],
        [
          123.7831,
          10.4939
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.4925,
        "longitude": 123.78155000000001,
        "name": "Waypoint 1",
        "description": "Historic site",
        "elevation_m": 152
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.4911,
        "longitude": 123.78,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.491799158523083,
        "longitude": 123.78071388000097,
        "elevation_m": 140,
        "distance_from_start_km": 0.125
      },
      {
        "latitude": 10.4925,
        "longitude": 123.78155000000001,
        "elevation_m": 180,
        "distance_from_start_km": 0.25
      },
      {
        "latitude": 10.493259663186107,
        "longitude": 123.7824004947391,
        "elevation_m": 220,
        "distance_from_start_km": 0.375
      },
      {
        "latitude": 10.4939,
        "longitude": 123.7831,
        "elevation_m": 260,
        "distance_from_start_km": 0.5
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 5,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 1
    }
  },
  {
    "id": "manunggal-grass-ridge",
    "route_id": "manunggal-grass-ridge",
    "hiking_spot_id": "74",
    "hikingSpotId": "74",
    "route_name": "Manunggal Grass Ridge",
    "difficulty": "Easy-Moderate",
    "start_coordinates": {
      "latitude": 10.4892,
      "longitude": 123.7775
    },
    "end_coordinates": {
      "latitude": 10.4939,
      "longitude": 123.7831
    },
    "distance_km": 3.4,
    "elevation_gain_m": 250,
    "estimated_duration_hr": 1.8,
    "highlights": "Rolling meadows",
    "route_color": "#689F38",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.7775,
          10.4892
        ],
        [
          123.7783335502948,
          10.489978817962802
        ],
        [
          123.7792135533485,
          10.490468229255386
        ],
        [
          123.77989982340894,
          10.491272511208415
        ],
        [
          123.78073910602244,
          10.491936557327655
        ],
        [
          123.7815744447033,
          10.492610516762502
        ],
        [
          123.78218315147888,
          10.493166812345603
        ],
        [
          123.7831,
          10.4939
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.490468229255386,
        "longitude": 123.7792135533485,
        "name": "Waypoint 1",
        "description": "Rolling meadows",
        "elevation_m": 249
      },
      {
        "latitude": 10.492610516762502,
        "longitude": 123.7815744447033,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 299
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.4892,
        "longitude": 123.7775,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.489978817962802,
        "longitude": 123.7783335502948,
        "elevation_m": 160,
        "distance_from_start_km": 0.11428571428571428
      },
      {
        "latitude": 10.490468229255386,
        "longitude": 123.7792135533485,
        "elevation_m": 161,
        "distance_from_start_km": 0.22857142857142856
      },
      {
        "latitude": 10.491272511208415,
        "longitude": 123.77989982340894,
        "elevation_m": 188,
        "distance_from_start_km": 0.34285714285714286
      },
      {
        "latitude": 10.491936557327655,
        "longitude": 123.78073910602244,
        "elevation_m": 262,
        "distance_from_start_km": 0.45714285714285713
      },
      {
        "latitude": 10.492610516762502,
        "longitude": 123.7815744447033,
        "elevation_m": 289,
        "distance_from_start_km": 0.5714285714285715
      },
      {
        "latitude": 10.493166812345603,
        "longitude": 123.78218315147888,
        "elevation_m": 290,
        "distance_from_start_km": 0.6857142857142857
      },
      {
        "latitude": 10.4939,
        "longitude": 123.7831,
        "elevation_m": 350,
        "distance_from_start_km": 0.8
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 8,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 3,
      "technical_difficulty": 2
    }
  },
  {
    "id": "manunggal-ridge-trail",
    "route_id": "manunggal-ridge-trail",
    "hiking_spot_id": "74",
    "hikingSpotId": "74",
    "route_name": "Manunggal Ridge Trail",
    "difficulty": "Moderate",
    "start_coordinates": {
      "latitude": 10.487,
      "longitude": 123.7752
    },
    "end_coordinates": {
      "latitude": 10.4961,
      "longitude": 123.786
    },
    "distance_km": 4.9,
    "elevation_gain_m": 420,
    "estimated_duration_hr": 2.6,
    "highlights": "Summit forest",
    "route_color": "#FF7043",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.7752,
          10.487
        ],
        [
          123.77605178907544,
          10.487635438740783
        ],
        [
          123.77699063475303,
          10.488356882573568
        ],
        [
          123.77760751028204,
          10.489117976299354
        ],
        [
          123.77851264555045,
          10.489793606580871
        ],
        [
          123.77926341932874,
          10.49042132106779
        ],
        [
          123.7801938656747,
          10.491212346831736
        ],
        [
          123.78097971730422,
          10.491928282926727
        ],
        [
          123.78181283894452,
          10.492632462527627
        ],
        [
          123.78262787924906,
          10.493429248984464
        ],
        [
          123.78355183887679,
          10.493901527613769
        ],
        [
          123.78420423947175,
          10.49481678672155
        ],
        [
          123.78508450946615,
          10.495417478824985
        ],
        [
          123.786,
          10.4961
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.489117976299354,
        "longitude": 123.77760751028204,
        "name": "Waypoint 1",
        "description": "Summit forest",
        "elevation_m": 138
      },
      {
        "latitude": 10.491928282926727,
        "longitude": 123.78097971730422,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 218
      },
      {
        "latitude": 10.493901527613769,
        "longitude": 123.78355183887679,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 283
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.487,
        "longitude": 123.7752,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.487635438740783,
        "longitude": 123.77605178907544,
        "elevation_m": 167,
        "distance_from_start_km": 0.10769230769230771
      },
      {
        "latitude": 10.488356882573568,
        "longitude": 123.77699063475303,
        "elevation_m": 204,
        "distance_from_start_km": 0.21538461538461542
      },
      {
        "latitude": 10.489117976299354,
        "longitude": 123.77760751028204,
        "elevation_m": 207,
        "distance_from_start_km": 0.3230769230769231
      },
      {
        "latitude": 10.489793606580871,
        "longitude": 123.77851264555045,
        "elevation_m": 201,
        "distance_from_start_km": 0.43076923076923085
      },
      {
        "latitude": 10.49042132106779,
        "longitude": 123.77926341932874,
        "elevation_m": 220,
        "distance_from_start_km": 0.5384615384615385
      },
      {
        "latitude": 10.491212346831736,
        "longitude": 123.7801938656747,
        "elevation_m": 274,
        "distance_from_start_km": 0.6461538461538462
      },
      {
        "latitude": 10.491928282926727,
        "longitude": 123.78097971730422,
        "elevation_m": 346,
        "distance_from_start_km": 0.7538461538461538
      },
      {
        "latitude": 10.492632462527627,
        "longitude": 123.78181283894452,
        "elevation_m": 400,
        "distance_from_start_km": 0.8615384615384617
      },
      {
        "latitude": 10.493429248984464,
        "longitude": 123.78262787924906,
        "elevation_m": 419,
        "distance_from_start_km": 0.9692307692307692
      },
      {
        "latitude": 10.493901527613769,
        "longitude": 123.78355183887679,
        "elevation_m": 413,
        "distance_from_start_km": 1.076923076923077
      },
      {
        "latitude": 10.49481678672155,
        "longitude": 123.78420423947175,
        "elevation_m": 416,
        "distance_from_start_km": 1.1846153846153846
      },
      {
        "latitude": 10.495417478824985,
        "longitude": 123.78508450946615,
        "elevation_m": 453,
        "distance_from_start_km": 1.2923076923076924
      },
      {
        "latitude": 10.4961,
        "longitude": 123.786,
        "elevation_m": 520,
        "distance_from_start_km": 1.4000000000000001
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 14,
      "path_smoothness": "smooth",
      "terrain_type": "forest",
      "scenic_rating": 3,
      "technical_difficulty": 3
    }
  },
  {
    "id": "mt-manunggal-traverse",
    "route_id": "mt-manunggal-traverse",
    "hiking_spot_id": "74",
    "hikingSpotId": "74",
    "route_name": "Mt. Manunggal Traverse",
    "difficulty": "Hard",
    "start_coordinates": {
      "latitude": 10.4851,
      "longitude": 123.772
    },
    "end_coordinates": {
      "latitude": 10.498,
      "longitude": 123.7882
    },
    "distance_km": 6.2,
    "elevation_gain_m": 560,
    "estimated_duration_hr": 3.4,
    "highlights": "Forest climb",
    "route_color": "#5D4037",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.772,
          10.4851
        ],
        [
          123.77288937619328,
          10.48568413112645
        ],
        [
          123.77372764047061,
          10.486406842706966
        ],
        [
          123.77450160319549,
          10.487166021197117
        ],
        [
          123.77529015914847,
          10.487889047256658
        ],
        [
          123.7758044389949,
          10.488517130751916
        ],
        [
          123.77695475597186,
          10.488901514040988
        ],
        [
          123.77762900103822,
          10.48980471810524
        ],
        [
          123.77835433382495,
          10.490119001992595
        ],
        [
          123.77933882640833,
          10.4909903981891
        ],
        [
          123.7801,
          10.49155
        ],
        [
          123.78093668071836,
          10.492132257952155
        ],
        [
          123.781666816051,
          10.49272662530995
        ],
        [
          123.78240275033777,
          10.493366730068766
        ],
        [
          123.78306531259611,
          10.494385966781588
        ],
        [
          123.78412898525056,
          10.4950426574957
        ],
        [
          123.7847609548113,
          10.495664091670932
        ],
        [
          123.78556019004421,
          10.496247894499966
        ],
        [
          123.7867514576663,
          10.49671286394003
        ],
        [
          123.78741469856232,
          10.497446015917124
        ],
        [
          123.7882,
          10.498
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.488517130751916,
        "longitude": 123.7758044389949,
        "name": "Waypoint 1",
        "description": "Forest climb",
        "elevation_m": 210
      },
      {
        "latitude": 10.49155,
        "longitude": 123.7801,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 284
      },
      {
        "latitude": 10.4950426574957,
        "longitude": 123.78412898525056,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 172
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.4851,
        "longitude": 123.772,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.48568413112645,
        "longitude": 123.77288937619328,
        "elevation_m": 161,
        "distance_from_start_km": 0.10500000000000001
      },
      {
        "latitude": 10.486406842706966,
        "longitude": 123.77372764047061,
        "elevation_m": 209,
        "distance_from_start_km": 0.21000000000000002
      },
      {
        "latitude": 10.487166021197117,
        "longitude": 123.77450160319549,
        "elevation_m": 237,
        "distance_from_start_km": 0.315
      },
      {
        "latitude": 10.487889047256658,
        "longitude": 123.77529015914847,
        "elevation_m": 245,
        "distance_from_start_km": 0.42000000000000004
      },
      {
        "latitude": 10.488517130751916,
        "longitude": 123.7758044389949,
        "elevation_m": 240,
        "distance_from_start_km": 0.525
      },
      {
        "latitude": 10.488901514040988,
        "longitude": 123.77695475597186,
        "elevation_m": 235,
        "distance_from_start_km": 0.63
      },
      {
        "latitude": 10.48980471810524,
        "longitude": 123.77762900103822,
        "elevation_m": 243,
        "distance_from_start_km": 0.735
      },
      {
        "latitude": 10.490119001992595,
        "longitude": 123.77835433382495,
        "elevation_m": 271,
        "distance_from_start_km": 0.8400000000000001
      },
      {
        "latitude": 10.4909903981891,
        "longitude": 123.77933882640833,
        "elevation_m": 319,
        "distance_from_start_km": 0.9450000000000002
      },
      {
        "latitude": 10.49155,
        "longitude": 123.7801,
        "elevation_m": 380,
        "distance_from_start_km": 1.05
      },
      {
        "latitude": 10.492132257952155,
        "longitude": 123.78093668071836,
        "elevation_m": 441,
        "distance_from_start_km": 1.155
      },
      {
        "latitude": 10.49272662530995,
        "longitude": 123.781666816051,
        "elevation_m": 489,
        "distance_from_start_km": 1.26
      },
      {
        "latitude": 10.493366730068766,
        "longitude": 123.78240275033777,
        "elevation_m": 517,
        "distance_from_start_km": 1.3650000000000002
      },
      {
        "latitude": 10.494385966781588,
        "longitude": 123.78306531259611,
        "elevation_m": 525,
        "distance_from_start_km": 1.47
      },
      {
        "latitude": 10.4950426574957,
        "longitude": 123.78412898525056,
        "elevation_m": 520,
        "distance_from_start_km": 1.5750000000000002
      },
      {
        "latitude": 10.495664091670932,
        "longitude": 123.7847609548113,
        "elevation_m": 515,
        "distance_from_start_km": 1.6800000000000002
      },
      {
        "latitude": 10.496247894499966,
        "longitude": 123.78556019004421,
        "elevation_m": 523,
        "distance_from_start_km": 1.785
      },
      {
        "latitude": 10.49671286394003,
        "longitude": 123.7867514576663,
        "elevation_m": 551,
        "distance_from_start_km": 1.8900000000000003
      },
      {
        "latitude": 10.497446015917124,
        "longitude": 123.78741469856232,
        "elevation_m": 599,
        "distance_from_start_km": 1.995
      },
      {
        "latitude": 10.498,
        "longitude": 123.7882,
        "elevation_m": 660,
        "distance_from_start_km": 2.1
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 21,
      "path_smoothness": "moderate",
      "terrain_type": "mixed",
      "scenic_rating": 3,
      "technical_difficulty": 4
    }
  },
  {
    "id": "mt-manunggal-extreme",
    "route_id": "mt-manunggal-extreme",
    "hiking_spot_id": "74",
    "hikingSpotId": "74",
    "route_name": "Mt. Manunggal Extreme",
    "difficulty": "Very Hard",
    "start_coordinates": {
      "latitude": 10.4832,
      "longitude": 123.77
    },
    "end_coordinates": {
      "latitude": 10.5001,
      "longitude": 123.7905
    },
    "distance_km": 8.1,
    "elevation_gain_m": 720,
    "estimated_duration_hr": 4.8,
    "highlights": "Narrow ridge, long",
    "route_color": "#424242",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.77,
          10.4832
        ],
        [
          123.77073518557874,
          10.483704378043141
        ],
        [
          123.77134214754122,
          10.484372367137878
        ],
        [
          123.77187249002012,
          10.484697621181393
        ],
        [
          123.7728924485059,
          10.485569094605653
        ],
        [
          123.77361586428226,
          10.486041576818272
        ],
        [
          123.7736599266627,
          10.486668624195723
        ],
        [
          123.77459381835081,
          10.4873093636603
        ],
        [
          123.77501378257843,
          10.48717894074654
        ],
        [
          123.77598730961444,
          10.48814678400666
        ],
        [
          123.77648116432789,
          10.488731547471717
        ],
        [
          123.7772194549485,
          10.48901648217153
        ],
        [
          123.77799286755952,
          10.489708377428789
        ],
        [
          123.77840463962795,
          10.490108790594348
        ],
        [
          123.77937455529992,
          10.49089116120746
        ],
        [
          123.77990703669451,
          10.491412895222856
        ],
        [
          123.7805914256897,
          10.491953958548484
        ],
        [
          123.78124327241012,
          10.492464007811474
        ],
        [
          123.78185441712112,
          10.492858192995056
        ],
        [
          123.7824682574313,
          10.493569541741063
        ],
        [
          123.78308817151223,
          10.494280846961315
        ],
        [
          123.78372859436476,
          10.494506861039097
        ],
        [
          123.78421916668637,
          10.495068211231004
        ],
        [
          123.78547709369022,
          10.495895671385556
        ],
        [
          123.78582177859417,
          10.496289195102904
        ],
        [
          123.78666117692453,
          10.496836206722639
        ],
        [
          123.78715593421394,
          10.497651214560753
        ],
        [
          123.78804239809119,
          10.497919209607229
        ],
        [
          123.78845586892895,
          10.498434835911828
        ],
        [
          123.78912937633866,
          10.499150530134328
        ],
        [
          123.78986835793839,
          10.499544638591663
        ],
        [
          123.7905,
          10.5001
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.48717894074654,
        "longitude": 123.77501378257843,
        "name": "Waypoint 1",
        "description": "Narrow ridge",
        "elevation_m": 163
      },
      {
        "latitude": 10.491953958548484,
        "longitude": 123.7805914256897,
        "name": "Waypoint 2",
        "description": " long",
        "elevation_m": 173
      },
      {
        "latitude": 10.496289195102904,
        "longitude": 123.78582177859417,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 135
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.4832,
        "longitude": 123.77,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.483704378043141,
        "longitude": 123.77073518557874,
        "elevation_m": 152,
        "distance_from_start_km": 0.1032258064516129
      },
      {
        "latitude": 10.484372367137878,
        "longitude": 123.77134214754122,
        "elevation_m": 199,
        "distance_from_start_km": 0.2064516129032258
      },
      {
        "latitude": 10.484697621181393,
        "longitude": 123.77187249002012,
        "elevation_m": 237,
        "distance_from_start_km": 0.3096774193548387
      },
      {
        "latitude": 10.485569094605653,
        "longitude": 123.7728924485059,
        "elevation_m": 265,
        "distance_from_start_km": 0.4129032258064516
      },
      {
        "latitude": 10.486041576818272,
        "longitude": 123.77361586428226,
        "elevation_m": 281,
        "distance_from_start_km": 0.5161290322580645
      },
      {
        "latitude": 10.486668624195723,
        "longitude": 123.7736599266627,
        "elevation_m": 286,
        "distance_from_start_km": 0.6193548387096774
      },
      {
        "latitude": 10.4873093636603,
        "longitude": 123.77459381835081,
        "elevation_m": 284,
        "distance_from_start_km": 0.7225806451612904
      },
      {
        "latitude": 10.48717894074654,
        "longitude": 123.77501378257843,
        "elevation_m": 279,
        "distance_from_start_km": 0.8258064516129032
      },
      {
        "latitude": 10.48814678400666,
        "longitude": 123.77598730961444,
        "elevation_m": 274,
        "distance_from_start_km": 0.9290322580645163
      },
      {
        "latitude": 10.488731547471717,
        "longitude": 123.77648116432789,
        "elevation_m": 275,
        "distance_from_start_km": 1.032258064516129
      },
      {
        "latitude": 10.48901648217153,
        "longitude": 123.7772194549485,
        "elevation_m": 286,
        "distance_from_start_km": 1.135483870967742
      },
      {
        "latitude": 10.489708377428789,
        "longitude": 123.77799286755952,
        "elevation_m": 308,
        "distance_from_start_km": 1.238709677419355
      },
      {
        "latitude": 10.490108790594348,
        "longitude": 123.77840463962795,
        "elevation_m": 341,
        "distance_from_start_km": 1.3419354838709678
      },
      {
        "latitude": 10.49089116120746,
        "longitude": 123.77937455529992,
        "elevation_m": 384,
        "distance_from_start_km": 1.4451612903225808
      },
      {
        "latitude": 10.491412895222856,
        "longitude": 123.77990703669451,
        "elevation_m": 434,
        "distance_from_start_km": 1.5483870967741937
      },
      {
        "latitude": 10.491953958548484,
        "longitude": 123.7805914256897,
        "elevation_m": 486,
        "distance_from_start_km": 1.6516129032258065
      },
      {
        "latitude": 10.492464007811474,
        "longitude": 123.78124327241012,
        "elevation_m": 536,
        "distance_from_start_km": 1.7548387096774194
      },
      {
        "latitude": 10.492858192995056,
        "longitude": 123.78185441712112,
        "elevation_m": 579,
        "distance_from_start_km": 1.8580645161290326
      },
      {
        "latitude": 10.493569541741063,
        "longitude": 123.7824682574313,
        "elevation_m": 612,
        "distance_from_start_km": 1.9612903225806453
      },
      {
        "latitude": 10.494280846961315,
        "longitude": 123.78308817151223,
        "elevation_m": 634,
        "distance_from_start_km": 2.064516129032258
      },
      {
        "latitude": 10.494506861039097,
        "longitude": 123.78372859436476,
        "elevation_m": 645,
        "distance_from_start_km": 2.1677419354838707
      },
      {
        "latitude": 10.495068211231004,
        "longitude": 123.78421916668637,
        "elevation_m": 646,
        "distance_from_start_km": 2.270967741935484
      },
      {
        "latitude": 10.495895671385556,
        "longitude": 123.78547709369022,
        "elevation_m": 641,
        "distance_from_start_km": 2.374193548387097
      },
      {
        "latitude": 10.496289195102904,
        "longitude": 123.78582177859417,
        "elevation_m": 636,
        "distance_from_start_km": 2.47741935483871
      },
      {
        "latitude": 10.496836206722639,
        "longitude": 123.78666117692453,
        "elevation_m": 634,
        "distance_from_start_km": 2.5806451612903225
      },
      {
        "latitude": 10.497651214560753,
        "longitude": 123.78715593421394,
        "elevation_m": 639,
        "distance_from_start_km": 2.6838709677419357
      },
      {
        "latitude": 10.497919209607229,
        "longitude": 123.78804239809119,
        "elevation_m": 655,
        "distance_from_start_km": 2.7870967741935484
      },
      {
        "latitude": 10.498434835911828,
        "longitude": 123.78845586892895,
        "elevation_m": 683,
        "distance_from_start_km": 2.8903225806451616
      },
      {
        "latitude": 10.499150530134328,
        "longitude": 123.78912937633866,
        "elevation_m": 721,
        "distance_from_start_km": 2.9935483870967743
      },
      {
        "latitude": 10.499544638591663,
        "longitude": 123.78986835793839,
        "elevation_m": 768,
        "distance_from_start_km": 3.0967741935483875
      },
      {
        "latitude": 10.5001,
        "longitude": 123.7905,
        "elevation_m": 820,
        "distance_from_start_km": 3.2
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 32,
      "path_smoothness": "rough",
      "terrain_type": "ridge",
      "scenic_rating": 5,
      "technical_difficulty": 5
    }
  },
  {
    "id": "mago-border-trail",
    "route_id": "mago-border-trail",
    "hiking_spot_id": "75",
    "hikingSpotId": "75",
    "route_name": "Mago Border Trail",
    "difficulty": "Easy",
    "start_coordinates": {
      "latitude": 10.6311,
      "longitude": 123.9309
    },
    "end_coordinates": {
      "latitude": 10.633,
      "longitude": 123.933
    },
    "distance_km": 2.3,
    "elevation_gain_m": 160,
    "estimated_duration_hr": 1.3,
    "highlights": "Tri-boundary marker",
    "route_color": "#4CAF50",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.9309,
          10.6311
        ],
        [
          123.93137078401902,
          10.631495913050205
        ],
        [
          123.93195,
          10.63205
        ],
        [
          123.93237732883715,
          10.6324575738826
        ],
        [
          123.933,
          10.633
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.63205,
        "longitude": 123.93195,
        "name": "Waypoint 1",
        "description": "Tri-boundary marker",
        "elevation_m": 287
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.6311,
        "longitude": 123.9309,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.631495913050205,
        "longitude": 123.93137078401902,
        "elevation_m": 140,
        "distance_from_start_km": 0.125
      },
      {
        "latitude": 10.63205,
        "longitude": 123.93195,
        "elevation_m": 180,
        "distance_from_start_km": 0.25
      },
      {
        "latitude": 10.6324575738826,
        "longitude": 123.93237732883715,
        "elevation_m": 220,
        "distance_from_start_km": 0.375
      },
      {
        "latitude": 10.633,
        "longitude": 123.933,
        "elevation_m": 260,
        "distance_from_start_km": 0.5
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 5,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 1
    }
  },
  {
    "id": "mago-ridge-walk",
    "route_id": "mago-ridge-walk",
    "hiking_spot_id": "75",
    "hikingSpotId": "75",
    "route_name": "Mago Ridge Walk",
    "difficulty": "Easy-Moderate",
    "start_coordinates": {
      "latitude": 10.629,
      "longitude": 123.9287
    },
    "end_coordinates": {
      "latitude": 10.633,
      "longitude": 123.933
    },
    "distance_km": 3.4,
    "elevation_gain_m": 250,
    "estimated_duration_hr": 1.9,
    "highlights": "Rolling hills and farmland",
    "route_color": "#81C784",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.9287,
          10.629
        ],
        [
          123.92930307832265,
          10.629596168297132
        ],
        [
          123.92987779284148,
          10.62999891291215
        ],
        [
          123.93058175768488,
          10.630754827048156
        ],
        [
          123.93115260366267,
          10.63132587190525
        ],
        [
          123.9318632920985,
          10.631906149833247
        ],
        [
          123.93234691070833,
          10.632380845591323
        ],
        [
          123.933,
          10.633
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.62999891291215,
        "longitude": 123.92987779284148,
        "name": "Waypoint 1",
        "description": "Rolling hills and farmland",
        "elevation_m": 224
      },
      {
        "latitude": 10.631906149833247,
        "longitude": 123.9318632920985,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 196
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.629,
        "longitude": 123.9287,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.629596168297132,
        "longitude": 123.92930307832265,
        "elevation_m": 160,
        "distance_from_start_km": 0.11428571428571428
      },
      {
        "latitude": 10.62999891291215,
        "longitude": 123.92987779284148,
        "elevation_m": 161,
        "distance_from_start_km": 0.22857142857142856
      },
      {
        "latitude": 10.630754827048156,
        "longitude": 123.93058175768488,
        "elevation_m": 188,
        "distance_from_start_km": 0.34285714285714286
      },
      {
        "latitude": 10.63132587190525,
        "longitude": 123.93115260366267,
        "elevation_m": 262,
        "distance_from_start_km": 0.45714285714285713
      },
      {
        "latitude": 10.631906149833247,
        "longitude": 123.9318632920985,
        "elevation_m": 289,
        "distance_from_start_km": 0.5714285714285715
      },
      {
        "latitude": 10.632380845591323,
        "longitude": 123.93234691070833,
        "elevation_m": 290,
        "distance_from_start_km": 0.6857142857142857
      },
      {
        "latitude": 10.633,
        "longitude": 123.933,
        "elevation_m": 350,
        "distance_from_start_km": 0.8
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 8,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 2
    }
  },
  {
    "id": "mago-summit-loop",
    "route_id": "mago-summit-loop",
    "hiking_spot_id": "75",
    "hikingSpotId": "75",
    "route_name": "Mago Summit Loop",
    "difficulty": "Moderate",
    "start_coordinates": {
      "latitude": 10.6269,
      "longitude": 123.9265
    },
    "end_coordinates": {
      "latitude": 10.6352,
      "longitude": 123.9353
    },
    "distance_km": 4.9,
    "elevation_gain_m": 420,
    "estimated_duration_hr": 2.6,
    "highlights": "360° summit views",
    "route_color": "#FF9800",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.9265,
          10.6269
        ],
        [
          123.92714372107946,
          10.62745433329931
        ],
        [
          123.92779822234127,
          10.628019574408269
        ],
        [
          123.92838653557932,
          10.628858688453857
        ],
        [
          123.929058218267,
          10.62927686579116
        ],
        [
          123.9299611531066,
          10.630215252628538
        ],
        [
          123.93052142748282,
          10.63070920252368
        ],
        [
          123.93124155113698,
          10.631356723992067
        ],
        [
          123.93192688253117,
          10.63192675739419
        ],
        [
          123.93265818188837,
          10.632488271485444
        ],
        [
          123.93339654927685,
          10.633134578414568
        ],
        [
          123.93393192527053,
          10.633949254403289
        ],
        [
          123.9345689773989,
          10.6346510743561
        ],
        [
          123.9353,
          10.6352
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.628858688453857,
        "longitude": 123.92838653557932,
        "name": "Waypoint 1",
        "description": "360° summit views",
        "elevation_m": 264
      },
      {
        "latitude": 10.631356723992067,
        "longitude": 123.93124155113698,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 271
      },
      {
        "latitude": 10.633134578414568,
        "longitude": 123.93339654927685,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 113
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.6269,
        "longitude": 123.9265,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.62745433329931,
        "longitude": 123.92714372107946,
        "elevation_m": 167,
        "distance_from_start_km": 0.10769230769230771
      },
      {
        "latitude": 10.628019574408269,
        "longitude": 123.92779822234127,
        "elevation_m": 204,
        "distance_from_start_km": 0.21538461538461542
      },
      {
        "latitude": 10.628858688453857,
        "longitude": 123.92838653557932,
        "elevation_m": 207,
        "distance_from_start_km": 0.3230769230769231
      },
      {
        "latitude": 10.62927686579116,
        "longitude": 123.929058218267,
        "elevation_m": 201,
        "distance_from_start_km": 0.43076923076923085
      },
      {
        "latitude": 10.630215252628538,
        "longitude": 123.9299611531066,
        "elevation_m": 220,
        "distance_from_start_km": 0.5384615384615385
      },
      {
        "latitude": 10.63070920252368,
        "longitude": 123.93052142748282,
        "elevation_m": 274,
        "distance_from_start_km": 0.6461538461538462
      },
      {
        "latitude": 10.631356723992067,
        "longitude": 123.93124155113698,
        "elevation_m": 346,
        "distance_from_start_km": 0.7538461538461538
      },
      {
        "latitude": 10.63192675739419,
        "longitude": 123.93192688253117,
        "elevation_m": 400,
        "distance_from_start_km": 0.8615384615384617
      },
      {
        "latitude": 10.632488271485444,
        "longitude": 123.93265818188837,
        "elevation_m": 419,
        "distance_from_start_km": 0.9692307692307692
      },
      {
        "latitude": 10.633134578414568,
        "longitude": 123.93339654927685,
        "elevation_m": 413,
        "distance_from_start_km": 1.076923076923077
      },
      {
        "latitude": 10.633949254403289,
        "longitude": 123.93393192527053,
        "elevation_m": 416,
        "distance_from_start_km": 1.1846153846153846
      },
      {
        "latitude": 10.6346510743561,
        "longitude": 123.9345689773989,
        "elevation_m": 453,
        "distance_from_start_km": 1.2923076923076924
      },
      {
        "latitude": 10.6352,
        "longitude": 123.9353,
        "elevation_m": 520,
        "distance_from_start_km": 1.4000000000000001
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 14,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 4,
      "technical_difficulty": 3
    }
  },
  {
    "id": "mago-long-traverse",
    "route_id": "mago-long-traverse",
    "hiking_spot_id": "75",
    "hikingSpotId": "75",
    "route_name": "Mago Long Traverse",
    "difficulty": "Hard",
    "start_coordinates": {
      "latitude": 10.6249,
      "longitude": 123.9242
    },
    "end_coordinates": {
      "latitude": 10.6374,
      "longitude": 123.9375
    },
    "distance_km": 6.6,
    "elevation_gain_m": 580,
    "estimated_duration_hr": 3.6,
    "highlights": "Open ridges, rural views",
    "route_color": "#F44336",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.9242,
          10.6249
        ],
        [
          123.92483424194423,
          10.625512664340839
        ],
        [
          123.9255530921115,
          10.626001719851418
        ],
        [
          123.92598925037716,
          10.626452016499627
        ],
        [
          123.92644651400362,
          10.627007112235054
        ],
        [
          123.92694104619213,
          10.627964389191947
        ],
        [
          123.92796923402881,
          10.628100864404527
        ],
        [
          123.92839424620209,
          10.628738494132914
        ],
        [
          123.92897857735987,
          10.629613426880024
        ],
        [
          123.9296058443708,
          10.630048788505333
        ],
        [
          123.93020743764225,
          10.630549865933585
        ],
        [
          123.93084999999999,
          10.63115
        ],
        [
          123.93145888115852,
          10.631737607361192
        ],
        [
          123.93212712616412,
          10.632376845263085
        ],
        [
          123.9328051500771,
          10.632645133262542
        ],
        [
          123.93335125490715,
          10.633661533271532
        ],
        [
          123.93370629391103,
          10.633861235322088
        ],
        [
          123.93440179476157,
          10.634523873944078
        ],
        [
          123.93509105430243,
          10.634867722725934
        ],
        [
          123.9355198768441,
          10.635868468187786
        ],
        [
          123.93641135986127,
          10.636280126620115
        ],
        [
          123.93692046500709,
          10.636780558977057
        ],
        [
          123.9375,
          10.6374
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.627964389191947,
        "longitude": 123.92694104619213,
        "name": "Waypoint 1",
        "description": "Open ridges",
        "elevation_m": 266
      },
      {
        "latitude": 10.63115,
        "longitude": 123.93084999999999,
        "name": "Waypoint 2",
        "description": " rural views",
        "elevation_m": 171
      },
      {
        "latitude": 10.634523873944078,
        "longitude": 123.93440179476157,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 127
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.6249,
        "longitude": 123.9242,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.625512664340839,
        "longitude": 123.92483424194423,
        "elevation_m": 158,
        "distance_from_start_km": 0.10454545454545455
      },
      {
        "latitude": 10.626001719851418,
        "longitude": 123.9255530921115,
        "elevation_m": 205,
        "distance_from_start_km": 0.2090909090909091
      },
      {
        "latitude": 10.626452016499627,
        "longitude": 123.92598925037716,
        "elevation_m": 237,
        "distance_from_start_km": 0.31363636363636366
      },
      {
        "latitude": 10.627007112235054,
        "longitude": 123.92644651400362,
        "elevation_m": 249,
        "distance_from_start_km": 0.4181818181818182
      },
      {
        "latitude": 10.627964389191947,
        "longitude": 123.92694104619213,
        "elevation_m": 248,
        "distance_from_start_km": 0.5227272727272728
      },
      {
        "latitude": 10.628100864404527,
        "longitude": 123.92796923402881,
        "elevation_m": 242,
        "distance_from_start_km": 0.6272727272727273
      },
      {
        "latitude": 10.628738494132914,
        "longitude": 123.92839424620209,
        "elevation_m": 241,
        "distance_from_start_km": 0.7318181818181819
      },
      {
        "latitude": 10.629613426880024,
        "longitude": 123.92897857735987,
        "elevation_m": 253,
        "distance_from_start_km": 0.8363636363636364
      },
      {
        "latitude": 10.630048788505333,
        "longitude": 123.9296058443708,
        "elevation_m": 285,
        "distance_from_start_km": 0.940909090909091
      },
      {
        "latitude": 10.630549865933585,
        "longitude": 123.93020743764225,
        "elevation_m": 332,
        "distance_from_start_km": 1.0454545454545456
      },
      {
        "latitude": 10.63115,
        "longitude": 123.93084999999999,
        "elevation_m": 390,
        "distance_from_start_km": 1.1500000000000001
      },
      {
        "latitude": 10.631737607361192,
        "longitude": 123.93145888115852,
        "elevation_m": 448,
        "distance_from_start_km": 1.2545454545454546
      },
      {
        "latitude": 10.632376845263085,
        "longitude": 123.93212712616412,
        "elevation_m": 495,
        "distance_from_start_km": 1.3590909090909093
      },
      {
        "latitude": 10.632645133262542,
        "longitude": 123.9328051500771,
        "elevation_m": 527,
        "distance_from_start_km": 1.4636363636363638
      },
      {
        "latitude": 10.633661533271532,
        "longitude": 123.93335125490715,
        "elevation_m": 539,
        "distance_from_start_km": 1.5681818181818181
      },
      {
        "latitude": 10.633861235322088,
        "longitude": 123.93370629391103,
        "elevation_m": 538,
        "distance_from_start_km": 1.6727272727272728
      },
      {
        "latitude": 10.634523873944078,
        "longitude": 123.93440179476157,
        "elevation_m": 532,
        "distance_from_start_km": 1.7772727272727273
      },
      {
        "latitude": 10.634867722725934,
        "longitude": 123.93509105430243,
        "elevation_m": 531,
        "distance_from_start_km": 1.881818181818182
      },
      {
        "latitude": 10.635868468187786,
        "longitude": 123.9355198768441,
        "elevation_m": 543,
        "distance_from_start_km": 1.9863636363636363
      },
      {
        "latitude": 10.636280126620115,
        "longitude": 123.93641135986127,
        "elevation_m": 575,
        "distance_from_start_km": 2.0909090909090913
      },
      {
        "latitude": 10.636780558977057,
        "longitude": 123.93692046500709,
        "elevation_m": 622,
        "distance_from_start_km": 2.1954545454545458
      },
      {
        "latitude": 10.6374,
        "longitude": 123.9375,
        "elevation_m": 680,
        "distance_from_start_km": 2.3000000000000003
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 23,
      "path_smoothness": "moderate",
      "terrain_type": "ridge",
      "scenic_rating": 3,
      "technical_difficulty": 4
    }
  },
  {
    "id": "mago-extreme-ridge",
    "route_id": "mago-extreme-ridge",
    "hiking_spot_id": "75",
    "hikingSpotId": "75",
    "route_name": "Mago Extreme Ridge",
    "difficulty": "Very Hard",
    "start_coordinates": {
      "latitude": 10.6227,
      "longitude": 123.922
    },
    "end_coordinates": {
      "latitude": 10.6395,
      "longitude": 123.9398
    },
    "distance_km": 7.8,
    "elevation_gain_m": 730,
    "estimated_duration_hr": 4.8,
    "highlights": "Steep grass + clay trails",
    "route_color": "#9C27B0",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.922,
          10.6227
        ],
        [
          123.92256850124141,
          10.623212096895715
        ],
        [
          123.92314603262373,
          10.623753091809181
        ],
        [
          123.9238657834986,
          10.624298271510098
        ],
        [
          123.92430121651955,
          10.625161235729966
        ],
        [
          123.92466571419041,
          10.625757836462125
        ],
        [
          123.92576474038158,
          10.625899982531875
        ],
        [
          123.92593875084373,
          10.626580052329006
        ],
        [
          123.92677438800148,
          10.62745995640904
        ],
        [
          123.92741553087168,
          10.62777472822074
        ],
        [
          123.92788924394692,
          10.628279389380378
        ],
        [
          123.92835282808889,
          10.628878663852815
        ],
        [
          123.92898972476372,
          10.62948297782301
        ],
        [
          123.92978730356106,
          10.629884381291276
        ],
        [
          123.93025719938775,
          10.63055233317926
        ],
        [
          123.93090000000001,
          10.6311
        ],
        [
          123.93141980821405,
          10.631616587398609
        ],
        [
          123.93212275900567,
          10.632382473859947
        ],
        [
          123.93249718713469,
          10.632675512537908
        ],
        [
          123.93318557232196,
          10.63363407639864
        ],
        [
          123.93411836723187,
          10.634241744233822
        ],
        [
          123.93432090159288,
          10.634594899158435
        ],
        [
          123.93535252382941,
          10.63479302850003
        ],
        [
          123.93601978647908,
          10.635768257023994
        ],
        [
          123.9365130686077,
          10.636081638491394
        ],
        [
          123.93658853683134,
          10.63682874754971
        ],
        [
          123.93736383678615,
          10.63742666260304
        ],
        [
          123.93785021057671,
          10.638035822819667
        ],
        [
          123.93854274246067,
          10.638430724992224
        ],
        [
          123.93926248154537,
          10.63892721683657
        ],
        [
          123.9398,
          10.6395
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.626580052329006,
        "longitude": 123.92593875084373,
        "name": "Waypoint 1",
        "description": "Steep grass + clay trails",
        "elevation_m": 231
      },
      {
        "latitude": 10.6311,
        "longitude": 123.93090000000001,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 224
      },
      {
        "latitude": 10.635768257023994,
        "longitude": 123.93601978647908,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 130
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.6227,
        "longitude": 123.922,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.623212096895715,
        "longitude": 123.92256850124141,
        "elevation_m": 154,
        "distance_from_start_km": 0.10333333333333333
      },
      {
        "latitude": 10.623753091809181,
        "longitude": 123.92314603262373,
        "elevation_m": 203,
        "distance_from_start_km": 0.20666666666666667
      },
      {
        "latitude": 10.624298271510098,
        "longitude": 123.9238657834986,
        "elevation_m": 242,
        "distance_from_start_km": 0.31000000000000005
      },
      {
        "latitude": 10.625161235729966,
        "longitude": 123.92430121651955,
        "elevation_m": 270,
        "distance_from_start_km": 0.41333333333333333
      },
      {
        "latitude": 10.625757836462125,
        "longitude": 123.92466571419041,
        "elevation_m": 285,
        "distance_from_start_km": 0.5166666666666666
      },
      {
        "latitude": 10.625899982531875,
        "longitude": 123.92576474038158,
        "elevation_m": 289,
        "distance_from_start_km": 0.6200000000000001
      },
      {
        "latitude": 10.626580052329006,
        "longitude": 123.92593875084373,
        "elevation_m": 286,
        "distance_from_start_km": 0.7233333333333334
      },
      {
        "latitude": 10.62745995640904,
        "longitude": 123.92677438800148,
        "elevation_m": 279,
        "distance_from_start_km": 0.8266666666666667
      },
      {
        "latitude": 10.62777472822074,
        "longitude": 123.92741553087168,
        "elevation_m": 276,
        "distance_from_start_km": 0.9299999999999999
      },
      {
        "latitude": 10.628279389380378,
        "longitude": 123.92788924394692,
        "elevation_m": 280,
        "distance_from_start_km": 1.0333333333333332
      },
      {
        "latitude": 10.628878663852815,
        "longitude": 123.92835282808889,
        "elevation_m": 295,
        "distance_from_start_km": 1.1366666666666665
      },
      {
        "latitude": 10.62948297782301,
        "longitude": 123.92898972476372,
        "elevation_m": 323,
        "distance_from_start_km": 1.2400000000000002
      },
      {
        "latitude": 10.629884381291276,
        "longitude": 123.92978730356106,
        "elevation_m": 362,
        "distance_from_start_km": 1.3433333333333335
      },
      {
        "latitude": 10.63055233317926,
        "longitude": 123.93025719938775,
        "elevation_m": 411,
        "distance_from_start_km": 1.4466666666666668
      },
      {
        "latitude": 10.6311,
        "longitude": 123.93090000000001,
        "elevation_m": 465,
        "distance_from_start_km": 1.55
      },
      {
        "latitude": 10.631616587398609,
        "longitude": 123.93141980821405,
        "elevation_m": 519,
        "distance_from_start_km": 1.6533333333333333
      },
      {
        "latitude": 10.632382473859947,
        "longitude": 123.93212275900567,
        "elevation_m": 568,
        "distance_from_start_km": 1.7566666666666668
      },
      {
        "latitude": 10.632675512537908,
        "longitude": 123.93249718713469,
        "elevation_m": 607,
        "distance_from_start_km": 1.8599999999999999
      },
      {
        "latitude": 10.63363407639864,
        "longitude": 123.93318557232196,
        "elevation_m": 635,
        "distance_from_start_km": 1.9633333333333334
      },
      {
        "latitude": 10.634241744233822,
        "longitude": 123.93411836723187,
        "elevation_m": 650,
        "distance_from_start_km": 2.0666666666666664
      },
      {
        "latitude": 10.634594899158435,
        "longitude": 123.93432090159288,
        "elevation_m": 654,
        "distance_from_start_km": 2.17
      },
      {
        "latitude": 10.63479302850003,
        "longitude": 123.93535252382941,
        "elevation_m": 651,
        "distance_from_start_km": 2.273333333333333
      },
      {
        "latitude": 10.635768257023994,
        "longitude": 123.93601978647908,
        "elevation_m": 644,
        "distance_from_start_km": 2.376666666666667
      },
      {
        "latitude": 10.636081638491394,
        "longitude": 123.9365130686077,
        "elevation_m": 641,
        "distance_from_start_km": 2.4800000000000004
      },
      {
        "latitude": 10.63682874754971,
        "longitude": 123.93658853683134,
        "elevation_m": 645,
        "distance_from_start_km": 2.583333333333334
      },
      {
        "latitude": 10.63742666260304,
        "longitude": 123.93736383678615,
        "elevation_m": 660,
        "distance_from_start_km": 2.686666666666667
      },
      {
        "latitude": 10.638035822819667,
        "longitude": 123.93785021057671,
        "elevation_m": 688,
        "distance_from_start_km": 2.7900000000000005
      },
      {
        "latitude": 10.638430724992224,
        "longitude": 123.93854274246067,
        "elevation_m": 727,
        "distance_from_start_km": 2.8933333333333335
      },
      {
        "latitude": 10.63892721683657,
        "longitude": 123.93926248154537,
        "elevation_m": 776,
        "distance_from_start_km": 2.996666666666667
      },
      {
        "latitude": 10.6395,
        "longitude": 123.9398,
        "elevation_m": 830,
        "distance_from_start_km": 3.1
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 31,
      "path_smoothness": "rough",
      "terrain_type": "mixed",
      "scenic_rating": 3,
      "technical_difficulty": 5
    }
  },
  {
    "id": "casino-easy-path",
    "route_id": "casino-easy-path",
    "hiking_spot_id": "83",
    "hikingSpotId": "83",
    "route_name": "Casino Easy Path",
    "difficulty": "Easy",
    "start_coordinates": {
      "latitude": 9.8094,
      "longitude": 123.4681
    },
    "end_coordinates": {
      "latitude": 9.8112,
      "longitude": 123.4702
    },
    "distance_km": 2,
    "elevation_gain_m": 160,
    "estimated_duration_hr": 1.1,
    "highlights": "Rolling hills, jagged peaks",
    "route_color": "#4CAF50",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.4681,
          9.8094
        ],
        [
          123.46862956101124,
          9.809766631223239
        ],
        [
          123.46915000000001,
          9.8103
        ],
        [
          123.46973040758166,
          9.810694871849389
        ],
        [
          123.4702,
          9.8112
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 9.8103,
        "longitude": 123.46915000000001,
        "name": "Waypoint 1",
        "description": "Rolling hills",
        "elevation_m": 282
      }
    ],
    "elevation_profile": [
      {
        "latitude": 9.8094,
        "longitude": 123.4681,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 9.809766631223239,
        "longitude": 123.46862956101124,
        "elevation_m": 140,
        "distance_from_start_km": 0.125
      },
      {
        "latitude": 9.8103,
        "longitude": 123.46915000000001,
        "elevation_m": 180,
        "distance_from_start_km": 0.25
      },
      {
        "latitude": 9.810694871849389,
        "longitude": 123.46973040758166,
        "elevation_m": 220,
        "distance_from_start_km": 0.375
      },
      {
        "latitude": 9.8112,
        "longitude": 123.4702,
        "elevation_m": 260,
        "distance_from_start_km": 0.5
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 5,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 3,
      "technical_difficulty": 1
    }
  },
  {
    "id": "casino-ridge-walk",
    "route_id": "casino-ridge-walk",
    "hiking_spot_id": "83",
    "hikingSpotId": "83",
    "route_name": "Casino Ridge Walk",
    "difficulty": "Easy-Moderate",
    "start_coordinates": {
      "latitude": 9.8073,
      "longitude": 123.4659
    },
    "end_coordinates": {
      "latitude": 9.8112,
      "longitude": 123.4702
    },
    "distance_km": 3.1,
    "elevation_gain_m": 230,
    "estimated_duration_hr": 1.6,
    "highlights": "Panoramic views",
    "route_color": "#81C784",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.4659,
          9.8073
        ],
        [
          123.46653678671261,
          9.807995446266585
        ],
        [
          123.46745608569468,
          9.808569843408698
        ],
        [
          123.46805,
          9.809249999999999
        ],
        [
          123.46878229514348,
          9.809935801144325
        ],
        [
          123.46945531271741,
          9.81047378181853
        ],
        [
          123.4702,
          9.8112
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 9.808569843408698,
        "longitude": 123.46745608569468,
        "name": "Waypoint 1",
        "description": "Panoramic views",
        "elevation_m": 232
      },
      {
        "latitude": 9.809935801144325,
        "longitude": 123.46878229514348,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 186
      }
    ],
    "elevation_profile": [
      {
        "latitude": 9.8073,
        "longitude": 123.4659,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 9.807995446266585,
        "longitude": 123.46653678671261,
        "elevation_m": 158,
        "distance_from_start_km": 0.11666666666666665
      },
      {
        "latitude": 9.808569843408698,
        "longitude": 123.46745608569468,
        "elevation_m": 157,
        "distance_from_start_km": 0.2333333333333333
      },
      {
        "latitude": 9.809249999999999,
        "longitude": 123.46805,
        "elevation_m": 215,
        "distance_from_start_km": 0.35000000000000003
      },
      {
        "latitude": 9.809935801144325,
        "longitude": 123.46878229514348,
        "elevation_m": 273,
        "distance_from_start_km": 0.4666666666666666
      },
      {
        "latitude": 9.81047378181853,
        "longitude": 123.46945531271741,
        "elevation_m": 272,
        "distance_from_start_km": 0.5833333333333334
      },
      {
        "latitude": 9.8112,
        "longitude": 123.4702,
        "elevation_m": 330,
        "distance_from_start_km": 0.7000000000000001
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 7,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 3,
      "technical_difficulty": 2
    }
  },
  {
    "id": "casino-peak-circuit",
    "route_id": "casino-peak-circuit",
    "hiking_spot_id": "83",
    "hikingSpotId": "83",
    "route_name": "Casino Peak Circuit",
    "difficulty": "Moderate",
    "start_coordinates": {
      "latitude": 9.8052,
      "longitude": 123.4637
    },
    "end_coordinates": {
      "latitude": 9.8136,
      "longitude": 123.4724
    },
    "distance_km": 4.7,
    "elevation_gain_m": 410,
    "estimated_duration_hr": 2.5,
    "highlights": "Sharp limestone hills",
    "route_color": "#FF9800",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.4637,
          9.8052
        ],
        [
          123.46429245784645,
          9.805813839204465
        ],
        [
          123.46510581103428,
          9.806424858400554
        ],
        [
          123.4658148525686,
          9.807004351264801
        ],
        [
          123.46641017540169,
          9.80779197037558
        ],
        [
          123.46716573667666,
          9.808460927537913
        ],
        [
          123.46768171414557,
          9.809124707591316
        ],
        [
          123.46835539878388,
          9.809767973922272
        ],
        [
          123.46910174935617,
          9.810340316469611
        ],
        [
          123.4697977818179,
          9.81093836262856
        ],
        [
          123.47019395941082,
          9.811494216700066
        ],
        [
          123.47102509362936,
          9.812325417538124
        ],
        [
          123.47165579229576,
          9.813002282846151
        ],
        [
          123.4724,
          9.8136
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 9.807004351264801,
        "longitude": 123.4658148525686,
        "name": "Waypoint 1",
        "description": "Sharp limestone hills",
        "elevation_m": 164
      },
      {
        "latitude": 9.809767973922272,
        "longitude": 123.46835539878388,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 277
      },
      {
        "latitude": 9.811494216700066,
        "longitude": 123.47019395941082,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 228
      }
    ],
    "elevation_profile": [
      {
        "latitude": 9.8052,
        "longitude": 123.4637,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 9.805813839204465,
        "longitude": 123.46429245784645,
        "elevation_m": 165,
        "distance_from_start_km": 0.10769230769230771
      },
      {
        "latitude": 9.806424858400554,
        "longitude": 123.46510581103428,
        "elevation_m": 201,
        "distance_from_start_km": 0.21538461538461542
      },
      {
        "latitude": 9.807004351264801,
        "longitude": 123.4658148525686,
        "elevation_m": 204,
        "distance_from_start_km": 0.3230769230769231
      },
      {
        "latitude": 9.80779197037558,
        "longitude": 123.46641017540169,
        "elevation_m": 199,
        "distance_from_start_km": 0.43076923076923085
      },
      {
        "latitude": 9.808460927537913,
        "longitude": 123.46716573667666,
        "elevation_m": 217,
        "distance_from_start_km": 0.5384615384615385
      },
      {
        "latitude": 9.809124707591316,
        "longitude": 123.46768171414557,
        "elevation_m": 270,
        "distance_from_start_km": 0.6461538461538462
      },
      {
        "latitude": 9.809767973922272,
        "longitude": 123.46835539878388,
        "elevation_m": 340,
        "distance_from_start_km": 0.7538461538461538
      },
      {
        "latitude": 9.810340316469611,
        "longitude": 123.46910174935617,
        "elevation_m": 393,
        "distance_from_start_km": 0.8615384615384617
      },
      {
        "latitude": 9.81093836262856,
        "longitude": 123.4697977818179,
        "elevation_m": 411,
        "distance_from_start_km": 0.9692307692307692
      },
      {
        "latitude": 9.811494216700066,
        "longitude": 123.47019395941082,
        "elevation_m": 406,
        "distance_from_start_km": 1.076923076923077
      },
      {
        "latitude": 9.812325417538124,
        "longitude": 123.47102509362936,
        "elevation_m": 409,
        "distance_from_start_km": 1.1846153846153846
      },
      {
        "latitude": 9.813002282846151,
        "longitude": 123.47165579229576,
        "elevation_m": 445,
        "distance_from_start_km": 1.2923076923076924
      },
      {
        "latitude": 9.8136,
        "longitude": 123.4724,
        "elevation_m": 510,
        "distance_from_start_km": 1.4000000000000001
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 14,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 3
    }
  },
  {
    "id": "casino-osmena-traverse",
    "route_id": "casino-osmena-traverse",
    "hiking_spot_id": "83",
    "hikingSpotId": "83",
    "route_name": "Casino to Osmeña Traverse",
    "difficulty": "Hard",
    "start_coordinates": {
      "latitude": 9.8031,
      "longitude": 123.4615
    },
    "end_coordinates": {
      "latitude": 9.8157,
      "longitude": 123.4747
    },
    "distance_km": 6.3,
    "elevation_gain_m": 580,
    "estimated_duration_hr": 3.4,
    "highlights": "Connects to Osmeña",
    "route_color": "#F44336",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.4615,
          9.8031
        ],
        [
          123.46206594577451,
          9.80377526635
        ],
        [
          123.46278080491685,
          9.804194667790453
        ],
        [
          123.46322909004704,
          9.804689991220242
        ],
        [
          123.46396976869183,
          9.805243476459315
        ],
        [
          123.46471180868474,
          9.80608371110038
        ],
        [
          123.46498693452472,
          9.806939348366388
        ],
        [
          123.46583013366018,
          9.807393812821543
        ],
        [
          123.46650739978648,
          9.808051050462241
        ],
        [
          123.46709300680108,
          9.80840085757324
        ],
        [
          123.46779426870788,
          9.809087165321015
        ],
        [
          123.4684024919436,
          9.809665087693928
        ],
        [
          123.46905386095159,
          9.810427954174134
        ],
        [
          123.46964670490145,
          9.810832276642111
        ],
        [
          123.47006698614585,
          9.811259541389358
        ],
        [
          123.47121336081644,
          9.811991682713389
        ],
        [
          123.4715570893691,
          9.81274986786147
        ],
        [
          123.47211446727356,
          9.813090531565116
        ],
        [
          123.47277946158549,
          9.81378672373762
        ],
        [
          123.47348039148575,
          9.814663566530765
        ],
        [
          123.47408765535873,
          9.81505488585347
        ],
        [
          123.4747,
          9.8157
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 9.80608371110038,
        "longitude": 123.46471180868474,
        "name": "Waypoint 1",
        "description": "Connects to Osmeña",
        "elevation_m": 218
      },
      {
        "latitude": 9.809665087693928,
        "longitude": 123.4684024919436,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 197
      },
      {
        "latitude": 9.81274986786147,
        "longitude": 123.4715570893691,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 240
      }
    ],
    "elevation_profile": [
      {
        "latitude": 9.8031,
        "longitude": 123.4615,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 9.80377526635,
        "longitude": 123.46206594577451,
        "elevation_m": 160,
        "distance_from_start_km": 0.10476190476190475
      },
      {
        "latitude": 9.804194667790453,
        "longitude": 123.46278080491685,
        "elevation_m": 209,
        "distance_from_start_km": 0.2095238095238095
      },
      {
        "latitude": 9.804689991220242,
        "longitude": 123.46322909004704,
        "elevation_m": 239,
        "distance_from_start_km": 0.3142857142857143
      },
      {
        "latitude": 9.805243476459315,
        "longitude": 123.46396976869183,
        "elevation_m": 250,
        "distance_from_start_km": 0.419047619047619
      },
      {
        "latitude": 9.80608371110038,
        "longitude": 123.46471180868474,
        "elevation_m": 247,
        "distance_from_start_km": 0.5238095238095238
      },
      {
        "latitude": 9.806939348366388,
        "longitude": 123.46498693452472,
        "elevation_m": 241,
        "distance_from_start_km": 0.6285714285714286
      },
      {
        "latitude": 9.807393812821543,
        "longitude": 123.46583013366018,
        "elevation_m": 243,
        "distance_from_start_km": 0.7333333333333334
      },
      {
        "latitude": 9.808051050462241,
        "longitude": 123.46650739978648,
        "elevation_m": 263,
        "distance_from_start_km": 0.838095238095238
      },
      {
        "latitude": 9.80840085757324,
        "longitude": 123.46709300680108,
        "elevation_m": 303,
        "distance_from_start_km": 0.942857142857143
      },
      {
        "latitude": 9.809087165321015,
        "longitude": 123.46779426870788,
        "elevation_m": 359,
        "distance_from_start_km": 1.0476190476190477
      },
      {
        "latitude": 9.809665087693928,
        "longitude": 123.4684024919436,
        "elevation_m": 421,
        "distance_from_start_km": 1.1523809523809525
      },
      {
        "latitude": 9.810427954174134,
        "longitude": 123.46905386095159,
        "elevation_m": 477,
        "distance_from_start_km": 1.2571428571428571
      },
      {
        "latitude": 9.810832276642111,
        "longitude": 123.46964670490145,
        "elevation_m": 517,
        "distance_from_start_km": 1.3619047619047622
      },
      {
        "latitude": 9.811259541389358,
        "longitude": 123.47006698614585,
        "elevation_m": 537,
        "distance_from_start_km": 1.4666666666666668
      },
      {
        "latitude": 9.811991682713389,
        "longitude": 123.47121336081644,
        "elevation_m": 539,
        "distance_from_start_km": 1.5714285714285716
      },
      {
        "latitude": 9.81274986786147,
        "longitude": 123.4715570893691,
        "elevation_m": 533,
        "distance_from_start_km": 1.676190476190476
      },
      {
        "latitude": 9.813090531565116,
        "longitude": 123.47211446727356,
        "elevation_m": 530,
        "distance_from_start_km": 1.780952380952381
      },
      {
        "latitude": 9.81378672373762,
        "longitude": 123.47277946158549,
        "elevation_m": 541,
        "distance_from_start_km": 1.885714285714286
      },
      {
        "latitude": 9.814663566530765,
        "longitude": 123.47348039148575,
        "elevation_m": 571,
        "distance_from_start_km": 1.9904761904761905
      },
      {
        "latitude": 9.81505488585347,
        "longitude": 123.47408765535873,
        "elevation_m": 620,
        "distance_from_start_km": 2.0952380952380953
      },
      {
        "latitude": 9.8157,
        "longitude": 123.4747,
        "elevation_m": 680,
        "distance_from_start_km": 2.2
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 22,
      "path_smoothness": "moderate",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 4
    }
  },
  {
    "id": "casino-extreme-ridge",
    "route_id": "casino-extreme-ridge",
    "hiking_spot_id": "83",
    "hikingSpotId": "83",
    "route_name": "Casino Extreme Ridge",
    "difficulty": "Very Hard",
    "start_coordinates": {
      "latitude": 9.801,
      "longitude": 123.4594
    },
    "end_coordinates": {
      "latitude": 9.8178,
      "longitude": 123.4769
    },
    "distance_km": 7.9,
    "elevation_gain_m": 750,
    "estimated_duration_hr": 4.7,
    "highlights": "Steep rocky cliffs",
    "route_color": "#9C27B0",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.4594,
          9.801
        ],
        [
          123.46004056801847,
          9.801513699954972
        ],
        [
          123.46040611973055,
          9.802080948218984
        ],
        [
          123.46093999010539,
          9.802889633849565
        ],
        [
          123.46156240126481,
          9.803328902052739
        ],
        [
          123.4621151751951,
          9.804045535077824
        ],
        [
          123.46312389378717,
          9.804589124167272
        ],
        [
          123.46373519947055,
          9.804809834722105
        ],
        [
          123.4642590849775,
          9.805411276631418
        ],
        [
          123.46501111911684,
          9.806355505957592
        ],
        [
          123.46524705217456,
          9.806915743430897
        ],
        [
          123.46565292441765,
          9.807111192007133
        ],
        [
          123.46661942438084,
          9.807900508783622
        ],
        [
          123.46712038453495,
          9.808127810998604
        ],
        [
          123.46754447589682,
          9.80881611163169
        ],
        [
          123.46815000000001,
          9.8094
        ],
        [
          123.46874445555947,
          9.810010278981608
        ],
        [
          123.46922749563439,
          9.810555216138287
        ],
        [
          123.46966797581119,
          9.811061465385126
        ],
        [
          123.47033759352334,
          9.811745693605168
        ],
        [
          123.47113336731556,
          9.81218667776922
        ],
        [
          123.47194341039425,
          9.812586702366794
        ],
        [
          123.4719349841727,
          9.81359844163173
        ],
        [
          123.47258476840491,
          9.81384998834511
        ],
        [
          123.4732142190955,
          9.814538336822041
        ],
        [
          123.47426495162593,
          9.814734095373526
        ],
        [
          123.47481811358377,
          9.815512430882682
        ],
        [
          123.4752133900996,
          9.816191194897236
        ],
        [
          123.47571227105863,
          9.816562564854571
        ],
        [
          123.47624148835251,
          9.817255002519323
        ],
        [
          123.4769,
          9.8178
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 9.804809834722105,
        "longitude": 123.46373519947055,
        "name": "Waypoint 1",
        "description": "Steep rocky cliffs",
        "elevation_m": 180
      },
      {
        "latitude": 9.8094,
        "longitude": 123.46815000000001,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 112
      },
      {
        "latitude": 9.81384998834511,
        "longitude": 123.47258476840491,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 258
      }
    ],
    "elevation_profile": [
      {
        "latitude": 9.801,
        "longitude": 123.4594,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 9.801513699954972,
        "longitude": 123.46004056801847,
        "elevation_m": 156,
        "distance_from_start_km": 0.10333333333333333
      },
      {
        "latitude": 9.802080948218984,
        "longitude": 123.46040611973055,
        "elevation_m": 206,
        "distance_from_start_km": 0.20666666666666667
      },
      {
        "latitude": 9.802889633849565,
        "longitude": 123.46093999010539,
        "elevation_m": 246,
        "distance_from_start_km": 0.31000000000000005
      },
      {
        "latitude": 9.803328902052739,
        "longitude": 123.46156240126481,
        "elevation_m": 275,
        "distance_from_start_km": 0.41333333333333333
      },
      {
        "latitude": 9.804045535077824,
        "longitude": 123.4621151751951,
        "elevation_m": 290,
        "distance_from_start_km": 0.5166666666666666
      },
      {
        "latitude": 9.804589124167272,
        "longitude": 123.46312389378717,
        "elevation_m": 294,
        "distance_from_start_km": 0.6200000000000001
      },
      {
        "latitude": 9.804809834722105,
        "longitude": 123.46373519947055,
        "elevation_m": 291,
        "distance_from_start_km": 0.7233333333333334
      },
      {
        "latitude": 9.805411276631418,
        "longitude": 123.4642590849775,
        "elevation_m": 284,
        "distance_from_start_km": 0.8266666666666667
      },
      {
        "latitude": 9.806355505957592,
        "longitude": 123.46501111911684,
        "elevation_m": 281,
        "distance_from_start_km": 0.9299999999999999
      },
      {
        "latitude": 9.806915743430897,
        "longitude": 123.46524705217456,
        "elevation_m": 285,
        "distance_from_start_km": 1.0333333333333332
      },
      {
        "latitude": 9.807111192007133,
        "longitude": 123.46565292441765,
        "elevation_m": 300,
        "distance_from_start_km": 1.1366666666666665
      },
      {
        "latitude": 9.807900508783622,
        "longitude": 123.46661942438084,
        "elevation_m": 329,
        "distance_from_start_km": 1.2400000000000002
      },
      {
        "latitude": 9.808127810998604,
        "longitude": 123.46712038453495,
        "elevation_m": 369,
        "distance_from_start_km": 1.3433333333333335
      },
      {
        "latitude": 9.80881611163169,
        "longitude": 123.46754447589682,
        "elevation_m": 419,
        "distance_from_start_km": 1.4466666666666668
      },
      {
        "latitude": 9.8094,
        "longitude": 123.46815000000001,
        "elevation_m": 475,
        "distance_from_start_km": 1.55
      },
      {
        "latitude": 9.810010278981608,
        "longitude": 123.46874445555947,
        "elevation_m": 531,
        "distance_from_start_km": 1.6533333333333333
      },
      {
        "latitude": 9.810555216138287,
        "longitude": 123.46922749563439,
        "elevation_m": 581,
        "distance_from_start_km": 1.7566666666666668
      },
      {
        "latitude": 9.811061465385126,
        "longitude": 123.46966797581119,
        "elevation_m": 621,
        "distance_from_start_km": 1.8599999999999999
      },
      {
        "latitude": 9.811745693605168,
        "longitude": 123.47033759352334,
        "elevation_m": 650,
        "distance_from_start_km": 1.9633333333333334
      },
      {
        "latitude": 9.81218667776922,
        "longitude": 123.47113336731556,
        "elevation_m": 665,
        "distance_from_start_km": 2.0666666666666664
      },
      {
        "latitude": 9.812586702366794,
        "longitude": 123.47194341039425,
        "elevation_m": 669,
        "distance_from_start_km": 2.17
      },
      {
        "latitude": 9.81359844163173,
        "longitude": 123.4719349841727,
        "elevation_m": 666,
        "distance_from_start_km": 2.273333333333333
      },
      {
        "latitude": 9.81384998834511,
        "longitude": 123.47258476840491,
        "elevation_m": 659,
        "distance_from_start_km": 2.376666666666667
      },
      {
        "latitude": 9.814538336822041,
        "longitude": 123.4732142190955,
        "elevation_m": 656,
        "distance_from_start_km": 2.4800000000000004
      },
      {
        "latitude": 9.814734095373526,
        "longitude": 123.47426495162593,
        "elevation_m": 660,
        "distance_from_start_km": 2.583333333333334
      },
      {
        "latitude": 9.815512430882682,
        "longitude": 123.47481811358377,
        "elevation_m": 675,
        "distance_from_start_km": 2.686666666666667
      },
      {
        "latitude": 9.816191194897236,
        "longitude": 123.4752133900996,
        "elevation_m": 704,
        "distance_from_start_km": 2.7900000000000005
      },
      {
        "latitude": 9.816562564854571,
        "longitude": 123.47571227105863,
        "elevation_m": 744,
        "distance_from_start_km": 2.8933333333333335
      },
      {
        "latitude": 9.817255002519323,
        "longitude": 123.47624148835251,
        "elevation_m": 794,
        "distance_from_start_km": 2.996666666666667
      },
      {
        "latitude": 9.8178,
        "longitude": 123.4769,
        "elevation_m": 850,
        "distance_from_start_km": 3.1
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 31,
      "path_smoothness": "rough",
      "terrain_type": "rocky",
      "scenic_rating": 5,
      "technical_difficulty": 5
    }
  },
  {
    "id": "budlaan-riverside-path",
    "route_id": "budlaan-riverside-path",
    "hiking_spot_id": "84",
    "hikingSpotId": "84",
    "route_name": "Budlaan Riverside Path",
    "difficulty": "Easy",
    "start_coordinates": {
      "latitude": 10.3722,
      "longitude": 123.8588
    },
    "end_coordinates": {
      "latitude": 10.374,
      "longitude": 123.861
    },
    "distance_km": 1.9,
    "elevation_gain_m": 130,
    "estimated_duration_hr": 1,
    "highlights": "River trek, bamboo trees",
    "route_color": "#4CAF50",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8588,
          10.3722
        ],
        [
          123.85927041919813,
          10.372662503598498
        ],
        [
          123.85990000000001,
          10.3731
        ],
        [
          123.86050590993827,
          10.373555538599373
        ],
        [
          123.861,
          10.374
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.3731,
        "longitude": 123.85990000000001,
        "name": "Waypoint 1",
        "description": "River trek",
        "elevation_m": 210
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.3722,
        "longitude": 123.8588,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.372662503598498,
        "longitude": 123.85927041919813,
        "elevation_m": 133,
        "distance_from_start_km": 0.125
      },
      {
        "latitude": 10.3731,
        "longitude": 123.85990000000001,
        "elevation_m": 165,
        "distance_from_start_km": 0.25
      },
      {
        "latitude": 10.373555538599373,
        "longitude": 123.86050590993827,
        "elevation_m": 198,
        "distance_from_start_km": 0.375
      },
      {
        "latitude": 10.374,
        "longitude": 123.861,
        "elevation_m": 230,
        "distance_from_start_km": 0.5
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 5,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 1
    }
  },
  {
    "id": "budlaan-forest-trail",
    "route_id": "budlaan-forest-trail",
    "hiking_spot_id": "84",
    "hikingSpotId": "84",
    "route_name": "Budlaan Forest Trail",
    "difficulty": "Easy-Moderate",
    "start_coordinates": {
      "latitude": 10.3701,
      "longitude": 123.8567
    },
    "end_coordinates": {
      "latitude": 10.374,
      "longitude": 123.861
    },
    "distance_km": 3,
    "elevation_gain_m": 210,
    "estimated_duration_hr": 1.6,
    "highlights": "Forested paths",
    "route_color": "#81C784",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8567,
          10.3701
        ],
        [
          123.85743270152912,
          10.370814217785622
        ],
        [
          123.85813970537126,
          10.371506681171965
        ],
        [
          123.85885,
          10.372050000000002
        ],
        [
          123.8595382563144,
          10.372659880348758
        ],
        [
          123.86026680614762,
          10.373245177952981
        ],
        [
          123.861,
          10.374
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.371506681171965,
        "longitude": 123.85813970537126,
        "name": "Waypoint 1",
        "description": "Forested paths",
        "elevation_m": 279
      },
      {
        "latitude": 10.372659880348758,
        "longitude": 123.8595382563144,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 231
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.3701,
        "longitude": 123.8567,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.370814217785622,
        "longitude": 123.85743270152912,
        "elevation_m": 153,
        "distance_from_start_km": 0.11666666666666665
      },
      {
        "latitude": 10.371506681171965,
        "longitude": 123.85813970537126,
        "elevation_m": 152,
        "distance_from_start_km": 0.2333333333333333
      },
      {
        "latitude": 10.372050000000002,
        "longitude": 123.85885,
        "elevation_m": 205,
        "distance_from_start_km": 0.35000000000000003
      },
      {
        "latitude": 10.372659880348758,
        "longitude": 123.8595382563144,
        "elevation_m": 258,
        "distance_from_start_km": 0.4666666666666666
      },
      {
        "latitude": 10.373245177952981,
        "longitude": 123.86026680614762,
        "elevation_m": 257,
        "distance_from_start_km": 0.5833333333333334
      },
      {
        "latitude": 10.374,
        "longitude": 123.861,
        "elevation_m": 310,
        "distance_from_start_km": 0.7000000000000001
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 7,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 4,
      "technical_difficulty": 2
    }
  },
  {
    "id": "budlaan-falls-loop",
    "route_id": "budlaan-falls-loop",
    "hiking_spot_id": "84",
    "hikingSpotId": "84",
    "route_name": "Budlaan Falls Loop",
    "difficulty": "Moderate",
    "start_coordinates": {
      "latitude": 10.3679,
      "longitude": 123.8545
    },
    "end_coordinates": {
      "latitude": 10.3764,
      "longitude": 123.8631
    },
    "distance_km": 4.5,
    "elevation_gain_m": 380,
    "estimated_duration_hr": 2.3,
    "highlights": "Waterfall basin",
    "route_color": "#FF9800",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8545,
          10.3679
        ],
        [
          123.85526431582197,
          10.368640393872157
        ],
        [
          123.85580103255536,
          10.369433539567487
        ],
        [
          123.85669705792255,
          10.370090254181932
        ],
        [
          123.85725750601542,
          10.3705722196945
        ],
        [
          123.85805215482989,
          10.371491001493045
        ],
        [
          123.8588,
          10.372150000000001
        ],
        [
          123.8595412255754,
          10.372805292356707
        ],
        [
          123.86037247805217,
          10.373481535721153
        ],
        [
          123.86095347084452,
          10.374284853321603
        ],
        [
          123.86153554812427,
          10.37510380673503
        ],
        [
          123.86235030307857,
          10.375786422798969
        ],
        [
          123.8631,
          10.3764
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.370090254181932,
        "longitude": 123.85669705792255,
        "name": "Waypoint 1",
        "description": "Waterfall basin",
        "elevation_m": 231
      },
      {
        "latitude": 10.372150000000001,
        "longitude": 123.8588,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 221
      },
      {
        "latitude": 10.374284853321603,
        "longitude": 123.86095347084452,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 107
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.3679,
        "longitude": 123.8545,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.368640393872157,
        "longitude": 123.85526431582197,
        "elevation_m": 165,
        "distance_from_start_km": 0.10833333333333334
      },
      {
        "latitude": 10.369433539567487,
        "longitude": 123.85580103255536,
        "elevation_m": 196,
        "distance_from_start_km": 0.21666666666666667
      },
      {
        "latitude": 10.370090254181932,
        "longitude": 123.85669705792255,
        "elevation_m": 195,
        "distance_from_start_km": 0.325
      },
      {
        "latitude": 10.3705722196945,
        "longitude": 123.85725750601542,
        "elevation_m": 194,
        "distance_from_start_km": 0.43333333333333335
      },
      {
        "latitude": 10.371491001493045,
        "longitude": 123.85805215482989,
        "elevation_m": 225,
        "distance_from_start_km": 0.5416666666666667
      },
      {
        "latitude": 10.372150000000001,
        "longitude": 123.8588,
        "elevation_m": 290,
        "distance_from_start_km": 0.65
      },
      {
        "latitude": 10.372805292356707,
        "longitude": 123.8595412255754,
        "elevation_m": 355,
        "distance_from_start_km": 0.7583333333333334
      },
      {
        "latitude": 10.373481535721153,
        "longitude": 123.86037247805217,
        "elevation_m": 386,
        "distance_from_start_km": 0.8666666666666667
      },
      {
        "latitude": 10.374284853321603,
        "longitude": 123.86095347084452,
        "elevation_m": 385,
        "distance_from_start_km": 0.9750000000000001
      },
      {
        "latitude": 10.37510380673503,
        "longitude": 123.86153554812427,
        "elevation_m": 384,
        "distance_from_start_km": 1.0833333333333335
      },
      {
        "latitude": 10.375786422798969,
        "longitude": 123.86235030307857,
        "elevation_m": 415,
        "distance_from_start_km": 1.1916666666666667
      },
      {
        "latitude": 10.3764,
        "longitude": 123.8631,
        "elevation_m": 480,
        "distance_from_start_km": 1.3
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 13,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 3
    }
  },
  {
    "id": "budlaan-kabang-traverse",
    "route_id": "budlaan-kabang-traverse",
    "hiking_spot_id": "84",
    "hikingSpotId": "84",
    "route_name": "Budlaan to Kabang Traverse",
    "difficulty": "Hard",
    "start_coordinates": {
      "latitude": 10.3658,
      "longitude": 123.8523
    },
    "end_coordinates": {
      "latitude": 10.3785,
      "longitude": 123.8653
    },
    "distance_km": 6.1,
    "elevation_gain_m": 540,
    "estimated_duration_hr": 3.2,
    "highlights": "Canyon + river crossing",
    "route_color": "#F44336",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8523,
          10.3658
        ],
        [
          123.85291448935214,
          10.366377777801752
        ],
        [
          123.85346560547335,
          10.366946888529794
        ],
        [
          123.85437302910277,
          10.367726885836033
        ],
        [
          123.85487885938493,
          10.368369060138129
        ],
        [
          123.8554914843011,
          10.368774100028475
        ],
        [
          123.85626231866152,
          10.36935476739796
        ],
        [
          123.85695001191463,
          10.370062817458939
        ],
        [
          123.85745337868977,
          10.371008157009985
        ],
        [
          123.85815771982656,
          10.371584164668974
        ],
        [
          123.8588,
          10.372150000000001
        ],
        [
          123.85947291204626,
          10.37275349387506
        ],
        [
          123.8599482244372,
          10.373257897161482
        ],
        [
          123.86065541037723,
          10.37396810672104
        ],
        [
          123.86156392824954,
          10.374954296450252
        ],
        [
          123.86225899172302,
          10.375025680082846
        ],
        [
          123.86289839183871,
          10.37606725829876
        ],
        [
          123.86325139752017,
          10.37658747784935
        ],
        [
          123.86403234901462,
          10.377333703532434
        ],
        [
          123.86469145442058,
          10.377835097280858
        ],
        [
          123.8653,
          10.3785
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.368774100028475,
        "longitude": 123.8554914843011,
        "name": "Waypoint 1",
        "description": "Canyon + river crossing",
        "elevation_m": 204
      },
      {
        "latitude": 10.372150000000001,
        "longitude": 123.8588,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 193
      },
      {
        "latitude": 10.375025680082846,
        "longitude": 123.86225899172302,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 243
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.3658,
        "longitude": 123.8523,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.366377777801752,
        "longitude": 123.85291448935214,
        "elevation_m": 159,
        "distance_from_start_km": 0.10500000000000001
      },
      {
        "latitude": 10.366946888529794,
        "longitude": 123.85346560547335,
        "elevation_m": 205,
        "distance_from_start_km": 0.21000000000000002
      },
      {
        "latitude": 10.367726885836033,
        "longitude": 123.85437302910277,
        "elevation_m": 232,
        "distance_from_start_km": 0.315
      },
      {
        "latitude": 10.368369060138129,
        "longitude": 123.85487885938493,
        "elevation_m": 240,
        "distance_from_start_km": 0.42000000000000004
      },
      {
        "latitude": 10.368774100028475,
        "longitude": 123.8554914843011,
        "elevation_m": 235,
        "distance_from_start_km": 0.525
      },
      {
        "latitude": 10.36935476739796,
        "longitude": 123.85626231866152,
        "elevation_m": 230,
        "distance_from_start_km": 0.63
      },
      {
        "latitude": 10.370062817458939,
        "longitude": 123.85695001191463,
        "elevation_m": 238,
        "distance_from_start_km": 0.735
      },
      {
        "latitude": 10.371008157009985,
        "longitude": 123.85745337868977,
        "elevation_m": 265,
        "distance_from_start_km": 0.8400000000000001
      },
      {
        "latitude": 10.371584164668974,
        "longitude": 123.85815771982656,
        "elevation_m": 311,
        "distance_from_start_km": 0.9450000000000002
      },
      {
        "latitude": 10.372150000000001,
        "longitude": 123.8588,
        "elevation_m": 370,
        "distance_from_start_km": 1.05
      },
      {
        "latitude": 10.37275349387506,
        "longitude": 123.85947291204626,
        "elevation_m": 429,
        "distance_from_start_km": 1.155
      },
      {
        "latitude": 10.373257897161482,
        "longitude": 123.8599482244372,
        "elevation_m": 475,
        "distance_from_start_km": 1.26
      },
      {
        "latitude": 10.37396810672104,
        "longitude": 123.86065541037723,
        "elevation_m": 502,
        "distance_from_start_km": 1.3650000000000002
      },
      {
        "latitude": 10.374954296450252,
        "longitude": 123.86156392824954,
        "elevation_m": 510,
        "distance_from_start_km": 1.47
      },
      {
        "latitude": 10.375025680082846,
        "longitude": 123.86225899172302,
        "elevation_m": 505,
        "distance_from_start_km": 1.5750000000000002
      },
      {
        "latitude": 10.37606725829876,
        "longitude": 123.86289839183871,
        "elevation_m": 500,
        "distance_from_start_km": 1.6800000000000002
      },
      {
        "latitude": 10.37658747784935,
        "longitude": 123.86325139752017,
        "elevation_m": 508,
        "distance_from_start_km": 1.785
      },
      {
        "latitude": 10.377333703532434,
        "longitude": 123.86403234901462,
        "elevation_m": 535,
        "distance_from_start_km": 1.8900000000000003
      },
      {
        "latitude": 10.377835097280858,
        "longitude": 123.86469145442058,
        "elevation_m": 581,
        "distance_from_start_km": 1.995
      },
      {
        "latitude": 10.3785,
        "longitude": 123.8653,
        "elevation_m": 640,
        "distance_from_start_km": 2.1
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 21,
      "path_smoothness": "moderate",
      "terrain_type": "mixed",
      "scenic_rating": 4,
      "technical_difficulty": 4
    }
  },
  {
    "id": "budlaan-extreme-ascent",
    "route_id": "budlaan-extreme-ascent",
    "hiking_spot_id": "84",
    "hikingSpotId": "84",
    "route_name": "Budlaan Extreme Ascent",
    "difficulty": "Very Hard",
    "start_coordinates": {
      "latitude": 10.3637,
      "longitude": 123.8501
    },
    "end_coordinates": {
      "latitude": 10.3807,
      "longitude": 123.8676
    },
    "distance_km": 7.6,
    "elevation_gain_m": 700,
    "estimated_duration_hr": 4.5,
    "highlights": "Steep rock scrambling",
    "route_color": "#9C27B0",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8501,
          10.3637
        ],
        [
          123.85073151009041,
          10.364297597338178
        ],
        [
          123.8512875258075,
          10.364942905182325
        ],
        [
          123.8518030978621,
          10.365393677280577
        ],
        [
          123.85265531057809,
          10.366118062127276
        ],
        [
          123.8531091501468,
          10.366869228280269
        ],
        [
          123.85379859275835,
          10.36704344719567
        ],
        [
          123.85418396627952,
          10.367585999163948
        ],
        [
          123.85524097021217,
          10.368760798578823
        ],
        [
          123.85556435218805,
          10.368720583612635
        ],
        [
          123.85628196728621,
          10.36928743543183
        ],
        [
          123.85681416173647,
          10.370193302333758
        ],
        [
          123.85749852641527,
          10.37086757755697
        ],
        [
          123.85795991620918,
          10.371421873949929
        ],
        [
          123.85851800830018,
          10.37191160586764
        ],
        [
          123.85915390094019,
          10.372513876520475
        ],
        [
          123.85969971224037,
          10.373051707437801
        ],
        [
          123.86048405318742,
          10.373547314551574
        ],
        [
          123.86072311121418,
          10.374056396420011
        ],
        [
          123.86140105455398,
          10.374576867732959
        ],
        [
          123.86196300517736,
          10.375406928711232
        ],
        [
          123.86314219046002,
          10.375805038568135
        ],
        [
          123.86308843698427,
          10.376320417960109
        ],
        [
          123.863835535948,
          10.377226929618082
        ],
        [
          123.86488113106914,
          10.377633722356094
        ],
        [
          123.86517304926859,
          10.37860787542445
        ],
        [
          123.86566816810873,
          10.378799249204409
        ],
        [
          123.86647663871805,
          10.379636290753576
        ],
        [
          123.86691715744726,
          10.380128699899668
        ],
        [
          123.8676,
          10.3807
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.367585999163948,
        "longitude": 123.85418396627952,
        "name": "Waypoint 1",
        "description": "Steep rock scrambling",
        "elevation_m": 210
      },
      {
        "latitude": 10.372513876520475,
        "longitude": 123.85915390094019,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 188
      },
      {
        "latitude": 10.376320417960109,
        "longitude": 123.86308843698427,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 139
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.3637,
        "longitude": 123.8501,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.364297597338178,
        "longitude": 123.85073151009041,
        "elevation_m": 154,
        "distance_from_start_km": 0.10344827586206898
      },
      {
        "latitude": 10.364942905182325,
        "longitude": 123.8512875258075,
        "elevation_m": 202,
        "distance_from_start_km": 0.20689655172413796
      },
      {
        "latitude": 10.365393677280577,
        "longitude": 123.8518030978621,
        "elevation_m": 240,
        "distance_from_start_km": 0.3103448275862069
      },
      {
        "latitude": 10.366118062127276,
        "longitude": 123.85265531057809,
        "elevation_m": 266,
        "distance_from_start_km": 0.4137931034482759
      },
      {
        "latitude": 10.366869228280269,
        "longitude": 123.8531091501468,
        "elevation_m": 279,
        "distance_from_start_km": 0.5172413793103449
      },
      {
        "latitude": 10.36704344719567,
        "longitude": 123.85379859275835,
        "elevation_m": 281,
        "distance_from_start_km": 0.6206896551724138
      },
      {
        "latitude": 10.367585999163948,
        "longitude": 123.85418396627952,
        "elevation_m": 277,
        "distance_from_start_km": 0.7241379310344829
      },
      {
        "latitude": 10.368760798578823,
        "longitude": 123.85524097021217,
        "elevation_m": 271,
        "distance_from_start_km": 0.8275862068965518
      },
      {
        "latitude": 10.368720583612635,
        "longitude": 123.85556435218805,
        "elevation_m": 269,
        "distance_from_start_km": 0.9310344827586207
      },
      {
        "latitude": 10.36928743543183,
        "longitude": 123.85628196728621,
        "elevation_m": 276,
        "distance_from_start_km": 1.0344827586206897
      },
      {
        "latitude": 10.370193302333758,
        "longitude": 123.85681416173647,
        "elevation_m": 296,
        "distance_from_start_km": 1.1379310344827587
      },
      {
        "latitude": 10.37086757755697,
        "longitude": 123.85749852641527,
        "elevation_m": 328,
        "distance_from_start_km": 1.2413793103448276
      },
      {
        "latitude": 10.371421873949929,
        "longitude": 123.85795991620918,
        "elevation_m": 371,
        "distance_from_start_km": 1.3448275862068968
      },
      {
        "latitude": 10.37191160586764,
        "longitude": 123.85851800830018,
        "elevation_m": 423,
        "distance_from_start_km": 1.4482758620689657
      },
      {
        "latitude": 10.372513876520475,
        "longitude": 123.85915390094019,
        "elevation_m": 477,
        "distance_from_start_km": 1.5517241379310347
      },
      {
        "latitude": 10.373051707437801,
        "longitude": 123.85969971224037,
        "elevation_m": 529,
        "distance_from_start_km": 1.6551724137931036
      },
      {
        "latitude": 10.373547314551574,
        "longitude": 123.86048405318742,
        "elevation_m": 572,
        "distance_from_start_km": 1.7586206896551724
      },
      {
        "latitude": 10.374056396420011,
        "longitude": 123.86072311121418,
        "elevation_m": 604,
        "distance_from_start_km": 1.8620689655172413
      },
      {
        "latitude": 10.374576867732959,
        "longitude": 123.86140105455398,
        "elevation_m": 624,
        "distance_from_start_km": 1.9655172413793105
      },
      {
        "latitude": 10.375406928711232,
        "longitude": 123.86196300517736,
        "elevation_m": 631,
        "distance_from_start_km": 2.0689655172413794
      },
      {
        "latitude": 10.375805038568135,
        "longitude": 123.86314219046002,
        "elevation_m": 629,
        "distance_from_start_km": 2.1724137931034484
      },
      {
        "latitude": 10.376320417960109,
        "longitude": 123.86308843698427,
        "elevation_m": 623,
        "distance_from_start_km": 2.2758620689655173
      },
      {
        "latitude": 10.377226929618082,
        "longitude": 123.863835535948,
        "elevation_m": 619,
        "distance_from_start_km": 2.3793103448275867
      },
      {
        "latitude": 10.377633722356094,
        "longitude": 123.86488113106914,
        "elevation_m": 621,
        "distance_from_start_km": 2.4827586206896552
      },
      {
        "latitude": 10.37860787542445,
        "longitude": 123.86517304926859,
        "elevation_m": 634,
        "distance_from_start_km": 2.586206896551724
      },
      {
        "latitude": 10.378799249204409,
        "longitude": 123.86566816810873,
        "elevation_m": 660,
        "distance_from_start_km": 2.6896551724137936
      },
      {
        "latitude": 10.379636290753576,
        "longitude": 123.86647663871805,
        "elevation_m": 698,
        "distance_from_start_km": 2.793103448275862
      },
      {
        "latitude": 10.380128699899668,
        "longitude": 123.86691715744726,
        "elevation_m": 746,
        "distance_from_start_km": 2.8965517241379315
      },
      {
        "latitude": 10.3807,
        "longitude": 123.8676,
        "elevation_m": 800,
        "distance_from_start_km": 3
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 30,
      "path_smoothness": "rough",
      "terrain_type": "rocky",
      "scenic_rating": 3,
      "technical_difficulty": 5
    }
  },
  {
    "id": "spartan-beginner-loop",
    "route_id": "spartan-beginner-loop",
    "hiking_spot_id": "85",
    "hikingSpotId": "85",
    "route_name": "Spartan Beginner Loop",
    "difficulty": "Easy",
    "start_coordinates": {
      "latitude": 10.3482,
      "longitude": 123.8778
    },
    "end_coordinates": {
      "latitude": 10.35,
      "longitude": 123.88
    },
    "distance_km": 2.4,
    "elevation_gain_m": 180,
    "estimated_duration_hr": 1.2,
    "highlights": "Grasslands, obstacle markers",
    "route_color": "#4CAF50",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8778,
          10.3482
        ],
        [
          123.87830805586798,
          10.34866300487363
        ],
        [
          123.87889999999999,
          10.3491
        ],
        [
          123.87951418142994,
          10.349481815326898
        ],
        [
          123.88,
          10.35
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.3491,
        "longitude": 123.87889999999999,
        "name": "Waypoint 1",
        "description": "Grasslands",
        "elevation_m": 162
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.3482,
        "longitude": 123.8778,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.34866300487363,
        "longitude": 123.87830805586798,
        "elevation_m": 145,
        "distance_from_start_km": 0.125
      },
      {
        "latitude": 10.3491,
        "longitude": 123.87889999999999,
        "elevation_m": 190,
        "distance_from_start_km": 0.25
      },
      {
        "latitude": 10.349481815326898,
        "longitude": 123.87951418142994,
        "elevation_m": 235,
        "distance_from_start_km": 0.375
      },
      {
        "latitude": 10.35,
        "longitude": 123.88,
        "elevation_m": 280,
        "distance_from_start_km": 0.5
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 5,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 1
    }
  },
  {
    "id": "spartan-ridge-path",
    "route_id": "spartan-ridge-path",
    "hiking_spot_id": "85",
    "hikingSpotId": "85",
    "route_name": "Spartan Ridge Path",
    "difficulty": "Easy-Moderate",
    "start_coordinates": {
      "latitude": 10.3461,
      "longitude": 123.8756
    },
    "end_coordinates": {
      "latitude": 10.35,
      "longitude": 123.88
    },
    "distance_km": 3.5,
    "elevation_gain_m": 260,
    "estimated_duration_hr": 1.8,
    "highlights": "Rolling ridge",
    "route_color": "#81C784",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8756,
          10.3461
        ],
        [
          123.87625473960274,
          10.346681479206293
        ],
        [
          123.87694225999448,
          10.34709558502856
        ],
        [
          123.87744557753325,
          10.347709333670869
        ],
        [
          123.87812935018182,
          10.3483031106528
        ],
        [
          123.87874971575069,
          10.348897440198964
        ],
        [
          123.87944291358951,
          10.34950625560737
        ],
        [
          123.88,
          10.35
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.34709558502856,
        "longitude": 123.87694225999448,
        "name": "Waypoint 1",
        "description": "Rolling ridge",
        "elevation_m": 137
      },
      {
        "latitude": 10.348897440198964,
        "longitude": 123.87874971575069,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 222
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.3461,
        "longitude": 123.8756,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.346681479206293,
        "longitude": 123.87625473960274,
        "elevation_m": 162,
        "distance_from_start_km": 0.11428571428571428
      },
      {
        "latitude": 10.34709558502856,
        "longitude": 123.87694225999448,
        "elevation_m": 163,
        "distance_from_start_km": 0.22857142857142856
      },
      {
        "latitude": 10.347709333670869,
        "longitude": 123.87744557753325,
        "elevation_m": 191,
        "distance_from_start_km": 0.34285714285714286
      },
      {
        "latitude": 10.3483031106528,
        "longitude": 123.87812935018182,
        "elevation_m": 269,
        "distance_from_start_km": 0.45714285714285713
      },
      {
        "latitude": 10.348897440198964,
        "longitude": 123.87874971575069,
        "elevation_m": 297,
        "distance_from_start_km": 0.5714285714285715
      },
      {
        "latitude": 10.34950625560737,
        "longitude": 123.87944291358951,
        "elevation_m": 298,
        "distance_from_start_km": 0.6857142857142857
      },
      {
        "latitude": 10.35,
        "longitude": 123.88,
        "elevation_m": 360,
        "distance_from_start_km": 0.8
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 8,
      "path_smoothness": "smooth",
      "terrain_type": "ridge",
      "scenic_rating": 3,
      "technical_difficulty": 2
    }
  },
  {
    "id": "spartan-challenge-circuit",
    "route_id": "spartan-challenge-circuit",
    "hiking_spot_id": "85",
    "hikingSpotId": "85",
    "route_name": "Spartan Challenge Circuit",
    "difficulty": "Moderate",
    "start_coordinates": {
      "latitude": 10.344,
      "longitude": 123.8735
    },
    "end_coordinates": {
      "latitude": 10.3523,
      "longitude": 123.8822
    },
    "distance_km": 4.9,
    "elevation_gain_m": 430,
    "estimated_duration_hr": 2.6,
    "highlights": "Mud obstacles, scenic trail",
    "route_color": "#FF9800",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8735,
          10.344
        ],
        [
          123.87420278021078,
          10.344629819945501
        ],
        [
          123.87468358293512,
          10.34540797300296
        ],
        [
          123.87563717139501,
          10.345757248889603
        ],
        [
          123.87627916779942,
          10.346463492302872
        ],
        [
          123.87678156179594,
          10.347066372894217
        ],
        [
          123.87753508046654,
          10.34786657213455
        ],
        [
          123.87816891893696,
          10.348467737044363
        ],
        [
          123.87882516069385,
          10.349207927709884
        ],
        [
          123.87952807276307,
          10.349580633303287
        ],
        [
          123.88025692076066,
          10.350437295680427
        ],
        [
          123.88073996814016,
          10.350967180565322
        ],
        [
          123.88147844082067,
          10.351699713971849
        ],
        [
          123.8822,
          10.3523
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.345757248889603,
        "longitude": 123.87563717139501,
        "name": "Waypoint 1",
        "description": "Mud obstacles",
        "elevation_m": 276
      },
      {
        "latitude": 10.348467737044363,
        "longitude": 123.87816891893696,
        "name": "Waypoint 2",
        "description": " scenic trail",
        "elevation_m": 143
      },
      {
        "latitude": 10.350437295680427,
        "longitude": 123.88025692076066,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 196
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.344,
        "longitude": 123.8735,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.344629819945501,
        "longitude": 123.87420278021078,
        "elevation_m": 168,
        "distance_from_start_km": 0.10769230769230771
      },
      {
        "latitude": 10.34540797300296,
        "longitude": 123.87468358293512,
        "elevation_m": 206,
        "distance_from_start_km": 0.21538461538461542
      },
      {
        "latitude": 10.345757248889603,
        "longitude": 123.87563717139501,
        "elevation_m": 210,
        "distance_from_start_km": 0.3230769230769231
      },
      {
        "latitude": 10.346463492302872,
        "longitude": 123.87627916779942,
        "elevation_m": 204,
        "distance_from_start_km": 0.43076923076923085
      },
      {
        "latitude": 10.347066372894217,
        "longitude": 123.87678156179594,
        "elevation_m": 223,
        "distance_from_start_km": 0.5384615384615385
      },
      {
        "latitude": 10.34786657213455,
        "longitude": 123.87753508046654,
        "elevation_m": 278,
        "distance_from_start_km": 0.6461538461538462
      },
      {
        "latitude": 10.348467737044363,
        "longitude": 123.87816891893696,
        "elevation_m": 352,
        "distance_from_start_km": 0.7538461538461538
      },
      {
        "latitude": 10.349207927709884,
        "longitude": 123.87882516069385,
        "elevation_m": 407,
        "distance_from_start_km": 0.8615384615384617
      },
      {
        "latitude": 10.349580633303287,
        "longitude": 123.87952807276307,
        "elevation_m": 426,
        "distance_from_start_km": 0.9692307692307692
      },
      {
        "latitude": 10.350437295680427,
        "longitude": 123.88025692076066,
        "elevation_m": 420,
        "distance_from_start_km": 1.076923076923077
      },
      {
        "latitude": 10.350967180565322,
        "longitude": 123.88073996814016,
        "elevation_m": 424,
        "distance_from_start_km": 1.1846153846153846
      },
      {
        "latitude": 10.351699713971849,
        "longitude": 123.88147844082067,
        "elevation_m": 462,
        "distance_from_start_km": 1.2923076923076924
      },
      {
        "latitude": 10.3523,
        "longitude": 123.8822,
        "elevation_m": 530,
        "distance_from_start_km": 1.4000000000000001
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 14,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 4,
      "technical_difficulty": 3
    }
  },
  {
    "id": "spartan-endurance-traverse",
    "route_id": "spartan-endurance-traverse",
    "hiking_spot_id": "85",
    "hikingSpotId": "85",
    "route_name": "Spartan Endurance Traverse",
    "difficulty": "Hard",
    "start_coordinates": {
      "latitude": 10.3418,
      "longitude": 123.8713
    },
    "end_coordinates": {
      "latitude": 10.3544,
      "longitude": 123.8843
    },
    "distance_km": 6.4,
    "elevation_gain_m": 590,
    "estimated_duration_hr": 3.5,
    "highlights": "Technical terrain, endurance",
    "route_color": "#F44336",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8713,
          10.3418
        ],
        [
          123.87186502069943,
          10.342371310200825
        ],
        [
          123.87250981387999,
          10.342849283296733
        ],
        [
          123.87309688726766,
          10.343370089163983
        ],
        [
          123.87397391188688,
          10.344039317097218
        ],
        [
          123.87433232851602,
          10.344909136562679
        ],
        [
          123.87508120471382,
          10.345677104024
        ],
        [
          123.87554045506218,
          10.345838949553283
        ],
        [
          123.87612926808643,
          10.34672803837966
        ],
        [
          123.87693376173175,
          10.347259684400104
        ],
        [
          123.87745387674673,
          10.34779243884315
        ],
        [
          123.87808120930899,
          10.348387520961568
        ],
        [
          123.87882924131861,
          10.348975525302432
        ],
        [
          123.8793716214411,
          10.34967704770963
        ],
        [
          123.8798448582609,
          10.350218401316498
        ],
        [
          123.88063746861837,
          10.351089394338429
        ],
        [
          123.88109780637011,
          10.35169591494028
        ],
        [
          123.88180503026285,
          10.352247815011816
        ],
        [
          123.88248846316125,
          10.352638360150756
        ],
        [
          123.88314217565896,
          10.353243823916829
        ],
        [
          123.88370888870841,
          10.353814052868836
        ],
        [
          123.8843,
          10.3544
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.344909136562679,
        "longitude": 123.87433232851602,
        "name": "Waypoint 1",
        "description": "Technical terrain",
        "elevation_m": 219
      },
      {
        "latitude": 10.348387520961568,
        "longitude": 123.87808120930899,
        "name": "Waypoint 2",
        "description": " endurance",
        "elevation_m": 159
      },
      {
        "latitude": 10.35169591494028,
        "longitude": 123.88109780637011,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 222
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.3418,
        "longitude": 123.8713,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.342371310200825,
        "longitude": 123.87186502069943,
        "elevation_m": 161,
        "distance_from_start_km": 0.10476190476190475
      },
      {
        "latitude": 10.342849283296733,
        "longitude": 123.87250981387999,
        "elevation_m": 211,
        "distance_from_start_km": 0.2095238095238095
      },
      {
        "latitude": 10.343370089163983,
        "longitude": 123.87309688726766,
        "elevation_m": 242,
        "distance_from_start_km": 0.3142857142857143
      },
      {
        "latitude": 10.344039317097218,
        "longitude": 123.87397391188688,
        "elevation_m": 253,
        "distance_from_start_km": 0.419047619047619
      },
      {
        "latitude": 10.344909136562679,
        "longitude": 123.87433232851602,
        "elevation_m": 249,
        "distance_from_start_km": 0.5238095238095238
      },
      {
        "latitude": 10.345677104024,
        "longitude": 123.87508120471382,
        "elevation_m": 243,
        "distance_from_start_km": 0.6285714285714286
      },
      {
        "latitude": 10.345838949553283,
        "longitude": 123.87554045506218,
        "elevation_m": 246,
        "distance_from_start_km": 0.7333333333333334
      },
      {
        "latitude": 10.34672803837966,
        "longitude": 123.87612926808643,
        "elevation_m": 266,
        "distance_from_start_km": 0.838095238095238
      },
      {
        "latitude": 10.347259684400104,
        "longitude": 123.87693376173175,
        "elevation_m": 307,
        "distance_from_start_km": 0.942857142857143
      },
      {
        "latitude": 10.34779243884315,
        "longitude": 123.87745387674673,
        "elevation_m": 364,
        "distance_from_start_km": 1.0476190476190477
      },
      {
        "latitude": 10.348387520961568,
        "longitude": 123.87808120930899,
        "elevation_m": 426,
        "distance_from_start_km": 1.1523809523809525
      },
      {
        "latitude": 10.348975525302432,
        "longitude": 123.87882924131861,
        "elevation_m": 483,
        "distance_from_start_km": 1.2571428571428571
      },
      {
        "latitude": 10.34967704770963,
        "longitude": 123.8793716214411,
        "elevation_m": 524,
        "distance_from_start_km": 1.3619047619047622
      },
      {
        "latitude": 10.350218401316498,
        "longitude": 123.8798448582609,
        "elevation_m": 544,
        "distance_from_start_km": 1.4666666666666668
      },
      {
        "latitude": 10.351089394338429,
        "longitude": 123.88063746861837,
        "elevation_m": 547,
        "distance_from_start_km": 1.5714285714285716
      },
      {
        "latitude": 10.35169591494028,
        "longitude": 123.88109780637011,
        "elevation_m": 541,
        "distance_from_start_km": 1.676190476190476
      },
      {
        "latitude": 10.352247815011816,
        "longitude": 123.88180503026285,
        "elevation_m": 537,
        "distance_from_start_km": 1.780952380952381
      },
      {
        "latitude": 10.352638360150756,
        "longitude": 123.88248846316125,
        "elevation_m": 548,
        "distance_from_start_km": 1.885714285714286
      },
      {
        "latitude": 10.353243823916829,
        "longitude": 123.88314217565896,
        "elevation_m": 579,
        "distance_from_start_km": 1.9904761904761905
      },
      {
        "latitude": 10.353814052868836,
        "longitude": 123.88370888870841,
        "elevation_m": 629,
        "distance_from_start_km": 2.0952380952380953
      },
      {
        "latitude": 10.3544,
        "longitude": 123.8843,
        "elevation_m": 690,
        "distance_from_start_km": 2.2
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 22,
      "path_smoothness": "moderate",
      "terrain_type": "mixed",
      "scenic_rating": 3,
      "technical_difficulty": 4
    }
  },
  {
    "id": "spartan-extreme-ultra",
    "route_id": "spartan-extreme-ultra",
    "hiking_spot_id": "85",
    "hikingSpotId": "85",
    "route_name": "Spartan Extreme Ultra",
    "difficulty": "Very Hard",
    "start_coordinates": {
      "latitude": 10.3397,
      "longitude": 123.8692
    },
    "end_coordinates": {
      "latitude": 10.3566,
      "longitude": 123.8866
    },
    "distance_km": 7.8,
    "elevation_gain_m": 760,
    "estimated_duration_hr": 4.9,
    "highlights": "Steep climbs, obstacle walls",
    "route_color": "#9C27B0",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8692,
          10.3397
        ],
        [
          123.8697440324809,
          10.34023533866794
        ],
        [
          123.87049736808994,
          10.340721111367055
        ],
        [
          123.8711098385288,
          10.341334474302663
        ],
        [
          123.8715732558261,
          10.342231968439442
        ],
        [
          123.87184341143664,
          10.342619036810687
        ],
        [
          123.87281665367162,
          10.342865317858806
        ],
        [
          123.87358336429523,
          10.343371114310429
        ],
        [
          123.87375720008892,
          10.34387818332743
        ],
        [
          123.87417944971156,
          10.344966677900223
        ],
        [
          123.87483719327724,
          10.345003111586278
        ],
        [
          123.87529137959366,
          10.345632851039051
        ],
        [
          123.87603541795578,
          10.34632290008437
        ],
        [
          123.87666798541436,
          10.346965596057974
        ],
        [
          123.87737676560398,
          10.347505926461267
        ],
        [
          123.87790000000001,
          10.34815
        ],
        [
          123.87844193042868,
          10.34871231531741
        ],
        [
          123.8790370295162,
          10.34936970885088
        ],
        [
          123.87972689435846,
          10.349828596495664
        ],
        [
          123.88039309958539,
          10.350347184904821
        ],
        [
          123.88058097588628,
          10.3511411873686
        ],
        [
          123.88133801254065,
          10.351217173334838
        ],
        [
          123.88176804820891,
          10.352138559593797
        ],
        [
          123.88229074970265,
          10.352347540351227
        ],
        [
          123.88320541168554,
          10.353525531752325
        ],
        [
          123.88339598985927,
          10.35366192637634
        ],
        [
          123.88433484088151,
          10.35423511557181
        ],
        [
          123.8846963139681,
          10.354897230968914
        ],
        [
          123.88545496360399,
          10.355415480298452
        ],
        [
          123.88595521553091,
          10.356066660953564
        ],
        [
          123.8866,
          10.3566
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.343371114310429,
        "longitude": 123.87358336429523,
        "name": "Waypoint 1",
        "description": "Steep climbs",
        "elevation_m": 289
      },
      {
        "latitude": 10.34815,
        "longitude": 123.87790000000001,
        "name": "Waypoint 2",
        "description": " obstacle walls",
        "elevation_m": 226
      },
      {
        "latitude": 10.352347540351227,
        "longitude": 123.88229074970265,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 268
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.3397,
        "longitude": 123.8692,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.34023533866794,
        "longitude": 123.8697440324809,
        "elevation_m": 156,
        "distance_from_start_km": 0.10333333333333333
      },
      {
        "latitude": 10.340721111367055,
        "longitude": 123.87049736808994,
        "elevation_m": 207,
        "distance_from_start_km": 0.20666666666666667
      },
      {
        "latitude": 10.341334474302663,
        "longitude": 123.8711098385288,
        "elevation_m": 248,
        "distance_from_start_km": 0.31000000000000005
      },
      {
        "latitude": 10.342231968439442,
        "longitude": 123.8715732558261,
        "elevation_m": 277,
        "distance_from_start_km": 0.41333333333333333
      },
      {
        "latitude": 10.342619036810687,
        "longitude": 123.87184341143664,
        "elevation_m": 292,
        "distance_from_start_km": 0.5166666666666666
      },
      {
        "latitude": 10.342865317858806,
        "longitude": 123.87281665367162,
        "elevation_m": 297,
        "distance_from_start_km": 0.6200000000000001
      },
      {
        "latitude": 10.343371114310429,
        "longitude": 123.87358336429523,
        "elevation_m": 293,
        "distance_from_start_km": 0.7233333333333334
      },
      {
        "latitude": 10.34387818332743,
        "longitude": 123.87375720008892,
        "elevation_m": 287,
        "distance_from_start_km": 0.8266666666666667
      },
      {
        "latitude": 10.344966677900223,
        "longitude": 123.87417944971156,
        "elevation_m": 283,
        "distance_from_start_km": 0.9299999999999999
      },
      {
        "latitude": 10.345003111586278,
        "longitude": 123.87483719327724,
        "elevation_m": 288,
        "distance_from_start_km": 1.0333333333333332
      },
      {
        "latitude": 10.345632851039051,
        "longitude": 123.87529137959366,
        "elevation_m": 303,
        "distance_from_start_km": 1.1366666666666665
      },
      {
        "latitude": 10.34632290008437,
        "longitude": 123.87603541795578,
        "elevation_m": 332,
        "distance_from_start_km": 1.2400000000000002
      },
      {
        "latitude": 10.346965596057974,
        "longitude": 123.87666798541436,
        "elevation_m": 373,
        "distance_from_start_km": 1.3433333333333335
      },
      {
        "latitude": 10.347505926461267,
        "longitude": 123.87737676560398,
        "elevation_m": 424,
        "distance_from_start_km": 1.4466666666666668
      },
      {
        "latitude": 10.34815,
        "longitude": 123.87790000000001,
        "elevation_m": 480,
        "distance_from_start_km": 1.55
      },
      {
        "latitude": 10.34871231531741,
        "longitude": 123.87844193042868,
        "elevation_m": 536,
        "distance_from_start_km": 1.6533333333333333
      },
      {
        "latitude": 10.34936970885088,
        "longitude": 123.8790370295162,
        "elevation_m": 587,
        "distance_from_start_km": 1.7566666666666668
      },
      {
        "latitude": 10.349828596495664,
        "longitude": 123.87972689435846,
        "elevation_m": 628,
        "distance_from_start_km": 1.8599999999999999
      },
      {
        "latitude": 10.350347184904821,
        "longitude": 123.88039309958539,
        "elevation_m": 657,
        "distance_from_start_km": 1.9633333333333334
      },
      {
        "latitude": 10.3511411873686,
        "longitude": 123.88058097588628,
        "elevation_m": 672,
        "distance_from_start_km": 2.0666666666666664
      },
      {
        "latitude": 10.351217173334838,
        "longitude": 123.88133801254065,
        "elevation_m": 677,
        "distance_from_start_km": 2.17
      },
      {
        "latitude": 10.352138559593797,
        "longitude": 123.88176804820891,
        "elevation_m": 673,
        "distance_from_start_km": 2.273333333333333
      },
      {
        "latitude": 10.352347540351227,
        "longitude": 123.88229074970265,
        "elevation_m": 667,
        "distance_from_start_km": 2.376666666666667
      },
      {
        "latitude": 10.353525531752325,
        "longitude": 123.88320541168554,
        "elevation_m": 663,
        "distance_from_start_km": 2.4800000000000004
      },
      {
        "latitude": 10.35366192637634,
        "longitude": 123.88339598985927,
        "elevation_m": 668,
        "distance_from_start_km": 2.583333333333334
      },
      {
        "latitude": 10.35423511557181,
        "longitude": 123.88433484088151,
        "elevation_m": 683,
        "distance_from_start_km": 2.686666666666667
      },
      {
        "latitude": 10.354897230968914,
        "longitude": 123.8846963139681,
        "elevation_m": 712,
        "distance_from_start_km": 2.7900000000000005
      },
      {
        "latitude": 10.355415480298452,
        "longitude": 123.88545496360399,
        "elevation_m": 753,
        "distance_from_start_km": 2.8933333333333335
      },
      {
        "latitude": 10.356066660953564,
        "longitude": 123.88595521553091,
        "elevation_m": 804,
        "distance_from_start_km": 2.996666666666667
      },
      {
        "latitude": 10.3566,
        "longitude": 123.8866,
        "elevation_m": 860,
        "distance_from_start_km": 3.1
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 31,
      "path_smoothness": "rough",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 5
    }
  },
  {
    "id": "hambubuyog-main-summit",
    "route_id": "hambubuyog-main-summit",
    "hiking_spot_id": "85",
    "hikingSpotId": "85",
    "route_name": "Main Summit Trail",
    "difficulty": "Moderate",
    "start_coordinates": {
      "latitude": 9.6001,
      "longitude": 123.3204
    },
    "end_coordinates": {
      "latitude": 9.6072,
      "longitude": 123.3312
    },
    "distance_km": 4.2,
    "elevation_gain_m": 620,
    "estimated_duration_hr": 2.5,
    "highlights": "Pine trees, scenic ridges",
    "route_color": "#4CAF50",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.3204,
          9.6001
        ],
        [
          123.32146612550967,
          9.60070055104973
        ],
        [
          123.32237819125825,
          9.601283818708836
        ],
        [
          123.32320397999759,
          9.602104933612347
        ],
        [
          123.32436080474146,
          9.602644068322414
        ],
        [
          123.3252888210673,
          9.603281454685384
        ],
        [
          123.32633904940269,
          9.60394169416864
        ],
        [
          123.32731830173887,
          9.604510854163365
        ],
        [
          123.32834812904427,
          9.605455236965945
        ],
        [
          123.32938813850365,
          9.605961611252829
        ],
        [
          123.33013697538672,
          9.60664787909217
        ],
        [
          123.3312,
          9.6072
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 9.602104933612347,
        "longitude": 123.32320397999759,
        "name": "Waypoint 1",
        "description": "Pine trees",
        "elevation_m": 166
      },
      {
        "latitude": 9.60394169416864,
        "longitude": 123.32633904940269,
        "name": "Waypoint 2",
        "description": " scenic ridges",
        "elevation_m": 173
      },
      {
        "latitude": 9.605961611252829,
        "longitude": 123.32938813850365,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 200
      }
    ],
    "elevation_profile": [
      {
        "latitude": 9.6001,
        "longitude": 123.3204,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 9.60070055104973,
        "longitude": 123.32146612550967,
        "elevation_m": 213,
        "distance_from_start_km": 0.10909090909090909
      },
      {
        "latitude": 9.601283818708836,
        "longitude": 123.32237819125825,
        "elevation_m": 260,
        "distance_from_start_km": 0.21818181818181817
      },
      {
        "latitude": 9.602104933612347,
        "longitude": 123.32320397999759,
        "elevation_m": 252,
        "distance_from_start_km": 0.32727272727272727
      },
      {
        "latitude": 9.602644068322414,
        "longitude": 123.32436080474146,
        "elevation_m": 264,
        "distance_from_start_km": 0.43636363636363634
      },
      {
        "latitude": 9.603281454685384,
        "longitude": 123.3252888210673,
        "elevation_m": 348,
        "distance_from_start_km": 0.5454545454545454
      },
      {
        "latitude": 9.60394169416864,
        "longitude": 123.32633904940269,
        "elevation_m": 472,
        "distance_from_start_km": 0.6545454545454545
      },
      {
        "latitude": 9.604510854163365,
        "longitude": 123.32731830173887,
        "elevation_m": 556,
        "distance_from_start_km": 0.7636363636363637
      },
      {
        "latitude": 9.605455236965945,
        "longitude": 123.32834812904427,
        "elevation_m": 568,
        "distance_from_start_km": 0.8727272727272727
      },
      {
        "latitude": 9.605961611252829,
        "longitude": 123.32938813850365,
        "elevation_m": 560,
        "distance_from_start_km": 0.9818181818181819
      },
      {
        "latitude": 9.60664787909217,
        "longitude": 123.33013697538672,
        "elevation_m": 607,
        "distance_from_start_km": 1.0909090909090908
      },
      {
        "latitude": 9.6072,
        "longitude": 123.3312,
        "elevation_m": 720,
        "distance_from_start_km": 1.2000000000000002
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 12,
      "path_smoothness": "smooth",
      "terrain_type": "ridge",
      "scenic_rating": 3,
      "technical_difficulty": 3
    }
  },
  {
    "id": "osmena-easy-path",
    "route_id": "osmena-easy-path",
    "hikingSpotId": "82",
    "hiking_spot_id": "82",
    "route_name": "Osmeña Easy Path",
    "difficulty": "Easy",
    "start_coordinates": {
      "latitude": 9.8186,
      "longitude": 123.463
    },
    "end_coordinates": {
      "latitude": 9.8205,
      "longitude": 123.4652
    },
    "distance_km": 2.1,
    "elevation_gain_m": 170,
    "estimated_duration_hr": 1.2,
    "highlights": "Jagged hills, panoramic views",
    "route_color": "#4CAF50",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.463,
          9.8186
        ],
        [
          123.46346975467823,
          9.819068979021448
        ],
        [
          123.4641,
          9.81955
        ],
        [
          123.46461323195923,
          9.820023003710457
        ],
        [
          123.4652,
          9.8205
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 9.81955,
        "longitude": 123.4641,
        "name": "Waypoint 1",
        "description": "Jagged hills",
        "elevation_m": 197
      }
    ],
    "elevation_profile": [
      {
        "latitude": 9.8186,
        "longitude": 123.463,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 9.819068979021448,
        "longitude": 123.46346975467823,
        "elevation_m": 143,
        "distance_from_start_km": 0.125
      },
      {
        "latitude": 9.81955,
        "longitude": 123.4641,
        "elevation_m": 185,
        "distance_from_start_km": 0.25
      },
      {
        "latitude": 9.820023003710457,
        "longitude": 123.46461323195923,
        "elevation_m": 228,
        "distance_from_start_km": 0.375
      },
      {
        "latitude": 9.8205,
        "longitude": 123.4652,
        "elevation_m": 270,
        "distance_from_start_km": 0.5
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 5,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 4,
      "technical_difficulty": 1
    }
  },
  {
    "id": "osmena-ridge-walk",
    "route_id": "osmena-ridge-walk",
    "hikingSpotId": "82",
    "hiking_spot_id": "82",
    "route_name": "Osmeña Ridge Walk",
    "difficulty": "Easy-Moderate",
    "start_coordinates": {
      "latitude": 9.8167,
      "longitude": 123.4608
    },
    "end_coordinates": {
      "latitude": 9.8205,
      "longitude": 123.4652
    },
    "distance_km": 3.4,
    "elevation_gain_m": 250,
    "estimated_duration_hr": 1.8,
    "highlights": "Ridge trail, limestone peaks",
    "route_color": "#FF9800",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.4608,
          9.8167
        ],
        [
          123.4615373725457,
          9.817143893171405
        ],
        [
          123.46203108074471,
          9.817861359622428
        ],
        [
          123.46271063006932,
          9.818375764975716
        ],
        [
          123.46326605912567,
          9.818847199429813
        ],
        [
          123.46398670515055,
          9.81943863123621
        ],
        [
          123.46459409944404,
          9.819982217435983
        ],
        [
          123.4652,
          9.8205
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 9.817861359622428,
        "longitude": 123.46203108074471,
        "name": "Waypoint 1",
        "description": "Ridge trail",
        "elevation_m": 274
      },
      {
        "latitude": 9.81943863123621,
        "longitude": 123.46398670515055,
        "name": "Waypoint 2",
        "description": " limestone peaks",
        "elevation_m": 232
      }
    ],
    "elevation_profile": [
      {
        "latitude": 9.8167,
        "longitude": 123.4608,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 9.817143893171405,
        "longitude": 123.4615373725457,
        "elevation_m": 160,
        "distance_from_start_km": 0.11428571428571428
      },
      {
        "latitude": 9.817861359622428,
        "longitude": 123.46203108074471,
        "elevation_m": 161,
        "distance_from_start_km": 0.22857142857142856
      },
      {
        "latitude": 9.818375764975716,
        "longitude": 123.46271063006932,
        "elevation_m": 188,
        "distance_from_start_km": 0.34285714285714286
      },
      {
        "latitude": 9.818847199429813,
        "longitude": 123.46326605912567,
        "elevation_m": 262,
        "distance_from_start_km": 0.45714285714285713
      },
      {
        "latitude": 9.81943863123621,
        "longitude": 123.46398670515055,
        "elevation_m": 289,
        "distance_from_start_km": 0.5714285714285715
      },
      {
        "latitude": 9.819982217435983,
        "longitude": 123.46459409944404,
        "elevation_m": 290,
        "distance_from_start_km": 0.6857142857142857
      },
      {
        "latitude": 9.8205,
        "longitude": 123.4652,
        "elevation_m": 350,
        "distance_from_start_km": 0.8
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 8,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 4,
      "technical_difficulty": 2
    }
  },
  {
    "id": "osmena-peak-circuit",
    "route_id": "osmena-peak-circuit",
    "hikingSpotId": "82",
    "hiking_spot_id": "82",
    "route_name": "Osmeña Peak Circuit",
    "difficulty": "Moderate",
    "start_coordinates": {
      "latitude": 9.8148,
      "longitude": 123.4586
    },
    "end_coordinates": {
      "latitude": 9.8227,
      "longitude": 123.4674
    },
    "distance_km": 4.9,
    "elevation_gain_m": 430,
    "estimated_duration_hr": 2.5,
    "highlights": "Full ridge loop, 360° views",
    "route_color": "#2196F3",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.4586,
          9.8148
        ],
        [
          123.45923055012143,
          9.815470914818382
        ],
        [
          123.45979891607348,
          9.816113417428987
        ],
        [
          123.46060555488337,
          9.816612251249321
        ],
        [
          123.46133776351407,
          9.817275135301655
        ],
        [
          123.461903441743,
          9.817874665653502
        ],
        [
          123.46262060947865,
          9.818473489306813
        ],
        [
          123.46329900507179,
          9.819072776253156
        ],
        [
          123.46398721971657,
          9.819716551426229
        ],
        [
          123.4645211626643,
          9.820400706328112
        ],
        [
          123.46554828364513,
          9.820961931111265
        ],
        [
          123.46611564187954,
          9.821493333427412
        ],
        [
          123.46663321802724,
          9.822073197837506
        ],
        [
          123.4674,
          9.8227
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 9.816612251249321,
        "longitude": 123.46060555488337,
        "name": "Waypoint 1",
        "description": "Full ridge loop",
        "elevation_m": 299
      },
      {
        "latitude": 9.819072776253156,
        "longitude": 123.46329900507179,
        "name": "Waypoint 2",
        "description": " 360° views",
        "elevation_m": 254
      },
      {
        "latitude": 9.820961931111265,
        "longitude": 123.46554828364513,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 288
      }
    ],
    "elevation_profile": [
      {
        "latitude": 9.8148,
        "longitude": 123.4586,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 9.815470914818382,
        "longitude": 123.45923055012143,
        "elevation_m": 168,
        "distance_from_start_km": 0.10769230769230771
      },
      {
        "latitude": 9.816113417428987,
        "longitude": 123.45979891607348,
        "elevation_m": 206,
        "distance_from_start_km": 0.21538461538461542
      },
      {
        "latitude": 9.816612251249321,
        "longitude": 123.46060555488337,
        "elevation_m": 210,
        "distance_from_start_km": 0.3230769230769231
      },
      {
        "latitude": 9.817275135301655,
        "longitude": 123.46133776351407,
        "elevation_m": 204,
        "distance_from_start_km": 0.43076923076923085
      },
      {
        "latitude": 9.817874665653502,
        "longitude": 123.461903441743,
        "elevation_m": 223,
        "distance_from_start_km": 0.5384615384615385
      },
      {
        "latitude": 9.818473489306813,
        "longitude": 123.46262060947865,
        "elevation_m": 278,
        "distance_from_start_km": 0.6461538461538462
      },
      {
        "latitude": 9.819072776253156,
        "longitude": 123.46329900507179,
        "elevation_m": 352,
        "distance_from_start_km": 0.7538461538461538
      },
      {
        "latitude": 9.819716551426229,
        "longitude": 123.46398721971657,
        "elevation_m": 407,
        "distance_from_start_km": 0.8615384615384617
      },
      {
        "latitude": 9.820400706328112,
        "longitude": 123.4645211626643,
        "elevation_m": 426,
        "distance_from_start_km": 0.9692307692307692
      },
      {
        "latitude": 9.820961931111265,
        "longitude": 123.46554828364513,
        "elevation_m": 420,
        "distance_from_start_km": 1.076923076923077
      },
      {
        "latitude": 9.821493333427412,
        "longitude": 123.46611564187954,
        "elevation_m": 424,
        "distance_from_start_km": 1.1846153846153846
      },
      {
        "latitude": 9.822073197837506,
        "longitude": 123.46663321802724,
        "elevation_m": 462,
        "distance_from_start_km": 1.2923076923076924
      },
      {
        "latitude": 9.8227,
        "longitude": 123.4674,
        "elevation_m": 530,
        "distance_from_start_km": 1.4000000000000001
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 14,
      "path_smoothness": "smooth",
      "terrain_type": "ridge",
      "scenic_rating": 5,
      "technical_difficulty": 3
    }
  },
  {
    "id": "osmena-casino-traverse",
    "route_id": "osmena-casino-traverse",
    "hikingSpotId": "82",
    "hiking_spot_id": "82",
    "route_name": "Osmeña to Casino Traverse",
    "difficulty": "Hard",
    "start_coordinates": {
      "latitude": 9.8129,
      "longitude": 123.4565
    },
    "end_coordinates": {
      "latitude": 9.8248,
      "longitude": 123.4696
    },
    "distance_km": 6.6,
    "elevation_gain_m": 590,
    "estimated_duration_hr": 3.6,
    "highlights": "Connection to Casino Peak",
    "route_color": "#F44336",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.4565,
          9.8129
        ],
        [
          123.4570861881374,
          9.813490604337856
        ],
        [
          123.4576926211367,
          9.813923979062759
        ],
        [
          123.45815847533343,
          9.81473053605284
        ],
        [
          123.4590365788563,
          9.815123639055743
        ],
        [
          123.45967524716693,
          9.81534683405
        ],
        [
          123.46017986489642,
          9.816325999548223
        ],
        [
          123.46087431454856,
          9.816630343086599
        ],
        [
          123.46106224562776,
          9.81712652643512
        ],
        [
          123.46198632991731,
          9.817763876966787
        ],
        [
          123.4623861163464,
          9.8182307620699
        ],
        [
          123.46305000000001,
          9.818850000000001
        ],
        [
          123.46361353271675,
          9.819396382183237
        ],
        [
          123.46421811600821,
          9.819849755510354
        ],
        [
          123.46480669212943,
          9.820249945004205
        ],
        [
          123.46540714260775,
          9.820935136922198
        ],
        [
          123.46586092691241,
          9.821348275530706
        ],
        [
          123.46645408347783,
          9.822387551054792
        ],
        [
          123.46741262544754,
          9.822811928566217
        ],
        [
          123.46768682507344,
          9.823227511183884
        ],
        [
          123.46855887720687,
          9.82386421147987
        ],
        [
          123.46899080081162,
          9.824342061480476
        ],
        [
          123.4696,
          9.8248
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 9.81534683405,
        "longitude": 123.45967524716693,
        "name": "Waypoint 1",
        "description": "Connection to Casino Peak",
        "elevation_m": 294
      },
      {
        "latitude": 9.818850000000001,
        "longitude": 123.46305000000001,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 216
      },
      {
        "latitude": 9.822387551054792,
        "longitude": 123.46645408347783,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 255
      }
    ],
    "elevation_profile": [
      {
        "latitude": 9.8129,
        "longitude": 123.4565,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 9.813490604337856,
        "longitude": 123.4570861881374,
        "elevation_m": 159,
        "distance_from_start_km": 0.10454545454545455
      },
      {
        "latitude": 9.813923979062759,
        "longitude": 123.4576926211367,
        "elevation_m": 207,
        "distance_from_start_km": 0.2090909090909091
      },
      {
        "latitude": 9.81473053605284,
        "longitude": 123.45815847533343,
        "elevation_m": 239,
        "distance_from_start_km": 0.31363636363636366
      },
      {
        "latitude": 9.815123639055743,
        "longitude": 123.4590365788563,
        "elevation_m": 252,
        "distance_from_start_km": 0.4181818181818182
      },
      {
        "latitude": 9.81534683405,
        "longitude": 123.45967524716693,
        "elevation_m": 251,
        "distance_from_start_km": 0.5227272727272728
      },
      {
        "latitude": 9.816325999548223,
        "longitude": 123.46017986489642,
        "elevation_m": 244,
        "distance_from_start_km": 0.6272727272727273
      },
      {
        "latitude": 9.816630343086599,
        "longitude": 123.46087431454856,
        "elevation_m": 243,
        "distance_from_start_km": 0.7318181818181819
      },
      {
        "latitude": 9.81712652643512,
        "longitude": 123.46106224562776,
        "elevation_m": 256,
        "distance_from_start_km": 0.8363636363636364
      },
      {
        "latitude": 9.817763876966787,
        "longitude": 123.46198632991731,
        "elevation_m": 288,
        "distance_from_start_km": 0.940909090909091
      },
      {
        "latitude": 9.8182307620699,
        "longitude": 123.4623861163464,
        "elevation_m": 336,
        "distance_from_start_km": 1.0454545454545456
      },
      {
        "latitude": 9.818850000000001,
        "longitude": 123.46305000000001,
        "elevation_m": 395,
        "distance_from_start_km": 1.1500000000000001
      },
      {
        "latitude": 9.819396382183237,
        "longitude": 123.46361353271675,
        "elevation_m": 454,
        "distance_from_start_km": 1.2545454545454546
      },
      {
        "latitude": 9.819849755510354,
        "longitude": 123.46421811600821,
        "elevation_m": 502,
        "distance_from_start_km": 1.3590909090909093
      },
      {
        "latitude": 9.820249945004205,
        "longitude": 123.46480669212943,
        "elevation_m": 534,
        "distance_from_start_km": 1.4636363636363638
      },
      {
        "latitude": 9.820935136922198,
        "longitude": 123.46540714260775,
        "elevation_m": 547,
        "distance_from_start_km": 1.5681818181818181
      },
      {
        "latitude": 9.821348275530706,
        "longitude": 123.46586092691241,
        "elevation_m": 546,
        "distance_from_start_km": 1.6727272727272728
      },
      {
        "latitude": 9.822387551054792,
        "longitude": 123.46645408347783,
        "elevation_m": 539,
        "distance_from_start_km": 1.7772727272727273
      },
      {
        "latitude": 9.822811928566217,
        "longitude": 123.46741262544754,
        "elevation_m": 538,
        "distance_from_start_km": 1.881818181818182
      },
      {
        "latitude": 9.823227511183884,
        "longitude": 123.46768682507344,
        "elevation_m": 551,
        "distance_from_start_km": 1.9863636363636363
      },
      {
        "latitude": 9.82386421147987,
        "longitude": 123.46855887720687,
        "elevation_m": 583,
        "distance_from_start_km": 2.0909090909090913
      },
      {
        "latitude": 9.824342061480476,
        "longitude": 123.46899080081162,
        "elevation_m": 631,
        "distance_from_start_km": 2.1954545454545458
      },
      {
        "latitude": 9.8248,
        "longitude": 123.4696,
        "elevation_m": 690,
        "distance_from_start_km": 2.3000000000000003
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 23,
      "path_smoothness": "moderate",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 4
    }
  },
  {
    "id": "lantoy-forest-path",
    "route_id": "lantoy-forest-path",
    "hikingSpotId": "77",
    "hiking_spot_id": "77",
    "route_name": "Lantoy Forest Path",
    "difficulty": "Easy",
    "start_coordinates": {
      "latitude": 9.877,
      "longitude": 123.6051
    },
    "end_coordinates": {
      "latitude": 9.879,
      "longitude": 123.607
    },
    "distance_km": 2.3,
    "elevation_gain_m": 190,
    "estimated_duration_hr": 1.3,
    "highlights": "Forest trek, local flora",
    "route_color": "#4CAF50",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.6051,
          9.877
        ],
        [
          123.60553532932553,
          9.877531679126184
        ],
        [
          123.60605,
          9.878
        ],
        [
          123.60647535040866,
          9.878536273081817
        ],
        [
          123.607,
          9.879
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 9.878,
        "longitude": 123.60605,
        "name": "Waypoint 1",
        "description": "Forest trek",
        "elevation_m": 242
      }
    ],
    "elevation_profile": [
      {
        "latitude": 9.877,
        "longitude": 123.6051,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 9.877531679126184,
        "longitude": 123.60553532932553,
        "elevation_m": 148,
        "distance_from_start_km": 0.125
      },
      {
        "latitude": 9.878,
        "longitude": 123.60605,
        "elevation_m": 195,
        "distance_from_start_km": 0.25
      },
      {
        "latitude": 9.878536273081817,
        "longitude": 123.60647535040866,
        "elevation_m": 243,
        "distance_from_start_km": 0.375
      },
      {
        "latitude": 9.879,
        "longitude": 123.607,
        "elevation_m": 290,
        "distance_from_start_km": 0.5
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 5,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 1
    }
  },
  {
    "id": "lantoy-ridge-walk",
    "route_id": "lantoy-ridge-walk",
    "hikingSpotId": "77",
    "hiking_spot_id": "77",
    "route_name": "Lantoy Ridge Walk",
    "difficulty": "Easy-Moderate",
    "start_coordinates": {
      "latitude": 9.875,
      "longitude": 123.6032
    },
    "end_coordinates": {
      "latitude": 9.879,
      "longitude": 123.607
    },
    "distance_km": 3.5,
    "elevation_gain_m": 280,
    "estimated_duration_hr": 1.9,
    "highlights": "Rolling ridge, farmland",
    "route_color": "#FF9800",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.6032,
          9.875
        ],
        [
          123.60371352601982,
          9.875542477825174
        ],
        [
          123.60430037963654,
          9.876119185381977
        ],
        [
          123.60488248131527,
          9.876726650822675
        ],
        [
          123.60531989112886,
          9.87725561966552
        ],
        [
          123.6059482939195,
          9.877995822808828
        ],
        [
          123.60641819457487,
          9.878486299539176
        ],
        [
          123.607,
          9.879
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 9.876119185381977,
        "longitude": 123.60430037963654,
        "name": "Waypoint 1",
        "description": "Rolling ridge",
        "elevation_m": 112
      },
      {
        "latitude": 9.877995822808828,
        "longitude": 123.6059482939195,
        "name": "Waypoint 2",
        "description": " farmland",
        "elevation_m": 176
      }
    ],
    "elevation_profile": [
      {
        "latitude": 9.875,
        "longitude": 123.6032,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 9.875542477825174,
        "longitude": 123.60371352601982,
        "elevation_m": 167,
        "distance_from_start_km": 0.11428571428571428
      },
      {
        "latitude": 9.876119185381977,
        "longitude": 123.60430037963654,
        "elevation_m": 168,
        "distance_from_start_km": 0.22857142857142856
      },
      {
        "latitude": 9.876726650822675,
        "longitude": 123.60488248131527,
        "elevation_m": 198,
        "distance_from_start_km": 0.34285714285714286
      },
      {
        "latitude": 9.87725561966552,
        "longitude": 123.60531989112886,
        "elevation_m": 282,
        "distance_from_start_km": 0.45714285714285713
      },
      {
        "latitude": 9.877995822808828,
        "longitude": 123.6059482939195,
        "elevation_m": 312,
        "distance_from_start_km": 0.5714285714285715
      },
      {
        "latitude": 9.878486299539176,
        "longitude": 123.60641819457487,
        "elevation_m": 313,
        "distance_from_start_km": 0.6857142857142857
      },
      {
        "latitude": 9.879,
        "longitude": 123.607,
        "elevation_m": 380,
        "distance_from_start_km": 0.8
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 8,
      "path_smoothness": "smooth",
      "terrain_type": "ridge",
      "scenic_rating": 5,
      "technical_difficulty": 2
    }
  },
  {
    "id": "lantoy-summit-loop",
    "route_id": "lantoy-summit-loop",
    "hikingSpotId": "77",
    "hiking_spot_id": "77",
    "route_name": "Lantoy Summit Loop",
    "difficulty": "Moderate",
    "start_coordinates": {
      "latitude": 9.873,
      "longitude": 123.6013
    },
    "end_coordinates": {
      "latitude": 9.881,
      "longitude": 123.609
    },
    "distance_km": 4.8,
    "elevation_gain_m": 440,
    "estimated_duration_hr": 2.6,
    "highlights": "Summit views, ridge line",
    "route_color": "#2196F3",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.6013,
          9.873
        ],
        [
          123.60196866096308,
          9.873541158137217
        ],
        [
          123.60238469407251,
          9.87424045122522
        ],
        [
          123.6030686793013,
          9.87504191222807
        ],
        [
          123.60363041642631,
          9.875447044974457
        ],
        [
          123.60425790621801,
          9.876158337060078
        ],
        [
          123.60488106282956,
          9.876704786044954
        ],
        [
          123.60542534087041,
          9.877320909800185
        ],
        [
          123.6060618397372,
          9.877848286151732
        ],
        [
          123.60673969164925,
          9.878711088888256
        ],
        [
          123.6073955953939,
          9.879079375021922
        ],
        [
          123.6076757463358,
          9.879677686222525
        ],
        [
          123.6084909430976,
          9.880318726538038
        ],
        [
          123.609,
          9.881
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 9.87504191222807,
        "longitude": 123.6030686793013,
        "name": "Waypoint 1",
        "description": "Summit views",
        "elevation_m": 250
      },
      {
        "latitude": 9.877320909800185,
        "longitude": 123.60542534087041,
        "name": "Waypoint 2",
        "description": " ridge line",
        "elevation_m": 163
      },
      {
        "latitude": 9.879079375021922,
        "longitude": 123.6073955953939,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 139
      }
    ],
    "elevation_profile": [
      {
        "latitude": 9.873,
        "longitude": 123.6013,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 9.873541158137217,
        "longitude": 123.60196866096308,
        "elevation_m": 170,
        "distance_from_start_km": 0.10769230769230771
      },
      {
        "latitude": 9.87424045122522,
        "longitude": 123.60238469407251,
        "elevation_m": 209,
        "distance_from_start_km": 0.21538461538461542
      },
      {
        "latitude": 9.87504191222807,
        "longitude": 123.6030686793013,
        "elevation_m": 212,
        "distance_from_start_km": 0.3230769230769231
      },
      {
        "latitude": 9.875447044974457,
        "longitude": 123.60363041642631,
        "elevation_m": 206,
        "distance_from_start_km": 0.43076923076923085
      },
      {
        "latitude": 9.876158337060078,
        "longitude": 123.60425790621801,
        "elevation_m": 226,
        "distance_from_start_km": 0.5384615384615385
      },
      {
        "latitude": 9.876704786044954,
        "longitude": 123.60488106282956,
        "elevation_m": 283,
        "distance_from_start_km": 0.6461538461538462
      },
      {
        "latitude": 9.877320909800185,
        "longitude": 123.60542534087041,
        "elevation_m": 357,
        "distance_from_start_km": 0.7538461538461538
      },
      {
        "latitude": 9.877848286151732,
        "longitude": 123.6060618397372,
        "elevation_m": 414,
        "distance_from_start_km": 0.8615384615384617
      },
      {
        "latitude": 9.878711088888256,
        "longitude": 123.60673969164925,
        "elevation_m": 434,
        "distance_from_start_km": 0.9692307692307692
      },
      {
        "latitude": 9.879079375021922,
        "longitude": 123.6073955953939,
        "elevation_m": 428,
        "distance_from_start_km": 1.076923076923077
      },
      {
        "latitude": 9.879677686222525,
        "longitude": 123.6076757463358,
        "elevation_m": 431,
        "distance_from_start_km": 1.1846153846153846
      },
      {
        "latitude": 9.880318726538038,
        "longitude": 123.6084909430976,
        "elevation_m": 470,
        "distance_from_start_km": 1.2923076923076924
      },
      {
        "latitude": 9.881,
        "longitude": 123.609,
        "elevation_m": 540,
        "distance_from_start_km": 1.4000000000000001
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 14,
      "path_smoothness": "smooth",
      "terrain_type": "ridge",
      "scenic_rating": 3,
      "technical_difficulty": 3
    }
  },
  {
    "id": "lanaya-direct-ascent",
    "route_id": "lanaya-direct-ascent",
    "hikingSpotId": "80",
    "hiking_spot_id": "80",
    "route_name": "Lanaya Direct Ascent",
    "difficulty": "Moderate",
    "start_coordinates": {
      "latitude": 9.6451,
      "longitude": 123.3662
    },
    "end_coordinates": {
      "latitude": 9.647,
      "longitude": 123.368
    },
    "distance_km": 2.5,
    "elevation_gain_m": 320,
    "estimated_duration_hr": 1.5,
    "highlights": "Steep forest climb",
    "route_color": "#2196F3",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.3662,
          9.6451
        ],
        [
          123.36655563024489,
          9.645527115113254
        ],
        [
          123.36669412808172,
          9.645791031434955
        ],
        [
          123.36697303784602,
          9.645943533011462
        ],
        [
          123.36715617135921,
          9.646117488213536
        ],
        [
          123.36767919378359,
          9.646335718517166
        ],
        [
          123.36761472857405,
          9.646592848269783
        ],
        [
          123.368,
          9.647
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 9.645791031434955,
        "longitude": 123.36669412808172,
        "name": "Waypoint 1",
        "description": "Steep forest climb",
        "elevation_m": 157
      },
      {
        "latitude": 9.646335718517166,
        "longitude": 123.36767919378359,
        "name": "Waypoint 2",
        "description": "Trail waypoint",
        "elevation_m": 219
      }
    ],
    "elevation_profile": [
      {
        "latitude": 9.6451,
        "longitude": 123.3662,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 9.645527115113254,
        "longitude": 123.36655563024489,
        "elevation_m": 177,
        "distance_from_start_km": 0.11428571428571428
      },
      {
        "latitude": 9.645791031434955,
        "longitude": 123.36669412808172,
        "elevation_m": 178,
        "distance_from_start_km": 0.22857142857142856
      },
      {
        "latitude": 9.645943533011462,
        "longitude": 123.36697303784602,
        "elevation_m": 212,
        "distance_from_start_km": 0.34285714285714286
      },
      {
        "latitude": 9.646117488213536,
        "longitude": 123.36715617135921,
        "elevation_m": 308,
        "distance_from_start_km": 0.45714285714285713
      },
      {
        "latitude": 9.646335718517166,
        "longitude": 123.36767919378359,
        "elevation_m": 342,
        "distance_from_start_km": 0.5714285714285715
      },
      {
        "latitude": 9.646592848269783,
        "longitude": 123.36761472857405,
        "elevation_m": 343,
        "distance_from_start_km": 0.6857142857142857
      },
      {
        "latitude": 9.647,
        "longitude": 123.368,
        "elevation_m": 420,
        "distance_from_start_km": 0.8
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 8,
      "path_smoothness": "smooth",
      "terrain_type": "forest",
      "scenic_rating": 5,
      "technical_difficulty": 3
    }
  },
  {
    "id": "lanaya-ridge-trail",
    "route_id": "lanaya-ridge-trail",
    "hikingSpotId": "80",
    "hiking_spot_id": "80",
    "route_name": "Lanaya Ridge Trail",
    "difficulty": "Hard",
    "start_coordinates": {
      "latitude": 9.6432,
      "longitude": 123.3644
    },
    "end_coordinates": {
      "latitude": 9.647,
      "longitude": 123.368
    },
    "distance_km": 3.7,
    "elevation_gain_m": 500,
    "estimated_duration_hr": 2.2,
    "highlights": "Ridge line, coastal views",
    "route_color": "#F44336",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.3644,
          9.6432
        ],
        [
          123.36463119182847,
          9.643394346225746
        ],
        [
          123.36524631482904,
          9.643727349012147
        ],
        [
          123.36530415279263,
          9.644353653743687
        ],
        [
          123.36572935801829,
          9.644747828339069
        ],
        [
          123.36607219198642,
          9.644908946631329
        ],
        [
          123.36639061664613,
          9.64518999544708
        ],
        [
          123.36684904825918,
          9.645796482238515
        ],
        [
          123.36725638270028,
          9.646211703379972
        ],
        [
          123.36740055563615,
          9.646353691955845
        ],
        [
          123.36769375582463,
          9.64680042154565
        ],
        [
          123.368,
          9.647
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 9.644353653743687,
        "longitude": 123.36530415279263,
        "name": "Waypoint 1",
        "description": "Ridge line",
        "elevation_m": 101
      },
      {
        "latitude": 9.64518999544708,
        "longitude": 123.36639061664613,
        "name": "Waypoint 2",
        "description": " coastal views",
        "elevation_m": 298
      },
      {
        "latitude": 9.646353691955845,
        "longitude": 123.36740055563615,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 175
      }
    ],
    "elevation_profile": [
      {
        "latitude": 9.6432,
        "longitude": 123.3644,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 9.643394346225746,
        "longitude": 123.36463119182847,
        "elevation_m": 191,
        "distance_from_start_km": 0.10909090909090909
      },
      {
        "latitude": 9.643727349012147,
        "longitude": 123.36524631482904,
        "elevation_m": 229,
        "distance_from_start_km": 0.21818181818181817
      },
      {
        "latitude": 9.644353653743687,
        "longitude": 123.36530415279263,
        "elevation_m": 222,
        "distance_from_start_km": 0.32727272727272727
      },
      {
        "latitude": 9.644747828339069,
        "longitude": 123.36572935801829,
        "elevation_m": 232,
        "distance_from_start_km": 0.43636363636363634
      },
      {
        "latitude": 9.644908946631329,
        "longitude": 123.36607219198642,
        "elevation_m": 300,
        "distance_from_start_km": 0.5454545454545454
      },
      {
        "latitude": 9.64518999544708,
        "longitude": 123.36639061664613,
        "elevation_m": 400,
        "distance_from_start_km": 0.6545454545454545
      },
      {
        "latitude": 9.645796482238515,
        "longitude": 123.36684904825918,
        "elevation_m": 468,
        "distance_from_start_km": 0.7636363636363637
      },
      {
        "latitude": 9.646211703379972,
        "longitude": 123.36725638270028,
        "elevation_m": 478,
        "distance_from_start_km": 0.8727272727272727
      },
      {
        "latitude": 9.646353691955845,
        "longitude": 123.36740055563615,
        "elevation_m": 471,
        "distance_from_start_km": 0.9818181818181819
      },
      {
        "latitude": 9.64680042154565,
        "longitude": 123.36769375582463,
        "elevation_m": 509,
        "distance_from_start_km": 1.0909090909090908
      },
      {
        "latitude": 9.647,
        "longitude": 123.368,
        "elevation_m": 600,
        "distance_from_start_km": 1.2000000000000002
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 12,
      "path_smoothness": "moderate",
      "terrain_type": "mixed",
      "scenic_rating": 3,
      "technical_difficulty": 4
    }
  },
  {
    "id": "lanaya-summit-traverse",
    "route_id": "lanaya-summit-traverse",
    "hikingSpotId": "80",
    "hiking_spot_id": "80",
    "route_name": "Lanaya Summit Traverse",
    "difficulty": "Very Hard",
    "start_coordinates": {
      "latitude": 9.6413,
      "longitude": 123.3626
    },
    "end_coordinates": {
      "latitude": 9.6489,
      "longitude": 123.3698
    },
    "distance_km": 6.1,
    "elevation_gain_m": 730,
    "estimated_duration_hr": 3.6,
    "highlights": "Summit views, ocean cliffs",
    "route_color": "#9C27B0",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.3626,
          9.6413
        ],
        [
          123.3628333187608,
          9.641665160386237
        ],
        [
          123.36341404899042,
          9.64180858337059
        ],
        [
          123.36370574494288,
          9.642212633941458
        ],
        [
          123.36413121101485,
          9.6424978179471
        ],
        [
          123.36392895929615,
          9.643069979871154
        ],
        [
          123.36455152418363,
          9.643061166703106
        ],
        [
          123.3647587807869,
          9.643806323753374
        ],
        [
          123.36534278262965,
          9.643737525035759
        ],
        [
          123.36563137514761,
          9.644473084171993
        ],
        [
          123.36580282704543,
          9.644671185593095
        ],
        [
          123.36606918942923,
          9.64490405652594
        ],
        [
          123.3663805093484,
          9.645278099343132
        ],
        [
          123.36663254500348,
          9.64555257970213
        ],
        [
          123.36714954800344,
          9.646010211026207
        ],
        [
          123.36717924512256,
          9.646532553002071
        ],
        [
          123.36729943211253,
          9.646219920575025
        ],
        [
          123.36798354095343,
          9.647174726261133
        ],
        [
          123.3680570898336,
          9.647590026672557
        ],
        [
          123.36843126114533,
          9.647712232750502
        ],
        [
          123.36901893067548,
          9.648143406911108
        ],
        [
          123.36896993258118,
          9.64836709629304
        ],
        [
          123.36948817190456,
          9.648640917832923
        ],
        [
          123.3698,
          9.6489
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 9.643061166703106,
        "longitude": 123.36455152418363,
        "name": "Waypoint 1",
        "description": "Summit views",
        "elevation_m": 141
      },
      {
        "latitude": 9.645278099343132,
        "longitude": 123.3663805093484,
        "name": "Waypoint 2",
        "description": " ocean cliffs",
        "elevation_m": 171
      },
      {
        "latitude": 9.647590026672557,
        "longitude": 123.3680570898336,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 125
      }
    ],
    "elevation_profile": [
      {
        "latitude": 9.6413,
        "longitude": 123.3626,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 9.641665160386237,
        "longitude": 123.3628333187608,
        "elevation_m": 170,
        "distance_from_start_km": 0.10434782608695653
      },
      {
        "latitude": 9.64180858337059,
        "longitude": 123.36341404899042,
        "elevation_m": 228,
        "distance_from_start_km": 0.20869565217391306
      },
      {
        "latitude": 9.642212633941458,
        "longitude": 123.36370574494288,
        "elevation_m": 268,
        "distance_from_start_km": 0.31304347826086953
      },
      {
        "latitude": 9.6424978179471,
        "longitude": 123.36413121101485,
        "elevation_m": 287,
        "distance_from_start_km": 0.4173913043478261
      },
      {
        "latitude": 9.643069979871154,
        "longitude": 123.36392895929615,
        "elevation_m": 288,
        "distance_from_start_km": 0.5217391304347826
      },
      {
        "latitude": 9.643061166703106,
        "longitude": 123.36455152418363,
        "elevation_m": 280,
        "distance_from_start_km": 0.6260869565217391
      },
      {
        "latitude": 9.643806323753374,
        "longitude": 123.3647587807869,
        "elevation_m": 276,
        "distance_from_start_km": 0.7304347826086958
      },
      {
        "latitude": 9.643737525035759,
        "longitude": 123.36534278262965,
        "elevation_m": 285,
        "distance_from_start_km": 0.8347826086956522
      },
      {
        "latitude": 9.644473084171993,
        "longitude": 123.36563137514761,
        "elevation_m": 314,
        "distance_from_start_km": 0.9391304347826088
      },
      {
        "latitude": 9.644671185593095,
        "longitude": 123.36580282704543,
        "elevation_m": 364,
        "distance_from_start_km": 1.0434782608695652
      },
      {
        "latitude": 9.64490405652594,
        "longitude": 123.36606918942923,
        "elevation_m": 429,
        "distance_from_start_km": 1.147826086956522
      },
      {
        "latitude": 9.645278099343132,
        "longitude": 123.3663805093484,
        "elevation_m": 501,
        "distance_from_start_km": 1.2521739130434781
      },
      {
        "latitude": 9.64555257970213,
        "longitude": 123.36663254500348,
        "elevation_m": 566,
        "distance_from_start_km": 1.356521739130435
      },
      {
        "latitude": 9.646010211026207,
        "longitude": 123.36714954800344,
        "elevation_m": 616,
        "distance_from_start_km": 1.4608695652173915
      },
      {
        "latitude": 9.646532553002071,
        "longitude": 123.36717924512256,
        "elevation_m": 645,
        "distance_from_start_km": 1.565217391304348
      },
      {
        "latitude": 9.646219920575025,
        "longitude": 123.36729943211253,
        "elevation_m": 654,
        "distance_from_start_km": 1.6695652173913045
      },
      {
        "latitude": 9.647174726261133,
        "longitude": 123.36798354095343,
        "elevation_m": 650,
        "distance_from_start_km": 1.773913043478261
      },
      {
        "latitude": 9.647590026672557,
        "longitude": 123.3680570898336,
        "elevation_m": 642,
        "distance_from_start_km": 1.8782608695652177
      },
      {
        "latitude": 9.647712232750502,
        "longitude": 123.36843126114533,
        "elevation_m": 643,
        "distance_from_start_km": 1.982608695652174
      },
      {
        "latitude": 9.648143406911108,
        "longitude": 123.36901893067548,
        "elevation_m": 662,
        "distance_from_start_km": 2.0869565217391304
      },
      {
        "latitude": 9.64836709629304,
        "longitude": 123.36896993258118,
        "elevation_m": 702,
        "distance_from_start_km": 2.1913043478260867
      },
      {
        "latitude": 9.648640917832923,
        "longitude": 123.36948817190456,
        "elevation_m": 760,
        "distance_from_start_km": 2.295652173913044
      },
      {
        "latitude": 9.6489,
        "longitude": 123.3698,
        "elevation_m": 830,
        "distance_from_start_km": 2.4000000000000004
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 24,
      "path_smoothness": "rough",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 5
    }
  },
  {
    "id": "mauyog-easy-trail",
    "route_id": "mauyog-easy-trail",
    "hikingSpotId": "79",
    "hiking_spot_id": "79",
    "route_name": "Mauyog Easy Trail",
    "difficulty": "Easy",
    "start_coordinates": {
      "latitude": 10.431,
      "longitude": 123.8541
    },
    "end_coordinates": {
      "latitude": 10.433,
      "longitude": 123.856
    },
    "distance_km": 2,
    "elevation_gain_m": 200,
    "estimated_duration_hr": 1.2,
    "highlights": "Forested climb",
    "route_color": "#4CAF50",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8541,
          10.431
        ],
        [
          123.8546050466805,
          10.43146921180724
        ],
        [
          123.85505,
          10.431999999999999
        ],
        [
          123.85557425930246,
          10.432587279169935
        ],
        [
          123.856,
          10.433
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.431999999999999,
        "longitude": 123.85505,
        "name": "Waypoint 1",
        "description": "Forested climb",
        "elevation_m": 148
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.431,
        "longitude": 123.8541,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.43146921180724,
        "longitude": 123.8546050466805,
        "elevation_m": 150,
        "distance_from_start_km": 0.125
      },
      {
        "latitude": 10.431999999999999,
        "longitude": 123.85505,
        "elevation_m": 200,
        "distance_from_start_km": 0.25
      },
      {
        "latitude": 10.432587279169935,
        "longitude": 123.85557425930246,
        "elevation_m": 250,
        "distance_from_start_km": 0.375
      },
      {
        "latitude": 10.433,
        "longitude": 123.856,
        "elevation_m": 300,
        "distance_from_start_km": 0.5
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 5,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 1
    }
  },
  {
    "id": "mauyog-rock-path",
    "route_id": "mauyog-rock-path",
    "hikingSpotId": "79",
    "hiking_spot_id": "79",
    "route_name": "Mauyog Rock Path",
    "difficulty": "Moderate",
    "start_coordinates": {
      "latitude": 10.429,
      "longitude": 123.8522
    },
    "end_coordinates": {
      "latitude": 10.433,
      "longitude": 123.856
    },
    "distance_km": 3.2,
    "elevation_gain_m": 320,
    "estimated_duration_hr": 1.8,
    "highlights": "Rock formations, ridges",
    "route_color": "#2196F3",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8522,
          10.429
        ],
        [
          123.85258900280004,
          10.42956580897165
        ],
        [
          123.85323196357994,
          10.429945985642975
        ],
        [
          123.85360933736669,
          10.43052733969779
        ],
        [
          123.85409999999999,
          10.431000000000001
        ],
        [
          123.85445941857861,
          10.431618999924229
        ],
        [
          123.85500847371739,
          10.432115385971416
        ],
        [
          123.85560854032845,
          10.432604863430923
        ],
        [
          123.856,
          10.433
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.429945985642975,
        "longitude": 123.85323196357994,
        "name": "Waypoint 1",
        "description": "Rock formations",
        "elevation_m": 161
      },
      {
        "latitude": 10.431000000000001,
        "longitude": 123.85409999999999,
        "name": "Waypoint 2",
        "description": " ridges",
        "elevation_m": 139
      },
      {
        "latitude": 10.432115385971416,
        "longitude": 123.85500847371739,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 156
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.429,
        "longitude": 123.8522,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.42956580897165,
        "longitude": 123.85258900280004,
        "elevation_m": 172,
        "distance_from_start_km": 0.1125
      },
      {
        "latitude": 10.429945985642975,
        "longitude": 123.85323196357994,
        "elevation_m": 180,
        "distance_from_start_km": 0.225
      },
      {
        "latitude": 10.43052733969779,
        "longitude": 123.85360933736669,
        "elevation_m": 188,
        "distance_from_start_km": 0.3375
      },
      {
        "latitude": 10.431000000000001,
        "longitude": 123.85409999999999,
        "elevation_m": 260,
        "distance_from_start_km": 0.45
      },
      {
        "latitude": 10.431618999924229,
        "longitude": 123.85445941857861,
        "elevation_m": 332,
        "distance_from_start_km": 0.5625
      },
      {
        "latitude": 10.432115385971416,
        "longitude": 123.85500847371739,
        "elevation_m": 340,
        "distance_from_start_km": 0.675
      },
      {
        "latitude": 10.432604863430923,
        "longitude": 123.85560854032845,
        "elevation_m": 348,
        "distance_from_start_km": 0.7875000000000001
      },
      {
        "latitude": 10.433,
        "longitude": 123.856,
        "elevation_m": 420,
        "distance_from_start_km": 0.9
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 9,
      "path_smoothness": "smooth",
      "terrain_type": "ridge",
      "scenic_rating": 5,
      "technical_difficulty": 3
    }
  },
  {
    "id": "mauyog-manunggal-traverse",
    "route_id": "mauyog-manunggal-traverse",
    "hikingSpotId": "79",
    "hiking_spot_id": "79",
    "route_name": "Mauyog to Manunggal Traverse",
    "difficulty": "Hard",
    "start_coordinates": {
      "latitude": 10.427,
      "longitude": 123.8503
    },
    "end_coordinates": {
      "latitude": 10.435,
      "longitude": 123.8579
    },
    "distance_km": 5.5,
    "elevation_gain_m": 600,
    "estimated_duration_hr": 3,
    "highlights": "Summit traverse, linked to Mt Manunggal",
    "route_color": "#F44336",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8503,
          10.427
        ],
        [
          123.85071820626361,
          10.42735899266299
        ],
        [
          123.85104329780874,
          10.42775816411331
        ],
        [
          123.85144768223704,
          10.428233305751322
        ],
        [
          123.85182609836798,
          10.428813807613507
        ],
        [
          123.85262600052562,
          10.429479778214272
        ],
        [
          123.85290580476523,
          10.42947674842855
        ],
        [
          123.85342852936746,
          10.430009418435503
        ],
        [
          123.8536968110669,
          10.430533996776859
        ],
        [
          123.8541,
          10.431000000000001
        ],
        [
          123.85447197449115,
          10.431513729389392
        ],
        [
          123.85477856597815,
          10.431987864722977
        ],
        [
          123.85550655303992,
          10.432336252353199
        ],
        [
          123.85597305013113,
          10.43282722392811
        ],
        [
          123.85633172683413,
          10.432999620963615
        ],
        [
          123.85653761277256,
          10.43369217131991
        ],
        [
          123.85720408575668,
          10.43426663136903
        ],
        [
          123.85750271911795,
          10.434593101549002
        ],
        [
          123.8579,
          10.435
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.428813807613507,
        "longitude": 123.85182609836798,
        "name": "Waypoint 1",
        "description": "Summit traverse",
        "elevation_m": 272
      },
      {
        "latitude": 10.431000000000001,
        "longitude": 123.8541,
        "name": "Waypoint 2",
        "description": " linked to Mt Manunggal",
        "elevation_m": 185
      },
      {
        "latitude": 10.432999620963615,
        "longitude": 123.85633172683413,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 272
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.427,
        "longitude": 123.8503,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.42735899266299,
        "longitude": 123.85071820626361,
        "elevation_m": 172,
        "distance_from_start_km": 0.10555555555555557
      },
      {
        "latitude": 10.42775816411331,
        "longitude": 123.85104329780874,
        "elevation_m": 226,
        "distance_from_start_km": 0.21111111111111114
      },
      {
        "latitude": 10.428233305751322,
        "longitude": 123.85144768223704,
        "elevation_m": 252,
        "distance_from_start_km": 0.31666666666666665
      },
      {
        "latitude": 10.428813807613507,
        "longitude": 123.85182609836798,
        "elevation_m": 254,
        "distance_from_start_km": 0.4222222222222223
      },
      {
        "latitude": 10.429479778214272,
        "longitude": 123.85262600052562,
        "elevation_m": 246,
        "distance_from_start_km": 0.5277777777777778
      },
      {
        "latitude": 10.42947674842855,
        "longitude": 123.85290580476523,
        "elevation_m": 248,
        "distance_from_start_km": 0.6333333333333333
      },
      {
        "latitude": 10.430009418435503,
        "longitude": 123.85342852936746,
        "elevation_m": 274,
        "distance_from_start_km": 0.7388888888888889
      },
      {
        "latitude": 10.430533996776859,
        "longitude": 123.8536968110669,
        "elevation_m": 328,
        "distance_from_start_km": 0.8444444444444446
      },
      {
        "latitude": 10.431000000000001,
        "longitude": 123.8541,
        "elevation_m": 400,
        "distance_from_start_km": 0.9500000000000001
      },
      {
        "latitude": 10.431513729389392,
        "longitude": 123.85447197449115,
        "elevation_m": 472,
        "distance_from_start_km": 1.0555555555555556
      },
      {
        "latitude": 10.431987864722977,
        "longitude": 123.85477856597815,
        "elevation_m": 526,
        "distance_from_start_km": 1.1611111111111112
      },
      {
        "latitude": 10.432336252353199,
        "longitude": 123.85550655303992,
        "elevation_m": 552,
        "distance_from_start_km": 1.2666666666666666
      },
      {
        "latitude": 10.43282722392811,
        "longitude": 123.85597305013113,
        "elevation_m": 554,
        "distance_from_start_km": 1.3722222222222222
      },
      {
        "latitude": 10.432999620963615,
        "longitude": 123.85633172683413,
        "elevation_m": 546,
        "distance_from_start_km": 1.4777777777777779
      },
      {
        "latitude": 10.43369217131991,
        "longitude": 123.85653761277256,
        "elevation_m": 548,
        "distance_from_start_km": 1.5833333333333335
      },
      {
        "latitude": 10.43426663136903,
        "longitude": 123.85720408575668,
        "elevation_m": 574,
        "distance_from_start_km": 1.688888888888889
      },
      {
        "latitude": 10.434593101549002,
        "longitude": 123.85750271911795,
        "elevation_m": 628,
        "distance_from_start_km": 1.7944444444444443
      },
      {
        "latitude": 10.435,
        "longitude": 123.8579,
        "elevation_m": 700,
        "distance_from_start_km": 1.9000000000000001
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 19,
      "path_smoothness": "moderate",
      "terrain_type": "mixed",
      "scenic_rating": 4,
      "technical_difficulty": 4
    }
  },
  {
    "id": "kapayas-forest-path",
    "route_id": "kapayas-forest-path",
    "hikingSpotId": "76",
    "hiking_spot_id": "76",
    "route_name": "Kapayas Forest Path",
    "difficulty": "Easy",
    "start_coordinates": {
      "latitude": 10.7441,
      "longitude": 124.0045
    },
    "end_coordinates": {
      "latitude": 10.747,
      "longitude": 124.007
    },
    "distance_km": 2.3,
    "elevation_gain_m": 170,
    "estimated_duration_hr": 1.3,
    "highlights": "Dense forest",
    "route_color": "#4CAF50",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          124.0045,
          10.7441
        ],
        [
          124.00510283348707,
          10.744907034604381
        ],
        [
          124.00575,
          10.74555
        ],
        [
          124.00637915557715,
          10.746311335564656
        ],
        [
          124.007,
          10.747
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.74555,
        "longitude": 124.00575,
        "name": "Waypoint 1",
        "description": "Dense forest",
        "elevation_m": 204
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.7441,
        "longitude": 124.0045,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.744907034604381,
        "longitude": 124.00510283348707,
        "elevation_m": 143,
        "distance_from_start_km": 0.125
      },
      {
        "latitude": 10.74555,
        "longitude": 124.00575,
        "elevation_m": 185,
        "distance_from_start_km": 0.25
      },
      {
        "latitude": 10.746311335564656,
        "longitude": 124.00637915557715,
        "elevation_m": 228,
        "distance_from_start_km": 0.375
      },
      {
        "latitude": 10.747,
        "longitude": 124.007,
        "elevation_m": 270,
        "distance_from_start_km": 0.5
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 5,
      "path_smoothness": "smooth",
      "terrain_type": "forest",
      "scenic_rating": 4,
      "technical_difficulty": 1
    }
  },
  {
    "id": "kapayas-ridge-walk",
    "route_id": "kapayas-ridge-walk",
    "hikingSpotId": "76",
    "hiking_spot_id": "76",
    "route_name": "Kapayas Ridge Walk",
    "difficulty": "Easy-Moderate",
    "start_coordinates": {
      "latitude": 10.742,
      "longitude": 124.0021
    },
    "end_coordinates": {
      "latitude": 10.747,
      "longitude": 124.007
    },
    "distance_km": 3.4,
    "elevation_gain_m": 260,
    "estimated_duration_hr": 1.9,
    "highlights": "Ridge walk, panoramic views",
    "route_color": "#FF9800",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          124.0021,
          10.742
        ],
        [
          124.00288721656965,
          10.74275876564411
        ],
        [
          124.00351847950827,
          10.743362697791634
        ],
        [
          124.00414763203133,
          10.744176842240282
        ],
        [
          124.00484807454126,
          10.744890600458163
        ],
        [
          124.00561098734508,
          10.74570307896959
        ],
        [
          124.00622147636878,
          10.74632473868424
        ],
        [
          124.007,
          10.747
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.743362697791634,
        "longitude": 124.00351847950827,
        "name": "Waypoint 1",
        "description": "Ridge walk",
        "elevation_m": 191
      },
      {
        "latitude": 10.74570307896959,
        "longitude": 124.00561098734508,
        "name": "Waypoint 2",
        "description": " panoramic views",
        "elevation_m": 233
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.742,
        "longitude": 124.0021,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.74275876564411,
        "longitude": 124.00288721656965,
        "elevation_m": 162,
        "distance_from_start_km": 0.11428571428571428
      },
      {
        "latitude": 10.743362697791634,
        "longitude": 124.00351847950827,
        "elevation_m": 163,
        "distance_from_start_km": 0.22857142857142856
      },
      {
        "latitude": 10.744176842240282,
        "longitude": 124.00414763203133,
        "elevation_m": 191,
        "distance_from_start_km": 0.34285714285714286
      },
      {
        "latitude": 10.744890600458163,
        "longitude": 124.00484807454126,
        "elevation_m": 269,
        "distance_from_start_km": 0.45714285714285713
      },
      {
        "latitude": 10.74570307896959,
        "longitude": 124.00561098734508,
        "elevation_m": 297,
        "distance_from_start_km": 0.5714285714285715
      },
      {
        "latitude": 10.74632473868424,
        "longitude": 124.00622147636878,
        "elevation_m": 298,
        "distance_from_start_km": 0.6857142857142857
      },
      {
        "latitude": 10.747,
        "longitude": 124.007,
        "elevation_m": 360,
        "distance_from_start_km": 0.8
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 8,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 2
    }
  },
  {
    "id": "kapayas-summit-circuit",
    "route_id": "kapayas-summit-circuit",
    "hikingSpotId": "76",
    "hiking_spot_id": "76",
    "route_name": "Kapayas Summit Circuit",
    "difficulty": "Moderate",
    "start_coordinates": {
      "latitude": 10.74,
      "longitude": 124
    },
    "end_coordinates": {
      "latitude": 10.749,
      "longitude": 124.009
    },
    "distance_km": 4.9,
    "elevation_gain_m": 450,
    "estimated_duration_hr": 2.6,
    "highlights": "Summit view, limestone ridges",
    "route_color": "#2196F3",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          124,
          10.74
        ],
        [
          124.00064644137926,
          10.740699434259671
        ],
        [
          124.00153947091336,
          10.741237395920589
        ],
        [
          124.00192246732173,
          10.742167849959198
        ],
        [
          124.00276203514983,
          10.742682878619839
        ],
        [
          124.0035030013595,
          10.743351354535934
        ],
        [
          124.00416601655564,
          10.744196292121629
        ],
        [
          124.00482970119596,
          10.744844598066647
        ],
        [
          124.00547583873737,
          10.745632541450824
        ],
        [
          124.00619878581806,
          10.746250314383387
        ],
        [
          124.00707260566644,
          10.746833964760171
        ],
        [
          124.00768696083634,
          10.747769561507821
        ],
        [
          124.00833836914006,
          10.748313494162717
        ],
        [
          124.009,
          10.749
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.742167849959198,
        "longitude": 124.00192246732173,
        "name": "Waypoint 1",
        "description": "Summit view",
        "elevation_m": 149
      },
      {
        "latitude": 10.744844598066647,
        "longitude": 124.00482970119596,
        "name": "Waypoint 2",
        "description": " limestone ridges",
        "elevation_m": 212
      },
      {
        "latitude": 10.746833964760171,
        "longitude": 124.00707260566644,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 250
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.74,
        "longitude": 124,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.740699434259671,
        "longitude": 124.00064644137926,
        "elevation_m": 172,
        "distance_from_start_km": 0.10769230769230771
      },
      {
        "latitude": 10.741237395920589,
        "longitude": 124.00153947091336,
        "elevation_m": 211,
        "distance_from_start_km": 0.21538461538461542
      },
      {
        "latitude": 10.742167849959198,
        "longitude": 124.00192246732173,
        "elevation_m": 215,
        "distance_from_start_km": 0.3230769230769231
      },
      {
        "latitude": 10.742682878619839,
        "longitude": 124.00276203514983,
        "elevation_m": 209,
        "distance_from_start_km": 0.43076923076923085
      },
      {
        "latitude": 10.743351354535934,
        "longitude": 124.0035030013595,
        "elevation_m": 228,
        "distance_from_start_km": 0.5384615384615385
      },
      {
        "latitude": 10.744196292121629,
        "longitude": 124.00416601655564,
        "elevation_m": 287,
        "distance_from_start_km": 0.6461538461538462
      },
      {
        "latitude": 10.744844598066647,
        "longitude": 124.00482970119596,
        "elevation_m": 363,
        "distance_from_start_km": 0.7538461538461538
      },
      {
        "latitude": 10.745632541450824,
        "longitude": 124.00547583873737,
        "elevation_m": 422,
        "distance_from_start_km": 0.8615384615384617
      },
      {
        "latitude": 10.746250314383387,
        "longitude": 124.00619878581806,
        "elevation_m": 441,
        "distance_from_start_km": 0.9692307692307692
      },
      {
        "latitude": 10.746833964760171,
        "longitude": 124.00707260566644,
        "elevation_m": 435,
        "distance_from_start_km": 1.076923076923077
      },
      {
        "latitude": 10.747769561507821,
        "longitude": 124.00768696083634,
        "elevation_m": 439,
        "distance_from_start_km": 1.1846153846153846
      },
      {
        "latitude": 10.748313494162717,
        "longitude": 124.00833836914006,
        "elevation_m": 478,
        "distance_from_start_km": 1.2923076923076924
      },
      {
        "latitude": 10.749,
        "longitude": 124.009,
        "elevation_m": 550,
        "distance_from_start_km": 1.4000000000000001
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 14,
      "path_smoothness": "smooth",
      "terrain_type": "ridge",
      "scenic_rating": 4,
      "technical_difficulty": 3
    }
  },
  {
    "id": "hambubuyog-forest-trail",
    "route_id": "hambubuyog-forest-trail",
    "hikingSpotId": "81",
    "hiking_spot_id": "81",
    "route_name": "Hambubuyog Forest Trail",
    "difficulty": "Easy",
    "start_coordinates": {
      "latitude": 10.2547,
      "longitude": 123.8325
    },
    "end_coordinates": {
      "latitude": 10.2567,
      "longitude": 123.8345
    },
    "distance_km": 2.1,
    "elevation_gain_m": 180,
    "estimated_duration_hr": 1.2,
    "highlights": "Dense forest, wildlife spotting",
    "route_color": "#4CAF50",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8325,
          10.2547
        ],
        [
          123.83300245408397,
          10.25515048422803
        ],
        [
          123.8335,
          10.255700000000001
        ],
        [
          123.83400832671782,
          10.256144872502553
        ],
        [
          123.8345,
          10.2567
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.255700000000001,
        "longitude": 123.8335,
        "name": "Waypoint 1",
        "description": "Dense forest",
        "elevation_m": 291
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.2547,
        "longitude": 123.8325,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.25515048422803,
        "longitude": 123.83300245408397,
        "elevation_m": 145,
        "distance_from_start_km": 0.125
      },
      {
        "latitude": 10.255700000000001,
        "longitude": 123.8335,
        "elevation_m": 190,
        "distance_from_start_km": 0.25
      },
      {
        "latitude": 10.256144872502553,
        "longitude": 123.83400832671782,
        "elevation_m": 235,
        "distance_from_start_km": 0.375
      },
      {
        "latitude": 10.2567,
        "longitude": 123.8345,
        "elevation_m": 280,
        "distance_from_start_km": 0.5
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 5,
      "path_smoothness": "smooth",
      "terrain_type": "forest",
      "scenic_rating": 3,
      "technical_difficulty": 1
    }
  },
  {
    "id": "hambubuyog-ridge-path",
    "route_id": "hambubuyog-ridge-path",
    "hikingSpotId": "81",
    "hiking_spot_id": "81",
    "route_name": "Hambubuyog Ridge Path",
    "difficulty": "Easy-Moderate",
    "start_coordinates": {
      "latitude": 10.2527,
      "longitude": 123.8305
    },
    "end_coordinates": {
      "latitude": 10.2567,
      "longitude": 123.8345
    },
    "distance_km": 3.2,
    "elevation_gain_m": 250,
    "estimated_duration_hr": 1.8,
    "highlights": "Ridge walking, panoramic views",
    "route_color": "#FF9800",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8305,
          10.2527
        ],
        [
          123.83109268350188,
          10.253247842728847
        ],
        [
          123.83175940323643,
          10.253902107204404
        ],
        [
          123.83221720906609,
          10.254400331547268
        ],
        [
          123.8327623762555,
          10.25500147269005
        ],
        [
          123.83325439725748,
          10.255575776624562
        ],
        [
          123.83395719871909,
          10.256053574299639
        ],
        [
          123.8345,
          10.2567
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.253902107204404,
        "longitude": 123.83175940323643,
        "name": "Waypoint 1",
        "description": "Ridge walking",
        "elevation_m": 141
      },
      {
        "latitude": 10.255575776624562,
        "longitude": 123.83325439725748,
        "name": "Waypoint 2",
        "description": " panoramic views",
        "elevation_m": 258
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.2527,
        "longitude": 123.8305,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.253247842728847,
        "longitude": 123.83109268350188,
        "elevation_m": 160,
        "distance_from_start_km": 0.11428571428571428
      },
      {
        "latitude": 10.253902107204404,
        "longitude": 123.83175940323643,
        "elevation_m": 161,
        "distance_from_start_km": 0.22857142857142856
      },
      {
        "latitude": 10.254400331547268,
        "longitude": 123.83221720906609,
        "elevation_m": 188,
        "distance_from_start_km": 0.34285714285714286
      },
      {
        "latitude": 10.25500147269005,
        "longitude": 123.8327623762555,
        "elevation_m": 262,
        "distance_from_start_km": 0.45714285714285713
      },
      {
        "latitude": 10.255575776624562,
        "longitude": 123.83325439725748,
        "elevation_m": 289,
        "distance_from_start_km": 0.5714285714285715
      },
      {
        "latitude": 10.256053574299639,
        "longitude": 123.83395719871909,
        "elevation_m": 290,
        "distance_from_start_km": 0.6857142857142857
      },
      {
        "latitude": 10.2567,
        "longitude": 123.8345,
        "elevation_m": 350,
        "distance_from_start_km": 0.8
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 8,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 2
    }
  },
  {
    "id": "hambubuyog-summit-loop",
    "route_id": "hambubuyog-summit-loop",
    "hikingSpotId": "81",
    "hiking_spot_id": "81",
    "route_name": "Hambubuyog Summit Loop",
    "difficulty": "Moderate",
    "start_coordinates": {
      "latitude": 10.2507,
      "longitude": 123.8285
    },
    "end_coordinates": {
      "latitude": 10.2587,
      "longitude": 123.8365
    },
    "distance_km": 4.8,
    "elevation_gain_m": 420,
    "estimated_duration_hr": 2.5,
    "highlights": "Summit views, circular route",
    "route_color": "#2196F3",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8285,
          10.2507
        ],
        [
          123.82912180846388,
          10.251261019494693
        ],
        [
          123.82983372707909,
          10.252041885560873
        ],
        [
          123.83021260384481,
          10.252391496474088
        ],
        [
          123.83096669165353,
          10.253162317349304
        ],
        [
          123.83168897223602,
          10.253901417845453
        ],
        [
          123.83221852100024,
          10.254432646062707
        ],
        [
          123.83279760792033,
          10.255020010756956
        ],
        [
          123.83339434291793,
          10.255640779633982
        ],
        [
          123.83422413624292,
          10.256281905897065
        ],
        [
          123.83480476727911,
          10.256952582042778
        ],
        [
          123.83540233775415,
          10.257573218273444
        ],
        [
          123.83588652047416,
          10.258113766675288
        ],
        [
          123.8365,
          10.2587
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.252391496474088,
        "longitude": 123.83021260384481,
        "name": "Waypoint 1",
        "description": "Summit views",
        "elevation_m": 273
      },
      {
        "latitude": 10.255020010756956,
        "longitude": 123.83279760792033,
        "name": "Waypoint 2",
        "description": " circular route",
        "elevation_m": 186
      },
      {
        "latitude": 10.256952582042778,
        "longitude": 123.83480476727911,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 132
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.2507,
        "longitude": 123.8285,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.251261019494693,
        "longitude": 123.82912180846388,
        "elevation_m": 167,
        "distance_from_start_km": 0.10769230769230771
      },
      {
        "latitude": 10.252041885560873,
        "longitude": 123.82983372707909,
        "elevation_m": 204,
        "distance_from_start_km": 0.21538461538461542
      },
      {
        "latitude": 10.252391496474088,
        "longitude": 123.83021260384481,
        "elevation_m": 207,
        "distance_from_start_km": 0.3230769230769231
      },
      {
        "latitude": 10.253162317349304,
        "longitude": 123.83096669165353,
        "elevation_m": 201,
        "distance_from_start_km": 0.43076923076923085
      },
      {
        "latitude": 10.253901417845453,
        "longitude": 123.83168897223602,
        "elevation_m": 220,
        "distance_from_start_km": 0.5384615384615385
      },
      {
        "latitude": 10.254432646062707,
        "longitude": 123.83221852100024,
        "elevation_m": 274,
        "distance_from_start_km": 0.6461538461538462
      },
      {
        "latitude": 10.255020010756956,
        "longitude": 123.83279760792033,
        "elevation_m": 346,
        "distance_from_start_km": 0.7538461538461538
      },
      {
        "latitude": 10.255640779633982,
        "longitude": 123.83339434291793,
        "elevation_m": 400,
        "distance_from_start_km": 0.8615384615384617
      },
      {
        "latitude": 10.256281905897065,
        "longitude": 123.83422413624292,
        "elevation_m": 419,
        "distance_from_start_km": 0.9692307692307692
      },
      {
        "latitude": 10.256952582042778,
        "longitude": 123.83480476727911,
        "elevation_m": 413,
        "distance_from_start_km": 1.076923076923077
      },
      {
        "latitude": 10.257573218273444,
        "longitude": 123.83540233775415,
        "elevation_m": 416,
        "distance_from_start_km": 1.1846153846153846
      },
      {
        "latitude": 10.258113766675288,
        "longitude": 123.83588652047416,
        "elevation_m": 453,
        "distance_from_start_km": 1.2923076923076924
      },
      {
        "latitude": 10.2587,
        "longitude": 123.8365,
        "elevation_m": 520,
        "distance_from_start_km": 1.4000000000000001
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 14,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 5,
      "technical_difficulty": 3
    }
  },
  {
    "id": "hambubuyog-nature-traverse",
    "route_id": "hambubuyog-nature-traverse",
    "hikingSpotId": "81",
    "hiking_spot_id": "81",
    "route_name": "Hambubuyog Nature Traverse",
    "difficulty": "Moderate",
    "start_coordinates": {
      "latitude": 10.2487,
      "longitude": 123.8265
    },
    "end_coordinates": {
      "latitude": 10.2607,
      "longitude": 123.8385
    },
    "distance_km": 5.5,
    "elevation_gain_m": 480,
    "estimated_duration_hr": 3,
    "highlights": "Biodiversity hotspot, nature education",
    "route_color": "#8BC34A",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8265,
          10.2487
        ],
        [
          123.82724991967332,
          10.24951225310087
        ],
        [
          123.82822059763794,
          10.250190837262627
        ],
        [
          123.8290411883289,
          10.251221426107886
        ],
        [
          123.8295936170391,
          10.251884113115718
        ],
        [
          123.83060633375234,
          10.252657669920472
        ],
        [
          123.8312157866912,
          10.253509042188213
        ],
        [
          123.83208332809788,
          10.254300352038019
        ],
        [
          123.8329079803418,
          10.255104509733284
        ],
        [
          123.83363308482957,
          10.25583137318734
        ],
        [
          123.83433472035503,
          10.256801067576289
        ],
        [
          123.83515036860743,
          10.257426127014487
        ],
        [
          123.83592355546563,
          10.258368075377474
        ],
        [
          123.83687096559758,
          10.259054106354439
        ],
        [
          123.83769074330664,
          10.259944099139076
        ],
        [
          123.8385,
          10.2607
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.251884113115718,
        "longitude": 123.8295936170391,
        "name": "Waypoint 1",
        "description": "Biodiversity hotspot",
        "elevation_m": 283
      },
      {
        "latitude": 10.255104509733284,
        "longitude": 123.8329079803418,
        "name": "Waypoint 2",
        "description": " nature education",
        "elevation_m": 229
      },
      {
        "latitude": 10.258368075377474,
        "longitude": 123.83592355546563,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 203
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.2487,
        "longitude": 123.8265,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.24951225310087,
        "longitude": 123.82724991967332,
        "elevation_m": 168,
        "distance_from_start_km": 0.10666666666666667
      },
      {
        "latitude": 10.250190837262627,
        "longitude": 123.82822059763794,
        "elevation_m": 212,
        "distance_from_start_km": 0.21333333333333335
      },
      {
        "latitude": 10.251221426107886,
        "longitude": 123.8290411883289,
        "elevation_m": 224,
        "distance_from_start_km": 0.32000000000000006
      },
      {
        "latitude": 10.251884113115718,
        "longitude": 123.8295936170391,
        "elevation_m": 218,
        "distance_from_start_km": 0.4266666666666667
      },
      {
        "latitude": 10.252657669920472,
        "longitude": 123.83060633375234,
        "elevation_m": 218,
        "distance_from_start_km": 0.5333333333333333
      },
      {
        "latitude": 10.253509042188213,
        "longitude": 123.8312157866912,
        "elevation_m": 246,
        "distance_from_start_km": 0.6400000000000001
      },
      {
        "latitude": 10.254300352038019,
        "longitude": 123.83208332809788,
        "elevation_m": 304,
        "distance_from_start_km": 0.7466666666666667
      },
      {
        "latitude": 10.255104509733284,
        "longitude": 123.8329079803418,
        "elevation_m": 376,
        "distance_from_start_km": 0.8533333333333334
      },
      {
        "latitude": 10.25583137318734,
        "longitude": 123.83363308482957,
        "elevation_m": 434,
        "distance_from_start_km": 0.96
      },
      {
        "latitude": 10.256801067576289,
        "longitude": 123.83433472035503,
        "elevation_m": 462,
        "distance_from_start_km": 1.0666666666666667
      },
      {
        "latitude": 10.257426127014487,
        "longitude": 123.83515036860743,
        "elevation_m": 462,
        "distance_from_start_km": 1.1733333333333333
      },
      {
        "latitude": 10.258368075377474,
        "longitude": 123.83592355546563,
        "elevation_m": 456,
        "distance_from_start_km": 1.2800000000000002
      },
      {
        "latitude": 10.259054106354439,
        "longitude": 123.83687096559758,
        "elevation_m": 468,
        "distance_from_start_km": 1.3866666666666667
      },
      {
        "latitude": 10.259944099139076,
        "longitude": 123.83769074330664,
        "elevation_m": 512,
        "distance_from_start_km": 1.4933333333333334
      },
      {
        "latitude": 10.2607,
        "longitude": 123.8385,
        "elevation_m": 580,
        "distance_from_start_km": 1.6
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 16,
      "path_smoothness": "smooth",
      "terrain_type": "mixed",
      "scenic_rating": 4,
      "technical_difficulty": 3
    }
  },
  {
    "id": "hambubuyog-challenging-ascent",
    "route_id": "hambubuyog-challenging-ascent",
    "hikingSpotId": "81",
    "hiking_spot_id": "81",
    "route_name": "Hambubuyog Challenging Ascent",
    "difficulty": "Hard",
    "start_coordinates": {
      "latitude": 10.2467,
      "longitude": 123.8245
    },
    "end_coordinates": {
      "latitude": 10.2627,
      "longitude": 123.8405
    },
    "distance_km": 6.8,
    "elevation_gain_m": 580,
    "estimated_duration_hr": 3.8,
    "highlights": "Steep terrain, advanced hiking",
    "route_color": "#F44336",
    "geojson_path": {
      "type": "LineString",
      "coordinates": [
        [
          123.8245,
          10.2467
        ],
        [
          123.82517103488095,
          10.247454707186513
        ],
        [
          123.82611284140759,
          10.24807731033165
        ],
        [
          123.82680677793793,
          10.249007762097019
        ],
        [
          123.82730849358458,
          10.249836461600456
        ],
        [
          123.82807767050392,
          10.250076029922056
        ],
        [
          123.828737697307,
          10.25088263325675
        ],
        [
          123.82949677774133,
          10.251697121780243
        ],
        [
          123.83042863667683,
          10.252633101470943
        ],
        [
          123.83118664723915,
          10.253296715406877
        ],
        [
          123.83181632499053,
          10.253906823526435
        ],
        [
          123.83250000000001,
          10.2547
        ],
        [
          123.83324684409175,
          10.255385032167386
        ],
        [
          123.8340307254835,
          10.256095833624917
        ],
        [
          123.83489239692702,
          10.256881800914973
        ],
        [
          123.83532809441485,
          10.257462042423446
        ],
        [
          123.83599738450553,
          10.258615095955687
        ],
        [
          123.83704142821605,
          10.259309074489796
        ],
        [
          123.83751736142992,
          10.259774684355751
        ],
        [
          123.83819498519735,
          10.260668145934176
        ],
        [
          123.83894865282596,
          10.261089749096383
        ],
        [
          123.83969316744589,
          10.261985333500872
        ],
        [
          123.8405,
          10.2627
        ]
      ]
    },
    "waypoints": [
      {
        "latitude": 10.250076029922056,
        "longitude": 123.82807767050392,
        "name": "Waypoint 1",
        "description": "Steep terrain",
        "elevation_m": 177
      },
      {
        "latitude": 10.2547,
        "longitude": 123.83250000000001,
        "name": "Waypoint 2",
        "description": " advanced hiking",
        "elevation_m": 106
      },
      {
        "latitude": 10.259309074489796,
        "longitude": 123.83704142821605,
        "name": "Waypoint 3",
        "description": "Trail waypoint",
        "elevation_m": 238
      }
    ],
    "elevation_profile": [
      {
        "latitude": 10.2467,
        "longitude": 123.8245,
        "elevation_m": 100,
        "distance_from_start_km": 0
      },
      {
        "latitude": 10.247454707186513,
        "longitude": 123.82517103488095,
        "elevation_m": 158,
        "distance_from_start_km": 0.10454545454545455
      },
      {
        "latitude": 10.24807731033165,
        "longitude": 123.82611284140759,
        "elevation_m": 205,
        "distance_from_start_km": 0.2090909090909091
      },
      {
        "latitude": 10.249007762097019,
        "longitude": 123.82680677793793,
        "elevation_m": 237,
        "distance_from_start_km": 0.31363636363636366
      },
      {
        "latitude": 10.249836461600456,
        "longitude": 123.82730849358458,
        "elevation_m": 249,
        "distance_from_start_km": 0.4181818181818182
      },
      {
        "latitude": 10.250076029922056,
        "longitude": 123.82807767050392,
        "elevation_m": 248,
        "distance_from_start_km": 0.5227272727272728
      },
      {
        "latitude": 10.25088263325675,
        "longitude": 123.828737697307,
        "elevation_m": 242,
        "distance_from_start_km": 0.6272727272727273
      },
      {
        "latitude": 10.251697121780243,
        "longitude": 123.82949677774133,
        "elevation_m": 241,
        "distance_from_start_km": 0.7318181818181819
      },
      {
        "latitude": 10.252633101470943,
        "longitude": 123.83042863667683,
        "elevation_m": 253,
        "distance_from_start_km": 0.8363636363636364
      },
      {
        "latitude": 10.253296715406877,
        "longitude": 123.83118664723915,
        "elevation_m": 285,
        "distance_from_start_km": 0.940909090909091
      },
      {
        "latitude": 10.253906823526435,
        "longitude": 123.83181632499053,
        "elevation_m": 332,
        "distance_from_start_km": 1.0454545454545456
      },
      {
        "latitude": 10.2547,
        "longitude": 123.83250000000001,
        "elevation_m": 390,
        "distance_from_start_km": 1.1500000000000001
      },
      {
        "latitude": 10.255385032167386,
        "longitude": 123.83324684409175,
        "elevation_m": 448,
        "distance_from_start_km": 1.2545454545454546
      },
      {
        "latitude": 10.256095833624917,
        "longitude": 123.8340307254835,
        "elevation_m": 495,
        "distance_from_start_km": 1.3590909090909093
      },
      {
        "latitude": 10.256881800914973,
        "longitude": 123.83489239692702,
        "elevation_m": 527,
        "distance_from_start_km": 1.4636363636363638
      },
      {
        "latitude": 10.257462042423446,
        "longitude": 123.83532809441485,
        "elevation_m": 539,
        "distance_from_start_km": 1.5681818181818181
      },
      {
        "latitude": 10.258615095955687,
        "longitude": 123.83599738450553,
        "elevation_m": 538,
        "distance_from_start_km": 1.6727272727272728
      },
      {
        "latitude": 10.259309074489796,
        "longitude": 123.83704142821605,
        "elevation_m": 532,
        "distance_from_start_km": 1.7772727272727273
      },
      {
        "latitude": 10.259774684355751,
        "longitude": 123.83751736142992,
        "elevation_m": 531,
        "distance_from_start_km": 1.881818181818182
      },
      {
        "latitude": 10.260668145934176,
        "longitude": 123.83819498519735,
        "elevation_m": 543,
        "distance_from_start_km": 1.9863636363636363
      },
      {
        "latitude": 10.261089749096383,
        "longitude": 123.83894865282596,
        "elevation_m": 575,
        "distance_from_start_km": 2.0909090909090913
      },
      {
        "latitude": 10.261985333500872,
        "longitude": 123.83969316744589,
        "elevation_m": 622,
        "distance_from_start_km": 2.1954545454545458
      },
      {
        "latitude": 10.2627,
        "longitude": 123.8405,
        "elevation_m": 680,
        "distance_from_start_km": 2.3000000000000003
      }
    ],
    "enhanced_metadata": {
      "total_coordinate_points": 23,
      "path_smoothness": "moderate",
      "terrain_type": "mixed",
      "scenic_rating": 4,
      "technical_difficulty": 4
    }
  }
];

// Helper functions
export function getRoutesByHikingSpotId(hikingSpotId: string): TrailRoute[] {
  return NEW_TRAIL_ROUTES.filter(route => 
    route.hiking_spot_id === hikingSpotId || route.hikingSpotId === hikingSpotId
  );
}

export function getRouteById(routeId: string): TrailRoute | undefined {
  return NEW_TRAIL_ROUTES.find(route => route.id === routeId);
}

export default NEW_TRAIL_ROUTES;
