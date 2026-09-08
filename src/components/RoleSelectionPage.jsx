import React from 'react';
import { soundEffects } from '../services/soundEffects';
import { useAuth } from '../context/AuthContext';
import { 
  Dumbbell, Building2, CheckCircle2, ArrowRight, 
  ArrowLeft, Sparkles, ShieldCheck, Tag, UserCheck, 
  Wallet, Award, Zap
} from 'lucide-react';

export const RoleSelectionPage = ({ 
  onSelectEnthusiast, 
  onSelectGymOwner, 
  onOpenAuthModal, 
  onBackToOverview 
}) => {
  const { currentUser, openAuthModal } = useAuth();

  return (
    <div className="space-y-10 animate-fadeIn pb-12">
      
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            soundEffects.playClick();
            onBackToOverview();
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-bold text-slate-300 hover:text-electricBlue hover:border-electricBlue/40 transition-all group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Story & Vision</span>
        </button>

        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/5">
          Step 2 of 2 • Role Selection
        </span>
      </div>

      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-electricBlue/10 border border-electricBlue/30 text-electricBlue text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.25)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CHOOSE YOUR FITUP PATH</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white font-outfit tracking-tight leading-tight">
          How Will You Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-electricBlue via-cyan-400 to-blue-500">FITUP?</span>
        </h1>

        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          Select your profile to enter your customized portal. Whether you're lifting or managing a fitness facility, FITUP gives you total control.
        </p>
      </div>

      {/* Dual Persona Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left">
        
        {/* ========================================================= */}
        {/* PERSONA 1: GYM ENTHUSIAST (USER / ATHLETE) */}
        {/* ========================================================= */}
        <div className="relative glass-panel p-7 sm:p-9 rounded-3xl border border-electricBlue/40 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 hover:border-electricBlue transition-all duration-300 shadow-[0_0_35px_rgba(0,240,255,0.18)] hover:shadow-[0_0_50px_rgba(0,240,255,0.35)] space-y-6 flex flex-col justify-between group">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-electricBlue/10 border border-electricBlue/30 text-electricBlue flex items-center justify-center font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)] group-hover:scale-110 transition-transform">
                <Dumbbell className="w-7 h-7" />
              </div>
              <span className="px-3.5 py-1 rounded-full bg-electricBlue/10 border border-electricBlue/30 text-electricBlue text-xs font-extrabold tracking-wide uppercase">
                For Users & Athletes
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-outfit">
                Gym Enthusiast
              </h2>
              <p className="text-xs sm:text-sm text-electricBlue font-bold mt-1">
                Pay-Per-Session Workout Freedom (₹200 – ₹280)
              </p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Never pay upfront for months of unused gym time. Book 2-hour workout slots at verified local fitness studios whenever you feel like training.
            </p>

            <ul className="text-xs text-slate-300 space-y-2.5 pt-2 border-t border-white/5">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span><strong>₹200 – ₹280</strong> Flat Fee per 2-Hour Trial Slot</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span><strong>1-on-1 Certified Personal Trainer</strong> Included with Every Pass</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Instant Digital Check-In Pass with Encrypted QR Code</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span><strong>100% Instant Refund Guarantee</strong> (&gt; 2 Hours Before Slot)</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 space-y-2.5">
            <button
              onClick={() => {
                soundEffects.playClick();
                onSelectEnthusiast();
              }}
              className="w-full py-4 px-5 bg-gradient-to-r from-electricBlue to-blue-500 hover:from-blue-400 hover:to-electricBlue text-slate-950 font-black rounded-2xl text-sm shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 transform active:scale-95 group-hover:scale-[1.01] cursor-pointer"
            >
              <Dumbbell className="w-4 h-4" />
              <span>Enter as Gym Enthusiast</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-1">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onOpenAuthModal ? onOpenAuthModal('client', 'login') : openAuthModal('login', 'client');
                }}
                className="hover:text-electricBlue font-bold underline transition-colors cursor-pointer"
              >
                Sign In as Enthusiast
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onOpenAuthModal ? onOpenAuthModal('client', 'register') : openAuthModal('register', 'client');
                }}
                className="hover:text-electricBlue font-bold underline transition-colors cursor-pointer"
              >
                Create New Account
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* PERSONA 2: GYM OWNER (PARTNER FACILITY) */}
        {/* ========================================================= */}
        <div className="relative glass-panel p-7 sm:p-9 rounded-3xl border border-emerald-400/40 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 hover:border-emerald-400 transition-all duration-300 shadow-[0_0_35px_rgba(52,211,153,0.18)] hover:shadow-[0_0_50px_rgba(52,211,153,0.35)] space-y-6 flex flex-col justify-between group">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-bold shadow-[0_0_20px_rgba(52,211,153,0.3)] group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>
              <span className="px-3.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-xs font-extrabold tracking-wide uppercase">
                For Gym Facilities
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-outfit">
                Gym Owner
              </h2>
              <p className="text-xs sm:text-sm text-emerald-400 font-bold mt-1">
                Monetize Off-Peak Floor Slots & Trainers
              </p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              List your gym facility with zero upfront fees. Turn empty workout floor capacity into steady daily revenue with real-time pass issuance and automated payouts.
            </p>

            <ul className="text-xs text-slate-300 space-y-2.5 pt-2 border-t border-white/5">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span><strong>Zero Listing Fee</strong> • List your gym in under 2 minutes</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Facility profile, photos & social handles (Instagram, WhatsApp)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span><strong>Manage Certified Trainers</strong> with customizable split %</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span><strong>30% Digital Wallet</strong> with 24–48h Direct UPI Payouts</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 space-y-2.5">
            <button
              onClick={() => {
                soundEffects.playClick();
                onSelectGymOwner();
              }}
              className="w-full py-4 px-5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black rounded-2xl text-sm shadow-[0_0_25px_rgba(52,211,153,0.4)] transition-all flex items-center justify-center gap-2 transform active:scale-95 group-hover:scale-[1.01] cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Enter as Gym Owner</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-1">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onOpenAuthModal ? onOpenAuthModal('gym_owner', 'login') : openAuthModal('login', 'gym_owner');
                }}
                className="hover:text-emerald-400 font-bold underline transition-colors cursor-pointer"
              >
                Gym Owner Sign In
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onOpenAuthModal ? onOpenAuthModal('gym_owner', 'register') : openAuthModal('register', 'gym_owner');
                }}
                className="hover:text-emerald-400 font-bold underline transition-colors cursor-pointer"
              >
                Register New Facility
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Trust & Guarantee Banner */}
      <div className="max-w-4xl mx-auto p-5 rounded-2xl bg-slate-900/70 border border-white/5 flex flex-wrap items-center justify-around gap-4 text-center text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% Verified Partners</span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-electricBlue" />
          <span>Certified Floor Trainers</span>
        </div>
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-vibrantOrange" />
          <span>Razorpay & Direct UPI Security</span>
        </div>
      </div>

    </div>
  );
};
