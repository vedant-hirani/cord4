import User from './user.model.js';
import ApiError from '../../utils/ApiError.js';

class UserService {
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User profile not found');
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    // If updating email, check if it's already taken directly on User Model
    if (updateData.email) {
      const existingUser = await User.findOne({ email: updateData.email });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        throw new ApiError(409, 'Email address is already in use');
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
    
    if (!updatedUser) {
      throw new ApiError(404, 'User not found');
    }
    
    return updatedUser;
  }

  async changePassword(userId, currentPassword, newPassword) {
    // Force include password for comparison directly on User Model
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new ApiError(404, 'User profile not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(400, 'Invalid current password provided');
    }

    // Apply new password (pre-save hook will hash this automatically)
    user.password = newPassword;
    await user.save();

    return { success: true };
  }

  async listUsers(filter = {}, skip = 0, limit = 10) {
    const users = await User.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalCount = await User.countDocuments(filter);
    return { users, totalCount };
  }
}

export default new UserService();
export { UserService };
