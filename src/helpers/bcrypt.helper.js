import bcrypt from 'bcryptjs';

/**
 * Hashes a plaintext password using bcryptjs.
 * @param {string} password The plaintext password to hash
 * @param {number} saltRounds The salt rounds to apply (default 10)
 * @returns {Promise<string>} The hashed password
 */
export const hashPassword = async (password, saltRounds = 10) => {
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compares plaintext password with hashed counterpart.
 * @param {string} password Plaintext password input
 * @param {string} hashedPassword Hashed password database reference
 * @returns {Promise<boolean>} Match status
 */
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export default {
  hashPassword,
  comparePassword,
};
