import React, { useState, useEffect, useMemo } from 'react';
import { firestoreService } from '../services/firestoreService';
import { soundEffects } from '../services/soundEffects';
import { SafeImage } from './SafeImage';
import { useAuth } from '../context/AuthContext';
import { DeleteAccountModal } from './DeleteAccountModal';
import { 
  Building2, Wallet, Users, Clock, CheckCircle2, AlertCircle, 
  ArrowUpRight, Dumbbell, Star, RefreshCw, QrCode, DollarSign,
  TrendingUp, Activity, ShieldCheck, Trash2, Edit3, Plus, 
  Share2, Instagram, Globe, Phone, MapPin, Check, X
} from 'lucide-react';

export const GymOwnerDashboard = () => {
  const { currentUser } = useAuth();
  
  const [gyms, setGyms] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Forms
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditGymModal, setShowEditGymModal] = useState(false);
  const [showAddTrainerModal, setShowAddTrainerModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Edit Facility Form State
  const [editGymName, setEditGymName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editAmenities, setEditAmenities] = useState([]);
  const [editInstagram, setEditInstagram] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editWebsite, setEditWebsite] = useState('');

  // Add Trainer Form State
  const [trainerName, setTrainerName] = useState('');
  const [trainerPhone, setTrainerPhone] = useState('');
  const [trainerSpecialization, setTrainerSpecialization] = useState('Strength & Conditioning');
  const [trainerExperience, setTrainerExperience] = useState('4+ Years • Certified Trainer');
  const [trainerSplitPercent, setTrainerSplitPercent] = useState(50);
  const [trainerImage, setTrainerImage] = useState('https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80');
  const [trainerTimings, setTrainerTimings] = useState('06:00 AM - 08:00 AM, 09:00 AM - 11:00 AM, 04:00 PM - 06:00 PM, 06:00 PM - 08:00 PM');

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
    } catch (e) {
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
    const unsubPayouts = firestoreService.subscribePayoutRequests ? firestoreService.subscribePayoutRequests((data) => {
      if (isMounted && Array.isArray(data)) setPayoutRequests(data);
    }) : () => {};

    const handleSync = () => {
      if (!isMounted) return;
      setGyms(firestoreService.getGymsSync() || []);
      setTrainers(firestoreService.getTrainersSync() || []);
      setBookings(firestoreService.getBookingsSync() || []);
      setPayoutRequests(firestoreService.getPayoutRequestsSync() || []);
    };

    window.addEventListener('fitup_data_sync', handleSync);
    return () => {
      isMounted = false;
      if (typeof unsubGyms === 'function') unsubGyms();
      if (typeof unsubTrainers === 'function') unsubTrainers();
      if (typeof unsubBookings === 'function') unsubBookings();
      if (typeof unsubPayouts === 'function') unsubPayouts();
      window.removeEventListener('fitup_data_sync', handleSync);
    };
  }, []);

  const showToast = (msg) => {
    soundEffects.playSuccessChime();
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Find Gym belonging to current logged-in Gym Owner
  const myGym = useMemo(() => {
    if (!currentUser) return null;
    return gyms.find(g => g.gymId === currentUser.gymId || g.ownerPhone === currentUser.phone || g.ownerEmail === currentUser.email) || gyms[0];
  }, [gyms, currentUser]);

  // Sync edit form with current gym data when modal opens
  useEffect(() => {
    if (myGym) {
      setEditGymName(myGym.name || '');
      setEditLocation(myGym.location || '');
      setEditAddress(myGym.address || '');
      setEditImage(myGym.image || '');
      setEditAmenities(myGym.amenities || ['AC', 'Free Locker', 'Steam Bath']);
      setEditInstagram(myGym.socialHandles?.instagram || '');
      setEditWhatsapp(myGym.socialHandles?.whatsapp || myGym.ownerPhone || '');
      setEditWebsite(myGym.socialHandles?.website || '');
      if (!upiIdInput) setUpiIdInput(myGym.ownerUpiId || `${myGym.ownerPhone || 'owner'}@upi`);
    }
  }, [myGym]);

  // Filter Bookings strictly for this Gym
  const myGymBookings = useMemo(() => {
    if (!myGym) return [];
    return bookings.filter(b => b.gymId === myGym.gymId);
  }, [bookings, myGym]);

  // Filter Trainers assigned to this Gym
  const myGymTrainers = useMemo(() => {
    if (!myGym) return [];
    return trainers.filter(t => t.gymId === myGym.gymId);
  }, [trainers, myGym]);

  // Filter Payout Requests made by this Gym Owner
  const myPayouts = useMemo(() => {
    if (!myGym) return [];
    return payoutRequests.filter(p => p.gymId === myGym.gymId || (p.type === 'GYM_OWNER' && p.ownerPhone === currentUser?.phone));
  }, [payoutRequests, myGym, currentUser]);

  // Calculate Financials for this specific gym
  const totalGymGross = useMemo(() => {
    return myGymBookings.reduce((sum, b) => b.status === 'VERIFIED' ? sum + (Number(b.amount) || 280) : sum, 0);
  }, [myGymBookings]);

  const totalGymShareEarned = useMemo(() => {
    return myGymBookings.reduce((sum, b) => {
      if (b.status !== 'VERIFIED') return sum;
      return sum + (Number(b.gymShare) || Math.round((Number(b.amount) || 280) * 0.30));
    }, 0);
  }, [myGymBookings]);

  // Save Gym Facility Updates
  const handleSaveGymProfile = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    if (!editGymName.trim()) {
      alert("Please provide a valid Gym Name.");
      return;
    }

    try {
      const updatedGym = {
        ...myGym,
        name: editGymName.trim(),
        location: editLocation.trim(),
        address: editAddress.trim(),
        image: editImage.trim() || myGym.image,
        amenities: editAmenities,
        socialHandles: {
          instagram: editInstagram.trim(),
          whatsapp: editWhatsapp.trim(),
          website: editWebsite.trim()
        }
      };

      await firestoreService.saveGym(updatedGym);
      setShowEditGymModal(false);
      showToast("Gym Facility Profile & Social Handles Updated!");
    } catch (err) {
      soundEffects.playError();
      alert(err.message || "Failed to update facility profile.");
    }
  };

  // Add New Trainer
  const handleAddTrainer = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    if (!trainerName.trim()) {
      alert("Please enter trainer's name.");
      return;
    }
    const cleanPhone = trainerPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      alert("Please enter a valid 10-digit mobile number for the trainer.");
      return;
    }

    try {
      const timingsArray = trainerTimings
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const newTrainer = {
        trainerId: 'tr-' + Date.now(),
        gymId: myGym.gymId,
        gymName: myGym.name,
        name: trainerName.trim(),
        phone: cleanPhone,
        password: "Trainer@123",
        upiId: `${cleanPhone}@upi`,
        walletBalance: 0,
        commissionPercentage: Number(trainerSplitPercent) || 50,
        trainerSplitPercent: Number(trainerSplitPercent) || 50,
        specialization: trainerSpecialization.trim(),
        experience: trainerExperience.trim(),
        rating: 5.0,
        price: myGym.startingPrice || 280,
        image: trainerImage.trim(),
        availableTimings: timingsArray.length > 0 ? timingsArray : ["06:00 AM - 08:00 AM", "04:00 PM - 06:00 PM", "06:00 PM - 08:00 PM"]
      };

      await firestoreService.saveTrainer(newTrainer);
      setShowAddTrainerModal(false);
      setTrainerName('');
      setTrainerPhone('');
      showToast(`Trainer ${newTrainer.name} registered with ${newTrainer.trainerSplitPercent}% revenue split!`);
    } catch (err) {
      soundEffects.playError();
      alert(err.message || "Failed to add trainer.");
    }
  };

  // Delete Trainer
  const handleDeleteTrainer = async (trainerId, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from your gym roster?`)) {
      soundEffects.playClick();
      await firestoreService.deleteTrainer(trainerId);
      showToast(`Trainer ${name} removed.`);
    }
  };

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    const amt = Number(withdrawAmount);

    if (!amt || amt <= 0) {
      alert("Please enter a valid withdrawal amount.");
      return;
    }

    if (!upiIdInput || !upiIdInput.includes('@')) {
      alert("Please enter a valid UPI ID (e.g. 9123456780@upi).");
      return;
    }

    const available = myGym?.walletBalance || 0;
    if (amt > available) {
      soundEffects.playError();
      alert(`Insufficient balance. Your available 30% wallet balance is ₹${available}`);
      return;
    }

    try {
      await firestoreService.requestGymOwnerPayout(
        myGym.gymId,
        myGym.name,
        myGym.ownerName || currentUser.name,
        currentUser.phone || myGym.ownerPhone,
        amt,
        upiIdInput
      );
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      showToast(`Withdrawal of ₹${amt} requested! Processing in 24-48 hours.`);
    } catch (err) {
      soundEffects.playError();
      alert(err.message || "Failed to submit withdrawal request.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center p-6">
        <div className="glass-panel p-8 rounded-3xl border border-emerald-400/30 text-center space-y-4 max-w-sm w-full">
          <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_15px_#34d399] animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white font-outfit">Loading Partner Gym Portal...</h3>
          <p className="text-xs text-slate-400">Synchronizing facility bookings & wallet</p>
        </div>
      </div>
    );
  }

  if (!myGym) {
    return (
      <div className="min-h-[450px] flex items-center justify-center p-6">
        <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center space-y-4 max-w-md w-full">
          <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-xl font-bold text-white font-outfit">Gym Profile Not Assigned</h3>
          <p className="text-xs text-slate-400">Please contact Master Admin Snehith (9030118909) to link your partner facility.</p>
        </div>
      </div>
    );
  }

  const commonAmenitiesList = ["AC", "Free Locker", "Steam Bath", "Shower", "Protein Bar", "Cardio Zone", "Crossfit Deck", "Valet Parking", "Sauna"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl font-bold shadow-[0_0_20px_#34d399] flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Gym Owner Portal Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-400/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border border-emerald-400/30 shadow-[0_0_15px_rgba(52,211,153,0.3)] flex-shrink-0">
            <SafeImage
              src={myGym.image}
              alt={myGym.name}
              fallbackType="gym"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-[0.25em] text-emerald-400 uppercase flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Partner Gym Facility
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-400 text-[10px] font-mono font-bold">
                {myGym.gymSplitPercent || 30}% Revenue Share
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit mt-1">
              {myGym.name}
            </h1>
            <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-2 flex-wrap">
              <span>Owner: <strong className="text-white">{myGym.ownerName || currentUser.name}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-400" /> {myGym.location}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => { soundEffects.playClick(); setShowEditGymModal(true); }}
            className="px-4 py-2.5 bg-slate-900 border border-white/10 hover:border-emerald-400 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4 text-emerald-400" /> Edit Facility
          </button>

          <button
            onClick={() => { soundEffects.playClick(); setShowWithdrawModal(true); }}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_20px_#34d399] hover:scale-105 transition-all flex items-center gap-1.5 border border-emerald-300"
          >
            <Wallet className="w-4 h-4" /> Withdraw ₹{myGym.walletBalance || 0}
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

      {/* Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Available Wallet Balance */}
        <div className="glass-panel p-5 rounded-3xl border border-emerald-400/30 bg-emerald-500/5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Available Wallet Balance</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white font-outfit">₹{myGym.walletBalance || 0}</div>
          <span className="text-[10px] text-slate-400 font-mono">Ready for 24-48h UPI withdrawal</span>
        </div>

        {/* Total Gym Gross */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">Facility Booking Volume</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-white font-outfit">₹{totalGymGross}</div>
          <span className="text-[10px] text-electricBlue font-mono">{myGymBookings.length} Total Passes Booked</span>
        </div>

        {/* Total 30% Earnings */}
        <div className="glass-panel p-5 rounded-3xl border border-emerald-400/30 bg-emerald-500/5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-emerald-400 font-bold">Accumulated 30% Share</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white font-outfit">₹{totalGymShareEarned}</div>
          <span className="text-[10px] text-slate-400 font-mono">30% per trial workout slot</span>
        </div>

        {/* Certified Trainers */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">Certified Trainers</span>
            <Users className="w-4 h-4 text-vibrantOrange" />
          </div>
          <div className="text-3xl font-black text-white font-outfit">{myGymTrainers.length} Pros</div>
          <span className="text-[10px] text-amber-400 font-mono">⭐ {myGym.rating || 5.0} Score ({myGym.reviewCount || 0} Reviews)</span>
        </div>

      </div>

      {/* MAIN TWO COLUMN GRID: BOOKINGS LEDGER + TRAINER MANAGEMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Real-Time Transaction Ledger */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Facility Session Ledger ({myGymBookings.length})</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live Cloud Firestore Feed</span>
          </div>

          {myGymBookings.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-3xl border border-white/10 space-y-2">
              <Dumbbell className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">No trial workout passes booked at your facility yet.</p>
              <p className="text-xs text-slate-400">When users book 2-hour workout slots at {myGym.name}, your 30% revenue share will appear here instantly.</p>
            </div>
          ) : (
            <div className="overflow-x-auto glass-panel rounded-3xl border border-white/10 p-4">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3 rounded-l-xl">Pass ID</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Slot Time</th>
                    <th className="p-3">Trainer</th>
                    <th className="p-3">Total (₹)</th>
                    <th className="p-3 rounded-r-xl">Your 30% Share (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {myGymBookings.map((b) => (
                    <tr key={b.bookingId} className="hover:bg-slate-900/50">
                      <td className="p-3 font-mono font-bold text-emerald-400">{b.bookingId}</td>
                      <td className="p-3">
                        <div className="font-bold text-white">{b.userName || 'Client'}</div>
                        <div className="text-[10px] text-slate-400">{b.userPhone || ''}</div>
                      </td>
                      <td className="p-3 text-slate-300 font-mono">{b.slotTime}</td>
                      <td className="p-3 text-vibrantOrange font-medium">{b.trainerName}</td>
                      <td className="p-3 font-bold text-white">₹{b.amount || 280}</td>
                      <td className="p-3 font-black text-emerald-400 font-mono">
                        +₹{b.gymShare || Math.round((b.amount || 280) * 0.30)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Assigned Trainers & Facility Info */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Trainer Roster */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
                <Users className="w-5 h-5 text-vibrantOrange" />
                <span>Trainer Roster ({myGymTrainers.length})</span>
              </h3>

              <button
                onClick={() => { soundEffects.playClick(); setShowAddTrainerModal(true); }}
                className="px-3 py-1.5 bg-vibrantOrange/10 border border-vibrantOrange/30 text-vibrantOrange hover:bg-vibrantOrange hover:text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Trainer
              </button>
            </div>

            {myGymTrainers.length === 0 ? (
              <div className="glass-panel p-6 text-center rounded-2xl border border-white/5 space-y-2">
                <Users className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No trainers added yet. Click "+ Add Trainer" to add certified trainers to your facility.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myGymTrainers.map((t) => (
                  <div 
                    key={t.trainerId}
                    className="glass-panel p-3.5 rounded-2xl border border-white/10 flex items-center justify-between gap-3 hover:border-vibrantOrange/40 transition-all"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <SafeImage
                        src={t.image}
                        alt={t.name}
                        fallbackType="trainer"
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-white truncate">{t.name}</h4>
                        <p className="text-[11px] text-vibrantOrange truncate">{t.specialization}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Share: <strong className="text-emerald-400">{t.trainerSplitPercent || 50}%</strong> • {t.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteTrainer(t.trainerId, t.name)}
                        title="Remove Trainer"
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Social Media & Handles Card */}
          <div className="glass-panel p-4 rounded-3xl border border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-white font-outfit flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-electricBlue" /> Social Handles
              </span>
              <button 
                onClick={() => setShowEditGymModal(true)} 
                className="text-[10px] text-electricBlue hover:underline"
              >
                Edit
              </button>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="flex items-center gap-2 text-slate-400">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" /> Instagram
                </span>
                <span className="text-white font-mono text-[11px]">
                  {myGym.socialHandles?.instagram ? `@${myGym.socialHandles.instagram.replace('@', '')}` : 'Not linked'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp
                </span>
                <span className="text-white font-mono text-[11px]">
                  {myGym.socialHandles?.whatsapp || myGym.ownerPhone || 'Not linked'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="flex items-center gap-2 text-slate-400">
                  <Globe className="w-3.5 h-3.5 text-electricBlue" /> Website
                </span>
                <span className="text-white font-mono text-[11px] truncate max-w-[150px]">
                  {myGym.socialHandles?.website || 'Not linked'}
                </span>
              </div>
            </div>
          </div>

          {/* 24-48 Hour Payout Queue for this Gym */}
          <div className="glass-panel p-4 rounded-3xl border border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-white font-outfit flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Withdrawal Queue & Status</span>
            </h4>

            {myPayouts.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">No payout requests in processing.</p>
            ) : (
              <div className="space-y-2">
                {myPayouts.map((p) => (
                  <div key={p.requestId} className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-[10px] text-emerald-400 font-bold block">{p.requestId}</span>
                      <span className="text-white font-bold">₹{p.amountRequested}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      p.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {p.status === 'APPROVED' ? 'Transferred ✓' : 'Pending Payout (24-48h)'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* MODAL 1: EDIT FACILITY PROFILE & SOCIAL HANDLES */}
      {/* ========================================================= */}
      {showEditGymModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full rounded-3xl border border-emerald-400/40 p-6 space-y-4 shadow-2xl relative my-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-extrabold text-white font-outfit flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>Edit Gym Facility Profile</span>
              </h3>
              <button onClick={() => setShowEditGymModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveGymProfile} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Gym Name</label>
                <input
                  type="text"
                  required
                  value={editGymName}
                  onChange={(e) => setEditGymName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Area / Location</label>
                  <input
                    type="text"
                    required
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Full Address</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Gym Photo URL</label>
                <input
                  type="url"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-400"
                />
              </div>

              {/* Amenities Selector */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">Amenities</label>
                <div className="flex flex-wrap gap-1.5">
                  {commonAmenitiesList.map((amenity) => {
                    const isSelected = editAmenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => {
                          if (isSelected) {
                            setEditAmenities(editAmenities.filter(a => a !== amenity));
                          } else {
                            setEditAmenities([...editAmenities, amenity]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSelected 
                            ? 'bg-emerald-400 text-slate-950 font-bold' 
                            : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {amenity} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Social Handles */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <span className="text-[11px] font-bold text-slate-300 block">Social Media Handles</span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-400 text-[10px] block mb-1">Instagram (@)</label>
                    <input
                      type="text"
                      value={editInstagram}
                      onChange={(e) => setEditInstagram(e.target.value)}
                      placeholder="gsfitness"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-[10px] block mb-1">WhatsApp</label>
                    <input
                      type="tel"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value)}
                      placeholder="9123456780"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-[10px] block mb-1">Website</label>
                    <input
                      type="text"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditGymModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-[0_0_15px_#34d399]"
                >
                  Save Facility Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ADD TRAINER MODAL (WITH CUSTOM SPLIT %) */}
      {/* ========================================================= */}
      {showAddTrainerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full rounded-3xl border border-vibrantOrange/40 p-6 space-y-4 shadow-2xl relative my-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-extrabold text-white font-outfit flex items-center gap-2">
                <Users className="w-5 h-5 text-vibrantOrange" />
                <span>Register Certified Trainer</span>
              </h3>
              <button onClick={() => setShowAddTrainerModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddTrainer} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Trainer Full Name</label>
                <input
                  type="text"
                  required
                  value={trainerName}
                  onChange={(e) => setTrainerName(e.target.value)}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-vibrantOrange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Trainer Mobile</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={trainerPhone}
                    onChange={(e) => setTrainerPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9030118909"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-vibrantOrange font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Trainer Revenue Split: <strong className="text-emerald-400">{trainerSplitPercent}%</strong>
                  </label>
                  <input
                    type="range"
                    min={30}
                    max={70}
                    step={5}
                    value={trainerSplitPercent}
                    onChange={(e) => setTrainerSplitPercent(Number(e.target.value))}
                    className="w-full accent-vibrantOrange mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Specialization</label>
                  <input
                    type="text"
                    required
                    value={trainerSpecialization}
                    onChange={(e) => setTrainerSpecialization(e.target.value)}
                    placeholder="e.g. Hypertrophy & Fat Loss"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-vibrantOrange"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Experience / Certification</label>
                  <input
                    type="text"
                    required
                    value={trainerExperience}
                    onChange={(e) => setTrainerExperience(e.target.value)}
                    placeholder="e.g. 5+ Years • ACE Certified"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-vibrantOrange"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Available 2-Hour Slot Timings (Comma separated)</label>
                <input
                  type="text"
                  value={trainerTimings}
                  onChange={(e) => setTrainerTimings(e.target.value)}
                  placeholder="06:00 AM - 08:00 AM, 09:00 AM - 11:00 AM, 04:00 PM - 06:00 PM, 06:00 PM - 08:00 PM"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTrainerModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-vibrantOrange text-slate-950 font-bold rounded-xl shadow-[0_0_15px_#ff5500]"
                >
                  Register Trainer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: WITHDRAWAL MODAL */}
      {/* ========================================================= */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full rounded-3xl border border-emerald-400/40 p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-extrabold text-white font-outfit flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <span>Withdraw Gym Share</span>
              </h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleWithdrawRequest} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Available 30% Accumulated Balance</label>
                <div className="text-3xl font-black text-emerald-400 font-outfit">
                  ₹{myGym.walletBalance || 0}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Amount to Withdraw (₹)</label>
                <input
                  type="number"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 500"
                  max={myGym.walletBalance || 0}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Receiving UPI ID or Bank Account</label>
                <input
                  type="text"
                  required
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  placeholder="e.g. 9123456780@upi"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5 text-[11px] text-slate-400 flex items-start gap-2">
                <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Settlement Window:</strong> Payout requests are verified and settled to your UPI address within <strong>24 to 48 hours</strong> by Master Admin Snehith.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-[0_0_15px_#34d399]"
                >
                  Submit Withdrawal Request
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
