import React, { useState, useEffect, useMemo } from 'react';
import { firestoreService } from '../services/firestoreService';
import { soundEffects } from '../services/soundEffects';
import { SafeImage } from './SafeImage';
import { useAuth } from '../context/AuthContext';
import { DeleteAccountModal } from './DeleteAccountModal';
import { 
  Wallet, Building2, Clock, Users, ArrowUpRight, ShieldCheck, 
  CheckCircle2, AlertCircle, Dumbbell, UserCheck, RefreshCw, Trash2
} from 'lucide-react';

export const TrainerDashboard = () => {
  const { currentUser } = useAuth();
  const [gyms, setGyms] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

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

  const currentTrainer = useMemo(() => {
    if (!currentUser) return null;
    return trainers.find(t => t.trainerId === currentUser.trainerId || t.phone === currentUser.phone) || trainers[0];
  }, [trainers, currentUser]);

  const assignedGym = useMemo(() => {
    if (!currentTrainer) return null;
    return gyms.find(g => g.gymId === currentTrainer.gymId);
  }, [gyms, currentTrainer]);

  const myBookings = useMemo(() => {
    if (!currentTrainer) return [];
    return bookings.filter(b => b.trainerId === currentTrainer.trainerId);
  }, [bookings, currentTrainer]);

  const myPayouts = useMemo(() => {
    if (!currentTrainer) return [];
    return payoutRequests.filter(p => p.trainerId === currentTrainer.trainerId || (p.type === 'TRAINER' && p.beneficiaryName === currentTrainer.name));
  }, [payoutRequests, currentTrainer]);

  const totalEarnings = useMemo(() => {
    return myBookings.reduce((sum, b) => {
      if (b.status !== 'VERIFIED') return sum;
      return sum + (Number(b.trainerShare) || Math.round((Number(b.amount) || 280) * 0.50));
    }, 0);
  }, [myBookings]);

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    const amt = Number(withdrawAmount);

    if (!amt || amt <= 0) {
      alert("Please enter a valid withdrawal amount.");
      return;
    }

    const available = currentTrainer?.walletBalance || 0;
    if (amt > available) {
      soundEffects.playError();
      alert(`Insufficient wallet balance. You have ₹${available} available.`);
      return;
    }

    try {
      await firestoreService.requestTrainerPayout(
        currentTrainer.trainerId,
        currentTrainer.name,
        amt,
        upiIdInput || currentTrainer.upiId || "trainer@upi"
      );
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setUpiIdInput('');
      showToast(`Withdrawal of ₹${amt} requested! 12-Hour Approval Timer Started.`);
    } catch (err) {
      soundEffects.playError();
      alert(err.message || "Failed to submit withdrawal request.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center p-6">
        <div className="glass-panel p-8 rounded-3xl border border-vibrantOrange/30 text-center space-y-4 max-w-sm w-full">
          <div className="w-12 h-12 rounded-2xl bg-vibrantOrange/10 border border-vibrantOrange/30 text-vibrantOrange flex items-center justify-center mx-auto shadow-[0_0_15px_#ff5500] animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white font-outfit">Loading Trainer Portal...</h3>
          <p className="text-xs text-slate-400">Synchronizing client bookings & wallet</p>
        </div>
      </div>
    );
  }

  if (!currentTrainer) {
    return (
      <div className="min-h-[450px] flex items-center justify-center p-6">
        <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center space-y-4 max-w-md w-full">
          <Users className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-xl font-bold text-white font-outfit">Trainer Profile Not Found</h3>
          <p className="text-xs text-slate-400">Please contact Master Admin Snehith (9030118909) to register your trainer account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl font-bold shadow-[0_0_20px_#34d399] flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Trainer Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-vibrantOrange/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-vibrantOrange/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border border-vibrantOrange/30 shadow-[0_0_15px_rgba(255,85,0,0.3)]">
            <SafeImage
              src={currentTrainer.image}
              alt={currentTrainer.name}
              fallbackType="trainer"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-[0.25em] text-vibrantOrange uppercase flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Certified Trainer Pro
              </span>
              <span className="px-2 py-0.5 rounded-md bg-vibrantOrange/20 text-vibrantOrange text-[10px] font-mono font-bold">
                {currentTrainer.trainerSplitPercent || 50}% Session Share
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit mt-1">
              {currentTrainer.name}
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Assigned Facility: <strong className="text-white">{assignedGym?.name || 'Partner Gym'}</strong> ({assignedGym?.location || 'Hyderabad'})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => {
              soundEffects.playClick();
              setShowWithdrawModal(true);
            }}
            className="px-5 py-3 bg-gradient-to-r from-vibrantOrange to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_15px_rgba(255,85,0,0.4)] hover:scale-105 transition-all flex items-center gap-1.5"
          >
            <Wallet className="w-4 h-4" /> Request 12h Payout
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            title="Google Play Data Erasure"
            className="p-3 bg-slate-900 border border-white/10 hover:border-rose-500 text-slate-400 hover:text-rose-400 rounded-xl text-xs transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-3xl border border-vibrantOrange/30 bg-vibrantOrange/5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-vibrantOrange font-bold uppercase tracking-wider">Available Wallet Balance</span>
            <Wallet className="w-4 h-4 text-vibrantOrange" />
          </div>
          <div className="text-3xl font-black text-white font-outfit">₹{currentTrainer.walletBalance || 0}</div>
          <span className="text-[10px] text-slate-400 font-mono">Instant 12h owner settlement</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">Accumulated 50% Earnings</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white font-outfit">₹{totalEarnings}</div>
          <span className="text-[10px] text-emerald-400 font-mono">50% per completed session</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">Client Passes Booked</span>
            <Users className="w-4 h-4 text-electricBlue" />
          </div>
          <div className="text-3xl font-black text-white font-outfit">{myBookings.length} Sessions</div>
          <span className="text-[10px] text-electricBlue font-mono">Live trial bookings</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">Trainer Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-outfit">{currentTrainer.rating || 4.9} ⭐</div>
          <span className="text-[10px] text-slate-400 font-mono">{currentTrainer.specialization}</span>
        </div>
      </div>

      {/* ASSIGNED CLIENT BOOKING SLOTS & PAYOUT QUEUE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Booked Client Slots */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xl font-extrabold text-white font-outfit flex items-center gap-2">
            <Users className="w-5 h-5 text-electricBlue" />
            <span>Assigned Client Workout Slots ({myBookings.length})</span>
          </h3>

          {myBookings.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-3xl border border-white/10 space-y-2">
              <Dumbbell className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">No active client slot passes booked yet.</p>
              <p className="text-xs text-slate-400">When clients book your 2-hour workout slots, their passes will appear here in real-time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myBookings.map((b) => (
                <div 
                  key={b.bookingId}
                  className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4 hover:border-electricBlue/40 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-electricBlue">{b.bookingId}</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">VERIFIED PASS</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{b.userName || 'Client Member'}</h4>
                    <p className="text-xs text-vibrantOrange font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {b.slotTime}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">{b.trainerPercent || 50}% Trainer Fee</span>
                    <span className="text-lg font-black text-emerald-400 font-outfit">
                      +₹{b.trainerShare || Math.round((b.amount || 280) * 0.50)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payout Withdrawal Requests */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xl font-extrabold text-white font-outfit flex items-center gap-2">
            <Clock className="w-5 h-5 text-vibrantOrange" />
            <span>12-Hour Withdrawal Requests</span>
          </h3>

          {myPayouts.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-3xl border border-white/10">
              <p className="text-xs text-slate-400">No pending payout requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myPayouts.map((p) => (
                <div 
                  key={p.requestId}
                  className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-mono font-bold text-vibrantOrange">{p.requestId}</span>
                    <div className="text-base font-bold text-white">₹{p.amountRequested}</div>
                    <span className="text-[10px] text-slate-400">12-Hour Approval Process</span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                    p.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {p.status === 'APPROVED' ? 'Transferred ✓' : 'Processing (12h)'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* WITHDRAWAL MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full rounded-3xl border border-vibrantOrange/40 p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-extrabold text-white font-outfit">
                Request Wallet Payout
              </h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleWithdrawRequest} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Available 50% Balance</label>
                <div className="text-2xl font-black text-emerald-400 font-outfit">
                  ₹{currentTrainer.walletBalance || 0}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Amount to Withdraw (₹)</label>
                <input
                  type="number"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 300"
                  max={currentTrainer.walletBalance || 0}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-vibrantOrange"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Your Receiving UPI ID</label>
                <input
                  type="text"
                  required
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  placeholder={currentTrainer.upiId || "e.g. trainer@upi"}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-vibrantOrange"
                />
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-vibrantOrange flex-shrink-0" />
                <span>Withdrawal requests take up to 12 hours for Master Admin approval & UPI transfer.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 text-slate-400 text-xs hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-vibrantOrange text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_15px_#ff5500]"
                >
                  Submit Payout Request
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
