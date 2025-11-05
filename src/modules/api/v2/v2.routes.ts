import Elysia from 'elysia';

export const v2Routes = new Elysia({ name: 'v2', prefix: 'v2' }).get('/', () => {
  return { message: 'Welcome to API v2', routes: [] };
});
