import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_USER_KEY = 'activity_tracker_local_user';

export const authService = {
  async signUp(email, password, username) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0]
          }
        }
      });

      if (error) throw error;
      return data;
    }

    // Local mock fallback
    const localUser = {
      id: `u_${Date.now()}`,
      email,
      user_metadata: { username },
      aud: 'authenticated',
      isGuest: false
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
    return { user: localUser };
  },

  async signIn(email, password) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    }

    // Local mock fallback
    const localUser = {
      id: `u_${Date.now()}`,
      email,
      user_metadata: { username: email.split('@')[0] },
      aud: 'authenticated',
      isGuest: false
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
    return { user: localUser };
  },

  async signOut() {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    localStorage.removeItem(LOCAL_USER_KEY);
  },

  async updateUser({ username, email, password }) {
    if (isSupabaseConfigured && supabase) {
      const updates = {};
      if (username !== undefined) {
        updates.data = { username };
      }
      if (email) {
        updates.email = email;
      }
      if (password) {
        updates.password = password;
      }

      const { data, error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      return data.user;
    }

    // Local fallback update
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    const current = raw ? JSON.parse(raw) : {};
    const updated = {
      ...current,
      email: email || current.email,
      user_metadata: {
        ...(current.user_metadata || {}),
        ...(username ? { username } : {})
      }
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
    return updated;
  }
};
