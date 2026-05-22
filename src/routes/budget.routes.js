import { Router } from 'express';
import budgetController from '../controllers/budget.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validateSetBudget, validateListBudgets, validateDeleteBudget } from '../validators/index.js';

const router = Router();

// Apply JWT authentication protection globally to all budget endpoints
router.use(protect);

router.post('/', validateSetBudget, budgetController.setBudgetController);
router.get('/', validateListBudgets, budgetController.listBudgetsController);
router.get('/alerts', budgetController.getBudgetAlertsController);
router.delete('/:id', validateDeleteBudget, budgetController.deleteBudgetController);

export default router;
