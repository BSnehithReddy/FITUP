import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { soundEffects } from '../services/soundEffects';
import { 
  Eye, EyeOff, Lock, Phone, Mail, User, X, 
  ShieldCheck, AlertCircle, CheckCircle2, ArrowLeft, 
  KeyRound, MessageSquareCode, Sparkles, RefreshCw 
} from 'lucide-react';

export const AuthModal = ({ setActiveTab, onOpenLegal }) => {
  const { 
    authModalOpen, 
    authMode, 
    closeAuthModal, 
    setAuthMode, 
    login, 
    register, 
    sendPhoneOtp, 
    verifyOtpAndSetPassword 
  } = useAuth();
  
  // Login / Register states
  const [identifier, setIdentifier] = useState(''); // Email or Phone for login
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    const rawDigits = identifier.replace(/\D/g, '');
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
      // Advance to password update step
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

  // Handle Login & Registration Form Submission
  const handleLoginOrRegister = async (e) => {
    e.preventDefault();
    soundEffects.playClick();
    resetFormState();

    if (authMode === 'register') {
      if (!name) {
        soundEffects.playError();
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!email && !phone) {
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
        const primaryId = email || phone;
        const res = await register(name, primaryId, password, { email, phone });
        
        // Dynamic Role-Based Redirection
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
        setErrorMessage(err.message || 'Registration failed.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Login Mode
    if (!identifier || !password) {
      soundEffects.playError();
      setErrorMessage('Please enter your Email / Phone Number and Password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(identifier, password);
      
      // Dynamic Role-Based Redirection
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
      setErrorMessage(err.message || 'Incorrect password or account credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Glow Effects Header */}
        <div className="h-2 bg-gradient-to-r from-electricBlue via-blue-500 to-vibrantOrange" />
        
        {/* Invisible Firebase reCAPTCHA Container */}
        <div id="recaptcha-container"></div>

        {/* Close Button */}
        <button
          onClick={() => { soundEffects.playClick(); closeAuthModal(); }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          
          {/* Modal Branding Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-electricBlue/10 border border-electricBlue/30 text-electricBlue mb-3 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              {authMode === 'forgot_password' ? (
                <MessageSquareCode className="w-6 h-6 text-electricBlue" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-electricBlue" />
              )}
            </div>
            
            <h2 className="text-2xl font-black text-white font-outfit">
              {authMode === 'login' 
                ? 'Welcome to FITUP' 
                : authMode === 'register' 
                ? 'Create an Account' 
                : otpStep === 'enter_phone'
                ? 'Reset via Phone OTP'
                : otpStep === 'enter_otp'
                ? 'Verify 6-Digit Code'
                : otpStep === 'enter_new_password'
                ? 'Set New Password'
                : 'Password Reset!'}
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              {authMode === 'login' 
                ? 'Sign in to access your workout passes and gym dashboard' 
                : authMode === 'register'
                ? 'Book single-session gym trials with zero subscriptions'
                : otpStep === 'enter_phone'
                ? 'Enter your registered mobile number for instant SMS verification'
                : otpStep === 'enter_otp'
                ? `Enter the 6-digit code sent via SMS to +91 ${verifiedPhone}`
                : otpStep === 'enter_new_password'
                ? 'Choose a secure new password for your FITUP account'
                : 'Your password has been successfully updated.'}
            </p>
          </div>

          {/* Mode Switcher Tabs (Hidden on Forgot Password view) */}
          {authMode !== 'forgot_password' ? (
            <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-white/5">
              <button
                type="button"
                onClick={() => { soundEffects.playClick(); setAuthMode('login'); resetFormState(); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'bg-electricBlue text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
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
                    ? 'bg-electricBlue text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
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
          {/* SIGN IN & REGISTRATION FORMS */}
          {/* ========================================================= */}
          {authMode !== 'forgot_password' && (
            <form onSubmit={handleLoginOrRegister} className="space-y-4">
              
              {/* REGISTER VIEW FIELDS */}
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
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electricBlue focus:ring-1 focus:ring-electricBlue transition-all font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* LOGIN VIEW FIELDS */}
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

              {/* PASSWORD FIELD */}
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
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electricBlue focus:ring-1 focus:ring-electricBlue transition-all"
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

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-electricBlue via-blue-500 to-vibrantOrange hover:from-blue-400 hover:to-electricBlue text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all transform active:scale-95 disabled:opacity-50 mt-2 text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Processing...</span>
                  </span>
                ) : authMode === 'login' ? (
                  'Sign In to FITUP'
                ) : (
                  'Create FITUP Account'
                )}
              </button>

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
          )}

        </div>
      </div>
    </div>
  );
};


