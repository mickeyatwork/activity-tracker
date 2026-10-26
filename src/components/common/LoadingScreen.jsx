import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingScreen({ message = "Syncing data..." }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
      <p className="text-gray-500 font-medium">{message}</p>
    </div>
  );
}
