import { describe, expect, test, beforeEach, mock } from 'bun:test';
import { findAll } from './todos.repository';
import type { TodoEntity } from './entities/todo.entity';

// Mock the database adapter
const mockSql = mock();
mock.module('../../infrastructure/adapters/database.adapter', () => ({
  sql: mockSql,
}));

describe('TodosRepository', () => {
  describe('findAll', () => {
    beforeEach(() => {
      mockSql.mockClear();
    });

    test('should return an array of todos with correct mapping', async () => {
      const mockRows: TodoEntity[] = [
        {
          id: '1',
          title: 'Test Todo 1',
          priority: 'high',
          description: 'Test description 1',
          due_date: '2025-12-31T23:59:59.000Z',
          created_at: '2025-01-01T00:00:00.000Z',
          creator_id: 'user-1',
          updated_at: '2025-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          title: 'Test Todo 2',
          priority: 'medium',
          description: 'Test description 2',
          due_date: '2025-12-30T23:59:59.000Z',
          created_at: '2025-01-02T00:00:00.000Z',
          creator_id: 'user-2',
          updated_at: '2025-01-02T00:00:00.000Z',
        },
      ];

      mockSql.mockResolvedValue(mockRows);

      const result = await findAll({ limit: 10, skip: 0, sort: [] });

      expect(result).toBeArray();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '1',
        title: 'Test Todo 1',
        priority: 'high',
        description: 'Test description 1',
        dueDate: '2025-12-31T23:59:59.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        creatorId: 'user-1',
        updatedAt: '2025-01-01T00:00:00.000Z',
      });
    });

    test('should handle todos with null description', async () => {
      const mockRows: TodoEntity[] = [
        {
          id: '1',
          title: 'Test Todo',
          priority: 'low',
          due_date: '2025-12-31T23:59:59.000Z',
          created_at: '2025-01-01T00:00:00.000Z',
          creator_id: 'user-1',
          updated_at: '2025-01-01T00:00:00.000Z',
        },
      ];

      mockSql.mockResolvedValue(mockRows);

      const result = await findAll({ limit: 10, skip: 0, sort: [] });

      expect(result[0].description).toBe('');
    });

    test('should return empty array when no todos found', async () => {
      mockSql.mockResolvedValue([]);

      const result = await findAll({ limit: 10, skip: 0, sort: [] });

      expect(result).toBeArray();
      expect(result).toHaveLength(0);
    });

    test('should call sql with correct limit and offset', async () => {
      mockSql.mockResolvedValue([]);

      await findAll({ limit: 20, skip: 10, sort: [] });

      expect(mockSql).toHaveBeenCalledTimes(1);
      // Verify the SQL was called with limit and offset parameters
      const callArgs = mockSql.mock.calls[0];
      expect(callArgs[1]).toBe(20); // limit
      expect(callArgs[2]).toBe(10); // offset
    });

    test('should handle limit of 1', async () => {
      const mockRows: TodoEntity[] = [
        {
          id: '1',
          title: 'Single Todo',
          priority: 'high',
          description: 'Description',
          due_date: '2025-12-31T23:59:59.000Z',
          created_at: '2025-01-01T00:00:00.000Z',
          creator_id: 'user-1',
          updated_at: '2025-01-01T00:00:00.000Z',
        },
      ];

      mockSql.mockResolvedValue(mockRows);

      const result = await findAll({ limit: 1, skip: 0, sort: [] });

      expect(result).toHaveLength(1);
    });

    test('should handle skip offset', async () => {
      mockSql.mockResolvedValue([]);

      await findAll({ limit: 10, skip: 100, sort: [] });

      const callArgs = mockSql.mock.calls[0];
      expect(callArgs[2]).toBe(100); // offset
    });

    test('should handle todos with all priority levels', async () => {
      const mockRows: TodoEntity[] = [
        {
          id: '1',
          title: 'High Priority',
          priority: 'high',
          description: 'High',
          created_at: '2025-01-01T00:00:00.000Z',
          creator_id: 'user-1',
          updated_at: '2025-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          title: 'Medium Priority',
          priority: 'medium',
          description: 'Medium',
          created_at: '2025-01-02T00:00:00.000Z',
          creator_id: 'user-2',
          updated_at: '2025-01-02T00:00:00.000Z',
        },
        {
          id: '3',
          title: 'Low Priority',
          priority: 'low',
          description: 'Low',
          created_at: '2025-01-03T00:00:00.000Z',
          creator_id: 'user-1',
          updated_at: '2025-01-03T00:00:00.000Z',
        },
      ];

      mockSql.mockResolvedValue(mockRows);

      const result = await findAll({ limit: 10, skip: 0, sort: [] });

      expect(result[0].priority).toBe('high');
      expect(result[1].priority).toBe('medium');
      expect(result[2].priority).toBe('low');
    });

    test('should handle todos without due_date', async () => {
      const mockRows: TodoEntity[] = [
        {
          id: '1',
          title: 'No Due Date',
          priority: 'medium',
          description: 'Test',
          created_at: '2025-01-01T00:00:00.000Z',
          creator_id: 'user-1',
          updated_at: '2025-01-01T00:00:00.000Z',
        },
      ];

      mockSql.mockResolvedValue(mockRows);

      const result = await findAll({ limit: 10, skip: 0, sort: [] });

      expect(result[0].dueDate).toBeUndefined();
    });

    test('should accept sort parameter', async () => {
      mockSql.mockResolvedValue([]);

      await findAll({
        limit: 10,
        skip: 0,
        sort: [{ field: 'created_at', order: 'desc' }],
      });

      expect(mockSql).toHaveBeenCalledTimes(1);
    });
  });
});
