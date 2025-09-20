const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseSchema() {
  console.log('🔍 Checking database schema...');
  
  let issuesFound = [];
  
  // Check favorites table
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
        console.log('❌ Favorites table does not exist');
        issuesFound.push('favorites_table_missing');
      } else {
        console.log('⚠️ Favorites table check error:', error.message);
      }
    } else {
      console.log('✅ Favorites table exists');
    }
  } catch (e) {
    console.log('❌ Error checking favorites table:', e.message);
    issuesFound.push('favorites_table_error');
  }
  
  // Check skill_level column in profiles table
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('skill_level')
      .limit(1);
    
    if (error) {
      if (error.message.includes('skill_level') || error.code === 'PGRST204') {
        console.log('❌ skill_level column does not exist in profiles table');
        issuesFound.push('skill_level_column_missing');
      } else {
        console.log('⚠️ Profiles skill_level check error:', error.message);
      }
    } else {
      console.log('✅ skill_level column exists in profiles table');
    }
  } catch (e) {
    console.log('❌ Error checking skill_level column:', e.message);
    issuesFound.push('skill_level_column_error');
  }
  
  // Provide solutions
  if (issuesFound.length > 0) {
    console.log('\n🔧 Issues found! Here are the SQL commands to fix them:');
    console.log('Please run these in your Supabase SQL Editor:\n');
    
    if (issuesFound.includes('favorites_table_missing') || issuesFound.includes('favorites_table_error')) {
      console.log('-- Create favorites table');
      console.log(`CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    spot_id UUID REFERENCES public.hiking_spots(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, spot_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites" ON public.favorites
    FOR ALL USING (auth.uid() = user_id);

GRANT ALL ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
`);
    }
    
    if (issuesFound.includes('skill_level_column_missing') || issuesFound.includes('skill_level_column_error')) {
      console.log('-- Add skill_level column to profiles table');
      console.log(`ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS skill_level TEXT DEFAULT 'rookie_rambler' 
CHECK (skill_level IN ('rookie_rambler', 'climb_chaser', 'rock_scrambler', 'summit_strider', 'earth_roamer'));
`);
    }
    
    console.log('\n📝 After running these commands, restart your app to see if the errors are resolved.');
  } else {
    console.log('\n🎉 All database schema checks passed! No issues found.');
  }
}

checkDatabaseSchema();