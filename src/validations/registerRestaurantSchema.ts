import { passwordRegex } from '../utils/regex';
import { z } from 'zod';

const registerRestaurantSchema = z.object({
  name: z.string().min(1, 'Invalid restaurant name'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!, @, #, $, %, ^, &, *, -, +, =)',
    ),
  address: z.object({
    street: z.string().min(1, 'Please enter a valid street address'),
    city: z.string().min(1, 'Please enter a valid city'),
    zip: z
      .string()
      .min(4, 'Please enter a valid danish zip code')
      .max(4, 'Please enter a valid danish zip code'),
  }),
});

export { registerRestaurantSchema };
