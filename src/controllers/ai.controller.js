import aiService from '../models/ai/ai.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { SUCCESS_MESSAGES } from '../utils/constants.js';

export const extractExpenseController = asyncHandler(async (req, res) => {
  if (!req.body.rawText && !req.file) {
    throw new ApiError(400, 'Either rawText or a receipt image upload (field: receipt) is required');
  }

  const result = await aiService.extractExpense({
    rawText: req.body.rawText,
    file: req.file,
  });
  return ApiResponse.success(res, result, SUCCESS_MESSAGES.AI_EXTRACT, 200);
});

export default {
  extractExpenseController,
};
