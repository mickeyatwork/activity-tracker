# Activity Tracker

A mobile-first activity and milestone tracker. Built with React, Vite, Tailwind CSS, and Supabase.

---

## 📁 Project Architecture & File Breakdown

The original monolithic file has been modularized into focused, single-responsibility files:

```
activity-tracker/
├── supabase/
│   └── schema.sql                 # Supabase DDL, tables, RLS policies, indexes & seed data
├── src/
│   ├── constants/
│   │   └── starterData.js         # Avatars, color palettes, and default sport templates
│   ├── lib/
│   │   └── supabase.js            # Supabase client setup with config validation
│   ├── services/
│   │   ├── authService.js         # Supabase auth (sign in, sign up, sign out, profile update)
│   │   ├── peopleService.js       # People CRUD (Supabase + localStorage fallback)
│   │   ├── templatesService.js    # Event templates CRUD & starter template loader
│   │   └── resultsService.js      # Activity records CRUD with camelCase/snake_case mapping
│   ├── context/
│   │   ├── AppContext.jsx         # Global state, router navigation, and auth state
│   │   └── useApp.js              # Custom hook for consuming application context
│   ├── components/
│   │   ├── common/
│   │   │   ├── TopHeader.jsx           # Sticky mobile header with back navigation and right action
│   │   │   ├── BottomNav.jsx           # Bottom navigation bar with action button
│   │   │   ├── LoadingScreen.jsx       # Synchronizing state spinner
│   │   │   └── SupabaseStatusBadge.jsx # Visual indicator of Supabase connection status
│   │   └── views/
│   │       ├── DashboardView.jsx       # People avatars, recent activities, and settings cog
│   │       ├── ChildProfileView.jsx    # Individual person history and event cards
│   │       ├── TemplatesView.jsx       # Event templates list and starter event generator
│   │       ├── CreateTemplateView.jsx  # Event template designer (name, metrics, types, units)
│   │       ├── RecordResultView.jsx    # Activity logger with dynamic metrics form
│   │       ├── SettingsView.jsx        # User settings: username, email, password, sign out
│   │       └── AuthView.jsx            # Sign in and account registration
│   ├── App.jsx                    # Root router component wrapped in AppProvider
│   ├── main.jsx                   # Application entry point
│   └── index.css                  # Tailwind directives and mobile animations
├── .env.example                   # Environment variable template
├── tailwind.config.js             # Tailwind config with color safelist and safe-area padding
└── package.json
```

---

## 🗄️ Supabase Tables & Schema Requirements

The database schema is saved in [`supabase/schema.sql`](file:///Users/mickeycosier/Documents/Github/mickeyatwork/activity-tracker/supabase/schema.sql).

### Required Tables

1. **`profiles`**: User metadata, admin roles, and active status.
   - `id` (`UUID`, Primary Key, references `auth.users(id) ON DELETE CASCADE`)
   - `email` (`TEXT`)
   - `username` (`TEXT`)
   - `role` (`TEXT`, check constraint: `'admin' | 'user'`)
   - `is_active` (`BOOLEAN`, default `true`)
   - `created_at` (`TIMESTAMPTZ`)
   - `updated_at` (`TIMESTAMPTZ`)

2. **`people`**: Stores person profiles (athletes, participants, family members).
   - `id` (`TEXT` / `UUID`, Primary Key)
   - `user_id` (`UUID`, Foreign Key to `auth.users(id) ON DELETE CASCADE`)
   - `name` (`TEXT`)
   - `avatar` (`TEXT`, emoji)
   - `color` (`TEXT`, Tailwind background class)
   - `created_at` (`TIMESTAMPTZ`)
   - `updated_at` (`TIMESTAMPTZ`)

2. **`templates`**: Defines sports and custom metrics.
   - `id` (`TEXT` / `UUID`, Primary Key)
   - `user_id` (`UUID`, Foreign Key to `auth.users(id) ON DELETE CASCADE`, nullable for shared system templates)
   - `name` (`TEXT`)
   - `description` (`TEXT`)
   - `icon` (`TEXT`)
   - `metrics` (`JSONB`, array of metric definitions `[{ id, name, type, unit }]`)
   - `created_at` (`TIMESTAMPTZ`)
   - `updated_at` (`TIMESTAMPTZ`)

3. **`results`**: Records logged athletic events.
   - `id` (`TEXT` / `UUID`, Primary Key)
   - `user_id` (`UUID`, Foreign Key to `auth.users(id) ON DELETE CASCADE`)
   - `person_id` (`TEXT`, Foreign Key to `people(id) ON DELETE CASCADE`)
   - `template_id` (`TEXT`, Foreign Key to `templates(id) ON DELETE CASCADE`)
   - `date` (`DATE`)
   - `notes` (`TEXT`)
   - `values` (`JSONB`, key-value map of recorded metric IDs to scores/times)
   - `status` (`TEXT`, check constraint: `'in_progress' | 'completed'`)
   - `created_at` (`TIMESTAMPTZ`)
   - `updated_at` (`TIMESTAMPTZ`)

---

## 🚀 Setup & Supabase Connection

### 1. Run Database Schema in Supabase
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** tab on the left sidebar.
3. Paste the contents of [`supabase/schema.sql`](file:///Users/mickeycosier/Documents/Github/mickeyatwork/activity-tracker/supabase/schema.sql) and click **Run**.
4. This creates all tables, performance indexes, and Row Level Security (RLS) policies.

### 2. Configure Environment Variables
Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Fill in your project credentials from **Project Settings > API**:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> **Note:** If no Supabase credentials are provided, the app automatically runs in **Local Demo Mode** using browser storage so you can test immediately.

### 3. Run Locally

```bash
npm install
npm run dev
```

---

## 🌐 Automated GitHub Pages Deployment

The repository includes a GitHub Actions workflow in [`.github/workflows/deploy.yml`](file:///.github/workflows/deploy.yml) that builds and deploys the app whenever changes are pushed or merged into `main`.

### To activate GitHub Pages:

1. **Add Secrets in GitHub**:
   - Go to your repository on GitHub: **Settings > Secrets and variables > Actions**.
   - Click **New repository secret** and add:
     - `VITE_SUPABASE_URL`: Your Supabase Project URL.
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.

2. **Enable GitHub Actions for Pages**:
   - In your repository, go to **Settings > Pages**.
   - Under **Build and deployment > Source**, select **GitHub Actions** (instead of "Deploy from a branch").

3. **Push to `main`**:
   - Every merge or push to `main` will automatically trigger the workflow and deploy your latest build to `https://<username>.github.io/activity-tracker/`.
