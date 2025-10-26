import { ImageSourcePropType } from 'react-native';

export interface HikingSpot {
  id: string;
  name: string;
  thumbnailUrl: string;
  location: string;
}

export interface HikingSpotWithSource extends HikingSpot {
  thumbnailSource: ImageSourcePropType;
}

export type SortOption = 'newest' | 'most_liked' | 'most_commented';

export interface ForumMediaItem {
  id?: string;
  url: string;
  type: 'image' | 'video';
  thumbnail_url?: string | null;
}

export interface ForumPostItem {
  id: string;
  title?: string | null;
  content?: string | null;
  created_at: string;
  user_id: string;
  visibility?: 'public' | 'private';
  tags?: number[]; // hiking spot IDs
  media?: ForumMediaItem[];
  profiles?: {
    id?: string;
    username?: string | null;
    avatar_url?: string | null;
  } | null;
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
}
