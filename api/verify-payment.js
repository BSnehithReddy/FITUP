import crypto from 'crypto';

/**
 * Serverless Endpoint: POST /api/verify-payment
 * Verifies Razorpay signature using HMAC SHA-256
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST is supported.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Missing required parameters (order_id, razorpay_payment_id, razorpay_signature)'
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'iCMp86n6cDSwv3OSU8qrdo3Z';

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = generatedSignature === razorpay_signature;

    if (isValid) {
      return res.status(200).json({
        success: true,
        verified: true,
        message: 'Razorpay payment signature verified successfully',
        payment_id: razorpay_payment_id,
        order_id: order_id
      });
    } else {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Invalid Razorpay signature. Verification failed.'
      });
    }

  } catch (error) {
    console.error('Serverless verify-payment handler error:', error);
    return res.status(500).json({
      success: false,
      verified: false,
      error: error.message || 'Internal server error'
    });
  }
}
