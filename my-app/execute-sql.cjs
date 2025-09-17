require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLFile(filename) {
  try {
    console.log(`🚀 Executing ${filename}...`);
    
    const sqlContent = fs.readFileSync(filename, 'utf8');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        const { data, error } = await supabase.rpc('exec', {
          query: statement
        });
        
        if (error) {
          console.log(`❌ Error in statement ${i + 1}:`, error.message);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log(`✅ Finished executing ${filename}`);
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

// Get filename from command line argument
const filename = process.argv[2];
if (!filename) {
  console.log('Usage: node execute-sql.cjs <filename>');
  process.exit(1);
}

executeSQLFile(filename);