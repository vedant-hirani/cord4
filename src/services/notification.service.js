import EmailService from './email.service.js';
import SmsService from './sms.service.js';
import FirebaseService from './firebase.service.js';
import logger from '../config/logger.js';

class NotificationService {
  /**
   * Orchestrates multi-channel notifications asynchronously.
   */
  async sendSystemNotification(recipient, channels = ['email']) {
    const { name, email, phone, fcmToken } = recipient;
    const action = 'Security Configuration Check';
    const dispatches = [];

    logger.info(`📢 [NotificationService] Dispatching multi-channel messages to ${name}`);

    // Email dispatch trigger
    if (channels.includes('email') && email) {
      const subject = `System Alert: Action [${action}] Completed`;
      const text = `Dear ${name},\n\nWe wanted to notify you that your action [${action}] completed successfully.\n\nBest,\nSystem Admin`;
      const html = `<h3>System Alert</h3><p>Dear ${name},</p><p>We wanted to notify you that your action <strong>[${action}]</strong> completed successfully.</p>`;
      
      dispatches.push(
        EmailService.sendMail(email, subject, text, html)
      );
    }

    // SMS dispatch trigger
    if (channels.includes('sms') && phone) {
      const text = `Hi ${name}, your action [${action}] completed successfully.`;
      dispatches.push(SmsService.sendSMS(phone, text));
    }

    // Firebase FCM push trigger
    if (channels.includes('push') && fcmToken) {
      dispatches.push(
        FirebaseService.sendPushNotification(fcmToken, 'Security Alert', `Action [${action}] completed successfully.`)
      );
    }

    // Await all parallel dispatches asynchronously
    const results = await Promise.allSettled(dispatches);
    
    logger.info(`📢 [NotificationService] Completed all message dispatches for ${name}`);
    return results;
  }
}

export default new NotificationService();
export { NotificationService };
