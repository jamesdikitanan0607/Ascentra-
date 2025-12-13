import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Asset } from 'expo-asset';
import { HikingSpotData } from '../../data/hikingSpotData';
import { HikingSpotHeader } from './components/HikingSpotHeader';
import LeafletTrailMap from '../../components/LeafletTrailMap';
import { TrailInfoSection } from './components/TrailInfoSection';
import { LeaveNoTraceSection } from './components/LeaveNoTraceSection';
import ReviewSystem from '../../components/ReviewSystem';
import { COLORS } from '../../styles/colors';
import { TrailRoute } from '../../types';

interface HikingSpotTemplateProps {
    spot: HikingSpotData;
}

export default function HikingSpotDetails({ spot }: HikingSpotTemplateProps) {
    const [trailRoutes, setTrailRoutes] = useState<TrailRoute[]>([]);
    const [loadingRoutes, setLoadingRoutes] = useState(false);
    const [selectedTrailId, setSelectedTrailId] = useState<string | null>(null);

    useEffect(() => {
        const loadGpxRoutes = async () => {
            if (!spot.gpx_files || spot.gpx_files.length === 0) return;

            setLoadingRoutes(true);
            try {
                const routes: TrailRoute[] = [];

                for (const gpxFile of spot.gpx_files) {
                    try {
                        // Resolve asset
                        const asset = Asset.fromModule(gpxFile.file);
                        await asset.downloadAsync();

                        // Fetch content
                        const response = await fetch(asset.uri);
                        const gpxText = await response.text();

                        // Parse GPX (Simple regex parser)
                        const waypoints: { latitude: number; longitude: number }[] = [];
                        const trkptRegex = /<trkpt\s+lat="([\d.-]+)"\s+lon="([\d.-]+)"/g;
                        let match;
                        while ((match = trkptRegex.exec(gpxText)) !== null) {
                            waypoints.push({
                                latitude: parseFloat(match[1]),
                                longitude: parseFloat(match[2]),
                            });
                        }

                        if (waypoints.length > 0) {
                            routes.push({
                                id: `local-${gpxFile.name}`,
                                hiking_spot_id: spot.id,
                                name: gpxFile.name,
                                difficulty: spot.difficulty, // Inherit from spot for now
                                distance_km: spot.trail_length, // Approximate
                                elevation_gain_m: spot.elevation, // Approximate
                                estimated_time_hours: parseFloat(spot.estimated_duration) || 2,
                                waypoints: waypoints,
                                color: '#FF0000', // Default red
                            });
                        }
                    } catch (err) {
                        console.error(`Error loading GPX file ${gpxFile.name}:`, err);
                    }
                }

                setTrailRoutes(routes);
                if (routes.length > 0) {
                    setSelectedTrailId(routes[0].id);
                }
            } catch (error) {
                console.error('Error loading GPX routes:', error);
            } finally {
                setLoadingRoutes(false);
            }
        };

        loadGpxRoutes();
    }, [spot]);

    if (!spot) {
        return (
            <View style={styles.center}>
                <Text>Spot not found</Text>
            </View>
        );
    }

    const selectedRoute = trailRoutes.find(r => r.id === selectedTrailId) || null;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.scrollView}>
                <HikingSpotHeader
                    name={spot.name}
                    images={spot.imageSource ? [spot.imageSource] : []}
                    rating={spot.rating}
                    location={spot.name}
                    onBackPress={() => { }} // Add dummy handler or use navigation
                />

                <View style={styles.content}>
                    <TrailInfoSection
                        spot={spot}
                        selectedRoute={selectedRoute}
                        onFocusOnMap={(id) => setSelectedTrailId(id)}
                    />

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Trail Map</Text>
                        {loadingRoutes ? (
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                            <LeafletTrailMap
                                routes={trailRoutes}
                                selectedTrailId={selectedTrailId}
                                onTrailSelect={setSelectedTrailId}
                            />
                        )}
                    </View>

                    <LeaveNoTraceSection />

                    <ReviewSystem hikingSpotId={spot.id} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingBottom: 20,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
    },
});
