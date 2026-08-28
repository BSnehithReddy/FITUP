import React, { useState, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';
import { soundEffects } from '../services/soundEffects';
import { SafeImage } from './SafeImage';
import { 
  Wallet, Building2, Clock, Users, ArrowUpRight, ShieldCheck, 
  CheckCircle2, AlertCircle, Dumbbell, UserCheck, RefreshCw
} from 'lucide-react';

export const TrainerDashboard = ({ trainerUser }) => {
  const [gyms, setGyms] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);

  // Withdrawal Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const loadData = () => {
    setGyms(firestoreService.getGymsSync());
    setTrainers(firestoreService.getTrainersSync());
    setBookings(firestoreService.getBookingsSync());
    setPayoutRequests(firestoreService.getPayoutRequestsSync());
  };

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener('fitup_data_sync', handleSync);
    return () => window.removeEventListener('fitup_data_sync', handleSync);
  }, []);

  // Find active trainer profile
  const currentTrainer = trainers.find(t => 
    (trainerUser?.phone && t.phone === trainerUser.phone) || 
    (trainerUser?.trainerId && t.trainerId === trainerUser.trainerId)
  ) || trainers[0] || {
    trainerId: 'tr-1',
    name: trainerUser?.name || 'Trainer Pro',
    gymId: 'gym-1',
    walletBalance: 450,
    specialization: 'Hypertrophy & Strength',
    experience: '7+ Years'
  };

  const belongingGym = gyms.find(g => g.gymId === currentTrainer.gymId) || {
    name: 'GS - Gym & Fitness Arena',
    location: 'Hitec City, Hyderabad'
  };

  // Assigned bookings for this trainer
  const myBookings = bookings.filter(b => b.trainerId === currentTrainer.trainerId);

  // My payout requests
  const myPayouts = payoutRequests.filter(p => p.trainerId === currentTrainer.trainerId);

  const showToast = (msg) => {
    soundEffects.playSuccessChime();
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    const amt = Number(withdrawAmount);

    if (!amt || amt <= 0) {
      alert("Please enter a valid withdrawal amount");
      return;
    }

    if (amt > (currentTrainer.walletBalance || 0)) {
      soundEffects.playError();
      alert("Insufficient wallet balance for withdrawal!");
      return;
    }

    try {
      await firestoreService.requestPayout(currentTrainer.trainerId, currentTrainer.name, amt);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      showToast(`Withdrawal request for ₹${amt} submitted! 12-Hour Approval Timer Started.`);
    } catch (err) {
      soundEffects.playError();
      alert(err.message || "Failed to process withdrawal request");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl font-bold shadow-[0_0_20px_#34d399] flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BELONGING GYM & TRAINER PROFILE HEADER */}
      <div className="glass-panel p-6 rounded-3xl border border-vibrantOrange/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-vibrantOrange/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-4 z-10">
          <SafeImage
            src={currentTrainer.image}
            alt={currentTrainer.name}
            fallbackType="trainer"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-vibrantOrange shadow-[0_0_15px_rgba(255,85,0,0.3)]"
          />

          <div>
            <span className="text-xs font-bold tracking-[0.25em] text-vibrantOrange uppercase flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" /> Certified Trainer Pro Portal
            </span>
            <h1 className="text-3xl font-extrabold text-white font-outfit mt-0.5">
              {currentTrainer.name}
            </h1>
            <p className="text-sm text-electricBlue font-semibold flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-4 h-4" />
              <span>Belonging Gym: <strong className="text-white font-outfit">{belongingGym.name}</strong> ({belongingGym.location})</span>
            </p>
          </div>
        </div>

        {/* TOP DIGITAL WALLET HERO SECTION */}
        <div className="bg-slate-900/90 border border-vibrantOrange/40 p-4 rounded-2xl flex items-center space-x-6 z-10 shadow-inner">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Available Digital Wallet</span>
            <div className="text-3xl font-black text-white font-outfit">
              ₹{currentTrainer.walletBalance || 0}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">75% Session Fee Earned</span>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              setShowWithdrawModal(true);
            }}
            className="px-5 py-3 bg-gradient-to-r from-vibrantOrange to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_15px_rgba(255,85,0,0.4)] hover:scale-105 transition-all flex items-center gap-1.5"
          >
            <Wallet className="w-4 h-4" /> Request Payout
          </button>
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
                    <span className="text-xs text-slate-400 block">75% Trainer Fee</span>
                    <span className="text-lg font-black text-emerald-400 font-outfit">₹{(b.amount || 200) * 0.75}</span>
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
                    {p.status}
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
                <label className="text-xs text-slate-300 block mb-1">Available Wallet Balance</label>
                <div className="text-2xl font-black text-emerald-400 font-outfit">
                  ₹{currentTrainer.walletBalance || 0}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Amount to Withdraw (₹)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 300"
                  max={currentTrainer.walletBalance || 0}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-vibrantOrange"
                />
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-vibrantOrange flex-shrink-0" />
                <span>Withdrawal requests take up to 12 hours for Owner approval & UPI transfer.</span>
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

    </div>
  );
};
