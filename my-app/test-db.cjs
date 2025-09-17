const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL configured:', !!supabaseUrl);
console.log('Key configured:', !!supabaseKey);

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test basic connection
  supabase.from('hiking_spots').select('count').limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Database connection failed:', error.message);
      } else {
        console.log('✅ Database connection successful');
      }
      
      // Test forum posts table
      return supabase.from('forum_posts').select('count').limit(1);
    })
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Forum posts table error:', error.message);
      } else {
        console.log('✅ Forum posts table accessible');
      }
      
      // Test profiles table
      return supabase.from('profiles').select('count').limit(1);
    })
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Profiles table error:', error.message);
      } else {
        console.log('✅ Profiles table accessible');
      }
      
      // Test saveactivity table
      return supabase.from('saveactivity').select('count').limit(1);
    })
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Save activity table error:', error.message);
      } else {
        console.log('✅ Save activity table accessible');
      }
      
      console.log('\n✅ Database connection test completed');
      process.exit(0);
    })
    .catch(err => {
      console.log('❌ Connection error:', err.message);
      process.exit(1);
    });
} else {
  console.log('❌ Missing Supabase credentials');
  process.exit(1);
}