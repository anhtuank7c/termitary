import { t } from 'elysia';
import { usernameSchema } from './register.validation';

export const resetPasswordSchema = t.Object({
  username: usernameSchema,
  cfToken: t.String({ minLength: 10 }),
});

export type ResetPasswordParams = typeof resetPasswordSchema.static;
