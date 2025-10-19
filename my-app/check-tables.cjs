const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    console.log('Checking hiking_spots table...');
    const { data: spots, error: spotsError } = await supabase
      .from('hiking_spots')
      .select('*')
      .limit(5);
    
    if (spotsError) {
      console.log('hiking_spots error:', spotsError.message);
    } else {
      console.log('hiking_spots sample data:', spots);
    }
    
    console.log('\nChecking hiking_spot_routes table...');
    const { data: routes, error: routesError } = await supabase
      .from('hiking_spot_routes')
      .select('*')
      .limit(5);
    
    if (routesError) {
      console.log('hiking_spot_routes error:', routesError.message);
    } else {
      console.log('hiking_spot_routes sample data:', routes);
    }
    
    console.log('\nChecking trail_routes table...');
    const { data: trailRoutes, error: trailRoutesError } = await supabase
      .from('trail_routes')
      .select('*')
      .limit(5);
    
    if (trailRoutesError) {
      console.log('trail_routes error:', trailRoutesError.message);
    } else {
      console.log('trail_routes sample data:', trailRoutes);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkTables();
