const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkHikingSpots() {
  try {
    const { data: spots, error } = await supabase
      .from('hiking_spots')
      .select('id, name')
      .order('id');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('Available hiking spots:');
    spots.forEach(spot => {
      console.log(`  ID ${spot.id}: ${spot.name}`);
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkHikingSpots();
