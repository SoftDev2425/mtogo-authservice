import supertest from 'supertest';
import {
  createTestAdmin,
  createTestCustomer,
  createTestRestaurant,
  testPassword,
} from '../../utils/helperMethods';
import { app } from '../setup/setup';
import { validate as uuidValidate } from 'uuid';
import prisma from '../../../prisma/client';
import { Restaurant } from '../../models/restaurant';
import { Customer } from '../../models/customer';
import { faker } from '@faker-js/faker';
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

  it('should return 400 if email or password is missing for customer', async () => {
    // Act
    const response = await supertest(app).post('/api/auth/login/customer');

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email and password are required');
  });

  it('should return 401 if credentials are invalid for customer', async () => {
    // Act
    const response = await supertest(app)
      .post('/api/auth/login/customer')
      .send({ email: 'invalid@email.com', password: 'invalidPassword' });

    // Assert
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });

  it('should return 400 if email is invalid for customer', async () => {
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

  it('should return 401 if password is invalid for customer', async () => {
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

describe('restaurantLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully login a restaurant account', async () => {
    // Arrange
    const testRestaurant = await createTestRestaurant();

    // Act
    const response = await supertest(app)
      .post('/api/auth/login/restaurant')
      .send({ email: testRestaurant.email, password: testPassword });

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

  it('should return 400 if email or password is missing for restaurant', async () => {
    // Act
    const response = await supertest(app).post('/api/auth/login/restaurant');

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email and password are required');
  });

  it('should return 401 if credentials are invalid for restuarant', async () => {
    // Act
    const response = await supertest(app)
      .post('/api/auth/login/restaurant')
      .send({ email: 'invalid@email.com', password: 'invalidPassword' });

    // Assert
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });

  it('should return 400 if email is invalid for restaurant', async () => {
    // Act
    const response = await supertest(app)
      .post('/api/auth/login/restaurant')
      .send({ email: 'invalidEmail', password: 'password' });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toBe('email');
    expect(response.body.errors[0].message).toBe(
      'Please provide a valid email address.',
    );
  });

  it('should return 401 if password is invalid for restaurant', async () => {
    // Act
    const testRestaurant = await createTestRestaurant();
    const response = await supertest(app)
      .post('/api/auth/login/restaurant')
      .send({ email: testRestaurant.email, password: 'invalidPassword' });

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

  it('should return 400 if email or password is missing for admin', async () => {
    // Act
    const response = await supertest(app).post('/api/auth/login/management');

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email and password are required');
  });

  it('should return 401 if credentials are invalid for admin', async () => {
    // Act
    const response = await supertest(app)
      .post('/api/auth/login/management')
      .send({ email: 'invalid@email.com', password: 'invalidPassword' });

    // Assert
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });

  it('should return 400 if email is invalid for admin', async () => {
    // Act
    const response = await supertest(app)
      .post('/api/auth/login/management')
      .send({ email: 'invalidEmail', password: 'password' });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toBe('email');
    expect(response.body.errors[0].message).toBe(
      'Please provide a valid email address.',
    );
  });

  it('should return 401 if password is invalid for admin', async () => {
    // Act
    const testAdmin = await createTestAdmin();
    const response = await supertest(app)
      .post('/api/auth/login/management')
      .send({ email: testAdmin.email, password: 'invalidPassword' });

    // Assert
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
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
      regNo: '1234',
      accountNo: '12345678',
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
      regNo: '1234',
      accountNo: '12345678',
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

  // Boundary test for restaurant phone length
  it('should reject restaurant with phone length 9', async () => {
    // Arrange
    mockRestaurant.phone = faker.string.numeric(9);

    // Act
    const response = await supertest(app).post(url).send(mockRestaurant);

    // Assert
    expect(response.status).toBe(400);
  });

  it('should register restaurant with phone length 10', async () => {
    // Arrange
    mockRestaurant.phone = faker.string.numeric(10);

    // Act
    const response = await supertest(app).post(url).send(mockRestaurant);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Restaurant registered successfully');
  });

  it('should register restaurant with phone length 15', async () => {
    // Arrange
    mockRestaurant.phone = faker.string.numeric(15);

    // Act
    const response = await supertest(app).post(url).send(mockRestaurant);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Restaurant registered successfully');
  });

  it('should reject restaurant with phone length 16', async () => {
    // Arrange
    mockRestaurant.phone = faker.string.numeric(16);

    // Act
    const response = await supertest(app).post(url).send(mockRestaurant);

    // Assert
    expect(response.status).toBe(400);
  });

  // Equivalence Class Partitioning for restaurant passwords
  it('should register restaurant with valid password', async () => {
    // Arrange
    mockRestaurant.password = 'Password1!';

    // Act
    const response = await supertest(app).post(url).send(mockRestaurant);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Restaurant registered successfully');
  });

  it('should reject restaurant with too short password', async () => {
    // Arrange
    mockRestaurant.password = 'Pa1!';

    // Act
    const response = await supertest(app).post(url).send(mockRestaurant);

    // Assert
    expect(response.status).toBe(400);
  });

  it('should reject restaurant with no uppercase letter', async () => {
    // Arrange
    mockRestaurant.password = 'password1!';

    // Act
    const response = await supertest(app).post(url).send(mockRestaurant);

    // Assert
    expect(response.status).toBe(400);
  });

  it('should reject restaurant with no lowercase letter', async () => {
    // Arrange
    mockRestaurant.password = 'PASSWORD1!';

    // Act
    const response = await supertest(app).post(url).send(mockRestaurant);

    // Assert
    expect(response.status).toBe(400);
  });

  it('should reject restaurant with no number', async () => {
    // Arrange
    mockRestaurant.password = 'Password!';

    // Act
    const response = await supertest(app).post(url).send(mockRestaurant);

    // Assert
    expect(response.status).toBe(400);
  });

  it('should reject restaurant with no special character', async () => {
    // Arrange
    mockRestaurant.password = 'Password1';

    // Act
    const response = await supertest(app).post(url).send(mockRestaurant);

    // Assert
    expect(response.status).toBe(400);
  });

  it('should reject restaurant with invalid character', async () => {
    // Arrange
    mockRestaurant.password = 'Password1<';

    // Act
    const response = await supertest(app).post(url).send(mockRestaurant);

    // Assert
    expect(response.status).toBe(400);
  });

  it('should reject restaurant with empty string', async () => {
    // Arrange
    mockRestaurant.password = '';

    // Act
    const response = await supertest(app).post(url).send(mockRestaurant);

    // Assert
    expect(response.status).toBe(400);
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

describe('registerCustomer', () => {
  const url = '/api/auth/register/customer';
  let mockCustomer: Customer;

  beforeEach(async () => {
    jest.clearAllMocks();
    const mockCoordinates = { lat: 1.1, lon: 1.1 };
    (getCoordinates as jest.Mock).mockResolvedValue(mockCoordinates);

    mockCustomer = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+4523456789',
      email: 'johndoe@example.com',
      password: 'Validated1!',
    };

    prisma.customers.create = jest.fn().mockResolvedValue(mockCustomer);
  });

  // Boundary Test Cases
  it('should reject customer with empty first name', async () => {
    // Arrange
    mockCustomer.firstName = '';

    // Act
    const response = await supertest(app).post(url).send(mockCustomer);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.errors).toContainEqual({
      field: 'firstName',
      message: 'firstName is required',
    });
  });

  it('should register customer with first name length 1', async () => {
    // Arrange
    mockCustomer.firstName = 'A';

    // Act
    const response = await supertest(app).post(url).send(mockCustomer);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Customer registered successfully');
  });

  it('should reject customer with empty last name', async () => {
    // Arrange
    mockCustomer.lastName = '';

    // Act
    const response = await supertest(app).post(url).send(mockCustomer);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.errors).toContainEqual({
      field: 'lastName',
      message: 'lastName is required',
    });
  });

  it('should register customer with last name length 1', async () => {
    // Arrange
    mockCustomer.lastName = 'A';

    // Act
    const response = await supertest(app).post(url).send(mockCustomer);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Customer registered successfully');
  });

  it('should reject customer with phone number length 7', async () => {
    // Arrange
    mockCustomer.phone = '+45234567';

    // Act
    const response = await supertest(app).post(url).send(mockCustomer);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.errors).toContainEqual({
      field: 'phone',
      message: 'Please enter a valid phone number',
    });
  });

  it('should register customer with phone number length 8', async () => {
    // Arrange
    mockCustomer.phone = '+4523456789';

    // Act
    const response = await supertest(app).post(url).send(mockCustomer);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Customer registered successfully');
  });

  it('should reject customer with phone number length 9', async () => {
    // Arrange
    mockCustomer.phone = '+45234567890';

    // Act
    const response = await supertest(app).post(url).send(mockCustomer);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.errors).toContainEqual({
      field: 'phone',
      message: 'Please enter a valid phone number',
    });
  });

  it('should reject customer with email missing @ character', async () => {
    // Arrange
    mockCustomer.email = 'testexample.com';

    // Act
    const response = await supertest(app).post(url).send(mockCustomer);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.errors).toContainEqual({
      field: 'email',
      message: 'Please enter a valid email address',
    });
  });

  it('should reject customer with missing email domain', async () => {
    // Arrange
    mockCustomer.email = 'test@example';

    // Act
    const response = await supertest(app).post(url).send(mockCustomer);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.errors).toContainEqual({
      field: 'email',
      message: 'Please enter a valid email address',
    });
  });

  it('should register customer with valid email', async () => {
    // Arrange
    mockCustomer.email = 'test@example.com';

    // Act
    const response = await supertest(app).post(url).send(mockCustomer);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Customer registered successfully');
  });

  it('should reject customer with password length 7', async () => {
    // Arrange
    mockCustomer.password = 'Abcde1!';

    // Act
    const response = await supertest(app).post(url).send(mockCustomer);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.errors).toContainEqual({
      field: 'password',
      message: 'Password must be at least 8 characters',
    });
  });

  it('should register customer with password length 8', async () => {
    // Arrange
    mockCustomer.password = 'Abcdef1!';

    // Act
    const response = await supertest(app).post(url).send(mockCustomer);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Customer registered successfully');
  });

  // Equivalence Partition Test Cases
  it('should register customer with valid phone number without country code', async () => {
    // Arrange
    mockCustomer.phone = '22334455';

    // Act
    const response = await supertest(app).post(url).send(mockCustomer);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Customer registered successfully');
  });

  it('should reject customer with phone number containing non-numeric characters', async () => {
    // Arrange
    mockCustomer.phone = 'abc12345';

    // Act
    const response = await supertest(app).post(url).send(mockCustomer);

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.errors).toContainEqual({
      field: 'phone',
      message: 'Please enter a valid phone number',
    });
  });
});
