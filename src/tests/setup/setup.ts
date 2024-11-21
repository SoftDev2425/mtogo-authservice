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
});

global.afterAll(async () => {
  try {
    console.log('Disconnecting from Prisma...');
    await prisma.$disconnect();
    console.log('Prisma disconnected.');

    console.log('Quitting Redis client...');
    await redisClient.disconnect();
    console.log('Redis client disconnect.');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});
