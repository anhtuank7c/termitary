import Elysia from 'elysia';
import userRoutes from './users/users.routes';
import { todoRoutes } from './todos/todos.routes';

export const v1Routes = new Elysia({ name: 'v1', prefix: 'v1' })
  .use(todoRoutes)
  .use(userRoutes)
  .get('/', () => {
    return { message: 'Welcome to API v1', routes: ['/todos', '/users'] };
  });
