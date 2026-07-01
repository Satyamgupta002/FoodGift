import test from 'node:test';
import assert from 'node:assert/strict';
import { cancelDonationRequest } from '../controllers/donorController.js';
import Request from '../models/requestModel.js';
import Receiver from '../models/receiverModel.js';

test('cancelDonationRequest marks request cancelled and cleans receiver assignments', async () => {
  const originalFindById = Request.findById;
  const originalFindByIdAndUpdate = Request.findByIdAndUpdate;
  const originalUpdateMany = Receiver.updateMany;

  Request.findById = async () => ({
    _id: 'req-123',
    donor: 'donor-123',
    status: 'pending',
    save: async function () {
      this.status = 'cancelled';
      return this;
    },
  });

  Request.findByIdAndUpdate = async () => ({
    _id: 'req-123',
    donor: 'donor-123',
    status: 'cancelled',
  });

  Receiver.updateMany = async () => ({ acknowledged: true });

  const req = {
    params: { requestId: 'req-123' },
    user: { id: 'donor-123' },
  };
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  try {
    await cancelDonationRequest(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.message, 'Donation request cancelled successfully');
  } finally {
    Request.findById = originalFindById;
    Request.findByIdAndUpdate = originalFindByIdAndUpdate;
    Receiver.updateMany = originalUpdateMany;
  }
});
