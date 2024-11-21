import supertest from 'supertest';
import { app } from '../setup/setup';
import { createTestRestaurant } from '../../utils/helperMethods';

describe('Get Restaurant Data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully retrieve restaurant data', async () => {
    // Arrange
    const testRestaurant = await createTestRestaurant();

    const testRestaurantId = testRestaurant.id;

    // Act
    const response = await supertest(app).get(
      `/api/restaurants/${testRestaurantId}`,
    );

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      restaurant: {
        id: testRestaurantId,
        name: testRestaurant.name,
        email: testRestaurant.email,
        phone: testRestaurant.phone,
        address: expect.objectContaining({
          id: testRestaurant.addressId,
        }),
      },
    });
  });

  it('should return 404 for an invalid restaurant ID', async () => {
    // Arrange
    const invalidId = 'invalid-id';

    // Act
    const response = await supertest(app).get(`/api/restaurants/${invalidId}`);

    // Assert
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Restaurant not found' });
  });

  it('should return 500 when a server error occurs', async () => {
    // Arrange
    jest
      .spyOn(require('../../services/restaurant.service'), 'getRestaurantData')
      .mockRejectedValue(new Error('Database error'));

    const restaurantId = 'restaurant-id';

    // Act
    const response = await supertest(app).get(
      `/api/restaurants/${restaurantId}`,
    );

    // Assert
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Internal Server Error' });
  });
});
