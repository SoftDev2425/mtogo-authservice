import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please provide a valid email address.' }),
  password: z.string(),
});

export { loginSchema };
