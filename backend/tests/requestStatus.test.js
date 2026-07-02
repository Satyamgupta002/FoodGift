import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldMarkRequestAsExpired, isTerminalRequestStatus } from '../utils/requestStatus.js';

test('pending and accepted requests can still be marked expired', () => {
  assert.equal(shouldMarkRequestAsExpired('pending'), true);
  assert.equal(shouldMarkRequestAsExpired('accepted'), true);
});

test('picked up, collected and cancelled requests keep their current status', () => {
  assert.equal(shouldMarkRequestAsExpired('picked up'), false);
  assert.equal(shouldMarkRequestAsExpired('collected'), false);
  assert.equal(shouldMarkRequestAsExpired('cancelled'), false);
  assert.equal(isTerminalRequestStatus('picked up'), true);
  assert.equal(isTerminalRequestStatus('cancelled'), true);
});
