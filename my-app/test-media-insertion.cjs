const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

async function testMediaInsertion() {
  console.log('=== TESTING MEDIA INSERTION ===');
  
  try {
    // First, get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('❌ No authenticated user found');
      console.log('Auth error:', authError);
      return;
    }
    
    console.log('✅ Authenticated user:', user.id);
    
    // Check if the problem post exists and belongs to this user
    const problemPostId = '4e311704-689a-4eaf-902a-84305c02656f';
    const { data: post, error: postError } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('id', problemPostId)
      .single();
    
    if (postError) {
      console.log('❌ Error fetching post:', postError);
      return;
    }
    
    console.log('✅ Post found:', {
      id: post.id,
      title: post.title,
      user_id: post.user_id,
      owns_post: post.user_id === user.id
    });
    
    // Try to insert a test media record
    console.log('\n--- Testing media insertion ---');
    const testMedia = {
      post_id: problemPostId,
      media_url: 'https://example.com/test-image.jpg',
      media_type: 'image'
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('forum_post_media')
      .insert([testMedia])
      .select();
    
    if (insertError) {
      console.log('❌ Media insertion failed:', insertError);
      console.log('Error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
    } else {
      console.log('✅ Media insertion successful:', insertResult);
      
      // Clean up the test record
      await supabase
        .from('forum_post_media')
        .delete()
        .eq('media_url', 'https://example.com/test-image.jpg');
      console.log('✅ Test record cleaned up');
    }
    
    // Check RLS policies
    console.log('\n--- Checking RLS policies ---');
    try {
      const { data: policies, error: policyError } = await supabase.rpc('exec_sql', {
        sql: `SELECT tablename, policyname, cmd, permissive FROM pg_policies WHERE tablename IN ('forum_posts', 'forum_post_media') ORDER BY tablename, policyname`
      });
      
      if (policyError) {
        console.log('❌ Error fetching policies:', policyError);
      } else {
        console.log('RLS Policies:');
        policies.forEach(policy => {
          console.log(`  ${policy.tablename}.${policy.policyname} (${policy.cmd})`);
        });
      }
    } catch (e) {
      console.log('Could not fetch RLS policies (may not have permission)');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testMediaInsertion().catch(console.error);