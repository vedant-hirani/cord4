import dashboardService from '../models/dashboard/dashboard.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { SUCCESS_MESSAGES } from '../utils/constants.js';

export const getDetailedAnalyticsController = asyncHandler(async (req, res) => {
  const analytics = await dashboardService.getDetailedAnalytics(req.user.id, req.query);
  return ApiResponse.success(res, analytics, SUCCESS_MESSAGES.GET_STATS, 200);
});

export default {
  getDetailedAnalyticsController,
};
