import React from 'react';
import HikingSpotLandingPage from './HikingSpotLandingPage';

interface HikingSpotWrapperProps {
  navigation: any;
  route: {
    params: {
      hiking_spot_id: string;
    };
  };
}

export default function HikingSpotWrapper({ navigation, route }: HikingSpotWrapperProps) {
  // Directly render the HikingSpotLandingPage which handles its own data fetching
  // and contains the full feature set (Map, Slider, Weather, etc.)
  return (
    <HikingSpotLandingPage
      navigation={navigation}
      route={route}
    />
  );
}