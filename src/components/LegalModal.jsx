import React, { useState } from 'react';
import { X, ShieldCheck, FileText, RefreshCw, Lock, Trash2, CheckCircle2, ChevronRight, Phone, Mail } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

export const LegalModal = ({ isOpen, onClose, initialTab = 'privacy', onOpenDeleteAccount }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Keep internal tab in sync if initialTab prop changes
  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
        
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 bg-gradient-to-r from-electricBlue via-blue-500 to-vibrantOrange flex-shrink-0" />

        {/* Header with Navigation Tabs */}
        <div className="p-4 md:p-6 border-b border-white/10 flex-shrink-0 bg-slate-950/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-electricBlue/10 border border-electricBlue/30 text-electricBlue flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white font-outfit">
                  FITUP Legal & Compliance
                </h2>
                <p className="text-xs text-slate-400">
                  Google Play & Regulatory Governance Documentation • Last Updated: Sept 2026
                </p>
              </div>
            </div>

            <button
              onClick={() => { soundEffects.playClick(); onClose(); }}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => { soundEffects.playClick(); setActiveTab('privacy'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'privacy'
                  ? 'bg-electricBlue text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Privacy Policy</span>
            </button>

            <button
              onClick={() => { soundEffects.playClick(); setActiveTab('terms'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'terms'
                  ? 'bg-electricBlue text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Terms & Conditions</span>
            </button>

            <button
              onClick={() => { soundEffects.playClick(); setActiveTab('refund'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'refund'
                  ? 'bg-electricBlue text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Cancellation & Refunds</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 text-slate-300 text-xs md:text-sm leading-relaxed">
          
          {/* TAB 1: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
                <strong>Overview:</strong> FITUP ("we", "our", or "us") is dedicated to safeguarding your privacy. This document outlines how we collect, handle, store, and erase personal data across our Android app and web platforms in strict accordance with Google Play Developer Policies, GDPR, and Indian Information Technology (IT) guidelines.
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-electricBlue" />
                  1. Information We Collect
                </h3>
                <p>When you use the FITUP platform to discover gyms, book trial personal training sessions, or register as a partner gym owner or certified trainer, we collect the following minimal data:</p>
                <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
                  <li><strong>Account Identifiers:</strong> Your phone number and display name used for authentication, booking verification, and session reminders.</li>
                  <li><strong>Transaction & Booking Details:</strong> Scheduled slot time, selected partner gym, chosen trainer, booking reference ID, and payment status.</li>
                  <li><strong>Payment Verification Media:</strong> When uploading a payment screenshot or UPI receipt, the image is processed solely for verifying the transaction amount and reference number.</li>
                  <li><strong>Technical Diagnostics:</strong> Anonymized crash logs and device metrics (via Firebase Crashlytics & Analytics) to diagnose application stability and prevent errors.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-electricBlue" />
                  2. Purpose & Use of Collected Data
                </h3>
                <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
                  <li>To allocate and guarantee your 2-hour workout slot at the chosen fitness facility.</li>
                  <li>To facilitate communication and coordination with your assigned personal trainer.</li>
                  <li>To prevent double-booking of gym equipment and trainer slots.</li>
                  <li>To process revenue distributions (20% platform, 30% gym, 50% trainer) and settle approved trainer withdrawals.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-electricBlue" />
                  3. Device Permissions & Camera Access
                </h3>
                <p>
                  FITUP requests access to device storage/photos solely for the purpose of selecting and uploading UPI payment confirmation screenshots or gym/trainer avatar images. We do not access background media or personal photo galleries.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  4. Google Play Account & Data Deletion Compliance
                </h3>
                <p>
                  In compliance with Google Play's Account Deletion Policy, all users, trainers, and gym partners have the unconditional right to request the permanent deletion of their account and associated data.
                </p>
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                  <p className="font-semibold text-white">How to Delete Your Account:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-xs">
                    <li>Log into your FITUP account.</li>
                    <li>Navigate to your profile or settings dashboard.</li>
                    <li>Tap the <strong>"Delete Account & Data"</strong> button and type <strong className="text-rose-400">DELETE</strong> to confirm.</li>
                    <li>Alternatively, contact our Data Protection Officer at <a href="mailto:fitup.official@gmail.com" className="text-electricBlue underline">fitup.official@gmail.com</a> with your registered phone number.</li>
                  </ol>
                  {onOpenDeleteAccount && (
                    <button
                      onClick={() => { onClose(); onOpenDeleteAccount(); }}
                      className="mt-2 px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold border border-rose-500/30 transition-all flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Open Account Deletion Tool
                    </button>
                  )}
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-electricBlue" />
                  5. Contact & Privacy Inquiries
                </h3>
                <p>For any inquiries regarding data protection, please contact:</p>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-1 text-xs">
                  <p><strong>FITUP Fitness Technologies</strong></p>
                  <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-electricBlue" /> fitup.official@gmail.com</p>
                  <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-electricBlue" /> +91 9030118909</p>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                <strong>Agreement to Terms:</strong> By downloading, browsing, or booking a session through the FITUP application, you agree to be bound by these Terms & Conditions.
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-electricBlue" />
                  1. Nature of the FITUP Platform
                </h3>
                <p>
                  FITUP is a fitness technology aggregator facilitating single-session, pay-per-workout access to partner fitness studios and independent certified personal trainers. FITUP is not an employer of personal trainers, but acts as an authorized booking and scheduling facilitator.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-electricBlue" />
                  2. Single-Session Trial Pass Rules
                </h3>
                <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
                  <li>Each booked trial slot provides exactly 2 hours of gym floor access and 1-on-1 trainer guidance.</li>
                  <li>Passes are valid solely for the scheduled date, time slot, and gym location specified on the digital pass ticket.</li>
                  <li>Users must present their digital pass QR code / Booking ID at the gym front desk upon arrival.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-electricBlue" />
                  3. Health, Physical Fitness & Safety Disclaimer
                </h3>
                <p>
                  Physical exercise involves inherent risk. Users are strongly advised to consult a medical practitioner before participating in strenuous training. FITUP, its partner gyms, and assigned trainers shall not be held liable for personal injury resulting from pre-existing health conditions or failure to observe equipment safety instructions.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-electricBlue" />
                  4. Partner Facility Code of Conduct
                </h3>
                <p>
                  Users must adhere to the rules and decorum of the partner gym, including wearing appropriate sports attire, clean athletic shoes, and treating trainers and other gym members with respect.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-electricBlue" />
                  5. Payment Settlement & Revenue Model
                </h3>
                <p>
                  All slot bookings are settled at the time of reservation. Platform fees are dynamically distributed in accordance with the established revenue split (20% Platform Maintenance, 30% Gym Facility, 50% Personal Trainer).
                </p>
              </section>
            </div>
          )}

          {/* TAB 3: CANCELLATION & REFUND POLICY */}
          {activeTab === 'refund' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                <strong>Customer Satisfaction Guarantee:</strong> We ensure transparent, hassle-free booking cancellations and prompt refund processing for all FITUP members.
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  1. Free Cancellation & Rescheduling Window
                </h3>
                <p>
                  You can reschedule or cancel your booked 2-hour workout slot free of charge up to <strong>2 hours</strong> before the session start time.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  2. 100% Instant Refund Scenarios
                </h3>
                <p>A full 100% refund is automatically issued to the original payment source in the following cases:</p>
                <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
                  <li>If the assigned personal trainer is unavailable and no suitable replacement is provided.</li>
                  <li>If the partner gym is temporarily closed or inaccessible due to maintenance.</li>
                  <li>If an automated UPI payment verification fails or a duplicate charge occurs.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  3. Refund Processing Timeline
                </h3>
                <p>
                  Approved refunds are processed back to the customer's UPI ID / bank account within <strong>24 to 48 business hours</strong> via Razorpay or direct UPI transfer.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  4. Trainer Payout Settlements & Disputes
                </h3>
                <p>
                  Gym owners and personal trainers can request digital wallet withdrawals at any time. Withdrawal requests enter a 12 to 48-hour processing window for compliance verification and payout execution by the Master Admin.
                </p>
              </section>

              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2 text-xs">
                <p className="font-bold text-white">Need Help with a Booking or Refund?</p>
                <p className="text-slate-400">Reach out to our 24/7 Support Desk with your Booking ID (e.g., FT-903001):</p>
                <p className="text-electricBlue font-mono">support@fitup.app • +91 9030118909</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer with Acknowledgment */}
        <div className="p-4 md:p-5 border-t border-white/10 bg-slate-950/80 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Google Play Policy Compliant</span>
          </div>

          <button
            onClick={() => { soundEffects.playClick(); onClose(); }}
            className="px-6 py-2 bg-gradient-to-r from-electricBlue to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-105 transition-all"
          >
            I Understand & Accept
          </button>
        </div>

      </div>
    </div>
  );
};
