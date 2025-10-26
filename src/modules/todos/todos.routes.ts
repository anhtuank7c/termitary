import Elysia, { t } from 'elysia';
import * as todosService from './todos.service';
import * as paginationValidation from '../../shared/validations/pagination.validation';
import { createTodoSchema } from './dto/create-todo.dto';
import { updateTodoSchema } from './dto/update-todo.dto';

const todoRoutes = new Elysia({ name: 'todos', prefix: 'todos' })
  // get list of todos
  .get(
    '/',
    async ({ query: { limit, skip, sort } }) => {
      const todos = await todosService.findAll({ limit, skip, sort });
      return todos;
    },
    {
      query: paginationValidation.querySchema,
    },
  )
  // get todo by id
  .get(
    '/:id',
    async ({ params: { id } }) => {
      const todo = await todosService.findOneById(id);
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
      const newTodo = await todosService.create(body);
      return { success: true, data: newTodo };
    },
    {
      body: createTodoSchema,
    },
  )
  // update a todo
  .put(
    '/:id',
    async ({ params: { id }, body }) => {
      const updatedTodo = await todosService.update(id, body);
      return { success: true, data: updatedTodo };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: updateTodoSchema,
    },
  )
  // delete a todo
  .delete(
    '/:id',
    async ({ params: { id } }) => {
      return await todosService.remove(id);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  );

export type TodoRoutes = typeof todoRoutes;
export { todoRoutes };
