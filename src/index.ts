import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { fromTypes, openapi } from '@elysiajs/openapi';
import { bearer } from '@elysiajs/bearer';
import { authRoutes } from './modules/auth/auth.routes';
import z from 'zod';

const app = new Elysia()
  .use(
    openapi({
      references: fromTypes(),
      mapJsonSchema: {
        zod: z.toJSONSchema,
      },
    }),
  )
  .use(bearer())
  .use(cors())
  .use(authRoutes)
  .get('/', () => 'Hello Termitary')
  .listen(Number(Bun.env.PORT) || 3000);

console.log(`🚀 Termitary API is running at ${app.server?.hostname}:${app.server?.port}`);
