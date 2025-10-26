import React from 'react';
import HikingSpotWrapper from './HikingSpotWrapper';

interface NavigationProps {
  navigation: any;
  route?: { params?: { spotId?: string } };
}

export function SpartanTrailScreen({ navigation, route }: NavigationProps) {
  const defaultSpartanId = '74';
  const incomingId = route?.params?.spotId;
  const spotId = incomingId === '85' ? '74' : (incomingId || defaultSpartanId);
  return (
    <HikingSpotWrapper 
      navigation={navigation}
      route={{ params: { hiking_spot_id: spotId } }}
    />
  );
}

export default SpartanTrailScreen;