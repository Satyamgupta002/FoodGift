import { Queue } from 'bullmq';

const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    };

const expiryQueue = new Queue('expiry', { connection });

export default expiryQueue;
