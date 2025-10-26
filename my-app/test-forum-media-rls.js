/**
 * Test script to verify forum_post_media RLS policies work correctly
 * Run this script to test the database fixes
 */

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'your-supabase-url';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testForumMediaRLS() {
  console.log('🧪 Testing Forum Media RLS Policies...\n');

  try {
    // Test 1: Check if we can view forum_post_media (should work for everyone)
    console.log('Test 1: Checking if forum_post_media is viewable...');
    const { data: mediaData, error: mediaError } = await supabase
      .from('forum_post_media')
      .select('*')
      .limit(1);

    if (mediaError) {
      console.log('❌ Error viewing forum_post_media:', mediaError.message);
    } else {
      console.log('✅ Successfully viewed forum_post_media');
    }

    // Test 2: Check table structure
    console.log('\nTest 2: Checking table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_columns', { table_name: 'forum_post_media' })
      .catch(() => {
        // If RPC doesn't exist, try a different approach
        return supabase
          .from('forum_post_media')
          .select('*')
          .limit(0);
      });

    if (tableError) {
      console.log('⚠️  Could not check table structure:', tableError.message);
    } else {
      console.log('✅ Table structure check completed');
    }

    // Test 3: Check if user is authenticated
    console.log('\nTest 3: Checking authentication status...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('⚠️  User not authenticated. Some tests will be skipped.');
      console.log('   To test insertion, please authenticate first.');
    } else {
      console.log('✅ User authenticated:', user.email);

      // Test 4: Try to create a test forum post
      console.log('\nTest 4: Creating test forum post...');
      const { data: postData, error: postError } = await supabase
        .from('forum_posts')
        .insert({
          title: 'Test Post for Media RLS',
          content: 'This is a test post to verify media RLS policies',
          user_id: user.id,
        })
        .select('id')
        .single();

      if (postError) {
        console.log('❌ Error creating test post:', postError.message);
        return;
      }

      console.log('✅ Test post created:', postData.id);

      // Test 5: Try to insert media for the test post
      console.log('\nTest 5: Testing media insertion for own post...');
      const testMediaData = {
        post_id: postData.id,
        media_url: 'https://example.com/test-image.jpg',
        media_type: 'image',
      };

      const { data: insertData, error: insertError } = await supabase
        .from('forum_post_media')
        .insert(testMediaData)
        .select();

      if (insertError) {
        console.log('❌ Error inserting media:', insertError.message);
        console.log('   Error code:', insertError.code);
        console.log('   Error details:', insertError.details);
      } else {
        console.log('✅ Successfully inserted media for own post');

        // Clean up: Delete the test media
        await supabase
          .from('forum_post_media')
          .delete()
          .eq('id', insertData[0].id);
      }

      // Clean up: Delete the test post
      console.log('\nCleaning up test data...');
      await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postData.id);
      console.log('✅ Test data cleaned up');
    }

    // Test 6: Check RLS policies exist
    console.log('\nTest 6: Checking if RLS policies exist...');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_table_policies', { table_name: 'forum_post_media' })
      .catch(() => {
        // If RPC doesn't exist, this is expected
        return { data: null, error: null };
      });

    if (policyError) {
      console.log('⚠️  Could not check policies (this is normal):', policyError.message);
    } else if (policies) {
      console.log('✅ RLS policies found:', policies.length);
    } else {
      console.log('ℹ️  Policy check not available (this is normal)');
    }

    console.log('\n🎉 RLS Policy Test Completed!');
    console.log('\nNext steps:');
    console.log('1. Run the migration script: my-app/migrations/001-fix-forum-post-media-structure.sql');
    console.log('2. Run the RLS fix script: my-app/fix-forum-media-rls-policies.sql');
    console.log('3. Test media upload in your app');

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
  }
}

// Helper function to check database connection
async function checkConnection() {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Database connection failed:', error.message);
      return false;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.log('❌ Database connection error:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Forum Media RLS Policy Tests\n');

  // Check connection first
  const connected = await checkConnection();
  if (!connected) {
    console.log('\n❌ Cannot proceed without database connection.');
    console.log('Please check your SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    return;
  }

  await testForumMediaRLS();
}

// Run the tests
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testForumMediaRLS, checkConnection };