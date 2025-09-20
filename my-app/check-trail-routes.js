import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://tppimfexrhptzdxlxcbj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcGltZmV4cmhwdHpkeGx4Y2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA5MzczMywiZXhwIjoyMDczNjY5NzMzfQ.SYCLq43OaWJv-M6JH6eZonwNgApI6wJlr_pr7ROAGzM');

async function checkTrailRoutes() {
  console.log('=== TRAIL ROUTES ANALYSIS ===');
  
  const { data: routes, error } = await supabase
    .from('trail_routes')
    .select('hiking_spot_id, name, difficulty, length, estimated_time');
  
  if (error) {
    console.log('Error:', error.message);
    return;
  }
  
  console.log(`Total routes: ${routes.length}`);
  
  // Group by hiking spot
  const grouped = {};
  routes.forEach(route => {
    if (grouped[route.hiking_spot_id] === undefined) {
      grouped[route.hiking_spot_id] = [];
    }
    grouped[route.hiking_spot_id].push(route);
  });
  
  console.log('\nRoutes by hiking spot:');
  Object.keys(grouped).sort((a, b) => parseInt(a) - parseInt(b)).forEach(spotId => {
    console.log(`\nHiking Spot ${spotId}: ${grouped[spotId].length} routes`);
    grouped[spotId].forEach(route => {
      console.log(`  - ${route.name} (${route.difficulty}, ${route.length}, ${route.estimated_time})`);
    });
  });
  
  // Check which hiking spots (71-85) are missing routes
  console.log('\nMissing routes for hiking spots:');
  for (let i = 71; i <= 85; i++) {
    if (grouped[i] === undefined) {
      console.log(`  - Hiking Spot ${i}: No routes`);
    }
  }
}

checkTrailRoutes();