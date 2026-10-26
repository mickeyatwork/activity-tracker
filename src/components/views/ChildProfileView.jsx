import React from 'react';
import { Medal, Calendar, Edit3, Activity, Clock, Ruler, Hash, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TopHeader } from '../common/TopHeader';
import { formatDateUK } from '../../utils/date';

export function ChildProfileView() {
  const { activeChildId, getChild, getTemplate, results, navigate } = useApp();
  const child = getChild(activeChildId);

  if (!child) return null;

  const childResults = results
    .filter(r => r.childId === child.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="pb-12 animate-in slide-in-from-right-4 duration-300">
      <TopHeader 
        title={`${child.name}'s Journey`} 
        showBack 
        onBack={() => navigate('dashboard')} 
      />
      
      <div className="max-w-md mx-auto">
        {/* Header Profile Area */}
        <div className={`${child.color} px-4 py-8 text-white flex flex-col items-center shadow-xs`}>
          <div className="text-6xl bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-inner">
            {child.avatar}
          </div>
          <h2 className="text-2xl font-bold">{child.name}</h2>
          <p className="text-white/80 mt-1 flex items-center">
            <Medal size={16} className="mr-1" />
            {childResults.length} Events Logged
          </p>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4 mt-2">Activity History</h3>
          
          {childResults.length === 0 ? (
            <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-xl border border-gray-100">
              No activities yet. Time to get out there!
            </p>
          ) : (
            <div className="space-y-4">
              {childResults.map(result => {
                const template = getTemplate(result.templateId);
                if (!template) return null;

                const isComplete = result.status !== 'in_progress';

                return (
                  <div key={result.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs hover:border-indigo-200 transition">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-gray-800">{template.name}</h4>
                        {!isComplete && (
                          <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                            In Progress
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => navigate('record', null, null, result.id)}
                        className="text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-full transition cursor-pointer"
                        aria-label="Edit Activity"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <p className="text-xs font-medium text-gray-400 mb-2 flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {formatDateUK(result.date)}
                      </p>

                      {template.metrics && template.metrics.map(metric => {
                        const val = result.values ? result.values[metric.id] : undefined;
                        const hasValue = val !== undefined && val !== '';
                        const displayVal = hasValue ? val : 'N/A';
                        
                        let Icon = Activity;
                        if (metric.type === 'time') Icon = Clock;
                        if (metric.type === 'distance') Icon = Ruler;
                        if (metric.type === 'number') Icon = Hash;
                        if (metric.type === 'rating') Icon = Star;

                        return (
                          <div key={metric.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center text-gray-600">
                              <Icon size={16} className="mr-2 text-indigo-400" />
                              <span>{metric.name}</span>
                            </div>
                            <div className={`font-semibold ${hasValue ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                              {displayVal} {hasValue && <span className="text-gray-500 font-normal text-xs">{metric.unit}</span>}
                            </div>
                          </div>
                        );
                      })}
                      
                      {result.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600 italic">"{result.notes}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
