import React from 'react';
import HikingSpotWrapper from './HikingSpotWrapper';

interface NavigationProps {
  navigation: any;
}

export function MountMauyogScreen({ navigation }: NavigationProps) {
  return (
    <HikingSpotWrapper
      navigation={navigation}
      route={{ params: { hiking_spot_id: '79' } }}
    />
  );
}

export default MountMauyogScreen;