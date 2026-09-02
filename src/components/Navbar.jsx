import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogoImage } from './Logo';
import { Dumbbell, Shield, User, LogOut, Ticket, LayoutDashboard, Search, Sparkles } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { currentUser, openAuthModal, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-slate-900 border border-electricBlue/30 shadow-[0_0_15px_rgba(0,240,255,0.2)] group-hover:border-electricBlue transition-all overflow-hidden p-1">
            <LogoImage className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-wider text-white font-outfit">
              FIT<span className="text-electricBlue drop-shadow-[0_0_10px_#00f0ff]">UP</span>
            </span>
            <span className="block text-[10px] tracking-[0.25em] text-vibrantOrange font-bold uppercase">
              BOOK. LIFT. REPEAT.
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'home' 
                ? 'bg-electricBlue/10 text-electricBlue border border-electricBlue/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Explore Gyms</span>
          </button>

          <button
            onClick={() => setActiveTab('my_bookings')}
            className={`flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'my_bookings' 
                ? 'bg-electricBlue/10 text-electricBlue border border-electricBlue/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Ticket className="w-4 h-4 text-emerald-400" />
            <span>My Passes</span>
          </button>

          {currentUser?.role === 'trainer' && (
            <button
              onClick={() => setActiveTab('trainer_dash')}
              className={`flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'trainer_dash' 
                  ? 'bg-vibrantOrange/10 text-vibrantOrange border border-vibrantOrange/40 shadow-[0_0_10px_rgba(255,85,0,0.2)]' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-vibrantOrange" />
              <span className="hidden md:inline">Trainer Portal</span>
              <span className="md:hidden">Portal</span>
            </button>
          )}

          {currentUser?.role === 'owner' && (
            <button
              onClick={() => setActiveTab('owner_dash')}
              className={`flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'owner_dash' 
                  ? 'bg-electricBlue/10 text-electricBlue border border-electricBlue/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Shield className="w-4 h-4 text-electricBlue" />
              <span className="hidden md:inline">Owner Console</span>
              <span className="md:hidden">Console</span>
            </button>
          )}
        </nav>

        {/* User Auth Bar */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {currentUser ? (
            <div className="flex items-center space-x-2 sm:space-x-3 bg-slate-900/80 border border-white/10 px-2.5 sm:px-3 py-1.5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-electricBlue to-vibrantOrange flex items-center justify-center font-bold text-slate-950 text-sm shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>

              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-white leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider">
                  {currentUser.role === 'owner' && (
                    <span className="text-electricBlue">Master Admin</span>
                  )}
                  {currentUser.role === 'trainer' && (
                    <span className="text-vibrantOrange">Trainer Pro</span>
                  )}
                  {currentUser.role === 'client' && (
                    <span className="text-slate-400">FITUP Member</span>
                  )}
                </div>
              </div>

              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-vibrantOrange hover:bg-vibrantOrange/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-electricBlue transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-electricBlue to-blue-400 hover:from-blue-400 hover:to-electricBlue rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
