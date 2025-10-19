const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyCoordinates() {
  try {
    console.log('🔍 Checking updated coordinates...');
    
    const { data: routes, error } = await supabase
      .from('trail_routes')
      .select('hiking_spot_id, route_name, start_coordinates, end_coordinates')
      .order('hiking_spot_id')
      .limit(15);
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('📍 Updated coordinates sample:');
    routes.forEach(route => {
      console.log(`Spot ${route.hiking_spot_id} - ${route.route_name}:`);
      console.log(`  Start: ${route.start_coordinates}`);
      console.log(`  End: ${route.end_coordinates}`);
      
      // Parse coordinates to check if they're outside Guadalupe area
      const startMatch = route.start_coordinates.match(/\(([^,]+),([^)]+)\)/);
      const endMatch = route.end_coordinates.match(/\(([^,]+),([^)]+)\)/);
      
      if (startMatch && endMatch) {
        const startLng = parseFloat(startMatch[1]);
        const startLat = parseFloat(startMatch[2]);
        const endLng = parseFloat(endMatch[1]);
        const endLat = parseFloat(endMatch[2]);
        
        // Check if coordinates are in Guadalupe area (around 123.88-123.89, 10.36-10.42)
        const isGuadalupe = (
          startLng >= 123.88 && startLng <= 123.89 && 
          startLat >= 10.36 && startLat <= 10.42
        );
        
        if (isGuadalupe) {
          console.log(`  ⚠️ Still in Guadalupe area!`);
        } else {
          console.log(`  ✅ Outside Guadalupe area`);
        }
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

verifyCoordinates();
