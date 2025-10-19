const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExistingColumns() {
  try {
    console.log('🔍 Checking what columns exist in hiking_spot_routes...');
    
    // Try to insert a minimal record to see what columns are required/available
    const testData = {
      hiking_spot_id: 999,
      route_name: 'Test Route'
    };
    
    const { data, error } = await supabase
      .from('hiking_spot_routes')
      .insert([testData])
      .select();
    
    if (error) {
      console.log('Insert error:', error.message);
      
      // Try with different column combinations
      console.log('\n🧪 Testing different column combinations...');
      
      const testCombinations = [
        { hiking_spot_id: 999, route_name: 'Test', difficulty: 'Easy' },
        { hiking_spot_id: 999, route_name: 'Test', difficulty: 'Easy', distance: 1.0 },
        { hiking_spot_id: 999, route_name: 'Test', difficulty: 'Easy', distance: 1.0, elevation_gain: 100 }
      ];
      
      for (let i = 0; i < testCombinations.length; i++) {
        const { error: testError } = await supabase
          .from('hiking_spot_routes')
          .insert([testCombinations[i]]);
        
        if (!testError) {
          console.log(`✅ Combination ${i + 1} worked:`, Object.keys(testCombinations[i]));
          
          // Clean up
          await supabase
            .from('hiking_spot_routes')
            .delete()
            .eq('hiking_spot_id', 999);
          break;
        } else {
          console.log(`❌ Combination ${i + 1} failed:`, testError.message);
        }
      }
    } else {
      console.log('✅ Basic insert worked, columns available:', Object.keys(data[0]));
      
      // Clean up
      await supabase
        .from('hiking_spot_routes')
        .delete()
        .eq('hiking_spot_id', 999);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkExistingColumns();
