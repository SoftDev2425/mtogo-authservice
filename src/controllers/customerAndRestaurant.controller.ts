import { getCustomerData } from '../services/customer.service';
import { getRestaurantData } from '../services/restaurant.service';

async function handleGetCustomerAndRestaurantData(
  customerId: string,
  restaurantId: string,
) {
  const customerData = await getCustomerData(customerId);
  const restaurantData = await getRestaurantData(restaurantId);

  let errorMsg = '';

  if (!customerData) {
    errorMsg = 'Customer not found';
  }

  if (!restaurantData) {
    errorMsg = 'Restaurant not found';
  }

  if (errorMsg) {
    throw new Error(errorMsg);
  }

  return {
    customerData,
    restaurantData,
  };
}

export { handleGetCustomerAndRestaurantData };
