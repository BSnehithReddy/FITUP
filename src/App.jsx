import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IntroSplash } from './components/IntroSplash';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { ClientDashboard } from './components/ClientDashboard';
import { TrainerDashboard } from './components/TrainerDashboard';
import { OwnerDashboard } from './components/OwnerDashboard';

const MainContent = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('home'); // "home" | "my_bookings" | "trainer_dash" | "owner_dash"

  return (
    <div className="min-h-screen bg-[#070b19] text-gray-100 flex flex-col selection:bg-electricBlue/30 selection:text-electricBlue">
      
      {/* Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {(activeTab === 'home' || activeTab === 'my_bookings') && (
          <ClientDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'trainer_dash' && (
          <TrainerDashboard />
        )}

        {activeTab === 'owner_dash' && (
          <OwnerDashboard />
        )}
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
    <AuthProvider>
      {showIntro ? (
        <IntroSplash onFinish={() => setShowIntro(false)} />
      ) : (
        <MainContent />
      )}
    </AuthProvider>
  );
}
