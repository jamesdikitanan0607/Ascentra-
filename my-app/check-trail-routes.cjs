require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  try {
    console.log('🔍 Checking trail_routes table structure...');
    
    // Try to get table structure by attempting an insert with empty object
    const { error: insertError } = await supabase
      .from('trail_routes')
      .insert({});
    
    if (insertError) {
      console.log('📋 Insert error reveals required columns:');
      console.log(insertError.message);
    }
    
    // Also try a select to see if table exists
    const { data, error: selectError } = await supabase
      .from('trail_routes')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.log('❌ Select error:', selectError.message);
    } else {
      console.log('✅ trail_routes table exists');
      console.log('Current records:', data?.length || 0);
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

checkTableStructure();