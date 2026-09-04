import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { soundEffects } from '../services/soundEffects';
import { Eye, EyeOff, Lock, Phone, User, X, ShieldCheck, AlertCircle } from 'lucide-react';

export const AuthModal = ({ setActiveTab, onOpenLegal }) => {
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
        } else if (res.role === 'gym_owner') {
          setActiveTab('gym_owner_dash');
        } else if (res.role === 'trainer') {
          setActiveTab('trainer_dash');
        } else {
          setActiveTab('home');
        }
      } else {
        const res = await login(phone, password);
        if (res.role === 'owner') {
          setActiveTab('owner_dash');
        } else if (res.role === 'gym_owner') {
          setActiveTab('gym_owner_dash');
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
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Glow Effects Header */}
        <div className="h-2 bg-gradient-to-r from-electricBlue via-blue-500 to-vibrantOrange" />
        
        {/* Close Button */}
        <button
          onClick={() => { soundEffects.playClick(); closeAuthModal(); }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          
          {/* Modal Branding */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-electricBlue/10 border border-electricBlue/30 text-electricBlue mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white font-outfit">
              {authMode === 'login' ? 'Welcome to FITUP' : 'Create an Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {authMode === 'login' 
                ? 'Sign in to access your workout passes and gym dashboard' 
                : 'Book single-session gym trials with zero subscriptions'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-white/5">
            <button
              type="button"
              onClick={() => { soundEffects.playClick(); setAuthMode('login'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'login'
                  ? 'bg-electricBlue text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
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
                  ? 'bg-electricBlue text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
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
                    placeholder="e.g. Karthik Reddy"
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
                  placeholder="e.g. 9030118909"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electricBlue focus:ring-1 focus:ring-electricBlue transition-all"
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

            {/* Legal Consent Disclaimer */}
            <p className="text-[10px] text-slate-500 text-center leading-relaxed pt-2">
              By proceeding, you agree to FITUP's{' '}
              <button
                type="button"
                onClick={() => onOpenLegal && onOpenLegal('terms')}
                className="text-slate-400 hover:text-electricBlue underline"
              >
                Terms & Conditions
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => onOpenLegal && onOpenLegal('privacy')}
                className="text-slate-400 hover:text-electricBlue underline"
              >
                Privacy Policy
              </button>.
            </p>

          </form>

        </div>
      </div>
    </div>
  );
};
