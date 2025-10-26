import { ImageSourcePropType } from 'react-native';
import { getAllHikingSpots } from '../../data/hikingSpots';
import { HikingSpotWithSource } from '../types/forum';

// Map homepage hiking spots into shared interface with original thumbnails
export function getHomepageSpots(): HikingSpotWithSource[] {
  const spots = getAllHikingSpots();
  return spots.map((s: any) => ({
    id: String(s.id),
    name: s.name,
    thumbnailUrl: '',
    location: s.slug || '',
    thumbnailSource: s.thumbnail as ImageSourcePropType,
  }));
}

export function findSpotByName(name: string): HikingSpotWithSource | undefined {
  const all = getHomepageSpots();
  const lower = name.trim().toLowerCase();
  return all.find(s => s.name.trim().toLowerCase() === lower);
}

export function findSpotById(id: string): HikingSpotWithSource | undefined {
  const all = getHomepageSpots();
  return all.find(s => s.id === id);
}
