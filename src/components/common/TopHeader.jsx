import React from 'react';
import { ChevronLeft } from 'lucide-react';

export function TopHeader({ title, showBack = false, onBack = () => {}, rightAction = null }) {
  return (
    <header className="bg-white px-4 py-4 sticky top-0 z-40 border-b border-gray-100 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-2 min-w-0">
        {showBack && (
          <button 
            onClick={onBack} 
            className="mr-2 text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <h1 className="text-xl font-bold text-gray-800 tracking-tight truncate">{title}</h1>
      </div>

      {rightAction && (
        <div className="shrink-0 ml-3">
          {rightAction}
        </div>
      )}
    </header>
  );
}
