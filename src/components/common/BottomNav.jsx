import React from 'react';
import { Home, Plus, LayoutList } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function BottomNav() {
  const { currentView, activeResultId, navigate } = useApp();

  const isHomeActive = currentView === 'dashboard' || currentView === 'childProfile';
  const isRecordActive = currentView === 'record' && !activeResultId;
  const isEventsActive = currentView === 'templates' || currentView === 'createTemplate';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <button 
          onClick={() => navigate('dashboard')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
            isHomeActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-label="Home Dashboard"
        >
          <Home size={24} />
          <span className="text-xs font-medium">Home</span>
        </button>

        <button 
          onClick={() => navigate('record')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            isRecordActive ? 'text-indigo-600' : 'text-gray-500'
          }`}
          aria-label="Record Activity"
        >
          <div className="bg-indigo-600 text-white p-2.5 rounded-full mb-1 shadow-lg transform -translate-y-2 hover:bg-indigo-700 active:scale-95 transition">
            <Plus size={24} />
          </div>
        </button>

        <button 
          onClick={() => navigate('templates')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
            isEventsActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-label="Event Templates"
        >
          <LayoutList size={24} />
          <span className="text-xs font-medium">Events</span>
        </button>
      </div>
    </nav>
  );
}
