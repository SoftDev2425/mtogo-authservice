import express from 'express';
import restaurantController from '../controllers/restaurant.controller';

const router = express.Router();

router.get('/:restaurantId', restaurantController.handleGetRestaurantData);

export default router;
