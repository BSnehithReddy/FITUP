import React, { useState, useMemo, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';
import { soundEffects } from '../services/soundEffects';
import { SafeImage } from './SafeImage';
import { 
  Search, MapPin, Star, ShieldCheck, Dumbbell, Clock, 
  Sparkles, ChevronRight, QrCode, CheckCircle2, Ticket, 
  Upload, Scan, AlertCircle, ArrowLeft, Calendar, User, RefreshCw
} from 'lucide-react';

export const ClientDashboard = () => {
  const [gyms, setGyms] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [ownerConfig, setOwnerConfig] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  
  // Slot Booking Modal State
  const [selectedGym, setSelectedGym] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [bookingStep, setBookingStep] = useState(1); // 1: Select Slot & Trainer, 2: Payment QR, 3: OCR Scan, 4: Pass Ticket
  
  // Payment & OCR Scanner State
  const [txnId, setTxnId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [completedBooking, setCompletedBooking] = useState(null);

  // Load Data & Subscribe to Real-Time Data Sync
  const loadData = () => {
    setGyms(firestoreService.getGymsSync());
    setTrainers(firestoreService.getTrainersSync());
    setOwnerConfig(firestoreService.getOwnerConfigSync());
  };

  useEffect(() => {
    loadData();

    // Listen to real-time data sync events from Owner actions
    const handleSync = () => {
      loadData();
    };

    window.addEventListener('fitup_data_sync', handleSync);
    return () => window.removeEventListener('fitup_data_sync', handleSync);
  }, []);

  // Dynamically extract unique location options from active gyms
  const dynamicLocations = useMemo(() => {
    const locSet = new Set();
    gyms.forEach(g => {
      if (g.location) {
        // e.g. "chengicherla , Hyderabad" -> extract "chengicherla" and full location
        const parts = g.location.split(',');
        const area = parts[0].trim();
        if (area) locSet.add(area);
        locSet.add(g.location.trim());
      }
    });
    return ['ALL', ...Array.from(locSet)];
  }, [gyms]);

  // Memoized 60fps Gym Search and Location Filtering
  const filteredGyms = useMemo(() => {
    return gyms.filter(gym => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        gym.name.toLowerCase().includes(q) || 
        gym.location.toLowerCase().includes(q) ||
        (gym.amenities && gym.amenities.some(a => a.toLowerCase().includes(q)));
      
      const matchesLocation = 
        selectedLocation === 'ALL' || 
        gym.location.toLowerCase().includes(selectedLocation.toLowerCase());

      return matchesSearch && matchesLocation;
    });
  }, [gyms, searchQuery, selectedLocation]);

  // Filter trainers for the selected gym
  const availableTrainers = useMemo(() => {
    if (!selectedGym) return [];
    return trainers.filter(t => t.gymId === selectedGym.gymId);
  }, [trainers, selectedGym]);

  const handleSelectGym = (gym) => {
    soundEffects.playClick();
    setSelectedGym(gym);
    const gymTrainers = trainers.filter(t => t.gymId === gym.gymId);
    if (gymTrainers.length > 0) {
      setSelectedTrainer(gymTrainers[0]);
      if (gymTrainers[0].availableTimings?.length > 0) {
        setSelectedTimeSlot(gymTrainers[0].availableTimings[0]);
      }
    } else {
      setSelectedTrainer(null);
      setSelectedTimeSlot('09:00 AM - 11:00 AM');
    }
    setBookingStep(1);
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

  // Automated Laser OCR Screenshot Scanner Simulation
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
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);
      soundEffects.playScanBeep();

      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        soundEffects.playSuccessChime();

        // Generate Automated Booking Pass
        const booking = firestoreService.createBooking({
          gymId: selectedGym.gymId,
          gymName: selectedGym.name,
          trainerId: selectedTrainer?.trainerId || 'tr-default',
          trainerName: selectedTrainer?.name || 'General Master Trainer',
          slotTime: selectedTimeSlot,
          date: new Date().toISOString().split('T')[0],
          amount: selectedGym.startingPrice || 200,
          txnId: txnId || ('UTR-' + Math.floor(100000000000 + Math.random() * 900000000000)),
          screenshotUrl: screenshotPreview
        });

        setCompletedBooking(booking);
        setBookingStep(4);
      }
    }, 250);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Search & Location Filter Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-electricBlue/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-vibrantOrange flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Instant Trial Slot Booking
            </span>
            <h1 className="text-3xl font-extrabold text-white font-outfit mt-1">
              Find Partner Gyms Near You
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Book 2-hour workout slots with top trainers for just ₹200 – ₹250.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Live Sync</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
          </div>
        </div>

        {/* Instant Search Bar & Location Chips */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 z-10 relative">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by gym name, area, AC, Sauna, Crossfit..."
              className="w-full bg-slate-900/90 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-electricBlue transition-all shadow-inner text-sm"
            />
          </div>

          <div className="md:col-span-4 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-electricBlue" />
            <select
              value={selectedLocation}
              onChange={(e) => {
                soundEffects.playClick();
                setSelectedLocation(e.target.value);
              }}
              className="w-full bg-slate-900/90 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-electricBlue transition-all text-sm appearance-none cursor-pointer"
            >
              {dynamicLocations.map((loc, i) => (
                <option key={i} value={loc} className="bg-slate-900 text-white">
                  {loc === 'ALL' ? '📍 All Locations' : `📍 ${loc}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location Quick Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {dynamicLocations.map((loc, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundEffects.playClick();
                setSelectedLocation(loc);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedLocation === loc
                  ? 'bg-electricBlue text-slate-950 shadow-[0_0_15px_#00f0ff]'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'
              }`}
            >
              {loc === 'ALL' ? 'All Gyms' : loc}
            </button>
          ))}
        </div>
      </div>

      {/* Gym Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white font-outfit flex items-center justify-between">
          <span>Available Partner Gyms</span>
          <span className="text-xs text-electricBlue font-mono font-normal">
            {filteredGyms.length} Gyms Found
          </span>
        </h2>

        {filteredGyms.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 space-y-4">
            <Dumbbell className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white">No Gyms Found</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              No partner gyms match "{searchQuery}" in {selectedLocation}. Try clearing your search query or selecting "All Locations".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLocation('ALL');
              }}
              className="px-5 py-2.5 bg-electricBlue/10 border border-electricBlue/40 text-electricBlue font-bold rounded-xl text-sm hover:bg-electricBlue hover:text-slate-950 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGyms.map((gym) => (
              <div 
                key={gym.gymId}
                className="glass-panel rounded-3xl border border-white/10 overflow-hidden hover:border-electricBlue/50 transition-all duration-300 group shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Gym Cover Image with SafeImage Component */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                    <SafeImage
                      src={gym.image}
                      alt={gym.name}
                      fallbackType="gym"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-xl flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-white">{gym.rating || 4.9}</span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-extrabold text-white font-outfit drop-shadow-md">
                        {gym.name}
                      </h3>
                      <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-electricBlue" />
                        {gym.location}
                      </p>
                    </div>
                  </div>

                  {/* Amenities Chips */}
                  <div className="p-4 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {gym.amenities?.map((amenity, idx) => (
                        <span 
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-white/5 text-[11px] text-slate-300 font-medium"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Pricing & Select Button */}
                <div className="p-4 pt-0 border-t border-white/5 mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">TRIAL SLOT FEE</span>
                    <span className="text-xl font-black text-white font-outfit">
                      ₹{gym.startingPrice || 200}
                      <span className="text-xs font-normal text-slate-400"> / 2 Hours</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectGym(gym)}
                    className="px-4 py-2.5 bg-gradient-to-r from-electricBlue to-blue-500 text-slate-950 font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center space-x-1"
                  >
                    <span>Select Gym</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SLOT BOOKING MODAL */}
      {selectedGym && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full rounded-3xl border border-electricBlue/30 p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs text-vibrantOrange font-bold tracking-wider uppercase">SLOT BOOKING PORTAL</span>
                <h2 className="text-2xl font-extrabold text-white font-outfit mt-0.5">
                  {selectedGym.name}
                </h2>
              </div>

              <button
                onClick={() => setSelectedGym(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
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
                      <p className="text-xs text-slate-400">General Floor Gym Trainer included with this slot.</p>
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
                            <h4 className="text-sm font-bold text-white truncate">{tr.name}</h4>
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
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
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
                      ₹{selectedGym.startingPrice || 200}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setBookingStep(2);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-electricBlue to-blue-500 text-slate-950 font-bold rounded-xl text-sm shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-105 transition-all"
                  >
                    Proceed to Payment QR
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Payment QR Code & Screenshot Upload */}
            {bookingStep === 2 && (
              <div className="space-y-6">
                <div className="bg-slate-900/90 p-6 rounded-2xl border border-white/10 text-center space-y-4">
                  <span className="text-xs font-bold text-electricBlue uppercase tracking-wider">
                    SCAN & PAY VIA ANY UPI APP (GPay, PhonePe, Paytm)
                  </span>

                  {/* Owner QR Code Display with SafeImage Fallback */}
                  <div className="w-52 h-52 mx-auto bg-white p-3 rounded-2xl shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center">
                    <SafeImage
                      src={ownerConfig?.ownerQrCodeUrl || selectedGym.ownerQrCodeUrl}
                      alt="Owner Payment QR Code"
                      fallbackType="qr"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-400">Owner Official UPI ID</span>
                    <div className="text-lg font-mono font-bold text-electricBlue bg-slate-950 py-1.5 px-4 rounded-xl border border-electricBlue/30 inline-block">
                      {ownerConfig?.ownerUpiId || "9030118909@ybl"}
                    </div>
                  </div>
                </div>

                {/* Upload Screenshot & Enter Txn ID */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      1. Upload Payment Screenshot (Mandatory)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-electricBlue/20 file:text-electricBlue file:font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      2. UPI UTR / Transaction ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={txnId}
                      onChange={(e) => setTxnId(e.target.value)}
                      placeholder="e.g. UTR-903011890111"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-electricBlue"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setBookingStep(1)}
                    className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  <button
                    onClick={handleProceedToOCRScan}
                    className="px-6 py-3 bg-gradient-to-r from-vibrantOrange to-amber-500 text-slate-950 font-bold rounded-xl text-sm shadow-[0_0_15px_rgba(255,85,0,0.4)] hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Scan className="w-4 h-4" /> Verify Screenshot via Laser OCR
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Automated Laser OCR Scanner Simulation */}
            {bookingStep === 3 && (
              <div className="py-12 text-center space-y-6">
                <div className="relative w-40 h-40 mx-auto rounded-2xl bg-slate-900 border border-electricBlue overflow-hidden flex items-center justify-center">
                  {screenshotPreview && (
                    <img src={screenshotPreview} alt="Uploaded Payment Screenshot" className="w-full h-full object-cover opacity-60" />
                  )}
                  {/* Laser Sweeping Beam */}
                  <div className="laser-sweep" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white font-outfit">
                    Scanning Payment Screenshot...
                  </h3>
                  <p className="text-xs text-electricBlue font-mono">
                    VERIFYING UPI PAYMENT AUTHENTICITY ({scanProgress}%)
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

            {/* STEP 4: Digital Pass Ticket */}
            {bookingStep === 4 && completedBooking && (
              <div className="space-y-6 text-center">
                <div className="glass-panel p-6 rounded-3xl border border-emerald-500/40 bg-emerald-950/20 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_#34d399]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest">PAYMENT VERIFIED & SLOT BOOKED</span>
                    <h3 className="text-2xl font-black text-white font-outfit mt-1">
                      {completedBooking.gymName}
                    </h3>
                  </div>

                  {/* Pass Ticket Box */}
                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 text-left space-y-2 font-mono text-xs text-slate-300">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-400">Pass Ticket ID:</span>
                      <span className="text-electricBlue font-bold">{completedBooking.bookingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned Trainer:</span>
                      <span className="text-white font-bold">{completedBooking.trainerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Time Slot:</span>
                      <span className="text-vibrantOrange font-bold">{completedBooking.slotTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date:</span>
                      <span className="text-white">{completedBooking.date}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-400">UTR Txn ID:</span>
                      <span className="text-emerald-400">{completedBooking.txnId}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedGym(null)}
                  className="px-8 py-3 bg-gradient-to-r from-electricBlue to-blue-500 text-slate-950 font-bold rounded-xl text-sm shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                >
                  Done & Close Portal
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
