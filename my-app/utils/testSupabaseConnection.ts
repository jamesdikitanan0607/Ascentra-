import { supabase } from '../services/supabaseClient';
import { Platform } from 'react-native';

export const testSupabaseConnection = async (): Promise<{ success: boolean; error?: string; platform: string }> => {
  const platform = Platform.OS;
  
  try {
    console.log(`Testing Supabase connection on ${platform}...`);
    
    // Test simple health check
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase test error:', error);
      return { 
        success: false, 
        error: `${platform}: ${error.message}`, 
        platform 
      };
    }
    
    console.log('Supabase connection successful:', data);
    return { 
      success: true, 
      platform 
    };
    
  } catch (err) {
    console.error('Supabase test exception:', err);
    return { 
      success: false, 
      error: `${platform}: ${err instanceof Error ? err.message : 'Unknown error'}`, 
      platform 
    };
  }
};

export const testSupabaseAuth = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Testing Supabase auth...');
    
    // Test auth session
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Supabase auth test error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Supabase auth test successful, user:', user?.id || 'No user session');
    return { success: true };
    
  } catch (err) {
    console.error('Supabase auth test exception:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
};
