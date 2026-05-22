import mongoose from 'mongoose';
import Expense from '../expense/expense.model.js';
import Budget from '../budget/budget.model.js';
import ApiError from '../../utils/ApiError.js';

class DashboardService {
  /**
   * Helper to resolve start and end UTC timestamps based on time range query filters.
   */
  getDateRange(rangeType, startDate, endDate) {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (rangeType) {
      case 'daily':
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCHours(23, 59, 59, 999);
        break;
      case 'weekly': {
        // Start of current week (Sunday)
        const dayOfWeek = now.getUTCDay();
        start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dayOfWeek));
        start.setUTCHours(0, 0, 0, 0);
        end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 7);
        end.setUTCMilliseconds(end.getUTCMilliseconds() - 1);
        break;
      }
      case 'monthly':
        start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
        end.setUTCMilliseconds(end.getUTCMilliseconds() - 1);
        break;
      case 'yearly':
        start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
        end = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1));
        end.setUTCMilliseconds(end.getUTCMilliseconds() - 1);
        break;
      case 'custom':
        if (startDate) {
          start = new Date(startDate);
          start.setUTCHours(0, 0, 0, 0);
        } else {
          start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        }
        if (endDate) {
          end = new Date(endDate);
          end.setUTCHours(23, 59, 59, 999);
        } else {
          end = new Date();
        }
        break;
      default:
        // Fallback: Current month
        start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
        end.setUTCMilliseconds(end.getUTCMilliseconds() - 1);
    }
    return { start, end };
  }

  /**
   * Generates highly detailed dashboard analytics and statistics.
   */
  async getDetailedAnalytics(userId, query) {
    const { rangeType = 'monthly', startDate, endDate, sortBy = 'amount', limit } = query;
    const { start, end } = this.getDateRange(rangeType, startDate, endDate);

    // 1. Fetch all expenses in the given date range
    const expenses = await Expense.find({
      userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    // 2. Calculate Total Spending in period
    const totalSpending = expenses.reduce((sum, item) => sum + item.amount, 0);

    // 3. Category-wise spending analytics with percentages and counts
    const sortField = sortBy === 'count' ? 'count' : 'total';
    const categoryAgg = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
      { 
        $group: { 
          _id: '$category', 
          total: { $sum: '$amount' }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { [sortField]: -1, _id: 1 } }
    ]);

    const categoryColors = {
      'Food': '#ef4444',
      'Transport': '#3b82f6',
      'Utilities': '#10b981',
      'Entertainment': '#8b5cf6',
      'Shopping': '#ec4899',
      'Other': '#6b7280'
    };

    const categoryBreakdown = categoryAgg.map(item => {
      const percentage = totalSpending > 0 ? (item.total / totalSpending) * 100 : 0;
      return {
        category: item._id,
        amount: Number(item.total.toFixed(2)),
        percentage: Number(percentage.toFixed(2)),
        count: item.count,
        color: categoryColors[item._id] || '#6366f1'
      };
    });

    // 4. Generate Graph-Ready Trend Datasets (Recharts, Chart.js, ApexCharts)
    const isYearly = rangeType === 'yearly';
    const groupedData = {};

    if (isYearly) {
      // Pre-fill all 12 months for standard continuity
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months.forEach(m => { groupedData[m] = 0; });

      expenses.forEach(exp => {
        const monthIndex = new Date(exp.date).getUTCMonth();
        const monthName = months[monthIndex];
        groupedData[monthName] = (groupedData[monthName] || 0) + exp.amount;
      });
    } else {
      // Group by daily YYYY-MM-DD keys
      expenses.forEach(exp => {
        const dayStr = new Date(exp.date).toISOString().split('T')[0];
        groupedData[dayStr] = (groupedData[dayStr] || 0) + exp.amount;
      });
    }

    // A. Recharts format: Array of objects
    const rechartsData = Object.keys(groupedData).map(key => ({
      name: key,
      amount: Number(groupedData[key].toFixed(2))
    }));

    // B. Chart.js format: Object mapping labels to configured datasets
    const chartjsData = {
      labels: Object.keys(groupedData),
      datasets: [
        {
          label: 'Expenditure',
          data: Object.values(groupedData).map(v => Number(v.toFixed(2))),
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          borderColor: '#6366f1',
          borderWidth: 2,
          fill: true
        }
      ]
    };

    // C. ApexCharts format: Parallel categories and series array
    const apexChartsData = {
      categories: Object.keys(groupedData),
      series: [
        {
          name: 'Spending',
          data: Object.values(groupedData).map(v => Number(v.toFixed(2)))
        }
      ]
    };

    // 5. Budget usage & target alert analytics (Calculated monthly based on target month index)
    const currentMonthStr = `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}`;
    const budgets = await Budget.find({ userId, month: currentMonthStr });

    // Aggregate monthly actual spends matching categories
    const monthStart = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
    const monthEnd = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
    
    const monthlySpendingAgg = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: monthStart, $lt: monthEnd } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    const budgetUsage = budgets.map(b => {
      const match = monthlySpendingAgg.find(s => s._id === b.category);
      const spent = match ? match.total : 0;
      const percentage = b.limit > 0 ? (spent / b.limit) * 100 : 0;
      
      let status = 'normal';
      if (percentage >= 100) status = 'danger';
      else if (percentage >= 80) status = 'warning';

      return {
        category: b.category,
        limit: b.limit,
        spent: Number(spent.toFixed(2)),
        percentage: Number(percentage.toFixed(2)),
        status
      };
    });

    // 6. Top categories summary
    const parsedLimit = limit && !isNaN(parseInt(limit, 10)) && parseInt(limit, 10) > 0 
      ? parseInt(limit, 10) 
      : 3;
    const topCategories = [...categoryBreakdown].slice(0, parsedLimit);

    // 7. Last 6 Months Expenditure Trends
    const trends = [];
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth();
    
    const sixMonthsAgo = new Date(Date.UTC(currentYear, currentMonth - 5, 1));
    const monthlyTrendsAgg = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' }
        }
      }
    ]);

    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(currentYear, currentMonth - i, 1));
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth() + 1;
      const monthName = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });

      const match = monthlyTrendsAgg.find(t => t._id.year === y && t._id.month === m);
      trends.push({
        label: `${monthName} ${y}`,
        amount: match ? Number(match.total.toFixed(2)) : 0
      });
    }

    return {
      period: {
        rangeType,
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      },
      totalSpending: Number(totalSpending.toFixed(2)),
      categoryBreakdown,
      spendingTrends: {
        rechartsData,
        chartjsData,
        apexChartsData
      },
      budgetUsage,
      topCategories,
      lastSixMonthsTrends: trends
    };
  }
}

export default new DashboardService();
export { DashboardService };
