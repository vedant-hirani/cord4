import { Router } from 'express';
import aiController from '../controllers/ai.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validateExtract } from '../validators/index.js';

const router = Router();

// Apply JWT authentication protection globally to all AI endpoints
router.use(protect);

router.post('/extract', validateExtract, aiController.extractExpenseController);

export default router;
