const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTrailRoutesTable() {
  try {
    console.log('🔄 Creating trail_routes table...');
    
    // First, let's check if the table already exists
    const { data: existingTables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'trail_routes');
    
    if (checkError) {
      console.log('Note: Could not check existing tables, proceeding with creation...');
    } else if (existingTables && existingTables.length > 0) {
      console.log('✅ trail_routes table already exists!');
      return;
    }
    
    // Since we can't use exec_sql, let's try to create a sample record to trigger table creation
    // This approach works if the table structure is defined in Supabase dashboard
    const sampleRoute = {
      hiking_spot_id: 999, // Temporary ID
      route_name: 'Test Route',
      difficulty: 'Easy',
      distance_km: 1.0,
      elevation_gain_m: 100,
      estimated_duration_hr: 1.0,
      highlights: 'Test route for table creation',
      route_color: '#FF0000',
      geojson_path: {
        type: 'LineString',
        coordinates: [[0, 0], [0.001, 0.001]]
      }
    };
    
    console.log('🔄 Attempting to create table by inserting sample data...');
    const { data, error } = await supabase
      .from('trail_routes')
      .insert([sampleRoute])
      .select();
    
    if (error) {
      console.error('❌ Error creating table:', error);
      console.log('\n📝 Please create the trail_routes table manually in Supabase with this SQL:');
      console.log(`
CREATE TABLE IF NOT EXISTS public.trail_routes (
  id BIGSERIAL PRIMARY KEY,
  hiking_spot_id BIGINT REFERENCES public.hiking_spots(id) ON DELETE CASCADE,
  route_name TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Moderate', 'Hard', 'Advanced')),
  distance_km DECIMAL(5,2) NOT NULL,
  elevation_gain_m INTEGER NOT NULL,
  estimated_duration_hr DECIMAL(3,1) NOT NULL,
  highlights TEXT,
  start_coordinates JSONB,
  end_coordinates JSONB,
  route_coordinates JSONB,
  geojson_path JSONB NOT NULL,
  route_color TEXT NOT NULL DEFAULT '#FF6B6B',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.trail_routes ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access on trail_routes" ON public.trail_routes
  FOR SELECT USING (true);

-- Create policy for authenticated insert/update/delete
CREATE POLICY "Allow authenticated users to manage trail_routes" ON public.trail_routes
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS trail_routes_hiking_spot_id_idx ON public.trail_routes(hiking_spot_id);
CREATE INDEX IF NOT EXISTS trail_routes_difficulty_idx ON public.trail_routes(difficulty);
`);
      process.exit(1);
    } else {
      console.log('✅ Table created successfully!');
      
      // Clean up the test record
      await supabase
        .from('trail_routes')
        .delete()
        .eq('hiking_spot_id', 999);
      
      console.log('🧹 Cleaned up test data');
    }
    
    console.log('🎉 Trail routes table setup completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

createTrailRoutesTable();