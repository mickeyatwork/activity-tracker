import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { STARTER_TEMPLATES } from '../constants/starterData';

export const templatesService = {
  async getAll(_userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching templates from Supabase:', error);
        throw new Error(error.message);
      }
      return data || [];
    }

    return [];
  },

  async save(templateData, userId) {
    if (!userId) {
      throw new Error('User authentication required to save template.');
    }

    const id = templateData.id || `t_${Date.now()}`;
    const payload = {
      id,
      name: templateData.name,
      description: templateData.description || '',
      icon: templateData.icon || 'Activity',
      metrics: templateData.metrics || [],
      user_id: userId,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('templates')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('Error saving template to Supabase:', error);
        throw new Error(error.message);
      }
      return data;
    }

    return payload;
  },

  async delete(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting template from Supabase:', error);
        throw new Error(error.message);
      }
    }
  },

  async loadStarterTemplates(userId) {
    if (!userId) {
      throw new Error('User authentication required.');
    }

    if (isSupabaseConfigured && supabase) {
      const templatesToInsert = STARTER_TEMPLATES.map(t => ({
        id: `${t.id}_${String(userId).slice(0, 8)}`,
        user_id: userId,
        name: t.name,
        description: t.description,
        icon: t.icon,
        metrics: t.metrics,
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('templates')
        .upsert(templatesToInsert, { onConflict: 'id' })
        .select();

      if (error) {
        console.error('Error loading starter templates to Supabase:', error);
        throw new Error(error.message);
      }
      return data || [];
    }

    return [];
  }
};
