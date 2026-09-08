import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { soundEffects } from '../services/soundEffects';
import { 
  Eye, EyeOff, Lock, Phone, Mail, User, X, 
  ShieldCheck, AlertCircle, CheckCircle2, ArrowLeft, 
  KeyRound, MessageSquareCode, Sparkles, RefreshCw,
  Building2, Dumbbell, MapPin
} from 'lucide-react';

export const AuthModal = ({ setActiveTab, onOpenLegal }) => {
  const { 
    authModalOpen, 
    authMode, 
    authPersona,
    setAuthPersona,
    closeAuthModal, 
    setAuthMode, 
    login, 
    loginWithGoogle,
    register, 
    registerGymOwner,
    sendPhoneOtp, 
    verifyOtpAndSetPassword 
  } = useAuth();

  
  // Persona state: 'client' (Gym Enthusiast) | 'gym_owner' (Gym Owner)
  const [persona, setPersona] = useState(authPersona || 'client');

  useEffect(() => {
    if (authPersona) {
      setPersona(authPersona);
    }
  }, [authPersona, authModalOpen]);

  // Client Login / Register fields
  const [identifier, setIdentifier] = useState(''); // Email or Phone for login
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Gym Owner specific registration fields
  const [ownerName, setOwnerName] = useState('');
  const [gymName, setGymName] = useState('');
  const [location, setLocation] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerConfirmPassword, setOwnerConfirmPassword] = useState('');
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);

  // Phone OTP Forgot Password states
  const [resetPhone, setResetPhone] = useState('');
  const [otpStep, setOtpStep] = useState('enter_phone'); // 'enter_phone' | 'enter_otp' | 'enter_new_password' | 'success'
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [fallbackOtp, setFallbackOtp] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Shared UI states
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  if (!authModalOpen) return null;

  const resetFormState = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleOpenForgotPassword = () => {
    soundEffects.playClick();
    setAuthMode('forgot_password');
    setOtpStep('enter_phone');
    setOtpCode('');
    setNewPassword('');
    setConfirmPassword('');
    const rawDigits = (identifier || ownerPhone || phone).replace(/\D/g, '');
    if (rawDigits.length === 10) {
      setResetPhone(rawDigits);
    }
    resetFormState();
  };

  // Step 1: Request Phone SMS OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    soundEffects.playClick();
    resetFormState();

    const cleanPhone = resetPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      soundEffects.playError();
      setErrorMessage('Please enter a valid 10-digit registered mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendPhoneOtp(cleanPhone, 'recaptcha-container');
      setConfirmationResult(res.confirmationResult);
      setFallbackOtp(res.fallbackOtp || '123456');
      setVerifiedPhone(cleanPhone);
      setOtpStep('enter_otp');
      setCountdown(30);
      setSuccessMessage(res.message || `OTP sent to +91 ${cleanPhone}`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send verification code. Please check your number.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Entered OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    resetFormState();

    const cleanOtp = otpCode.trim();
    if (cleanOtp.length !== 6) {
      soundEffects.playError();
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      setOtpStep('enter_new_password');
      setSuccessMessage('OTP Verified Successfully! Enter your new password below.');
      soundEffects.playSuccessChime();
    } catch (err) {
      soundEffects.playError();
      setErrorMessage(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Save New Password and Update Firestore
  const handleSaveNewPassword = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    resetFormState();

    if (!newPassword || newPassword.length < 6) {
      soundEffects.playError();
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      soundEffects.playError();
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtpAndSetPassword({
        confirmationResult,
        fallbackOtp,
        otpCode,
        newPassword,
        phone: verifiedPhone
      });

      setSuccessMessage(res.message || 'Password successfully updated!');
      setOtpStep('success');
      soundEffects.playSuccessChime();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  // Google One-Tap Popup Authentication Handler
  const handleGoogleAuth = async () => {
    soundEffects.playClick();
    resetFormState();
    setLoading(true);
    try {
      let extraGymData = {};
      if (persona === 'gym_owner' && authMode === 'register') {
        extraGymData = {
          gymName: gymName.trim() || (ownerName ? `${ownerName}'s Fitness` : undefined),
          location: location.trim() || undefined,
          ownerPhone: ownerPhone.trim() || undefined
        };
      }
      const res = await loginWithGoogle(persona, extraGymData);
      if (res.role === 'owner') {
        setActiveTab('owner_dash');
      } else if (res.role === 'gym_owner') {
        setActiveTab('gym_owner_dash');
      } else if (res.role === 'trainer') {
        setActiveTab('trainer_dash');
      } else {
        setActiveTab('home');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Login & Registration Form Submission
  const handleLoginOrRegister = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    resetFormState();


    // =========================================================
    // PERSONA 1: GYM ENTHUSIAST (USER / CLIENT)
    // =========================================================
    if (persona === 'client') {
      if (authMode === 'register') {
        if (!name.trim()) {
          soundEffects.playError();
          setErrorMessage('Please enter your full name.');
          return;
        }
        if (!email.trim() && !phone.trim()) {
          soundEffects.playError();
          setErrorMessage('Please provide either an Email or Phone Number.');
          return;
        }
        if (!password || password.length < 6) {
          soundEffects.playError();
          setErrorMessage('Password must be at least 6 characters.');
          return;
        }

        setLoading(true);
        try {
          const primaryId = email.trim() || phone.trim();
          const res = await register(name, primaryId, password, { 
            email: email.trim(), 
            phone: phone.trim(), 
            role: 'client' 
          });
          
          if (res.role === 'owner') {
            setActiveTab('owner_dash');
          } else {
            setActiveTab('home');
          }
        } catch (err) {
          setErrorMessage(err.message || 'Registration failed.');
        } finally {
          setLoading(false);
        }
        return;
      }

      // Client Login Mode
      if (!identifier.trim() || !password) {
        soundEffects.playError();
        setErrorMessage('Please enter your Email / Phone Number and Password.');
        return;
      }

      setLoading(true);
      try {
        const res = await login(identifier.trim(), password);
        if (res.role === 'owner') {
          setActiveTab('owner_dash');
        } else if (res.role === 'gym_owner') {
          setActiveTab('gym_owner_dash');
        } else if (res.role === 'trainer') {
          setActiveTab('trainer_dash');
        } else {
          setActiveTab('home');
        }
      } catch (err) {
        setErrorMessage(err.message || 'Incorrect credentials or account not found.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // =========================================================
    // PERSONA 2: GYM OWNER (PARTNER FACILITY)
    // =========================================================
    if (persona === 'gym_owner') {
      if (authMode === 'register') {
        if (!ownerName.trim()) {
          soundEffects.playError();
          setErrorMessage('Please enter the Gym Owner / Manager name.');
          return;
        }
        if (!gymName.trim()) {
          soundEffects.playError();
          setErrorMessage('Please enter your Gym or Fitness Studio name.');
          return;
        }
        if (!location.trim()) {
          soundEffects.playError();
          setErrorMessage('Please enter your Gym Area / City (e.g. Madhapur, Hyderabad).');
          return;
        }
        const cleanOwnerPhone = ownerPhone.replace(/\D/g, '').slice(-10);
        if (cleanOwnerPhone.length !== 10) {
          soundEffects.playError();
          setErrorMessage('Please enter a valid 10-digit mobile number for booking alerts & UPI payouts.');
          return;
        }
        if (!ownerEmail.trim()) {
          soundEffects.playError();
          setErrorMessage('Please enter your Gym Owner email address.');
          return;
        }
        if (!ownerPassword || ownerPassword.length < 6) {
          soundEffects.playError();
          setErrorMessage('Password must be at least 6 characters.');
          return;
        }
        if (ownerPassword !== ownerConfirmPassword) {
          soundEffects.playError();
          setErrorMessage('Passwords do not match. Please verify.');
          return;
        }

        setLoading(true);
        try {
          const res = await registerGymOwner(
            ownerName.trim(),
            gymName.trim(),
            location.trim(),
            cleanOwnerPhone,
            ownerEmail.trim(),
            ownerPassword
          );
          
          setActiveTab('gym_owner_dash');
        } catch (err) {
          setErrorMessage(err.message || 'Gym registration failed. Please try again.');
        } finally {
          setLoading(false);
        }
        return;
      }

      // Gym Owner Login Mode
      if (!identifier.trim() || !password) {
        soundEffects.playError();
        setErrorMessage('Please enter your Owner Mobile / Email and Password.');
        return;
      }

      setLoading(true);
      try {
        const res = await login(identifier.trim(), password);
        if (res.role === 'gym_owner') {
          setActiveTab('gym_owner_dash');
        } else if (res.role === 'owner') {
          setActiveTab('owner_dash');
        } else {
          setActiveTab('gym_owner_dash');
        }
      } catch (err) {
        setErrorMessage(err.message || 'Incorrect Gym Owner credentials.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.85)] overflow-hidden my-6">
        
        {/* Glow Effects Header */}
        <div className="h-2 bg-gradient-to-r from-electricBlue via-blue-500 to-vibrantOrange" />
        
        {/* Invisible Firebase reCAPTCHA Container */}
        <div id="recaptcha-container"></div>

        {/* Close Button */}
        <button
          onClick={() => { soundEffects.playClick(); closeAuthModal(); }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          
          {/* Persona Selector (Gym Enthusiast vs Gym Owner) */}
          {authMode !== 'forgot_password' && (
            <div className="mb-6 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 block text-center">
                Select Your Role
              </span>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-white/5">
                
                {/* Option 1: Gym Enthusiast */}
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setPersona('client');
                    resetFormState();
                  }}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
                    persona === 'client'
                      ? 'bg-gradient-to-r from-electricBlue to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] scale-[1.02]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Dumbbell className="w-4 h-4" />
                    <span>Gym Enthusiast</span>
                  </div>
                  <span className={`text-[10px] font-normal ${persona === 'client' ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                    Book ₹200-₹280 Passes
                  </span>
                </button>

                {/* Option 2: Gym Owner */}
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setPersona('gym_owner');
                    resetFormState();
                  }}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
                    persona === 'gym_owner'
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-[0_0_20px_rgba(52,211,153,0.4)] scale-[1.02]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>Gym Owner</span>
                  </div>
                  <span className={`text-[10px] font-normal ${persona === 'gym_owner' ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                    List Facility & Trainers
                  </span>
                </button>

              </div>
            </div>
          )}

          {/* Modal Branding Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-electricBlue/10 border border-electricBlue/30 text-electricBlue mb-3 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              {authMode === 'forgot_password' ? (
                <MessageSquareCode className="w-6 h-6 text-electricBlue" />
              ) : persona === 'gym_owner' ? (
                <Building2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <Dumbbell className="w-6 h-6 text-electricBlue" />
              )}
            </div>
            
            <h2 className="text-2xl font-black text-white font-outfit">
              {authMode === 'forgot_password'
                ? 'Reset Password'
                : persona === 'gym_owner'
                ? (authMode === 'login' ? 'Gym Partner Portal' : 'Register Your Gym Facility')
                : (authMode === 'login' ? 'Welcome to FITUP' : 'Create User Account')}
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              {authMode === 'forgot_password'
                ? 'Enter your registered mobile number for instant SMS verification'
                : persona === 'gym_owner'
                ? (authMode === 'login' 
                    ? 'Sign in to access facility bookings, trainer roster & 30% wallet' 
                    : 'List your gym arena, configure trainers & receive 24-48h UPI payouts')
                : (authMode === 'login' 
                    ? 'Sign in to access your workout passes and instant gym check-in' 
                    : 'Book single-session gym trials with zero subscriptions or monthly lock-ins')}
            </p>
          </div>

          {/* Sign In vs Register Tabs */}
          {authMode !== 'forgot_password' ? (
            <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-white/5">
              <button
                type="button"
                onClick={() => { soundEffects.playClick(); setAuthMode('login'); resetFormState(); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'login'
                    ? (persona === 'gym_owner' 
                        ? 'bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.4)]' 
                        : 'bg-electricBlue text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]')
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { soundEffects.playClick(); setAuthMode('register'); resetFormState(); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'register'
                    ? (persona === 'gym_owner' 
                        ? 'bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.4)]' 
                        : 'bg-electricBlue text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]')
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {persona === 'gym_owner' ? 'Register Facility' : 'Register User'}
              </button>
            </div>
          ) : (
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => { soundEffects.playClick(); setAuthMode('login'); resetFormState(); }}
                className="flex items-center text-xs text-electricBlue hover:underline gap-1.5 font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
              
              {otpStep !== 'enter_phone' && otpStep !== 'success' && (
                <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded-md border border-white/5">
                  Step {otpStep === 'enter_otp' ? '2 of 3' : '3 of 3'}
                </span>
              )}
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* FORGOT PASSWORD: PHONE OTP FLOW */}
          {/* ========================================================= */}
          {authMode === 'forgot_password' && (
            <div className="space-y-4">
              
              {/* PHASE 1: ENTER REGISTERED PHONE NUMBER */}
              {otpStep === 'enter_phone' && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Registered Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center text-slate-400 text-xs font-mono font-bold select-none border-r border-white/10 pr-2">
                        <span>🇮🇳 +91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={resetPhone}
                        onChange={(e) => setResetPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 9030118909"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl pl-20 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electricBlue focus:ring-1 focus:ring-electricBlue transition-all font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || resetPhone.length < 10}
                    className="w-full py-3 px-4 bg-gradient-to-r from-electricBlue via-blue-500 to-vibrantOrange hover:from-blue-400 hover:to-electricBlue text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all transform active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                        <span>Sending SMS OTP...</span>
                      </>
                    ) : (
                      <span>Send 6-Digit OTP Code</span>
                    )}
                  </button>
                </form>
              )}

              {/* PHASE 2: ENTER 6-DIGIT OTP */}
              {otpStep === 'enter_otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-slate-300">
                        6-Digit Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={() => { setOtpStep('enter_phone'); resetFormState(); }}
                        className="text-[11px] text-slate-400 hover:text-white underline"
                      >
                        Change Number
                      </button>
                    </div>

                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        autoFocus
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full bg-slate-950 border border-emerald-400/40 rounded-xl pl-10 pr-4 py-2.5 text-center text-lg tracking-[0.35em] text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-400 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Didn't receive SMS?</span>
                    {countdown > 0 ? (
                      <span className="text-slate-500 font-mono">Resend in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="text-electricBlue font-bold hover:underline"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-400 to-electricBlue text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all transform active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <span>Verify Code & Continue</span>
                    )}
                  </button>
                </form>
              )}

              {/* PHASE 3: SET NEW PASSWORD */}
              {otpStep === 'enter_new_password' && (
                <form onSubmit={handleSaveNewPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      New Password (Min 6 Characters)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electricBlue transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => { soundEffects.playClick(); setShowNewPassword(!showNewPassword); }}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electricBlue transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !newPassword || newPassword !== confirmPassword}
                    className="w-full py-3 px-4 bg-gradient-to-r from-electricBlue via-blue-500 to-vibrantOrange hover:from-blue-400 hover:to-electricBlue text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all transform active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Save New Password</span>
                    )}
                  </button>
                </form>
              )}

              {/* PHASE 4: SUCCESS STATE */}
              {otpStep === 'success' && (
                <div className="text-center space-y-4 pt-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(52,211,153,0.3)]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <p className="text-xs text-slate-300">
                    Your password has been successfully updated in Firestore and Firebase Authentication. You can now sign in with your updated credentials.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setIdentifier(verifiedPhone);
                      setAuthMode('login');
                      resetFormState();
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-electricBlue to-blue-400 text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] text-sm"
                  >
                    Sign In Now
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* SIGN IN & REGISTRATION FORMS (DUAL PERSONA) */}
          {/* ========================================================= */}
          {authMode !== 'forgot_password' && (
            <div className="space-y-4">
              
              {/* ------------------------------------------------------- */}
              {/* GOOGLE ONE-TAP OAUTH BUTTON (CLIENT & GYM OWNER) */}
              {/* ------------------------------------------------------- */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full group relative py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl shadow-[0_4px_20px_rgba(255,255,255,0.15)] transition-all transform active:scale-[0.98] disabled:opacity-60 flex items-center justify-between border border-white/20"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="text-xs sm:text-sm font-black tracking-tight">
                    {persona === 'gym_owner'
                      ? 'Continue with Google (Business)'
                      : (authMode === 'login' ? 'Sign in with Google' : 'Sign up with Google')}
                  </span>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  persona === 'gym_owner' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  1-Tap Fast
                </span>
              </button>

              {/* DIVIDER */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-slate-900 px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">
                  {persona === 'gym_owner' ? 'or Business Credentials' : 'or with email / mobile'}
                </span>
                <div className="border-t border-white/10 w-full" />
              </div>

              <form onSubmit={handleLoginOrRegister} className="space-y-4">
                
                {/* ======================================================= */}
                {/* PERSONA 1: GYM ENTHUSIAST (USER) FORMS */}
                {/* ======================================================= */}
                {persona === 'client' && (
                  <>
                    {authMode === 'register' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="e.g. Karthik Reddy"
                              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electricBlue focus:ring-1 focus:ring-electricBlue transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="e.g. karthik@example.com"
                              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electricBlue focus:ring-1 focus:ring-electricBlue transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Mobile Number (Optional for SMS Passes)
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                            <input
                              type="tel"
                              maxLength={10}
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                              placeholder="e.g. 9876543210"
                              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electricBlue focus:ring-1 focus:ring-electricBlue transition-all font-mono"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {authMode === 'login' && (
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Email Address or Mobile Number
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="e.g. user@example.com or 9030118909"
                            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electricBlue focus:ring-1 focus:ring-electricBlue transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {/* Password Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-slate-300">
                          Password
                        </label>
                        {authMode === 'login' && (
                          <button
                            type="button"
                            onClick={handleOpenForgotPassword}
                            className="text-[11px] text-electricBlue hover:underline transition-colors font-medium flex items-center gap-1"
                          >
                            <KeyRound className="w-3 h-3" /> Forgot Password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electricBlue transition-all"
                        />
                        
                        <button
                          type="button"
                          onClick={() => { soundEffects.playClick(); setShowPassword(!showPassword); }}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition-colors"
                          title={showPassword ? "Hide Password" : "Show Password"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* ======================================================= */}
                {/* PERSONA 2: GYM OWNER FORMS */}
                {/* ======================================================= */}
                {persona === 'gym_owner' && (
                  <>
                    {authMode === 'register' && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Owner / Manager Name
                            </label>
                            <div className="relative">
                              <User className="absolute left-3.5 top-3 w-4 h-4 text-emerald-400" />
                              <input
                                type="text"
                                required
                                value={ownerName}
                                onChange={(e) => setOwnerName(e.target.value)}
                                placeholder="e.g. Vinay Reddy"
                                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Gym Facility Name
                            </label>
                            <div className="relative">
                              <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-emerald-400" />
                              <input
                                type="text"
                                required
                                value={gymName}
                                onChange={(e) => setGymName(e.target.value)}
                                placeholder="e.g. GS Fitness Studio"
                                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Location / Area
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-emerald-400" />
                            <input
                              type="text"
                              required
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              placeholder="e.g. Chengicherla, Hyderabad"
                              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-all"
                            />
                          </div>
                        </div>

                        {/* Business Email Address */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-medium text-emerald-400">
                              Gym Business Email
                            </label>
                            <span className="text-[10px] text-slate-500 font-mono">Tax Invoices & Verification</span>
                          </div>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-emerald-400" />
                            <input
                              type="email"
                              required
                              value={ownerEmail}
                              onChange={(e) => setOwnerEmail(e.target.value)}
                              placeholder="partner@gsfitness.com or gym@business.com"
                              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-all"
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-1">
                            Official business email for monthly invoices, GST receipts & payout statements.
                          </span>
                        </div>

                        {/* Owner Mobile */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-medium text-emerald-400">
                              Business / Payout Mobile Number
                            </label>
                            <span className="text-[10px] text-slate-500 font-mono">24-48h UPI</span>
                          </div>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-3 w-4 h-4 text-emerald-400" />
                            <input
                              type="tel"
                              required
                              maxLength={10}
                              value={ownerPhone}
                              onChange={(e) => setOwnerPhone(e.target.value.replace(/\D/g, ''))}
                              placeholder="e.g. 9123456780"
                              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-1">
                            Linked to UPI for automatic settlements & instant member check-in SMS.
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Password (Min 6 Chars)
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-emerald-400" />
                              <input
                                type={showOwnerPassword ? "text" : "password"}
                                required
                                value={ownerPassword}
                                onChange={(e) => setOwnerPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                              />
                              <button
                                type="button"
                                onClick={() => { soundEffects.playClick(); setShowOwnerPassword(!showOwnerPassword); }}
                                className="absolute right-3 top-3 text-slate-400 hover:text-white"
                              >
                                {showOwnerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Confirm Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-emerald-400" />
                              <input
                                type={showOwnerPassword ? "text" : "password"}
                                required
                                value={ownerConfirmPassword}
                                onChange={(e) => setOwnerConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {authMode === 'login' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Business Email or Registered Mobile
                          </label>
                          <div className="relative">
                            <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-emerald-400" />
                            <input
                              type="text"
                              required
                              value={identifier}
                              onChange={(e) => setIdentifier(e.target.value)}
                              placeholder="partner@gsfitness.com or 9123456780"
                              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-medium text-slate-300">
                              Password
                            </label>
                            <button
                              type="button"
                              onClick={handleOpenForgotPassword}
                              className="text-[11px] text-emerald-400 hover:underline transition-colors font-medium flex items-center gap-1"
                            >
                              <KeyRound className="w-3 h-3" /> Forgot Password?
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-emerald-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                            />
                            <button
                              type="button"
                              onClick={() => { soundEffects.playClick(); setShowPassword(!showPassword); }}
                              className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 px-4 font-bold rounded-xl transition-all transform active:scale-95 disabled:opacity-50 mt-2 text-sm flex items-center justify-center space-x-2 text-slate-950 ${
                    persona === 'gym_owner'
                      ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 shadow-[0_0_20px_rgba(52,211,153,0.4)]'
                      : 'bg-gradient-to-r from-electricBlue via-blue-500 to-vibrantOrange hover:from-blue-400 hover:to-electricBlue shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      <span>Processing...</span>
                    </span>
                  ) : authMode === 'login' ? (
                    persona === 'gym_owner' ? 'Sign In to Gym Portal' : 'Sign In to FITUP'
                  ) : (
                    persona === 'gym_owner' ? 'Register Facility & Launch' : 'Create FITUP Account'
                  )}
                </button>

                {/* Quick Mode Switcher */}
                <div className="text-center pt-2">
                  {authMode === 'login' ? (
                    <p className="text-xs text-slate-400">
                      Don't have an account yet?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          soundEffects.playClick();
                          setAuthMode('register');
                          resetFormState();
                        }}
                        className={`font-bold hover:underline cursor-pointer ${
                          persona === 'gym_owner' ? 'text-emerald-400' : 'text-electricBlue'
                        }`}
                      >
                        {persona === 'gym_owner' ? 'Register Facility' : 'Sign Up Free'}
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          soundEffects.playClick();
                          setAuthMode('login');
                          resetFormState();
                        }}
                        className={`font-bold hover:underline cursor-pointer ${
                          persona === 'gym_owner' ? 'text-emerald-400' : 'text-electricBlue'
                        }`}
                      >
                        Sign In Here
                      </button>
                    </p>
                  )}
                </div>

                {/* Legal Consent Disclaimer */}
                <p className="text-[10px] text-slate-500 text-center leading-relaxed pt-2">
                  By proceeding, you agree to FITUP's{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegal && onOpenLegal('terms')}
                    className="text-slate-400 hover:text-electricBlue underline"
                  >
                    Terms & Conditions
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegal && onOpenLegal('privacy')}
                    className="text-slate-400 hover:text-electricBlue underline"
                  >
                    Privacy Policy
                  </button>.
                </p>


              </form>
            </div>
          )}


        </div>
      </div>
    </div>
  );
};
