import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validateRegister, validateLogin, validateRefreshToken } from '../validators/index.js';

const router = Router();

router.post(
  '/register',
  validateRegister,
  authController.registerController
);

router.post(
  '/login',
  validateLogin,
  authController.loginController
);

router.post(
  '/refresh',
  validateRefreshToken,
  authController.refreshController
);

router.post(
  '/logout',
  protect, // User must be signed in to log out
  authController.logoutController
);

export default router;
