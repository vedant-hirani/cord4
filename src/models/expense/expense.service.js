import Expense from './expense.model.js';
import ApiError from '../../utils/ApiError.js';

class ExpenseService {
  async createExpense(userId, payload) {
    const expense = new Expense({ ...payload, userId });
    return await expense.save();
  }

  async updateExpense(userId, expenseId, payload) {
    const updated = await Expense.findOneAndUpdate(
      { _id: expenseId, userId },
      payload,
      { new: true, runValidators: true }
    );
    if (!updated) {
      throw new ApiError(404, 'Expense record not found');
    }
    return updated;
  }

  async deleteExpense(userId, expenseId) {
    const deleted = await Expense.findOneAndDelete({ _id: expenseId, userId });
    if (!deleted) {
      throw new ApiError(404, 'Expense record not found');
    }
    return { success: true };
  }

  async listExpenses(userId, filters = {}) {
    const query = { userId };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.month) {
      // filters.month is in format 'YYYY-MM'
      const start = new Date(`${filters.month}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setUTCMonth(end.getUTCMonth() + 1);

      query.date = { $gte: start, $lt: end };
    }

    return await Expense.find(query).sort({ date: -1 });
  }

  async exportExpensesCSV(userId, filters = {}) {
    const expenses = await this.listExpenses(userId, filters);

    // CSV Headers
    let csv = 'Date,Amount,Category,Note\n';

    for (const exp of expenses) {
      const dateStr = exp.date.toISOString().split('T')[0];
      const amountStr = exp.amount.toFixed(2);
      // Escape quotes in note
      const escapedNote = exp.note ? `"${exp.note.replace(/"/g, '""')}"` : '""';
      const categoryStr = `"${exp.category.replace(/"/g, '""')}"`;

      csv += `${dateStr},${amountStr},${categoryStr},${escapedNote}\n`;
    }

    return csv;
  }

  async getDashboardStats(userId) {
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth(); // 0-11

    const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1));
    const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 1));

    // 1. Total spending this month
    const currentMonthSpend = await Expense.aggregate([
      { $match: { userId, date: { $gte: startOfMonth, $lt: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalThisMonth = currentMonthSpend.length > 0 ? currentMonthSpend[0].total : 0;

    // 2. Spending breakdown by category
    const categoryBreakdown = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', value: { $sum: '$amount' } } },
      { $project: { name: '$_id', value: 1, _id: 0 } },
      { $sort: { value: -1 } },
    ]);

    // 3. Monthly trend for the last 6 months
    const sixMonthsAgo = new Date(Date.UTC(currentYear, currentMonth - 5, 1));
    const monthlyTrendsAgg = await Expense.aggregate([
      { $match: { userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Pre-populate last 6 months with $0 so the chart has data points even if empty
    const trends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(currentYear, currentMonth - i, 1));
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth() + 1; // 1-12
      const monthName = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });

      // Find if we have aggregate value
      const match = monthlyTrendsAgg.find(
        (t) => t._id.year === year && t._id.month === month
      );
      trends.push({
        label: `${monthName} ${year}`,
        amount: match ? match.total : 0,
      });
    }

    return {
      totalThisMonth,
      categoryBreakdown,
      monthlyTrends: trends,
    };
  }
}

export default new ExpenseService();
export { ExpenseService };
