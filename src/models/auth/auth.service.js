import User from '../user/user.model.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../helpers/token.helper.js';
import ApiError from '../../utils/ApiError.js';

class AuthService {
  /**
   * Registers a new user account.
   */
  async register(payload) {
    const { name, email, password, role } = payload;

    // Verify email uniqueness directly on User Model
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, 'A user account with this email address already exists.');
    }

    // Save user record directly on User Model (pre-save hook hashes password)
    const user = new User({ name, email, password, role });
    await user.save();

    // Generate JWT access & refresh tokens
    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Persist refresh token to database directly on User Model
    user.refreshToken = refreshToken;
    await user.save();

    return { user, accessToken, refreshToken };
  }

  /**
   * Authenticates a user and generates tokens.
   */
  async login(payload) {
    const { email, password } = payload;

    // Fetch user and explicitly request password selection directly on User Model
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid credentials provided.');
    }

    if (user.status === 'suspended') {
      throw new ApiError(403, 'Your account has been suspended. Please contact support.');
    }

    // Check password correctness using Schema method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials provided.');
    }

    // Sign JWT tokens
    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Persist refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return { user, accessToken, refreshToken };
  }

  /**
   * Renews access and refresh tokens using valid refresh tokens.
   */
  async refresh(tokenPayload) {
    const { refreshToken } = tokenPayload;

    try {
      // Decode and check refresh token validity
      const decoded = verifyRefreshToken(refreshToken);

      // Verify token exists in database and belongs to active user directly on User Model
      const user = await User.findOne({ refreshToken }).select('+refreshToken');
      if (!user) {
        throw new ApiError(401, 'Invalid or expired refresh token.');
      }

      if (user.status === 'suspended') {
        throw new ApiError(403, 'Your account is suspended.');
      }

      // Generate a brand new pair of tokens
      const newAccessToken = generateAccessToken({ id: user._id, role: user.role });
      const newRefreshToken = generateRefreshToken({ id: user._id });

      // Save new refresh token in DB
      user.refreshToken = newRefreshToken;
      await user.save();

      return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new ApiError(401, 'Authentication failed. Please log in again.');
    }
  }

  /**
   * Logs out user by clearing their saved database refresh tokens.
   */
  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    return { success: true };
  }
}

export default new AuthService();
export { AuthService };
