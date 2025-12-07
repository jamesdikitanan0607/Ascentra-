import React from 'react';
import HikingSpotWrapper from './HikingSpotWrapper';

interface NavigationProps {
  navigation: any;
}

export function MountNaupaScreen({ navigation }: NavigationProps) {
  return (
    <HikingSpotWrapper
      navigation={navigation}
      route={{ params: { hiking_spot_id: '73' } }}
    />
  );
}

export default MountNaupaScreen;