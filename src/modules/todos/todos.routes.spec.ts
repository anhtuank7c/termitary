import { describe, expect, test } from 'bun:test';
import { treaty } from '@elysiajs/eden';
import { todoRoutes, type TodoRoutes } from './todos.routes';

const app = treaty<TodoRoutes>(todoRoutes);

describe('Todos', () => {
    describe('GET', () => {
        describe('findAll', () => {
            test('able to get list of todo tasks', async () => {
                const { data, error } = await app.todos.get();
                expect(data).toBeArray();
            });
            test('able to get list of todo tasks with limit, skip, sort', async () => {
                const { data, error } = await app.todos.get({
                    query: {
                        limit: 10,
                        skip: 0,
                        sort: 'createdAt|desc,priority|asc'
                    }
                });
                expect(data).toBeArray();
            });
        });

        describe('findOne', () => {
            test('able to get todo task by id', async () => {
                const { data, error, status } = await app.todos({ id: 'fake_' }).get()
                expect(status).toBe(500);
            });
        });

        // TODO: mock data, mock service/repository
    });
});
