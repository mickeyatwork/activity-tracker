import React, { useState } from 'react';
import { User, Lock, LogOut, CheckCircle2, AlertCircle, Loader2, Trophy, ChevronRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TopHeader } from '../common/TopHeader';
import { ConfirmModal } from '../common/ConfirmModal';

export function SettingsView() {
  const { user, userProfile, isAdmin, signOut, updateUserProfile, navigate } = useApp();

  const [username, setUsername] = useState(user?.user_metadata?.username || userProfile?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    setSavingProfile(true);

    try {
      await updateUserProfile({
        username: username.trim(),
        email: email.trim() !== user?.email ? email.trim() : undefined
      });
      setFeedback({
        type: 'success',
        message: 'Profile updated successfully!' + (email.trim() !== user?.email ? ' Check your new email inbox to confirm the change.' : '')
      });
    } catch (err) {
      console.error('Update profile error:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (password.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (password !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setSavingPassword(true);
    try {
      await updateUserProfile({ password });
      setPassword('');
      setConfirmPassword('');
      setFeedback({ type: 'success', message: 'Password updated successfully!' });
    } catch (err) {
      console.error('Update password error:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to update password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleConfirmSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
      setSigningOut(false);
      setShowSignOutModal(false);
    }
  };

  const displayName = user?.user_metadata?.username || userProfile?.username || user?.email?.split('@')[0] || 'User';

  return (
    <div className="pb-12 animate-in slide-in-from-right-4 duration-300">
      <TopHeader 
        title="Settings" 
        showBack 
        onBack={() => navigate('dashboard')} 
      />

      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* User Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-inner shrink-0">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-gray-800 text-lg truncate">{displayName}</h2>
            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            <div className="mt-1.5 flex items-center space-x-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center">
                <CheckCircle2 size={11} className="mr-1" />
                Signed In
              </span>
              {isAdmin && (
                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                  <ShieldCheck size={11} className="mr-1" />
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback.message && (
          <div className={`p-3.5 rounded-xl text-sm flex items-start space-x-2.5 border ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600" />
            ) : (
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
            )}
            <p className="flex-1">{feedback.message}</p>
          </div>
        )}

        {/* App Management Section */}
        <div className="space-y-3">
          {/* Admin Portal (Only visible to admin) */}
          {isAdmin && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-1 shadow-xs overflow-hidden">
              <button 
                type="button"
                onClick={() => navigate('admin')}
                className="w-full p-4 flex items-center justify-between hover:bg-white/60 transition cursor-pointer text-left"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-gray-900 text-sm">Admin Portal</h3>
                      <span className="bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-sm uppercase tracking-wide">Admin</span>
                    </div>
                    <p className="text-xs text-purple-700 truncate">Manage users, view directory & activate accounts</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-purple-400 shrink-0 ml-2" />
              </button>
            </div>
          )}

          {/* Event Templates Navigation */}
          <div className="bg-white border border-gray-200 rounded-2xl p-1 shadow-xs overflow-hidden">
            <button 
              type="button"
              onClick={() => navigate('templates')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer text-left"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                  <Trophy size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm">Event Templates</h3>
                  <p className="text-xs text-gray-500 truncate">Configure sports, events & tracked metrics</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 shrink-0 ml-2" />
            </button>
          </div>
        </div>

        {/* Section 1: Profile Information */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center">
            <User size={18} className="mr-2 text-indigo-500" />
            Profile Details
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Username / Name</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <button 
              type="submit"
              disabled={savingProfile}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-xs flex items-center justify-center disabled:opacity-50 cursor-pointer"
            >
              {savingProfile ? <Loader2 size={18} className="animate-spin" /> : "Save Profile Details"}
            </button>
          </form>
        </div>

        {/* Section 2: Password Management */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center">
            <Lock size={18} className="mr-2 text-indigo-500" />
            Change Password
          </h3>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <button 
              type="submit"
              disabled={savingPassword || !password}
              className="w-full bg-gray-800 hover:bg-black text-white font-bold py-3 rounded-xl text-sm transition shadow-xs flex items-center justify-center disabled:opacity-50 cursor-pointer"
            >
              {savingPassword ? <Loader2 size={18} className="animate-spin" /> : "Update Password"}
            </button>
          </form>
        </div>

        {/* Section 3: Sign Out */}
        <div className="pt-2">
          <button 
            type="button"
            onClick={() => setShowSignOutModal(true)}
            className="w-full bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 font-bold py-3.5 rounded-xl text-sm transition flex items-center justify-center cursor-pointer shadow-xs"
          >
            <LogOut size={18} className="mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Custom Confirmation Dialog for Sign Out */}
      <ConfirmModal 
        isOpen={showSignOutModal}
        loading={signingOut}
        title="Sign Out of Activity Tracker?"
        message="Are you sure you want to sign out? You will need to sign back in with your email and password to access your tracker."
        confirmText="Sign Out"
        cancelText="Stay Signed In"
        confirmVariant="danger"
        onConfirm={handleConfirmSignOut}
        onCancel={() => setShowSignOutModal(false)}
      />
    </div>
  );
}
