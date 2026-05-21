import userService from '../models/user/user.service.js';
import { userDTO, usersListDTO } from './user.dto.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination, formatPaginatedResult } from '../utils/pagination.js';
import { SUCCESS_MESSAGES } from '../utils/constants.js';

export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  return ApiResponse.success(res, user, SUCCESS_MESSAGES.GET_PROFILE, 200, userDTO);
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateProfile(req.user.id, req.body);
  return ApiResponse.success(res, updatedUser, SUCCESS_MESSAGES.UPDATE_PROFILE, 200, userDTO);
});

export const changeMyPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user.id, currentPassword, newPassword);
  return ApiResponse.success(res, null, SUCCESS_MESSAGES.CHANGE_PASSWORD);
});

export const listAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  
  const filter = {};
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const { users, totalCount } = await userService.listUsers(filter, skip, limit);
  const result = { users, totalCount, page, limit };

  return ApiResponse.success(
    res,
    result,
    SUCCESS_MESSAGES.LIST_USERS,
    200,
    (data) => formatPaginatedResult(usersListDTO(data.users), data.totalCount, data.page, data.limit)
  );
});

export default {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  listAllUsers,
};
