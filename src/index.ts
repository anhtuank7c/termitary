import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { todoRoutes } from './modules/todos/todos.routes';
import userRoutes from './modules/users/users.routes';

const apiV1 = new Elysia({ name: 'v1', prefix: 'api/v1' }).use(todoRoutes).use(userRoutes);

const app = new Elysia()
  .use(cors())
  .use(apiV1)
  .get('/', () => 'Hello Termitary')
  .listen(Number(Bun.env.PORT) || 3000);

console.log(`🚀 Termitary API is running at ${app.server?.hostname}:${app.server?.port}`);
