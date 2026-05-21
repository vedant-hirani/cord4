import { jest } from '@jest/globals';

const mockFindOne = jest.fn();
const mockSave = jest.fn();

const MockUser = jest.fn().mockImplementation(() => {
  return {
    _id: 'new-id-jane',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'user',
    save: mockSave,
  };
});
MockUser.findOne = mockFindOne;

// Standard ESM mock module registration
jest.unstable_mockModule('../../src/models/user/user.model.js', () => ({
  __esModule: true,
  default: MockUser,
  User: MockUser,
}));

// Dynamically import the service and mocked User module
const { AuthService } = await import('../../src/models/auth/auth.service.js');
const { default: User } = await import('../../src/models/user/user.model.js');

describe('AuthService Unit Tests', () => {
  let authService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  describe('register()', () => {
    it('should throw an ApiError if the email already exists', async () => {
      const payload = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      };

      // Mock user existence check directly on User model
      mockFindOne.mockResolvedValue({ id: 'some-user-id' });

      await expect(authService.register(payload)).rejects.toThrow(
        'A user account with this email address already exists.'
      );
      expect(mockFindOne).toHaveBeenCalledWith({ email: payload.email });
    });

    it('should create user, generate tokens and save them successfully', async () => {
      const payload = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123!',
        role: 'user',
      };

      const mockSavedInstance = {
        _id: 'new-id-jane',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'user',
        save: mockSave,
      };

      // Mock User.findOne to return null (meaning email is free)
      mockFindOne.mockResolvedValue(null);
      mockSave.mockResolvedValue(true);

      // Mock User constructor implementation to return our mock user instance
      MockUser.mockImplementation(() => {
        return mockSavedInstance;
      });

      const result = await authService.register(payload);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toEqual(expect.any(String));
      expect(result.refreshToken).toEqual(expect.any(String));
      expect(MockUser).toHaveBeenCalledWith({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role: payload.role,
      });
      expect(mockSave).toHaveBeenCalled();
      expect(mockSavedInstance.refreshToken).toEqual(expect.any(String));
    });
  });
});
