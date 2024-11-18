import prisma from '../../prisma/client';
import bcrypt from 'bcrypt';

export async function createTestCustomer() {
  try {
    return await prisma.customers.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        email: 'john.doe@example.com',
        password: await hashPassword(),
      },
    });
  } catch (error) {
    throw new Error(`Error creating test user: ${error}`);
  }
}

export async function createTestAdmin() {
  try {
    return await prisma.admins.create({
      data: {
        email: 'john@example.com',
        password: await hashPassword(),
      },
    });
  } catch (error) {
    throw new Error(`Error creating test admin: ${error}`);
  }
}

export const testPassword = 'Abcd1234';
const hashPassword = async () => await bcrypt.hash(testPassword, 10);
