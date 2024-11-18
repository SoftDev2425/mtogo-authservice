import { passwordRegex } from '../utils/regex';
import { z } from 'zod';

const registerCustomerSchema = z.object({
  firstName: z.string().min(1, 'Please enter a valid first name'),
  lastName: z.string().min(1, 'Please enter a valid last name'),
  phone: z
    .string()
    .regex(
      /^(?:(?:00|\+)?45)?(?=2|3[01]|4[012]|4911|5[0-3]|6[01]|[78]1|9[123])\d{8}$/,
      'Please enter a valid phone number',
    ),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!, @, #, $, %, ^, &, *, -, +, =)',
    ),
});

export { registerCustomerSchema };
