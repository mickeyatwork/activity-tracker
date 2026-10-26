import React, { useState } from 'react';
import { Activity, UserPlus, Heart, Calendar, AlertCircle, Settings, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TopHeader } from '../common/TopHeader';
import { AVATAR_OPTIONS, COLOR_OPTIONS } from '../../constants/starterData';
import { formatDateUK } from '../../utils/date';

export function DashboardView() {
  const { children, results, saveChild, navigate, getChild, getTemplate } = useApp();
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');

  // Sort results by date descending in memory
  const recentActivity = [...results].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleAddChildSubmit = async () => {
    if (!newChildName.trim()) return;
    const newChild = {
      name: newChildName.trim(),
      avatar: AVATAR_OPTIONS[children.length % AVATAR_OPTIONS.length],
      color: COLOR_OPTIONS[children.length % COLOR_OPTIONS.length]
    };
    try {
      await saveChild(newChild);
      setNewChildName('');
      setIsAddingChild(false);
    } catch (err) {
      console.error('Failed to save person:', err);
      alert('Error saving person to database: ' + err.message);
    }
  };

  return (
    <div className="pb-12 animate-in fade-in duration-300">
      <TopHeader 
        title="Activity Tracker" 
        rightAction={
          <button 
            onClick={() => navigate('settings')}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition cursor-pointer"
            aria-label="Account Settings"
          >
            <Settings size={22} />
          </button>
        }
      />

      <div className="p-4 space-y-8 max-w-md mx-auto">
        {/* People Section */}
        <div>
          <div className="grid grid-cols-2 gap-4">
            {children.map(child => (
              <button 
                key={child.id}
                onClick={() => navigate('childProfile', child.id)}
                className={`${child.color} text-white rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center space-y-2 transform transition active:scale-95 hover:shadow-md cursor-pointer`}
              >
                <div className="text-4xl bg-white/20 w-16 h-16 rounded-full flex items-center justify-center shadow-inner">
                  {child.avatar}
                </div>
                <span className="font-bold text-lg">{child.name}</span>
              </button>
            ))}

            {isAddingChild ? (
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-3 shadow-sm flex flex-col items-center justify-center space-y-2">
                <input 
                  autoFocus
                  type="text" 
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChildSubmit()}
                  placeholder="Name"
                  className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-center text-gray-800 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex space-x-2 w-full">
                  <button 
                    onClick={() => setIsAddingChild(false)} 
                    className="flex-1 text-xs text-gray-500 py-2 hover:bg-gray-100 rounded transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddChildSubmit} 
                    className="flex-1 bg-indigo-600 text-white rounded text-xs font-bold py-2 hover:bg-indigo-700 transition cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAddingChild(true)}
                className="bg-gray-50 border-2 border-dashed border-gray-300 text-gray-500 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center space-y-2 hover:bg-gray-100 transition cursor-pointer"
              >
                <div className="text-2xl bg-gray-200 w-12 h-12 rounded-full flex items-center justify-center text-gray-400">
                  <UserPlus size={20} />
                </div>
                <span className="font-medium text-sm">Add Person</span>
              </button>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <Activity className="mr-2 text-indigo-500" size={20} />
              Recent Activities
            </h2>
            <button 
              onClick={() => navigate('record')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center shadow-xs transition cursor-pointer active:scale-95"
            >
              <Plus size={15} className="mr-1" />
              New Activity
            </button>
          </div>
          
          {recentActivity.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500 border border-gray-100">
              <Heart className="mx-auto mb-2 text-gray-300" size={32} />
              <p>No activities recorded yet.</p>
              <p className="text-sm mt-1">Tap 'New Activity' above to start!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 mb-2">Tap any activity to view or edit it.</p>
              {recentActivity.map(result => {
                const child = getChild(result.childId);
                const template = getTemplate(result.templateId);
                if (!child || !template) return null;

                const isComplete = result.status !== 'in_progress';

                return (
                  <button 
                    key={result.id} 
                    onClick={() => navigate('record', null, null, result.id)}
                    className="w-full text-left bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start space-x-3 hover:border-indigo-300 transition cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 ${child.color}`}>
                      {child.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-gray-800 truncate pr-2">
                          {child.name} <span className="text-gray-400 font-normal text-sm">did</span> {template.name}
                        </p>
                        {!isComplete && (
                          <span className="shrink-0 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                            <AlertCircle size={10} className="mr-1" />
                            In Progress
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Calendar size={12} className="mr-1" />
                        {formatDateUK(result.date)}
                      </p>
                      {result.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic border-l-2 border-indigo-200 pl-2">
                          "{result.notes}"
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
