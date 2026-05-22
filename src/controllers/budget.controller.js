import budgetService from '../models/budget/budget.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { SUCCESS_MESSAGES } from '../utils/constants.js';

export const setBudgetController = asyncHandler(async (req, res) => {
  const budget = await budgetService.setBudget(req.user.id, req.body);
  return ApiResponse.success(res, budget, SUCCESS_MESSAGES.SET_BUDGET, 200);
});

export const getBudgetAlertsController = asyncHandler(async (req, res) => {
  const alerts = await budgetService.getBudgetAlerts(req.user.id, req.query.month);
  return ApiResponse.success(res, alerts, SUCCESS_MESSAGES.GET_ALERTS, 200);
});

export const listBudgetsController = asyncHandler(async (req, res) => {
  const budgets = await budgetService.listBudgets(req.user.id, req.query.month);
  return ApiResponse.success(res, budgets, SUCCESS_MESSAGES.LIST_BUDGETS, 200);
});

export const deleteBudgetController = asyncHandler(async (req, res) => {
  const result = await budgetService.deleteBudget(req.user.id, req.params.id);
  return ApiResponse.success(res, result, SUCCESS_MESSAGES.DELETE_BUDGET, 200);
});

export default {
  setBudgetController,
  getBudgetAlertsController,
  listBudgetsController,
  deleteBudgetController,
};
