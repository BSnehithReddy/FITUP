import React, { useState, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';
import { soundEffects } from '../services/soundEffects';
import { Wallet, Clock, Calendar, ArrowUpRight, CheckCircle, Hourglass, Plus, Building2, User, Sparkles } from 'lucide-react';

export const TrainerDashboard = () => {
  const { currentUser } = useAuth();
  
  const [trainerProfile, setTrainerProfile] = useState(null);
  const [belongingGym, setBelongingGym] = useState(null);
  const [assignedBookings, setAssignedBookings] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  
  // Withdrawal Form State
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

  // Timings State
  const [availableTimings, setAvailableTimings] = useState([]);
  const [newTimingInput, setNewTimingInput] = useState('');
  const [timingMsg, setTimingMsg] = useState('');

  useEffect(() => {
    loadTrainerData();
  }, [currentUser]);

  const loadTrainerData = async () => {
    if (!currentUser) return;
    
    const trainersData = await firestoreService.getTrainers();
    const matched = trainersData.find(t => t.trainerId === currentUser.trainerId || t.phone === currentUser.phone);
    
    if (matched) {
      setTrainerProfile(matched);
      setAvailableTimings(matched.availableTimings || []);

      // Fetch belonging gym
      const gym = await firestoreService.getGymById(matched.gymId);
      setBelongingGym(gym);
    }

    const allBookings = await firestoreService.getBookings();
    const trainerBookings = allBookings.filter(b => b.trainerId === matched?.trainerId || b.trainerName === matched?.name || b.trainerName === currentUser.name);
    setAssignedBookings(trainerBookings);

    const allPayouts = await firestoreService.getPayoutRequests();
    const trainerPayouts = allPayouts.filter(p => p.trainerId === matched?.trainerId || p.trainerName === matched?.name || p.trainerName === currentUser.name);
    setPayoutRequests(trainerPayouts);
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    setWithdrawError('');
    setWithdrawSuccess('');

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      soundEffects.playError();
      setWithdrawError('Please enter a valid positive withdrawal amount.');
      return;
    }

    if (!trainerProfile || (trainerProfile.walletBalance || 0) < amount) {
      soundEffects.playError();
      setWithdrawError('Insufficient wallet balance for withdrawal request.');
      return;
    }

    try {
      await firestoreService.requestPayout(trainerProfile.trainerId, trainerProfile.name, amount);
      soundEffects.playSuccessChime();
      setWithdrawSuccess(`Payout request for ₹${amount} submitted! 12-hour processing window logged.`);
      setWithdrawAmount('');
      loadTrainerData();
      setTimeout(() => setWithdrawModalOpen(false), 2000);
    } catch (err) {
      soundEffects.playError();
      setWithdrawError(err.message || 'Failed to submit withdrawal request.');
    }
  };

  const handleSaveTimings = async () => {
    soundEffects.playClick();
    if (!trainerProfile) return;
    setTimingMsg('');
    const updated = {
      ...trainerProfile,
      availableTimings
    };
    await firestoreService.saveTrainer(updated);
    setTrainerProfile(updated);
    soundEffects.playSuccessChime();
    setTimingMsg('Working hours updated successfully! ✅');
    setTimeout(() => setTimingMsg(''), 3000);
  };

  const handleAddTimingSlot = () => {
    soundEffects.playClick();
    if (!newTimingInput.trim()) return;
    if (!availableTimings.includes(newTimingInput.trim())) {
      setAvailableTimings([...availableTimings, newTimingInput.trim()]);
      setNewTimingInput('');
    }
  };

  const handleRemoveTimingSlot = (index) => {
    soundEffects.playClick();
    const updated = availableTimings.filter((_, i) => i !== index);
    setAvailableTimings(updated);
  };

  // Calculate earnings stats
  const totalSessionsCompleted = assignedBookings.length;
  const totalGrossRevenue = assignedBookings.reduce((sum, b) => sum + (b.amount || 200), 0);
  const totalTrainerEarnings = totalGrossRevenue * 0.75; // 75% Split

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* 1. TOP HEADER & BELONGING GYM BADGE */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-vibrantOrange/30 shadow-[0_0_40px_rgba(255,85,0,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-vibrantOrange uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>TRAINER PORTAL</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white font-outfit">
            {trainerProfile?.name || currentUser?.name}
          </h1>

          {belongingGym && (
            <div className="flex items-center space-x-2 mt-2 text-sm text-slate-300">
              <Building2 className="w-4 h-4 text-electricBlue" />
              <span className="font-semibold text-white">Belonging Gym:</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-electricBlue/10 text-electricBlue font-bold border border-electricBlue/30">
                {belongingGym.name} ({belongingGym.location})
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => { soundEffects.playClick(); setWithdrawModalOpen(true); }}
          className="px-6 py-3 bg-gradient-to-r from-vibrantOrange to-amber-500 hover:from-amber-500 hover:to-vibrantOrange text-slate-950 font-bold rounded-xl shadow-[0_0_25px_rgba(255,85,0,0.4)] hover:scale-105 transition-all text-sm flex items-center justify-center space-x-2"
        >
          <Wallet className="w-4 h-4" />
          <span>Request Payout</span>
        </button>
      </div>

      {/* 2. DIGITAL WALLET HERO SECTION RIGHT AT TOP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Wallet Balance Hero Card */}
        <div className="glass-card p-6 rounded-2xl border border-vibrantOrange/50 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-vibrantOrange/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-vibrantOrange">Digital Wallet Balance</span>
            <div className="w-10 h-10 rounded-xl bg-vibrantOrange/20 border border-vibrantOrange/40 text-vibrantOrange flex items-center justify-center shadow-[0_0_15px_rgba(255,85,0,0.3)]">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          
          <div className="text-4xl font-black text-white font-outfit mb-1 drop-shadow-[0_0_10px_rgba(255,85,0,0.3)]">
            ₹{(trainerProfile?.walletBalance || 0).toLocaleString()}
          </div>
          <p className="text-xs text-slate-300 font-medium">Auto-debited on payout request with 12-hr window</p>
        </div>

        {/* 75% Split Total Earnings Card */}
        <div className="glass-card p-6 rounded-2xl border border-electricBlue/50 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-electricBlue/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-electricBlue">Lifetime Earnings (75% Split)</span>
            <div className="w-10 h-10 rounded-xl bg-electricBlue/20 border border-electricBlue/40 text-electricBlue flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          
          <div className="text-4xl font-black text-electricBlue font-outfit mb-1 drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            ₹{totalTrainerEarnings.toLocaleString()}
          </div>
          <p className="text-xs text-slate-300">75% automatic split per session (₹150 / ₹200 slot)</p>
        </div>

        {/* Total Sessions Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Client Sessions</span>
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 text-white flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          
          <div className="text-4xl font-black text-white font-outfit mb-1">
            {totalSessionsCompleted}
          </div>
          <p className="text-xs text-slate-400">Booked & verified PT slots</p>
        </div>

      </div>

      {/* 3. ASSIGNED CLIENT SLOTS & TIMING MANAGER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Assigned Booked Client Slots List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-white font-outfit">Assigned Booked Client Slots</h2>

          {assignedBookings.length === 0 ? (
            <div className="glass-card p-8 text-center rounded-2xl">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No client slots currently assigned.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignedBookings.map(b => (
                <div key={b.bookingId} className="glass-card p-5 rounded-2xl border border-white/10 hover:border-electricBlue/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-electricBlue font-bold bg-electricBlue/10 px-2 py-0.5 rounded border border-electricBlue/30">
                        #{b.bookingId}
                      </span>
                      <h4 className="text-base font-bold text-white">{b.userName}</h4>
                    </div>

                    <p className="text-xs text-slate-400">
                      Phone: <span className="text-slate-200 font-mono">{b.userPhone}</span> • Gym: <span className="text-slate-200 font-semibold">{b.gymName}</span>
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-slate-300 pt-1">
                      <span className="flex items-center"><Calendar className="w-3.5 h-3.5 text-vibrantOrange mr-1" />{b.date}</span>
                      <span className="flex items-center"><Clock className="w-3.5 h-3.5 text-electricBlue mr-1" />{b.slotTime}</span>
                    </div>
                  </div>

                  <div className="text-right flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      75% Split: +₹{(b.amount || 200) * 0.75}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1">Ref UTR: {b.txnId}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Working Hours & Timing Requests Manager */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6 h-fit">
          <div>
            <h3 className="text-lg font-bold text-white font-outfit">Working Hours & Timings</h3>
            <p className="text-xs text-slate-400 mt-1">Manage your available 2-hour workout time slots</p>
          </div>

          {timingMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              {timingMsg}
            </div>
          )}

          <div className="space-y-2">
            {availableTimings.map((slot, index) => (
              <div key={index} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-white/5 text-xs text-slate-200">
                <span className="font-mono">{slot}</span>
                <button 
                  onClick={() => handleRemoveTimingSlot(index)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Add New Slot Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 05:00 PM - 07:00 PM"
              value={newTimingInput}
              onChange={(e) => setNewTimingInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electricBlue font-mono"
            />
            <button
              onClick={handleAddTimingSlot}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              Add
            </button>
          </div>

          <button
            onClick={handleSaveTimings}
            className="w-full py-2.5 bg-electricBlue/10 hover:bg-electricBlue text-electricBlue hover:text-slate-950 border border-electricBlue/40 rounded-xl font-bold text-xs transition-all"
          >
            Save Available Timings
          </button>
        </div>

      </div>

      {/* 4. WITHDRAWAL REQUESTS HISTORY TABLE */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
        <h2 className="text-xl font-bold text-white font-outfit">Withdrawal Requests & 12-Hour Status Log</h2>

        {payoutRequests.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-4">No payout requests submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">Request ID</th>
                  <th className="p-3">Amount Requested</th>
                  <th className="p-3">Requested At</th>
                  <th className="p-3">12-Hour Processing Window</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payoutRequests.map(req => {
                  const availableTime = new Date(req.availableAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <tr key={req.requestId} className="hover:bg-slate-900/50">
                      <td className="p-3 font-mono font-bold text-electricBlue">#{req.requestId}</td>
                      <td className="p-3 font-bold text-white">₹{req.amountRequested}</td>
                      <td className="p-3 text-slate-400">{new Date(req.requestedAt).toLocaleDateString()} {new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="p-3 text-vibrantOrange font-mono flex items-center">
                        <Hourglass className="w-3.5 h-3.5 mr-1" />
                        Available by {availableTime}
                      </td>
                      <td className="p-3">
                        {req.status === 'APPROVED' ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                            APPROVED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                            12-HR PROCESSING
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* WITHDRAWAL MODAL */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-vibrantOrange/40 rounded-2xl p-6 shadow-2xl space-y-4">
            
            <h3 className="text-xl font-bold text-white font-outfit">Request Wallet Withdrawal</h3>
            <p className="text-xs text-slate-400">
              Available Digital Wallet Balance: <strong className="text-vibrantOrange">₹{trainerProfile?.walletBalance || 0}</strong>
            </p>

            {withdrawError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                {withdrawError}
              </div>
            )}

            {withdrawSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                {withdrawSuccess}
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Amount to Withdraw (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={trainerProfile?.walletBalance || 0}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 300"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-vibrantOrange font-mono"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 text-[11px] text-slate-400 space-y-1">
                <div>• Auto-debits your digital wallet balance immediately.</div>
                <div>• Initiates a mandatory 12-hour payout window for Owner Snehith's approval.</div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { soundEffects.playClick(); setWithdrawModalOpen(false); }}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-vibrantOrange to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
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
