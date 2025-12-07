import React, { useEffect, useState, Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { supabase } from './services/supabaseClient';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { linking } from './utils/linking';
import { Session } from '@supabase/supabase-js';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { TrailProvider } from './contexts/TrailContext';
import ErrorBoundary from './components/ErrorBoundary';

// Navigation types
export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  Login: undefined;
  Register: undefined;
  EmailConfirmation: { email: string };
  Posts: undefined;
  Comments: { postId: string };
  Profile: { userId?: string; refresh?: boolean };
  EditProfile: undefined;
  ChangePassword: undefined;
  Favorites: undefined;
  HikingSpotDetails: { spot: any };
  HikingSpotLandingPage: { hiking_spot_id: string };
  HikingTrailDetails: { hikingSpot: any };
  TestHikingTrailDetails: undefined;
  TrailMapFullScreen: { hiking_spot_id: string; spotName: string };
  ActivityDetails: { activity: any };
  Tracking: undefined;
  HikeHistory: { userId?: string | null };
  SaveActivity: { routeCoordinates: any[]; stats: any };
  MediaViewer: { mediaItems: any[]; initialIndex: number; post?: any };
  HikeDetail: { hikeId: string };
  ActivityComments: { activityId: string };
  SaveConfirmation: { hikeId: string };

  // Individual hiking spot screens (15 official spots)
  MountBabag: undefined;
  MountKanirag: undefined;
  MountNaupa: undefined;
  MountManunggal: undefined;
  MountMago: undefined;
  MountKapayas: undefined;
  MountLantoy: undefined;
  MountMauyog: undefined;
  MountLanaya: undefined;
  LugsanganPeakScreen: undefined;   // Renamed from MountHambubuyogScreen
  MountKalbasaanScreen: undefined;
  OsmenaPeak: undefined;
  CasinoPeakScreen: undefined;
  MountTagaytayScreen: undefined;
  SpartanTrailScreen: { spotId?: string } | undefined;
};

// Import screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import EmailConfirmationScreen from './screens/EmailConfirmationScreen';
import BottomTabNavigator from './components/BottomTabNavigator';
import { createLazyComponent } from './utils/performanceOptimizer';


// Lazy load heavy screens for better performance
const HistoryScreen = createLazyComponent(() => import('./screens/HistoryScreen'));
const HikingSpotDetailsScreen = createLazyComponent(() => import('./screens/HikingSpotDetailsScreen'));
const HikingTrailDetailsScreen = createLazyComponent(() => import('./screens/HikingTrailDetailsScreen'));
const TestHikingTrailDetailsScreen = createLazyComponent(() => import('./screens/TestHikingTrailDetailsScreen'));
const TrackScreen = createLazyComponent(() => import('./screens/TrackScreen'));
const TrackingScreen = createLazyComponent(() => import('./screens/TrackingScreen'));
const HikeHistoryScreen = createLazyComponent(() => import('./screens/HikeHistoryScreen'));
const PostsScreen = createLazyComponent(() => import('./screens/PostsScreen'));
const CommentsScreen = createLazyComponent(() => import('./screens/CommentsScreen'));
const ProfileScreen = createLazyComponent(() => import('./screens/ProfileScreen'));
const EditProfileScreen = createLazyComponent(() => import('./screens/EditProfileScreen'));
const ChangePasswordScreen = createLazyComponent(() => import('./screens/ChangePasswordScreen'));
const FavoritesScreen = createLazyComponent(() => import('./screens/FavoritesScreen'));
const MediaViewerScreen = createLazyComponent(() => import('./screens/OptimizedMediaViewerScreen'));
const SaveActivityScreen = createLazyComponent(() => import('./screens/SaveActivityScreen'));
const HikeDetailScreen = createLazyComponent(() => import('./screens/HikeDetailScreen'));
const ActivityCommentsScreen = createLazyComponent(() => import('./screens/ActivityCommentsScreen'));
const SaveConfirmationScreen = createLazyComponent(() => import('./screens/SaveConfirmationScreen'));
const TrailMapFullScreen = createLazyComponent(() => import('./screens/TrailMapFullScreen'));

// Lazy load individual hiking spot screens for better performance
const MountBabagScreen = createLazyComponent(() => import('./screens/spots/MountBabagScreen'));
const MountKaniragScreen = createLazyComponent(() => import('./screens/spots/MountKaniragScreen'));
const MountNaupaScreen = createLazyComponent(() => import('./screens/spots/MountNaupaScreen'));
const MountManunggalScreen = createLazyComponent(() => import('./screens/spots/MountManunggalScreen'));
const MountMagoScreen = createLazyComponent(() => import('./screens/spots/MountMagoScreen'));
const MountKapayasScreen = createLazyComponent(() => import('./screens/spots/MountKapayasScreen'));
const MountLantoyScreen = createLazyComponent(() => import('./screens/spots/MountLantoyScreen'));
const MountMauyogScreen = createLazyComponent(() => import('./screens/spots/MountMauyogScreen'));
const MountLanayaScreen = createLazyComponent(() => import('./screens/spots/MountLanayaScreen'));
const MountKalbasaanScreen = createLazyComponent(() => import('./screens/spots/MountKalbasaanScreen'));
const LugsanganPeakScreen = createLazyComponent(() => import('./screens/spots/LugsanganPeakScreen'));
const OsmenaPeakScreen = createLazyComponent(() => import('./screens/spots/OsmenaPeakScreen'));
const CasinoPeakScreen = createLazyComponent(() => import('./screens/spots/CasinoPeakScreen'));
const MountTagaytayScreen = createLazyComponent(() => import('./screens/spots/MountTagaytayScreen'));
const SpartanTrailScreen = createLazyComponent(() => import('./screens/spots/SpartanTrailScreen'));

