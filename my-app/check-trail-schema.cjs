const { createClient } = require('@supabase/supabase-js');

// Use service role key to bypass RLS
const supabaseUrl = 'https://tppimfexrhptzdxlxcbj.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcGltZmV4cmhwdHpkeGx4Y2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA5MzczMywiZXhwIjoyMDczNjY5NzMzfQ.SYCLq43OaWJv-M6JH6eZonwNgApI6wJlr_pr7ROAGzM';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkTrailSchema() {
  console.log('🔍 Checking trail_routes table schema and sample data...\n');

  try {
    // Get a sample trail route to see the actual structure
    const { data: sampleRoute, error: sampleError } = await supabase
      .from('trail_routes')
      .select('*')
      .limit(1)
      .single();

    if (sampleError) {
      console.error('❌ Error fetching sample route:', sampleError);
      return;
    }

    console.log('📋 Sample trail route structure:');
    console.log('Keys:', Object.keys(sampleRoute));
    console.log('\n📊 Sample data:');
    
    // Show each field and its value/type
    for (const [key, value] of Object.entries(sampleRoute)) {
      console.log(`${key}:`, typeof value, '-', 
        typeof value === 'object' ? JSON.stringify(value, null, 2) : value);
    }

    // Check specifically for coordinate fields
    console.log('\n🗺️ Coordinate fields analysis:');
    if (sampleRoute.route_coordinates) {
      console.log('route_coordinates type:', typeof sampleRoute.route_coordinates);
      console.log('route_coordinates structure:', JSON.stringify(sampleRoute.route_coordinates, null, 2));
    }
    
    if (sampleRoute.start_coordinates) {
      console.log('start_coordinates:', sampleRoute.start_coordinates);
    }
    
    if (sampleRoute.end_coordinates) {
      console.log('end_coordinates:', sampleRoute.end_coordinates);
    }

    // Check if there's a waypoints field
    if (sampleRoute.waypoints) {
      console.log('waypoints:', sampleRoute.waypoints);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTrailSchema();