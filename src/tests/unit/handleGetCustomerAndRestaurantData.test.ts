import { handleGetCustomerAndRestaurantData } from '../../controllers/customerAndRestaurant.controller';
import * as customerService from '../../services/customer.service';
import * as restaurantService from '../../services/restaurant.service';
import { faker } from '@faker-js/faker';

jest.mock('../../services/customer.service.ts');
jest.mock('../../services/restaurant.service.ts');

describe('handleGetCustomerAndRestaurantData', () => {
  it('should return customer and restaurant data when both exists', async () => {
    // Arrange
    const customerId = '1';
    const restaurantId = '10';

    const mockCustomerData = { id: customerId, name: faker.person.fullName() };
    const mockRestaurantData = { id: restaurantId, name: faker.company.name() };

    (customerService.getCustomerData as jest.Mock).mockResolvedValue(
      mockCustomerData,
    );
    (restaurantService.getRestaurantData as jest.Mock).mockResolvedValue(
      mockRestaurantData,
    );

    // Act
    const result = await handleGetCustomerAndRestaurantData(
      customerId,
      restaurantId,
    );

    // Assert
    expect(result).toEqual({
      customerData: mockCustomerData,
      restaurantData: mockRestaurantData,
    });
  });

  it('should throw an error if both customer and restaurant are not found', async () => {
    // Arrange
    (customerService.getCustomerData as jest.Mock).mockResolvedValue(null);
    (restaurantService.getRestaurantData as jest.Mock).mockResolvedValue(null);

    // Act & Assert
    await expect(
      handleGetCustomerAndRestaurantData(
        faker.string.numeric(1),
        faker.string.numeric(2),
      ),
    ).rejects.toThrow('Restaurant not found');
  });
});
