/**
 * Serverless Endpoint: POST /api/create-order
 * Creates a Razorpay Order using Razorpay REST API
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
    const amountInRupees = Number(body.amount) || 200;
    
    // Amount in paise (minimum 100 paise = 1 INR)
    const amountInPaise = Math.max(100, Math.round(amountInRupees * 100));
    const currency = body.currency || 'INR';
    const receipt = body.receipt || `rcpt_fitup_${Date.now()}`;
    const notes = body.notes || { platform: 'FITUP Gym Booking' };

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_TYwrtzZ7ROjR5s';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'iCMp86n6cDSwv3OSU8qrdo3Z';

    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt,
        notes
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Razorpay Order Creation Error:', data);
      return res.status(response.status).json({
        success: false,
        error: data.error?.description || 'Failed to create Razorpay order',
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      order_id: data.id,
      amount: data.amount,
      currency: data.currency,
      receipt: data.receipt,
      key_id: keyId
    });

  } catch (error) {
    console.error('Serverless create-order handler error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
