import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getAllHikingSpots } from '../data/hikingSpots';
import { getWeatherData } from '../services/supabaseService';
import { calculateSafetyStatus, SafetyStatus } from '../utils/weatherSafety';

interface VariableWeather {
    temperature: number;
    condition: string;
    windSpeed: number;
}

export interface HikingSpotWeather {
    id: string;
    name: string;
    thumbnail: any;
    latitude: number;
    longitude: number;
    weather?: VariableWeather;
    status: SafetyStatus;
    loading: boolean;
}

interface WeatherContextType {
    spots: HikingSpotWeather[];
    loading: boolean;
    error: string | null;
    overallStatus: SafetyStatus; // The "worst" status among all spots
    refreshWeather: () => Promise<void>;
    lastUpdated: Date | null;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [spots, setSpots] = useState<HikingSpotWeather[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [overallStatus, setOverallStatus] = useState<SafetyStatus>('safe');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchWeather = useCallback(async () => {
        try {
            setLoading(true);
            const allSpots = getAllHikingSpots();

            // Initialize with basic data if empty
            let currentSpots: HikingSpotWeather[] = allSpots.map(spot => ({
                id: spot.id,
                name: spot.name,
                thumbnail: spot.thumbnail,
                latitude: spot.latitude,
                longitude: spot.longitude,
                status: 'risky', // Default
                loading: true,
            }));

            // If we already have data, preserve it while updating
            if (spots.length > 0) {
                currentSpots = spots.map(s => ({ ...s, loading: true }));
            } else {
                setSpots(currentSpots);
            }

            let worstStatus: SafetyStatus = 'safe';

            // Fetch in parallel
            const updatedSpots = await Promise.all(
                currentSpots.map(async (spot) => {
                    try {
                        const weather = await getWeatherData(spot.latitude, spot.longitude);
                        if (weather) {
                            const weatherInfo = {
                                temperature: weather.temperature,
                                condition: weather.condition,
                                windSpeed: weather.windSpeed,
                            };
                            const status = calculateSafetyStatus(weatherInfo);

                            // Determine overall status priority
                            if (status === 'unsafe') worstStatus = 'unsafe';
                            else if (status === 'risky' && worstStatus !== 'unsafe') worstStatus = 'risky';

                            return {
                                ...spot,
                                weather: weatherInfo,
                                status,
                                loading: false,
                            };
                        }
                    } catch (err) {
                        console.error(`Error fetching weather for ${spot.name}:`, err);
                    }
                    return { ...spot, loading: false };
                })
            );

            setSpots(updatedSpots);
            setOverallStatus(worstStatus);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            console.error('Global weather fetch error:', err);
            setError('Failed to update weather data');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchWeather();
    }, [fetchWeather]);

    return (
        <WeatherContext.Provider value={{
            spots,
            loading,
            error,
            overallStatus,
            refreshWeather: fetchWeather,
            lastUpdated
        }}>
            {children}
        </WeatherContext.Provider>
    );
};

export const useWeather = () => {
    const context = useContext(WeatherContext);
    if (context === undefined) {
        throw new Error('useWeather must be used within a WeatherProvider');
    }
    return context;
};
