import Elysia, { t } from "elysia";
import { findAll, findOneById } from "./todos.repository";
import * as paginationValidation from '../../shared/validations/pagination.validation'

const todoRoutes = new Elysia({ name: 'todos', prefix: 'todos' })
    // get list of todos
    .get('/', async ({ query: { limit = 10, skip = 0, sort } }) => {
        const sortFields = sort
            ? sort.split(',').map(pair => {
                const [field, dir] = pair.split('|')
                return { field, direction: dir as 'asc' | 'desc' }
            })
            : [];
        const todos = await findAll({ limit, skip, sort: sortFields });
        return todos;
    }, {
        query: paginationValidation.query
    })
    // get todo by id
    .get('/:id', async ({ params: { id } }) => {
        const todo = await findOneById(id);
        return todo;
    }, {
        params: t.Object({
            id: t.String(),
        })
    });

export type TodoRoutes = typeof todoRoutes;
export { todoRoutes };
