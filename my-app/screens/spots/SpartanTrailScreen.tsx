import React from 'react';
import HikingSpotWrapper from './HikingSpotWrapper';

interface NavigationProps {
  navigation: any;
}

export function SpartanTrailScreen({ navigation }: NavigationProps) {
  return (
    <HikingSpotWrapper 
      navigation={navigation}
      route={{ params: { spotId: '15' } }}
    />
  );
}

export default SpartanTrailScreen;