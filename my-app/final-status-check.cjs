require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalStatusCheck() {
  console.log('🔍 Final Database Status Check');
  console.log('================================');
  
  try {
    // Check hiking spots
    const { data: spots, error: spotsError } = await supabase
      .from('hiking_spots')
      .select('id, name')
      .limit(10);
    
    if (spotsError) {
      console.log('❌ Hiking Spots Error:', spotsError.message);
    } else {
      console.log(`✅ Hiking Spots: ${spots?.length || 0} records`);
      if (spots && spots.length > 0) {
        console.log('   Sample spots:');
        spots.slice(0, 3).forEach(spot => {
          console.log(`   - ${spot.name}`);
        });
      }
    }
    
    // Check trail routes
    const { data: routes, error: routesError } = await supabase
      .from('trail_routes')
      .select('route_id, route_name')
      .limit(5);
    
    if (routesError) {
      console.log('❌ Trail Routes Error:', routesError.message);
      if (routesError.message.includes('invalid input syntax for type integer')) {
        console.log('   → Schema mismatch detected');
      }
    } else {
      console.log(`✅ Trail Routes: ${routes?.length || 0} records`);
      if (routes && routes.length > 0) {
        console.log('   Sample routes:');
        routes.slice(0, 3).forEach(route => {
          console.log(`   - ${route.route_name}`);
        });
      }
    }
    
    console.log('');
    console.log('📋 SUMMARY:');
    console.log('===========');
    
    if (spots && spots.length > 0) {
      console.log('✅ Hiking spots data is properly inserted');
    } else {
      console.log('❌ No hiking spots found');
    }
    
    if (routes && routes.length > 0) {
      console.log('✅ Trail routes data is properly inserted');
      console.log('✅ Database setup is complete!');
    } else {
      console.log('❌ Trail routes table is empty or has schema issues');
      console.log('');
      console.log('🔧 REQUIRED ACTIONS:');
      console.log('1. Run fix-trail-routes-corrected.sql in Supabase SQL Editor');
      console.log('2. Run setup-forum-storage.sql in Supabase SQL Editor');
      console.log('3. Execute: node insert-corrected-data.cjs');
      console.log('');
      console.log('📁 Files created for you:');
      console.log('- fix-trail-routes-corrected.sql (schema fix)');
      console.log('- setup-forum-storage.sql (storage buckets)');
      console.log('- insert-corrected-data.cjs (data insertion)');
      console.log('- complete-setup-guide.md (comprehensive guide)');
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

finalStatusCheck();