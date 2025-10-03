// Image helper utilities for hiking spots and activities
import { HikingSpot } from '../types';

// Define the image mappings for each hiking spot
const HIKING_SPOT_IMAGES = {
  'mount babag': {
    thumbnail: require('../assets/images/mount-babag/thumbnail.webp'), // Using actual mount-babag folder
    images: [
      require('../assets/images/mount-babag/thumbnail.webp'),
      require('../assets/images/mount-babag/2.jpg'),
      require('../assets/images/mount-babag/3.webp'),
      require('../assets/images/mount-babag/4.webp'),
      require('../assets/images/mount-babag/5.jpg'),
    ]
  },
  'mt kan-irag': {
    thumbnail: require('../assets/images/mt kan-irag/thumbnail.jpg'), // Using actual mt kan-irag folder
    images: [
      require('../assets/images/mt kan-irag/thumbnail.jpg'),
      require('../assets/images/mt kan-irag/2.jpg'),
      require('../assets/images/mt kan-irag/3.jpg'),
      require('../assets/images/mt kan-irag/4.jpg'),
      require('../assets/images/mt kan-irag/5.jpg'),
    ]
  },
  'mt naupa': {
    thumbnail: require('../assets/images/mt naupa/thumbnail.jpg'),
    images: [
      require('../assets/images/mt naupa/thumbnail.jpg'),
      require('../assets/images/mt naupa/2.jpg'),
      require('../assets/images/mt naupa/3.jpg'),
      require('../assets/images/mt naupa/4.jpg'),
      require('../assets/images/mt naupa/5.jpg'),
    ]
  },
  'mt manunggal': {
    thumbnail: require('../assets/images/mt manunggal/thumbnail.jpg'),
    images: [
      require('../assets/images/mt manunggal/thumbnail.jpg'),
      require('../assets/images/mt manunggal/2.jpg'),
      require('../assets/images/mt manunggal/3.jpg'),
      require('../assets/images/mt manunggal/4.jpg'),
      require('../assets/images/mt manunggal/5.jpg'),
    ],
  },
  'mt mago': {
    thumbnail: require('../assets/images/mt mago/thumbnail.jpg'),
    images: [
      require('../assets/images/mt mago/thumbnail.jpg'),
      require('../assets/images/mt mago/2.webp'),
      require('../assets/images/mt mago/3.jpg'),
      require('../assets/images/mt mago/4.jpg'),
      require('../assets/images/mt mago/5.webp'),
    ]
  },
  'mt kapayas': {
    thumbnail: require('../assets/images/mt kapayas/thumbnail.webp'),
    images: [
      require('../assets/images/mt kapayas/thumbnail.webp'),
      require('../assets/images/mt kapayas/2.jpg'),
      require('../assets/images/mt kapayas/3.jpg'),
      require('../assets/images/mt kapayas/4.webp'),
      require('../assets/images/mt kapayas/5.jpg'),
    ]
  },
  'mount latoy': {
    thumbnail: require('../assets/images/mount latoy/thumbnail.webp'),
    images: [
      require('../assets/images/mount latoy/thumbnail.webp'),
      require('../assets/images/mount latoy/2.jpg'),
      require('../assets/images/mount latoy/3.jpg'),
      require('../assets/images/mount latoy/4.png'),
      require('../assets/images/mount latoy/5.jpg'),
    ],
  },
  'mt kalbasan': {
    thumbnail: require('../assets/images/mt kalbasan/thumbnail.jpg'),
    images: [
      require('../assets/images/mt kalbasan/thumbnail.jpg'),
      require('../assets/images/mt kalbasan/2.jpg'),
      require('../assets/images/mt kalbasan/3.jpg'),
      require('../assets/images/mt kalbasan/4.jpg'),
      require('../assets/images/mt kalbasan/5.jpg'),
    ],
  },
  'mt mauyog': {
    thumbnail: require('../assets/images/mt mauyog/thumbnail.jpg'),
    images: [
      require('../assets/images/mt mauyog/thumbnail.jpg'),
      require('../assets/images/mt mauyog/2.jpg'),
      require('../assets/images/mt mauyog/3.jpg'),
      require('../assets/images/mt mauyog/4.jpg'),
      require('../assets/images/mt mauyog/5.jpg'),
    ]
  },
  'mt lanaya': {
    thumbnail: require('../assets/images/mt lanaya/thumbnail.jpg'),
    images: [
      require('../assets/images/mt lanaya/thumbnail.jpg'),
      require('../assets/images/mt lanaya/2.jpg'),
      require('../assets/images/mt lanaya/3.jpg'),
      require('../assets/images/mt lanaya/4.jpg'),
      require('../assets/images/mt lanaya/5.jpg'),
    ]
  },
  'mount hambubuyog': {
    thumbnail: require('../assets/images/mount hambubuyog/thumbnail.jpg'),
    images: [
      require('../assets/images/mount hambubuyog/thumbnail.jpg'),
      require('../assets/images/mount hambubuyog/2.jpg'),
      require('../assets/images/mount hambubuyog/3.jpg'),
      require('../assets/images/mount hambubuyog/4.jpg'),
      require('../assets/images/mount hambubuyog/5.jpg'),
    ]
  },
  'osmena peak': {
    thumbnail: require('../assets/images/osmena peak/thumbnail.jpg'),
    images: [
      require('../assets/images/osmena peak/thumbnail.jpg'),
      require('../assets/images/osmena peak/2.jpg'),
      require('../assets/images/osmena peak/3.jpg'),
      require('../assets/images/osmena peak/4.jpg'),
      require('../assets/images/osmena peak/5.jpg'),
    ]
  },
  'casino peak': {
    thumbnail: require('../assets/images/casino peak/thumbnail.jpg'),
    images: [
      require('../assets/images/casino peak/thumbnail.jpg'),
      require('../assets/images/casino peak/2.jpg'),
      require('../assets/images/casino peak/3.jpg'),
      require('../assets/images/casino peak/4.webp'),
      require('../assets/images/casino peak/5.webp'),
    ],
  },
  'budlaanfalls': {
    thumbnail: require('../assets/images/budlaanfalls/thumbnail.jpg'),
    images: [
      require('../assets/images/budlaanfalls/thumbnail.jpg'),
      require('../assets/images/budlaanfalls/2.jpg'),
      require('../assets/images/budlaanfalls/3.jpg'),
      require('../assets/images/budlaanfalls/4.jpg'),
      require('../assets/images/budlaanfalls/5.jpg'),
    ]
  },
  'spartantrail': {
    thumbnail: require('../assets/images/spartantrail/thumbnail.jpg'),
    images: [
      require('../assets/images/spartantrail/thumbnail.jpg'),
      require('../assets/images/spartantrail/2.jpg'),
      require('../assets/images/spartantrail/3.jpg'),
      require('../assets/images/spartantrail/4.jpg'),
      require('../assets/images/spartantrail/5.jpg'),
    ]
  },

};

