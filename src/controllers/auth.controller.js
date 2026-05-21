import authService from '../models/auth/auth.service.js';
import { userDTO } from './user.dto.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { SUCCESS_MESSAGES } from '../utils/constants.js';

export const registerController = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  const result = { user, tokens: { accessToken, refreshToken } };

  return ApiResponse.success(
    res,
    result,
    SUCCESS_MESSAGES.REGISTER,
    201,
    (data) => ({
      user: userDTO(data.user),
      tokens: data.tokens,
    })
  );
});

export const loginController = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  const result = { user, tokens: { accessToken, refreshToken } };

  return ApiResponse.success(
    res,
    result,
    SUCCESS_MESSAGES.LOGIN,
    200,
    (data) => ({
      user: userDTO(data.user),
      tokens: data.tokens,
    })
  );
});

export const refreshController = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.refresh(req.body);
  const result = { user, tokens: { accessToken, refreshToken } };

  return ApiResponse.success(
    res,
    result,
    SUCCESS_MESSAGES.REFRESH_TOKEN,
    200,
    (data) => ({
      user: userDTO(data.user),
      tokens: data.tokens,
    })
  );
});

export const logoutController = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  return ApiResponse.success(res, null, SUCCESS_MESSAGES.LOGOUT);
});

export default {
  registerController,
  loginController,
  refreshController,
  logoutController,
};
