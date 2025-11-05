import z from 'zod';

export const usernameSchema = z.string().regex(/^[a-zA-Z0-9_-]{3,16}$/);

export const registerSchema = z
  .object({
    email: z.email(),
    username: usernameSchema,
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((arg) => arg.password === arg.confirmPassword, {
    path: ['confirmPassword'],
    error: 'Password does not match',
  });

export type RegisterDto = z.output<typeof registerSchema>;