// Map hiking spot names to folder keys
const SPOT_NAME_TO_FOLDER: { [key: string]: string } = {
  'Mount Babag': 'mount babag',
  'Mount Kan-irag (Sirao Peak)': 'mt kan-irag',
  'Mount Naupa': 'mt naupa',
  'Mount Manunggal': 'mt manunggal',
  'Mount Mago': 'mt mago',
  'Mount Kapayas': 'mt kapayas',
  'Mount Lantoy': 'mount latoy', // Corrected to actual folder name
  'Mount Kalbasaan': 'mt kalbasan', // Corrected to actual folder name
  'Mount Mauyog': 'mt mauyog',
  'Mount Lanaya': 'mt lanaya',
  'Mount Hambubuyog': 'mount hambubuyog',
  'Osmeña Peak': 'osmena peak',
  'Casino Peak': 'casino peak',
  'Budlaan Falls': 'budlaanfalls',
  'Spartan Trail': 'spartantrail',
  'Kandungaw Peak': 'mount babag', // Fallback to mount babag images
  'Mantalongon Peak': 'mt mago', // Fallback to mt mago images
  'Sirao Flower Garden': 'mt kan-irag', // Fallback to mt kan-irag images


};

// Default images for different hiking spots
const DEFAULT_IMAGES: { [key: string]: string } = {
  'mount-babag': 'mount-babag/thumbnail.webp',
  'mt manunggal': 'mt manunggal/thumbnail.jpg',
  'mt naupa': 'mt naupa/thumbnail.jpg',
  'mt mago': 'mt mago/thumbnail.jpg',
  'mt kapayas': 'mt kapayas/thumbnail.webp', // Updated to webp format
  'mount latoy': 'mount latoy/thumbnail.webp', // Updated to webp format
  'mt kalbasan': 'mt kalbasan/thumbnail.jpg',
  'mt kan-irag': 'mt kan-irag/thumbnail.jpg',
  'mt lanaya': 'mt lanaya/thumbnail.jpg',
  'mt mauyog': 'mt mauyog/thumbnail.jpg',
  'mount hambubuyog': 'mount hambubuyog/thumbnail.jpg',
  'casino peak': 'casino peak/thumbnail.jpg',
  'osmena peak': 'osmena peak/thumbnail.jpg',
  'budlaanfalls': 'budlaanfalls/thumbnail.jpg',
  'spartantrail': 'spartantrail/thumbnail.jpg', // Updated to HEIC format
  'mount-kapayas': 'mt kapayas/thumbnail.webp', // Updated to webp format
  'osmena-peak': 'osmena peak/thumbnail.jpg'
};

