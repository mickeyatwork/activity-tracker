import React from 'react';
import { Plus, Trophy, Edit3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TopHeader } from '../common/TopHeader';

export function TemplatesView() {
  const { templates, navigate, loadStarterTemplates } = useApp();

  return (
    <div className="pb-12 animate-in fade-in duration-300">
      <TopHeader 
        title="Event Templates" 
        showBack 
        onBack={() => navigate('settings')} 
      />
      
      <div className="p-4 max-w-md mx-auto space-y-4">
        <p className="text-gray-600 text-sm mb-2">
          Templates define the different types of sports and the specific metrics you want to record.
        </p>

        <button 
          onClick={() => navigate('createTemplate')}
          className="w-full bg-indigo-50 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-xl p-4 flex items-center justify-center font-semibold hover:bg-indigo-100 transition cursor-pointer"
        >
          <Plus size={20} className="mr-2" />
          Create New Event Template
        </button>

        {templates.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-6 text-center">
            <Trophy className="mx-auto mb-2 text-amber-500" size={32} />
            <h3 className="font-bold text-amber-900 mb-1">No templates yet!</h3>
            <p className="text-sm text-amber-800 mb-4">Would you like to load some common starter events?</p>
            <button 
              onClick={loadStarterTemplates}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-5 rounded-lg text-sm transition shadow-sm cursor-pointer"
            >
              Load Starter Templates
            </button>
          </div>
        )}

        <div className="space-y-4 mt-6">
          {templates.map(template => (
            <div key={template.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs relative hover:border-indigo-200 transition">
              <button 
                onClick={() => navigate('createTemplate', null, template.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-indigo-600 transition bg-gray-50 hover:bg-gray-100 p-2 rounded-full cursor-pointer"
                aria-label={`Edit ${template.name}`}
              >
                <Edit3 size={18} />
              </button>

              <div className="flex items-center mb-2 pr-10">
                <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-xl mr-3 shrink-0">
                  <Trophy size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{template.name}</h3>
                  {template.description && <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>}
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                {template.metrics && template.metrics.map(m => (
                  <span key={m.id} className="inline-flex items-center bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium">
                    {m.name} ({m.type})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
