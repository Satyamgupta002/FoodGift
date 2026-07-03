import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const generateOtp = () => crypto.randomInt(100000, 999999).toString();

export const hashOtp = async (otp) => bcrypt.hash(otp, 10);

export const compareOtp = async (otp, hashedOtp) => bcrypt.compare(otp, hashedOtp);

export const isOtpExpired = (expiresAt) => {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() <= Date.now();
};
