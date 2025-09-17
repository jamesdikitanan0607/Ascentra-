const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function verifyDatabaseSetup() {
  console.log('🔍 Verifying Database Setup...\n');

  try {
    // Check what tables exist
    console.log('📋 Checking existing tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (tablesError) {
      console.log('❌ Error querying tables:', tablesError.message);
      
      // Alternative method - try to query each table directly
      console.log('\n🔄 Trying alternative verification method...');
      const expectedTables = ['profiles', 'hiking_spots', 'trail_routes', 'reviews', 'hike_records'];
      const existingTables = [];
      
      for (const tableName of expectedTables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (!error) {
            existingTables.push(tableName);
            console.log(`✅ ${tableName} - EXISTS`);
          } else {
            console.log(`❌ ${tableName} - NOT FOUND (${error.message})`);
          }
        } catch (err) {
          console.log(`❌ ${tableName} - ERROR: ${err.message}`);
        }
      }
      
      console.log(`\n📊 Found ${existingTables.length} out of ${expectedTables.length} expected tables`);
      return;
    }

    const tableNames = tables.map(t => t.table_name).sort();
    console.log(`✅ Found ${tableNames.length} tables:`);
    tableNames.forEach(name => console.log(`   - ${name}`));

    // Check our specific tables
    console.log('\n🎯 Checking our app tables...');
    const expectedTables = ['profiles', 'hiking_spots', 'trail_routes', 'reviews', 'hike_records'];
    const missingTables = expectedTables.filter(table => !tableNames.includes(table));
    const extraTables = tableNames.filter(table => !expectedTables.includes(table));

    if (missingTables.length === 0) {
      console.log('✅ All required tables are present!');
    } else {
      console.log('❌ Missing tables:', missingTables.join(', '));
    }

    if (extraTables.length > 0) {
      console.log('ℹ️  Additional tables found:', extraTables.join(', '));
    }

    // Test basic functionality
    console.log('\n🧪 Testing basic functionality...');
    
    // Test profiles table
    try {
      const { count: profileCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      console.log(`✅ Profiles table: ${profileCount || 0} records`);
    } catch (err) {
      console.log('❌ Profiles table test failed:', err.message);
    }

    // Test hiking_spots table
    try {
      const { count: spotsCount } = await supabase
        .from('hiking_spots')
        .select('*', { count: 'exact', head: true });
      console.log(`✅ Hiking spots table: ${spotsCount || 0} records`);
    } catch (err) {
      console.log('❌ Hiking spots table test failed:', err.message);
    }

    // Test trail_routes table
    try {
      const { count: routesCount } = await supabase
        .from('trail_routes')
        .select('*', { count: 'exact', head: true });
      console.log(`✅ Trail routes table: ${routesCount || 0} records`);
    } catch (err) {
      console.log('❌ Trail routes table test failed:', err.message);
    }

    // Test reviews table
    try {
      const { count: reviewsCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true });
      console.log(`✅ Reviews table: ${reviewsCount || 0} records`);
    } catch (err) {
      console.log('❌ Reviews table test failed:', err.message);
    }

    // Test hike_records table
    try {
      const { count: recordsCount } = await supabase
        .from('hike_records')
        .select('*', { count: 'exact', head: true });
      console.log(`✅ Hike records table: ${recordsCount || 0} records`);
    } catch (err) {
      console.log('❌ Hike records table test failed:', err.message);
    }

    console.log('\n🎉 Database verification complete!');
    console.log('\n📝 Summary:');
    console.log(`   - Total tables: ${tableNames.length}`);
    console.log(`   - Required tables: ${expectedTables.length - missingTables.length}/${expectedTables.length}`);
    console.log(`   - Status: ${missingTables.length === 0 ? 'READY' : 'NEEDS SETUP'}`);

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyDatabaseSetup();