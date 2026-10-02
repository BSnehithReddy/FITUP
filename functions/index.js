require('dotenv').config();
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');
const cors = require('cors')({ origin: true });
const smsGateway = require('./services/smsGatewayService');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const OTP_COLLECTION = 'otp_verifications';
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const OTP_RESEND_COOLDOWN_MS = 45 * 1000; // 45 seconds cooldown
const MAX_ATTEMPTS = 3;
const HMAC_SECRET = process.env.OTP_HMAC_SECRET || 'FITUP_SECURE_OTP_SALT_2026';

/**
 * Helper: Clean and extract 10-digit Indian phone number
 */
function clean10DigitPhone(phone) {
  if (!phone) return '';
  const digits = phone.toString().replace(/\D/g, '');
  return digits.length === 10 ? digits : digits.slice(-10);
}

/**
 * Helper: Compute HMAC-SHA256 hash of OTP code
 */
function hashOtp(phone, otp) {
  return crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(`${phone}:${otp}`)
    .digest('hex');
}

/**
 * Helper: Generate cryptographically secure 6-digit numeric OTP
 */
function generate6DigitOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

// =========================================================================
// 1. SEND CUSTOM OTP (Callable & HTTP Handler)
// =========================================================================

async function handleSendOtpCore(phone, purpose = 'verification') {
  const cleanPhone = clean10DigitPhone(phone);
  if (!cleanPhone || cleanPhone.length !== 10) {
    throw new functions.https.HttpsError('invalid-argument', 'Please enter a valid 10-digit mobile number.');
  }

  const docRef = db.collection(OTP_COLLECTION).doc(cleanPhone);
  const snap = await docRef.get();

  // Check resend cooldown
  if (snap.exists) {
    const data = snap.data();
    const timeSinceLastSend = Date.now() - (data.createdAt || 0);
    if (timeSinceLastSend < OTP_RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((OTP_RESEND_COOLDOWN_MS - timeSinceLastSend) / 1000);
      throw new functions.https.HttpsError(
        'resource-exhausted',
        `Please wait ${waitSec}s before requesting a new OTP.`
      );
    }
  }

  // Generate 6-digit OTP
  const otpCode = generate6DigitOtp();
  const hashedCode = hashOtp(cleanPhone, otpCode);
  const now = Date.now();

  // Store verification record in Firestore with TTL
  await docRef.set({
    phone: cleanPhone,
    hashedOtp: hashedCode,
    purpose: purpose,
    attemptsLeft: MAX_ATTEMPTS,
    expiresAt: now + OTP_EXPIRY_MS,
    createdAt: now,
    verified: false
  });

  // Dispatch SMS via chosen gateway (Fast2SMS / MSG91 / Twilio)
  const smsResult = await smsGateway.sendOtp({
    phone: cleanPhone,
    otp: otpCode
  });

  return {
    success: true,
    phone: cleanPhone,
    messageId: smsResult.messageId || null,
    provider: smsResult.provider,
    expiresIn: Math.floor(OTP_EXPIRY_MS / 1000),
    resendCooldown: Math.floor(OTP_RESEND_COOLDOWN_MS / 1000),
    message: `A 6-digit verification code has been sent via SMS to +91 ${cleanPhone}.`
  };
}

/**
 * Callable Function: sendCustomOtp
 */
exports.sendCustomOtp = functions.https.onCall(async (data, context) => {
  try {
    const phone = data?.phone;
    const purpose = data?.purpose || 'verification';
    return await handleSendOtpCore(phone, purpose);
  } catch (err) {
    console.error('[sendCustomOtp] Callable error:', err.message);
    if (err instanceof functions.https.HttpsError) throw err;
    throw new functions.https.HttpsError('internal', err.message || 'Failed to dispatch SMS OTP.');
  }
});

/**
 * HTTPS REST Endpoint: /api/sendCustomOtp
 */
exports.apiSendCustomOtp = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }
    try {
      const { phone, purpose } = req.body || {};
      const result = await handleSendOtpCore(phone, purpose);
      return res.status(200).json(result);
    } catch (err) {
      console.error('[apiSendCustomOtp] Error:', err.message);
      const status = err.code === 'invalid-argument' ? 400 : err.code === 'resource-exhausted' ? 429 : 500;
      return res.status(status).json({ error: err.message });
    }
  });
});


// =========================================================================
// 2. VERIFY CUSTOM OTP & ISSUE AUTH TOKEN (Callable & HTTP Handler)
// =========================================================================

async function handleVerifyOtpCore(phone, otpCode) {
  const cleanPhone = clean10DigitPhone(phone);
  const cleanOtp = (otpCode || '').toString().trim();

  if (!cleanPhone || cleanPhone.length !== 10) {
    throw new functions.https.HttpsError('invalid-argument', 'Please enter a valid 10-digit mobile number.');
  }

  if (!cleanOtp || cleanOtp.length !== 6) {
    throw new functions.https.HttpsError('invalid-argument', 'Please enter the complete 6-digit verification code.');
  }

  const docRef = db.collection(OTP_COLLECTION).doc(cleanPhone);
  const snap = await docRef.get();

  if (!snap.exists) {
    throw new functions.https.HttpsError('not-found', 'No active OTP request found for this number. Please request a new verification code.');
  }

  const record = snap.data();
  const now = Date.now();

  // Check TTL expiry
  if (now > record.expiresAt) {
    await docRef.delete();
    throw new functions.https.HttpsError('deadline-exceeded', 'This verification code has expired. Please request a new OTP.');
  }

  // Check brute force attempts
  if (record.attemptsLeft <= 0) {
    await docRef.delete();
    throw new functions.https.HttpsError('permission-denied', 'Maximum verification attempts exceeded. Please request a new OTP.');
  }

  // Hash input code & strictly compare
  const expectedHash = record.hashedOtp;
  const inputHash = hashOtp(cleanPhone, cleanOtp);

  if (inputHash !== expectedHash) {
    const remaining = record.attemptsLeft - 1;
    if (remaining <= 0) {
      await docRef.delete();
      throw new functions.https.HttpsError('permission-denied', 'Invalid verification code. Maximum attempts exceeded. Please request a new OTP.');
    } else {
      await docRef.update({ attemptsLeft: remaining });
      throw new functions.https.HttpsError('invalid-argument', `Invalid verification code. ${remaining} attempt(s) remaining.`);
    }
  }

  // Valid OTP -> Delete document to prevent replay
  await docRef.delete();

  // Create or retrieve Firebase Auth Custom Token
  const customToken = await generateUserAuthToken(cleanPhone);

  return {
    success: true,
    verified: true,
    phone: cleanPhone,
    customToken,
    message: 'Mobile number verified successfully!'
  };
}

/**
 * Helper: Generate Firebase Custom Auth Token for phone user
 */
async function generateUserAuthToken(phone) {
  let uid = 'phone_' + phone;
  try {
    // Check if an existing Firebase Auth user exists with this phone number
    const userRecord = await admin.auth().getUserByPhoneNumber('+91' + phone).catch(() => null);
    if (userRecord && userRecord.uid) {
      uid = userRecord.uid;
    }
  } catch (e) {}

  const customToken = await admin.auth().createCustomToken(uid, {
    phone: phone,
    phoneVerified: true,
    verifiedAt: new Date().toISOString()
  });

  return customToken;
}

/**
 * Callable Function: verifyCustomOtp
 */
exports.verifyCustomOtp = functions.https.onCall(async (data, context) => {
  try {
    const phone = data?.phone;
    const otpCode = data?.otpCode || data?.otp;
    return await handleVerifyOtpCore(phone, otpCode);
  } catch (err) {
    console.error('[verifyCustomOtp] Callable error:', err.message);
    if (err instanceof functions.https.HttpsError) throw err;
    throw new functions.https.HttpsError('internal', err.message || 'OTP verification failed.');
  }
});

/**
 * HTTPS REST Endpoint: /api/verifyCustomOtp
 */
exports.apiVerifyCustomOtp = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }
    try {
      const { phone, otpCode, otp } = req.body || {};
      const result = await handleVerifyOtpCore(phone, otpCode || otp);
      return res.status(200).json(result);
    } catch (err) {
      console.error('[apiVerifyCustomOtp] Error:', err.message);
      const status = err.code === 'invalid-argument' ? 400 : err.code === 'deadline-exceeded' ? 410 : err.code === 'not-found' ? 404 : 500;
      return res.status(status).json({ error: err.message });
    }
  });
});
