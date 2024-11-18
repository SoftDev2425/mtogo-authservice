import supertest from 'supertest';
import {
  createTestAdmin,
  createTestCustomer,
  testPassword,
} from '../../utils/helperMethods';
import { app } from '../setup/setup';
import { validate as uuidValidate } from 'uuid';
import prisma from '../../../prisma/client';
import { Restaurant } from '../../models/restaurant';
import { getCoordinates } from '../../utils/getCoordinates';
jest.mock('../../utils/getCoordinates');

describe('customerLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully login a customer', async () => {
    // Arrange
    const testCustomer = await createTestCustomer();

    // Act
    const response = await supertest(app)
      .post('/api/auth/login/customer')
      .send({ email: testCustomer.email, password: testPassword });

    // Assert
    expect(response.status).toBe(200);
    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.headers['set-cookie'][0]).toContain('session');

    //check if valid uuid
    const sessionToken = response.headers['set-cookie'][0]
      .split(';')[0]
      .split('=')[1];
    expect(uuidValidate(sessionToken)).toBe(true);
    expect(response.body.message).toBe('Login successful!');
  });

  it('should return 400 if email or password is missing', async () => {
    // Act
    const response = await supertest(app).post('/api/auth/login/customer');

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email and password are required');
  });

  it('should return 401 if credentials are invalid', async () => {
    // Act
    const response = await supertest(app)
      .post('/api/auth/login/customer')
      .send({ email: 'invalid@email.com', password: 'invalidPassword' });

    // Assert
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });

  it('should return 400 if email is invalid', async () => {
    // Act
    const response = await supertest(app)
      .post('/api/auth/login/customer')
      .send({ email: 'invalidEmail', password: 'password' });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toBe('email');
    expect(response.body.errors[0].message).toBe(
      'Please provide a valid email address.',
    );
  });

  it('should return 401 if password is invalid', async () => {
    // Act
    const testCustomer = await createTestCustomer();
    const response = await supertest(app)
      .post('/api/auth/login/customer')
      .send({ email: testCustomer.email, password: 'invalidPassword' });

    // Assert
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });
});

describe('adminLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully login an admin', async () => {
    // Arrange
    const admin = await createTestAdmin();

    // Act
    const response = await supertest(app)
      .post('/api/auth/login/management')
      .send({ email: admin.email, password: testPassword });

    // Assert
    expect(response.status).toBe(200);
    expect(response.headers['set-cookie']).toBeDefined();

    expect(response.headers['set-cookie'][0]).toContain('session');

    // // check if valid uuid
    const sessionToken = response.headers['set-cookie'][0]
      .split(';')[0]
      .split('=')[1];
    expect(uuidValidate(sessionToken)).toBe(true);
    expect(response.body.message).toBe('Login successful!');
  });
});

describe('registerRestaurant', () => {
  const url = '/api/auth/register/restaurant';
  let mockRestaurant: Restaurant;

  beforeEach(async () => {
    jest.clearAllMocks();
    const mockCoordinates = { lat: 1.1, lon: 1.1 };
    (getCoordinates as jest.Mock).mockResolvedValue(mockCoordinates);

    mockRestaurant = {
      name: 'Test Restaurant',
      email: 'test.restaurant@example.com',
      phone: '1234567890',
      password: 'Validated1!',
      address: {
        street: 'Test Street 1',
        city: 'Test City',
        zip: '1234',
        x: mockCoordinates.lon,
        y: mockCoordinates.lat,
      },
    };

    prisma.restaurants.create = jest.fn().mockResolvedValue(mockRestaurant);
  });

  it('should successfully register a restaurant', async () => {
    // Act
    const response = await supertest(app).post(url).send(mockRestaurant);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Restaurant registered successfully');
  });

  it('should return validation error for missing required fields', async () => {
    // Arrange
    const missingName = {
      email: 'test.restaurant@example.com',
      phone: '1234567890',
      password: 'hashedpassword',
      address: {
        street: 'Test Street 1',
        city: 'Test City',
        zip: '1234',
        x: 1.1,
        y: 1.1,
      },
    };

    // Act
    const response = await supertest(app).post(url).send(missingName);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.errors).toContainEqual({
      field: 'name',
      message: 'name is required',
    });
  });

  it('should return Zod validation errors if data is invalid', async () => {
    // Arrange
    const invalidEmail = {
      name: 'Test Restaurant',
      email: 'invalid-email',
      phone: '1234567890',
      password: 'hashedpassword',
      address: {
        street: 'Test Street 1',
        city: 'Test City',
        zip: '1234',
        x: 1.1,
        y: 1.1,
      },
    };

    // Act
    const response = await supertest(app).post(url).send(invalidEmail);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.errors).toContainEqual({
      field: 'email',
      message: 'Invalid email address',
    });
  });

  it('should return 500 for unexpected errors', async () => {
    // Arrange
    const mockError = new Error('Unexpected error');
    prisma.restaurants.create = jest.fn().mockRejectedValue(mockError);

    // Act
    const response = await supertest(app).post(url).send(mockRestaurant);

    // Assert
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal Server Error');
  });
});

describe('logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should successfully logout', async () => {
    // Arrange
    const testCustomer = await createTestCustomer();
    const loginResponse = await supertest(app)
      .post('/api/auth/login/customer')
      .send({ email: testCustomer.email, password: testPassword });

    console.log(loginResponse.headers['set-cookie']);
    console.log(loginResponse);

    // Extract session token from response cookie
    const sessionToken = loginResponse.headers['set-cookie'][0].split('=')[1];

    // Act
    const response = await supertest(app)
      .post('/api/auth/logout')
      .set('Cookie', `session=${sessionToken}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Logout successful');
  });

  it('should return error 400 BAD REQUEST if session token missing', async () => {
    // Arrange
    // Act
    const missingTokenResponse = await supertest(app).post('/api/auth/logout');

    // Assert
    expect(missingTokenResponse.status).toBe(400);
    expect(missingTokenResponse.body.message).toBe('Session token is missing');
  });

  it('should return error 500 INTERNAL SERVER ERROR for invalid session token', async () => {
    // Arrange
    const invalidToken = 'invalidToken';

    // Act
    const invalidTokenResponse = await supertest(app)
      .post('/api/auth/logout')
      .set('Cookie', `session=${invalidToken}`);

    // Assert
    expect(invalidTokenResponse.status).toBe(500);
    expect(invalidTokenResponse.body.message).toBe(
      'Invalid or expired session token',
    );
  });
});
