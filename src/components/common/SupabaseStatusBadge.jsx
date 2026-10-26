import React, { useState } from 'react';
import { Database, CheckCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function SupabaseStatusBadge() {
  const { isSupabaseConfigured } = useApp();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="px-4 pt-3 max-w-md mx-auto">
      {isSupabaseConfigured ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-2 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle size={15} className="text-emerald-600 shrink-0" />
            <span className="font-medium">Connected to Supabase</span>
          </div>
          <button 
            onClick={() => setDismissed(true)} 
            className="text-emerald-600 hover:text-emerald-800 p-0.5"
            aria-label="Dismiss banner"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3 py-2.5 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-start space-x-2">
            <Database size={15} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Local Storage Mode</p>
              <p className="text-amber-700 text-[11px] mt-0.5">
                Set <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_URL</code> in <code className="font-mono">.env</code> to connect Supabase.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setDismissed(true)} 
            className="text-amber-600 hover:text-amber-800 p-0.5"
            aria-label="Dismiss banner"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
