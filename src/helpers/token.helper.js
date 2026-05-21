import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Signs a short-lived access JWT token.
 * @param {Object} payload Payload contents (e.g. { id, role })
 * @returns {string} Token string
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Signs a long-lived refresh JWT token.
 * @param {Object} payload Payload contents (e.g. { id })
 * @returns {string} Token string
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * Verifies a refresh token.
 * @param {string} token Refresh token
 * @returns {Object} Decoded payload
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};
