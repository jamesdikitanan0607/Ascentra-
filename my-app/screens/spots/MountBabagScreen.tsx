import React from 'react';
import HikingSpotWrapper from './HikingSpotWrapper';

interface NavigationProps {
  navigation: any;
}

export function MountBabagScreen({ navigation }: NavigationProps) {
  return (
    <HikingSpotWrapper
      navigation={navigation}
      route={{ params: { hiking_spot_id: '71' } }}
    />
  );
}

export default MountBabagScreen;