/**
 * Get the appropriate image source for a hiking spot
 * @param spot - The hiking spot object
 * @returns Image source (either URI or local require)
 */
export function getHikingSpotImageSource(spot: HikingSpot | string): any {
  // If spot is a string, treat it as the spot name
  const spotName = typeof spot === 'string' ? spot : spot?.name;
  
  if (!spotName) {
    return DEFAULT_IMAGES.default;
  }

  // If spot is an object and has an image URL, use it
  if (typeof spot === 'object' && spot.cover_image_url) {
    return { uri: spot.cover_image_url };
  }

  // First, try to get thumbnail from HIKING_SPOT_IMAGES using SPOT_NAME_TO_FOLDER mapping
  const folderKey = SPOT_NAME_TO_FOLDER[spotName];
  if (folderKey && HIKING_SPOT_IMAGES[folderKey as keyof typeof HIKING_SPOT_IMAGES]) {
    return HIKING_SPOT_IMAGES[folderKey as keyof typeof HIKING_SPOT_IMAGES].thumbnail;
  }

  // Fallback: Convert spot name to key format for DEFAULT_IMAGES
  const key = spotName.toLowerCase().replace(/\s+/g, '-');
  
  // Check for exact matches in DEFAULT_IMAGES
  if (DEFAULT_IMAGES[key as keyof typeof DEFAULT_IMAGES]) {
    return DEFAULT_IMAGES[key as keyof typeof DEFAULT_IMAGES];
  }
  
  // Check for partial matches in DEFAULT_IMAGES
  const matchingKey = Object.keys(DEFAULT_IMAGES).find(imageKey => 
    key.includes(imageKey) || imageKey.includes(key)
  );
  
  if (matchingKey) {
    return DEFAULT_IMAGES[matchingKey as keyof typeof DEFAULT_IMAGES];
  }
  
  return DEFAULT_IMAGES.default;
}

/**
 * Check if a hiking spot is Mount Babag
 * @param spot - The hiking spot object or name
 * @returns True if the spot is Mount Babag
 */
export function isMountBabag(spot: HikingSpot | string): boolean {
  const spotName = typeof spot === 'string' ? spot : spot?.name;
  return spotName?.toLowerCase().includes('babag') || spotName?.toLowerCase().includes('mount babag') || false;
}