import HikingSpotLandingPage from './screens/spots/HikingSpotLandingPage';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Helper function to store auth tokens securely
async function saveToken(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.log('Error saving token:', error);
  }
}

// Helper function to retrieve auth tokens
async function getToken(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.log('Error getting token:', error);
    return null;
  }
}

// AppContent component that uses the auth context
function AppContent(): JSX.Element {
  const { user, loading } = useAuth();

  // Simplified deep link handler
  const handleDeepLink = async ({ url }: { url: string }): Promise<void> => {
    if (!url) return;
    
    console.log("Received deep link:", url);
    
    if (url.includes('auth/callback') || url.includes('login')) {
      try {
        const parsedUrl = Linking.parse(url);
        
        if (parsedUrl.queryParams?.access_token) {
          const accessToken = Array.isArray(parsedUrl.queryParams.access_token) 
            ? parsedUrl.queryParams.access_token[0] 
            : parsedUrl.queryParams.access_token;
          const refreshToken = Array.isArray(parsedUrl.queryParams.refresh_token) 
            ? parsedUrl.queryParams.refresh_token[0] 
            : parsedUrl.queryParams.refresh_token || '';
            
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (!error && data?.session) {
            console.log("Session established via deep link");
          }
        }
      } catch (e) {
        console.error("Error handling deep link:", e);
      }
    }
  };

  useEffect(() => {
    // Handle deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Check for initial link
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });
    
    return () => subscription.remove();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading Ascentra...</Text>
      </View>
    );
  }

  // For debugging purposes, log the screens we have available
  console.log("Available screens in navigator:", [
    "Home", "HikingSpotDetails", "ActivityDetails", 
    "Tracking", "HikeHistory", "SaveActivity", "Login", "Register", "EmailConfirmation",
    "Posts", "Comments", "Profile", "EditProfile", "ChangePassword", "MediaViewer"
  ]);

  return (
    <Stack.Navigator>
          {user ? (
          <>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="Comments" component={CommentsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ headerShown: false }} />
            <Stack.Screen 
              name="HikingSpotDetails" 
              component={HikingSpotDetailsScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="HikingSpotLandingPage" 
              component={HikingSpotLandingPage} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="HikingTrailDetails" 
              component={HikingTrailDetailsScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="TestHikingTrailDetails" 
              component={TestHikingTrailDetailsScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="TrailMapFullScreen" 
              component={TrailMapFullScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Tracking" component={TrackingScreen} options={{ headerShown: false }} />
            <Stack.Screen 
              name="HikeHistory" 
              component={HikeHistoryScreen} 
              options={{ headerShown: false }} 
              initialParams={{ userId: null }} // Allow passing userId parameter
            />
            <Stack.Screen name="SaveActivity" component={SaveActivityScreen} options={{ headerShown: false }} />
            <Stack.Screen 
              name="MediaViewer" 
              component={MediaViewerScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="HikeDetail" 
              component={HikeDetailScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen name="ActivityComments" component={ActivityCommentsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SaveConfirmation" component={SaveConfirmationScreen} options={{ headerShown: false }} />
    
            
            {/* Individual hiking spot screens (15 official spots) */}
            <Stack.Screen name="MountBabag" component={MountBabagScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MountKanirag" component={MountKaniragScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MountNaupa" component={MountNaupaScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MountManunggal" component={MountManunggalScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MountMago" component={MountMagoScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MountKapayas" component={MountKapayasScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MountLantoy" component={MountLantoyScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MountMauyog" component={MountMauyogScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MountLanaya" component={MountLanayaScreen} options={{ headerShown: false }} />
            <Stack.Screen name="LugsanganPeakScreen" component={LugsanganPeakScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MountKalbasaanScreen" component={MountKalbasaanScreen} options={{ headerShown: false }} />
            <Stack.Screen name="OsmenaPeak" component={OsmenaPeakScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CasinoPeakScreen" component={CasinoPeakScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MountTagaytayScreen" component={MountTagaytayScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SpartanTrailScreen" component={SpartanTrailScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
            <Stack.Screen 
              name="EmailConfirmation" 
              component={EmailConfirmationScreen} 
              options={{ headerShown: false }} 
            />
          </>
          )}
        </Stack.Navigator>
  );
}

export default function App(): JSX.Element {
  return (
    <NavigationContainer linking={linking}>
      <ErrorBoundary
        screenName="App"
        onError={(error) => {
          console.error('Critical error in App:', error);
        }}
      >
        <AuthProvider>
          <ProfileProvider>
            <TrailProvider>
              <Suspense fallback={
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#2E7D32" />
                  <Text style={styles.loadingText}>Loading screen...</Text>
                </View>
              }>
                <AppContent />
              </Suspense>
            </TrailProvider>
          </ProfileProvider>
        </AuthProvider>
      </ErrorBoundary>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2E7D32',
  },
});