import React, { useState } from 'react';
import { Mail, Lock, User, AlertCircle, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TopHeader } from '../common/TopHeader';

export function AuthView() {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
      } else {
        const result = await signUp(email.trim(), password, username.trim());
        if (result && !result.session) {
          setSuccessMsg('Account registered! Please check your email to verify your account, or sign in.');
          setMode('signin');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 animate-in fade-in duration-300">
      <TopHeader 
        title={mode === 'signin' ? "Sign In" : "Create Account"} 
      />

      <div className="p-4 max-w-md mx-auto space-y-6 pt-6">
        {/* Toggle Switch */}
        <div className="flex bg-gray-200 p-1 rounded-xl">
          <button 
            type="button"
            onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signin' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signup' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-sm flex items-start space-x-2.5">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
            <p className="flex-1">{errorMsg}</p>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-sm flex items-start space-x-2.5">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600" />
            <p className="flex-1">{successMsg}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name / Username</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-md flex items-center justify-center disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? "Sign In" : "Register Account"}</span>
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
