const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixWaypointsFormat() {
  try {
    console.log('🔄 Fetching all trail routes...');
    
    const { data: routes, error: fetchError } = await supabase
      .from('trail_routes')
      .select('*')
      .order('id');
    
    if (fetchError) {
      console.error('Error fetching routes:', fetchError);
      return;
    }
    
    console.log(`📊 Found ${routes.length} routes to update`);
    
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      console.log(`🔄 Processing route ${i + 1}/${routes.length}: ${route.name}`);
      
      try {
        // Parse the current waypoints (which are start/end points)
        const currentWaypoints = JSON.parse(route.waypoints);
        
        // Extract start and end coordinates
        const startPoint = currentWaypoints.find(wp => wp.type === 'start');
        const endPoint = currentWaypoints.find(wp => wp.type === 'end');
        
        if (!startPoint || !endPoint) {
          console.warn(`⚠️  Route ${route.name} missing start or end point, skipping`);
          continue;
        }
        
        // Generate a realistic trail path between start and end points
        const trailPath = generateTrailPath(startPoint, endPoint, route.length || 2.5);
        
        // Update the route with the new waypoints format
        const { error: updateError } = await supabase
          .from('trail_routes')
          .update({
            waypoints: JSON.stringify(trailPath)
          })
          .eq('id', route.id);
        
        if (updateError) {
          console.error(`❌ Error updating route ${route.name}:`, updateError);
        } else {
          console.log(`✅ Updated route ${route.name} with ${trailPath.length} waypoints`);
        }
        
      } catch (parseError) {
        console.error(`❌ Error parsing waypoints for route ${route.name}:`, parseError);
      }
    }
    
    console.log('🎉 Waypoints format update completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

function generateTrailPath(startPoint, endPoint, distance) {
  const waypoints = [];
  
  // Add start point
  waypoints.push({
    lat: startPoint.lat,
    lng: startPoint.lng,
    name: 'Trailhead',
    type: 'start'
  });
  
  // Calculate the number of intermediate points based on distance
  const numPoints = Math.max(3, Math.min(15, Math.floor(distance * 2)));
  
  // Generate intermediate waypoints with realistic trail variations
  for (let i = 1; i < numPoints - 1; i++) {
    const progress = i / (numPoints - 1);
    
    // Linear interpolation between start and end
    const baseLat = startPoint.lat + (endPoint.lat - startPoint.lat) * progress;
    const baseLng = startPoint.lng + (endPoint.lng - startPoint.lng) * progress;
    
    // Add some realistic trail variation (not perfectly straight)
    const variation = 0.002; // About 200m variation
    const latOffset = (Math.random() - 0.5) * variation * (1 - Math.abs(progress - 0.5) * 2); // Less variation at start/end
    const lngOffset = (Math.random() - 0.5) * variation * (1 - Math.abs(progress - 0.5) * 2);
    
    waypoints.push({
      lat: baseLat + latOffset,
      lng: baseLng + lngOffset,
      name: `Waypoint ${i}`,
      type: 'waypoint'
    });
  }
  
  // Add end point
  waypoints.push({
    lat: endPoint.lat,
    lng: endPoint.lng,
    name: 'Destination',
    type: 'end'
  });
  
  return waypoints;
}

// Run the fix
fixWaypointsFormat();