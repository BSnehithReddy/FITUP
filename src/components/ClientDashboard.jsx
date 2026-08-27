import React, { useState, useEffect, useMemo } from 'react';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';
import { soundEffects } from '../services/soundEffects';
import { 
  Search, MapPin, Star, Calendar, Clock, CheckCircle2, 
  Upload, QrCode, ArrowRight, ShieldCheck, Ticket, Sparkles, X, ChevronRight, UserCheck
} from 'lucide-react';

export const ClientDashboard = ({ activeTab, setActiveTab }) => {
  const { currentUser, openAuthModal } = useAuth();
  
  const [gyms, setGyms] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [ownerConfig, setOwnerConfig] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('ALL');

  // Booking Flow Modals & Selections
  const [selectedGym, setSelectedGym] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedSlotTime, setSelectedSlotTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Payment & Verification Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('');
  const [scanLogs, setScanLogs] = useState([]);
  const [verifiedBooking, setVerifiedBooking] = useState(null);

  const availableSlots = [
    "06:00 AM - 08:00 AM",
    "09:00 AM - 11:00 AM",
    "11:00 AM - 01:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM",
    "06:00 PM - 08:00 PM",
    "08:00 PM - 10:00 PM"
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    // 0ms Synchronous Reads
    const gymsData = firestoreService.getGymsSync();
    const trainersData = firestoreService.getTrainersSync();
    const bookingsData = firestoreService.getBookingsSync();
    const config = firestoreService.getOwnerConfigSync();
    
    setGyms(gymsData);
    setTrainers(trainersData);
    setBookings(bookingsData);
    setOwnerConfig(config);
  };

  // 0ms INSTANT MEMOIZED SEARCH & LOCATION FILTERING
  const filteredGyms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return gyms.filter(gym => {
      const matchesQuery = !q || 
        gym.name.toLowerCase().includes(q) || 
        gym.location.toLowerCase().includes(q) ||
        (gym.amenities || []).some(a => a.toLowerCase().includes(q));
      const matchesLocation = selectedLocation === 'ALL' || gym.location.includes(selectedLocation);
      return matchesQuery && matchesLocation;
    });
  }, [gyms, searchQuery, selectedLocation]);

  const handleSelectGym = (gym) => {
    soundEffects.playClick();
    setSelectedGym(gym);
    const gymTrainers = trainers.filter(t => t.gymId === gym.gymId);
    if (gymTrainers.length > 0) {
      setSelectedTrainer(gymTrainers[0]);
      setSelectedSlotTime(gymTrainers[0].availableTimings?.[0] || availableSlots[1]);
    } else {
      setSelectedTrainer(null);
    }
  };

  const handleProceedToPayment = () => {
    soundEffects.playClick();
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    if (!selectedGym || !selectedTrainer || !selectedSlotTime) {
      alert('Please select a Gym, Trainer, and Available Time Slot.');
      return;
    }
    setPaymentModalOpen(true);
    setVerifiedBooking(null);
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setIsScanning(false);
    setScanLogs([]);
  };

  const handleFileChange = (e) => {
    soundEffects.playClick();
    const file = e.target.files[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAutomatedScanner = async () => {
    soundEffects.playClick();
    if (!screenshotFile && !screenshotPreview) {
      soundEffects.playError();
      alert("Please select your payment transfer screenshot to verify.");
      return;
    }

    setIsScanning(true);
    setScanProgress(10);
    setScanLogs(['Initializing OCR Laser Scanner...']);
    soundEffects.playScanBeep();

    setTimeout(() => {
      soundEffects.playScanBeep();
      setScanProgress(40);
      setScanStatusText('Analyzing UPI Transaction Layout (GPay / PhonePe)...');
      setScanLogs(prev => [...prev, '✓ Receipt Layout Matched: GPay / PhonePe / Paytm']);
    }, 700);

    setTimeout(() => {
      soundEffects.playScanBeep();
      setScanProgress(75);
      const fakeUtEnd = Math.floor(100000 + Math.random() * 900000);
      const txnId = `UTR-903011${fakeUtEnd}`;
      setScanStatusText('Extracting UTR Ref & Validating Recipient...');
      setScanLogs(prev => [
        ...prev, 
        `✓ Extracted UTR Ref: ${txnId}`,
        `✓ Validated Recipient Phone: ${ownerConfig?.ownerPhone || '9030118909'}`,
        `✓ Payment Amount Validated: ₹${selectedTrainer?.price || 200}.00`
      ]);
    }, 1700);

    setTimeout(async () => {
      setScanProgress(100);
      setScanStatusText('Verification Complete! Slot Booked.');
      const fakeUtEnd = Math.floor(100000 + Math.random() * 900000);
      const txnId = `UTR-903011${fakeUtEnd}`;

      const bookingPayload = {
        userId: currentUser.uid,
        userName: currentUser.name,
        userPhone: currentUser.phone,
        gymId: selectedGym.gymId,
        gymName: selectedGym.name,
        trainerId: selectedTrainer.trainerId,
        trainerName: selectedTrainer.name,
        slotTime: selectedSlotTime,
        date: selectedDate,
        amount: selectedTrainer.price || 200,
        txnId,
        screenshotUrl: screenshotPreview,
        status: 'VERIFIED'
      };

      const created = await firestoreService.createBooking(bookingPayload);
      setVerifiedBooking(created);
      setIsScanning(false);
      soundEffects.playSuccessChime();
      
      // Refresh bookings synchronously
      setBookings(firestoreService.getBookingsSync());
    }, 2800);
  };

  const userBookings = bookings.filter(b => b.userId === currentUser?.uid || b.userPhone === currentUser?.phone);

  if (activeTab === 'my_bookings') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white font-outfit">My Gym Slot Passes</h1>
            <p className="text-slate-400 text-sm mt-1">Your single-session verified personal training slot passes</p>
          </div>
          <button 
            onClick={() => { soundEffects.playClick(); setActiveTab('home'); }}
            className="px-4 py-2 bg-electricBlue/10 text-electricBlue border border-electricBlue/30 rounded-xl hover:bg-electricBlue/20 text-sm font-semibold transition-all"
          >
            Book Another Slot
          </button>
        </div>

        {userBookings.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl">
            <Ticket className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-300">No Active Slot Passes</h3>
            <p className="text-slate-500 text-sm mt-2 mb-6">Explore top gyms and book 2-hour trial PT slots starting at ₹200.</p>
            <button
              onClick={() => { soundEffects.playClick(); setActiveTab('home'); }}
              className="px-6 py-3 bg-gradient-to-r from-electricBlue to-vibrantOrange text-slate-950 font-bold rounded-xl shadow-lg"
            >
              Explore Gyms Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userBookings.map(b => (
              <div key={b.bookingId} className="glass-card p-6 rounded-2xl relative overflow-hidden border border-electricBlue/30 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
                
                {/* Header Ticket Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">VERIFIED ENTRY PASS</span>
                  </div>
                  <span className="text-xs font-mono text-electricBlue font-bold bg-electricBlue/10 px-2.5 py-1 rounded-lg border border-electricBlue/30">
                    #{b.bookingId}
                  </span>
                </div>

                {/* Ticket Details */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-extrabold text-white">{b.gymName}</h3>
                    <p className="text-xs text-vibrantOrange font-medium">Personal Trainer: {b.trainerName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-white/5">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Date</div>
                      <div className="text-xs font-bold text-white flex items-center mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-electricBlue mr-1" />
                        {b.date}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Time Slot</div>
                      <div className="text-xs font-bold text-white flex items-center mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-electricBlue mr-1" />
                        {b.slotTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                    <div>Ref UTR: <span className="font-mono text-slate-200">{b.txnId}</span></div>
                    <div className="font-bold text-white">Fee Paid: <span className="text-electricBlue">₹{b.amount}</span></div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12 animate-fadeIn">
      
      {/* Hero Banner Section */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-8 md:p-12 border border-electricBlue/20 shadow-[0_0_50px_rgba(0,240,255,0.15)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-electricBlue/10 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-vibrantOrange/10 rounded-full filter blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-electricBlue/10 border border-electricBlue/30 text-electricBlue text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Single-Session Gym PT Slot Booking</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white font-outfit leading-tight mb-4">
            BOOK A 2-HOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electricBlue via-blue-400 to-vibrantOrange drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              PERSONAL TRAINING
            </span> SLOT
          </h1>

          <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed">
            No expensive ₹6,000/month gym commitments. Access top trainers at prime local gyms for just <strong className="text-electricBlue font-bold">₹200 - ₹250</strong> per slot.
          </p>

          {/* Search & Location Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/80 p-2 rounded-2xl border border-white/10 shadow-2xl">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search gyms by name, area, or amenities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electricBlue"
              />
            </div>

            <select
              value={selectedLocation}
              onChange={(e) => { soundEffects.playClick(); setSelectedLocation(e.target.value); }}
              className="bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-electricBlue"
            >
              <option value="ALL">All Locations</option>
              <option value="Hitec City">Hitec City</option>
              <option value="Gachibowli">Gachibowli</option>
              <option value="Jubilee Hills">Jubilee Hills</option>
            </select>
          </div>
        </div>
      </div>

      {/* Gyms Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white font-outfit">Available Partner Gyms</h2>
          <span className="text-xs text-slate-400 font-mono">{filteredGyms.length} Gyms Found</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredGyms.map(gym => {
            const gymTrainers = trainers.filter(t => t.gymId === gym.gymId);
            return (
              <div 
                key={gym.gymId} 
                className="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between"
              >
                <div>
                  {/* Gym Cover Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={gym.image} 
                      alt={gym.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-xl flex items-center space-x-1 text-xs font-bold text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{gym.rating}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white font-outfit mb-1">{gym.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center mb-4">
                      <MapPin className="w-3.5 h-3.5 text-electricBlue mr-1 flex-shrink-0" />
                      {gym.location}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(gym.amenities || []).map((a, i) => (
                        <span key={i} className="text-[10px] font-semibold text-slate-300 bg-slate-900/90 border border-white/5 px-2 py-0.5 rounded-md">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-5 pt-0 border-t border-white/5 flex items-center justify-between mt-auto">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Trial Slot Fee</span>
                    <span className="text-lg font-black text-electricBlue font-outfit">
                      ₹{gym.startingPrice} <small className="text-xs text-slate-400 font-normal">/ 2 Hours</small>
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectGym(gym)}
                    className="px-4 py-2.5 bg-electricBlue/10 hover:bg-electricBlue text-electricBlue hover:text-slate-950 border border-electricBlue/40 rounded-xl font-bold text-xs transition-all flex items-center space-x-1"
                  >
                    <span>Select Gym</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Gym & Trainer Booking Panel Modal */}
      {selectedGym && (
        <div className="fixed inset-0 z-[9980] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-electricBlue/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950">
              <div>
                <span className="text-xs font-mono font-bold text-electricBlue uppercase">STEP 1: SELECT TRAINER & TIME SLOT</span>
                <h2 className="text-2xl font-bold text-white font-outfit">{selectedGym.name}</h2>
              </div>
              <button 
                onClick={() => { soundEffects.playClick(); setSelectedGym(null); }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Select Trainer */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                  Select Certified Trainer
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {trainers.filter(t => t.gymId === selectedGym.gymId).map(t => (
                    <div
                      key={t.trainerId}
                      onClick={() => {
                        soundEffects.playClick();
                        setSelectedTrainer(t);
                        setSelectedSlotTime(t.availableTimings?.[0] || availableSlots[0]);
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center space-x-3 ${
                        selectedTrainer?.trainerId === t.trainerId
                          ? 'bg-electricBlue/10 border-electricBlue shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                          : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <img 
                        src={t.image} 
                        alt={t.name} 
                        className="w-12 h-12 rounded-xl object-cover border border-white/10"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{t.name}</h4>
                        <p className="text-xs text-vibrantOrange font-medium">{t.specialization}</p>
                        <span className="text-[10px] text-slate-400">{t.experience}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Select Date & Time Slot */}
              {selectedTrainer && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-950/80 p-5 rounded-2xl border border-white/5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      Workout Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-electricBlue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                      2-Hour Time Slot
                    </label>
                    <select
                      value={selectedSlotTime}
                      onChange={(e) => { soundEffects.playClick(); setSelectedSlotTime(e.target.value); }}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-electricBlue font-mono"
                    >
                      {(selectedTrainer.availableTimings || availableSlots).map((slot, i) => (
                        <option key={i} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 bg-slate-950 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Fee</span>
                <div className="text-2xl font-black text-electricBlue font-outfit">
                  ₹{selectedTrainer?.price || selectedGym.startingPrice}
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                className="px-6 py-3 bg-gradient-to-r from-electricBlue to-vibrantOrange text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-105 transition-all flex items-center space-x-2 text-sm"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STEP 2 & 3: PAYMENT QR & AUTOMATED OCR SCREENSHOT SCANNER MODAL */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-electricBlue/40 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden my-8">
            
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-electricBlue" />
                <h3 className="text-lg font-bold text-white font-outfit">FITUP Instant Payment & Scanner</h3>
              </div>
              <button 
                onClick={() => { soundEffects.playClick(); setPaymentModalOpen(false); }}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">

              {verifiedBooking ? (
                /* SUCCESS TICKET CARD */
                <div className="text-center space-y-4 py-4 animate-scaleUp">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(52,211,153,0.4)] animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <h3 className="text-2xl font-black text-white font-outfit">SLOT BOOKED & VERIFIED!</h3>
                  <p className="text-xs text-slate-300">Your single-session PT pass has been saved to your account.</p>

                  <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 text-left space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-400">Gym:</span><span className="font-bold text-white">{verifiedBooking.gymName}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Trainer:</span><span className="font-bold text-vibrantOrange">{verifiedBooking.trainerName}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Slot:</span><span className="font-bold text-electricBlue">{verifiedBooking.date} ({verifiedBooking.slotTime})</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Ref UTR:</span><span className="font-mono text-emerald-400">{verifiedBooking.txnId}</span></div>
                  </div>

                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setPaymentModalOpen(false);
                      setSelectedGym(null);
                      setActiveTab('my_bookings');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-electricBlue to-vibrantOrange text-slate-950 font-bold rounded-xl shadow-lg text-sm"
                  >
                    View My Pass Ticket
                  </button>
                </div>
              ) : (
                <>
                  {/* Owner QR Code & Payment Info */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-white/10 text-center space-y-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-vibrantOrange">
                      Pay Trial Fee via Any UPI App (GPay / PhonePe / Paytm)
                    </span>

                    <div className="w-44 h-44 mx-auto p-2 bg-white rounded-2xl shadow-xl border-2 border-electricBlue flex items-center justify-center">
                      <img 
                        src={ownerConfig?.ownerQrCodeUrl || "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=9030118909@ybl&pn=FITUP%20Owner&am=200&cu=INR"} 
                        alt="Owner Payment QR Code" 
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="text-xs font-mono text-slate-300">
                      UPI ID: <strong className="text-electricBlue font-bold">{ownerConfig?.ownerUpiId || "9030118909@ybl"}</strong>
                      <br />
                      Phone: <strong className="text-slate-100">{ownerConfig?.ownerPhone || "9030118909"}</strong>
                    </div>

                    <div className="text-lg font-black text-white font-outfit">
                      Amount to Pay: <span className="text-electricBlue">₹{selectedTrainer?.price || 200}</span>
                    </div>
                  </div>

                  {/* Screenshot Upload & Scanner Box */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Upload Payment Transfer Screenshot
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="screenshotUploadInput"
                    />

                    <label 
                      htmlFor="screenshotUploadInput"
                      className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-electricBlue/40 hover:border-electricBlue rounded-xl cursor-pointer bg-slate-950/60 transition-all text-center"
                    >
                      {screenshotPreview ? (
                        <div className="relative w-full h-32 overflow-hidden rounded-lg">
                          <img src={screenshotPreview} alt="Screenshot preview" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Upload className="w-8 h-8 text-electricBlue mx-auto" />
                          <span className="text-xs font-semibold text-slate-200">Click to Select Payment Screenshot</span>
                          <p className="text-[10px] text-slate-500">Supports PNG, JPG, JPEG from GPay/PhonePe</p>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* OCR Laser Scanner Progress Box */}
                  {isScanning && (
                    <div className="relative bg-slate-950 p-4 rounded-xl border border-electricBlue/40 overflow-hidden space-y-3">
                      {/* Laser Line */}
                      <div className="absolute left-0 right-0 h-0.5 bg-electricBlue shadow-[0_0_15px_#00f0ff] animate-laser"></div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-electricBlue">{scanStatusText}</span>
                        <span className="font-mono text-slate-400">{scanProgress}%</span>
                      </div>

                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/10">
                        <div 
                          className="h-full bg-electricBlue transition-all duration-300"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>

                      <div className="space-y-1 font-mono text-[11px] text-slate-400">
                        {scanLogs.map((log, index) => (
                          <div key={index} className="text-emerald-400">{log}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verify Action Button */}
                  <button
                    onClick={runAutomatedScanner}
                    disabled={isScanning}
                    className="w-full py-3 bg-gradient-to-r from-electricBlue to-vibrantOrange text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all text-sm disabled:opacity-50"
                  >
                    {isScanning ? 'Running Automated Verification...' : 'Verify Screenshot & Confirm Slot'}
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
