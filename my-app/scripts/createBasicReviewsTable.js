import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBasicReviewsTable() {
  try {
    console.log('Creating a basic reviews table for testing...');
    
    // For now, let's just test if we can create some sample review data
    // and verify the ReviewSystem component works
    
    // First, let's check if we can access hiking spots
    const { data: hikingSpots, error: spotsError } = await supabase
      .from('hiking_spots')
      .select('id, name')
      .limit(3);
    
    if (spotsError) {
      console.error('Error fetching hiking spots:', spotsError);
      return;
    }
    
    console.log('✓ Successfully connected to database');
    console.log(`Found ${hikingSpots.length} hiking spots:`);
    hikingSpots.forEach(spot => {
      console.log(`  - ${spot.name} (ID: ${spot.id})`);
    });
    
    console.log('\n📝 Next steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Run the SQL commands from the previous script output');
    console.log('4. This will create the reviews table with proper RLS policies');
    console.log('5. Then the ReviewSystem component will work properly');
    
    console.log('\n🔗 Supabase Dashboard: https://supabase.com/dashboard');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createBasicReviewsTable();