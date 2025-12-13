import React, { useCallback, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { HikingSpot } from '../types';
import { getSpotScreenName, getScreenNameByName } from '../utils/navigationUtils';
import { formatDistance, formatElevation } from '../utils/formatters';
import { useProfile } from '../contexts/ProfileContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with 16px margins

interface HikingSpotCardProps {
    spot: HikingSpot & {
        distance_km?: number;
        elevation_gain_m?: number;
        rating_count?: number;
        trail_length_km?: number;
        elevation_m?: number;
        review_count?: number;
    };
    thumbnail?: any; // Allow passing explicit thumbnail (e.g. from local require)
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HikingSpotCard = React.memo(({ spot, thumbnail }: HikingSpotCardProps) => {
    const navigation = useNavigation<NavigationProp>();
    const { isSpotFavorited, addToFavorites, removeFromFavorites } = useProfile();
    const [isToggling, setIsToggling] = useState(false);

    // Ensure ID is handled as a string for consistency across UUIDs and numeric IDs
    const spotId = String(spot.id || (spot as any).hiking_spot_id);
    const isFavorited = isSpotFavorited(spotId);

    // Determine image source: prop thumbnail > spot.thumbnail (if exists) > spot.image_url > spot.cover_image_url
    let imageSource = thumbnail || (spot as any).thumbnail;

    if (!imageSource) {
        if (spot.image_url) {
            // Check if it's a number (local require) or string (remote url)
            imageSource = typeof spot.image_url === 'number' ? spot.image_url : { uri: spot.image_url };
        } else if (spot.cover_image_url) {
            // Check if it's a number (local require) or string (remote url)
            imageSource = typeof spot.cover_image_url === 'number' ? spot.cover_image_url : { uri: spot.cover_image_url };
        }
    }

    const handlePress = useCallback(() => {
        // Robust ID parsing
        const rawId = spot.id || (spot as any).hiking_spot_id;
        // Keep as string if it's a UUID, otherwise parse as number if it looks like one
        const parsedSpotId = isNaN(Number(rawId)) ? rawId : Number(rawId);

        console.log(`[HikingSpotCard DEBUG] Pressed. Raw ID: ${rawId}, Parsed ID: ${parsedSpotId}, Name: ${spot.name}`);

        let screenName = getSpotScreenName(parsedSpotId);
        console.log(`[HikingSpotCard DEBUG] Initial resolved screen: ${screenName}`);

        // AGGRESSIVE FALLBACK: If ID lookup returns generic 'HikingSpotDetails', 
        // OR if we have a known name like 'Mount Babag', try to find a specific screen by name.
        // This ensures that even if ID is mismatched (e.g. UUID vs 71), the name 'Mount Babag' will force the correct screen.
        if (screenName === 'HikingSpotDetails' || spot.name) {
            const nameBasedScreen = getScreenNameByName(spot.name);
            if (nameBasedScreen && nameBasedScreen !== 'HikingSpotDetails') {
                console.log(`[HikingSpotCard DEBUG] Override: Found specific screen ${nameBasedScreen} by name for ${spot.name}`);
                screenName = nameBasedScreen;
            }
        }

        console.log(`[HikingSpotCard DEBUG] Final navigation target: ${screenName}`);

        if (screenName === 'HikingSpotDetails') {
            // Pass the spot object for the generic details screen
            // Ensure we pass a robust object with imageSource if possible
            navigation.navigate(screenName, {
                spot: {
                    ...spot,
                    // Ensure generic screen can find the image
                    image_url: (spot as any).image_url || Image.resolveAssetSource(imageSource as any)?.uri || null,
                    // Ensure generic screen has the ID
                    hiking_spot_id: rawId
                }
            });
        } else {
            // For specific spot screens, navigate without parameters
            // The specific screens (e.g. MountBabagScreen) hardcode the ID, so they don't need params
            navigation.navigate(screenName as any);
        }
    }, [navigation, spot, imageSource]);

    const handleFavoritePress = useCallback(async () => {
        if (isToggling) return;
        setIsToggling(true);
        try {
            if (isFavorited) {
                await removeFromFavorites(spotId);
            } else {
                await addToFavorites(spot);
            }
        } finally {
            setIsToggling(false);
        }
    }, [isFavorited, isToggling, spot, spotId, addToFavorites, removeFromFavorites]);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return '#4CAF50';
            case 'moderate': return '#FF9800';
            case 'hard': return '#F44336';
            default: return '#9E9E9E';
        }
    };

    return (
        <TouchableOpacity style={styles.gridCard} onPress={handlePress}>
            <View>
                <Image source={imageSource} style={styles.gridCardImage} resizeMode="cover" />
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={handleFavoritePress}
                    disabled={isToggling}
                >
                    {isToggling ? (
                        <ActivityIndicator size="small" color="#FF4081" />
                    ) : (
                        <Ionicons
                            name={isFavorited ? "heart" : "heart-outline"}
                            size={20}
                            color={isFavorited ? "#FF4081" : "#fff"}
                        />
                    )}
                </TouchableOpacity>
            </View>
            <View style={styles.gridCardContent}>
                <Text style={styles.gridCardTitle} numberOfLines={2}>{spot.name}</Text>

                {spot.difficulty && (
                    <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(spot.difficulty) }]}>
                        <Text style={styles.difficultyText}>{spot.difficulty.toUpperCase()}</Text>
                    </View>
                )}

                <View style={styles.gridCardStats}>
                    {(spot.distance_km !== undefined || spot.trail_length_km !== undefined) && (
                        <View style={styles.statItem}>
                            <MaterialIcons name="straighten" size={12} color="#666" />
                            <Text style={styles.statText}>
                                {formatDistance(spot.distance_km || spot.trail_length_km || 0)}
                            </Text>
                        </View>
                    )}
                    {(spot.elevation_gain_m !== undefined || spot.elevation_m !== undefined) && (
                        <View style={styles.statItem}>
                            <MaterialIcons name="terrain" size={12} color="#666" />
                            <Text style={styles.statText}>
                                {formatElevation(spot.elevation_gain_m || spot.elevation_m || 0)}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.gridCardRating}>
                    <MaterialIcons name="star" size={14} color="#FFD700" />
                    <Text style={styles.gridCardRatingText}>{spot.average_rating}</Text>
                    <Text style={styles.statText}>
                        ({spot.rating_count || spot.review_count || (spot as any).number_of_reviews || 0})
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    gridCard: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    gridCardImage: {
        width: '100%',
        height: 120,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        backgroundColor: '#eee', // Placeholder color
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridCardContent: {
        padding: 12,
    },
    gridCardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
        lineHeight: 18,
    },
    difficultyBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    difficultyText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#fff',
    },
    gridCardStats: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    statText: {
        fontSize: 11,
        color: '#666',
        marginLeft: 2,
    },
    gridCardRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gridCardRatingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1a1a1a',
        marginLeft: 4,
    },
});

export default HikingSpotCard;
