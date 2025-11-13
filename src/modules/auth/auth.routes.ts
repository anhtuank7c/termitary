import Elysia from 'elysia';
import * as authServices from './auth.service';
import { registerSchema } from './dto/register.dto';
import { loginSchema } from './dto/login.dto';

export const authRoutes = new Elysia({ name: 'auth', prefix: '/api/v1/auth' })
  .post(
    '/login',
    async ({ body, set }) => {
      const { session, user } = await authServices.login(body);
      set.status = 200;
      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
          },
          session: {
            id: session.id,
            userId: session.userId,
            createdAt: session.createdAt,
          },
        },
        message: 'Login successful',
      };
    },
    {
      body: loginSchema,
      detail: {
        summary: 'User login',
        description: 'Authenticate user with email and password',
        tags: ['Authentication'],
      },
    },
  )
  .post(
    '/register',
    async ({ body, set }) => {
      const { session, user } = await authServices.register(body);
      set.status = 201;
      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
          },
          session: {
            id: session.id,
            userId: session.userId,
            createdAt: session.createdAt,
          },
        },
        message: 'Registration successful',
      };
    },
    {
      body: registerSchema,
      detail: {
        summary: 'Register a new account',
        description: 'Create a new user account with email, username and password',
        tags: ['Authentication'],
      },
    },
  );
