import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDatabaseStructure() {
  console.log('🔍 Verifying current database structure...\n');
  
  try {
    // Test hiking_spots table
    console.log('📋 Testing hiking_spots table...');
    const { data: spots, error: spotsError } = await supabase
      .from('hiking_spots')
      .select('*')
      .limit(1);
    
    if (spotsError) {
      console.log('❌ hiking_spots table issue:', spotsError.message);
      if (spotsError.message.includes('does not exist')) {
        console.log('   → Table needs to be created');
      } else if (spotsError.message.includes('hiking_spot_id')) {
        console.log('   → Column name mismatch detected');
      }
    } else {
      console.log('✅ hiking_spots table accessible');
      if (spots && spots.length > 0) {
        console.log('   → Sample data found');
        console.log('   → Columns:', Object.keys(spots[0]).join(', '));
      }
    }
    
    // Test trail_routes table
    console.log('\n📋 Testing trail_routes table...');
    const { data: routes, error: routesError } = await supabase
      .from('trail_routes')
      .select('*')
      .limit(1);
    
    if (routesError) {
      console.log('❌ trail_routes table issue:', routesError.message);
    } else {
      console.log('✅ trail_routes table accessible');
      if (routes && routes.length > 0) {
        console.log('   → Sample data found');
        console.log('   → Columns:', Object.keys(routes[0]).join(', '));
      }
    }
    
    // Test reviews table
    console.log('\n📋 Testing reviews table...');
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .limit(1);
    
    if (reviewsError) {
      console.log('❌ reviews table issue:', reviewsError.message);
      if (reviewsError.message.includes('does not exist')) {
        console.log('   → Table needs to be created');
      }
    } else {
      console.log('✅ reviews table accessible');
      if (reviews && reviews.length > 0) {
        console.log('   → Sample data found');
        console.log('   → Columns:', Object.keys(reviews[0]).join(', '));
      }
    }
    
    // Test foreign key relationships
    console.log('\n🔗 Testing foreign key relationships...');
    try {
      const { data: joinTest, error: joinError } = await supabase
        .from('hiking_spots')
        .select(`
          hiking_spot_id,
          name,
          trail_routes(route_id, route_name)
        `)
        .limit(1);
      
      if (joinError) {
        console.log('❌ Foreign key relationship issue:', joinError.message);
      } else {
        console.log('✅ hiking_spots ↔ trail_routes relationship working');
      }
    } catch (err) {
      console.log('❌ Join test failed:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

async function showManualInstructions() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 MANUAL DATABASE FIX INSTRUCTIONS');
  console.log('='.repeat(60));
  
  console.log('\n🔧 To fix the database schema issues:');
  console.log('\n1. Go to your Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard/project/drcgjiadevrzxgwziemq');
  
  console.log('\n2. Navigate to SQL Editor (left sidebar)');
  
  console.log('\n3. Copy and paste the contents of fix-database-schema.sql');
  console.log('   (Located in this project directory)');
  
  console.log('\n4. Execute the SQL script');
  
  console.log('\n5. Run this verification script again to confirm fixes');
  
  console.log('\n📄 The SQL script will:');
  console.log('   ✅ Drop and recreate tables with correct schema');
  console.log('   ✅ Use INTEGER primary keys for hiking_spot_id');
  console.log('   ✅ Create proper foreign key relationships');
  console.log('   ✅ Add reviews table with user_id and hiking_spot_id foreign keys');
  console.log('   ✅ Enable Row Level Security');
  console.log('   ✅ Insert sample data for testing');
  
  console.log('\n' + '='.repeat(60));
}

// Main execution
console.log('🚀 Supabase Database Structure Verification');
console.log('==========================================\n');

await verifyDatabaseStructure();
await showManualInstructions();

console.log('\n💡 After running the SQL script manually, run this script again to verify the fixes.');