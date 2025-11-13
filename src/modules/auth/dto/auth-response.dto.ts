import z from 'zod';
import { successResponseSchema } from '../../../common/schemas/response.schema';

// User response schema (without sensitive data)
export const userResponseSchema = z.object({
  id: z.string(),
  email: z.email(),
  username: z.string(),
});

// Session response schema (without secret hash)
export const sessionResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.date(),
});

// Auth data response (for both login and register)
export const authDataResponseSchema = z.object({
  user: userResponseSchema,
  session: sessionResponseSchema,
});

// Login response
export const loginResponseSchema = successResponseSchema(authDataResponseSchema);

// Register response
export const registerResponseSchema = successResponseSchema(authDataResponseSchema);

// Types
export type UserResponse = z.infer<typeof userResponseSchema>;
export type SessionResponse = z.infer<typeof sessionResponseSchema>;
export type AuthDataResponse = z.infer<typeof authDataResponseSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
