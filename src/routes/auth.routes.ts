import express, { Response } from 'express';
import authController from '../controllers/auth.controller';
import { CustomRequest } from '../types/CustomRequest';
import { validateSession } from '../middlewares/sessions';

const router = express.Router();

router.get('/', (_req: CustomRequest, res: Response) =>
  res.send(`Hello from MTOGO: Auth Service!`),
);

router.get('/validate', validateSession);

router.post('/login/customer', authController.handleCustomerLogin);
router.post('/login/restaurant', authController.handleRestaurantLogin);
router.post('/login/management', authController.handleManagementLogin);

router.post('/register/customer', authController.handleRegisterCustomer);
router.post('/register/restaurant', authController.handleRegisterRestaurant);

router.post('/logout', authController.handleLogout);

export default router;
