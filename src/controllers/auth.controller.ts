import { CustomRequest } from '../types/CustomRequest';
import { loginSchema } from '../validations/loginSchema';
import { Response } from 'express';
import { ZodError } from 'zod';
import { registerCustomerSchema } from '../validations/registerCustomerSchema';
import { validateRequiredFields } from '../utils/validateRequiredFields';
import {
  registerCustomer,
  registerRestaurant,
  customerLogin,
  restaurantLogin,
  managementLogin,
  logout,
} from '../services/auth.service';
import { registerRestaurantSchema } from '../validations/registerRestaurantSchema';
import { ValidationError } from '../errors/CustomeErrors';

async function handleRegisterCustomer(req: CustomRequest, res: Response) {
  try {
    const { firstName, lastName, phone, email, password } = req.body;

    const requiredFields = [
      'firstName',
      'lastName',
      'phone',
      'email',
      'password',
    ];
    const errors = validateRequiredFields(req.body, requiredFields);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    registerCustomerSchema.parse({
      firstName,
      lastName,
      phone,
      email,
      password,
    });

    const customer = await registerCustomer(
      firstName,
      lastName,
      phone,
      email,
      password,
    );

    return res.status(200).json({
      message: 'Customer registered successfully',
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        createdAt: customer.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({ errors: errorMessages });
    } else if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function handleRegisterRestaurant(req: CustomRequest, res: Response) {
  try {
    const { name, email, phone, password, address } = req.body;

    const requiredFields = ['name', 'email', 'phone', 'password', 'address'];
    const errors = validateRequiredFields(req.body, requiredFields);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    registerRestaurantSchema.parse({
      name,
      email,
      phone,
      password,
      address,
    });

    const restaurant = await registerRestaurant(
      name,
      email,
      phone,
      password,
      address,
    );

    return res.status(200).json({
      message: 'Restaurant registered successfully',
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        email: restaurant.email,
        phone: restaurant.phone,
        address: restaurant.address,
        createdAt: restaurant.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({ errors: errorMessages });
    } else if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function handleCustomerLogin(req: CustomRequest, res: Response) {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    loginSchema.parse({ email, password });

    const { sessionToken, sessionTokenExpiry } = await customerLogin(
      email,
      password,
      rememberMe,
    );

    // Return the token to the customer via a cookie
    res.cookie(`session`, sessionToken, {
      maxAge: sessionTokenExpiry * 1000,
      httpOnly: true,
    });

    return res.status(200).json({ message: 'Login successful!' });
  } catch (error) {
    // type guard to narrow the type of `error`
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({ errors: errorMessages });
    } else if (error instanceof Error) {
      // Handle general errors with a clear error message
      return res.status(401).json({ message: error.message });
    }

    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

async function handleRestaurantLogin(req: CustomRequest, res: Response) {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    loginSchema.parse({ email, password });

    const { sessionToken, sessionTokenExpiry } = await restaurantLogin(
      email,
      password,
      rememberMe,
    );

    // Return the token to the customer via a cookie
    res.cookie(`session`, sessionToken, {
      maxAge: sessionTokenExpiry * 1000,
      httpOnly: true,
    });

    return res.status(200).json({ message: 'Login successful!' });
  } catch (error) {
    // type guard to narrow the type of `error`
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({ errors: errorMessages });
    } else if (error instanceof Error) {
      // Handle general errors with a clear error message
      return res.status(401).json({ message: error.message });
    }

    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

async function handleManagementLogin(req: CustomRequest, res: Response) {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    loginSchema.parse({ email, password });

    const { sessionToken, sessionTokenExpiry } = await managementLogin(
      email,
      password,
      rememberMe,
    );

    // Return the token to the customer via a cookie
    res.cookie(`session`, sessionToken, {
      maxAge: sessionTokenExpiry * 1000,
      httpOnly: true,
    });

    return res.status(200).json({ message: 'Login successful!' });
  } catch (error) {
    // type guard to narrow the type of `error`
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({ errors: errorMessages });
    } else if (error instanceof Error) {
      // Handle general errors with a clear error message
      return res.status(401).json({ message: error.message });
    }

    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

// Helper function for sending error responses.
function sendErrorResponse(res: Response, status: number, message: string) {
  return res.status(status).json({ message });
}

// Helper function used to validate session tokens.
// async function validateSessionToken(sessionToken: string): Promise<string> {
//   const sessionKeyPattern = `*-SessionToken-${sessionToken}`;
//   const matchingKeys = await redisClient.keys(sessionKeyPattern);

//   if (matchingKeys.length === 0) {
//     throw new Error('Invalid or expired session token');
//   }

//   const sessionKey = matchingKeys[0];
//   return sessionKey.split('-')[0]; // Extract the user role
// }

async function handleLogout(req: CustomRequest, res: Response) {
  try {
    const sessionToken = req.cookies?.session;

    if (!sessionToken) {
      return sendErrorResponse(res, 400, 'Session token is missing');
    }

    // const userRole = await validateSessionToken(sessionToken);
    await logout(sessionToken);

    res.clearCookie('session');
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    const message =
      error instanceof Error ? error.message : 'Internal Server Error';
    res.status(500).json({ message });
  }
}

export default {
  handleCustomerLogin,
  handleRestaurantLogin,
  handleManagementLogin,
  handleLogout,
  handleRegisterCustomer,
  handleRegisterRestaurant,
};
