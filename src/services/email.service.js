import env from '../config/env.js';
import logger from '../config/logger.js';

export class EmailService {
  /**
   * Sends a structured email.
   * @param {string} to Receiver email address
   * @param {string} subject Subject line
   * @param {string} text Text content
   * @param {string} html Optional HTML body
   * @returns {Promise<Object>} Verification status object
   */
  static async sendMail(to, subject, text, html = '') {
    // Log dispatch event
    logger.info(`✉️ [EmailService] Dispatching email to "${to}" with subject: "${subject}"`);
    
    if (env.NODE_ENV === 'development') {
      logger.debug(`[Email Content - Text]: ${text}`);
      if (html) logger.debug(`[Email Content - HTML]: ${html}`);
    }

    // Simulate async network latency
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real production codebase, you would configure nodemailer:
    //
    // import nodemailer from 'nodemailer';
    // const transporter = nodemailer.createTransport({
    //   host: env.SMTP_HOST,
    //   port: env.SMTP_PORT,
    //   auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
    // });
    // return transporter.sendMail({ from: env.SMTP_FROM, to, subject, text, html });

    return {
      messageId: `simulated-email-id-${Date.now()}`,
      success: true,
      recipient: to,
    };
  }

  /**
   * Sends standard greeting or welcome notification emails.
   */
  static async sendWelcomeEmail(to, username) {
    const subject = 'Welcome to Cord4!';
    const text = `Hi ${username},\n\nThank you for creating an account with us. We're excited to have you onboard!\n\nBest Regards,\nThe Team`;
    const html = `<h2>Welcome, ${username}!</h2><p>Thank you for creating an account with us. We're excited to have you onboard!</p><br><p>Best Regards,</p><p>The Team</p>`;
    
    return this.sendMail(to, subject, text, html);
  }
}

export default EmailService;
