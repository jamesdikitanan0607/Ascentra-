import { supabase } from './supabaseClient';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const getCurrentUserProfile = async (): Promise<{ data: Profile | null; error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('No authenticated user') };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Failed to fetch profile') 
    };
  }
};

export const updateProfile = async (updates: Partial<Profile>): Promise<{ data: Profile | null; error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('No authenticated user') };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Failed to update profile') 
    };
  }
};
