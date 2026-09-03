import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IntroSplash } from './components/IntroSplash';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { ClientDashboard } from './components/ClientDashboard';
import { TrainerDashboard } from './components/TrainerDashboard';
import { OwnerDashboard } from './components/OwnerDashboard';
import { GymOwnerDashboard } from './components/GymOwnerDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';

const MainContent = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem("fitup_user_session");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u?.phone === '9030118909' && u?.role === 'owner') return 'owner_dash';
        if (u?.role === 'gym_owner') return 'gym_owner_dash';
        if (u?.role === 'trainer') return 'trainer_dash';
      } catch (e) {}
    }
    return 'home';
  });

  // Keep active tab in sync if user changes role or logs out
  useEffect(() => {
    if (activeTab === 'owner_dash' && (currentUser?.phone !== '9030118909' || currentUser?.role !== 'owner')) {
      setActiveTab('home');
    }
    if (activeTab === 'gym_owner_dash' && currentUser?.role !== 'gym_owner') {
      setActiveTab('home');
    }
  }, [currentUser, activeTab]);

  return (
    <div className="min-h-screen bg-[#070b19] text-gray-100 flex flex-col selection:bg-electricBlue/30 selection:text-electricBlue safe-area-bottom">
      
      {/* Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Router with Protective Error Boundary */}
      <main className="flex-1 pb-16">
        <ErrorBoundary>
          {(activeTab === 'home' || activeTab === 'my_bookings') && (
            <ClientDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
          )}

          {activeTab === 'trainer_dash' && (
            <TrainerDashboard />
          )}

          {activeTab === 'gym_owner_dash' && (
            <GymOwnerDashboard />
          )}

          {activeTab === 'owner_dash' && (
            <OwnerDashboard setActiveTab={setActiveTab} />
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 glass-panel py-8 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center space-x-2 font-outfit font-bold text-slate-300">
          <span>FIT<span className="text-electricBlue">UP</span></span>
          <span>•</span>
          <span className="text-vibrantOrange">BOOK. LIFT. REPEAT.</span>
        </div>
        <p>© {new Date().getFullYear()} FITUP Fitness Technologies. All rights reserved.</p>
      </footer>

      {/* Authentication Modal */}
      <AuthModal setActiveTab={setActiveTab} />

    </div>
  );
};

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <ErrorBoundary>
      <AuthProvider>
        {showIntro ? (
          <IntroSplash onFinish={() => setShowIntro(false)} />
        ) : (
          <MainContent />
        )}
      </AuthProvider>
    </ErrorBoundary>
  );
}
