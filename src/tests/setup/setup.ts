import prisma from '../../../prisma/client';
import createServer from '../../utils/server';
import { redisClient } from '../../redis/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let app: any;

global.beforeAll(async () => {
  app = createServer();

  const redisHost = process.env.REDIS_HOST || 'localhost'; // Will be 'redis' in GitHub Actions
  const redisPort = process.env.REDIS_PORT || '6379';
  console.log(redisHost);
  console.log(redisPort);

  await redisClient.connect();

  redisClient.on('error', () =>
    console.log('Connection to redis server failed'),
  );
});

global.beforeEach(async () => {
  // clear database from all tables
  await prisma.$transaction([
    prisma.customers.deleteMany(),
    prisma.restaurants.deleteMany(),
    prisma.address.deleteMany(),
    prisma.admins.deleteMany(),
  ]);
});

global.afterAll(async () => {
  console.log('Disconnecting from Prisma...');
  await prisma.$disconnect();
  console.log('Prisma disconnected.');

  console.log('Quitting Redis client...');
  await redisClient.quit();
  console.log('Redis client quit.');
});
