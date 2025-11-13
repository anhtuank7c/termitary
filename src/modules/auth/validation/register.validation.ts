import { t } from 'elysia';

// Username pattern: only letters, numbers, underscores, and hyphens (3–16 chars)
export const usernameSchema = t.String({
  pattern: '^[a-zA-Z0-9_-]{3,16}$',
});

export const passwordSchema = t.String({ minLength: 8, maxLength: 200 });
export const emailSchema = t.String({
  // pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
  format: 'email',
});

// Register schema
export const registerSchema = t.Object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema,
});

export type RegisterParams = typeof registerSchema.static;
