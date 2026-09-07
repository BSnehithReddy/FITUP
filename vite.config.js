import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import crypto from 'crypto';

function razorpayDevMiddleware() {
  return {
    name: 'razorpay-serverless-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/create-order') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const parsed = body ? JSON.parse(body) : {};
              const amountInRupees = Number(parsed.amount) || 200;
              const amountInPaise = Math.max(100, Math.round(amountInRupees * 100));
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
                  currency: parsed.currency || 'INR',
                  receipt: parsed.receipt || `rcpt_fitup_${Date.now()}`,
                  notes: parsed.notes || { platform: 'FITUP Gym Booking' }
                })
              });

              const data = await response.json();
              res.setHeader('Content-Type', 'application/json');
              if (response.ok) {
                res.statusCode = 200;
                res.end(JSON.stringify({
                  success: true,
                  order_id: data.id,
                  amount: data.amount,
                  currency: data.currency,
                  key_id: keyId
                }));
              } else {
                res.statusCode = response.status || 400;
                res.end(JSON.stringify({
                  success: false,
                  error: data.error?.description || 'Failed to create order',
                  details: data
                }));
              }
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        if (req.url?.startsWith('/api/verify-payment') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const parsed = body ? JSON.parse(body) : {};
              const { order_id, razorpay_payment_id, razorpay_signature } = parsed;
              const keySecret = process.env.RAZORPAY_KEY_SECRET || 'iCMp86n6cDSwv3OSU8qrdo3Z';
              
              if (!order_id || !razorpay_payment_id || !razorpay_signature) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, verified: false, error: 'Missing parameters' }));
                return;
              }

              const generated = crypto
                .createHmac('sha256', keySecret)
                .update(`${order_id}|${razorpay_payment_id}`)
                .digest('hex');

              res.setHeader('Content-Type', 'application/json');
              if (generated === razorpay_signature) {
                res.statusCode = 200;
                res.end(JSON.stringify({
                  success: true,
                  verified: true,
                  message: 'Razorpay payment signature verified successfully'
                }));
              } else {
                res.statusCode = 400;
                res.end(JSON.stringify({
                  success: false,
                  verified: false,
                  error: 'Signature verification mismatch'
                }));
              }
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, verified: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env.RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID || 'rzp_test_TYwrtzZ7ROjR5s';
  process.env.RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET || 'iCMp86n6cDSwv3OSU8qrdo3Z';

  return {
    plugins: [react(), razorpayDevMiddleware()],
    base: './',
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          landing: resolve(__dirname, 'landing.html')
        }
      }
    },
    server: {
      port: 3000,
      open: true
    }
  };
});
