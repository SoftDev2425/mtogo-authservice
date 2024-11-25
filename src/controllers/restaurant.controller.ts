import { Response } from 'express';
import { CustomRequest } from '../types/CustomRequest';
import {
  getRestaurantData,
  getRestaurants,
} from '../services/restaurant.service';

async function handleGetRestaurantData(req: CustomRequest, res: Response) {
  try {
    const { restaurantId } = req.params;
    const restaurant = await getRestaurantData(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    return res.status(200).json({
      restaurant,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function handleGetRestaurants(req: CustomRequest, res: Response) {
  try {
    const { zip } = req.params;
    const restaurants = await getRestaurants(zip);

    return res.status(200).json({ restaurants });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export default { handleGetRestaurantData, handleGetRestaurants };
