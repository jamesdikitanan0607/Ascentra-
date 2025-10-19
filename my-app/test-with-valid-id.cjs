const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithValidId() {
  try {
    console.log('🔍 Getting valid hiking spot IDs...');
    
    const { data: spots, error: spotsError } = await supabase
      .from('hiking_spots')
      .select('hiking_spot_id, name')
      .limit(1);
    
    if (spotsError || !spots || spots.length === 0) {
      console.error('❌ Could not get hiking spots:', spotsError);
      return;
    }
    
    const validSpotId = spots[0].hiking_spot_id;
    console.log(`✅ Using valid hiking spot ID: ${validSpotId} (${spots[0].name})`);
    
    // Test insert with valid ID
    const testData = {
      hiking_spot_id: validSpotId,
      route_name: 'Test Route',
      difficulty: 'Easy',
      distance: 1.0,
      elevation_gain: 100,
      estimated_duration_minutes: 60,
      route_features: 'Test features',
      route_description: 'Test description'
    };
    
    console.log('🧪 Testing insert with basic columns...');
    const { data, error } = await supabase
      .from('hiking_spot_routes')
      .insert([testData])
      .select();
    
    if (error) {
      console.log('❌ Insert failed:', error.message);
      
      // Try with minimal data
      console.log('🧪 Testing with minimal data...');
      const minimalData = {
        hiking_spot_id: validSpotId,
        route_name: 'Test Route'
      };
      
      const { data: minData, error: minError } = await supabase
        .from('hiking_spot_routes')
        .insert([minimalData])
        .select();
      
      if (minError) {
        console.log('❌ Minimal insert failed:', minError.message);
      } else {
        console.log('✅ Minimal insert worked! Available columns:', Object.keys(minData[0]));
        
        // Clean up
        await supabase
          .from('hiking_spot_routes')
          .delete()
          .eq('hiking_spot_id', validSpotId)
          .eq('route_name', 'Test Route');
      }
    } else {
      console.log('✅ Insert worked! Available columns:', Object.keys(data[0]));
      
      // Clean up
      await supabase
        .from('hiking_spot_routes')
        .delete()
        .eq('hiking_spot_id', validSpotId)
        .eq('route_name', 'Test Route');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testWithValidId();
