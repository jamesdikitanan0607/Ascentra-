import React from 'react';
import HikingSpotWrapper from './HikingSpotWrapper';

interface NavigationProps {
  navigation: any;
}

export function SpartanTrailScreen({ navigation }: NavigationProps) {
  return (
    <HikingSpotWrapper
      navigation={navigation}
      route={{ params: { hiking_spot_id: '85' } }}
    />
  );
}

export default SpartanTrailScreen;