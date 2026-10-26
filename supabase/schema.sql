-- ==============================================================================
-- Activity Tracker - Supabase Database Schema
-- ==============================================================================
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLES
-- ==============================================================================

-- Profiles / User Metadata & Roles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    username TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- People (Athletes, Participants, or Family Members)
CREATE TABLE IF NOT EXISTS public.people (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL DEFAULT '🏃',
    color TEXT NOT NULL DEFAULT 'bg-emerald-500',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Event Templates Table
CREATE TABLE IF NOT EXISTS public.templates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'Activity',
    metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Activity Results Table
CREATE TABLE IF NOT EXISTS public.results (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    person_id TEXT NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    values JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_people_user_id ON public.people(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON public.templates(user_id);
CREATE INDEX IF NOT EXISTS idx_results_user_id ON public.results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_person_id ON public.results(person_id);
CREATE INDEX IF NOT EXISTS idx_results_template_id ON public.results(template_id);
CREATE INDEX IF NOT EXISTS idx_results_date ON public.results(date DESC);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) & HELPER FUNCTIONS
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an active admin (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    );
$$;

-- Profiles Policies
CREATE POLICY "Users can view own profile or admins view all"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile or admins update all"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

-- People Policies
CREATE POLICY "Users can view their own people"
    ON public.people FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own people"
    ON public.people FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own people"
    ON public.people FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own people"
    ON public.people FOR DELETE
    USING (auth.uid() = user_id);

-- Templates Policies
CREATE POLICY "Users can view templates"
    ON public.templates FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own templates"
    ON public.templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
    ON public.templates FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
    ON public.templates FOR DELETE
    USING (auth.uid() = user_id);

-- Results Policies
CREATE POLICY "Users can view their own results"
    ON public.results FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own results"
    ON public.results FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own results"
    ON public.results FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own results"
    ON public.results FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 5. AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_count INTEGER;
    initial_role TEXT;
BEGIN
    SELECT count(*) INTO user_count FROM public.profiles;
    -- First user to sign up automatically becomes 'admin'; all others become 'user'
    IF user_count = 0 THEN
        initial_role := 'admin';
    ELSE
        initial_role := 'user';
    END IF;

    INSERT INTO public.profiles (id, email, username, role, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        initial_role,
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        username = COALESCE(EXCLUDED.username, public.profiles.username);

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill any existing users in auth.users into profiles
INSERT INTO public.profiles (id, email, username, role, is_active)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
    'user',
    true
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Ensure the very first user created is made Admin
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1);

-- ==============================================================================
-- 6. OPTIONAL STARTER TEMPLATES
-- ==============================================================================
INSERT INTO public.templates (id, user_id, name, description, icon, metrics)
VALUES
  (
    't_quadkids',
    NULL,
    'Quadkids Athletics',
    '4 events focusing on sprinting, endurance, throwing and jumping.',
    'Trophy',
    '[
      {"id": "m1", "name": "75m Sprint", "type": "time", "unit": "sec"},
      {"id": "m2", "name": "600m Run", "type": "time", "unit": "min:sec"},
      {"id": "m3", "name": "Standing Long Jump", "type": "distance", "unit": "m"},
      {"id": "m4", "name": "Vortex Howler", "type": "distance", "unit": "m"}
    ]'::jsonb
  ),
  (
    't_football',
    NULL,
    'Football Match',
    'Weekend league game tracking.',
    'Activity',
    '[
      {"id": "m5", "name": "Goals/Assists", "type": "number", "unit": ""},
      {"id": "m6", "name": "Great Passes", "type": "number", "unit": ""},
      {"id": "m7", "name": "Effort Level", "type": "rating", "unit": "/5"}
    ]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;
