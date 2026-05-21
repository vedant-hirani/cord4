import notificationService from '../services/notification.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { SUCCESS_MESSAGES } from '../utils/constants.js';

export const sendNotificationController = asyncHandler(async (req, res) => {
  const { name, email, phone, fcmToken, channels } = req.body;

  const recipient = { name, email, phone, fcmToken };
  const results = await notificationService.sendSystemNotification(recipient, channels);

  return ApiResponse.success(
    res,
    { dispatches: results },
    SUCCESS_MESSAGES.SEND_NOTIFICATION
  );
});

export default {
  sendNotificationController,
};
