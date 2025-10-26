const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

async function diagnose() {
  console.log('=== FORUM MEDIA DIAGNOSTIC ===');
  
  try {
    // Check if tables exist
    console.log('\n1. Checking table existence...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['forum_posts', 'forum_post_media'])
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.log('Tables check error:', tablesError);
    } else {
      console.log('Existing tables:', tables?.map(t => t.table_name) || []);
    }
    
    // Check forum_post_media structure
    console.log('\n2. Checking forum_post_media structure...');
    const { data: columns, error: colError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'forum_post_media')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (colError) {
      console.log('Columns check error:', colError);
    } else {
      console.log('forum_post_media columns:', columns);
    }
    
    // Check sample data
    console.log('\n3. Checking sample data...');
    const { data: posts, error: postsError } = await supabase
      .from('forum_posts')
      .select('id, title, user_id, created_at')
      .limit(3);
    
    if (postsError) {
      console.log('Posts query error:', postsError);
    } else {
      console.log(`Found ${posts?.length || 0} sample posts:`, posts);
    }
    
    const { data: media, error: mediaError } = await supabase
      .from('forum_post_media')
      .select('id, post_id, media_url, media_type')
      .limit(5);
    
    if (mediaError) {
      console.log('Media query error:', mediaError);
    } else {
      console.log(`Found ${media?.length || 0} media records:`, media);
    }
    
    // Check specific post media
    if (posts && posts.length > 0) {
      console.log('\n4. Checking media for specific posts...');
      const postIds = posts.map(p => p.id);
      const { data: postMedia, error: postMediaError } = await supabase
        .from('forum_post_media')
        .select('*')
        .in('post_id', postIds);
      
      if (postMediaError) {
        console.log('Post media query error:', postMediaError);
      } else {
        console.log('Media for sample posts:', postMedia);
      }
    }
    
    // Check the specific post from the logs
    console.log('\n5. Checking specific post from logs...');
    const problemPostId = '4e311704-689a-4eaf-902a-84305c02656f';
    const { data: problemPost, error: problemPostError } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('id', problemPostId)
      .single();
    
    if (problemPostError) {
      console.log('Problem post query error:', problemPostError);
    } else {
      console.log('Problem post data:', problemPost);
    }
    
    const { data: problemMedia, error: problemMediaError } = await supabase
      .from('forum_post_media')
      .select('*')
      .eq('post_id', problemPostId);
    
    if (problemMediaError) {
      console.log('Problem post media query error:', problemMediaError);
    } else {
      console.log('Problem post media:', problemMedia);
    }
    
  } catch (error) {
    console.error('Diagnostic error:', error);
  }
}

diagnose().catch(console.error);