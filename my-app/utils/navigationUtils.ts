import { RootStackParamList } from '../App';

// Mapping function to convert spot IDs to individual screen names
export const getSpotScreenName = (spotId: number): keyof RootStackParamList => {
    switch (spotId) {
        // Core canonical IDs (71-85)
        case 71:
            return 'MountBabag';
        case 72:
            return 'MountKanirag';
        case 73:
            return 'MountNaupa';
        case 74:
            return 'MountManunggal';
        case 75:
            return 'MountMago';
        case 76:
            return 'MountKapayas';
        case 77:
            return 'MountLantoy';
        case 78:
            return 'MountKalbasaanScreen';
        case 79:
            return 'MountMauyog';
        case 80:
            return 'MountLanaya';
        case 81:
            return 'LugsanganPeakScreen';
        case 82:
            return 'OsmenaPeak';
        case 83:
            return 'CasinoPeakScreen';
        case 84:
            return 'MountTagaytayScreen';
        case 85:
            return 'SpartanTrailScreen';
        default:
            return 'HikingSpotDetails';
    }
};

// Fallback: Get screen name by spot name (normalized)
export const getScreenNameByName = (name: string): keyof RootStackParamList | null => {
    if (!name) return null;
    const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    switch (normalized) {
        case 'mountbabag': return 'MountBabag';
        case 'mountkanirag': return 'MountKanirag';
        case 'mountnaupa': return 'MountNaupa';
        case 'mountmanunggal': return 'MountManunggal';
        case 'mountmago': return 'MountMago';
        case 'mountkapayas': return 'MountKapayas';
        case 'mountlantoy': return 'MountLantoy';
        case 'mountkalbasaan': return 'MountKalbasaanScreen';
        case 'mountmauyog': return 'MountMauyog';
        case 'mountlanaya': return 'MountLanaya';
        case 'lugsanganpeak': return 'LugsanganPeakScreen';
        case 'osmenapeak': return 'OsmenaPeak';
        case 'casinopeak': return 'CasinoPeakScreen';
        case 'mounttagaytay': return 'MountTagaytayScreen';
        case 'spartantrail': return 'SpartanTrailScreen';
        default: return null;
    }
};
