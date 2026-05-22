import mongoose from 'mongoose';
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

  /**
   * Builds the shared Mongoose filter object from query params.
   * Used by both listExpenses and the export methods.
   */
  _buildFilter(userId, filters = {}) {
    const query = { userId };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.month) {
      const start = new Date(`${filters.month}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setUTCMonth(end.getUTCMonth() + 1);
      query.date = { $gte: start, $lt: end };
    } else if (filters.year) {
      const start = new Date(`${filters.year}-01-01T00:00:00.000Z`);
      const end = new Date(`${Number(filters.year) + 1}-01-01T00:00:00.000Z`);
      query.date = { $gte: start, $lt: end };
    } else if (filters.startDate || filters.endDate) {
      const dateQuery = {};
      if (filters.startDate) dateQuery.$gte = new Date(filters.startDate);
      if (filters.endDate) dateQuery.$lte = new Date(filters.endDate);
      query.date = dateQuery;
    }

    return query;
  }

  /**
   * Returns a paginated list of expenses with metadata.
   * Supports filters: month, year, startDate, endDate, category
   * Supports pagination: page, limit
   */
  async listExpenses(userId, filters = {}) {
    const query = this._buildFilter(userId, filters);

    const page  = Math.max(1, parseInt(filters.page,  10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(filters.limit, 10) || 20));
    const skip  = (page - 1) * limit;

    const [expenses, totalItems] = await Promise.all([
      Expense.find(query).sort({ date: -1 }).skip(skip).limit(limit),
      Expense.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      expenses,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Returns ALL expenses (no pagination) — used internally by export methods.
   */
  async _getAllExpenses(userId, filters = {}) {
    const query = this._buildFilter(userId, filters);
    return Expense.find(query).sort({ date: -1 });
  }

  // ═══════════════════════════════════════════════════
  // CSV EXPORT — clean transaction list only
  // ═══════════════════════════════════════════════════
  async exportExpensesCSV(userId, filters = {}) {
    const expenses = await this._getAllExpenses(userId, filters);

    // RFC 4180 cell escaper — handles commas, quotes, newlines, and formula injection
    const esc = (val) => {
      if (val === null || val === undefined || val === '') return '""';
      let str = String(val);
      // Neutralise CSV injection (formula prefixes)
      if (/^[=+\-@\t\r]/.test(str)) str = "'" + str;
      // Always wrap in quotes and escape inner double-quotes
      return '"' + str.replace(/"/g, '""') + '"';
    };

    // Force UTC so the date never shifts by timezone
    // Works whether d is a Date object, ISO string, or timestamp
    const fmtDate = (d) => {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return '';
      const yyyy = dt.getUTCFullYear();
      const mm   = String(dt.getUTCMonth() + 1).padStart(2, '0');
      const dd   = String(dt.getUTCDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const BOM = '\uFEFF'; // UTF-8 BOM so Excel opens with correct encoding
    const rows = [];

    // Single clean header row
    rows.push('No.,Date,Amount,Category,Note');

    if (expenses.length === 0) {
      // Empty-ledger fallback — header only, no phantom rows
    } else {
      expenses.forEach((e, i) => {
        rows.push(
          [
            i + 1,
            fmtDate(e.date),
            e.amount.toFixed(2),
            esc(e.category || 'Other'),
            esc(e.note || ''),
          ].join(',')
        );
      });
    }

    return BOM + rows.join('\r\n');
  }

  // ═══════════════════════════════════════════════════
  // PDF EXPORT — clean transaction table only
  // ═══════════════════════════════════════════════════
  async exportExpensesPDF(userId, filters = {}) {
    const PDFDocument = (await import('pdfkit')).default;
    const expenses = await this._getAllExpenses(userId, filters);

    // Force UTC date string — YYYY-MM-DD
    // Works whether d is a Date object, ISO string, or timestamp
    const fmtDate = (d) => {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return '';
      const yyyy = dt.getUTCFullYear();
      const mm   = String(dt.getUTCMonth() + 1).padStart(2, '0');
      const dd   = String(dt.getUTCDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const DARK    = '#1E293B';
    const HEADER  = '#334155';
    const GRAY    = '#64748B';
    const LIGHT   = '#F8FAFC';
    const STRIPE  = '#EFF6FF';
    const WHITE   = '#FFFFFF';
    const ACCENT  = '#4F46E5';

    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
    const chunks = [];

    return new Promise((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageW    = doc.page.width;
      const marginL  = 40;
      const contentW = pageW - marginL - 40;

      // Column widths: No. | Date | Amount | Category | Note
      const cols = [30, 90, 70, 90, contentW - 30 - 90 - 70 - 90];
      const headers = ['No.', 'Date', 'Amount', 'Category', 'Note'];

      let y = 40;

      // ── TABLE HEADER ──
      doc.rect(marginL, y, contentW, 22).fill(HEADER);
      let hx = marginL;
      headers.forEach((h, i) => {
        doc.fontSize(8).fill(WHITE).text(h, hx + 5, y + 7, {
          width: cols[i] - 10,
          align: i === 2 ? 'right' : 'left',
          lineBreak: false,
        });
        hx += cols[i];
      });
      y += 22;

      // ── DATA ROWS ──
      if (expenses.length === 0) {
        doc.rect(marginL, y, contentW, 28).fill(LIGHT);
        doc.fontSize(9).fill(GRAY).text(
          'No expense records found for the selected filters.',
          marginL + 6, y + 9, { width: contentW - 12 }
        );
        y += 28;
      } else {
        expenses.forEach((e, idx) => {
          // Page break guard — leave room for at least one row + bottom margin
          if (y > doc.page.height - 60) {
            doc.addPage();
            y = 40;

            // Repeat header on new page
            doc.rect(marginL, y, contentW, 22).fill(HEADER);
            let rhx = marginL;
            headers.forEach((h, i) => {
              doc.fontSize(8).fill(WHITE).text(h, rhx + 5, y + 7, {
                width: cols[i] - 10,
                align: i === 2 ? 'right' : 'left',
                lineBreak: false,
              });
              rhx += cols[i];
            });
            y += 22;
          }

          const rowBg = idx % 2 === 0 ? WHITE : STRIPE;
          doc.rect(marginL, y, contentW, 20).fill(rowBg);

          // Bottom border
          doc.moveTo(marginL, y + 20)
            .lineTo(marginL + contentW, y + 20)
            .lineWidth(0.3)
            .strokeColor('#CBD5E1')
            .stroke();

          let rx = marginL;
          const cells = [
            { text: String(idx + 1),              align: 'left',  color: GRAY   },
            { text: fmtDate(e.date),               align: 'left',  color: DARK   },
            { text: e.amount.toFixed(2),           align: 'right', color: ACCENT },
            { text: e.category || 'Other',         align: 'left',  color: DARK   },
            { text: (e.note || '').substring(0, 60), align: 'left', color: GRAY  },
          ];

          cells.forEach((cell, ci) => {
            doc.fontSize(8).fill(cell.color).text(cell.text, rx + 5, y + 6, {
              width: cols[ci] - 10,
              align: cell.align,
              lineBreak: false,
            });
            rx += cols[ci];
          });

          y += 20;
        });
      }

      doc.end();
    });
  }

  // ═══════════════════════════════════════════════════
  // DASHBOARD ANALYTICS
  // ═══════════════════════════════════════════════════
  async getDashboardStats(userId) {
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth(); // 0-11

    const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1));
    const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 1));

    // 1. Total spending this month
    const currentMonthSpend = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: startOfMonth, $lt: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalThisMonth = currentMonthSpend.length > 0 ? currentMonthSpend[0].total : 0;

    // 2. Spending breakdown by category
    const categoryBreakdown = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { 
        $group: { 
          _id: '$category', 
          value: { $sum: '$amount' },
          count: { $sum: 1 }
        } 
      },
      { $project: { name: '$_id', value: 1, count: 1, _id: 0 } },
      { $sort: { value: -1 } },
    ]);

    // 3. Monthly trend for the last 6 months
    const sixMonthsAgo = new Date(Date.UTC(currentYear, currentMonth - 5, 1));
    const monthlyTrendsAgg = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: sixMonthsAgo } } },
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
