import React, { useState } from 'react';
import { GalaxyCanvas } from './GalaxyCanvas';
import { soundEffects } from '../services/soundEffects';
import { 
  Dumbbell, Building2, Sparkles, ShieldCheck, CheckCircle2, 
  XCircle, ArrowRight, UserCheck, Tag, Zap, Clock, Shield,
  ChevronDown, HelpCircle, Target, Compass, Flame, Award,
  Users, Layers, HeartHandshake, Check
} from 'lucide-react';

export const MasterLandingPage = ({ 
  onGetStarted,
  onOpenLegal 
}) => {
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
      a: "Yes! Every trial slot pass includes 1-on-1 dedicated floor guidance from a certified Trainer Pro (specialized in Strength, Hypertrophy, HIIT, or Mobility)."
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
    <div className="space-y-20 animate-fadeIn pb-16">
      
      {/* ========================================================= */}
      {/* 1. HERO SECTION WITH 60FPS GALAXY CANVAS */}
      {/* ========================================================= */}
      <div className="relative min-h-[640px] sm:min-h-[700px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col justify-center items-center text-center p-6 sm:p-14 bg-slate-950">
        
        {/* Ambient Glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-electricBlue/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-vibrantOrange/10 rounded-full blur-3xl pointer-events-none" />

        {/* 60fps Starfield Canvas */}
        <GalaxyCanvas />

        {/* Hero Foreground Content */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-electricBlue/10 border border-electricBlue/30 text-electricBlue text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.25)] animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NO SUBSCRIPTIONS • 100% FREEDOM • PAY PER WORKOUT</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white font-outfit tracking-tight leading-tight">
            BOOK. LIFT. <span className="text-transparent bg-clip-text bg-gradient-to-r from-electricBlue via-cyan-400 to-blue-500">REPEAT.</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-vibrantOrange to-amber-500">
              ZERO MONTHLY LOCK-INS.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            Experience premium 2-hour workout passes with certified 1-on-1 personal training at top fitness studios starting at just <strong className="text-white font-bold">₹200 – ₹280 per session</strong>. Never waste money on unused gym memberships again.
          </p>

          {/* Live Price Highlight Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <div className="px-3.5 py-1.5 rounded-xl bg-electricBlue/10 border border-electricBlue/30 text-white text-xs font-semibold flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-electricBlue" />
              <span>Trial Slots: <strong className="text-electricBlue">₹200 - ₹280</strong> / 2-Hrs</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-white text-xs font-semibold flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Personal Trainer Included</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-vibrantOrange/10 border border-vibrantOrange/30 text-white text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-vibrantOrange" />
              <span>100% Instant Refund Guarantee</span>
            </div>
          </div>

          {/* PRIMARY GET STARTED HERO BUTTON */}
          <div className="pt-6">
            <button
              onClick={() => {
                soundEffects.playClick();
                onGetStarted();
              }}
              className="px-8 py-4 bg-gradient-to-r from-electricBlue via-blue-500 to-vibrantOrange hover:from-blue-400 hover:to-electricBlue text-slate-950 font-black rounded-2xl text-base sm:text-lg shadow-[0_0_35px_rgba(0,240,255,0.45)] transition-all flex items-center justify-center gap-3 mx-auto transform hover:scale-105 active:scale-95 cursor-pointer group"
            >
              <Flame className="w-5 h-5 text-slate-950 fill-slate-950" />
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[11px] text-slate-400 mt-2 font-medium tracking-wide">
              Step 1 of 2 • Click to choose your role as a Gym Enthusiast or Gym Facility Partner
            </p>
          </div>

          {/* Micro Metrics Trust Bar */}
          <div className="grid grid-cols-4 gap-2.5 pt-6 max-w-xl mx-auto text-center">
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/5">
              <div className="text-base sm:text-xl font-black text-white font-outfit">4.9 ★</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Verified Rating</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/5">
              <div className="text-base sm:text-xl font-black text-electricBlue font-outfit">₹200</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Starting Price</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/5">
              <div className="text-base sm:text-xl font-black text-vibrantOrange font-outfit">100%</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Audited Gyms</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/5">
              <div className="text-base sm:text-xl font-black text-emerald-400 font-outfit">0 Lock-In</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Freedom</div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. THE FITUP DREAM, AIM & ECOSYSTEM (VISION STORY) */}
      {/* ========================================================= */}
      <div className="space-y-10">
        
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-electricBlue/10 border border-electricBlue/30 text-electricBlue text-xs font-bold uppercase tracking-wider">
            <Target className="w-3.5 h-3.5" /> OUR MISSION & ECOSYSTEM
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-outfit">
            Redefining How India Works Out
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            FITUP was born with a singular dream: to liberate fitness enthusiasts from coercive annual contracts, while empowering local fitness centers and certified coaches with direct daily revenue.
          </p>
        </div>

        {/* 3 Core Ecosystem Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pillar 1: The Dream for Athletes */}
          <div className="glass-panel p-7 rounded-3xl border border-electricBlue/30 bg-gradient-to-b from-slate-900/90 to-slate-950 space-y-4 shadow-[0_0_30px_rgba(0,240,255,0.08)]">
            <div className="w-12 h-12 rounded-2xl bg-electricBlue/10 border border-electricBlue/30 text-electricBlue flex items-center justify-center font-bold">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-electricBlue">The Dream</span>
              <h3 className="text-xl font-bold text-white font-outfit mt-0.5">Freedom for Athletes</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              No registration fees, no annual lock-ins, and no wasted money. Work out when you want, where you want, for a flat ₹200–₹280 with personal training included.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-white/5">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-electricBlue" />
                <span>Pay only for actual workout hours</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-electricBlue" />
                <span>Instant QR pass & 100% refund guarantee</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2: The Aim for Gym Owners */}
          <div className="glass-panel p-7 rounded-3xl border border-emerald-400/30 bg-gradient-to-b from-slate-900/90 to-slate-950 space-y-4 shadow-[0_0_30px_rgba(52,211,153,0.08)]">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">The Aim</span>
              <h3 className="text-xl font-bold text-white font-outfit mt-0.5">Empowering Gym Facilities</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Monetize empty floor capacity and non-peak gym slots without spending on advertising. Accumulate 30% digital wallet revenue with 24–48h automated UPI payouts.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-white/5">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero upfront listing fees</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Customizable trainer roster & splits</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3: The Ecosystem for Trainers */}
          <div className="glass-panel p-7 rounded-3xl border border-vibrantOrange/30 bg-gradient-to-b from-slate-900/90 to-slate-950 space-y-4 shadow-[0_0_30px_rgba(255,85,0,0.08)]">
            <div className="w-12 h-12 rounded-2xl bg-vibrantOrange/10 border border-vibrantOrange/30 text-vibrantOrange flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-vibrantOrange">The Goal</span>
              <h3 className="text-xl font-bold text-white font-outfit mt-0.5">Dignity for Trainers</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Certified floor trainers receive fair compensation directly per session. Guaranteed matching with users seeking genuine strength, HIIT, or hypertrophy coaching.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-white/5">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-vibrantOrange" />
                <span>Direct payout share per session</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-vibrantOrange" />
                <span>Transparent client session tracking</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. TRADITIONAL GYMS VS FITUP COMPARISON TABLE */}
      {/* ========================================================= */}
      <div className="glass-panel p-6 sm:p-9 rounded-3xl border border-electricBlue/20 shadow-2xl space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vibrantOrange/10 border border-vibrantOrange/30 text-vibrantOrange text-xs font-bold uppercase">
            <Zap className="w-3.5 h-3.5" /> THE GYM MEMBERSHIP TRAP IS OVER
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-outfit">
            Why Pay For 365 Days When You Only Work Out 50?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Traditional gyms rely on upfront locked-in cash. FITUP puts complete control back in your hands.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/70">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/80 font-mono text-[11px] uppercase">
                <th className="p-4 text-slate-400">Feature</th>
                <th className="p-4 text-rose-400">Traditional Gyms</th>
                <th className="p-4 text-electricBlue">FITUP Ecosystem</th>
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
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" /> 1-on-1 PT Included with Every Pass</span>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-white">Location Flexibility</td>
                <td className="p-4 text-rose-400">
                  <span className="flex items-center gap-1.5"><XCircle className="w-4 h-4 flex-shrink-0" /> Locked to 1 single branch</span>
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
      {/* 4. 3-STEP "HOW IT WORKS" GUIDE */}
      {/* ========================================================= */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electricBlue/10 border border-electricBlue/30 text-electricBlue text-xs font-bold uppercase">
            <Clock className="w-3.5 h-3.5" /> SIMPLE 3-STEP PROCESS
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-outfit">
            How FITUP Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass-panel p-7 rounded-3xl border border-white/10 relative space-y-3">
            <div className="text-4xl font-black text-electricBlue/30 font-outfit">01</div>
            <h3 className="text-lg font-bold text-white font-outfit">Select Nearby Arena</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Browse verified fitness studios in your area with AC, Steam, Lockers, and Heavy Lifting equipment.
            </p>
          </div>

          <div className="glass-panel p-7 rounded-3xl border border-white/10 relative space-y-3">
            <div className="text-4xl font-black text-vibrantOrange/30 font-outfit">02</div>
            <h3 className="text-lg font-bold text-white font-outfit">Pick Slot & Coach</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose your preferred 2-hour workout time slot and get matched with an ACE/CSCS certified floor trainer.
            </p>
          </div>

          <div className="glass-panel p-7 rounded-3xl border border-white/10 relative space-y-3">
            <div className="text-4xl font-black text-emerald-400/30 font-outfit">03</div>
            <h3 className="text-lg font-bold text-white font-outfit">Scan QR & Lift</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Flash your digital check-in pass at the front desk for instant entry. 100% refund if cancelled &gt; 2h before.
            </p>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. FAQ ACCORDION */}
      {/* ========================================================= */}
      <div className="glass-panel p-6 sm:p-9 rounded-3xl border border-white/10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-white/10 text-slate-300 text-xs font-bold uppercase">
            <HelpCircle className="w-3.5 h-3.5 text-electricBlue" /> FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="text-2xl font-black text-white font-outfit">
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
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-electricBlue transition-colors cursor-pointer"
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

      {/* ========================================================= */}
      {/* 6. BOTTOM CALL TO ACTION: GET STARTED */}
      {/* ========================================================= */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-electricBlue/40 text-center space-y-6 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-[0_0_40px_rgba(0,240,255,0.2)]">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-electricBlue block">
            JOIN THE REVOLUTION
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-outfit">
            Ready To Train On Your Terms?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Step inside to choose whether you're working out as a Gym Enthusiast or partnering with us as a Gym Facility Owner.
          </p>
        </div>

        <div>
          <button
            onClick={() => {
              soundEffects.playClick();
              onGetStarted();
            }}
            className="px-10 py-4 bg-gradient-to-r from-electricBlue via-blue-500 to-vibrantOrange hover:from-blue-400 hover:to-electricBlue text-slate-950 font-black rounded-2xl text-base sm:text-lg shadow-[0_0_35px_rgba(0,240,255,0.45)] transition-all flex items-center justify-center gap-3 mx-auto transform hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <Flame className="w-5 h-5 text-slate-950 fill-slate-950" />
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

    </div>
  );
};
