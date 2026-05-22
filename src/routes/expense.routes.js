import { Router } from 'express';
import expenseController from '../controllers/expense.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validateCreateExpense, validateUpdateExpense } from '../validators/index.js';

const router = Router();

// Apply JWT authentication protection globally to all expense endpoints
router.use(protect);

router.post('/', validateCreateExpense, expenseController.createExpenseController);
router.get('/', expenseController.listExpensesController);
router.get('/export', expenseController.exportCSVController);
router.get('/stats', expenseController.getDashboardStatsController);

router.put('/:id', validateUpdateExpense, expenseController.updateExpenseController);
router.delete('/:id', expenseController.deleteExpenseController);

export default router;
