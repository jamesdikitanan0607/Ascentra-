const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase connection...');
console.log(`📍 URL: ${supabaseUrl}`);
console.log(`🔑 Key: ${supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'Not found'}`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('⚠️  Auth test result:', error.message);
    } else {
      console.log('✅ Supabase connection successful!');
    }
    
    // Try to create a simple table to test permissions
    console.log('🔧 Testing table creation...');
    
    // First, let's see what tables already exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.log('❌ Cannot query existing tables:', tablesError.message);
    } else {
      console.log('📋 Existing tables:', tables?.map(t => t.table_name) || 'None');
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();