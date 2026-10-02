import { functions, httpsCallable, auth, signInWithCustomToken } from '../firebase';
import { soundEffects } from './soundEffects';

/**
 * FITUP Custom 6-Digit SMS OTP Client Service
 * Connects frontend React components to Firebase Cloud Functions backend
 * with multi-gateway SMS support (Fast2SMS / MSG91 / Twilio) and development fallback.
 */
class CustomOtpService {
  constructor() {
    this.sendOtpCallable = null;
    this.verifyOtpCallable = null;

    try {
      if (functions) {
        this.sendOtpCallable = httpsCallable(functions, 'sendCustomOtp');
        this.verifyOtpCallable = httpsCallable(functions, 'verifyCustomOtp');
      }
    } catch (e) {
      console.warn('[CustomOtpService] Cloud Functions callable initialization notice:', e?.message);
    }
  }

  /**
   * Helper: Clean 10-digit Indian phone number
   */
  cleanPhone(phone) {
    if (!phone) return '';
    const digits = phone.toString().replace(/\D/g, '');
    return digits.length === 10 ? digits : digits.slice(-10);
  }

  /**
   * Step 1: Request 6-Digit SMS OTP via Firebase Cloud Functions
   * @param {string} phoneNumber - 10-digit mobile number
   * @param {string} [purpose] - Purpose of OTP ('login' | 'register' | 'forgot_password')
   * @returns {Promise<{ success: boolean, phone: string, fallbackOtp: string, expiresIn: number, message: string }>}
   */
  async sendOtp(phoneNumber, purpose = 'verification') {
    const cleanPhone = this.cleanPhone(phoneNumber);
    if (!cleanPhone || cleanPhone.length !== 10) {
      soundEffects.playError();
      throw new Error('Please enter a valid 10-digit mobile number.');
    }

    try {
      console.log(`[CustomOtpService] Requesting custom OTP for +91 ${cleanPhone}...`);

      if (this.sendOtpCallable) {
        const result = await this.sendOtpCallable({ phone: cleanPhone, purpose });
        const data = result.data || {};
        soundEffects.playSuccessChime();
        return {
          success: true,
          phone: cleanPhone,
          provider: data.provider || 'cloud_function',
          expiresIn: data.expiresIn || 300,
          resendCooldown: data.resendCooldown || 45,
          message: data.message || `A 6-digit verification code has been sent via SMS to +91 ${cleanPhone}.`
        };
      } else {
        // HTTP REST fallback endpoint
        const response = await fetch('/api/sendCustomOtp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone, purpose })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to dispatch SMS OTP.');
        }
        soundEffects.playSuccessChime();
        return {
          success: true,
          phone: cleanPhone,
          provider: data.provider || 'rest_api',
          expiresIn: data.expiresIn || 300,
          resendCooldown: 45,
          message: data.message || `A 6-digit verification code has been sent via SMS to +91 ${cleanPhone}.`
        };
      }
    } catch (err) {
      console.error('[CustomOtpService] Error sending SMS OTP:', err.message);
      soundEffects.playError();
      throw new Error(err.message || 'Failed to dispatch SMS verification code. Please try again.');
    }
  }

  /**
   * Step 2: Verify 6-Digit OTP Code via Firebase Cloud Functions
   * @param {string} phoneNumber - 10-digit mobile number
   * @param {string} otpCode - 6-digit OTP code
   * @param {boolean} [autoSignIn=false] - Whether to automatically sign in with the issued custom token
   * @returns {Promise<{ success: boolean, verified: boolean, customToken: string|null, user: any|null, message: string }>}
   */
  async verifyOtp(phoneNumber, otpCode, autoSignIn = false) {
    const cleanPhone = this.cleanPhone(phoneNumber);
    const cleanOtp = (otpCode || '').toString().trim();

    if (!cleanPhone || cleanPhone.length !== 10) {
      soundEffects.playError();
      throw new Error('Please enter a valid 10-digit mobile number.');
    }

    if (!cleanOtp || cleanOtp.length !== 6) {
      soundEffects.playError();
      throw new Error('Please enter the complete 6-digit verification code.');
    }

    try {
      console.log(`[CustomOtpService] Verifying OTP code for +91 ${cleanPhone}...`);
      let verifiedData = null;

      if (this.verifyOtpCallable) {
        const result = await this.verifyOtpCallable({ phone: cleanPhone, otpCode: cleanOtp });
        verifiedData = result.data || {};
      } else {
        const response = await fetch('/api/verifyCustomOtp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone, otpCode: cleanOtp })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Invalid or expired verification code.');
        }
        verifiedData = data;
      }

      let signedInUser = null;
      if (autoSignIn && verifiedData?.customToken && auth) {
        try {
          const userCred = await signInWithCustomToken(auth, verifiedData.customToken);
          signedInUser = userCred?.user || null;
        } catch (authErr) {
          console.warn('[CustomOtpService] signInWithCustomToken notice:', authErr.message);
        }
      }

      soundEffects.playSuccessChime();
      return {
        success: true,
        verified: true,
        phone: cleanPhone,
        customToken: verifiedData?.customToken || null,
        user: signedInUser,
        message: verifiedData?.message || 'Mobile number verified successfully!'
      };
    } catch (err) {
      console.error('[CustomOtpService] OTP verification failed:', err.message);
      soundEffects.playError();
      throw new Error(err.message || 'Invalid or expired verification code. Please check your SMS.');
    }
  }
}

export const customOtpService = new CustomOtpService();
