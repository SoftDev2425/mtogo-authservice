import { Response } from 'express';
import { CustomRequest } from '../types/CustomRequest';
import { getRestaurantData } from '../services/restaurant.service';

async function handleGetRestaurantData(req: CustomRequest, res: Response) {
  try {
    const { restaurantId } = req.params;
    const restaurant = await getRestaurantData(restaurantId);
    return res.status(200).json({
      restaurant,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export default { handleGetRestaurantData };
