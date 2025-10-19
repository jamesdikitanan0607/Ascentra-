const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFieldByField() {
  try {
    console.log('🔍 Testing each field to find the geometry constraint...');
    
    const baseData = {
      hiking_spot_id: 71,
      route_name: 'Test Route'
    };
    
    const fieldsToTest = [
      { difficulty: 'Easy' },
      { distance: 2.0 },
      { elevation_gain: 100 },
      { estimated_duration: '60 minutes' },
      { route_features: 'Test features' },
      { route_description: 'Test description' },
      { start_point: '10.3140, 123.9620' },
      { end_point: '10.3170, 123.9660' },
      { coordinates: 'test' }
    ];
    
    for (let i = 0; i < fieldsToTest.length; i++) {
      const testData = { ...baseData, ...fieldsToTest[i] };
      const fieldName = Object.keys(fieldsToTest[i])[0];
      
      console.log(`\n🧪 Testing field: ${fieldName}`);
      
      const { error } = await supabase
        .from('hiking_spot_routes')
        .insert([testData]);
      
      if (error) {
        console.log(`❌ Field ${fieldName} caused error:`, error.message);
        
        // If it's start_point or end_point, test different formats
        if (fieldName === 'start_point' || fieldName === 'end_point') {
          console.log(`🔄 Testing different formats for ${fieldName}...`);
          
          const formats = [
            'POINT(123.9620 10.3140)',
            '(123.9620,10.3140)',
            '123.9620,10.3140',
            'ST_GeomFromText(\'POINT(123.9620 10.3140)\', 4326)'
          ];
          
          for (const format of formats) {
            const formatTestData = { ...baseData, [fieldName]: format };
            const { error: formatError } = await supabase
              .from('hiking_spot_routes')
              .insert([formatTestData]);
            
            if (formatError) {
              console.log(`  ❌ Format "${format}": ${formatError.message}`);
            } else {
              console.log(`  ✅ Format "${format}": SUCCESS!`);
              
              // Clean up
              await supabase
                .from('hiking_spot_routes')
                .delete()
                .eq('route_name', 'Test Route');
              break;
            }
          }
        }
      } else {
        console.log(`✅ Field ${fieldName} works fine`);
        
        // Clean up
        await supabase
          .from('hiking_spot_routes')
          .delete()
          .eq('route_name', 'Test Route');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testFieldByField();
