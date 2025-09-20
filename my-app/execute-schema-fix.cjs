const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration or service role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSchemaFix() {
  console.log('🔧 Executing database schema fixes...');
  
  // Add skill_level column to profiles table
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skill_level text DEFAULT \'rookie_rambler\';'
    });
    
    if (error) {
      console.log('⚠️ Adding skill_level column:', error.message);
    } else {
      console.log('✅ Added skill_level column to profiles table');
    }
  } catch (e) {
    console.log('⚠️ skill_level column error:', e.message);
  }
  
  // Create favorites table
  try {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.favorites (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        trail_id uuid NOT NULL,
        created_at timestamptz DEFAULT now(),
        UNIQUE(user_id, trail_id)
      );
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });
    
    if (error) {
      console.log('⚠️ Creating favorites table:', error.message);
    } else {
      console.log('✅ Created favorites table');
    }
  } catch (e) {
    console.log('⚠️ Favorites table creation error:', e.message);
  }
  
  // Enable RLS on favorites table
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;'
    });
    
    if (error) {
      console.log('⚠️ Enabling RLS on favorites:', error.message);
    } else {
      console.log('✅ Enabled RLS on favorites table');
    }
  } catch (e) {
    console.log('⚠️ RLS enable error:', e.message);
  }
  
  // Create RLS policy for favorites
  try {
    const policySQL = `
      CREATE POLICY IF NOT EXISTS "Users can manage own favorites" ON public.favorites
        FOR ALL USING (auth.uid() = user_id);
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: policySQL
    });
    
    if (error) {
      console.log('⚠️ Creating favorites policy:', error.message);
    } else {
      console.log('✅ Created favorites RLS policy');
    }
  } catch (e) {
    console.log('⚠️ Policy creation error:', e.message);
  }
  
  console.log('🎉 Schema fixes completed!');
  
  // Verify the fixes
  console.log('\n🔍 Verifying fixes...');
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('skill_level')
      .limit(1);
      
    if (error) {
      console.log('❌ skill_level column still missing:', error.message);
    } else {
      console.log('✅ skill_level column is now accessible');
    }
  } catch (e) {
    console.log('⚠️ Verification error for profiles:', e.message);
  }
  
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('count')
      .limit(1);
      
    if (error) {
      console.log('❌ favorites table still missing:', error.message);
    } else {
      console.log('✅ favorites table is now accessible');
    }
  } catch (e) {
    console.log('⚠️ Verification error for favorites:', e.message);
  }
}

executeSchemaFix().catch(console.error);