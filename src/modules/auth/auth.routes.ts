import Elysia, { t } from 'elysia';
import { loginUser } from './auth.service';

export const authRoutes = new Elysia({ name: 'auth', prefix: 'auth' }).post(
  'login',
  async ({ body }) => {
    const session = await loginUser(body.username, body.password);
    return { message: 'Welcome to Auth API', session };
  },
  {
    body: t.Object({
      username: t.String(),
      password: t.String(),
    }),
    description: 'User login endpoint',
    summary: 'Login',
  },
);
