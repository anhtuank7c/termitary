import Elysia from 'elysia';

export const adminRoutes = new Elysia({ name: 'admin', prefix: 'admin' }).get('/', () => {
  return { message: 'Welcome to Admin Panel' };
});
