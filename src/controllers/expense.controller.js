import expenseService from '../models/expense/expense.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { SUCCESS_MESSAGES } from '../utils/constants.js';

export const createExpenseController = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.user.id, req.body);
  return ApiResponse.success(res, expense, SUCCESS_MESSAGES.CREATE_EXPENSE, 201);
});

export const updateExpenseController = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(req.user.id, req.params.id, req.body);
  return ApiResponse.success(res, expense, SUCCESS_MESSAGES.UPDATE_EXPENSE, 200);
});

export const deleteExpenseController = asyncHandler(async (req, res) => {
  const result = await expenseService.deleteExpense(req.user.id, req.params.id);
  return ApiResponse.success(res, result, SUCCESS_MESSAGES.DELETE_EXPENSE, 200);
});

export const listExpensesController = asyncHandler(async (req, res) => {
  const result = await expenseService.listExpenses(req.user.id, req.query);
  return ApiResponse.success(res, result, SUCCESS_MESSAGES.LIST_EXPENSES, 200);
});

export const exportCSVController = asyncHandler(async (req, res) => {
  const csv = await expenseService.exportExpensesCSV(req.user.id, req.query);

  // Build a descriptive filename based on filters
  let fileLabel = 'all_time';
  if (req.query.month) {
    fileLabel = req.query.month; // e.g. 2026-05
  } else if (req.query.year) {
    fileLabel = req.query.year;
  } else if (req.query.startDate && req.query.endDate) {
    fileLabel = `${req.query.startDate}_to_${req.query.endDate}`;
  }
  if (req.query.category) {
    fileLabel += `_${req.query.category.toLowerCase()}`;
  }
  const filename = `SpendAI_Expenses_${fileLabel}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.status(200).send(csv);
});

export const getDashboardStatsController = asyncHandler(async (req, res) => {
  const stats = await expenseService.getDashboardStats(req.user.id);
  return ApiResponse.success(res, stats, SUCCESS_MESSAGES.GET_STATS, 200);
});

export const exportPDFController = asyncHandler(async (req, res) => {
  const pdfBuffer = await expenseService.exportExpensesPDF(req.user.id, req.query);

  // Build a descriptive filename based on filters
  let fileLabel = 'all_time';
  if (req.query.month) {
    fileLabel = req.query.month;
  } else if (req.query.year) {
    fileLabel = req.query.year;
  } else if (req.query.startDate && req.query.endDate) {
    fileLabel = `${req.query.startDate}_to_${req.query.endDate}`;
  }
  if (req.query.category) {
    fileLabel += `_${req.query.category.toLowerCase()}`;
  }
  const filename = `SpendAI_Report_${fileLabel}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', pdfBuffer.length);
  return res.status(200).send(pdfBuffer);
});

export default {
  createExpenseController,
  updateExpenseController,
  deleteExpenseController,
  listExpensesController,
  exportCSVController,
  exportPDFController,
  getDashboardStatsController,
};
