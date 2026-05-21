import env from '../config/env.js';
import logger from '../config/logger.js';

export class SmsService {
  /**
   * Dispatches a text message.
   * @param {string} to Destination mobile number
   * @param {string} message Text message body
   * @returns {Promise<Object>} Verification status object
   */
  static async sendSMS(to, message) {
    logger.info(`📱 [SmsService] Dispatching SMS to "${to}": "${message}"`);
    
    // Simulate async network latency
    await new Promise((resolve) => setTimeout(resolve, 400));

    // In a real production codebase, you would install twilio:
    //
    // import twilio from 'twilio';
    // const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    // return client.messages.create({ body: message, from: env.TWILIO_PHONE_NUMBER, to });

    return {
      sid: `simulated-sms-sid-${Date.now()}`,
      success: true,
      recipient: to,
    };
  }

  /**
   * Sends an OTP verification token.
   */
  static async sendOTP(to, otp) {
    const message = `Your Cord4 verification code is: ${otp}. It will expire in 5 minutes. Do not share this code.`;
    return this.sendSMS(to, message);
  }
}

export default SmsService;
