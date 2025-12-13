export interface HikingSpotData {
  id: string;
  hikingSpotId: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  elevation: number;
  trail_length: number;
  estimated_duration: string;
  latitude: number;
  longitude: number;
  rating: number;
  review_count: number;
  image_url: string;
  amenities: string[];
  best_season: string[];
  highlights: string[];
  tips: string[];
  imageSource: any;
  gpx_files?: { name: string; file: any }[];
}

export const HIKING_SPOTS_DATA: HikingSpotData[] = [
  {
    id: '71',
    hikingSpotId: '71',
    name: 'Mount Babag',
    description: 'A popular hiking destination offering panoramic views of Cebu City and surrounding areas. Known for its accessible trails and beautiful sunrise views.',
    difficulty: 'Moderate',
    elevation: 850,
    trail_length: 8.5,
    estimated_duration: '2-3 hours',
    latitude: 10.3470,
    longitude: 123.8885,
    rating: 4.5,
    review_count: 128,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    amenities: ['Parking', 'Restrooms', 'Trail markers', 'Scenic viewpoints'],
    best_season: ['Dry season', 'November to April'],
    highlights: [
      'Panoramic views of Cebu City',
      'Beautiful sunrise viewing spot',
      'Accessible trails for beginners',
      'Well-marked hiking paths',
      'Photography opportunities'
    ],
    tips: [
      'Start early for the best sunrise views',
      'Bring plenty of water and snacks',
      'Wear comfortable hiking shoes',
      'Check weather conditions before hiking',
      'Respect the environment and leave no trace'
    ],
    imageSource: require('../assets/images/mount-babag/thumbnail.webp'),
    gpx_files: [
      { name: 'Babag Ridge Trail', file: require('../gpx/Mount Babag/Babag Ridge Trail via Babag.gpx') },
      { name: 'Mount Babag via Malubog', file: require('../gpx/Mount Babag/Mount Babag via Malubog.gpx') },
      { name: 'Babag Loop', file: require('../gpx/Mount Babag/babag-1-bonbon-sudlon-1-bitlang-sinsin-campo-6-campo-4-talis.gpx') }
    ]
  },
  {
    id: '72',
    hikingSpotId: '72',
    name: 'Mount Kan-Irag',
    description: 'The highest peak in Cebu City offering challenging trails and spectacular panoramic views. Known for its cool climate and diverse flora.',
    difficulty: 'Hard',
    elevation: 1200,
    trail_length: 12.0,
    estimated_duration: '4-6 hours',
    latitude: 10.3389,
    longitude: 123.9167,
    rating: 4.7,
    review_count: 89,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    amenities: ['Trail markers', 'Scenic viewpoints', 'Rest areas'],
    best_season: ['Dry season', 'December to May'],
    highlights: [
      'Highest peak in Cebu City',
      'Challenging hiking experience',
      '360-degree panoramic views',
      'Cool mountain climate',
      'Diverse mountain flora'
    ],
    tips: [
      'Start very early (4-5 AM)',
      'Bring extra water and food',
      'Wear proper hiking gear',
      'Inform someone of your hiking plans',
      'Check weather conditions carefully'
    ],
    imageSource: require('../assets/images/mt kan-irag/thumbnail.jpg'),
    gpx_files: [
      { name: 'Talamban-Budlaan-Kan-irag', file: require('../gpx/Mount Kan-irag/talamban-budlaan-kan-irag.gpx') },
      { name: 'Budlaan-Sirao', file: require('../gpx/Mount Kan-irag/budlaan-sirao.gpx') },
      { name: 'Budlaan-Sirao-Malubog-Babag', file: require('../gpx/Mount Kan-irag/budlaan-sirao-malubog-babag-napo-guadalupe-church.gpx') }
    ]
  },
  {
    id: '73',
    hikingSpotId: '73',
    name: 'Mount Naupa',
    description: 'A moderate hiking destination known for its lush forest trails and beautiful mountain views. Popular among local hikers.',
    difficulty: 'Moderate',
    elevation: 750,
    trail_length: 6.5,
    estimated_duration: '3-4 hours',
    latitude: 10.2845,
    longitude: 123.8934,
    rating: 4.3,
    review_count: 67,
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
    amenities: ['Trail markers', 'Forest paths', 'Viewpoints'],
    best_season: ['Dry season', 'November to April'],
    highlights: [
      'Lush forest environment',
      'Moderate hiking challenge',
      'Beautiful mountain vistas',
      'Rich biodiversity',
      'Peaceful natural setting'
    ],
    tips: [
      'Bring insect repellent',
      'Wear long sleeves for forest protection',
      'Stay on marked trails',
      'Bring plenty of water',
      'Respect wildlife and plants'
    ],
    imageSource: require('../assets/images/mt naupa/thumbnail.jpg'),
    gpx_files: [
      { name: 'Mount Naupa', file: require('../gpx/Mount Naupa/Mount Naupa.gpx') },
      { name: 'Guindaruhan - Naupa Trail', file: require('../gpx/Mount Naupa/Guindaruhan - Naupa Trail.gpx') },
      { name: 'Budlaan-Sirao-Malubog-Babag-Napo', file: require('../gpx/Mount Naupa/budlaan-sirao-malubog-babag-napo-guadalupe-church.gpx') }
    ]
  },
  {
    id: '74',
    hikingSpotId: '74',
    name: 'Mount Manunggal',
    description: 'A historically significant mountain where President Ramon Magsaysay crashed. Offers challenging trails and historical monuments.',
    difficulty: 'Hard',
    elevation: 1003,
    trail_length: 10.0,
    estimated_duration: '5-7 hours',
    latitude: 10.4567,
    longitude: 123.8123,
    rating: 4.6,
    review_count: 112,
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
    amenities: ['Historical monument', 'Trail markers', 'Rest areas'],
    best_season: ['Dry season', 'December to May'],
    highlights: [
      'Historical significance',
      'Magsaysay monument',
      'Challenging mountain trail',
      'Panoramic summit views',
      'Rich historical context'
    ],
    tips: [
      'Learn about the historical significance',
      'Start early for full day hike',
      'Bring camping gear if staying overnight',
      'Respect the memorial site',
      'Prepare for challenging terrain'
    ],
    imageSource: require('../assets/images/mt manunggal/thumbnail.jpg'),
    gpx_files: [
      { name: 'Mount Manunggal Campsite', file: require('../gpx/Mount Manunggal/Mount Manunggal Campsite.gpx') },
      { name: 'Cebu Highlands Trail Segment IV', file: require('../gpx/Mount Manunggal/segment-iv-a-cebu-highlands-trail-project.gpx') },
      { name: 'Balamban Race to Manunggal', file: require('../gpx/Mount Manunggal/7th-annual-balamban-race-to-mt-manunggal-march-21-2010.gpx') }
    ]
  },
  {
    id: '75',
    hikingSpotId: '75',
    name: 'Mount Mago',
    description: 'A scenic mountain offering moderate trails with beautiful views of the surrounding valleys and nearby peaks.',
    difficulty: 'Moderate',
    elevation: 680,
    trail_length: 5.5,
    estimated_duration: '2-3 hours',
    latitude: 10.6330,
    longitude: 123.9330,
    rating: 4.2,
    review_count: 78,
    image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
    amenities: ['Trail markers', 'Scenic overlooks', 'Rest spots'],
    best_season: ['Year-round', 'Best during dry season'],
    highlights: [
      'Scenic valley views',
      'Moderate hiking difficulty',
      'Beautiful landscape photography',
      'Peaceful mountain environment',
      'Good for day hiking'
    ],
    tips: [
      'Perfect for intermediate hikers',
      'Bring camera for scenic views',
      'Check trail conditions',
      'Start early to avoid heat',
      'Carry sufficient water'
    ],
    imageSource: require('../assets/images/mt mago/thumbnail.jpg'),
    gpx_files: [
      { name: 'Mount Mago', file: require('../gpx/Mount Mago/Mount Mago.gpx') },
      { name: 'Mago Peak', file: require('../gpx/Mount Mago/Mago Peak.gpx') }
    ]
  },
  {
    id: '76',
    hikingSpotId: '76',
    name: 'Mount Kapayas',
    description: 'A challenging peak known for its steep trails and rewarding summit views. Popular among experienced hikers.',
    difficulty: 'Hard',
    elevation: 950,
    trail_length: 8.0,
    estimated_duration: '4-5 hours',
    latitude: 10.7470,
    longitude: 124.0070,
    rating: 4.4,
    review_count: 94,
    image_url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=600&fit=crop',
    amenities: ['Steep trails', 'Summit viewpoint', 'Trail markers'],
    best_season: ['Dry season', 'November to April'],
    highlights: [
      'Challenging steep ascent',
      'Rewarding summit views',
      'Test of hiking endurance',
      'Beautiful mountain scenery',
      'Sense of accomplishment'
    ],
    tips: [
      'Only for experienced hikers',
      'Bring trekking poles',
      'Start very early',
      'Ensure good physical condition',
      'Have emergency contact plan'
    ],
    imageSource: require('../assets/images/mt kapayas/thumbnail.webp'),
    gpx_files: [
      { name: 'Mt. Kapayas', file: require('../gpx/Mount Kapayas/Mt. Kapayas in Catmon.gpx') }
    ]
  },
  {
    id: '77',
    hikingSpotId: '77',
    name: 'Mount Lantoy',
    description: 'A moderate mountain hike offering forest trails and scenic viewpoints. Great for nature lovers and bird watching.',
    difficulty: 'Moderate',
    elevation: 720,
    trail_length: 6.0,
    estimated_duration: '3-4 hours',
    latitude: 9.8790,
    longitude: 123.6070,
    rating: 4.1,
    review_count: 56,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    amenities: ['Forest trails', 'Bird watching spots', 'Natural springs'],
    best_season: ['Year-round', 'Early morning for bird watching'],
    highlights: [
      'Rich forest biodiversity',
      'Excellent bird watching',
      'Natural spring water',
      'Peaceful hiking experience',
      'Educational nature trail'
    ],
    tips: [
      'Bring binoculars for bird watching',
      'Early morning start recommended',
      'Respect wildlife habitats',
      'Bring field guide for birds',
      'Move quietly to observe wildlife'
    ],
    imageSource: require('../assets/images/mount latoy/thumbnail.webp'),
    gpx_files: [
      { name: 'Mount Lantoy', file: require('../gpx/Mount Lantoy/lantoy.gpx') }
    ]
  },
  {
    id: '78',
    hikingSpotId: '78',
    name: 'Mount Kalbasaan',
    description: 'A lesser-known hiking spot offering solitude and pristine natural beauty. Perfect for those seeking peaceful mountain experience.',
    difficulty: 'Moderate',
    elevation: 640,
    trail_length: 5.0,
    estimated_duration: '2-3 hours',
    latitude: 10.2789,
    longitude: 123.8456,
    rating: 4.0,
    review_count: 43,
    image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
    amenities: ['Quiet trails', 'Natural viewpoints', 'Pristine environment'],
    best_season: ['Dry season', 'November to May'],
    highlights: [
      'Peaceful and quiet environment',
      'Pristine natural beauty',
      'Less crowded trails',
      'Authentic hiking experience',
      'Perfect for meditation'
    ],
    tips: [
      'Ideal for solitude seekers',
      'Inform others of your plans',
      'Bring all necessary supplies',
      'Respect the pristine environment',
      'Leave no trace behind'
    ],
    imageSource: require('../assets/images/mt kalbasan/thumbnail.jpg'),
    gpx_files: [
      { name: 'Kalibasan Peak', file: require('../gpx/Mount Kalbasaan/Kalibasan Peak.gpx') },
      { name: 'Kalbasaan-Naupa', file: require('../gpx/Mount Kalbasaan/kalbasaan-naupa.gpx') },
      { name: 'Kalbasaan Soloista', file: require('../gpx/Mount Kalbasaan/kalbasaan-both-ends-soloista.gpx') }
    ]
  },
  {
    id: '79',
    hikingSpotId: '79',
    name: 'Mount Mauyog',
    description: 'A scenic mountain offering diverse trails and beautiful panoramic views. Known for its varied terrain and natural beauty.',
    difficulty: 'Moderate',
    elevation: 780,
    trail_length: 7.0,
    estimated_duration: '3-4 hours',
    latitude: 10.4330,
    longitude: 123.8560,
    rating: 4.3,
    review_count: 87,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    amenities: ['Diverse trails', 'Panoramic viewpoints', 'Rest areas'],
    best_season: ['Dry season', 'December to April'],
    highlights: [
      'Diverse terrain and trails',
      'Panoramic mountain views',
      'Varied hiking experience',
      'Beautiful natural scenery',
      'Good for photography'
    ],
    tips: [
      'Explore different trail options',
      'Bring camera for scenic shots',
      'Check weather before hiking',
      'Wear appropriate hiking gear',
      'Stay hydrated throughout hike'
    ],
    imageSource: require('../assets/images/mt mauyog/thumbnail.jpg'),
    gpx_files: [
      { name: 'Mount Mauyog', file: require('../gpx/Mount Mauyog/Mount Mauyog.gpx') },
      { name: 'Mount Mauyog via Tagbao', file: require('../gpx/Mount Mauyog/Mount Mauyog via Tagbao.gpx') }
    ]
  },
  {
    id: '80',
    hikingSpotId: '80',
    name: 'Mount Lanaya',
    description: 'A challenging mountain hike known for its rugged terrain and spectacular summit views. Popular among serious hikers.',
    difficulty: 'Hard',
    elevation: 1100,
    trail_length: 11.0,
    estimated_duration: '5-6 hours',
    latitude: 9.6470,
    longitude: 123.3680,
    rating: 4.5,
    review_count: 76,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    amenities: ['Rugged trails', 'Summit viewpoint', 'Camping areas'],
    best_season: ['Dry season', 'November to April'],
    highlights: [
      'Rugged mountain terrain',
      'Spectacular summit views',
      'Challenging hiking experience',
      'Camping opportunities',
      'Sense of achievement'
    ],
    tips: [
      'Prepare for challenging terrain',
      'Consider overnight camping',
      'Bring proper mountaineering gear',
      'Check weather conditions',
      'Hike with experienced companions'
    ],
    imageSource: require('../assets/images/mt lanaya/thumbnail.jpg'),
    gpx_files: [
      { name: 'Mount Lanaya', file: require('../gpx/Mount Lanaya/Mount Lanaya.gpx') },
      { name: 'Mount Lanaya via Legaspi', file: require('../gpx/Mount Lanaya/Mount Lanaya via Legaspi.gpx') }
    ]
  },
  {
    id: '81',
    hikingSpotId: '81',
    name: 'Lugsangan Peak',
    description: 'A moderate hiking destination offering forest trails and scenic mountain views. Great for nature enthusiasts.',
    difficulty: 'Moderate',
    elevation: 690,
    trail_length: 5.5,
    estimated_duration: '2-3 hours',
    latitude: 10.2567,
    longitude: 123.8345,
    rating: 4.1,
    review_count: 62,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    amenities: ['Forest paths', 'Scenic overlooks', 'Natural rest areas'],
    best_season: ['Year-round', 'Best during cooler months'],
    highlights: [
      'Beautiful forest environment',
      'Scenic mountain overlooks',
      'Moderate hiking challenge',
      'Rich natural biodiversity',
      'Peaceful hiking experience'
    ],
    tips: [
      'Perfect for nature photography',
      'Bring insect protection',
      'Respect forest ecosystem',
      'Stay on designated trails',
      'Enjoy the peaceful environment'
    ],
    imageSource: require('../assets/images/Lugsangan Peak/1.jpg'),
    gpx_files: [
      { name: 'Lugsangan Peak', file: require('../gpx/Lugsangan Peak/Lugsangan Peak.gpx') },
      { name: 'Mount Labalasan', file: require('../gpx/Lugsangan Peak/Mount Labalasan.gpx') }
    ]
  },
  {
    id: '82',
    hikingSpotId: '82',
    name: 'Osmeña Peak',
    description: 'The highest peak in Cebu province offering breathtaking 360-degree views and rolling hills landscape. A must-visit destination.',
    difficulty: 'Easy',
    elevation: 1013,
    trail_length: 1.5,
    estimated_duration: '1-2 hours',
    latitude: 9.8205,
    longitude: 123.4652,
    rating: 4.8,
    review_count: 245,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    amenities: ['Easy access road', 'Parking area', 'Viewing deck', 'Souvenir shops'],
    best_season: ['Year-round', 'Best during sunrise/sunset'],
    highlights: [
      'Highest peak in Cebu province',
      '360-degree panoramic views',
      'Rolling hills landscape',
      'Easy accessibility',
      'Perfect for sunrise/sunset viewing'
    ],
    tips: [
      'Visit during sunrise or sunset',
      'Bring warm clothes for cool weather',
      'Perfect for beginner hikers',
      'Great for family trips',
      'Bring camera for stunning views'
    ],
    imageSource: require('../assets/images/osmena peak/thumbnail.jpg'),
    gpx_files: [
      { name: 'Mantalongon-Osmena Peak-Kawasan Falls', file: require('../gpx/Osmena Peak/mantalongon-osmena-peak-kawasan-falls.gpx') },
      { name: 'Osmena Peak Route', file: require('../gpx/Osmena Peak/osmenas-peak-hiking-route-from-mantalongon-to-peak.gpx') },
      { name: 'Osmena Peak from Badian', file: require('../gpx/Osmena Peak/osmena-peak-from-badian.gpx') }
    ]
  },
  {
    id: '83',
    hikingSpotId: '83',
    name: 'Casino Peak',
    description: 'A scenic peak near Osmeña offering beautiful views and easier hiking trails. Perfect complement to Osmeña Peak visit.',
    difficulty: 'Easy',
    elevation: 980,
    trail_length: 2.0,
    estimated_duration: '1-2 hours',
    latitude: 9.8112,
    longitude: 123.4702,
    rating: 4.4,
    review_count: 134,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    amenities: ['Easy trails', 'Scenic viewpoints', 'Rest areas'],
    best_season: ['Year-round', 'Morning hours recommended'],
    highlights: [
      'Beautiful mountain scenery',
      'Easy hiking trails',
      'Great views of surrounding peaks',
      'Perfect for beginners',
      'Complement to Osmeña Peak'
    ],
    tips: [
      'Combine with Osmeña Peak visit',
      'Good for family hiking',
      'Bring water and snacks',
      'Enjoy the scenic mountain views',
      'Perfect for photography'
    ],
    imageSource: require('../assets/images/casino peak/thumbnail.jpg'),
    gpx_files: [
      { name: 'Lugsangan Peak (Casino Peak)', file: require('../gpx/Casino Peak/Lugsangan Peak.gpx') },
      { name: 'Mount Labalasan', file: require('../gpx/Casino Peak/Mount Labalasan.gpx') }
    ]
  },
  {
    id: '84',
    hikingSpotId: '84',
    name: 'Mount Tagaytay',
    description: 'Mount Tagaytay is a scenic ridge overlooking Malubog Lake, known for its panoramic views, cool mountain breeze, and peaceful atmosphere. The trail offers a mix of forest paths, open ridges, and lakeside scenery, making it an ideal destination for both casual hikers and seasoned trekkers seeking a quick nature escape from the city.',
    difficulty: 'Moderate',
    elevation: 700,
    trail_length: 3.5,
    estimated_duration: '2-3 hours',
    latitude: 10.3650,
    longitude: 123.7300,
    rating: 4.2,
    review_count: 0,
    image_url: '',
    amenities: ['Ridge views', 'Lakeside scenery', 'Forest paths'],
    best_season: ['Dry season', 'November to April'],
    highlights: [
      'Panoramic views of Malubog Lake',
      'Cool mountain breeze',
      'Peaceful ridge and forest sections'
    ],
    tips: [
      'Start early for cooler conditions',
      'Bring water and sun protection',
      'Respect local communities and trails'
    ],
    imageSource: require('../assets/images/Mount Tagaytay/5.jpg'),
    gpx_files: [
      { name: 'Malubog Lake Loop', file: require('../gpx/Mount Tagaytay/Malubog Lake Loop.gpx') },
      { name: 'Malubog Lake', file: require('../gpx/Mount Tagaytay/Malubog Lake.gpx') }
    ]
  },
  {
    id: '85',
    hikingSpotId: '85',
    name: 'Spartan Trail',
    description: 'A challenging urban trail through the city offering great workout and scenic views. Perfect for fitness enthusiasts and adventure seekers.',
    difficulty: 'Hard',
    elevation: 300,
    trail_length: 4.0,
    estimated_duration: '2-3 hours',
    latitude: 10.3500,
    longitude: 123.8800,
    rating: 4.4,
    review_count: 67,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    amenities: ['Urban trail', 'Fitness stations', 'City viewpoints', 'Accessible paths'],
    best_season: ['Year-round', 'Early morning or late afternoon'],
    highlights: [
      'Challenging urban workout',
      'Great city views',
      'Fitness training opportunity',
      'Accessible from city center',
      'Perfect for daily exercise'
    ],
    tips: [
      'Bring plenty of water',
      'Wear proper running/hiking shoes',
      'Start early to avoid heat',
      'Great for interval training',
      'Combine with city exploration'
    ],
    imageSource: require('../assets/images/spartantrail/thumbnail.jpg'),
    gpx_files: [
      { name: 'Spartan Trail', file: require('../gpx/Spartan Trail/Spartan Trail.gpx') },
      { name: 'Spartan Trail Detour', file: require('../gpx/Spartan Trail/spartan-trail-with-detour-paseo-to-pamutan.gpx') },
      { name: 'Cebu TCH Passing Tagbao River', file: require('../gpx/Spartan Trail/cebu-tch-passing-tagbao-river.gpx') }
    ]
  }
];

export function getSpotById(id: string): HikingSpotData | undefined {
  return HIKING_SPOTS_DATA.find(spot => spot.id === id);
}