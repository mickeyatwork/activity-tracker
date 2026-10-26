import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { peopleService } from '../services/peopleService';
import { templatesService } from '../services/templatesService';
import { resultsService } from '../services/resultsService';
import { authService } from '../services/authService';

export const AppContext = createContext(null);

export function AppProvider({ children: reactChildren }) {
  // Navigation State
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeChildId, setActiveChildId] = useState(null);
  const [activeTemplateId, setActiveTemplateId] = useState(null);
  const [activeResultId, setActiveResultId] = useState(null);

  // Data State
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [peopleList, setPeopleList] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [results, setResults] = useState([]);

  const isInitialLoadDone = useRef(false);

  // Data Loading
  const loadAllData = useCallback(async (activeUser) => {
    if (!activeUser) {
      setPeopleList([]);
      setTemplates([]);
      setResults([]);
      setUserProfile(null);
      setLoadingApp(false);
      return;
    }

    setLoadingApp(true);
    try {
      const uid = activeUser.id;

      // Fetch profile (roles & active status)
      let profileData = null;
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: prof, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', uid)
            .maybeSingle();

          if (!error && prof) {
            profileData = prof;
          }
        } catch (e) {
          console.warn('Could not fetch user profile:', e);
        }
      }
      setUserProfile(profileData);

      const [fetchedPeople, fetchedTemplates, fetchedResults] = await Promise.all([
        peopleService.getAll(uid).catch(err => {
          console.error('Failed to load people:', err);
          return [];
        }),
        templatesService.getAll(uid).catch(err => {
          console.error('Failed to load templates:', err);
          return [];
        }),
        resultsService.getAll(uid).catch(err => {
          console.error('Failed to load results:', err);
          return [];
        })
      ]);

      setPeopleList(fetchedPeople);
      setTemplates(fetchedTemplates);
      setResults(fetchedResults);
    } catch (err) {
      console.error('Error during loadAllData:', err);
    } finally {
      setLoadingApp(false);
      isInitialLoadDone.current = true;
    }
  }, []);

  // Auth initialization
  useEffect(() => {
    let isMounted = true;

    const safetyTimer = setTimeout(() => {
      if (isMounted && !isInitialLoadDone.current) {
        setLoadingApp(false);
      }
    }, 2000);

    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            if (isMounted) {
              setUser(session.user);
              await loadAllData(session.user);
            }
          } else {
            if (isMounted) {
              setUser(null);
              setLoadingApp(false);
            }
          }
        } catch (err) {
          console.warn('Supabase auth session check failed:', err);
          if (isMounted) {
            setUser(null);
            setLoadingApp(false);
          }
        }

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (isMounted) {
            if (session?.user) {
              setUser(session.user);
              loadAllData(session.user);
            } else {
              setUser(null);
              setUserProfile(null);
              setPeopleList([]);
              setTemplates([]);
              setResults([]);
              setLoadingApp(false);
            }
          }
        });

        return () => {
          authListener?.subscription?.unsubscribe();
        };
      } else {
        if (isMounted) {
          setUser(null);
          setLoadingApp(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, [loadAllData]);

  // Auth Actions
  const signIn = async (email, password) => {
    setLoadingApp(true);
    try {
      const data = await authService.signIn(email, password);
      if (data.user) {
        setUser(data.user);
        await loadAllData(data.user);
        setCurrentView('dashboard');
        return data;
      }
    } finally {
      setLoadingApp(false);
    }
  };

  const signUp = async (email, password, username) => {
    setLoadingApp(true);
    try {
      const data = await authService.signUp(email, password, username);
      if (data.session && data.user) {
        setUser(data.user);
        await loadAllData(data.user);
        setCurrentView('dashboard');
      }
      return data;
    } finally {
      setLoadingApp(false);
    }
  };

  const signOut = async () => {
    setLoadingApp(true);
    try {
      await authService.signOut();
      setUser(null);
      setUserProfile(null);
      setPeopleList([]);
      setTemplates([]);
      setResults([]);
      setCurrentView('auth');
    } finally {
      setLoadingApp(false);
    }
  };

  const updateUserProfile = async ({ username, email, password }) => {
    const updated = await authService.updateUser({ username, email, password });
    if (updated) {
      setUser(prev => ({
        ...prev,
        ...updated,
        email: email || updated.email || prev?.email,
        user_metadata: {
          ...(prev?.user_metadata || {}),
          ...(updated.user_metadata || {}),
          ...(username ? { username } : {})
        }
      }));
      setUserProfile(prev => prev ? ({ ...prev, username: username || prev.username, email: email || prev.email }) : null);
    }
    return updated;
  };

  // Navigation Helper
  const navigate = (view, childId = null, templateId = null, resultId = null) => {
    setCurrentView(view);
    setActiveChildId(childId);
    setActiveTemplateId(templateId);
    setActiveResultId(resultId);
    window.scrollTo(0, 0);
  };

  // Selectors
  const getPerson = useCallback((id) => peopleList.find(p => p.id === id), [peopleList]);
  const getTemplate = useCallback((id) => templates.find(t => t.id === id), [templates]);

  // Mutations
  const savePerson = async (personData) => {
    const userId = user?.id;
    if (!userId) {
      throw new Error('You must be signed in to add or edit people.');
    }
    const saved = await peopleService.save(personData, userId);
    setPeopleList(prev => {
      const idx = prev.findIndex(p => p.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
    return saved;
  };

  const deletePerson = async (id) => {
    await peopleService.delete(id);
    setPeopleList(prev => prev.filter(p => p.id !== id));
  };

  const saveTemplate = async (templateData) => {
    const userId = user?.id;
    if (!userId) {
      throw new Error('You must be signed in to save templates.');
    }
    const saved = await templatesService.save(templateData, userId);
    setTemplates(prev => {
      const idx = prev.findIndex(t => t.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
    return saved;
  };

  const deleteTemplate = async (id) => {
    await templatesService.delete(id);
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const saveResult = async (resultData) => {
    const userId = user?.id;
    if (!userId) {
      throw new Error('You must be signed in to record activities.');
    }
    const saved = await resultsService.save(resultData, userId);
    setResults(prev => {
      const idx = prev.findIndex(r => r.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    return saved;
  };

  const deleteResult = async (id) => {
    await resultsService.delete(id);
    setResults(prev => prev.filter(r => r.id !== id));
  };

  const loadStarterTemplates = async () => {
    const userId = user?.id;
    if (!userId) {
      throw new Error('You must be signed in to load templates.');
    }
    setLoadingApp(true);
    try {
      const loaded = await templatesService.loadStarterTemplates(userId);
      setTemplates(loaded);
    } finally {
      setLoadingApp(false);
    }
  };

  const isAuthenticated = Boolean(user && user.id);
  const isAdmin = Boolean(userProfile?.role === 'admin');
  const isUserActive = userProfile ? userProfile.is_active : true;

  const value = {
    currentView,
    activeChildId,
    activePersonId: activeChildId,
    activeTemplateId,
    activeResultId,
    navigate,
    user,
    userProfile,
    isAuthenticated,
    isAdmin,
    isUserActive,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
    loadingApp,
    people: peopleList,
    children: peopleList,
    templates,
    results,
    getPerson,
    getChild: getPerson,
    getTemplate,
    savePerson,
    saveChild: savePerson,
    deletePerson,
    deleteChild: deletePerson,
    saveTemplate,
    deleteTemplate,
    saveResult,
    deleteResult,
    loadStarterTemplates,
    isSupabaseConfigured
  };

  return (
    <AppContext.Provider value={value}>
      {reactChildren}
    </AppContext.Provider>
  );
}

export { useApp } from './useApp';
