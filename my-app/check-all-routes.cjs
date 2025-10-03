const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tppimfexrhptzdxlxcbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcGltZmV4cmhwdHpkeGx4Y2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTM3MzMsImV4cCI6MjA3MzY2OTczM30.sQCNoudMxCodsGqNespKTBrH0i34c71eyzYDrSzyz78';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllRoutes() {
  console.log('Checking all trail routes...');
  
  const { data: routes, error } = await supabase
    .from('trail_routes')
    .select('hiking_spot_id, route_name')
    .order('hiking_spot_id');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Total routes found:', routes.length);
  
  const grouped = {};
  routes.forEach(route => {
    const spotId = route.hiking_spot_id;
    if (!grouped[spotId]) {
      grouped[spotId] = [];
    }
    grouped[spotId].push(route.route_name);
  });
  
  Object.entries(grouped).forEach(([spotId, routeNames]) => {
    console.log(`Hiking Spot ID: ${spotId} - Routes: ${routeNames.length}`);
    routeNames.forEach(name => console.log(`  - ${name}`));
  });
}

checkAllRoutes().catch(console.error);