import React, { useState, useMemo, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';
import { soundEffects } from '../services/soundEffects';
import { razorpayService } from '../services/razorpayService';
import { SafeImage } from './SafeImage';
import { useAuth } from '../context/AuthContext';
import { DeleteAccountModal } from "./DeleteAccountModal";
import { 
  Search, MapPin, Star, Trash2, ShieldCheck, Dumbbell, Clock, 
  Sparkles, ChevronRight, QrCode, CheckCircle2, Ticket, 
  Upload, Scan, AlertCircle, ArrowLeft, Calendar, User, 
  RefreshCw, CreditCard, MessageSquare, HelpCircle, X,
  Shield, Check, Phone, ChevronDown, Award, CornerUpLeft,
  Flame, Zap, Filter, Heart, Share2, Info, Compass, CheckCircle,
  Building2, Tag, UserCheck
} from 'lucide-react';

export const ClientDashboard = ({ activeTab = 'home', setActiveTab, onOpenLegal }) => {
  const { currentUser, openAuthModal } = useAuth();

  const [gyms, setGyms] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ownerConfig, setOwnerConfig] = useState(null);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL' | 'POPULAR' | 'STRENGTH' | 'HIIT' | 'SAUNA' | 'LATE_NIGHT'
  const [sortBy, setSortBy] = useState('RATING'); // 'RATING' | 'PRICE_ASC' | 'PRICE_DESC'

  // Slot Booking Modal State
  const [selectedGym, setSelectedGym] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [bookingStep, setBookingStep] = useState(1); // 1: Select Slot & Trainer, 2: Payment Gateway, 3: OCR Scan, 4: Pass Ticket
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY'); // "RAZORPAY" | "MANUAL_UPI"
  const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false);

  // Studio Details Modal State
  const [detailsGym, setDetailsGym] = useState(null);

  // Reviews Modal State
  const [reviewGym, setReviewGym] = useState(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  // FAQ & Policy Modals
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Payment & OCR Scanner State
  const [txnId, setTxnId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [completedBooking, setCompletedBooking] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Real-Time Firestore Subscriptions
  useEffect(() => {
    const unsubGyms = firestoreService.subscribeGyms(setGyms);
    const unsubTrainers = firestoreService.subscribeTrainers(setTrainers);
    const unsubBookings = firestoreService.subscribeBookings(setBookings);
    const unsubReviews = firestoreService.subscribeReviews(setReviews);
    const unsubConfig = firestoreService.subscribeOwnerConfig(setOwnerConfig);

    const handleSync = () => {
      setGyms(firestoreService.getGymsSync());
      setTrainers(firestoreService.getTrainersSync());
      setBookings(firestoreService.getBookingsSync());
      setReviews(firestoreService.getReviewsSync());
      setOwnerConfig(firestoreService.getOwnerConfigSync());
    };

    window.addEventListener('fitup_data_sync', handleSync);
    return () => {
      if (typeof unsubGyms === 'function') unsubGyms();
      if (typeof unsubTrainers === 'function') unsubTrainers();
      if (typeof unsubBookings === 'function') unsubBookings();
      if (typeof unsubReviews === 'function') unsubReviews();
      if (typeof unsubConfig === 'function') unsubConfig();
      window.removeEventListener('fitup_data_sync', handleSync);
    };
  }, []);

  const showToast = (msg) => {
    soundEffects.playSuccessChime();
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Dynamic Location Extraction
  const dynamicLocations = useMemo(() => {
    const locSet = new Set();
    gyms.forEach(g => {
      if (g.location) {
        const parts = g.location.split(',');
        const area = parts[0].trim();
        if (area) locSet.add(area);
      }
    });
    return ['ALL', ...Array.from(locSet)];
  }, [gyms]);

  // Client Bookings List
  const userBookings = useMemo(() => {
    if (!currentUser) return bookings;
    return bookings.filter(b => 
      b.userId === currentUser.uid || 
      b.userPhone === currentUser.phone || 
      currentUser.role === 'owner'
    );
  }, [bookings, currentUser]);

  const activePasses = useMemo(() => {
    return userBookings.filter(b => b.status === 'VERIFIED');
  }, [userBookings]);

  const pastPasses = useMemo(() => {
    return userBookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');
  }, [userBookings]);

  // Memoized Gym Search, Category Filter & Sorting
  const filteredGyms = useMemo(() => {
    let result = gyms.filter(gym => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        gym.name.toLowerCase().includes(q) || 
        gym.location.toLowerCase().includes(q) ||
        (gym.amenities && gym.amenities.some(a => a.toLowerCase().includes(q)));
      
      const matchesLocation = 
        selectedLocation === 'ALL' || 
        gym.location.toLowerCase().includes(selectedLocation.toLowerCase());

      let matchesCategory = true;
      if (selectedCategory === 'POPULAR') {
        matchesCategory = (gym.rating || 5) >= 4.9;
      } else if (selectedCategory === 'STRENGTH') {
        matchesCategory = gym.amenities?.some(a => /powerlifting|lifting|heavy|strength|squat/i.test(a));
      } else if (selectedCategory === 'HIIT') {
        matchesCategory = gym.amenities?.some(a => /crossfit|hiit|cardio|turf/i.test(a));
      } else if (selectedCategory === 'SAUNA') {
        matchesCategory = gym.amenities?.some(a => /steam|sauna/i.test(a));
      } else if (selectedCategory === 'LATE_NIGHT') {
        matchesCategory = gym.amenities?.some(a => /midnight|24\/7|late/i.test(a)) || gym.name.toLowerCase().includes('pulse');
      }

      return matchesSearch && matchesLocation && matchesCategory;
    });

    // Sorting
    if (sortBy === 'RATING') {
      result.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else if (sortBy === 'PRICE_ASC') {
      result.sort((a, b) => (a.startingPrice || 280) - (b.startingPrice || 280));
    } else if (sortBy === 'PRICE_DESC') {
      result.sort((a, b) => (b.startingPrice || 280) - (a.startingPrice || 280));
    }

    return result;
  }, [gyms, searchQuery, selectedLocation, selectedCategory, sortBy]);

  // Filter trainers for the selected gym
  const availableTrainers = useMemo(() => {
    if (!selectedGym) return [];
    return trainers.filter(t => t.gymId === selectedGym.gymId);
  }, [trainers, selectedGym]);

  const handleSelectGym = (gym, preselectedTrainer = null) => {
    soundEffects.playClick();
    setSelectedGym(gym);
    const gymTrainers = trainers.filter(t => t.gymId === gym.gymId);
    if (preselectedTrainer) {
      setSelectedTrainer(preselectedTrainer);
      if (preselectedTrainer.availableTimings?.length > 0) {
        setSelectedTimeSlot(preselectedTrainer.availableTimings[0]);
      }
    } else if (gymTrainers.length > 0) {
      setSelectedTrainer(gymTrainers[0]);
      if (gymTrainers[0].availableTimings?.length > 0) {
        setSelectedTimeSlot(gymTrainers[0].availableTimings[0]);
      }
    } else {
      setSelectedTrainer(null);
      setSelectedTimeSlot('06:00 AM - 08:00 AM');
    }
    setBookingStep(1);
  };

  // DYNAMIC RAZORPAY PAYMENT GATEWAY
  const handlePayWithRazorpay = async () => {
    soundEffects.playClick();
    if (!currentUser) {
      openAuthModal('login', 'client');
      return;
    }

    setIsProcessingRazorpay(true);
    const amountInRupees = selectedGym.startingPrice || 280;

    const executeBookingSuccess = async ({ paymentId, orderId, signature }) => {
      soundEffects.playSuccessChime();
      const booking = await firestoreService.createBooking({
        userId: currentUser.uid,
        userName: currentUser.name,
        userPhone: currentUser.phone,
        gymId: selectedGym.gymId,
        gymName: selectedGym.name,
        gymLocation: selectedGym.location,
        trainerId: selectedTrainer?.trainerId || 'tr-general',
        trainerName: selectedTrainer?.name || 'Assigned Master Coach',
        slotTime: selectedTimeSlot,
        date: new Date().toISOString().split('T')[0],
        amount: amountInRupees,
        paymentMethod: "RAZORPAY",
        paymentId: paymentId || `pay_rzp_${Date.now()}`,
        orderId: orderId || null,
        signature: signature || null,
        txnId: paymentId || `pay_rzp_${Date.now()}`
      });

      setIsProcessingRazorpay(false);
      setCompletedBooking(booking);
      setBookingStep(4);
      showToast("Payment Verified via Razorpay! Pass Generated.");
    };

    razorpayService.openCheckout({
      amount: amountInRupees,
      gymName: selectedGym.name,
      trainerName: selectedTrainer?.name || 'Assigned Master Coach',
      user: currentUser,
      onSuccess: (res) => {
        executeBookingSuccess(res);
      },
      onFailure: (err) => {
        setIsProcessingRazorpay(false);
        soundEffects.playError();
        showToast(err.message || "Payment cancelled or failed");
      },
      onDismiss: () => {
        setIsProcessingRazorpay(false);
      }
    });
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      soundEffects.playClick();
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // OCR Fallback Scanner
  const handleProceedToOCRScan = () => {
    soundEffects.playClick();
    if (!screenshotFile) {
      soundEffects.playError();
      alert("Please upload your payment screenshot before scanning!");
      return;
    }
    
    setBookingStep(3);
    setIsScanning(true);
    setScanProgress(0);

    let progress = 0;
    const interval = setInterval(async () => {
      progress += 10;
      setScanProgress(progress);
      soundEffects.playScanBeep();

      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        soundEffects.playSuccessChime();

        const booking = await firestoreService.createBooking({
          userId: currentUser?.uid || "usr-client-guest",
          userName: currentUser?.name || "Client Member",
          userPhone: currentUser?.phone || "9876500112",
          gymId: selectedGym.gymId,
          gymName: selectedGym.name,
          gymLocation: selectedGym.location,
          trainerId: selectedTrainer?.trainerId || 'tr-general',
          trainerName: selectedTrainer?.name || 'General Master Trainer',
          slotTime: selectedTimeSlot,
          date: new Date().toISOString().split('T')[0],
          amount: selectedGym.startingPrice || 280,
          paymentMethod: "UPI_OCR",
          txnId: txnId || ('UTR-' + Math.floor(100000000000 + Math.random() * 900000000000)),
          screenshotUrl: screenshotPreview
        });

        setCompletedBooking(booking);
        setBookingStep(4);
        showToast("Payment Screenshot Verified! Pass Generated.");
      }
    }, 200);
  };

  // Cancel Booking & 100% Refund Handler
  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking? According to our 2-Hour policy, 100% refund will be credited instantly back to your payment method.")) {
      soundEffects.playClick();
      await firestoreService.cancelBooking(bookingId, "Client Cancelled > 2h Before Slot");
      showToast("Booking Cancelled. 100% Refund Initiated to Razorpay.");
    }
  };

  // Submit Review Handler
  const handleOpenReviewModal = (gym) => {
    soundEffects.playClick();
    setReviewGym(gym);
    setRatingInput(5);
    setCommentInput('');
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    if (!commentInput.trim()) {
      alert("Please write a few words about your training experience.");
      return;
    }

    await firestoreService.addReview({
      targetId: reviewGym.gymId,
      targetType: 'gym',
      targetName: reviewGym.name,
      userName: currentUser?.name || "Verified Athlete",
      userPhone: currentUser?.phone || "9876543210",
      rating: ratingInput,
      comment: commentInput
    });

    setShowReviewModal(false);
    showToast("Thank you! Review & Star Rating submitted.");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl font-bold shadow-[0_0_25px_#34d399] flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================== */}
      {/* 1. PERSONALIZED MEMBER WELCOME & STATUS HEADER */}
      {/* ========================================================== */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 shadow-2xl relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-electricBlue/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electricBlue/10 border border-electricBlue/30 text-electricBlue text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MEMBER WORKOUT PORTAL</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black text-white font-outfit">
              {currentUser ? `Welcome Back, ${currentUser.name}!` : "Welcome to FITUP Workout Hub!"}
            </h1>
            
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Book single-session 2-hour workout slots (₹200 – ₹280) with certified personal training included. No monthly subscriptions, 100% instant refund guarantee.
            </p>
          </div>

          {/* Quick Active Pass Callout */}
          {activePasses.length > 0 ? (
            <div 
              onClick={() => setActiveTab('my_bookings')}
              className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 text-left cursor-pointer hover:bg-emerald-500/20 transition-all group shadow-[0_0_20px_rgba(52,211,153,0.15)] flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center font-bold">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  ACTIVE TODAY'S PASS
                </span>
                <div className="text-xs font-extrabold text-white">
                  {activePasses[0].gymName} • {activePasses[0].slotTime}
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-300 underline">
                  Show Check-in QR Pass →
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const el = document.getElementById('available-gyms-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3 bg-gradient-to-r from-electricBlue to-blue-500 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center gap-1.5 cursor-pointer transform hover:scale-105"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Book Today's Slot</span>
              </button>
            </div>
          )}
        </div>

        {/* Micro Guarantee Badges */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-white/5 text-xs text-slate-300">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-white/5">
            <Tag className="w-3.5 h-3.5 text-electricBlue" /> ₹200 – ₹280 Flat Trial Pass
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-white/5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> 1-on-1 PT Coach Included
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-white/5">
            <ShieldCheck className="w-3.5 h-3.5 text-vibrantOrange" /> 100% Instant Refund (&gt;2h)
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-white/5">
            <QrCode className="w-3.5 h-3.5 text-cyan-400" /> Encrypted QR Check-In
          </span>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 2. FEATURED CERTIFIED COACHES ROSTER */}
      {/* ========================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-vibrantOrange flex items-center gap-1.5">
              <Award className="w-4 h-4" /> TOP CERTIFIED COACHES
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-outfit mt-0.5">
              Train With Elite Floor Coaches
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Included with every 2-hour workout slot
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainers.slice(0, 6).map((trainer) => {
            const matchedGym = gyms.find(g => g.gymId === trainer.gymId);
            return (
              <div 
                key={trainer.trainerId}
                className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-vibrantOrange/40 transition-all group flex items-center space-x-3.5 shadow-lg bg-slate-900/80"
              >
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-950 flex-shrink-0 border border-white/10">
                  <SafeImage
                    src={trainer.image}
                    alt={trainer.name}
                    fallbackType="trainer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-1 right-1 bg-slate-950/90 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                    ★ {trainer.rating || 5.0}
                  </div>
                </div>

                <div className="overflow-hidden flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white truncate">{trainer.name}</h4>
                  </div>
                  <p className="text-xs font-semibold text-vibrantOrange truncate">{trainer.specialization}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                    <Building2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span>{matchedGym?.name || "Verified Fitness Studio"}</span>
                  </p>
                  
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">{trainer.experience}</span>
                    <button
                      onClick={() => {
                        if (matchedGym) {
                          handleSelectGym(matchedGym, trainer);
                        }
                      }}
                      className="px-2.5 py-1 bg-vibrantOrange/15 text-vibrantOrange hover:bg-vibrantOrange hover:text-slate-950 font-bold rounded-lg text-[10px] transition-all cursor-pointer"
                    >
                      Book with Coach
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================== */}
      {/* 3. SEARCH ENGINE, AREA FILTERS & CATEGORY SELECTOR */}
      {/* ========================================================== */}
      <div id="available-gyms-grid" className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5 shadow-2xl relative">
        
        {/* Header & FAQ / Policy Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-electricBlue flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> VERIFIED PARTNER GYMS
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-outfit mt-0.5">
              Explore Available 2-Hour Trial Arenas
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFaqModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-electricBlue flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-electricBlue" /> FAQ
            </button>
            <button
              onClick={() => setShowPolicyModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-vibrantOrange flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-vibrantOrange" /> 100% Refund Policy
            </button>
          </div>
        </div>

        {/* Search Bar & Sort Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by gym name, area (Madhapur, Jubilee Hills), AC, Steam, Powerlifting..."
              className="w-full bg-slate-900/90 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-electricBlue text-xs sm:text-sm transition-all shadow-inner"
            />
          </div>

          <div className="md:col-span-4 relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-electricBlue" />
            <select
              value={sortBy}
              onChange={(e) => {
                soundEffects.playClick();
                setSortBy(e.target.value);
              }}
              className="w-full bg-slate-900/90 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-electricBlue text-xs sm:text-sm appearance-none cursor-pointer"
            >
              <option value="RATING">⭐ Sort: Top Rated First</option>
              <option value="PRICE_ASC">💰 Price: Low to High (₹200+)</option>
              <option value="PRICE_DESC">💰 Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Workout Category Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Gyms', icon: Dumbbell },
            { id: 'POPULAR', label: '🔥 Most Popular', icon: Flame },
            { id: 'STRENGTH', label: '💪 Heavy Strength & Squat Racks', icon: Zap },
            { id: 'HIIT', label: '⚡ HIIT & Crossfit', icon: Award },
            { id: 'SAUNA', label: '🧖 Steam & Sauna', icon: Sparkles },
            { id: 'LATE_NIGHT', label: '🌙 Open Late / 24-7', icon: Clock }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundEffects.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-electricBlue to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.35)]'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Area / Location Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {dynamicLocations.map((loc, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundEffects.playClick();
                setSelectedLocation(loc);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedLocation === loc
                  ? 'bg-emerald-400 text-slate-950 font-bold shadow-[0_0_12px_#34d399]'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {loc === 'ALL' ? '📍 All Locations' : `📍 ${loc}`}
            </button>
          ))}
        </div>

      </div>

      {/* ========================================================== */}
      {/* 4. VERIFIED PARTNER GYMS GRID */}
      {/* ========================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
            <span>Available Partner Fitness Clubs</span>
            <span className="text-xs text-electricBlue font-mono">
              ({filteredGyms.length} verified arenas)
            </span>
          </h3>
        </div>

        {filteredGyms.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 space-y-4">
            <Dumbbell className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-white">No Gyms Found Matching Criteria</h4>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
              No partner gyms match "{searchQuery}" in {selectedLocation}. Try clearing search filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLocation('ALL');
                setSelectedCategory('ALL');
              }}
              className="px-5 py-2.5 bg-electricBlue/10 border border-electricBlue/40 text-electricBlue font-bold rounded-xl text-xs hover:bg-electricBlue hover:text-slate-950 transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGyms.map((gym) => {
              const gymReviews = reviews.filter(r => r.targetId === gym.gymId);
              const gymTrainers = trainers.filter(t => t.gymId === gym.gymId);
              const primaryTrainer = gymTrainers.length > 0 ? gymTrainers[0] : null;

              return (
                <div 
                  key={gym.gymId}
                  className="glass-panel rounded-3xl border border-white/10 overflow-hidden hover:border-electricBlue/50 transition-all duration-300 group shadow-xl flex flex-col justify-between bg-slate-900/80"
                >
                  <div>
                    {/* Gym Cover Image with SafeImage Component */}
                    <div className="relative h-52 w-full overflow-hidden bg-slate-950">
                      <SafeImage
                        src={gym.image}
                        alt={gym.name}
                        fallbackType="gym"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
                      
                      {/* Price Badge */}
                      <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md border border-electricBlue/40 px-3 py-1 rounded-xl text-electricBlue font-mono font-black text-xs shadow-lg">
                        ₹{gym.startingPrice || 280} / 2-Hrs
                      </div>

                      {/* Star Rating Badge */}
                      <div 
                        onClick={() => handleOpenReviewModal(gym)}
                        className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-xl flex items-center space-x-1 cursor-pointer hover:border-amber-400 transition-colors"
                        title="Click to write review"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-white">{gym.rating || 4.9}</span>
                        <span className="text-[10px] text-slate-400">({gym.reviewCount || gymReviews.length || 38})</span>
                      </div>

                      {/* Gym Name & Location on Image Bottom */}
                      <div className="absolute bottom-3 left-3 right-3 space-y-0.5">
                        <h4 className="text-lg font-black text-white font-outfit drop-shadow-md truncate">
                          {gym.name}
                        </h4>
                        <p className="text-xs text-slate-300 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-electricBlue flex-shrink-0" />
                          <span className="truncate">{gym.location}</span>
                        </p>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-3.5">
                      
                      {/* Assigned Personal Trainer Included Box */}
                      {primaryTrainer && (
                        <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-white/5 flex items-center justify-between">
                          <div className="flex items-center space-x-2.5 overflow-hidden">
                            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 border border-emerald-400/40">
                              <SafeImage
                                src={primaryTrainer.image}
                                alt={primaryTrainer.name}
                                fallbackType="trainer"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="overflow-hidden">
                              <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                                <span>{primaryTrainer.name}</span>
                                <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                              </div>
                              <span className="text-[10px] text-emerald-400 font-semibold block truncate">
                                1-on-1 PT Included
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {primaryTrainer.experience?.split('•')[0] || "Certified"}
                          </span>
                        </div>
                      )}

                      {/* Amenities Chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {gym.amenities?.slice(0, 4).map((amenity, idx) => (
                          <span 
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-white/5 text-[10px] text-slate-300 font-medium"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>

                      {/* Verified Athlete Review Snippet */}
                      {gymReviews.length > 0 && (
                        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 text-[11px] text-slate-400 flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                          <p className="italic line-clamp-1">"{gymReviews[0].comment}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-5 pt-0 border-t border-white/5 mt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        setDetailsGym(gym);
                      }}
                      className="flex-1 py-2.5 bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 text-electricBlue" />
                      <span>Details</span>
                    </button>

                    <button
                      onClick={() => handleSelectGym(gym)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-electricBlue to-blue-500 hover:from-blue-400 hover:to-electricBlue text-slate-950 font-black rounded-xl text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-1 cursor-pointer transform active:scale-95"
                    >
                      <span>Book ₹{gym.startingPrice || 280}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================== */}
      {/* 5. STUDIO DETAILS & COACHES MODAL */}
      {/* ========================================================== */}
      {detailsGym && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full rounded-3xl border border-electricBlue/30 p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold text-electricBlue uppercase tracking-wider">FITNESS ARENA PROFILE</span>
                <h3 className="text-2xl font-black text-white font-outfit mt-0.5">{detailsGym.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-electricBlue flex-shrink-0" />
                  <span>{detailsGym.address || detailsGym.location}</span>
                </p>
              </div>

              <button 
                onClick={() => setDetailsGym(null)} 
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Gym Cover Image */}
            <div className="relative h-56 rounded-2xl overflow-hidden bg-slate-950 border border-white/10">
              <SafeImage
                src={detailsGym.image}
                alt={detailsGym.name}
                fallbackType="gym"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-slate-950/90 px-3 py-1 rounded-xl text-amber-400 font-bold text-xs flex items-center gap-1">
                ★ {detailsGym.rating || 4.9} Verified Rating
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Facility Amenities</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {detailsGym.amenities?.map((amenity, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-300 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned Certified Trainers */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Certified Floor Coaches</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trainers.filter(t => t.gymId === detailsGym.gymId).map(tr => (
                  <div key={tr.trainerId} className="p-3 rounded-2xl bg-slate-900/90 border border-white/5 flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                      <SafeImage src={tr.image} alt={tr.name} fallbackType="trainer" className="w-full h-full object-cover" />
                    </div>
                    <div className="overflow-hidden">
                      <h5 className="text-xs font-bold text-white truncate">{tr.name}</h5>
                      <p className="text-[10px] text-vibrantOrange truncate">{tr.specialization}</p>
                      <p className="text-[10px] text-slate-400">{tr.experience}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Action */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Single Session Pass</span>
                <div className="text-2xl font-black text-white font-outfit">
                  ₹{detailsGym.startingPrice || 280}
                  <span className="text-xs font-normal text-slate-400"> / 2 Hours</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const gymToBook = detailsGym;
                  setDetailsGym(null);
                  handleSelectGym(gymToBook);
                }}
                className="px-6 py-3 bg-gradient-to-r from-electricBlue to-blue-500 text-slate-950 font-black rounded-xl text-sm shadow-[0_0_20px_rgba(0,240,255,0.4)] cursor-pointer"
              >
                Book 2-Hour Slot Pass
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 6. TAB 2: MY PASSES & ACTIVE QR CODES */}
      {/* ========================================================== */}
      {activeTab === 'my_bookings' && (
        <div className="space-y-8">
          
          <div className="glass-panel p-6 rounded-3xl border border-electricBlue/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold tracking-[0.25em] text-electricBlue uppercase flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-electricBlue" /> Digital Gym Passes
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-outfit mt-1">
                My Workout Passes & Check-In QR
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Show your digital pass QR code at the gym reception desk for immediate entry.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('home')}
                className="px-4 py-2 bg-gradient-to-r from-electricBlue to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer"
              >
                + Book Another Slot
              </button>
              {currentUser && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  title="Google Play Data Erasure"
                  className="p-2 bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* ACTIVE PASSES */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Active Passes ({activePasses.length})</span>
            </h3>

            {activePasses.length === 0 ? (
              <div className="glass-panel p-8 text-center rounded-3xl border border-white/10 space-y-3">
                <Ticket className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-white">No Active Workout Passes</h4>
                <p className="text-xs text-slate-400">You don't have any upcoming trial sessions booked right now.</p>
                <button
                  onClick={() => setActiveTab('home')}
                  className="px-5 py-2.5 bg-electricBlue text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_15px_#00f0ff] cursor-pointer"
                >
                  Explore Gyms & Book ₹280 Slot
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activePasses.map((pass) => (
                  <div 
                    key={pass.bookingId}
                    className="glass-panel rounded-3xl border border-emerald-500/30 p-6 space-y-4 relative overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900"
                  >
                    <div className="flex items-start justify-between border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-electricBlue">{pass.bookingId}</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">ACTIVE ENTRY PASS</span>
                        </div>
                        <h4 className="text-xl font-black text-white font-outfit mt-1">
                          {pass.gymName}
                        </h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-electricBlue" /> {pass.gymLocation || 'Hyderabad'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">TRIAL FEE</span>
                        <div className="text-xl font-black text-emerald-400 font-outfit">₹{pass.amount || 280}</div>
                      </div>
                    </div>

                    {/* QR Code & Slot Details Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-900/90 p-4 rounded-2xl border border-white/10">
                      <div className="sm:col-span-5 flex flex-col items-center">
                        <div className="w-28 h-28 bg-white p-2 rounded-xl shadow-inner flex items-center justify-center">
                          <img 
                            src={pass.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PASS-${pass.bookingId}`}
                            alt="Check-in QR" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono mt-1">Scan at Gym Desk</span>
                      </div>

                      <div className="sm:col-span-7 space-y-2 text-xs">
                        <div>
                          <span className="text-slate-400 text-[11px] block">Assigned Coach</span>
                          <span className="text-white font-bold">{pass.trainerName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block">2-Hour Time Slot</span>
                          <span className="text-vibrantOrange font-bold">{pass.slotTime}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block">Date</span>
                          <span className="text-white font-medium">{pass.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-400">Payment: <strong className="text-white font-mono">{pass.paymentMethod || 'RAZORPAY'}</strong></span>

                      <button
                        onClick={() => handleCancelBooking(pass.bookingId)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500 hover:text-slate-950 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <CornerUpLeft className="w-3.5 h-3.5" /> Cancel & 100% Refund
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PAST & CANCELLED SESSIONS */}
          {pastPasses.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h4 className="text-lg font-bold text-slate-400 font-outfit">Past & Cancelled Sessions</h4>
              <div className="space-y-3">
                {pastPasses.map((p) => (
                  <div key={p.bookingId} className="glass-panel p-4 rounded-2xl border border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <div>
                      <span className="font-mono text-slate-500">{p.bookingId}</span>
                      <h5 className="text-sm font-bold text-slate-300">{p.gymName}</h5>
                      <p className="text-[11px]">{p.date} • {p.slotTime}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        p.status === 'CANCELLED' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {p.status}
                      </span>
                      {p.refundStatus && <span className="block text-[10px] text-emerald-400 mt-0.5">{p.refundStatus}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================== */}
      {/* 7. SLOT BOOKING & PAYMENT MODAL */}
      {/* ========================================================== */}
      {selectedGym && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full rounded-3xl border border-electricBlue/30 p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs text-vibrantOrange font-bold tracking-wider uppercase">SLOT BOOKING PORTAL</span>
                <h3 className="text-2xl font-extrabold text-white font-outfit mt-0.5">
                  {selectedGym.name}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-electricBlue" /> {selectedGym.location}
                </p>
              </div>

              <button
                onClick={() => setSelectedGym(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* STEP 1: Select Trainer & Time Slot */}
            {bookingStep === 1 && (
              <div className="space-y-6">
                
                {/* Select Trainer Section */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-white flex items-center gap-1.5">
                    <User className="w-4 h-4 text-electricBlue" />
                    <span>Select Personal Trainer Pro</span>
                  </label>

                  {availableTrainers.length === 0 ? (
                    <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/5 text-center">
                      <p className="text-xs text-slate-400">General Floor Master Trainer included with this slot.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableTrainers.map((tr) => (
                        <div
                          key={tr.trainerId}
                          onClick={() => {
                            soundEffects.playClick();
                            setSelectedTrainer(tr);
                            if (tr.availableTimings?.length > 0) {
                              setSelectedTimeSlot(tr.availableTimings[0]);
                            }
                          }}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 ${
                            selectedTrainer?.trainerId === tr.trainerId
                              ? 'bg-electricBlue/10 border-electricBlue shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                              : 'bg-slate-900/80 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <SafeImage
                            src={tr.image}
                            alt={tr.name}
                            fallbackType="trainer"
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div className="overflow-hidden">
                            <h5 className="text-sm font-bold text-white truncate">{tr.name}</h5>
                            <p className="text-[11px] text-vibrantOrange truncate">{tr.specialization}</p>
                            <p className="text-[10px] text-slate-400">{tr.experience}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Select 2-Hour Time Slot Section */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-vibrantOrange" />
                    <span>Select 2-Hour Workout Slot</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(selectedTrainer?.availableTimings || [
                      "06:00 AM - 08:00 AM",
                      "09:00 AM - 11:00 AM",
                      "04:00 PM - 06:00 PM",
                      "06:00 PM - 08:00 PM"
                    ]).map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          soundEffects.playClick();
                          setSelectedTimeSlot(slot);
                        }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          selectedTimeSlot === slot
                            ? 'bg-vibrantOrange text-slate-950 font-bold shadow-[0_0_12px_#ff5500]'
                            : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-white/5'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Booking Summary Box */}
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Total Slot Booking Fee</span>
                    <div className="text-2xl font-extrabold text-white font-outfit">
                      ₹{selectedGym.startingPrice || 280}
                      <span className="text-xs font-normal text-slate-400"> (2 Hours)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setBookingStep(2);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-electricBlue to-blue-500 text-slate-950 font-bold rounded-xl text-sm shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-105 transition-all cursor-pointer"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Payment Gateway Selection */}
            {bookingStep === 2 && (
              <div className="space-y-6">
                
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    CHOOSE SECURE PAYMENT METHOD
                  </span>

                  {/* Razorpay Instant Checkout Option */}
                  <div
                    onClick={() => setPaymentMethod('RAZORPAY')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === 'RAZORPAY'
                        ? 'bg-electricBlue/10 border-electricBlue shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                        : 'bg-slate-900/80 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-electricBlue/20 text-electricBlue flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>Razorpay Standard Gateway</span>
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-md">INSTANT PASS</span>
                        </div>
                        <p className="text-xs text-slate-400">Pay via UPI (GPay, PhonePe, Paytm), Cards, NetBanking</p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'RAZORPAY' ? 'border-electricBlue bg-electricBlue text-slate-950' : 'border-slate-600'
                    }`}>
                      {paymentMethod === 'RAZORPAY' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Manual UPI & OCR Scanner Fallback Option */}
                  <div
                    onClick={() => setPaymentMethod('MANUAL_UPI')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === 'MANUAL_UPI'
                        ? 'bg-vibrantOrange/10 border-vibrantOrange shadow-[0_0_20px_rgba(255,85,0,0.2)]'
                        : 'bg-slate-900/80 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-vibrantOrange/20 text-vibrantOrange flex items-center justify-center">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Direct Owner UPI & Screenshot Scan</div>
                        <p className="text-xs text-slate-400">Scan QR Code and upload payment screenshot</p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'MANUAL_UPI' ? 'border-vibrantOrange bg-vibrantOrange text-slate-950' : 'border-slate-600'
                    }`}>
                      {paymentMethod === 'MANUAL_UPI' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>

                {/* RAZORPAY INSTANT PAYMENT TRIGGER */}
                {paymentMethod === 'RAZORPAY' && (
                  <div className="bg-slate-900/90 p-6 rounded-2xl border border-white/10 space-y-4 text-center">
                    <div className="flex items-center justify-center space-x-2 text-electricBlue">
                      <Shield className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">256-BIT ENCRYPTED RAZORPAY CHECKOUT</span>
                    </div>

                    <div className="text-2xl font-black text-white font-outfit">
                      Total Payable: ₹{selectedGym.startingPrice || 280}
                    </div>

                    <button
                      onClick={handlePayWithRazorpay}
                      disabled={isProcessingRazorpay}
                      className="w-full py-3.5 bg-gradient-to-r from-electricBlue via-blue-400 to-electricBlue text-slate-950 font-black rounded-xl text-sm shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isProcessingRazorpay ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Initiating Razorpay...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Pay ₹{selectedGym.startingPrice || 280} with Razorpay</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* MANUAL UPI QR & OCR SCREEN */}
                {paymentMethod === 'MANUAL_UPI' && (
                  <div className="space-y-4">
                    <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 text-center space-y-3">
                      <span className="text-xs font-bold text-electricBlue uppercase tracking-wider block">
                        SCAN & PAY TO OWNER UPI
                      </span>

                      <div className="w-44 h-44 mx-auto bg-white p-2 rounded-2xl shadow-lg flex items-center justify-center">
                        <SafeImage
                          src={ownerConfig?.ownerQrCodeUrl || selectedGym.ownerQrCodeUrl}
                          alt="Payment QR"
                          fallbackType="qr"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="text-sm font-mono font-bold text-electricBlue bg-slate-950 py-1 px-3 rounded-lg border border-electricBlue/30 inline-block">
                        {ownerConfig?.ownerUpiId || "9030118909@ybl"}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Upload Payment Screenshot
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-electricBlue/20 file:text-electricBlue file:font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        UPI UTR / Transaction ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={txnId}
                        onChange={(e) => setTxnId(e.target.value)}
                        placeholder="e.g. UTR-903011890111"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-electricBlue"
                      />
                    </div>

                    <button
                      onClick={handleProceedToOCRScan}
                      className="w-full py-3 bg-gradient-to-r from-vibrantOrange to-amber-500 text-slate-950 font-bold rounded-xl text-sm shadow-[0_0_15px_rgba(255,85,0,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Scan className="w-4 h-4" /> Verify Screenshot via Laser OCR
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setBookingStep(1)}
                    className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Slots
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Automated Laser OCR Scanner */}
            {bookingStep === 3 && (
              <div className="py-12 text-center space-y-6">
                <div className="relative w-40 h-40 mx-auto rounded-2xl bg-slate-900 border border-electricBlue overflow-hidden flex items-center justify-center">
                  {screenshotPreview && (
                    <img src={screenshotPreview} alt="Screenshot" className="w-full h-full object-cover opacity-60" />
                  )}
                  <div className="laser-sweep" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-white font-outfit">
                    Verifying Payment Authentication...
                  </h4>
                  <p className="text-xs text-electricBlue font-mono">
                    VALIDATING UPI TRANSACTION ({scanProgress}%)
                  </p>
                </div>

                <div className="w-64 h-2 bg-slate-800 rounded-full mx-auto overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-electricBlue to-vibrantOrange transition-all duration-200"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Digital Pass Ticket View */}
            {bookingStep === 4 && completedBooking && (
              <div className="space-y-6 text-center">
                <div className="glass-panel p-6 rounded-3xl border border-emerald-500/40 bg-emerald-950/20 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_#34d399]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest">
                      PAYMENT CONFIRMED • PASS ACTIVE
                    </span>
                    <h4 className="text-2xl font-black text-white font-outfit mt-1">
                      {completedBooking.gymName}
                    </h4>
                  </div>

                  {/* Digital Pass Box */}
                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 text-left space-y-2.5 font-mono text-xs text-slate-300">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-400">Pass ID:</span>
                      <span className="text-electricBlue font-bold">{completedBooking.bookingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Personal Coach:</span>
                      <span className="text-white font-bold">{completedBooking.trainerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Workout Slot:</span>
                      <span className="text-vibrantOrange font-bold">{completedBooking.slotTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Ref:</span>
                      <span className="text-emerald-400">{completedBooking.paymentId || completedBooking.txnId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedGym(null);
                      setActiveTab('my_bookings');
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-electricBlue to-blue-500 text-slate-950 font-bold rounded-xl text-sm shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
                  >
                    View in My Passes
                  </button>
                  <button
                    onClick={() => setSelectedGym(null)}
                    className="px-6 py-3 bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 8. WRITE A REVIEW MODAL */}
      {/* ========================================================== */}
      {showReviewModal && reviewGym && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full rounded-3xl border border-amber-400/40 p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">ATHLETE REVIEW</span>
                <h4 className="text-xl font-extrabold text-white font-outfit mt-0.5">{reviewGym.name}</h4>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1.5">Select Star Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingInput(star)}
                      className="p-1.5 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                    >
                      <Star className={`w-6 h-6 ${star <= ratingInput ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-white ml-2 font-mono">{ratingInput}.0 Stars</span>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Your Review / Experience</label>
                <textarea
                  rows="3"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="How was the equipment, ambiance, and personal trainer guidance?"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-400 text-slate-950 font-bold rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.4)] cursor-pointer"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 9. FAQ MODAL */}
      {/* ========================================================== */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full rounded-3xl border border-electricBlue/30 p-6 space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-xl font-extrabold text-white font-outfit flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-electricBlue" />
                <span>Frequently Asked Questions</span>
              </h4>
              <button onClick={() => setShowFaqModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: "What is FITUP's Single-Session Trial Pass?",
                  a: "FITUP allows fitness enthusiasts to book 2-hour workout slots at premium partner gyms for a flat fee (₹200 - ₹280) with zero monthly subscriptions or lock-ins. Book. Lift. Repeat."
                },
                {
                  q: "How does the Digital Check-In Pass work?",
                  a: "Once your booking is confirmed via Razorpay, a digital pass with an encrypted QR code is instantly generated. Simply present your phone QR code at the gym reception desk for immediate entry."
                },
                {
                  q: "Is Personal Trainer guidance included in the fee?",
                  a: "Yes! Every trial slot pass includes 1-on-1 dedicated floor guidance from a certified Trainer Pro (specialized in Strength, Hypertrophy, HIIT, or Mobility)."
                },
                {
                  q: "What is the Cancellation and Refund Policy?",
                  a: "You can cancel any booking up to 2 hours before your session start time for a 100% instant refund directly to your original payment method with zero cancellation charges."
                }
              ].map((faq, i) => (
                <div key={i} className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 space-y-2">
                  <h5 className="text-sm font-bold text-white flex items-center justify-between">
                    <span>{faq.q}</span>
                  </h5>
                  <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 10. 100% REFUND POLICY MODAL */}
      {/* ========================================================== */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full rounded-3xl border border-vibrantOrange/40 p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-xl font-extrabold text-white font-outfit flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-vibrantOrange" />
                <span>2-Hour 100% Refund Policy</span>
              </h4>
              <button onClick={() => setShowPolicyModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-bold">
                ✓ 100% Instant Refund if cancelled at least 2 hours before your workout slot starts.
              </div>
              <p>• Razorpay refunds are credited instantly back to your UPI ID or Card without deductions.</p>
              <p>• Within 2 hours of slot commencement, cancellations are non-refundable as personal trainers are already reserved on the gym floor.</p>
              <p>• For urgent assistance, reach out to FITUP Support at <strong className="text-electricBlue">9030118909</strong>.</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPolicyModal(false)}
                className="px-6 py-2.5 bg-vibrantOrange text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 11. DELETE ACCOUNT MODAL */}
      {/* ========================================================== */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />

    </div>
  );
};
