require('dotenv').config();
const axios = require('axios');

/**
 * FITUP Multi-Gateway SMS Dispatcher
 * Supports: Fast2SMS (India), MSG91 (DLT OTP), Twilio (International)
 */
class SmsGatewayService {
  constructor() {
    this.provider = (process.env.SMS_PROVIDER || 'fast2sms').toLowerCase();
  }

  /**
   * Main SMS dispatch method
   * @param {Object} params
   * @param {string} params.phone - 10-digit mobile number
   * @param {string} params.otp - 6-digit numeric OTP code
   * @param {string} [params.customMessage] - Optional custom SMS text
   */
  async sendOtp({ phone, otp, customMessage }) {
    const cleanPhone = phone.toString().replace(/\D/g, '').slice(-10);
    const message = customMessage || `Your FITUP verification OTP is ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;

    console.log(`[SmsGatewayService] Dispatching OTP to +91 ${cleanPhone} via provider: ${this.provider}`);

    // If running in development sandbox or API keys are not yet configured, log and return success
    if (this.isDevSandbox()) {
      console.log(`[SmsGatewayService - SANDBOX/DEV MODE] 🔐 Test OTP for +91 ${cleanPhone}: [ ${otp} ]`);
      return {
        success: true,
        provider: 'sandbox',
        messageId: 'dev_mock_' + Date.now(),
        phone: cleanPhone
      };
    }

    switch (this.provider) {
      case 'fast2sms':
        return await this.sendViaFast2Sms(cleanPhone, otp, message);
      case 'msg91':
        return await this.sendViaMsg91(cleanPhone, otp);
      case 'twilio':
        return await this.sendViaTwilio(cleanPhone, otp, message);
      default:
        console.warn(`[SmsGatewayService] Unknown provider "${this.provider}". Falling back to Fast2SMS.`);
        return await this.sendViaFast2Sms(cleanPhone, otp, message);
    }
  }

  /**
   * Fast2SMS Gateway Implementation (India Quick SMS / OTP)
   */
  async sendViaFast2Sms(phone, otp, message) {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) {
      console.warn('[Fast2SMS] Missing FAST2SMS_API_KEY. Operating in dev mode.');
      return { success: true, provider: 'fast2sms-mock', phone };
    }

    try {
      // Fast2SMS OTP quick route
      const response = await axios.post(
        'https://www.fast2sms.com/dev/bulkV2',
        {
          variables_values: otp,
          route: 'otp',
          numbers: phone
        },
        {
          headers: {
            'authorization': apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data && (response.data.return === true || response.data.status_code === 200)) {
        return {
          success: true,
          provider: 'fast2sms',
          messageId: response.data.request_id || ('f2s_' + Date.now()),
          phone
        };
      } else {
        throw new Error(response.data?.message?.[0] || response.data?.message || 'Fast2SMS returned error');
      }
    } catch (err) {
      console.error('[Fast2SMS] Error sending SMS:', err.response?.data || err.message);
      // Fallback to quick text route if OTP route failed
      try {
        const fallbackRes = await axios.post(
          'https://www.fast2sms.com/dev/bulkV2',
          {
            message: message,
            language: 'english',
            route: 'q',
            numbers: phone
          },
          {
            headers: {
              'authorization': apiKey,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );
        return {
          success: true,
          provider: 'fast2sms-quick',
          messageId: fallbackRes.data?.request_id || ('f2s_q_' + Date.now()),
          phone
        };
      } catch (fallbackErr) {
        throw new Error(`Fast2SMS delivery failed: ${fallbackErr.response?.data?.message || fallbackErr.message}`);
      }
    }
  }

  /**
   * MSG91 Gateway Implementation (DLT OTP API)
   */
  async sendViaMsg91(phone, otp) {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !templateId) {
      console.warn('[MSG91] Missing MSG91_AUTH_KEY or MSG91_TEMPLATE_ID. Operating in dev mode.');
      return { success: true, provider: 'msg91-mock', phone };
    }

    try {
      const response = await axios.post(
        'https://control.msg91.com/api/v5/otp',
        {
          template_id: templateId,
          mobile: '91' + phone,
          otp: otp,
          otp_expiry: 5
        },
        {
          headers: {
            'authkey': authKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.type === 'success') {
        return {
          success: true,
          provider: 'msg91',
          messageId: response.data.request_id || ('msg91_' + Date.now()),
          phone
        };
      } else {
        throw new Error(response.data?.message || 'MSG91 returned failure response');
      }
    } catch (err) {
      console.error('[MSG91] Error sending OTP:', err.response?.data || err.message);
      throw new Error(`MSG91 delivery failed: ${err.response?.data?.message || err.message}`);
    }
  }

  /**
   * Twilio Gateway Implementation (International SMS)
   */
  async sendViaTwilio(phone, otp, message) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('[Twilio] Missing Twilio credentials. Operating in dev mode.');
      return { success: true, provider: 'twilio-mock', phone };
    }

    try {
      const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', '+91' + phone);
      params.append('From', fromNumber);
      params.append('Body', message);

      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        params.toString(),
        {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000
        }
      );

      return {
        success: true,
        provider: 'twilio',
        messageId: response.data?.sid || ('tw_' + Date.now()),
        phone
      };
    } catch (err) {
      console.error('[Twilio] Error sending SMS:', err.response?.data || err.message);
      throw new Error(`Twilio delivery failed: ${err.response?.data?.message || err.message}`);
    }
  }

  isDevSandbox() {
    return (
      process.env.NODE_ENV !== 'production' &&
      !process.env.FAST2SMS_API_KEY &&
      !process.env.MSG91_AUTH_KEY &&
      !process.env.TWILIO_ACCOUNT_SID
    );
  }
}

module.exports = new SmsGatewayService();
