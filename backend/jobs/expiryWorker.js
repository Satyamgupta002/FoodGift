import dotenv from 'dotenv';
dotenv.config();

import { Worker, Queue } from 'bullmq';
import Request from '../models/requestModel.js';
const getConnection = () => {
  if (process.env.REDIS_URL) {
    return { url: process.env.REDIS_URL };
  }

  
};

export const startExpiryWorker = () => {
  const connection = getConnection();
  const expiryQueue = new Queue('expiry', { connection });

  const worker = new Worker(
    'expiry',
    async (job) => {
      const { requestId } = job.data || {};
      if (!requestId) return;

      const request = await Request.findById(requestId);
      if (!request) {
        console.log(`ExpiryWorker: request ${requestId} not found`);
        return;
      }

      const now = Date.now();
      const exp = new Date(request.expiryTime).getTime();
      if (exp > now) {
        const delay = exp - now;
        await expiryQueue.add('expire-request', { requestId }, { delay, removeOnComplete: true, attempts: 3 });
        return;
      }

      if (request.status !== 'expired') {
        request.status = 'expired';
        await request.save();
        console.log(`ExpiryWorker: marked request ${requestId} as expired`);
      } else {
        console.log(`ExpiryWorker: request ${requestId} already expired`);
      }
    },
    { connection }
  );

  worker.on('failed', (job, err) => {
    console.error('ExpiryWorker job failed', job.id, err);
  });

  process.on('SIGINT', async () => {
    await worker.close();
    process.exit(0);
  });

  console.log('ExpiryWorker started');
  return worker;
};

export default startExpiryWorker;
