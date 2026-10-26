import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const adminService = {
  async getAllProfiles() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching profiles:', error);
        throw new Error(error.message);
      }
      return data || [];
    }

    return [];
  },

  async setUserActive(profileId, isActive) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', profileId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user active status:', error);
        throw new Error(error.message);
      }
      return data;
    }
  }
};
