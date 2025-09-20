const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🔧 Running database migration...');
  
  // Test connection first
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.log('⚠️ Connection test:', error.message);
    } else {
      console.log('✅ Connected to Supabase');
    }
  } catch (e) {
    console.log('❌ Connection failed:', e.message);
    return;
  }
  
  // Create favorites table using direct SQL
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('count')
      .limit(1);
      
    if (error && error.code === 'PGRST204') {
      console.log('📝 Creating favorites table...');
      // Table doesn't exist, we need to create it
      // Since we can't execute DDL directly, let's inform the user
      console.log('⚠️ Favorites table does not exist. Please run this SQL in Supabase dashboard:');
      console.log(`
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  trail_id uuid REFERENCES public.trails(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);
      `);
    } else if (error) {
      console.log('⚠️ Favorites table check:', error.message);
    } else {
      console.log('✅ Favorites table exists');
    }
  } catch (e) {
    console.log('⚠️ Favorites table check failed:', e.message);
  }
  
  // Check profiles table for skill_level column
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('skill_level')
      .limit(1);
      
    if (error && error.code === 'PGRST204') {
      console.log('⚠️ skill_level column does not exist. Please run this SQL in Supabase dashboard:');
      console.log('ALTER TABLE public.profiles ADD COLUMN skill_level text;');
    } else if (error) {
      console.log('⚠️ Profiles skill_level check:', error.message);
    } else {
      console.log('✅ skill_level column exists in profiles table');
    }
  } catch (e) {
    console.log('⚠️ Profiles table check failed:', e.message);
  }
  
  console.log('🎉 Migration check completed!');
}

runMigration().catch(console.error);