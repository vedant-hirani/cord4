import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../../src/app.js';
import authService from '../../src/models/auth/auth.service.js';

// Mock the business AuthService layer
jest.mock('../../src/models/auth/auth.service.js');

describe('Auth Endpoints Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should return 400 Bad Request if email format is invalid', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Invalid Email User',
          email: 'notanemail',
          password: 'Password123!',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(response.body.errors[0]).toHaveProperty('field', 'email');
    });

    it('should return 400 Bad Request if password lacks upper/lowercase/special characters', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Weak Pass User',
          email: 'valid@example.com',
          password: 'simplepassword',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 201 Created and return registration credentials on success', async () => {
      const mockResult = {
        user: {
          _id: 'some-uid',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          role: 'user',
        },
        accessToken: 'signed-access-token',
        refreshToken: 'signed-refresh-token',
      };

      authService.register = jest.fn().mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          password: 'SecurePassword123!',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken', 'signed-access-token');
      expect(response.body.data.user).toHaveProperty('email', 'jane.smith@example.com');
    });
  });
});
