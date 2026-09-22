import { z } from 'zod';

const email = z.string().trim().email('Enter a valid email address');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters').max(80),
  email,
  password: z
    .string()
    .min(8, 'Use at least 8 characters')
    .max(72, 'Use at most 72 characters'),
});

export type AuthFormState = {
  errors?: Partial<Record<'name' | 'email' | 'password', string[]>>;
  message?: string;
  success?: boolean;
};

