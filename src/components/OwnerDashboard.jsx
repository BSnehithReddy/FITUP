import React, { useState, useEffect, useMemo } from 'react';
import { firestoreService } from '../services/firestoreService';
import { soundEffects } from '../services/soundEffects';
import { SafeImage } from './SafeImage';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Users, Wallet, Plus, Trash2, Edit, CheckCircle2, 
  Clock, ArrowUpRight, ShieldCheck, Sparkles, Image as ImageIcon, 
  QrCode, RefreshCw, Lock, Unlock, TrendingUp, BarChart3, 
  DollarSign, Activity, AlertTriangle
} from 'lucide-react';

const PRESET_GYM_IMAGES = [
  { name: "Pro Arena", url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80" },
  { name: "Pulse Club", url: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80" },
  { name: "Heavy Iron", url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80" },
  { name: "CrossFit Zone", url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80" }
];

const PRESET_TRAINER_IMAGES = [
  { name: "Strength Coach", url: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80" },
  { name: "HIIT Specialist", url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=400&q=80" },
  { name: "Mobility Coach", url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80" }
];

const AVAILABLE_SLOT_OPTIONS = [
  "06:00 AM - 08:00 AM",
  "08:00 AM - 10:00 AM",
  "09:00 AM - 11:00 AM",
  "11:00 AM - 01:00 PM",
  "04:00 PM - 06:00 PM",
  "06:00 PM - 08:00 PM",
  "08:00 PM - 10:00 PM"
];

export const OwnerDashboard = () => {
  const { currentUser } = useAuth();
  
  // Super Admin Check (Phone: 9030118909)
  const isSuperAdmin = currentUser?.phone === "9030118909" && currentUser?.role === "owner";

  const [gyms, setGyms] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [ownerConfig, setOwnerConfig] = useState({ ownerUpiId: '', ownerQrCodeUrl: '', razorpayKeyId: '' });
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals State
  const [showGymModal, setShowGymModal] = useState(false);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [editingGym, setEditingGym] = useState(null);
  const [editingTrainer, setEditingTrainer] = useState(null);

  // Form State
  const [gymForm, setGymForm] = useState({
    name: '', location: '', address: '', image: PRESET_GYM_IMAGES[0].url, startingPrice: 280, amenities: ['AC', 'Free Locker']
  });

  const [trainerForm, setTrainerForm] = useState({
    name: '', phone: '', password: 'Trainer@123', gymId: '', price: 280, specialization: 'Hypertrophy & Strength', experience: '5+ Years', image: PRESET_TRAINER_IMAGES[0].url, availableTimings: ["06:00 AM - 08:00 AM", "09:00 AM - 11:00 AM", "04:00 PM - 06:00 PM"]
  });

  const [upiForm, setUpiForm] = useState({
    ownerUpiId: '', ownerQrCodeUrl: '', razorpayKeyId: ''
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Real-Time Subscriptions
  useEffect(() => {
    const unsubGyms = firestoreService.subscribeGyms(setGyms);
    const unsubTrainers = firestoreService.subscribeTrainers(setTrainers);
    const unsubBookings = firestoreService.subscribeBookings(setBookings);
    const unsubPayouts = firestoreService.getPayoutRequestsSync ? () => setPayoutRequests(firestoreService.getPayoutRequestsSync()) : () => {};
    const unsubConfig = firestoreService.subscribeOwnerConfig((cfg) => {
      setOwnerConfig(cfg);
      setUpiForm({ 
        ownerUpiId: cfg.ownerUpiId || '', 
        ownerQrCodeUrl: cfg.ownerQrCodeUrl || '',
        razorpayKeyId: cfg.razorpayKeyId || 'rzp_test_FITUPDemoKey'
      });
    });

    const handleSync = () => {
      setGyms(firestoreService.getGymsSync());
      setTrainers(firestoreService.getTrainersSync());
      setBookings(firestoreService.getBookingsSync());
      setPayoutRequests(firestoreService.getPayoutRequestsSync());
      const cfg = firestoreService.getOwnerConfigSync();
      setOwnerConfig(cfg);
    };

    window.addEventListener('fitup_data_sync', handleSync);
    return () => {
      if (typeof unsubGyms === 'function') unsubGyms();
      if (typeof unsubTrainers === 'function') unsubTrainers();
      if (typeof unsubBookings === 'function') unsubBookings();
      if (typeof unsubConfig === 'function') unsubConfig();
      window.removeEventListener('fitup_data_sync', handleSync);
    };
  }, []);

  const showToast = (msg) => {
    soundEffects.playSuccessChime();
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Master Save & Sync Changes Button Handler
  const handleMasterSaveAndSync = () => {
    soundEffects.playClick();
    setIsSyncing(true);
    
    setTimeout(() => {
      firestoreService.forceMasterSync();
      setIsSyncing(false);
      showToast("Pushed & Synced Live to Firestore & Website!");
    }, 600);
  };

  // GYM CRUD
  const handleOpenGymModal = (gym = null) => {
    soundEffects.playClick();
    if (gym) {
      setEditingGym(gym);
      setGymForm({
        name: gym.name,
        location: gym.location,
        address: gym.address || '',
        image: gym.image || PRESET_GYM_IMAGES[0].url,
        startingPrice: gym.startingPrice || 280,
        amenities: gym.amenities || ['AC']
      });
    } else {
      setEditingGym(null);
      setGymForm({
        name: '', location: '', address: '', image: PRESET_GYM_IMAGES[0].url, startingPrice: 280, amenities: ['AC', 'Free Locker', 'Steam Bath']
      });
    }
    setShowGymModal(true);
  };

  const handleSaveGym = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    if (!gymForm.name || !gymForm.location) {
      alert("Please fill in Gym Name and Location");
      return;
    }

    // Enforce pricing lock check
    if (editingGym && gymForm.startingPrice !== editingGym.startingPrice && !isSuperAdmin) {
      soundEffects.playError();
      alert("Security Lock: Only Super Admin Snehith (9030118909) can modify trial slot fees.");
      return;
    }

    await firestoreService.saveGym({
      ...gymForm,
      gymId: editingGym ? editingGym.gymId : null,
      rating: editingGym ? editingGym.rating : 4.9,
      reviewCount: editingGym ? editingGym.reviewCount : 40,
      ownerUpiId: ownerConfig.ownerUpiId,
      ownerQrCodeUrl: ownerConfig.ownerQrCodeUrl
    }, currentUser);

    setShowGymModal(false);
    showToast(editingGym ? "Gym Updated in Firestore!" : "New Partner Gym Added!");
  };

  const handleDeleteGym = async (gymId) => {
    if (window.confirm("Are you sure you want to remove this partner gym?")) {
      soundEffects.playClick();
      await firestoreService.deleteGym(gymId);
      showToast("Partner Gym Removed");
    }
  };

  // TRAINER CRUD
  const handleOpenTrainerModal = (trainer = null) => {
    soundEffects.playClick();
    const defaultGymId = gyms.length > 0 ? gyms[0].gymId : '';
    if (trainer) {
      setEditingTrainer(trainer);
      setTrainerForm({
        name: trainer.name,
        phone: trainer.phone,
        password: trainer.password || 'Trainer@123',
        gymId: trainer.gymId,
        price: trainer.price || 280,
        specialization: trainer.specialization || 'Strength & Conditioning',
        experience: trainer.experience || '5+ Years',
        image: trainer.image || PRESET_TRAINER_IMAGES[0].url,
        availableTimings: trainer.availableTimings || ["06:00 AM - 08:00 AM", "09:00 AM - 11:00 AM"]
      });
    } else {
      setEditingTrainer(null);
      setTrainerForm({
        name: '',
        phone: '',
        password: 'Trainer@123',
        gymId: defaultGymId,
        price: 280,
        specialization: 'Hypertrophy & Strength',
        experience: '5+ Years CSCS',
        image: PRESET_TRAINER_IMAGES[0].url,
        availableTimings: ["06:00 AM - 08:00 AM", "09:00 AM - 11:00 AM", "04:00 PM - 06:00 PM"]
      });
    }
    setShowTrainerModal(true);
  };

  const handleSaveTrainer = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    if (!trainerForm.name || !trainerForm.phone || !trainerForm.gymId) {
      alert("Please fill in Trainer Name, Phone Number, and assigned Gym");
      return;
    }

    await firestoreService.saveTrainer({
      ...trainerForm,
      trainerId: editingTrainer ? editingTrainer.trainerId : null,
      walletBalance: editingTrainer ? editingTrainer.walletBalance : 0
    });

    setShowTrainerModal(false);
    showToast(editingTrainer ? "Trainer Pro Updated!" : "New Trainer Added!");
  };

  const handleDeleteTrainer = async (trainerId) => {
    if (window.confirm("Are you sure you want to remove this trainer?")) {
      soundEffects.playClick();
      await firestoreService.deleteTrainer(trainerId);
      showToast("Trainer Removed");
    }
  };

  const handleToggleSlotChip = (slot) => {
    soundEffects.playClick();
    const current = trainerForm.availableTimings || [];
    if (current.includes(slot)) {
      setTrainerForm({ ...trainerForm, availableTimings: current.filter(s => s !== slot) });
    } else {
      setTrainerForm({ ...trainerForm, availableTimings: [...current, slot] });
    }
  };

  const handleUpdateUPI = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    await firestoreService.updateOwnerConfig(upiForm);
    showToast("Master Gateway & UPI Details Saved!");
  };

  const handleApprovePayout = async (requestId) => {
    soundEffects.playClick();
    await firestoreService.approvePayout(requestId);
    showToast("Payout Request Approved!");
  };

  // Financial Analytics Calculations
  const grossRevenue = bookings.reduce((sum, b) => b.status === 'VERIFIED' ? sum + (b.amount || 280) : sum, 0);
  const netOwnerShare = grossRevenue * 0.25;
  const trainerSplitShare = grossRevenue * 0.75;

  // Peak Hours Distribution
  const peakStats = useMemo(() => {
    let morning = 0;
    let evening = 0;
    bookings.forEach(b => {
      if (b.slotTime?.includes('AM')) morning++;
      else evening++;
    });
    return { morning, evening, total: bookings.length || 1 };
  }, [bookings]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl font-bold shadow-[0_0_20px_#34d399] flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Owner Console Header */}
      <div className="glass-panel p-6 rounded-3xl border border-electricBlue/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-electricBlue/10 rounded-full blur-3xl pointer-events-none" />

        <div>
          <span className="text-xs font-bold tracking-[0.25em] text-electricBlue uppercase flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-electricBlue" /> Master Admin Console
            {isSuperAdmin ? (
              <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 border border-amber-400/30">
                <Unlock className="w-3 h-3" /> Super Admin (Snehith)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-mono flex items-center gap-1">
                <Lock className="w-3 h-3" /> Standard Staff
              </span>
            )}
          </span>
          <h1 className="text-3xl font-extrabold text-white font-outfit mt-1">
            Platform Operations & Financial Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time Firestore synchronization, Razorpay settlement, and 75/25 trainer splits.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* MASTER SAVE & SYNC BUTTON */}
          <button
            onClick={handleMasterSaveAndSync}
            disabled={isSyncing}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_20px_#34d399] hover:scale-105 transition-all flex items-center gap-2 border border-emerald-300"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Save & Sync Changes to Website'}</span>
          </button>

          <button
            onClick={() => handleOpenGymModal()}
            className="px-4 py-2.5 bg-electricBlue text-slate-950 font-bold rounded-xl text-xs hover:shadow-[0_0_15px_#00f0ff] transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Partner Gym
          </button>

          <button
            onClick={() => handleOpenTrainerModal()}
            className="px-4 py-2.5 bg-vibrantOrange text-slate-950 font-bold rounded-xl text-xs hover:shadow-[0_0_15px_#ff5500] transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Trainer Pro
          </button>
        </div>
      </div>

      {/* Analytics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Platform Gross Revenue</span>
          <div className="text-3xl font-black text-white font-outfit">₹{grossRevenue}</div>
          <span className="text-[10px] text-emerald-400 font-mono">100% Client Bookings</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-electricBlue/30 bg-electricBlue/5 space-y-2">
          <span className="text-xs text-electricBlue font-bold">Owner Net Share (25%)</span>
          <div className="text-3xl font-black text-white font-outfit">₹{netOwnerShare}</div>
          <span className="text-[10px] text-slate-400 font-mono">Platform Facilitation</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-vibrantOrange/30 bg-vibrantOrange/5 space-y-2">
          <span className="text-xs text-vibrantOrange font-bold">Trainers Payout Share (75%)</span>
          <div className="text-3xl font-black text-white font-outfit">₹{trainerSplitShare}</div>
          <span className="text-[10px] text-slate-400 font-mono">Trainer Wallets Credited</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Total Passes Issued</span>
          <div className="text-3xl font-black text-white font-outfit">{bookings.length}</div>
          <span className="text-[10px] text-electricBlue font-mono">Live Firestore Count</span>
        </div>
      </div>

      {/* VISUAL ANALYTICS & PEAK HOURS CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SVG Revenue Trend Line Chart */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Revenue Trend & Booking Momentum</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Live 7-Day Performance</span>
          </div>

          {/* SVG Visual Graph */}
          <div className="h-44 w-full relative flex items-end pt-6">
            <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Area Gradient */}
              <path
                d="M 0 110 Q 80 80, 160 90 T 320 40 T 500 20 L 500 120 L 0 120 Z"
                fill="url(#chartGlow)"
              />
              {/* Glowing Line */}
              <path
                d="M 0 110 Q 80 80, 160 90 T 320 40 T 500 20"
                fill="none"
                stroke="#00f0ff"
                strokeWidth="4"
                className="drop-shadow-[0_0_10px_#00f0ff]"
              />
              {/* Data Points */}
              <circle cx="160" cy="90" r="5" fill="#ff5500" stroke="#fff" strokeWidth="2" />
              <circle cx="320" cy="40" r="5" fill="#34d399" stroke="#fff" strokeWidth="2" />
              <circle cx="500" cy="20" r="6" fill="#00f0ff" stroke="#fff" strokeWidth="2" />
            </svg>
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-mono border-t border-white/5 pt-2">
            <span>Day 1 (₹0)</span>
            <span>Day 3 (₹280)</span>
            <span>Day 5 (₹560)</span>
            <span className="text-electricBlue font-bold">Today (₹{grossRevenue})</span>
          </div>
        </div>

        {/* Peak Workout Hours Distribution */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
              <Activity className="w-5 h-5 text-vibrantOrange" />
              <span>Peak Workout Slot Demand</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Client slot preference distribution</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-white">Morning Sessions (06:00 - 11:00 AM)</span>
                <span className="text-electricBlue font-mono">{Math.round((peakStats.morning / peakStats.total) * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-electricBlue rounded-full shadow-[0_0_10px_#00f0ff]" 
                  style={{ width: `${Math.round((peakStats.morning / peakStats.total) * 100)}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-white">Evening Sessions (04:00 - 08:00 PM)</span>
                <span className="text-vibrantOrange font-mono">{Math.round((peakStats.evening / peakStats.total) * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-vibrantOrange rounded-full shadow-[0_0_10px_#ff5500]" 
                  style={{ width: `${Math.round((peakStats.evening / peakStats.total) * 100)}%` }} 
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 text-[11px] text-slate-400">
            💡 <strong>Insight:</strong> 06-08 AM & 06-08 PM are high-traffic slots for personal trainers.
          </div>
        </div>

      </div>

      {/* GYMS & TRAINERS MANAGEMENT TABS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Partner Gyms Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
              <Building2 className="w-5 h-5 text-electricBlue" />
              <span>Partner Gyms ({gyms.length})</span>
            </h3>

            <button
              onClick={() => handleOpenGymModal()}
              className="text-xs text-electricBlue hover:underline font-semibold"
            >
              + New Gym
            </button>
          </div>

          <div className="space-y-3">
            {gyms.map((g) => (
              <div 
                key={g.gymId}
                className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4 hover:border-electricBlue/40 transition-all"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <SafeImage
                    src={g.image}
                    alt={g.name}
                    fallbackType="gym"
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-bold text-white truncate">{g.name}</h4>
                    <p className="text-xs text-slate-400 truncate">{g.location}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-electricBlue font-bold font-mono">₹{g.startingPrice || 280}/Slot</span>
                      <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" /> {g.rating || 4.9}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenGymModal(g)}
                    className="p-2 text-slate-400 hover:text-electricBlue hover:bg-electricBlue/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteGym(g.gymId)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trainers Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
              <Users className="w-5 h-5 text-vibrantOrange" />
              <span>Trainers ({trainers.length})</span>
            </h3>

            <button
              onClick={() => handleOpenTrainerModal()}
              className="text-xs text-vibrantOrange hover:underline font-semibold"
            >
              + New Trainer
            </button>
          </div>

          <div className="space-y-3">
            {trainers.map((t) => {
              const belongingGym = gyms.find(g => g.gymId === t.gymId);
              return (
                <div 
                  key={t.trainerId}
                  className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4 hover:border-vibrantOrange/40 transition-all"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <SafeImage
                      src={t.image}
                      alt={t.name}
                      fallbackType="trainer"
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-white truncate">{t.name}</h4>
                      <p className="text-xs text-vibrantOrange font-medium truncate">{belongingGym?.name || 'Assigned Gym'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Wallet: ₹{t.walletBalance || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenTrainerModal(t)}
                      className="p-2 text-slate-400 hover:text-vibrantOrange hover:bg-vibrantOrange/10 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteTrainer(t.trainerId)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* MASTER RAZORPAY & UPI GATEWAY CONFIGURATION */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <span>Payment Gateway & Razorpay Settings</span>
        </h3>

        <form onSubmit={handleUpdateUPI} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="text-xs text-slate-300 block mb-1">Razorpay Key ID</label>
            <input
              type="text"
              value={upiForm.razorpayKeyId}
              onChange={(e) => setUpiForm({ ...upiForm, razorpayKeyId: e.target.value })}
              placeholder="e.g. rzp_test_FITUPDemoKey"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400 font-mono"
            />
          </div>

          <div className="md:col-span-4">
            <label className="text-xs text-slate-300 block mb-1">Master Owner UPI ID</label>
            <input
              type="text"
              value={upiForm.ownerUpiId}
              onChange={(e) => setUpiForm({ ...upiForm, ownerUpiId: e.target.value })}
              placeholder="e.g. 9030118909@ybl"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-electricBlue font-mono"
            />
          </div>

          <div className="md:col-span-4">
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:shadow-[0_0_15px_#34d399] transition-all"
            >
              Save Gateway Configuration
            </button>
          </div>
        </form>
      </div>

      {/* 12-HOUR PAYOUT APPROVAL TABLE */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
          <Clock className="w-5 h-5 text-vibrantOrange" />
          <span>Trainer 12-Hour Payout Approval Queue</span>
        </h3>

        {payoutRequests.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No payout requests pending.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-mono uppercase">
                <tr>
                  <th className="p-3 rounded-l-xl">Request ID</th>
                  <th className="p-3">Trainer Name</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payoutRequests.map((req) => (
                  <tr key={req.requestId} className="hover:bg-slate-900/50">
                    <td className="p-3 font-mono font-bold text-electricBlue">{req.requestId}</td>
                    <td className="p-3 font-bold text-white">{req.trainerName}</td>
                    <td className="p-3 font-bold text-vibrantOrange">₹{req.amountRequested}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        req.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {req.status === 'PENDING' ? (
                        <button
                          onClick={() => handleApprovePayout(req.requestId)}
                          className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg text-[11px] hover:shadow-[0_0_10px_#34d399]"
                        >
                          Approve Payout
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500">Transferred</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GYM MODAL WITH SUPER ADMIN PRICE LOCK */}
      {showGymModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full rounded-3xl border border-electricBlue/40 p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-extrabold text-white font-outfit">
                {editingGym ? 'Edit Partner Gym' : 'Add New Partner Gym'}
              </h3>
              <button onClick={() => setShowGymModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveGym} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Gym Name</label>
                <input
                  type="text"
                  value={gymForm.name}
                  onChange={(e) => setGymForm({ ...gymForm, name: e.target.value })}
                  placeholder="e.g. GS fitness studio"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-electricBlue"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Location / Area</label>
                <input
                  type="text"
                  value={gymForm.location}
                  onChange={(e) => setGymForm({ ...gymForm, location: e.target.value })}
                  placeholder="e.g. chengicherla, Hyderabad"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-electricBlue"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Cover Photo URL & 1-Click Presets</label>
                <input
                  type="text"
                  value={gymForm.image}
                  onChange={(e) => setGymForm({ ...gymForm, image: e.target.value })}
                  placeholder="Paste image link or click preset below"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-electricBlue mb-2"
                />

                {/* 1-Click Preset Buttons */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {PRESET_GYM_IMAGES.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setGymForm({ ...gymForm, image: preset.url })}
                      className="px-2.5 py-1 rounded-lg bg-electricBlue/10 border border-electricBlue/30 text-electricBlue font-bold text-[10px] hover:bg-electricBlue hover:text-slate-950 transition-all"
                    >
                      [{preset.name}]
                    </button>
                  ))}
                </div>

                <div className="h-32 w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/10">
                  <SafeImage
                    src={gymForm.image}
                    alt="Gym Preview"
                    fallbackType="gym"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* TRIAL SLOT FEE (WITH SUPER ADMIN LOCK) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold">2-Hour Trial Slot Fee (₹)</label>
                  {isSuperAdmin ? (
                    <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <Unlock className="w-3 h-3" /> Unlocked (Super Admin)
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                      <Lock className="w-3 h-3" /> Locked by Super Admin Snehith
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    disabled={!isSuperAdmin}
                    value={gymForm.startingPrice}
                    onChange={(e) => setGymForm({ ...gymForm, startingPrice: Number(e.target.value) })}
                    className={`w-full border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none font-mono ${
                      isSuperAdmin 
                        ? 'bg-slate-900 border-electricBlue focus:border-electricBlue' 
                        : 'bg-slate-950 border-white/5 cursor-not-allowed opacity-70'
                    }`}
                  />
                  {!isSuperAdmin && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>
                {!isSuperAdmin && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Only Master Admin Snehith (9030118909) has authority to adjust official session rates.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGymModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-electricBlue text-slate-950 font-bold rounded-xl shadow-[0_0_15px_#00f0ff]"
                >
                  Save Partner Gym
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRAINER MODAL */}
      {showTrainerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full rounded-3xl border border-vibrantOrange/40 p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-extrabold text-white font-outfit">
                {editingTrainer ? 'Edit Trainer Pro' : 'Add New Trainer Pro'}
              </h3>
              <button onClick={() => setShowTrainerModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveTrainer} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Trainer Full Name</label>
                <input
                  type="text"
                  value={trainerForm.name}
                  onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-vibrantOrange"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Assigned Partner Gym</label>
                <select
                  value={trainerForm.gymId}
                  onChange={(e) => setTrainerForm({ ...trainerForm, gymId: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-vibrantOrange"
                >
                  {gyms.map(g => (
                    <option key={g.gymId} value={g.gymId}>{g.name} ({g.location})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Phone Number (For Trainer Login)</label>
                <input
                  type="text"
                  value={trainerForm.phone}
                  onChange={(e) => setTrainerForm({ ...trainerForm, phone: e.target.value })}
                  placeholder="e.g. 9030118909"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-vibrantOrange"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Photo URL & 1-Click Presets</label>
                <input
                  type="text"
                  value={trainerForm.image}
                  onChange={(e) => setTrainerForm({ ...trainerForm, image: e.target.value })}
                  placeholder="Paste photo link or click preset below"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-vibrantOrange mb-2"
                />

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {PRESET_TRAINER_IMAGES.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setTrainerForm({ ...trainerForm, image: preset.url })}
                      className="px-2.5 py-1 rounded-lg bg-vibrantOrange/10 border border-vibrantOrange/30 text-vibrantOrange font-bold text-[10px] hover:bg-vibrantOrange hover:text-slate-950 transition-all"
                    >
                      [{preset.name}]
                    </button>
                  ))}
                </div>

                <div className="h-28 w-28 mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-white/10">
                  <SafeImage
                    src={trainerForm.image}
                    alt="Trainer Preview"
                    fallbackType="trainer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1.5">Clickable Working Slot Chips</label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_SLOT_OPTIONS.map((slot, i) => {
                    const isSelected = (trainerForm.availableTimings || []).includes(slot);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleToggleSlotChip(slot)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                          isSelected 
                            ? 'bg-vibrantOrange text-slate-950 shadow-[0_0_10px_#ff5500]'
                            : 'bg-slate-900 text-slate-400 border border-white/5'
                        }`}
                      >
                        {slot} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTrainerModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-vibrantOrange text-slate-950 font-bold rounded-xl shadow-[0_0_15px_#ff5500]"
                >
                  Save Trainer Pro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
