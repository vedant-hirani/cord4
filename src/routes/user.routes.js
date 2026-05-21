import { Router } from 'express';
import userController from '../controllers/user.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validateUpdateProfile, validateChangePassword } from '../validators/index.js';

const router = Router();

// Secure all user routes
router.use(protect);

router.get('/me', userController.getMyProfile);

router.patch(
  '/me',
  validateUpdateProfile,
  userController.updateMyProfile
);

router.post(
  '/change-password',
  validateChangePassword,
  userController.changeMyPassword
);

// Admin-only user listing endpoint
router.get(
  '/list',
  restrictTo('admin', 'manager'),
  userController.listAllUsers
);

export default router;
