import prisma from '../../prisma/client';
import bcrypt from 'bcrypt';
import { redisClient } from '../redis/client';
import { Prisma } from '@prisma/client';
import { getCoordinates } from '../utils/getCoordinates';

const MAX_SESSIONS = 3;

async function registerCustomer(
  firstName: string,
  lastName: string,
  phone: string,
  email: string,
  password: string,
) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await prisma.customers.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
        password: hashedPassword,
      },
    });

    return customer;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (
        error.code === 'P2002' &&
        (error.meta?.target as string[])?.includes('email')
      ) {
        throw new Error('A customer with this email already exists');
      }
    }
    throw error;
  }
}

async function registerRestaurant(
  name: string,
  email: string,
  phone: string,
  password: string,
  address: {
    street: string;
    city: string;
    zip: string;
  },
) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // get X and Y from address
    const { lon, lat } = await getCoordinates(address);

    const restaurant = await prisma.restaurants.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        address: {
          create: {
            city: address.city,
            street: address.street,
            zip: address.zip,
            x: lon,
            y: lat,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: {
          select: {
            city: true,
            street: true,
            zip: true,
            x: true,
            y: true,
          },
        },
        createdAt: true,
      },
    });

    return restaurant;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (
        error.code === 'P2002' &&
        (error.meta?.target as string[])?.includes('email')
      ) {
        throw new Error('A restaurant with this email already exists');
      }
    }
    throw error;
  }
}

async function customerLogin(
  email: string,
  password: string,
  rememberMe: boolean,
) {
  const customer = await prisma.customers.findUnique({ where: { email } });

  if (!customer) {
    throw new Error('Invalid credentials');
  }

  if (!(await bcrypt.compare(password, customer.password))) {
    throw new Error('Invalid credentials');
  }

  const sessionTokenData = await manageUserSessions(
    customer.email,
    customer.id,
    rememberMe,
    customer.role,
  );
  return sessionTokenData;
}

async function restaurantLogin(
  email: string,
  password: string,
  rememberMe: boolean,
) {
  const restaurant = await prisma.restaurants.findUnique({ where: { email } });

  if (!restaurant) {
    throw new Error('Invalid credentials');
  }

  if (!(await bcrypt.compare(password, restaurant.password))) {
    throw new Error('Invalid credentials');
  }

  const sessionTokenData = await manageUserSessions(
    restaurant.email,
    restaurant.id,
    rememberMe,
    restaurant.role,
  );
  return sessionTokenData;
}

async function managementLogin(
  email: string,
  password: string,
  rememberMe: boolean,
) {
  const management = await prisma.admins.findUnique({ where: { email } });

  if (!management) {
    throw new Error('Invalid credentials');
  }

  if (!(await bcrypt.compare(password, management.password))) {
    throw new Error('Invalid credentials');
  }

  const sessionTokenData = await manageUserSessions(
    management.email,
    management.id,
    rememberMe,
    management.role,
  );
  return sessionTokenData;
}

async function manageUserSessions(
  email: string,
  userId: string,
  rememberMe: boolean,
  userRole: string,
) {
  const sessionKey = userId;
  const customerSessions = await redisClient.lRange(sessionKey, 0, -1);

  // Remove the oldest session if the maximum number of sessions is reached
  if (customerSessions.length >= MAX_SESSIONS) {
    const oldestSessionToken = customerSessions[0];
    await redisClient.del(oldestSessionToken);
    await redisClient.lPop(sessionKey);
  }

  // Generate a new session token
  const sessionToken = crypto.randomUUID();
  const sessionTokenExpiry = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 1 day

  const sessionData = {
    email,
    userId,
    role: userRole,
    createdAt: new Date().toISOString(),
  };

  // Store the session token in Redis
  await redisClient.set(
    `sessionToken-${sessionToken}`,
    JSON.stringify(sessionData),
    {
      EX: sessionTokenExpiry,
    },
  );

  // Add the new session token to the customer's session list
  await redisClient.rPush(sessionKey, sessionToken);
  await redisClient.expire(sessionKey, sessionTokenExpiry);

  return { sessionToken, sessionTokenExpiry };
}

// Used to enforce type safety for data structures.
interface SessionData {
  userId: string;
}

// Utility function to construct session keys.
function getSessionKey(sessionToken: string): string {
  return `sessionToken-${sessionToken}`;
}

// Utility function to construct user session keys.
function getUserSessionKey(userId: string): string {
  return `${userId}`;
}

async function logout(sessionToken: string) {
  const sessionKey = getSessionKey(sessionToken);
  const sessionData = await redisClient.get(sessionKey);

  if (!sessionData) {
    throw new Error('Invalid or expired session token');
  }

  const { userId } = JSON.parse(sessionData) as SessionData;
  const userSessionKey = getUserSessionKey(userId);

  console.log(`Removing session token for user: ${userId}`);
  await redisClient.lRem(userSessionKey, 0, sessionToken);

  console.log(`Deleting session key: ${sessionKey}`);
  await redisClient.del(sessionKey);

  return { message: 'Logged out successfully' };
}

export {
  registerCustomer,
  registerRestaurant,
  customerLogin,
  restaurantLogin,
  managementLogin,
  manageUserSessions,
  logout,
};
