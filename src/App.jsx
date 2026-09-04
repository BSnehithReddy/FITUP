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
import { LegalModal } from './components/LegalModal';
import { DeleteAccountModal } from './components/DeleteAccountModal';
import { crashlyticsService } from './services/crashlyticsService';
import { ShieldCheck, FileText, RefreshCw, Trash2, Bug } from 'lucide-react';

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

  // State for Legal & Compliance Modal
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalInitialTab, setLegalInitialTab] = useState('privacy');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Initialize Crashlytics on client load
  useEffect(() => {
    crashlyticsService.init();
  }, []);

  // Update Crashlytics user context whenever auth state changes
  useEffect(() => {
    crashlyticsService.setUser(currentUser);
  }, [currentUser]);

  // Keep active tab in sync if user changes role or logs out
  useEffect(() => {
    if (activeTab === 'owner_dash' && (currentUser?.phone !== '9030118909' || currentUser?.role !== 'owner')) {
      setActiveTab('home');
    }
    if (activeTab === 'gym_owner_dash' && currentUser?.role !== 'gym_owner') {
      setActiveTab('home');
    }
  }, [currentUser, activeTab]);

  const openLegal = (tab) => {
    setLegalInitialTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-gray-100 flex flex-col selection:bg-electricBlue/30 selection:text-electricBlue safe-area-bottom">
      
      {/* Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Router with Protective Error Boundary */}
      <main className="flex-1 pb-16">
        <ErrorBoundary>
          {(activeTab === 'home' || activeTab === 'my_bookings') && (
            <ClientDashboard activeTab={activeTab} setActiveTab={setActiveTab} onOpenLegal={openLegal} />
          )}

          {activeTab === 'trainer_dash' && (
            <TrainerDashboard onOpenLegal={openLegal} />
          )}

          {activeTab === 'gym_owner_dash' && (
            <GymOwnerDashboard onOpenLegal={openLegal} />
          )}

          {activeTab === 'owner_dash' && (
            <OwnerDashboard setActiveTab={setActiveTab} onOpenLegal={openLegal} />
          )}
        </ErrorBoundary>
      </main>

      {/* Google Play Compliant Legal Footer */}
      <footer className="border-t border-white/10 glass-panel py-8 px-4 text-center text-xs text-slate-500 space-y-4">
        <div className="flex items-center justify-center space-x-2 font-outfit font-bold text-slate-300">
          <span>FIT<span className="text-electricBlue">UP</span></span>
          <span>•</span>
          <span className="text-vibrantOrange">BOOK. LIFT. REPEAT.</span>
        </div>

        {/* Legal and Compliance Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-slate-400 font-medium">
          <button 
            onClick={() => openLegal('privacy')} 
            className="hover:text-electricBlue transition-colors flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Privacy Policy
          </button>

          <button 
            onClick={() => openLegal('terms')} 
            className="hover:text-electricBlue transition-colors flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" /> Terms & Conditions
          </button>

          <button 
            onClick={() => openLegal('refund')} 
            className="hover:text-electricBlue transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Cancellation & Refunds
          </button>

          <button 
            onClick={() => setDeleteModalOpen(true)} 
            className="hover:text-rose-400 transition-colors flex items-center gap-1 text-slate-400"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Account
          </button>
        </div>

        <p className="text-[11px] text-slate-600">
          © {new Date().getFullYear()} FITUP Fitness Technologies Private Limited. All rights reserved. • Google Play Store Verified
        </p>
      </footer>

      {/* Authentication Modal */}
      <AuthModal setActiveTab={setActiveTab} onOpenLegal={openLegal} />

      {/* Legal & Compliance Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalInitialTab}
        onOpenDeleteAccount={() => setDeleteModalOpen(true)}
      />

      {/* Global Delete Account Modal */}
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />

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
