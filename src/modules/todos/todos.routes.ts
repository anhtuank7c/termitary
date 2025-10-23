import Elysia, { t } from 'elysia';
import { findAll, findOneById } from './todos.repository';
import * as paginationValidation from '../../shared/validations/pagination.validation';

const todoRoutes = new Elysia({ name: 'todos', prefix: 'todos' })
  // get list of todos
  .get(
    '/',
    async ({ query: { limit = 10, skip = 0, sort } }) => {
      const sortFields = sort
        ? sort.split(',').map((pair) => {
            const [field, dir] = pair.split('|');
            return { field, direction: dir as 'asc' | 'desc' };
          })
        : [];
      const todos = await findAll({ limit, skip, sort: sortFields });
      return todos;
    },
    {
      query: paginationValidation.query,
    },
  )
  // get todo by id
  .get(
    '/:id',
    async ({ params: { id } }) => {
      const todo = await findOneById(id);
      return todo;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  // create a new todo
  .post(
    '/',
    async ({ body }) => {
      // In a real implementation, save to database using repository
      const newTodo = {
        id: crypto.randomUUID(),
        ...body,
        createdAt: new Date().toISOString(),
      };
      return { success: true, data: newTodo };
    },
    {
      body: t.Object({
        title: t.String(),
        description: t.Optional(t.String()),
        assignee: t.Optional(t.String()),
        priority: t.Optional(t.String()),
        dueDate: t.Optional(t.String()),
      }),
    },
  )
  // update a todo
  .put(
    '/:id',
    async ({ params: { id }, body }) => {
      // In a real implementation, update in database using repository
      const existingTodo = await findOneById(id);

      const updatedTodo = {
        ...existingTodo,
        ...body,
        updatedAt: new Date().toISOString(),
      };

      return { success: true, data: updatedTodo };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
        status: t.Optional(t.String()),
        assignee: t.Optional(t.String()),
        priority: t.Optional(t.String()),
        dueDate: t.Optional(t.String()),
      }),
    },
  )
  // delete a todo
  .delete(
    '/:id',
    async ({ params: { id } }) => {
      // In a real implementation, delete from database using repository
      await findOneById(id);
      return { success: true, message: 'Todo deleted successfully' };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  );

export type TodoRoutes = typeof todoRoutes;
export { todoRoutes };
