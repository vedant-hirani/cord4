import Budget from './budget.model.js';
import Expense from '../expense/expense.model.js';
import ApiError from '../../utils/ApiError.js';

class BudgetService {
  async setBudget(userId, payload) {
    const { category, limit, month } = payload;
    
    // Upsert budget (update if exists, insert if new)
    const budget = await Budget.findOneAndUpdate(
      { userId, category, month },
      { limit },
      { new: true, upsert: true, runValidators: true }
    );
    return budget;
  }

  async listBudgets(userId, month) {
    const query = { userId };
    if (month) {
      query.month = month;
    }
    return await Budget.find(query).sort({ category: 1 });
  }

  async getBudgetAlerts(userId, month) {
    const targetMonth = month || new Date().toISOString().slice(0, 7); // Default to current 'YYYY-MM'

    // Fetch all active budgets for the target month
    const budgets = await Budget.find({ userId, month: targetMonth });

    // Fetch spending by category for the target month
    const start = new Date(`${targetMonth}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);

    const monthlySpendsAgg = await Expense.aggregate([
      { $match: { userId, date: { $gte: start, $lt: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]);

    const alerts = budgets.map((b) => {
      const match = monthlySpendsAgg.find((s) => s._id.toLowerCase() === b.category.toLowerCase());
      const spent = match ? match.total : 0;
      const percentage = b.limit > 0 ? (spent / b.limit) * 100 : 0;

      let status = 'normal';
      if (percentage >= 100) {
        status = 'danger';
      } else if (percentage >= 80) {
        status = 'warning';
      }

      return {
        id: b._id,
        category: b.category,
        limit: b.limit,
        spent,
        percentage,
        status,
        month: b.month,
      };
    });

    return alerts;
  }
}

export default new BudgetService();
export { BudgetService };
