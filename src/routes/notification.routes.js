import { Router } from 'express';
import notificationController from '../controllers/notification.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validateSendNotification } from '../validators/index.js';

const router = Router();

router.post(
  '/send',
  protect, // Secure notification endpoint
  validateSendNotification,
  notificationController.sendNotificationController
);

export default router;
