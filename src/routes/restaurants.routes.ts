import express from 'express';
import restaurantController from '../controllers/restaurant.controller';

const router = express.Router();

router.get('/:restaurantId', restaurantController.handleGetRestaurantData);

router.get('/zipcode/:zip', restaurantController.handleGetRestaurants)

export default router;
