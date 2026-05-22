import { Router } from 'express';
import aiController from '../controllers/ai.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../helpers/upload.helper.js';

const router = Router();

// Apply JWT authentication protection globally to all AI endpoints
router.use(protect);

router.post('/extract', upload.single('receipt'), aiController.extractExpenseController);

export default router;
