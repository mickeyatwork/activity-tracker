import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const peopleService = {
  async getAll(_userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching people from Supabase:', error);
        throw new Error(error.message);
      }
      return data || [];
    }

    return [];
  },

  async save(personData, userId) {
    if (!userId) {
      throw new Error('User authentication required to save.');
    }

    const id = personData.id || `p_${Date.now()}`;
    const payload = {
      id,
      name: personData.name,
      avatar: personData.avatar,
      color: personData.color,
      user_id: userId,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('people')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('Error saving person to Supabase:', error);
        throw new Error(error.message);
      }
      return data;
    }

    return payload;
  },

  async delete(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting person from Supabase:', error);
        throw new Error(error.message);
      }
    }
  }
};
