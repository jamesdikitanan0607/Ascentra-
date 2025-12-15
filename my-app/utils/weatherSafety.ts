export type SafetyStatus = 'safe' | 'risky' | 'unsafe';

interface WeatherData {
    temperature: number;
    condition: string;
    windSpeed: number;
}

export const calculateSafetyStatus = (weather: WeatherData): SafetyStatus => {
    if (!weather) return 'risky'; // Default to risky if no data

    const conditionLower = weather.condition.toLowerCase();
    const windSpeed = weather.windSpeed;

    // UNSAFE CONDITIONS (Red)
    // Heavy rain, storms, thunderstorms, strong winds (> 40 km/h)
    if (
        conditionLower.includes('thunderstorm') ||
        conditionLower.includes('heavy rain') ||
        conditionLower.includes('storm') ||
        conditionLower.includes('hurricane') ||
        conditionLower.includes('tornado') ||
        windSpeed > 40
    ) {
        return 'unsafe';
    }

    // RISKY CONDITIONS (Orange)
    // Light rain, cloudy, moderate wind (20-40 km/h), minor warnings
    if (
        conditionLower.includes('light rain') ||
        conditionLower.includes('rain') || // Generic rain implies at least risky
        conditionLower.includes('drizzle') ||
        conditionLower.includes('snow') ||
        conditionLower.includes('fog') ||
        conditionLower.includes('mist') ||
        (windSpeed >= 20 && windSpeed <= 40)
    ) {
        return 'risky';
    }

    // SAFE CONDITIONS (Green)
    // Clear, good weather, no rain, normal wind (< 20 km/h)
    return 'safe';
};

export const getSafetyColor = (status: SafetyStatus): string => {
    switch (status) {
        case 'safe':
            return '#4CAF50'; // Green
        case 'risky':
            return '#FF9800'; // Orange
        case 'unsafe':
            return '#F44336'; // Red
        default:
            return '#FF9800';
    }
};

export const getSafetyLabel = (status: SafetyStatus): string => {
    switch (status) {
        case 'safe':
            return 'Safe to Hike';
        case 'risky':
            return 'Caution Advised';
        case 'unsafe':
            return 'Not Safe to Hike';
        default:
            return 'Unknown Status';
    }
};
