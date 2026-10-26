import { supabase, isSupabaseConfigured } from '../lib/supabase';

const normalizeResult = (row) => {
  if (!row) return row;
  const personId = row.person_id || row.personId || row.child_id || row.childId;
  return {
    ...row,
    personId,
    person_id: personId,
    childId: personId,
    child_id: personId,
    templateId: row.template_id || row.templateId,
    values: row.values || {}
  };
};

export const resultsService = {
  async getAll(_userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching results from Supabase:', error);
        throw new Error(error.message);
      }
      return (data || []).map(normalizeResult);
    }

    return [];
  },

  async save(resultData, userId) {
    if (!userId) {
      throw new Error('User authentication required to save.');
    }

    const id = resultData.id || `r_${Date.now()}`;
    const personId = resultData.personId || resultData.person_id || resultData.childId || resultData.child_id;
    
    if (!personId) {
      throw new Error('A person must be selected.');
    }

    const templateId = resultData.templateId || resultData.template_id;
    if (!templateId) {
      throw new Error('An event template must be selected.');
    }

    const payload = {
      id,
      person_id: personId,
      template_id: templateId,
      date: resultData.date,
      notes: resultData.notes || '',
      values: resultData.values || {},
      status: resultData.status || 'completed',
      user_id: userId,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('results')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('Error saving result to Supabase:', error);
        throw new Error(error.message);
      }
      return normalizeResult(data);
    }

    return normalizeResult(payload);
  },

  async delete(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('results')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting result from Supabase:', error);
        throw new Error(error.message);
      }
    }
  }
};
