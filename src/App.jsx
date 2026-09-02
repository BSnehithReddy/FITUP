import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IntroSplash } from './components/IntroSplash';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { ClientDashboard } from './components/ClientDashboard';
import { TrainerDashboard } from './components/TrainerDashboard';
import { OwnerDashboard } from './components/OwnerDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';

const MainContent = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    // If logged in as owner, default to owner_dash, trainer to trainer_dash, else home
    const saved = localStorage.getItem("fitup_user_session");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u?.role === 'owner') return 'owner_dash';
        if (u?.role === 'trainer') return 'trainer_dash';
      } catch (e) {}
    }
    return 'home';
  });

  // Keep active tab in sync if user changes role
  useEffect(() => {
    if (currentUser?.role === 'owner' && activeTab !== 'owner_dash' && activeTab !== 'home' && activeTab !== 'my_bookings') {
      setActiveTab('owner_dash');
    } else if (currentUser?.role === 'trainer' && activeTab !== 'trainer_dash' && activeTab !== 'home' && activeTab !== 'my_bookings') {
      setActiveTab('trainer_dash');
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-[#070b19] text-gray-100 flex flex-col selection:bg-electricBlue/30 selection:text-electricBlue">
      
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

          {activeTab === 'owner_dash' && (
            <OwnerDashboard />
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
