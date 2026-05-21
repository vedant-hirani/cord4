import crypto from 'crypto';

/**
 * Generates a cryptographically secure numeric OTP of specified length.
 * @param {number} length Length of the OTP (default 6)
 * @returns {string} OTP string
 */
export const generateOTP = (length = 6) => {
  if (length <= 0) return '';
  
  // Use crypto for high security numeric generation
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    const index = randomBytes[i] % digits.length;
    otp += digits[index];
  }
  
  return otp;
};

export default generateOTP;
