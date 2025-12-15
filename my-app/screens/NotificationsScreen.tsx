// NotificationsScreen - Displays weather safety updates
import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllHikingSpots } from '../data/hikingSpots';
import { getSafetyColor, getSafetyLabel } from '../utils/weatherSafety';
import { useNavigation } from '@react-navigation/native';
import { getSpotScreenName } from '../utils/navigationUtils';
import { useWeather, HikingSpotWeather } from '../contexts/WeatherContext';

const NotificationsScreen = () => {
    const navigation = useNavigation<any>();
    const { spots, loading, refreshWeather } = useWeather();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshWeather();
        setRefreshing(false);
    };

    const handlePressSpot = (spotId: string) => {
        const screenName = getSpotScreenName(parseInt(spotId));
        if (screenName === 'HikingSpotDetails') {
            // We need the full spot object. For now, finding it from the local state or data source.
            const spot = getAllHikingSpots().find(s => s.id === spotId);
            if (spot) {
                navigation.navigate(screenName, { spot });
            }
        } else {
            navigation.navigate(screenName);
        }
    };

    const renderItem = ({ item }: { item: HikingSpotWeather }) => {
        const statusColor = getSafetyColor(item.status);
        const statusLabel = getSafetyLabel(item.status);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => handlePressSpot(item.id)}
                activeOpacity={0.7}
            >
                <Image source={item.thumbnail} style={styles.thumbnail} />

                <View style={styles.cardContent}>
                    <Text style={styles.spotName}>{item.name}</Text>

                    <View style={styles.statusContainer}>
                        {item.loading ? (
                            <ActivityIndicator size="small" color="#666" style={{ marginRight: 8 }} />
                        ) : (
                            <>
                                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                                <View style={styles.statusTextContainer}>
                                    <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
                                    {item.weather && (
                                        <Text style={styles.weatherSummary}>
                                            {Math.round(item.weather.temperature)}°C • {item.weather.condition}
                                        </Text>
                                    )}
                                </View>
                            </>
                        )}
                    </View>
                </View>

                <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hike Safety Updates</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={spots}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <Text style={styles.emptyText}>No hiking spots found.</Text>
                    ) : null
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    listContainer: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    cardContent: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    spotName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    statusTextContainer: {
        flex: 1,
    },
    statusLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    weatherSummary: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#666',
        fontSize: 16,
    }
});

export default NotificationsScreen;
