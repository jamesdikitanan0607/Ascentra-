import React from 'react';
import HikingSpotWrapper from './HikingSpotWrapper';

interface NavigationProps {
  navigation: any;
}

export default function MountTagaytayScreen({ navigation }: NavigationProps) {
  return (
    <HikingSpotWrapper 
      navigation={navigation}
      route={{ params: { hiking_spot_id: '85' } }}
    />
  );
}
