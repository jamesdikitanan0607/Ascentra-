import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runReset() {
  try {
    console.log('🚀 Starting hiking spots reset...');
    
    // Read the reset file
    const resetPath = path.join(process.cwd(), 'reset_hiking_spots.sql');
    
    if (!fs.existsSync(resetPath)) {
      console.error('❌ Reset file not found:', resetPath);
      process.exit(1);
    }
    
    const resetSQL = fs.readFileSync(resetPath, 'utf8');
    
    console.log('📄 Reset file loaded successfully');
    
    // Remove comments and split into statements
    const cleanSQL = resetSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n');
    
    const allStatements = cleanSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log('\n🔍 Debug: All statements after split:');
    allStatements.forEach((stmt, i) => {
      console.log(`${i + 1}: ${stmt.substring(0, 100)}${stmt.length > 100 ? '...' : ''}`);
    });
    
    const statements = allStatements.filter(stmt => {
        return stmt !== 'COMMIT' &&
               !stmt.includes('SELECT setval') &&
               (stmt.includes('DELETE') || stmt.includes('INSERT') || stmt.includes('UPDATE') || stmt.includes('CREATE'));
      });
    
    console.log(`\n📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      console.log(`\n⚙️  Executing statement ${i + 1}/${statements.length}:`);
      console.log(`   ${statement.substring(0, 60)}${statement.length > 60 ? '...' : ''}`);
      
      try {
        let result;
        
        if (statement.includes('DELETE')) {
          // Execute DELETE statement
          result = await supabase.from('hiking_spots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        } else if (statement.includes('INSERT')) {
          // Parse INSERT statement and execute
          console.log('⚠️  INSERT statement detected - executing via SQL editor is recommended');
          console.log('   This script will skip INSERT for safety. Please run manually in Supabase SQL Editor.');
          continue;
        } else {
          console.log('⚠️  Skipping statement - not supported by this script');
          continue;
        }
        
        if (result && result.error) {
          console.error(`❌ Error executing statement ${i + 1}:`, result.error.message);
          console.error('Statement:', statement);
          continue;
        }
        
        console.log(`✅ Statement ${i + 1} executed successfully`);
        
      } catch (err) {
        console.error(`❌ Exception executing statement ${i + 1}:`, err.message);
        console.error('Statement:', statement);
      }
    }
    
    console.log('\n🎉 Reset completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the reset
runReset();