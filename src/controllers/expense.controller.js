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
  const expenses = await expenseService.listExpenses(req.user.id, req.query);
  return ApiResponse.success(res, expenses, SUCCESS_MESSAGES.LIST_EXPENSES, 200);
});

export const exportCSVController = asyncHandler(async (req, res) => {
  const csv = await expenseService.exportExpensesCSV(req.user.id, req.query);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
  return res.status(200).send(csv);
});

export const getDashboardStatsController = asyncHandler(async (req, res) => {
  const stats = await expenseService.getDashboardStats(req.user.id);
  return ApiResponse.success(res, stats, SUCCESS_MESSAGES.GET_STATS, 200);
});

export default {
  createExpenseController,
  updateExpenseController,
  deleteExpenseController,
  listExpensesController,
  exportCSVController,
  getDashboardStatsController,
};
