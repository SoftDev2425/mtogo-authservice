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

export async function createTestRestaurant() {
  try {
    // Test address for the restaurant
    const address = await prisma.address.create({
      data: {
        street: '123 Test St',
        city: 'Testville',
        zip: '12345',
        x: 45.5,
        y: -100.0,
      },
    });

    // Test restaurant with the related address
    return await prisma.restaurants.create({
      data: {
        name: 'Test Restaurant',
        email: 'test.restaurant@example.com',
        phone: '9876543210',
        password: await hashPassword(),
        addressId: address.id,
      },
    });
  } catch (error) {
    throw new Error(`Error creating test restaurant: ${error}`);
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
