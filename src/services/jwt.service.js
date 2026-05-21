import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import logger from '../config/logger.js';

export class JwtService {
  /**
   * Generates a token with standard configuration.
   * @param {Object} payload Payload contents
   * @param {string} secret Custom secret override
   * @param {string} expiresIn Custom expiry override
   * @returns {string} Signed JWT token
   */
  static generateToken(payload, secret = env.JWT_SECRET, expiresIn = env.JWT_EXPIRES_IN) {
    try {
      return jwt.sign(payload, secret, { expiresIn });
    } catch (error) {
      logger.error(`Error signing JWT token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verifies JWT token integrity and returns parsed values.
   * @param {string} token Signed token string
   * @param {string} secret Custom secret override
   * @returns {Object} Parsed token payload
   */
  static verifyToken(token, secret = env.JWT_SECRET) {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      logger.warn(`Failed token verification attempt: ${error.message}`);
      throw error;
    }
  }
}

export default JwtService;
