import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, CheckCircle2, XCircle, Loader2, UserCheck, UserX } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TopHeader } from '../common/TopHeader';
import { ConfirmModal } from '../common/ConfirmModal';
import { adminService } from '../../services/adminService';
import { formatDateUK } from '../../utils/date';

export function AdminView() {
  const { user, navigate } = useApp();

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Modal State
  const [modalState, setModalState] = useState({
    isOpen: false,
    profile: null,
    targetStatus: false,
    loading: false
  });

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('Failed to load profiles:', err);
      setFeedback({ type: 'error', message: 'Failed to load users: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const openToggleModal = (profile) => {
    const nextStatus = !profile.is_active;
    setModalState({
      isOpen: true,
      profile,
      targetStatus: nextStatus,
      loading: false
    });
  };

  const handleConfirmToggle = async () => {
    const { profile, targetStatus } = modalState;
    if (!profile) return;

    setModalState(prev => ({ ...prev, loading: true }));
    try {
      await adminService.setUserActive(profile.id, targetStatus);
      setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, is_active: targetStatus } : p));
      setFeedback({
        type: 'success',
        message: `User ${profile.email} has been ${targetStatus ? 'activated' : 'deactivated'}.`
      });
      setModalState({ isOpen: false, profile: null, targetStatus: false, loading: false });
    } catch (err) {
      console.error('Error toggling user status:', err);
      setFeedback({ type: 'error', message: 'Failed to update user: ' + err.message });
      setModalState(prev => ({ ...prev, loading: false }));
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const q = searchQuery.toLowerCase();
    const nameMatch = (p.username || '').toLowerCase().includes(q);
    const emailMatch = (p.email || '').toLowerCase().includes(q);
    return nameMatch || emailMatch;
  });

  const totalUsers = profiles.length;
  const activeCount = profiles.filter(p => p.is_active).length;
  const inactiveCount = totalUsers - activeCount;

  return (
    <div className="pb-12 animate-in slide-in-from-right-4 duration-300">
      <TopHeader 
        title="Admin Portal" 
        showBack 
        onBack={() => navigate('settings')} 
      />

      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Admin Header Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-white/10 p-2.5 rounded-xl">
              <ShieldCheck size={24} className="text-indigo-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">User Management</h2>
              <p className="text-xs text-indigo-200">Manage user registrations and active access</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-indigo-700/50">
            <div className="bg-white/5 rounded-xl p-2">
              <span className="text-xl font-bold">{totalUsers}</span>
              <p className="text-[10px] text-indigo-200 uppercase font-medium mt-0.5">Total</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2">
              <span className="text-xl font-bold text-emerald-300">{activeCount}</span>
              <p className="text-[10px] text-indigo-200 uppercase font-medium mt-0.5">Active</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2">
              <span className="text-xl font-bold text-rose-300">{inactiveCount}</span>
              <p className="text-[10px] text-indigo-200 uppercase font-medium mt-0.5">Inactive</p>
            </div>
          </div>
        </div>

        {/* Feedback message */}
        {feedback.message && (
          <div className={`p-3.5 rounded-xl text-sm border flex items-center justify-between ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback({ type: '', message: '' })} className="font-bold ml-2 text-xs">✕</button>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none shadow-xs"
          />
        </div>

        {/* Users List */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 px-1">
            Registered Users ({filteredProfiles.length})
          </h3>

          {loading ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 flex flex-col items-center justify-center text-gray-400">
              <Loader2 size={32} className="animate-spin text-indigo-600 mb-2" />
              <p className="text-sm">Loading user directory...</p>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500">
              <p className="text-sm">No users match your search.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProfiles.map(p => {
                const isCurrentUser = p.id === user?.id;
                const isAdmin = p.role === 'admin';
                const displayName = p.username || p.email?.split('@')[0] || 'User';

                return (
                  <div 
                    key={p.id}
                    className={`bg-white border rounded-2xl p-4 shadow-xs transition ${
                      !p.is_active ? 'border-rose-200 bg-rose-50/20' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between space-x-3">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 ${
                          isAdmin ? 'bg-purple-600' : 'bg-indigo-600'
                        }`}>
                          {displayName.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-gray-900 text-sm truncate">{displayName}</h4>
                            {isCurrentUser && (
                              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.2 rounded-sm shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{p.email}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Joined {formatDateUK(p.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Status & Role Badges */}
                      <div className="flex flex-col items-end space-y-1.5 shrink-0">
                        {isAdmin ? (
                          <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Admin
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            User
                          </span>
                        )}

                        {p.is_active ? (
                          <span className="text-emerald-700 text-[11px] font-medium flex items-center">
                            <CheckCircle2 size={12} className="mr-1 text-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="text-rose-700 text-[11px] font-medium flex items-center">
                            <XCircle size={12} className="mr-1 text-rose-500" />
                            Deactivated
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">Account status</span>
                      {isCurrentUser ? (
                        <span className="text-xs text-gray-400 italic">Cannot modify own account</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openToggleModal(p)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center ${
                            p.is_active 
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200' 
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {p.is_active ? (
                            <>
                              <UserX size={14} className="mr-1.5" />
                              Deactivate User
                            </>
                          ) : (
                            <>
                              <UserCheck size={14} className="mr-1.5" />
                              Activate User
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        loading={modalState.loading}
        title={modalState.targetStatus ? "Activate Account?" : "Deactivate Account?"}
        message={
          modalState.targetStatus
            ? `Are you sure you want to reactivate access for ${modalState.profile?.email}? They will regain full access to their tracker.`
            : `Are you sure you want to deactivate ${modalState.profile?.email}? They will be blocked from accessing the app until reactivated.`
        }
        confirmText={modalState.targetStatus ? "Activate User" : "Deactivate User"}
        cancelText="Cancel"
        confirmVariant={modalState.targetStatus ? "primary" : "danger"}
        onConfirm={handleConfirmToggle}
        onCancel={() => setModalState({ isOpen: false, profile: null, targetStatus: false, loading: false })}
      />
    </div>
  );
}
