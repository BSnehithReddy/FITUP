import { db, analytics, collection, addDoc, doc, setDoc } from '../firebase';
import { logEvent } from 'firebase/analytics';

class CrashlyticsService {
  constructor() {
    this.initialized = false;
    this.currentUser = null;
    this.customAttributes = {};
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    // Load active session user if present
    try {
      const saved = localStorage.getItem('fitup_user_session');
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    } catch (e) {}

    // Listen for custom auth events
    window.addEventListener('fitup_user_change', (e) => {
      this.currentUser = e.detail || null;
    });

    // Capture Unhandled Synchronous & Asynchronous Errors
    window.addEventListener('error', (event) => {
      this.recordError(event.error || event.message, {
        source: 'window.onerror',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }, false);
    });

    // Capture Unhandled Promise Rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError(event.reason || 'Unhandled Promise Rejection', {
        source: 'window.onunhandledrejection'
      }, false);
    });

    console.log("🔥 FITUP Firebase Crashlytics & Error Reporting Initialized.");
  }

  setUser(user) {
    this.currentUser = user ? {
      phone: user.phone || 'anonymous',
      name: user.name || 'Anonymous User',
      role: user.role || 'client'
    } : null;
  }

  setCustomAttribute(key, value) {
    this.customAttributes[key] = value;
  }

  async recordError(error, context = {}, fatal = false) {
    try {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || (error?.toString ? error.toString() : 'Unknown Error');

      const errorStack = error?.stack || (new Error().stack);

      const crashData = {
        message: errorMessage,
        stack: errorStack || '',
        fatal: Boolean(fatal),
        context: {
          ...this.customAttributes,
          ...context
        },
        user: this.currentUser ? {
          phone: this.currentUser.phone,
          name: this.currentUser.name,
          role: this.currentUser.role
        } : { phone: 'unauthenticated', role: 'guest' },
        appVersion: '1.0.0',
        platform: typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.() ? 'Android Native' : 'Web / PWA',
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        timestamp: new Date().toISOString()
      };

      console.warn(`[Crashlytics Record] ${fatal ? 'FATAL' : 'NON-FATAL'}:`, errorMessage, crashData);

      // 1. Send exception to Firebase Analytics if supported
      if (analytics) {
        try {
          logEvent(analytics, 'app_exception', {
            description: errorMessage.substring(0, 100),
            fatal: fatal ? 1 : 0,
            platform: crashData.platform
          });
        } catch (e) {}
      }

      // 2. Persist error report to Firestore 'crashes' collection
      try {
        await addDoc(collection(db, 'crashes'), crashData);
      } catch (firestoreErr) {
        // Fallback local storage logging if offline
        const existing = JSON.parse(localStorage.getItem('fitup_offline_crashes') || '[]');
        existing.push({ ...crashData, id: 'offline_' + Date.now() });
        localStorage.setItem('fitup_offline_crashes', JSON.stringify(existing.slice(-20)));
      }

    } catch (err) {
      console.error("Failed to record error to Crashlytics:", err);
    }
  }

  log(message) {
    console.log(`[Crashlytics Log]: ${message}`);
    if (analytics) {
      try {
        logEvent(analytics, 'custom_log', { message: message.substring(0, 100) });
      } catch (e) {}
    }
  }

  // Helper method for testing Crashlytics pipeline
  testCrash() {
    console.warn("Triggering test non-fatal exception for Firebase Crashlytics verification...");
    this.recordError(new Error("FITUP Crashlytics Test Error - Verification of Live Reporting Pipeline"), {
      test: true,
      trigger: "Manual Developer Test"
    }, false);
  }
}

export const crashlyticsService = new CrashlyticsService();
