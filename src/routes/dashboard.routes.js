import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Apply JWT authentication protection globally to all dashboard endpoints
router.use(protect);

router.get('/analytics', dashboardController.getDetailedAnalyticsController);

export default router;
