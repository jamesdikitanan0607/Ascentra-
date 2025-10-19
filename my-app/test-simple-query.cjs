const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSimpleQuery() {
  try {
    console.log('🧪 Testing simple query without PostGIS functions...');
    
    // Test basic query first
    const { data, error } = await supabase
      .from('hiking_spot_routes')
      .select('*')
      .eq('hiking_spot_id', 71)
      .order('route_name');

    console.log(`📊 Query result: ${data?.length || 0} routes`);
    console.log('❌ Error:', error);

    if (data && !error && Array.isArray(data)) {
      console.log('\n🔄 Raw data inspection...');
      
      data.forEach(route => {
        console.log(`\n📍 Route: ${route.route_name}`);
        console.log(`   start_point type: ${typeof route.start_point}`);
        console.log(`   end_point type: ${typeof route.end_point}`);
        console.log(`   coordinates type: ${typeof route.coordinates}`);
        
        if (route.start_point) {
          console.log(`   start_point sample: ${route.start_point.toString().substring(0, 50)}...`);
        }
        if (route.end_point) {
          console.log(`   end_point sample: ${route.end_point.toString().substring(0, 50)}...`);
        }
        if (route.coordinates) {
          console.log(`   coordinates sample: ${route.coordinates.toString().substring(0, 50)}...`);
        }
      });
      
      // Let's try to create a PostgreSQL function to convert geometry to text
      console.log('\n🔧 Creating PostgreSQL function to handle geometry conversion...');
      
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION get_trail_routes_with_text(spot_id integer)
        RETURNS TABLE (
          id integer,
          hiking_spot_id integer,
          route_name text,
          difficulty text,
          distance numeric,
          elevation_gain integer,
          estimated_duration integer,
          route_features text,
          route_description text,
          start_point_text text,
          end_point_text text,
          coordinates_text text,
          created_at timestamp with time zone,
          updated_at timestamp with time zone,
          is_active boolean
        )
        LANGUAGE sql
        AS $$
          SELECT 
            r.id,
            r.hiking_spot_id,
            r.route_name,
            r.difficulty,
            r.distance,
            r.elevation_gain,
            r.estimated_duration,
            r.route_features,
            r.route_description,
            ST_AsText(r.start_point) as start_point_text,
            ST_AsText(r.end_point) as end_point_text,
            ST_AsText(r.coordinates) as coordinates_text,
            r.created_at,
            r.updated_at,
            r.is_active
          FROM hiking_spot_routes r
          WHERE r.hiking_spot_id = spot_id
          ORDER BY r.route_name;
        $$;
      `;
      
      console.log('📋 SQL function to create:');
      console.log(createFunctionSQL);
      console.log('\n⚠️ Please run this SQL in your Supabase dashboard SQL editor');
      console.log('Then we can use: supabase.rpc("get_trail_routes_with_text", { spot_id: 71 })');
      
    } else {
      console.log('❌ No data returned or error occurred');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testSimpleQuery();