// isTumalogFalls function removed as TumalogFalls is not in official hiking spots list

/**
 * Get difficulty color based on difficulty level
 * @param difficulty - The difficulty level
 * @returns Color string for the difficulty
 */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return '#4CAF50'; // Green
    case 'moderate':
      return '#FF9800'; // Orange
    case 'hard':
    case 'difficult':
      return '#F44336'; // Red
    case 'extreme':
      return '#9C27B0'; // Purple
    default:
      return '#757575'; // Gray
  }
}

/**
 * Format image URL for different sizes
 * @param imageUrl - The original image URL
 * @param size - The desired size (thumbnail, medium, large)
 * @returns Formatted image URL
 */
export function formatImageUrl(imageUrl: string, size: 'thumbnail' | 'medium' | 'large' = 'medium'): string {
  if (!imageUrl) return '';
  
  // If it's a Supabase storage URL, we can add size parameters
  if (imageUrl.includes('supabase')) {
    const sizeParams = {
      thumbnail: '?width=150&height=150',
      medium: '?width=400&height=300',
      large: '?width=800&height=600'
    };
    return `${imageUrl}${sizeParams[size]}`;
  }
  
  return imageUrl;
}

/**
 * Validate if an image URL is accessible
 * @param imageUrl - The image URL to validate
 * @returns Promise that resolves to true if image is accessible
 */
export async function validateImageUrl(imageUrl: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get placeholder image based on hiking spot type
 * @param spotType - The type of hiking spot
 * @returns Placeholder image source
 */
export function getPlaceholderImage(spotType?: string): any {
  switch (spotType?.toLowerCase()) {
    case 'waterfall':
    case 'falls':
      return DEFAULT_IMAGES['tumalog-falls'];
    case 'mountain':
    case 'peak':
      return DEFAULT_IMAGES['mount-mago'];
    case 'temple':
    case 'historical':
      return DEFAULT_IMAGES['temple-of-leah'];
    case 'garden':
    case 'flower':
    case 'sirao':
      return DEFAULT_IMAGES['sirao-flower-garden'];
    default:
      return DEFAULT_IMAGES.default;
  }
}

// Get all images for a hiking spot (thumbnail first, max 5 images)
export function getHikingSpotImages(spotName: string): any[] {
  const folderKey = SPOT_NAME_TO_FOLDER[spotName];
  
  if (!folderKey || !HIKING_SPOT_IMAGES[folderKey as keyof typeof HIKING_SPOT_IMAGES]) {
    return [];
  }

  const spotImages = HIKING_SPOT_IMAGES[folderKey as keyof typeof HIKING_SPOT_IMAGES];

  // Ensure only a single thumbnail appears first and remove any duplicate entries of the thumbnail
  const imagesWithoutThumb = (spotImages.images || []).filter(img => img !== spotImages.thumbnail);
  const ordered = [spotImages.thumbnail, ...imagesWithoutThumb];

  // Enforce max 5 images in strict order [thumbnail, image2, image3, image4, image5]
  const result = ordered.slice(0, 5);
  
  return result;
}

// Get thumbnail image for a hiking spot
export function getHikingSpotThumbnail(spotName: string): any {
  const folderKey = SPOT_NAME_TO_FOLDER[spotName];
  if (!folderKey || !HIKING_SPOT_IMAGES[folderKey as keyof typeof HIKING_SPOT_IMAGES]) {
    return null;
  }

  return HIKING_SPOT_IMAGES[folderKey as keyof typeof HIKING_SPOT_IMAGES].thumbnail;
}

// Check if a hiking spot has images available
export function hasHikingSpotImages(spotName: string): boolean {
  const folderKey = SPOT_NAME_TO_FOLDER[spotName];
  return !!(folderKey && HIKING_SPOT_IMAGES[folderKey as keyof typeof HIKING_SPOT_IMAGES]);
}