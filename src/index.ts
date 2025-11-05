import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { apiRoutes } from './modules/api/api.routes';
import { adminRoutes } from './modules/admin/admin.routes';

const app = new Elysia()
  .use(cors())
  .use(adminRoutes)
  .use(apiRoutes)
  .get('/', () => 'Hello Termitary')
  .listen(Number(Bun.env.PORT) || 3000);

console.log(`🚀 Termitary API is running at ${app.server?.hostname}:${app.server?.port}`);
