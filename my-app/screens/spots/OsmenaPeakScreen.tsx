import React from 'react';
import HikingSpotWrapper from './HikingSpotWrapper';

interface NavigationProps {
  navigation: any;
}

export function OsmenaPeakScreen({ navigation }: NavigationProps) {
  return (
    <HikingSpotWrapper
      navigation={navigation}
      route={{ params: { hiking_spot_id: '82' } }}
    />
  );
}

export default OsmenaPeakScreen;