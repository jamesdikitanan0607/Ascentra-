import React from 'react';
import HikingSpotWrapper from './HikingSpotWrapper';

interface NavigationProps {
  navigation: any;
}

export function CasinoPeakScreen({ navigation }: NavigationProps) {
  return (
    <HikingSpotWrapper 
      navigation={navigation}
      route={{ params: { hiking_spot_id: '73' } }}
    />
  );
}

export default CasinoPeakScreen;