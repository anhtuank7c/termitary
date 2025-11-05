import Elysia from 'elysia';
import * as authServices from './auth.service';
import { registerSchema } from './dto/register.dto';
import { loginSchema } from './dto/login.dto';

export const authRoutes = new Elysia({ name: 'auth', prefix: 'auth' })
  .post(
    'login',
    async ({ body }) => {
      const session = await authServices.login(body);
      return { message: 'Welcome to Auth API', session };
    },
    {
      body: loginSchema,
      detail: 'User login',
    },
  )
  .post(
    'register',
    async ({ body }) => {
      const { session, user } = await authServices.register(body);
      console.log('register successfully', session, user);
      return user;
    },
    {
      body: registerSchema,
      detail: 'Register a new account',
    },
  );
