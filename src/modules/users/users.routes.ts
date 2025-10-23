import Elysia from 'elysia';
import * as paginationValidation from '../../shared/validations/pagination.validation';

const userRoutes = new Elysia({ name: 'users', prefix: 'users' })
  .get(
    '/',
    () => {
      return { message: 'Get all users' };
    },
    { query: paginationValidation.query },
  )
  .get('/:id', ({ params }) => {
    return { message: `Get user with ID: ${params.id}` };
  })
  .post('/', ({ body }) => {
    return { message: 'Create a new user', user: body };
  })
  .put('/:id', ({ params, body }) => {
    return { message: `Update user with ID: ${params.id}`, updates: body };
  })
  .delete('/:id', ({ params }) => {
    return { message: `Delete user with ID: ${params.id}` };
  });
export type UserRoutes = typeof userRoutes;
export default userRoutes;
