export interface HikingSpotData {
  id: string;
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
}

export const HIKING_SPOTS_DATA: HikingSpotData[] = [
  {
    id: '1',
    name: 'Mount Babag',
    description: 'A popular hiking destination offering panoramic views of Cebu City and surrounding areas. Known for its accessible trails and beautiful sunrise views.',
    difficulty: 'Moderate',
    elevation: 850,
    trail_length: 8.5,
    estimated_duration: '2-3 hours',
    latitude: 10.3157,
    longitude: 123.9621,
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
    imageSource: require('../assets/images/mt manunggal/thumbnail.jpg') // Fallback - no mount babag folder
  },
  {
    id: '2',
    name: 'Mount Kan-irag (Sirao Peak)',
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
    imageSource: require('../assets/images/mt naupa/thumbnail.jpg')
  },
  {
    id: '3',
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
    imageSource: require('../assets/images/mt naupa/thumbnail.jpg')
  },
  {
    id: '4',
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
    imageSource: require('../assets/images/mt manunggal/thumbnail.jpg')
  },
  {
    id: '5',
    name: 'Mount Mago',
    description: 'A scenic mountain offering moderate trails with beautiful views of the surrounding valleys and nearby peaks.',
    difficulty: 'Moderate',
    elevation: 680,
    trail_length: 5.5,
    estimated_duration: '2-3 hours',
    latitude: 10.3234,
    longitude: 123.8567,
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
    imageSource: require('../assets/images/mt mago/thumbnail.jpg')
  },
  {
    id: '6',
    name: 'Mount Kapayas',
    description: 'A challenging peak known for its steep trails and rewarding summit views. Popular among experienced hikers.',
    difficulty: 'Hard',
    elevation: 950,
    trail_length: 8.0,
    estimated_duration: '4-5 hours',
    latitude: 10.2678,
    longitude: 123.8234,
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
    imageSource: require('../assets/images/mt kapayas/thumbnail.webp')
  },
  {
    id: '7',
    name: 'Mount Lantoy',
    description: 'A moderate mountain hike offering forest trails and scenic viewpoints. Great for nature lovers and bird watching.',
    difficulty: 'Moderate',
    elevation: 720,
    trail_length: 6.0,
    estimated_duration: '3-4 hours',
    latitude: 10.3456,
    longitude: 123.8789,
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
    imageSource: require('../assets/images/mount latoy/thumbnail.webp')
  },
  // {
  //   id: '8',
  //   name: 'Mount Kalbasaan',
  //   description: 'A lesser-known hiking spot offering solitude and pristine natural beauty. Perfect for those seeking peaceful mountain experience.',
  //   difficulty: 'Moderate',
  //   elevation: 640,
  //   trail_length: 5.0,
  //   estimated_duration: '2-3 hours',
  //   latitude: 10.2789,
  //   longitude: 123.8456,
  //   rating: 4.0,
  //   review_count: 43,
  //   image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
  //   amenities: ['Quiet trails', 'Natural viewpoints', 'Pristine environment'],
  //   best_season: ['Dry season', 'November to May'],
  //   highlights: [
  //     'Peaceful and quiet environment',
  //     'Pristine natural beauty',
  //     'Less crowded trails',
  //     'Authentic hiking experience',
  //     'Perfect for meditation'
  //   ],
  //   tips: [
  //     'Ideal for solitude seekers',
  //     'Inform others of your plans',
  //     'Bring all necessary supplies',
  //     'Respect the pristine environment',
  //     'Leave no trace behind'
  //   ],
  //   imageSource: require('../assets/images/mt kalbasan/thumbnail.jpg')
  // }, // Removed - Mount Kalbasaan
  {
    id: '9',
    name: 'Mount Mauyog',
    description: 'A scenic mountain offering diverse trails and beautiful panoramic views. Known for its varied terrain and natural beauty.',
    difficulty: 'Moderate',
    elevation: 780,
    trail_length: 7.0,
    estimated_duration: '3-4 hours',
    latitude: 10.3123,
    longitude: 123.8678,
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
    imageSource: require('../assets/images/mt mauyog/thumbnail.jpg')
  },
  {
    id: '10',
    name: 'Mount Lanaya',
    description: 'A challenging mountain hike known for its rugged terrain and spectacular summit views. Popular among serious hikers.',
    difficulty: 'Hard',
    elevation: 1100,
    trail_length: 11.0,
    estimated_duration: '5-6 hours',
    latitude: 10.4234,
    longitude: 123.7890,
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
    imageSource: require('../assets/images/mt lanaya/thumbnail.jpg')
  },
  {
    id: '11',
    name: 'Mount Hambubuyog',
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
    imageSource: require('../assets/images/mount hambubuyog/thumbnail.jpg')
  },
  {
    id: '12',
    name: 'Osmeña Peak',
    description: 'The highest peak in Cebu province offering breathtaking 360-degree views and rolling hills landscape. A must-visit destination.',
    difficulty: 'Easy',
    elevation: 1013,
    trail_length: 1.5,
    estimated_duration: '1-2 hours',
    latitude: 9.9167,
    longitude: 123.3333,
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
    imageSource: require('../assets/images/osmena peak/thumbnail.jpg')
  },
  {
    id: '13',
    name: 'Casino Peak',
    description: 'A scenic peak near Osmeña offering beautiful views and easier hiking trails. Perfect complement to Osmeña Peak visit.',
    difficulty: 'Easy',
    elevation: 980,
    trail_length: 2.0,
    estimated_duration: '1-2 hours',
    latitude: 9.9234,
    longitude: 123.3456,
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
    imageSource: require('../assets/images/casino peak/thumbnail.jpg')
  },
  {
    id: '14',
    name: 'Budlaan Falls',
    description: 'A beautiful waterfall destination combining hiking with swimming opportunities. Features pristine natural pools and lush surroundings.',
    difficulty: 'Moderate',
    elevation: 200,
    trail_length: 3.5,
    estimated_duration: '2-3 hours',
    latitude: 10.1234,
    longitude: 123.4567,
    rating: 4.6,
    review_count: 156,
    image_url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=600&fit=crop',
    amenities: ['Swimming areas', 'Natural pools', 'Changing areas', 'Picnic spots'],
    best_season: ['Dry season', 'March to May'],
    highlights: [
      'Beautiful waterfall cascade',
      'Natural swimming pools',
      'Lush tropical environment',
      'Perfect for cooling off',
      'Great for photography'
    ],
    tips: [
      'Bring swimwear and towels',
      'Wear water-appropriate footwear',
      'Be careful on wet rocks',
      'Respect the natural environment',
      'Perfect for hot weather relief'
    ],
    imageSource: require('../assets/images/budlaanfalls/thumbnail.jpg')
  },
  {
    id: '15',
    name: 'Spartan Trail',
    description: 'A challenging urban trail through the city offering great workout and scenic views. Perfect for fitness enthusiasts and adventure seekers.',
    difficulty: 'Hard',
    elevation: 300,
    trail_length: 4.0,
    estimated_duration: '2-3 hours',
    latitude: 10.3167,
    longitude: 123.8833,
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
    imageSource: require('../assets/images/spartantrail/thumbnail.jpg')
  },
  {
    id: '16',
    name: 'Mount Hambubuyog',
    description: 'A challenging mountain in Ginatilan offering spectacular views and diverse terrain. Known for its pine trees and scenic ridges, this peak provides an excellent hiking experience for adventurous hikers.',
    difficulty: 'Moderate',
    elevation: 1000,
    trail_length: 4.2,
    estimated_duration: '2.5 hours',
    latitude: 9.6072,
    longitude: 123.3312,
    rating: 4.3,
    review_count: 45,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    amenities: ['Trail markers', 'Scenic viewpoints', 'Pine forest', 'Rest areas'],
    best_season: ['Dry season', 'November to April'],
    highlights: [
      'Pine tree forest trails',
      'Scenic mountain ridges',
      'Panoramic summit views',
      'Diverse flora and fauna',
      'Cool mountain climate'
    ],
    tips: [
      'Start early for the best views',
      'Bring warm clothing for cool weather',
      'Wear proper hiking boots for rocky terrain',
      'Bring plenty of water and snacks',
      'Check weather conditions before hiking'
    ],
    imageSource: require('../assets/images/mount hambubuyog/thumbnail.jpg')
  }

];

export function getSpotById(id: string): HikingSpotData | undefined {
  return HIKING_SPOTS_DATA.find(spot => spot.id === id);
}