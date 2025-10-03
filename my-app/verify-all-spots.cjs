const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://tppimfexrhptzdxlxcbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcGltZmV4cmhwdHpkeGx4Y2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTM3MzMsImV4cCI6MjA3MzY2OTczM30.sQCNoudMxCodsGqNespKTBrH0i34c71eyzYDrSzyz78';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAllHikingSpots() {
  console.log('🔍 Verifying all hiking spots...\n');

  try {
    // First, let's check what columns exist in hiking_spots
    console.log('📋 Checking database schema...');
    const { data: spots, error: spotsError } = await supabase
      .from('hiking_spots')
      .select('*')
      .limit(1);

    if (spotsError) {
      console.error('❌ Error fetching hiking spots:', spotsError);
      return;
    }

    if (spots && spots.length > 0) {
      console.log('📊 Available columns:', Object.keys(spots[0]));
    }

    // Now fetch all hiking spots
    const { data: allSpots, error: allSpotsError } = await supabase
      .from('hiking_spots')
      .select('*');

    if (allSpotsError) {
      console.error('❌ Error fetching all hiking spots:', allSpotsError);
      return;
    }

    console.log(`📍 Found ${allSpots.length} hiking spots\n`);

    let successCount = 0;
    let failureCount = 0;

    for (const spot of allSpots) {
      console.log(`\n🏔️  Testing: ${spot.name} (ID: ${spot.hiking_spot_id})`);
      
      try {
        // Fetch trail routes for this spot
        const { data: routes, error: routesError } = await supabase
          .from('trail_routes')
          .select('*')
          .eq('hiking_spot_id', spot.hiking_spot_id);

        if (routesError) {
          console.log(`   ❌ Error fetching routes: ${routesError.message}`);
          failureCount++;
          continue;
        }

        if (!routes || routes.length === 0) {
          console.log(`   ⚠️  No trail routes found`);
          failureCount++;
          continue;
        }

        console.log(`   ✅ Found ${routes.length} trail route(s)`);
        
        // Check each route for valid data
        let validRoutes = 0;
        for (const route of routes) {
          if (route.coordinates && route.coordinates.length > 0) {
            validRoutes++;
            console.log(`      📍 Route "${route.name || 'Unnamed'}": ${route.coordinates.length} coordinates`);
          } else {
            console.log(`      ⚠️  Route "${route.name || 'Unnamed'}": No coordinates`);
          }
        }

        if (validRoutes > 0) {
          console.log(`   ✅ ${validRoutes}/${routes.length} routes have valid coordinates`);
          successCount++;
        } else {
          console.log(`   ❌ No routes have valid coordinates`);
          failureCount++;
        }

      } catch (error) {
        console.log(`   ❌ Error processing spot: ${error.message}`);
        failureCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successful spots: ${successCount}`);
    console.log(`❌ Failed spots: ${failureCount}`);
    console.log(`📍 Total spots: ${allSpots.length}`);
    console.log(`📈 Success rate: ${((successCount / allSpots.length) * 100).toFixed(1)}%`);

    if (successCount === allSpots.length) {
      console.log('\n🎉 All hiking spots verified successfully!');
    } else {
      console.log('\n⚠️  Some spots need attention.');
    }

  } catch (error) {
    console.error('❌ Fatal error during verification:', error);
  }
}

// Run the verification
verifyAllHikingSpots();