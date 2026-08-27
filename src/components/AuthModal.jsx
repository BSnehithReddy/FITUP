import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { soundEffects } from '../services/soundEffects';
import { Eye, EyeOff, Lock, Phone, User, X, ShieldCheck, AlertCircle } from 'lucide-react';

export const AuthModal = ({ setActiveTab }) => {
  const { authModalOpen, authMode, closeAuthModal, setAuthMode, login, register } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    setErrorMessage('');
    
    if (!phone || !password) {
      soundEffects.playError();
      setErrorMessage('Please enter both Phone Number and Password.');
      return;
    }

    setLoading(true);

    try {
      if (authMode === 'register') {
        if (!name) {
          soundEffects.playError();
          setErrorMessage('Please enter your full name.');
          setLoading(false);
          return;
        }
        const res = await register(name, phone, password);
        if (res.role === 'owner') {
          setActiveTab('owner_dash');
        } else if (res.role === 'trainer') {
          setActiveTab('trainer_dash');
        } else {
          setActiveTab('home');
        }
      } else {
        const res = await login(phone, password);
        if (res.role === 'owner') {
          setActiveTab('owner_dash');
        } else if (res.role === 'trainer') {
          setActiveTab('trainer_dash');
        } else {
          setActiveTab('home');
        }
      }
    } catch (err) {
      soundEffects.playError();
      setErrorMessage(err.message || 'Incorrect password or phone number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Top Glow Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-electricBlue via-blue-400 to-vibrantOrange" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-electricBlue/10 border border-electricBlue/30 text-electricBlue mb-3 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white font-outfit">
              {authMode === 'login' ? 'Sign In to FITUP' : 'Create Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Strict authentication with single-session trial PT slot booking
            </p>
          </div>

          {/* Login / Register Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 mb-6">
            <button
              type="button"
              onClick={() => { soundEffects.playClick(); setAuthMode('login'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'login'
                  ? 'bg-slate-800 text-electricBlue shadow-md border border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { soundEffects.playClick(); setAuthMode('register'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'register'
                  ? 'bg-slate-800 text-electricBlue shadow-md border border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register Account
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center space-x-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Snehith Reddy"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electricBlue focus:ring-1 focus:ring-electricBlue transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit Phone Number"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electricBlue focus:ring-1 focus:ring-electricBlue transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electricBlue focus:ring-1 focus:ring-electricBlue transition-all"
                />
                
                {/* Eye Icon Password Toggle */}
                <button
                  type="button"
                  onClick={() => { soundEffects.playClick(); setShowPassword(!showPassword); }}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition-colors"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-electricBlue via-blue-500 to-vibrantOrange hover:from-blue-400 hover:to-electricBlue text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all transform active:scale-95 disabled:opacity-50 mt-2 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying Credentials...</span>
                </span>
              ) : authMode === 'login' ? (
                'Sign In to FITUP'
              ) : (
                'Create FITUP Account'
              )}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};
