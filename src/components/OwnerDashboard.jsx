import React, { useState, useEffect, useMemo } from 'react';
import { firestoreService } from '../services/firestoreService';
import { soundEffects } from '../services/soundEffects';
import { SafeImage } from './SafeImage';
import { useAuth } from '../context/AuthContext';
import { DeleteAccountModal } from './DeleteAccountModal';
import { 
  Building2, Users, Wallet, Plus, Trash2, Edit, CheckCircle2, 
  Clock, ArrowUpRight, ShieldCheck, Sparkles, Image as ImageIcon, 
  QrCode, RefreshCw, Lock, Unlock, TrendingUp, BarChart3, 
  DollarSign, Activity, AlertTriangle, ShieldAlert, Star,
  ShieldX, ArrowLeft, Percent, Database, Cloud, Tag, Gift, BadgeCheck
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

export const OwnerDashboard = ({ setActiveTab }) => {
  const { currentUser, registerGymOwnerAuth } = useAuth();
  
  // Strict Master Admin Check (Phone: 9030118909 & role: owner)
  const isMasterAdmin = currentUser?.phone === "9030118909" && currentUser?.role === "owner";

  // ROUTE GUARD PROTECTION
  if (!isMasterAdmin) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="glass-panel max-w-md w-full rounded-3xl border border-rose-500/40 p-8 text-center space-y-6 shadow-2xl bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(244,63,94,0.3)]">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white font-outfit">
              Access Restricted
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              The Master Owner Console is strictly restricted to Master Admin Snehith (<span className="text-electricBlue font-mono">9030118909</span>).
            </p>
          </div>

          <button
            onClick={() => setActiveTab && setActiveTab('home')}
            className="w-full py-3 bg-gradient-to-r from-electricBlue to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_15px_#00f0ff] hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Explore Gyms
          </button>
        </div>
      </div>
    );
  }

  const [isLoading, setIsLoading] = useState(true);
  const [gyms, setGyms] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [ownerConfig, setOwnerConfig] = useState({ 
    ownerUpiId: '9030118909@ybl', 
    ownerQrCodeUrl: '', 
    razorpayKeyId: localStorage.getItem('fitup_razorpay_key') || 'rzp_test_TYwrtzZ7ROjR5s',
    defaultPlatformSplit: 20,
    defaultGymSplit: 30,
    defaultTrainerSplit: 50
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState(null);

  // Modals State
  const [showGymModal, setShowGymModal] = useState(false);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingGym, setEditingGym] = useState(null);
  const [editingTrainer, setEditingTrainer] = useState(null);

  // Form State
  const [gymForm, setGymForm] = useState({
    name: '', 
    location: '', 
    address: '', 
    image: PRESET_GYM_IMAGES[0].url, 
    startingPrice: 280, 
    amenities: ['AC', 'Free Locker'],
    ownerName: 'Vinay',
    ownerPhone: '9123456780',
    ownerEmail: 'vinay@gsfitness.com',
    ownerPassword: 'Owner@123',
    gymSplitPercent: 30
  });

  const [trainerForm, setTrainerForm] = useState({
    name: '', 
    phone: '', 
    password: 'Trainer@123', 
    gymId: '', 
    price: 280, 
    trainerSplitPercent: 50,
    specialization: 'Hypertrophy & Strength', 
    experience: '5+ Years', 
    image: PRESET_TRAINER_IMAGES[0].url, 
    availableTimings: ["06:00 AM - 08:00 AM", "09:00 AM - 11:00 AM", "04:00 PM - 06:00 PM"]
  });

  const [upiForm, setUpiForm] = useState({
    ownerUpiId: localStorage.getItem('fitup_owner_upi') || '9030118909@ybl',
    ownerQrCodeUrl: '',
    razorpayKeyId: localStorage.getItem('fitup_razorpay_key') || 'rzp_test_TYwrtzZ7ROjR5s'
  });

  const [coupons, setCoupons] = useState(firestoreService.getCouponsSync());
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'PERCENT',
    discountValue: 50,
    description: ''
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Initialize Data & Setup Subscriptions
  useEffect(() => {
    let isMounted = true;

    try {
      const g = firestoreService.getGymsSync();
      if (Array.isArray(g)) setGyms(g);

      const t = firestoreService.getTrainersSync();
      if (Array.isArray(t)) setTrainers(t);

      const b = firestoreService.getBookingsSync();
      if (Array.isArray(b)) setBookings(b);

      const p = firestoreService.getPayoutRequestsSync();
      if (Array.isArray(p)) setPayoutRequests(p);

      const c = firestoreService.getOwnerConfigSync();
      if (c) {
        setOwnerConfig(c);
        setUpiForm({
          ownerUpiId: c.ownerUpiId || localStorage.getItem('fitup_owner_upi') || '9030118909@ybl',
          ownerQrCodeUrl: c.ownerQrCodeUrl || '',
          razorpayKeyId: c.razorpayKeyId || localStorage.getItem('fitup_razorpay_key') || 'rzp_test_TYwrtzZ7ROjR5s'
        });
      }
    } catch (e) {
      console.warn("Initial load catch:", e);
    } finally {
      if (isMounted) setIsLoading(false);
    }

    const unsubGyms = firestoreService.subscribeGyms((data) => {
      if (isMounted && Array.isArray(data)) setGyms(data);
    });

    const unsubTrainers = firestoreService.subscribeTrainers((data) => {
      if (isMounted && Array.isArray(data)) setTrainers(data);
    });

    const unsubBookings = firestoreService.subscribeBookings((data) => {
      if (isMounted && Array.isArray(data)) setBookings(data);
    });

    const unsubConfig = firestoreService.subscribeOwnerConfig((cfg) => {
      if (isMounted && cfg) {
        setOwnerConfig(cfg);
        setUpiForm({ 
          ownerUpiId: cfg.ownerUpiId || localStorage.getItem('fitup_owner_upi') || '9030118909@ybl', 
          ownerQrCodeUrl: cfg.ownerQrCodeUrl || '',
          razorpayKeyId: cfg.razorpayKeyId || localStorage.getItem('fitup_razorpay_key') || 'rzp_test_TYwrtzZ7ROjR5s'
        });
      }
    });

    const unsubPayouts = firestoreService.subscribePayoutRequests ? firestoreService.subscribePayoutRequests((data) => {
      if (isMounted && Array.isArray(data)) setPayoutRequests(data);
    }) : () => {};

    const handleSync = () => {
      if (!isMounted) return;
      try {
        setGyms(firestoreService.getGymsSync() || []);
        setTrainers(firestoreService.getTrainersSync() || []);
        setBookings(firestoreService.getBookingsSync() || []);
        setPayoutRequests(firestoreService.getPayoutRequestsSync() || []);
        const freshConfig = firestoreService.getOwnerConfigSync();
        if (freshConfig) setOwnerConfig(freshConfig);
      } catch (e) {}
    };

    window.addEventListener('fitup_data_sync', handleSync);
    return () => {
      isMounted = false;
      if (typeof unsubGyms === 'function') unsubGyms();
      if (typeof unsubTrainers === 'function') unsubTrainers();
      if (typeof unsubBookings === 'function') unsubBookings();
      if (typeof unsubConfig === 'function') unsubConfig();
      if (typeof unsubPayouts === 'function') unsubPayouts();
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
        name: gym?.name || '',
        location: gym?.location || '',
        address: gym?.address || '',
        image: gym?.image || PRESET_GYM_IMAGES[0].url,
        startingPrice: gym?.startingPrice || 280,
        amenities: gym?.amenities || ['AC', 'Free Locker'],
        ownerName: gym?.ownerName || 'Vinay',
        ownerPhone: gym?.ownerPhone || '9123456780',
        ownerEmail: gym?.ownerEmail || 'vinay@gsfitness.com',
        ownerPassword: gym?.ownerPassword || 'Owner@123',
        gymSplitPercent: gym?.gymSplitPercent !== undefined ? gym.gymSplitPercent : 30
      });
    } else {
      setEditingGym(null);
      setGymForm({
        name: '', 
        location: '', 
        address: '', 
        image: PRESET_GYM_IMAGES[0].url, 
        startingPrice: 280, 
        amenities: ['AC', 'Free Locker', 'Steam Bath'],
        ownerName: '',
        ownerPhone: '',
        ownerEmail: '',
        ownerPassword: 'Owner@123',
        gymSplitPercent: 30
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

    const savedGym = await firestoreService.saveGym({
      ...gymForm,
      gymId: editingGym ? editingGym.gymId : null,
      rating: editingGym?.rating || 4.9,
      reviewCount: editingGym?.reviewCount || 40,
      gymSplitPercent: Number(gymForm.gymSplitPercent) || 30,
      ownerUpiId: ownerConfig?.ownerUpiId || '9030118909@ybl',
      ownerQrCodeUrl: ownerConfig?.ownerQrCodeUrl || ''
    }, currentUser);

    // Sync Gym Owner Account to Firebase Auth & Firestore `users/{uid}`
    if (registerGymOwnerAuth && (gymForm.ownerEmail || gymForm.ownerPassword || gymForm.ownerPhone)) {
      try {
        await registerGymOwnerAuth(
          gymForm.ownerName,
          gymForm.ownerEmail,
          gymForm.ownerPhone,
          gymForm.ownerPassword,
          savedGym.gymId,
          savedGym.name
        );
      } catch (authErr) {
        console.warn("Gym owner auth sync notice:", authErr?.message);
      }
    }

    setShowGymModal(false);
    showToast(editingGym ? "Gym & 30% Split Settings Updated!" : "New Partner Gym & Owner Account Added!");
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
    const defaultGymId = (gyms && gyms.length > 0) ? gyms[0].gymId : 'gym-1';
    if (trainer) {
      setEditingTrainer(trainer);
      setTrainerForm({
        name: trainer?.name || '',
        phone: trainer?.phone || '',
        password: trainer?.password || 'Trainer@123',
        gymId: trainer?.gymId || defaultGymId,
        price: trainer?.price || 280,
        trainerSplitPercent: trainer?.trainerSplitPercent !== undefined ? trainer.trainerSplitPercent : 50,
        specialization: trainer?.specialization || 'Strength & Conditioning',
        experience: trainer?.experience || '5+ Years',
        image: trainer?.image || PRESET_TRAINER_IMAGES[0].url,
        availableTimings: trainer?.availableTimings || ["06:00 AM - 08:00 AM", "09:00 AM - 11:00 AM"]
      });
    } else {
      setEditingTrainer(null);
      setTrainerForm({
        name: '',
        phone: '',
        password: 'Trainer@123',
        gymId: defaultGymId,
        price: 280,
        trainerSplitPercent: 50,
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

    const splitVal = Number(trainerForm.trainerSplitPercent) || 50;
    await firestoreService.saveTrainer({
      ...trainerForm,
      trainerId: editingTrainer ? editingTrainer.trainerId : null,
      commissionPercentage: splitVal,
      trainerSplitPercent: splitVal,
      walletBalance: editingTrainer?.walletBalance || 0
    });

    setShowTrainerModal(false);
    showToast(editingTrainer ? `Trainer & ${splitVal}% Split Settings Updated!` : "New Trainer Added!");
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

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    if (!couponForm.code.trim()) {
      alert("Please enter a valid coupon code");
      return;
    }
    try {
      const code = couponForm.code.trim().toUpperCase();
      const saved = await firestoreService.saveCoupon({
        code,
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue) || 0,
        description: couponForm.description.trim() || `${code} Promotional Discount`,
        active: true
      });
      const updated = firestoreService.getCouponsSync();
      setCoupons(updated);
      setShowCouponModal(false);
      setCouponForm({ code: '', discountType: 'PERCENT', discountValue: 50, description: '' });
      showToast(`Coupon ${saved.code} created & activated for ₹2,200 Onboarding!`);
    } catch (err) {
      alert(err.message || "Failed to save coupon");
    }
  };

  const handleUpdateUPI = async (e) => {
    e.preventDefault();
    soundEffects.playClick();

    // Persist to localStorage for immediate client-side and offline synchronization
    try {
      if (upiForm.razorpayKeyId) {
        localStorage.setItem('fitup_razorpay_key', upiForm.razorpayKeyId.trim());
      }
      if (upiForm.ownerUpiId) {
        localStorage.setItem('fitup_owner_upi', upiForm.ownerUpiId.trim());
      }
    } catch (err) {
      console.warn("Could not save to localStorage:", err);
    }

    await firestoreService.updateOwnerConfig(upiForm);
    showToast("Master Gateway & UPI Details Saved!");
  };

  const handleApprovePayout = async (requestId) => {
    soundEffects.playClick();
    await firestoreService.approvePayout(requestId);
    showToast("Payout Request Approved & Recorded!");
  };

  const handleSyncCloudData = async () => {
    soundEffects.playClick();
    setIsCloudSyncing(true);
    try {
      const res = await firestoreService.syncAllToCloud();
      soundEffects.playSuccessChime();
      setLastSyncedTime(new Date().toLocaleTimeString());
      showToast(`🔥 Cloud Synced! ${res?.counts?.users || 0} Users, ${res?.counts?.gyms || 0} Gyms, ${res?.counts?.trainers || 0} Trainers in fitup-ccb95`);
    } catch (err) {
      soundEffects.playError();
      showToast("Cloud sync notice: " + (err?.message || "Failed to sync"));
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleClearTestData = async () => {
    if (!window.confirm("Are you sure you want to clear all test bookings, reviews, and test clients to start completely clean for live production?")) {
      return;
    }
    soundEffects.playClick();
    firestoreService.clearAllTestData();
    setBookings([]);
    setPayoutRequests([]);
    showToast("🧹 Test Data Cleared! The platform is 100% clean and ready for your first live user.");
  };

  // 20 / 30 / 50 Financial Analytics Calculations
  const grossRevenue = useMemo(() => {
    if (!Array.isArray(bookings)) return 0;
    return bookings.reduce((sum, b) => b?.status === 'VERIFIED' ? sum + (Number(b?.amount) || 280) : sum, 0);
  }, [bookings]);

  const totalPlatformShare = useMemo(() => {
    if (!Array.isArray(bookings)) return 0;
    return bookings.reduce((sum, b) => {
      if (b?.status !== 'VERIFIED') return sum;
      return sum + (Number(b?.platformShare) || Math.round((Number(b?.amount) || 280) * 0.20));
    }, 0);
  }, [bookings]);

  const totalGymOwnersShare = useMemo(() => {
    if (!Array.isArray(bookings)) return 0;
    return bookings.reduce((sum, b) => {
      if (b?.status !== 'VERIFIED') return sum;
      return sum + (Number(b?.gymShare) || Math.round((Number(b?.amount) || 280) * 0.30));
    }, 0);
  }, [bookings]);

  const totalTrainersShare = useMemo(() => {
    if (!Array.isArray(bookings)) return 0;
    return bookings.reduce((sum, b) => {
      if (b?.status !== 'VERIFIED') return sum;
      return sum + (Number(b?.trainerShare) || Math.round((Number(b?.amount) || 280) * 0.50));
    }, 0);
  }, [bookings]);

  // Peak Hours Distribution
  const peakStats = useMemo(() => {
    let morning = 0;
    let evening = 0;
    const list = Array.isArray(bookings) ? bookings : [];
    list.forEach(b => {
      if (b?.slotTime?.includes('AM')) morning++;
      else evening++;
    });
    const total = list.length || 1;
    return { morning, evening, total };
  }, [bookings]);

  if (isLoading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center p-6">
        <div className="glass-panel p-8 rounded-3xl border border-electricBlue/30 text-center space-y-4 max-w-sm w-full">
          <div className="w-12 h-12 rounded-2xl bg-electricBlue/10 border border-electricBlue/30 text-electricBlue flex items-center justify-center mx-auto shadow-[0_0_15px_#00f0ff] animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white font-outfit">Loading Master Admin Console...</h3>
          <p className="text-xs text-slate-400">Synchronizing live Firestore records & splits</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-[0.25em] text-electricBlue uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-electricBlue" /> Master Admin Console
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 border border-amber-400/30">
              <Unlock className="w-3 h-3" /> Super Admin Snehith
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-outfit mt-1">
            20/30/50 Revenue Model & Platform Controls
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            20% Platform (Snehith), 30% Gym Owners (Vinay), 50% Trainers. Real-time Firestore synchronization.
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
            <span>{isSyncing ? 'Syncing...' : 'Save & Sync Changes to Live App'}</span>
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

          <button
            onClick={() => setShowDeleteModal(true)}
            title="Google Play Data Erasure"
            className="p-2.5 bg-slate-900 border border-white/10 hover:border-rose-500 text-slate-400 hover:text-rose-400 rounded-xl text-xs transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 20 / 30 / 50 REVENUE BREAKDOWN CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Gross Volume */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">Platform Gross Bookings</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-white font-outfit">₹{grossRevenue}</div>
          <span className="text-[10px] text-emerald-400 font-mono">100% Client Payments</span>
        </div>

        {/* Snehith's 20% Platform Share */}
        <div className="glass-panel p-5 rounded-3xl border border-electricBlue/30 bg-electricBlue/5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-electricBlue font-bold">Platform Net Share (20%)</span>
            <ShieldCheck className="w-4 h-4 text-electricBlue" />
          </div>
          <div className="text-3xl font-black text-white font-outfit">₹{totalPlatformShare}</div>
          <span className="text-[10px] text-slate-400 font-mono">Snehith Platform Retained</span>
        </div>

        {/* Gym Owners' 30% Share */}
        <div className="glass-panel p-5 rounded-3xl border border-emerald-400/30 bg-emerald-500/5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-emerald-400 font-bold">Gym Owners Share (30%)</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white font-outfit">₹{totalGymOwnersShare}</div>
          <span className="text-[10px] text-slate-400 font-mono">Credited to Gym Wallets</span>
        </div>

        {/* Trainers' 50% Share */}
        <div className="glass-panel p-5 rounded-3xl border border-vibrantOrange/30 bg-vibrantOrange/5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-vibrantOrange font-bold">Trainers Share (50%)</span>
            <Users className="w-4 h-4 text-vibrantOrange" />
          </div>
          <div className="text-3xl font-black text-white font-outfit">₹{totalTrainersShare}</div>
          <span className="text-[10px] text-slate-400 font-mono">Credited to Trainer Wallets</span>
        </div>

      </div>

      {/* GYMS & TRAINERS CONFIGURATION MANAGEMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Partner Gyms with 30% Split & Owner Credentials */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
              <Building2 className="w-5 h-5 text-electricBlue" />
              <span>Partner Gyms & Splits ({gyms?.length || 0})</span>
            </h3>

            <button
              onClick={() => handleOpenGymModal()}
              className="text-xs text-electricBlue hover:underline font-semibold"
            >
              + New Gym
            </button>
          </div>

          <div className="space-y-3">
            {gyms?.map((g) => (
              <div 
                key={g?.gymId || Math.random()}
                className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4 hover:border-electricBlue/40 transition-all"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <SafeImage
                    src={g?.image}
                    alt={g?.name || 'Gym'}
                    fallbackType="gym"
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-bold text-white truncate">{g?.name || 'Partner Gym'}</h4>
                    <p className="text-xs text-slate-400 truncate">
                      Owner: <strong className="text-white">{g?.ownerName || 'Vinay'}</strong> ({g?.ownerPhone || '9123456780'})
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-emerald-400 font-bold font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Gym Split: {g?.gymSplitPercent !== undefined ? g.gymSplitPercent : 30}%
                      </span>
                      <span className="text-[10px] text-electricBlue font-bold font-mono">
                        ₹{g?.startingPrice || 280}/Slot
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Wallet: ₹{g?.walletBalance || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenGymModal(g)}
                    title="Configure Gym & Splits"
                    className="p-2 text-slate-400 hover:text-electricBlue hover:bg-electricBlue/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteGym(g?.gymId)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trainers with 50% Split & Credentials */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
              <Users className="w-5 h-5 text-vibrantOrange" />
              <span>Trainers & 50% Splits ({trainers?.length || 0})</span>
            </h3>

            <button
              onClick={() => handleOpenTrainerModal()}
              className="text-xs text-vibrantOrange hover:underline font-semibold"
            >
              + New Trainer
            </button>
          </div>

          <div className="space-y-3">
            {trainers?.map((t) => {
              const belongingGym = gyms?.find(g => g?.gymId === t?.gymId);
              return (
                <div 
                  key={t?.trainerId || Math.random()}
                  className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4 hover:border-vibrantOrange/40 transition-all"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <SafeImage
                      src={t?.image}
                      alt={t?.name || 'Trainer'}
                      fallbackType="trainer"
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-white truncate">{t?.name || 'Trainer Pro'}</h4>
                      <p className="text-xs text-vibrantOrange font-medium truncate">{belongingGym?.name || 'Assigned Gym'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-vibrantOrange font-bold font-mono bg-vibrantOrange/10 px-1.5 py-0.5 rounded">
                          Trainer Split: {t?.trainerSplitPercent !== undefined ? t.trainerSplitPercent : 50}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Wallet: ₹{t?.walletBalance || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenTrainerModal(t)}
                      title="Configure Trainer & Splits"
                      className="p-2 text-slate-400 hover:text-vibrantOrange hover:bg-vibrantOrange/10 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteTrainer(t?.trainerId)}
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

      {/* WITHDRAWAL APPROVAL QUEUES (TRAINERS & GYM OWNERS) */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>Master Payout Approval Queue (Trainers & Gym Owners)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">{payoutRequests?.length || 0} Total Requests</span>
        </div>

        {(!payoutRequests || payoutRequests.length === 0) ? (
          <p className="text-xs text-slate-500 italic">No payout requests pending.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-xl">Request ID</th>
                  <th className="p-3">Beneficiary</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">UPI ID</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payoutRequests?.map((req) => (
                  <tr key={req?.requestId || Math.random()} className="hover:bg-slate-900/50">
                    <td className="p-3 font-mono font-bold text-electricBlue">{req?.requestId}</td>
                    <td className="p-3 font-bold text-white">
                      {req?.beneficiaryName || req?.trainerName || req?.ownerName}
                      {req?.gymName && <span className="block text-[10px] text-slate-400 font-normal">{req.gymName}</span>}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req?.type === 'GYM_OWNER' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-vibrantOrange/20 text-vibrantOrange'
                      }`}>
                        {req?.type === 'GYM_OWNER' ? 'Gym Owner (30%)' : 'Trainer (50%)'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-300">{req?.upiId || 'Direct UPI'}</td>
                    <td className="p-3 font-bold text-emerald-400">₹{req?.amountRequested}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        req?.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {req?.status === 'APPROVED' ? 'Transferred ✓' : req?.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {req?.status === 'PENDING' ? (
                        <button
                          onClick={() => handleApprovePayout(req?.requestId)}
                          className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg text-[11px] hover:shadow-[0_0_10px_#34d399]"
                        >
                          Approve & Settle
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
            <label className="text-xs text-slate-300 block mb-1">Master Owner UPI ID (Snehith 20%)</label>
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
              className="w-full py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:shadow-[0_0_15px_#34d399] transition-all cursor-pointer"
            >
              Save Gateway Configuration
            </button>
          </div>
        </form>
      </div>

      {/* ADMIN COUPON CODE MANAGEMENT SYSTEM (₹2,200 REGISTRATION FEE) */}
      <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 space-y-4 bg-emerald-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white font-outfit flex items-center gap-2">
                <span>Admin Promo & Coupon Codes (₹2,200 Onboarding)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {coupons.length} Active Codes
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Discount codes applied during Gym Facility Registration to reduce or waive the ₹2,200 fee.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCouponModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:scale-105 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon Code</span>
          </button>
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {coupons.map((coupon, idx) => (
            <div 
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-emerald-400/40 transition-all flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-black text-xs border border-emerald-400/30">
                    {coupon.code}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT OFF`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {coupon.description}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-emerald-400 font-mono block">ACTIVE</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CLOUD FIRESTORE DATABASE & INFRASTRUCTURE STATUS */}
      <div className="glass-panel p-6 rounded-3xl border border-electricBlue/20 space-y-4 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/90 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-electricBlue/10 border border-electricBlue/30 text-electricBlue flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white font-outfit flex items-center gap-2">
                <span>Google Cloud Firestore Database</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE CONNECTED
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Target Project: <span className="text-electricBlue font-mono">fitup-ccb95</span> • Native Mode • Role-Based Security Rules Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={handleClearTestData}
              className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Wipe Test Data (Fresh Start)</span>
            </button>

            <button
              onClick={handleSyncCloudData}
              disabled={isCloudSyncing}
              className="px-4 py-2 bg-gradient-to-r from-electricBlue to-blue-500 text-slate-950 font-extrabold rounded-xl text-xs shadow-[0_0_15px_#00f0ff] hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Cloud className={`w-4 h-4 ${isCloudSyncing ? 'animate-bounce' : ''}`} />
              <span>{isCloudSyncing ? 'Synchronizing Cloud...' : 'Sync All to Cloud Firestore'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Users Collection</span>
            <span className="text-sm font-extrabold text-white font-outfit">users/{'{uid}'}</span>
            <span className="text-[10px] text-emerald-400 block font-mono">Auto Profile Sync</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Partner Gyms</span>
            <span className="text-sm font-extrabold text-white font-outfit">{gyms.length} Registered</span>
            <span className="text-[10px] text-cyan-400 block font-mono">30% Digital Wallets</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Trainers</span>
            <span className="text-sm font-extrabold text-white font-outfit">{trainers.length} Active</span>
            <span className="text-[10px] text-amber-400 block font-mono">50% Digital Wallets</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Security Rules</span>
            <span className="text-sm font-extrabold text-white font-outfit">firestore.rules</span>
            <span className="text-[10px] text-purple-400 block font-mono">RBAC + Pricing Guard</span>
          </div>
        </div>

        {lastSyncedTime && (
          <p className="text-[11px] text-emerald-400/90 flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Last cloud database verification timestamp: <span className="font-mono">{lastSyncedTime}</span>
          </p>
        )}
      </div>

      {/* GYM MODAL WITH CUSTOM 30% SPLIT & OWNER CREDENTIALS */}
      {showGymModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full rounded-3xl border border-electricBlue/40 p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-extrabold text-white font-outfit">
                {editingGym ? 'Edit Partner Gym & Revenue Split' : 'Add New Partner Gym'}
              </h3>
              <button onClick={() => setShowGymModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveGym} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Gym Facility Name</label>
                <input
                  type="text"
                  required
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
                  required
                  value={gymForm.location}
                  onChange={(e) => setGymForm({ ...gymForm, location: e.target.value })}
                  placeholder="e.g. chengicherla , Hyderabad"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-electricBlue"
                />
              </div>

              {/* Gym Owner Account Credentials */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.05)]">
                <div className="col-span-2 text-emerald-400 font-bold font-mono text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Gym Owner Auth & Login Credentials
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Firestore & Firebase Auth Synced</span>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-xs">Owner Name</label>
                  <input
                    type="text"
                    value={gymForm.ownerName}
                    onChange={(e) => setGymForm({ ...gymForm, ownerName: e.target.value })}
                    placeholder="e.g. Vinay"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-xs">Owner Phone (Login ID)</label>
                  <input
                    type="tel"
                    value={gymForm.ownerPhone}
                    onChange={(e) => setGymForm({ ...gymForm, ownerPhone: e.target.value })}
                    placeholder="e.g. 9123456780"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-xs">Owner Email (Firebase Auth)</label>
                  <input
                    type="email"
                    value={gymForm.ownerEmail}
                    onChange={(e) => setGymForm({ ...gymForm, ownerEmail: e.target.value })}
                    placeholder="e.g. vinay@gsfitness.com"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-xs">Custom Owner Password</label>
                  <input
                    type="text"
                    value={gymForm.ownerPassword}
                    onChange={(e) => setGymForm({ ...gymForm, ownerPassword: e.target.value })}
                    placeholder="e.g. Owner@123"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* REVENUE SPLIT & PRICE */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Gym Split % (Default 30%)</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={gymForm.gymSplitPercent}
                    onChange={(e) => setGymForm({ ...gymForm, gymSplitPercent: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-emerald-400 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">2-Hour Trial Slot Fee (₹)</label>
                  <input
                    type="number"
                    value={gymForm.startingPrice}
                    onChange={(e) => setGymForm({ ...gymForm, startingPrice: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-electricBlue rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none font-mono"
                  />
                </div>
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

      {/* TRAINER MODAL WITH CUSTOM 50% SPLIT */}
      {showTrainerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full rounded-3xl border border-vibrantOrange/40 p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-extrabold text-white font-outfit">
                {editingTrainer ? 'Edit Trainer & 50% Split' : 'Add New Trainer Pro'}
              </h3>
              <button onClick={() => setShowTrainerModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveTrainer} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Trainer Full Name</label>
                <input
                  type="text"
                  required
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
                  {gyms?.map(g => (
                    <option key={g?.gymId || Math.random()} value={g?.gymId}>{g?.name} ({g?.location})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Phone Number (Login ID)</label>
                  <input
                    type="tel"
                    required
                    value={trainerForm.phone}
                    onChange={(e) => setTrainerForm({ ...trainerForm, phone: e.target.value })}
                    placeholder="e.g. 9030118909"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-vibrantOrange font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Trainer Split % (Default 50%)</label>
                  <input
                    type="number"
                    min="10"
                    max="80"
                    value={trainerForm.trainerSplitPercent}
                    onChange={(e) => setTrainerForm({ ...trainerForm, trainerSplitPercent: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-vibrantOrange rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none font-mono"
                  />
                </div>
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

      {/* CREATE NEW ADMIN COUPON MODAL */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white font-outfit">Create Gym Onboarding Coupon</h3>
              </div>
              <button 
                onClick={() => setShowCouponModal(false)} 
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SPECIAL80, PROMO100"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono uppercase focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-emerald-400"
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    {couponForm.discountType === 'PERCENT' ? 'Percentage Cut (0-100)' : 'Flat Discount (₹)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={couponForm.discountType === 'PERCENT' ? 100 : 2200}
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    placeholder={couponForm.discountType === 'PERCENT' ? '50' : '500'}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Description / Campaign Name</label>
                <input
                  type="text"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="e.g. Hyderabad Launch Special • 50% Off"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-emerald-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400">Calculated Gym Payable Amount:</span>
                <div className="text-sm font-black text-emerald-400 font-mono">
                  {couponForm.discountType === 'PERCENT'
                    ? `₹${Math.max(0, 2200 - Math.round((2200 * (Number(couponForm.discountValue) || 0)) / 100))} (from ₹2,200)`
                    : `₹${Math.max(0, 2200 - (Number(couponForm.discountValue) || 0))} (from ₹2,200)`}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold rounded-xl shadow-[0_0_15px_rgba(52,211,153,0.4)] cursor-pointer"
                >
                  Activate Coupon Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />

    </div>
  );
};
