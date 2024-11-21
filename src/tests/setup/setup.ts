import prisma from '../../../prisma/client';
import createServer from '../../utils/server';
import { redisClient } from '../../redis/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let app: any;

global.beforeAll(async () => {
  app = createServer();

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
  await redisClient.flushAll();
});

global.afterAll(async () => {
  console.log('Disconnecting from Prisma...');
  await prisma.$disconnect();
  console.log('Prisma disconnected.');

  console.log('Quitting Redis client...');
  try {
    await redisClient.quit();
    console.log('Redis client quit.');
  } catch (error) {
    console.error('Error quitting Redis client:', error);
  }
});
