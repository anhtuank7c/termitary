import Elysia, { t } from 'elysia';
import * as paginationValidation from '../../shared/validations/pagination.validation';
import { client } from '../../infrastructure/adapters/redis.adapter';

const userRoutes = new Elysia({ name: 'users', prefix: 'users' })
  .get(
    '/',
    async () => {
      // Example of publishing a message to Redis when fetching all users
      await client.publish('users.created', JSON.stringify({ test: 'data' }));
      return { message: 'Get all users' };
    },
    { query: paginationValidation.query },
  )
  .get('/:id', ({ params }) => {
    return { message: `Get user with ID: ${params.id}` };
  })
  .post(
    '/',
    async ({ body }) => {
      // In a real implementation, save to database using repository
      const newUser = {
        id: crypto.randomUUID(),
        ...body,
        createdAt: new Date().toISOString(),
      };

      return { success: true, data: newUser };
    },
    {
      body: t.Object({
        email: t.String(),
        name: t.String(),
        password: t.String(),
        confirmPassword: t.String(),
      }),
    },
  )
  .put(
    '/:id',
    async ({ params, body }) => {
      // In a real implementation, update in database using repository
      return { success: true, message: `User ${params.id} updated`, updates: body };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        email: t.Optional(t.String()),
        name: t.Optional(t.String()),
        status: t.Optional(t.String()),
      }),
    },
  )
  .delete(
    '/:id',
    async ({ params }) => {
      // In a real implementation, delete from database using repository
      return { success: true, message: `User ${params.id} deleted` };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  );
export type UserRoutes = typeof userRoutes;
export default userRoutes;
