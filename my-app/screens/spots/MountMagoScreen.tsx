import React from 'react';
import HikingSpotWrapper from './HikingSpotWrapper';

interface NavigationProps {
  navigation: any;
}

export function MountMagoScreen({ navigation }: NavigationProps) {
  return (
    <HikingSpotWrapper 
      navigation={navigation}
      route={{ params: { hiking_spot_id: '75' } }}
    />
  );
}

export default MountMagoScreen;