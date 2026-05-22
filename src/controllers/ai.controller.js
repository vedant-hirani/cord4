import aiService from '../models/ai/ai.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { SUCCESS_MESSAGES } from '../utils/constants.js';

export const extractExpenseController = asyncHandler(async (req, res) => {
  const result = await aiService.extractExpense(req.body.rawText);
  return ApiResponse.success(res, result, SUCCESS_MESSAGES.AI_EXTRACT, 200);
});

export default {
  extractExpenseController,
};
