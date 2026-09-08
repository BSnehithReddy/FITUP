import React, { useState } from 'react';
import { GalaxyCanvas } from './GalaxyCanvas';
import { soundEffects } from '../services/soundEffects';
import { useAuth } from '../context/AuthContext';
import { 
  Dumbbell, Building2, Sparkles, ShieldCheck, CheckCircle2, 
  XCircle, ArrowRight, UserCheck, Tag, Zap, Clock, Shield,
  ChevronDown, HelpCircle, PhoneCall
} from 'lucide-react';

export const LandingSection = ({ onExploreGyms, onOpenGymOwnerAuth, onOpenUserAuth, onOpenLegal }) => {
  const { currentUser } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (idx) => {
    soundEffects.playClick();
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const FAQS = [
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
      a: "Yes! Every trial slot pass includes dedicated floor guidance from a certified Trainer Pro (specialized in Strength, Hypertrophy, HIIT, or Mobility)."
    },
    {
      q: "What is the Cancellation and Refund Policy?",
      a: "You can cancel any booking up to 2 hours before your session start time for a 100% instant refund directly to your original payment method with zero cancellation charges."
    },
    {
      q: "How do Gym Owners and Trainers get paid?",
      a: "Personal Trainers receive their designated share (e.g. 50%) directly to their digital wallet. Gym Owners accumulate 30% per workout slot and can request 24-48h direct UPI payouts."
    }
  ];

  return (
    <div className="space-y-12">
      
      {/* ========================================================= */}
      {/* 1. HERO SECTION WITH INTERACTIVE 60FPS GALAXY CANVAS */}
      {/* ========================================================= */}
      <div className="relative min-h-[580px] sm:min-h-[640px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col justify-center items-center text-center p-6 sm:p-12 bg-slate-950">
        
        {/* Ambient Glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-electricBlue/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-vibrantOrange/10 rounded-full blur-3xl pointer-events-none" />

        {/* 60fps Starfield Canvas */}
        <GalaxyCanvas />

        {/* Hero Foreground Content */}
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-electricBlue/10 border border-electricBlue/30 text-electricBlue text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.25)] animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NO SUBSCRIPTIONS • 100% FREEDOM • PAY PER WORKOUT</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-outfit tracking-tight leading-tight">
            BOOK. LIFT. <span className="text-transparent bg-clip-text bg-gradient-to-r from-electricBlue to-blue-400">REPEAT.</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-vibrantOrange to-amber-500">
              ZERO MONTHLY LOCK-INS.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Experience premium 2-hour workout passes with certified 1-on-1 personal training at top local fitness centers starting at just <strong className="text-white font-bold">₹200 – ₹280 per slot</strong>. Never waste money on unused gym memberships again.
          </p>

          {/* Live Price Highlight Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <div className="px-3 py-1.5 rounded-xl bg-electricBlue/10 border border-electricBlue/30 text-white text-xs font-semibold flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-electricBlue" />
              <span>Trial Slots: <strong className="text-electricBlue">₹200 - ₹280</strong> / 2-Hrs</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-white text-xs font-semibold flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Certified Personal Trainer Included</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-vibrantOrange/10 border border-vibrantOrange/30 text-white text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-vibrantOrange" />
              <span>100% Instant Refund Guarantee</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* DUAL PERSONA CARDS (GYM ENTHUSIAST vs GYM OWNER) */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-left">
            
            {/* CARD 1: GYM ENTHUSIAST */}
            <div className="glass-panel p-5 rounded-3xl border border-electricBlue/30 bg-slate-900/90 hover:border-electricBlue transition-all shadow-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-electricBlue/10 border border-electricBlue/30 text-electricBlue flex items-center justify-center font-bold">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white font-outfit">Gym Enthusiast</h3>
                    <span className="text-[11px] text-electricBlue font-bold block">Workout On-Demand</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Book single 2-hour workout slots at verified partner gyms with certified trainer coaching for ₹200–₹280.
                </p>
              </div>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  onExploreGyms();
                }}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-electricBlue to-blue-500 hover:from-blue-400 hover:to-electricBlue text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-1.5"
              >
                <span>Explore Gyms & Book Slot</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* CARD 2: GYM OWNER */}
            <div className="glass-panel p-5 rounded-3xl border border-emerald-400/30 bg-slate-900/90 hover:border-emerald-400 transition-all shadow-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white font-outfit">Gym Owner</h3>
                    <span className="text-[11px] text-emerald-400 font-bold block">Monetize Off-Peak Slots</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  List your facility for free, manage trainers with custom revenue splits, and receive 24–48h UPI payouts.
                </p>
              </div>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  onOpenGymOwnerAuth();
                }}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all flex items-center justify-center gap-1.5"
              >
                <span>List Gym / Owner Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Micro Metrics Trust Bar */}
          <div className="grid grid-cols-4 gap-2 pt-2 max-w-lg mx-auto text-center">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="text-base sm:text-lg font-black text-white font-outfit">4.9 ★</div>
              <div className="text-[10px] text-slate-400">Verified Rating</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="text-base sm:text-lg font-black text-electricBlue font-outfit">₹200</div>
              <div className="text-[10px] text-slate-400">Starting Price</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="text-base sm:text-lg font-black text-vibrantOrange font-outfit">100%</div>
              <div className="text-[10px] text-slate-400">Audited Gyms</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="text-base sm:text-lg font-black text-emerald-400 font-outfit">0 Lock-in</div>
              <div className="text-[10px] text-slate-400">Total Freedom</div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. TRADITIONAL GYMS VS FITUP COMPARISON TABLE */}
      {/* ========================================================= */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-electricBlue/20 shadow-2xl space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vibrantOrange/10 border border-vibrantOrange/30 text-vibrantOrange text-xs font-bold">
            <Zap className="w-3.5 h-3.5" /> THE GYM MEMBERSHIP TRAP IS OVER
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
            Why Pay For 365 Days When You Only Work Out 50?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Traditional gyms rely on you paying ₹6,000 to ₹15,000 upfront and never showing up. FITUP gives you total control.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/70">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/80 font-mono text-[11px] uppercase">
                <th className="p-4 text-slate-400">Feature</th>
                <th className="p-4 text-rose-400">Traditional Gyms</th>
                <th className="p-4 text-electricBlue">FITUP Model</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              <tr>
                <td className="p-4 font-bold text-white">Payment Model</td>
                <td className="p-4 text-rose-400 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 flex-shrink-0" /> ₹6,000 – ₹15,000 Upfront Lock-in
                </td>
                <td className="p-4 text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" /> ₹200 – ₹280 Pay-Per-Session</span>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-white">Personal Training</td>
                <td className="p-4 text-rose-400">
                  <span className="flex items-center gap-1.5"><XCircle className="w-4 h-4 flex-shrink-0" /> Extra ₹4,000 – ₹8,000 / Month</span>
                </td>
                <td className="p-4 text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" /> 1-on-1 PT Included with Every Slot</span>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-white">Location Flexibility</td>
                <td className="p-4 text-rose-400">
                  <span className="flex items-center gap-1.5"><XCircle className="w-4 h-4 flex-shrink-0" /> Tied down to 1 single branch</span>
                </td>
                <td className="p-4 text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" /> Access any verified partner gym</span>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-white">Commitment & Penalties</td>
                <td className="p-4 text-rose-400">
                  <span className="flex items-center gap-1.5"><XCircle className="w-4 h-4 flex-shrink-0" /> Annual contracts & admission fees</span>
                </td>
                <td className="p-4 text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" /> Zero commitments, zero hidden fees</span>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-white">Cancellation & Refund</td>
                <td className="p-4 text-rose-400">
                  <span className="flex items-center gap-1.5"><XCircle className="w-4 h-4 flex-shrink-0" /> Strictly Non-Refundable</span>
                </td>
                <td className="p-4 text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" /> 100% Instant Refund Policy</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. 3-STEP "HOW IT WORKS" GUIDE */}
      {/* ========================================================= */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electricBlue/10 border border-electricBlue/30 text-electricBlue text-xs font-bold">
            <Clock className="w-3.5 h-3.5" /> SIMPLE 3-STEP PROCESS
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
            How FITUP Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass-panel p-6 rounded-3xl border border-white/10 relative space-y-3">
            <div className="text-4xl font-black text-electricBlue/30 font-outfit">01</div>
            <h3 className="text-lg font-bold text-white font-outfit">Select Nearby Arena</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Browse verified fitness studios in your area with AC, Steam, Lockers, and Heavy Lifting equipment.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 relative space-y-3">
            <div className="text-4xl font-black text-vibrantOrange/30 font-outfit">02</div>
            <h3 className="text-lg font-bold text-white font-outfit">Pick Slot & Coach</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose your preferred 2-hour workout time slot and get matched with an ACE/CSCS certified floor trainer.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10 relative space-y-3">
            <div className="text-4xl font-black text-emerald-400/30 font-outfit">03</div>
            <h3 className="text-lg font-bold text-white font-outfit">Scan QR & Lift</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Flash your digital check-in pass at the front desk for instant entry. 100% refund if cancelled &gt; 2h before.
            </p>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. FAQ ACCORDION */}
      {/* ========================================================= */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-white/10 text-slate-300 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5 text-electricBlue" /> FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="text-2xl font-extrabold text-white font-outfit">
            Everything You Need To Know
          </h2>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {FAQS.map((faq, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl bg-slate-900/80 border border-white/5 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-electricBlue transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180 text-electricBlue' : ''}`} />
              </button>

              {activeFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-2">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
