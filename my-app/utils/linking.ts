import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');

export const linking: LinkingOptions<any> = {
  prefixes: [prefix],
  config: {
    screens: {
      Login: 'login',
      Register: 'register',
      Home: 'home',
      HikingSpotDetails: 'spot/:id',
      ActivityDetails: 'activity/:id',
      Track: 'track',
      Tracking: 'tracking',
      HikeHistory: 'history',
      EmailConfirmation: 'confirm-email',
      Posts: 'posts',
      Comments: 'comments/:postId',
      Profile: 'profile',
      EditProfile: 'edit-profile',
      ChangePassword: 'change-password',
      MediaViewer: 'media/:mediaId',
      SaveActivity: 'save-activity',
      HikeDetail: 'hike/:hikeId',
      ActivityComments: 'activity-comments/:activityId',
      SaveConfirmation: 'save-confirmation',
      FavoritesScreen: 'favorites',
      // Hiking spot screens
      MountBabag: 'spots/mount-babag',
      MountKanirag: 'spots/mt kan-irag',
      MountNaupa: 'spots/mount-naupa',
      MountManunggal: 'spots/mount-manunggal',
      MountMago: 'spots/mount-mago',
      MountKapayas: 'spots/mount-kapayas',
  MountLantoy: 'spots/mount-lantoy',
  // MountKalbasaan: 'spots/mount-kalbasaan', // Removed - Mount Kalbasaan
  MountMauyog: 'spots/mount-mauyog',
  MountLanaya: 'spots/mount-lanaya',
  LugsanganPeak: 'spots/lugsangan-peak',
  OsmenaPeak: 'spots/osmena-peak',
  CasinoPeak: 'spots/casino-peak',
  BudlaanFalls: 'spots/budlaan-falls',
      SpartanTrail: 'spots/spartan-trail',
      SpartanTrailScreen: 'spots/spartan-trail',

      HikingSpotLandingPage: 'spots/landing/:hiking_spot_id',
    },
  },
};