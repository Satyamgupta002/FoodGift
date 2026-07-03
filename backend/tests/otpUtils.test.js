import test from 'node:test';
import assert from 'node:assert/strict';
import { generateOtp, isOtpExpired } from '../utils/otp.js';

test('generateOtp returns a six-digit code', () => {
  const otp = generateOtp();
  assert.match(otp, /^\d{6}$/);
});

test('otp expiration helper marks future and past expiry correctly', () => {
  const future = new Date(Date.now() + 60_000).toISOString();
  const past = new Date(Date.now() - 60_000).toISOString();
  assert.equal(isOtpExpired(future), false);
  assert.equal(isOtpExpired(past), true);
});
