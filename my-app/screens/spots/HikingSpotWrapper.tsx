import React from 'react';
import HikingSpotTemplate from './HikingSpotTemplate';
import { HIKING_SPOTS_DATA } from '../../data/hikingSpotData';

interface HikingSpotWrapperProps {
  navigation: any;
  route: {
    params: {
      hiking_spot_id: string;
    };
  };
}

export default function HikingSpotWrapper({ navigation, route }: HikingSpotWrapperProps) {
  const { hiking_spot_id } = route.params;

  // Find the spot data from the local data file
  const spotData = HIKING_SPOTS_DATA.find(
    (spot) => spot.hikingSpotId === hiking_spot_id || spot.id === hiking_spot_id
  );

  if (!spotData) {
    console.error(`HikingSpotWrapper: Spot not found for id ${hiking_spot_id}`);
    return null; // Or some error component
  }

  console.log(`HikingSpotWrapper: Rendering template for ${spotData.name} (${hiking_spot_id})`);

  return (
    <HikingSpotTemplate
      navigation={navigation}
      spotData={spotData}
    />
  );
}