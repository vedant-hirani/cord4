import { Router } from 'express';
import budgetController from '../controllers/budget.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validateSetBudget } from '../validators/index.js';

const router = Router();

// Apply JWT authentication protection globally to all budget endpoints
router.use(protect);

router.post('/', validateSetBudget, budgetController.setBudgetController);
router.get('/alerts', budgetController.getBudgetAlertsController);

export default router;
