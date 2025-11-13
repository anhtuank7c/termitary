import { t } from 'elysia';
import { emailSchema, passwordSchema } from './register.validation';

export const loginSchema = t.Object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginParams = typeof loginSchema.static;
