import prisma from '../../../prisma/client';
import {
  registerCustomer,
  registerRestaurant,
} from '../../services/auth.service';
import bcrypt from 'bcrypt';
import * as locationService from '../../utils/getCoordinates';
import { Prisma } from '@prisma/client';
jest.mock('../../utils/getCoordinates');

describe('registerCustomer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully register a customer with hashed password', async () => {
    // Arrange
    const mockCustomer = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
      email: 'john.doe@example.com',
      password: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mocking bcrypt.hash to return the same password
    bcrypt.hash = jest.fn().mockResolvedValue(mockCustomer.password);

    prisma.customers.create = jest.fn().mockResolvedValue(mockCustomer);

    // Act
    const result = await registerCustomer(
      mockCustomer.firstName,
      mockCustomer.lastName,
      mockCustomer.phone,
      mockCustomer.email,
      'notHashedPassword',
    );

    // Assert
    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    expect(bcrypt.hash).toHaveBeenCalledWith('notHashedPassword', 10);
    expect(prisma.customers.create).toHaveBeenCalledTimes(1);
    expect(prisma.customers.create).toHaveBeenCalledWith({
      data: {
        firstName: mockCustomer.firstName,
        lastName: mockCustomer.lastName,
        phone: mockCustomer.phone,
        email: mockCustomer.email,
        password: mockCustomer.password,
      },
    });
    expect(result).toEqual(mockCustomer);
  });

  it('should throw an error if a customer with the same email already exists', async () => {
    // Arrange
    const mockError = new Error('A customer with this email already exists');
    mockError.name = 'PrismaClientKnownRequestError';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockError as any).code = 'P2002';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockError as any).meta = { target: ['email'] };

    // Mock prisma.customers.create to throw a Prisma error
    prisma.customers.create = jest.fn().mockRejectedValueOnce(mockError);

    // Act & Assert
    await expect(
      registerCustomer(
        'John',
        'Doe',
        '1234567890',
        'john.doe@example.com',
        'notHashedPassword',
      ),
    ).rejects.toThrow('A customer with this email already exists');
  });

  it('should throw an error if an unexpected error occurs', async () => {
    // Arrange
    const mockError = new Error('Something went wrong');

    // Mock prisma.customers.create to throw an unexpected error
    prisma.customers.create = jest.fn().mockRejectedValueOnce(mockError);

    // Act & Assert
    await expect(
      registerCustomer(
        'John',
        'Doe',
        '1234567890',
        'john.doe@example.com',
        'notHashedPassword',
      ),
    ).rejects.toThrow('Something went wrong');

    // Assert
    expect(prisma.customers.create).toHaveBeenCalledTimes(1);
  });
});

describe('registerRestaurant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock the behavior of getCoordinates to return fixed coordinates
  const mockCoordinates = { lat: 1.1, lon: 1.1 };
  (locationService.getCoordinates as jest.Mock).mockResolvedValue(
    mockCoordinates,
  );

  const mockRestaurant = {
    name: 'Test Restaurant',
    email: 'test.restaurant@example.com',
    phone: '1234567890',
    password: 'hashedPassword',
    address: {
      street: 'Test Street 1',
      city: 'Test City',
      zip: '1234',
      x: mockCoordinates.lon,
      y: mockCoordinates.lat,
    },
  };

  bcrypt.hash = jest.fn().mockResolvedValue(mockRestaurant.password);
  it('should successfully register a restaurant', async () => {
    // Arrange
    prisma.restaurants.create = jest.fn().mockResolvedValue(mockRestaurant);

    // Act
    const result = await registerRestaurant(
      mockRestaurant.name,
      mockRestaurant.email,
      mockRestaurant.phone,
      'notHashedPassword',
      mockRestaurant.address,
    );

    // Assert
    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    expect(bcrypt.hash).toHaveBeenCalledWith('notHashedPassword', 10);
    expect(prisma.restaurants.create).toHaveBeenCalledTimes(1);
    expect(prisma.restaurants.create).toHaveBeenCalledWith({
      data: {
        name: mockRestaurant.name,
        phone: mockRestaurant.phone,
        email: mockRestaurant.email,
        password: mockRestaurant.password,
        address: {
          create: {
            city: mockRestaurant.address.city,
            street: mockRestaurant.address.street,
            zip: mockRestaurant.address.zip,
            x: mockRestaurant.address.x,
            y: mockRestaurant.address.y,
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
    expect(result).toEqual(mockRestaurant);
  });

  it('should reject register restaurant with already existing email', async () => {
    // Arrange
    // Simulate Prisma throwing a unique constraint error for the email
    prisma.restaurants.create = jest.fn().mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError(
        'A restaurant with this email already exists',
        {
          code: 'P2002',
          meta: {
            target: ['email'],
          },
          clientVersion: '3.10.0',
        },
      ),
    );

    // Act & Assert
    await expect(
      registerRestaurant(
        mockRestaurant.name,
        mockRestaurant.email,
        mockRestaurant.phone,
        'notHashedPassword',
        mockRestaurant.address,
      ),
    ).rejects.toThrow('A restaurant with this email already exists');
  });

  it('should throw error if something unexpected happens', async () => {
    // Arrange
    const mockError = new Error('Something went wrong');

    prisma.restaurants.create = jest.fn().mockRejectedValueOnce(mockError);

    // Act & Assert
    await expect(
      registerRestaurant(
        mockRestaurant.name,
        mockRestaurant.email,
        mockRestaurant.phone,
        'notHashedPassword',
        mockRestaurant.address,
      ),
    ).rejects.toThrow(new Error('Something went wrong'));

    expect(prisma.restaurants.create).toHaveBeenCalledTimes(1);
  });
});
