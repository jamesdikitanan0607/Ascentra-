import React from 'react';
import HikingSpotWrapper from './HikingSpotWrapper';

interface NavigationProps {
  navigation: any;
}

export function MountHambubuyogScreen({ navigation }: NavigationProps) {
  return (
    <HikingSpotWrapper 
      navigation={navigation}
      route={{ params: { hiking_spot_id: '81' } }}
    />
  );
}

export default MountHambubuyogScreen;