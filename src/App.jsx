import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoadingScreen } from './components/common/LoadingScreen';
import { DashboardView } from './components/views/DashboardView';
import { ChildProfileView } from './components/views/ChildProfileView';
import { TemplatesView } from './components/views/TemplatesView';
import { CreateTemplateView } from './components/views/CreateTemplateView';
import { RecordResultView } from './components/views/RecordResultView';
import { SettingsView } from './components/views/SettingsView';
import { AuthView } from './components/views/AuthView';
import { AdminView } from './components/views/AdminView';
import { UserX } from 'lucide-react';

function AppRouter() {
  const { currentView, loadingApp, isAuthenticated, isUserActive, signOut } = useApp();

  if (loadingApp) {
    return <LoadingScreen message="Syncing data..." />;
  }

  // If user is not authenticated, strictly show the AuthView
  if (!isAuthenticated) {
    return <AuthView />;
  }

  // If user has been deactivated by an admin, block access
  if (!isUserActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-sm max-w-sm w-full space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <UserX size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Account Deactivated</h2>
          <p className="text-xs text-gray-500">
            Your account access has been paused by an administrator. Please contact your admin to restore access.
          </p>
          <button
            type="button"
            onClick={signOut}
            className="w-full bg-gray-800 hover:bg-black text-white text-xs font-bold py-3 rounded-xl transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-800">
      {currentView === 'dashboard' && <DashboardView />}
      {currentView === 'childProfile' && <ChildProfileView />}
      {currentView === 'templates' && <TemplatesView />}
      {currentView === 'createTemplate' && <CreateTemplateView />}
      {currentView === 'record' && <RecordResultView />}
      {currentView === 'settings' && <SettingsView />}
      {currentView === 'admin' && <AdminView />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
