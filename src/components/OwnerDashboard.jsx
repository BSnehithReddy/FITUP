import React, { useState, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';
import { soundEffects } from '../services/soundEffects';
import { 
  ShieldCheck, Dumbbell, UserCheck, QrCode, TrendingUp, DollarSign, 
  Hourglass, CheckCircle2, Plus, Edit2, Trash2, X, Save, Clock, Building2, Image as ImageIcon, Sparkles, Check
} from 'lucide-react';

export const OwnerDashboard = () => {
  const { currentUser } = useAuth();
  
  const [gyms, setGyms] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [ownerConfig, setOwnerConfig] = useState({
    ownerUpiId: '9030118909@ybl',
    ownerPhone: '9030118909',
    ownerQrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=9030118909@ybl&pn=FITUP%20Owner&am=200&cu=INR'
  });

  const [activeTab, setActiveTab] = useState('gyms');
  const [toastMsg, setToastMsg] = useState('');

  // Config Update State
  const [upiIdInput, setUpiIdInput] = useState('');
  const [qrUrlInput, setQrUrlInput] = useState('');
  const [configMsg, setConfigMsg] = useState('');

  // Presets
  const gymImagePresets = [
    { label: "Modern Arena", url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80" },
    { label: "Pulse Club", url: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80" },
    { label: "Heavy Iron", url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80" },
    { label: "CrossFit Zone", url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80" }
  ];

  const trainerImagePresets = [
    { label: "Strength Coach", url: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80" },
    { label: "HIIT Specialist", url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=400&q=80" },
    { label: "Mobility Coach", url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80" },
    { label: "Power Coach", url: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=400&q=80" }
  ];

  const defaultSlotOptions = [
    "06:00 AM - 08:00 AM",
    "09:00 AM - 11:00 AM",
    "11:00 AM - 01:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM",
    "06:00 PM - 08:00 PM",
    "08:00 PM - 10:00 PM"
  ];

  // Modals State
  const [gymModalOpen, setGymModalOpen] = useState(false);
  const [editingGym, setEditingGym] = useState(null);
  const [gymForm, setGymForm] = useState({
    name: '',
    location: '',
    address: '',
    image: gymImagePresets[0].url,
    startingPrice: 200,
    rating: 4.9,
    amenitiesStr: 'AC, Free Locker, Steam Bath'
  });

  const [trainerModalOpen, setTrainerModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [selectedTimings, setSelectedTimings] = useState(["06:00 AM - 08:00 AM", "09:00 AM - 11:00 AM", "04:00 PM - 06:00 PM"]);
  const [trainerForm, setTrainerForm] = useState({
    name: '',
    gymId: '',
    phone: '',
    password: 'Trainer@123',
    specialization: 'Hypertrophy & Strength',
    experience: '5+ Years Certified',
    price: 200,
    image: trainerImagePresets[0].url
  });

  useEffect(() => {
    loadAllOwnerData();
  }, []);

  const loadAllOwnerData = () => {
    // 0ms Synchronous Reads
    const gymsData = firestoreService.getGymsSync();
    const trainersData = firestoreService.getTrainersSync();
    const bookingsData = firestoreService.getBookingsSync();
    const payoutsData = firestoreService.getPayoutRequestsSync();
    const configData = firestoreService.getOwnerConfigSync();

    setGyms(gymsData);
    setTrainers(trainersData);
    setBookings(bookingsData);
    setPayoutRequests(payoutsData);
    setOwnerConfig(configData);

    setUpiIdInput(configData.ownerUpiId || '9030118909@ybl');
    setQrUrlInput(configData.ownerQrCodeUrl || '');
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // GYM CRUD
  const handleOpenGymModal = (gym = null) => {
    soundEffects.playClick();
    if (gym) {
      setEditingGym(gym);
      setGymForm({
        name: gym.name,
        location: gym.location,
        address: gym.address || gym.location,
        image: gym.image,
        startingPrice: gym.startingPrice || 200,
        rating: gym.rating || 4.9,
        amenitiesStr: (gym.amenities || []).join(', ')
      });
    } else {
      setEditingGym(null);
      setGymForm({
        name: '',
        location: '',
        address: '',
        image: gymImagePresets[0].url,
        startingPrice: 200,
        rating: 4.9,
        amenitiesStr: 'AC, Free Locker, Steam Bath'
      });
    }
    setGymModalOpen(true);
  };

  const handleSaveGym = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    const payload = {
      gymId: editingGym ? editingGym.gymId : undefined,
      name: gymForm.name,
      location: gymForm.location,
      address: gymForm.address || gymForm.location,
      image: gymForm.image,
      startingPrice: parseFloat(gymForm.startingPrice) || 200,
      rating: parseFloat(gymForm.rating) || 4.9,
      amenities: gymForm.amenitiesStr.split(',').map(s => s.trim()).filter(Boolean)
    };

    await firestoreService.saveGym(payload);
    soundEffects.playSuccessChime();
    setGymModalOpen(false);
    loadAllOwnerData();
    showToast(editingGym ? 'Gym updated successfully! 🎉' : 'New Gym added successfully! 🎉');
  };

  const handleDeleteGym = async (gymId) => {
    soundEffects.playClick();
    if (window.confirm("Are you sure you want to delete this gym and its associated trainers?")) {
      await firestoreService.deleteGym(gymId);
      loadAllOwnerData();
      showToast('Gym deleted.');
    }
  };

  // TRAINER CRUD
  const handleOpenTrainerModal = (trainer = null) => {
    soundEffects.playClick();
    if (trainer) {
      setEditingTrainer(trainer);
      setSelectedTimings(trainer.availableTimings || []);
      setTrainerForm({
        name: trainer.name,
        gymId: trainer.gymId,
        phone: trainer.phone,
        password: trainer.password || 'Trainer@123',
        specialization: trainer.specialization,
        experience: trainer.experience,
        price: trainer.price || 200,
        image: trainer.image
      });
    } else {
      setEditingTrainer(null);
      setSelectedTimings(["06:00 AM - 08:00 AM", "09:00 AM - 11:00 AM", "04:00 PM - 06:00 PM"]);
      setTrainerForm({
        name: '',
        gymId: gyms[0]?.gymId || 'gym-1',
        phone: '',
        password: 'Trainer@123',
        specialization: 'Hypertrophy & Strength',
        experience: '5+ Years Certified',
        price: 200,
        image: trainerImagePresets[0].url
      });
    }
    setTrainerModalOpen(true);
  };

  const toggleSlotChip = (slot) => {
    soundEffects.playClick();
    if (selectedTimings.includes(slot)) {
      setSelectedTimings(selectedTimings.filter(s => s !== slot));
    } else {
      setSelectedTimings([...selectedTimings, slot]);
    }
  };

  const handleSaveTrainer = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    const payload = {
      trainerId: editingTrainer ? editingTrainer.trainerId : undefined,
      gymId: trainerForm.gymId || gyms[0]?.gymId || 'gym-1',
      name: trainerForm.name,
      phone: trainerForm.phone,
      password: trainerForm.password || 'Trainer@123',
      specialization: trainerForm.specialization,
      experience: trainerForm.experience,
      price: parseFloat(trainerForm.price) || 200,
      image: trainerForm.image,
      availableTimings: selectedTimings.length > 0 ? selectedTimings : ["09:00 AM - 11:00 AM"]
    };

    await firestoreService.saveTrainer(payload);
    soundEffects.playSuccessChime();
    setTrainerModalOpen(false);
    loadAllOwnerData();
    showToast(editingTrainer ? 'Trainer account updated! 🎉' : 'New Trainer account created! 🎉');
  };

  const handleDeleteTrainer = async (trainerId) => {
    soundEffects.playClick();
    if (window.confirm("Are you sure you want to delete this trainer account?")) {
      await firestoreService.deleteTrainer(trainerId);
      loadAllOwnerData();
      showToast('Trainer account deleted.');
    }
  };

  // PAYMENT CONFIG SAVE
  const handleSavePaymentConfig = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    setConfigMsg('');
    const newQr = qrUrlInput.trim() || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(upiIdInput.trim())}&pn=FITUP%20Owner&am=200&cu=INR`;
    
    const updated = await firestoreService.updateOwnerConfig({
      ownerUpiId: upiIdInput.trim(),
      ownerQrCodeUrl: newQr
    });
    setOwnerConfig(updated);
    soundEffects.playSuccessChime();
    setConfigMsg('Payment UPI ID & Custom QR Code updated successfully! ✅');
    setTimeout(() => setConfigMsg(''), 4000);
  };

  // PAYOUT APPROVAL
  const handleApprovePayout = async (requestId) => {
    soundEffects.playClick();
    await firestoreService.approvePayout(requestId);
    soundEffects.playSuccessChime();
    loadAllOwnerData();
    showToast('Payout approved and disbursed!');
  };

  // ANALYTICS COMPUTATIONS
  const totalSlotsBooked = bookings.length;
  const totalGrossRevenue = bookings.reduce((sum, b) => sum + (b.amount || 200), 0);
  const ownerPlatformShare = totalGrossRevenue * 0.25;
  const trainerDisbursedShare = totalGrossRevenue * 0.75;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 animate-fadeIn relative">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-24 right-6 z-[9999] bg-gradient-to-r from-electricBlue to-vibrantOrange text-slate-950 px-5 py-3 rounded-2xl font-extrabold text-xs shadow-2xl animate-scaleUp flex items-center space-x-2">
          <Sparkles className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 md:p-8 rounded-3xl border border-electricBlue/30 shadow-[0_0_40px_rgba(0,240,255,0.15)]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-electricBlue uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>FITUP OWNER DASHBOARD (SNEHITH)</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white font-outfit">
            Master Gym & Platform Console
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Effortlessly add gyms and trainers with 1-click presets, payment configs, and 12-hour payout approvals.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleOpenGymModal()}
            className="px-4 py-2.5 bg-electricBlue/10 hover:bg-electricBlue text-electricBlue hover:text-slate-950 border border-electricBlue/40 rounded-xl font-bold text-xs transition-all flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Gym</span>
          </button>

          <button
            onClick={() => handleOpenTrainerModal()}
            className="px-4 py-2.5 bg-vibrantOrange/10 hover:bg-vibrantOrange text-vibrantOrange hover:text-slate-950 border border-vibrantOrange/40 rounded-xl font-bold text-xs transition-all flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Trainer</span>
          </button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="glass-card p-6 rounded-2xl border border-electricBlue/40 shadow-xl">
          <div className="text-xs font-bold uppercase text-slate-400 mb-2">Total Slots Booked</div>
          <div className="text-3xl font-black text-white font-outfit">{totalSlotsBooked}</div>
          <p className="text-xs text-electricBlue font-medium mt-1">Across all partner gyms</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-xl">
          <div className="text-xs font-bold uppercase text-slate-400 mb-2">Gross Platform Revenue</div>
          <div className="text-3xl font-black text-emerald-400 font-outfit">₹{totalGrossRevenue.toLocaleString()}</div>
          <p className="text-xs text-slate-400 mt-1">Total trial fees processed</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-vibrantOrange/40 shadow-xl">
          <div className="text-xs font-bold uppercase text-slate-400 mb-2">Owner Share (25%)</div>
          <div className="text-3xl font-black text-vibrantOrange font-outfit">₹{ownerPlatformShare.toLocaleString()}</div>
          <p className="text-xs text-slate-400 mt-1">Net platform commission</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-xl">
          <div className="text-xs font-bold uppercase text-slate-400 mb-2">Trainer Wallet Split (75%)</div>
          <div className="text-3xl font-black text-white font-outfit">₹{trainerDisbursedShare.toLocaleString()}</div>
          <p className="text-xs text-slate-400 mt-1">Disbursed to trainer wallets</p>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 space-x-4">
        {[
          { id: 'gyms', label: 'Gyms & Trainers', icon: Building2 },
          { id: 'payment', label: 'Payment & QR Config', icon: QrCode },
          { id: 'payouts', label: '12-Hr Payout Approvals', icon: Hourglass },
          { id: 'earnings', label: 'Gym Earnings Breakdown', icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { soundEffects.playClick(); setActiveTab(tab.id); }}
              className={`flex items-center space-x-2 pb-3 px-2 text-sm font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-electricBlue text-electricBlue'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GYMS & TRAINERS MANAGEMENT */}
      {activeTab === 'gyms' && (
        <div className="space-y-8">
          
          {/* Gyms Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white font-outfit">Partner Gyms ({gyms.length})</h2>
              <button 
                onClick={() => handleOpenGymModal()}
                className="px-3 py-1.5 bg-electricBlue/10 text-electricBlue border border-electricBlue/30 rounded-xl text-xs font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Quick Add Gym</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gyms.map(gym => {
                const gymTrainers = trainers.filter(t => t.gymId === gym.gymId);
                const gymBookings = bookings.filter(b => b.gymId === gym.gymId);
                const gymRevenue = gymBookings.reduce((sum, b) => sum + (b.amount || 200), 0);

                return (
                  <div key={gym.gymId} className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-white font-outfit">{gym.name}</h3>
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={() => handleOpenGymModal(gym)}
                            className="p-1.5 text-slate-400 hover:text-electricBlue rounded-lg hover:bg-slate-800"
                            title="Edit Gym"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteGym(gym.gymId)}
                            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
                            title="Delete Gym"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 mb-3">{gym.location}</p>

                      <div className="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-1 text-xs mb-4">
                        <div className="flex justify-between"><span className="text-slate-400">Trainers:</span><span className="font-bold text-white">{gymTrainers.length}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Slots Booked:</span><span className="font-bold text-electricBlue">{gymBookings.length}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Gym Earnings:</span><span className="font-bold text-emerald-400">₹{gymRevenue}</span></div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 border-t border-white/5 pt-3">
                      Starting Price: <span className="font-bold text-white">₹{gym.startingPrice}</span> / Slot
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trainers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white font-outfit">Trainer Accounts ({trainers.length})</h2>
              <button 
                onClick={() => handleOpenTrainerModal()}
                className="px-3 py-1.5 bg-vibrantOrange/10 text-vibrantOrange border border-vibrantOrange/30 rounded-xl text-xs font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Quick Add Trainer</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trainers.map(t => {
                const parentGym = gyms.find(g => g.gymId === t.gymId);
                return (
                  <div key={t.trainerId} className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <img src={t.image} alt={t.name} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                          <div>
                            <h4 className="text-sm font-bold text-white">{t.name}</h4>
                            <span className="text-[10px] text-vibrantOrange font-semibold">{t.specialization}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={() => handleOpenTrainerModal(t)}
                            className="p-1.5 text-slate-400 hover:text-electricBlue rounded-lg hover:bg-slate-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTrainer(t.trainerId)}
                            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-white/5 text-xs space-y-1">
                        <div>Gym: <span className="font-bold text-white">{parentGym?.name || 'Assigned Gym'}</span></div>
                        <div>Phone: <span className="font-mono text-slate-200">{t.phone}</span></div>
                        <div>Password: <span className="font-mono text-slate-400">{t.password || 'Trainer@123'}</span></div>
                        <div>Wallet: <span className="font-bold text-vibrantOrange">₹{t.walletBalance || 0}</span></div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono mt-3">
                      Slot Fee: <span className="font-bold text-electricBlue">₹{t.price || 200}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: OWNER PAYMENT CONFIG & CUSTOM QR CODE */}
      {activeTab === 'payment' && (
        <div className="max-w-2xl mx-auto glass-card p-8 rounded-2xl border border-electricBlue/30 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white font-outfit">Owner Payment & QR Configuration</h2>
            <p className="text-xs text-slate-400 mt-1">Configure the master UPI ID and custom payment QR code displayed to clients during checkout.</p>
          </div>

          {configMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              {configMsg}
            </div>
          )}

          <form onSubmit={handleSavePaymentConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Owner UPI ID</label>
              <input
                type="text"
                required
                value={upiIdInput}
                onChange={(e) => setUpiIdInput(e.target.value)}
                placeholder="e.g. 9030118909@ybl"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-electricBlue font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Custom QR Code Image URL (Optional)</label>
              <input
                type="url"
                value={qrUrlInput}
                onChange={(e) => setQrUrlInput(e.target.value)}
                placeholder="https://... (Leave blank to generate automatically)"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-electricBlue text-xs"
              />
            </div>

            {/* Live QR Preview */}
            <div className="bg-slate-950 p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-3">Live Checkout QR Preview</span>
              <div className="w-40 h-40 mx-auto p-2 bg-white rounded-xl shadow-lg flex items-center justify-center">
                <img 
                  src={qrUrlInput || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(upiIdInput)}&pn=FITUP%20Owner&am=200&cu=INR`} 
                  alt="QR Preview" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-electricBlue to-vibrantOrange text-slate-950 font-bold rounded-xl text-sm shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            >
              Save Payment Configuration
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: 12-HOUR PAYOUT APPROVAL CONTROL */}
      {activeTab === 'payouts' && (
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white font-outfit">Trainer Payout Control (12-Hour Window)</h2>
            <p className="text-xs text-slate-400 mt-1">Review pending withdrawal requests submitted by trainers and process approvals.</p>
          </div>

          {payoutRequests.length === 0 ? (
            <p className="text-slate-500 text-xs text-center py-6">No payout requests in the queue.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Request ID</th>
                    <th className="p-3">Trainer Name</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">12-Hour Processing Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payoutRequests.map(req => {
                    const isApproved = req.status === 'APPROVED';
                    return (
                      <tr key={req.requestId} className="hover:bg-slate-900/50">
                        <td className="p-3 font-mono font-bold text-electricBlue">#{req.requestId}</td>
                        <td className="p-3 font-bold text-white">{req.trainerName}</td>
                        <td className="p-3 font-bold text-emerald-400">₹{req.amountRequested}</td>
                        <td className="p-3 font-mono text-vibrantOrange">
                          {isApproved ? 'DISBURSED' : `12-Hour Processing Window Active (${new Date(req.availableAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
                        </td>
                        <td className="p-3">
                          {isApproved ? (
                            <span className="text-xs font-bold text-emerald-400 flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Approved
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApprovePayout(req.requestId)}
                              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/40 rounded-lg font-bold text-xs transition-all"
                            >
                              Approve Payout
                            </button>
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
      )}

      {/* TAB 4: INDIVIDUAL GYM EARNINGS BREAKDOWN */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white font-outfit">Individual Gym Earnings Breakdown</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gyms.map(gym => {
              const gymBookings = bookings.filter(b => b.gymId === gym.gymId);
              const gymGross = gymBookings.reduce((sum, b) => sum + (b.amount || 200), 0);
              const ownerShare = gymGross * 0.25;

              return (
                <div key={gym.gymId} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                  <h3 className="text-lg font-bold text-white font-outfit">{gym.name}</h3>
                  
                  <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-400">Slots Booked:</span><span className="font-bold text-white">{gymBookings.length}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Total Gross:</span><span className="font-bold text-emerald-400">₹{gymGross}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Owner Net (25%):</span><span className="font-bold text-vibrantOrange">₹{ownerShare}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* USER-FRIENDLY ADD/EDIT GYM MODAL WITH 1-CLICK PRESETS */}
      {gymModalOpen && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-electricBlue/40 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white font-outfit">
                {editingGym ? 'Edit Gym Details' : 'Add New Gym'}
              </h3>
              <button onClick={() => { soundEffects.playClick(); setGymModalOpen(false); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGym} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Gym Name</label>
                <input
                  type="text"
                  required
                  value={gymForm.name}
                  onChange={(e) => setGymForm({ ...gymForm, name: e.target.value })}
                  placeholder="e.g. GS - Gym & Fitness Arena"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-electricBlue"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Location / Area</label>
                <input
                  type="text"
                  required
                  value={gymForm.location}
                  onChange={(e) => setGymForm({ ...gymForm, location: e.target.value })}
                  placeholder="e.g. Hitec City, Hyderabad"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-electricBlue"
                />
              </div>

              {/* 1-CLICK GYM COVER IMAGE PRESET SELECTOR */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Gym Cover Image</span>
                  <span className="text-[10px] text-electricBlue font-normal">Click a Preset Image to Select</span>
                </label>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  {gymImagePresets.map((preset, i) => (
                    <div
                      key={i}
                      onClick={() => { soundEffects.playClick(); setGymForm({ ...gymForm, image: preset.url }); }}
                      className={`p-1.5 rounded-xl border cursor-pointer transition-all flex items-center space-x-2 ${
                        gymForm.image === preset.url
                          ? 'bg-electricBlue/20 border-electricBlue shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                          : 'bg-slate-950 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-[11px] font-bold text-white truncate">{preset.label}</span>
                    </div>
                  ))}
                </div>

                <input
                  type="url"
                  required
                  value={gymForm.image}
                  onChange={(e) => setGymForm({ ...gymForm, image: e.target.value })}
                  placeholder="Custom image URL..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-electricBlue text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Starting Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={gymForm.startingPrice}
                    onChange={(e) => setGymForm({ ...gymForm, startingPrice: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-electricBlue font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Amenities (Comma separated)</label>
                  <input
                    type="text"
                    value={gymForm.amenitiesStr}
                    onChange={(e) => setGymForm({ ...gymForm, amenitiesStr: e.target.value })}
                    placeholder="AC, Locker, Steam"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-electricBlue"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-electricBlue to-vibrantOrange text-slate-950 font-bold rounded-xl text-sm shadow-lg mt-2"
              >
                {editingGym ? 'Update Gym' : 'Save Gym'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* USER-FRIENDLY ADD/EDIT TRAINER MODAL WITH PRESETS & SLOT CHIPS */}
      {trainerModalOpen && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-vibrantOrange/40 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white font-outfit">
                {editingTrainer ? 'Edit Trainer Account' : 'Add New Trainer'}
              </h3>
              <button onClick={() => { soundEffects.playClick(); setTrainerModalOpen(false); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTrainer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Trainer Full Name</label>
                <input
                  type="text"
                  required
                  value={trainerForm.name}
                  onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-vibrantOrange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assign Gym</label>
                  <select
                    value={trainerForm.gymId}
                    onChange={(e) => setTrainerForm({ ...trainerForm, gymId: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-vibrantOrange"
                  >
                    {gyms.map(g => (
                      <option key={g.gymId} value={g.gymId}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={trainerForm.phone}
                    onChange={(e) => setTrainerForm({ ...trainerForm, phone: e.target.value })}
                    placeholder="10-digit phone"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-vibrantOrange font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Login Password</label>
                  <input
                    type="text"
                    required
                    value={trainerForm.password}
                    onChange={(e) => setTrainerForm({ ...trainerForm, password: e.target.value })}
                    placeholder="Trainer@123"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-vibrantOrange font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Slot Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={trainerForm.price}
                    onChange={(e) => setTrainerForm({ ...trainerForm, price: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-vibrantOrange font-mono"
                  />
                </div>
              </div>

              {/* 1-CLICK TRAINER IMAGE PRESETS */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Trainer Profile Photo</span>
                  <span className="text-[10px] text-vibrantOrange font-normal">Click a Preset Photo</span>
                </label>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  {trainerImagePresets.map((preset, i) => (
                    <div
                      key={i}
                      onClick={() => { soundEffects.playClick(); setTrainerForm({ ...trainerForm, image: preset.url }); }}
                      className={`p-1.5 rounded-xl border cursor-pointer transition-all flex items-center space-x-2 ${
                        trainerForm.image === preset.url
                          ? 'bg-vibrantOrange/20 border-vibrantOrange shadow-[0_0_10px_rgba(255,85,0,0.3)]'
                          : 'bg-slate-950 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-[11px] font-bold text-white truncate">{preset.label}</span>
                    </div>
                  ))}
                </div>

                <input
                  type="url"
                  required
                  value={trainerForm.image}
                  onChange={(e) => setTrainerForm({ ...trainerForm, image: e.target.value })}
                  placeholder="Custom image URL..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-vibrantOrange text-[11px]"
                />
              </div>

              {/* CLICKABLE 2-HOUR WORKOUT TIME SLOT CHIPS */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                  <span>Available 2-Hour Time Slots</span>
                  <span className="text-[10px] text-electricBlue">Tap Chips to Toggle</span>
                </label>

                <div className="flex flex-wrap gap-1.5 bg-slate-950 p-2.5 rounded-xl border border-white/10">
                  {defaultSlotOptions.map((slot, index) => {
                    const isSelected = selectedTimings.includes(slot);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleSlotChip(slot)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center space-x-1 ${
                          isSelected
                            ? 'bg-vibrantOrange text-slate-950 shadow-[0_0_10px_rgba(255,85,0,0.4)]'
                            : 'bg-slate-900 text-slate-400 border border-white/5 hover:text-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{slot}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-vibrantOrange to-amber-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg mt-2"
              >
                {editingTrainer ? 'Update Trainer' : 'Save Trainer Account'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
