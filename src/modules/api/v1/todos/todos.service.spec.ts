import { describe, expect, test, beforeEach, mock } from 'bun:test';
import * as todosService from './todos.service';
import type { TodoDto } from './dto/todo.dto';
import type { CreateTodoDto } from './dto/create-todo.dto';
import type { UpdateTodoDto } from './dto/update-todo.dto';

// Mock the repository
const mockFindAll = mock();
const mockFindOneById = mock();
const mockFindOverdueTasks = mock();

mock.module('./todos.repository', () => ({
  findAll: mockFindAll,
  findOneById: mockFindOneById,
  findOverdueTasks: mockFindOverdueTasks,
}));

describe('TodosService', () => {
  beforeEach(() => {
    mockFindAll.mockClear();
    mockFindOneById.mockClear();
    mockFindOverdueTasks.mockClear();
  });

  describe('findAll', () => {
    test('should return todos with default pagination', async () => {
      const mockTodos: TodoDto[] = [
        {
          id: '1',
          title: 'Test Todo',
          priority: 'high',
          description: 'Description',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      mockFindAll.mockResolvedValue(mockTodos);

      const result = await todosService.findAll();

      expect(result).toEqual(mockTodos);
      expect(mockFindAll).toHaveBeenCalledWith({
        limit: 10,
        skip: 0,
        sort: [],
      });
    });

    test('should parse sort string correctly', async () => {
      mockFindAll.mockResolvedValue([]);

      await todosService.findAll({
        limit: 20,
        skip: 5,
        sort: 'createdAt|desc,priority|asc',
      });

      expect(mockFindAll).toHaveBeenCalledWith({
        limit: 20,
        skip: 5,
        sort: [{ createdAt: 'desc' }, { priority: 'asc' }],
      });
    });

    test('should handle empty sort string', async () => {
      mockFindAll.mockResolvedValue([]);

      await todosService.findAll({ sort: '' });

      expect(mockFindAll).toHaveBeenCalledWith({
        limit: 10,
        skip: 0,
        sort: [],
      });
    });

    test('should throw error if limit is less than 1', async () => {
      expect(async () => {
        await todosService.findAll({ limit: 0 });
      }).toThrow('Limit must be between 1 and 100');
    });

    test('should throw error if limit is greater than 100', async () => {
      expect(async () => {
        await todosService.findAll({ limit: 101 });
      }).toThrow('Limit must be between 1 and 100');
    });

    test('should throw error if skip is negative', async () => {
      expect(async () => {
        await todosService.findAll({ skip: -1 });
      }).toThrow('Skip must be a non-negative number');
    });

    test('should accept valid limit and skip', async () => {
      mockFindAll.mockResolvedValue([]);

      await todosService.findAll({ limit: 50, skip: 10 });

      expect(mockFindAll).toHaveBeenCalledWith({
        limit: 50,
        skip: 10,
        sort: [],
      });
    });
  });

  describe('findOneById', () => {
    test('should return todo by id', async () => {
      const mockTodo: TodoDto = {
        id: '1',
        title: 'Test Todo',
        priority: 'medium',
        description: 'Description',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      mockFindOneById.mockResolvedValue(mockTodo);

      const result = await todosService.findOneById('1');

      expect(result).toEqual(mockTodo);
      expect(mockFindOneById).toHaveBeenCalledWith('1');
    });

    test('should throw error if id is empty', async () => {
      expect(async () => {
        await todosService.findOneById('');
      }).toThrow('Todo ID is required');
    });

    test('should throw error if id is only whitespace', async () => {
      expect(async () => {
        await todosService.findOneById('   ');
      }).toThrow('Todo ID is required');
    });
  });

  describe('create', () => {
    test('should create todo with valid input', async () => {
      const input: CreateTodoDto = {
        title: 'New Todo',
        description: 'Description',
        priority: 'high',
        dueDate: '2025-12-31T23:59:59.000Z',
      };

      const result = await todosService.create(input);

      expect(result.title).toBe('New Todo');
      expect(result.description).toBe('Description');
      expect(result.priority).toBe('high');
      expect(result.dueDate).toBe('2025-12-31T23:59:59.000Z');
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    test('should create todo with default priority if not provided', async () => {
      const input: CreateTodoDto = {
        title: 'New Todo',
      };

      const result = await todosService.create(input);

      expect(result.priority).toBe('medium');
    });

    test('should trim title and description', async () => {
      const input: CreateTodoDto = {
        title: '  New Todo  ',
        description: '  Description  ',
      };

      const result = await todosService.create(input);

      expect(result.title).toBe('New Todo');
      expect(result.description).toBe('Description');
    });

    test('should throw error if title is empty', async () => {
      const input: CreateTodoDto = {
        title: '',
      };

      expect(async () => {
        await todosService.create(input);
      }).toThrow('Title is required');
    });

    test('should throw error if title is only whitespace', async () => {
      const input: CreateTodoDto = {
        title: '   ',
      };

      expect(async () => {
        await todosService.create(input);
      }).toThrow('Title is required');
    });

    test('should throw error for invalid priority', async () => {
      const input: CreateTodoDto = {
        title: 'New Todo',
        priority: 'invalid' as any,
      };

      expect(async () => {
        await todosService.create(input);
      }).toThrow('Invalid priority');
    });

    test('should throw error for invalid due date', async () => {
      const input: CreateTodoDto = {
        title: 'New Todo',
        dueDate: 'invalid-date',
      };

      expect(async () => {
        await todosService.create(input);
      }).toThrow('Invalid due date format');
    });

    test('should set empty description if not provided', async () => {
      const input: CreateTodoDto = {
        title: 'New Todo',
      };

      const result = await todosService.create(input);

      expect(result.description).toBe('');
    });
  });

  describe('update', () => {
    test('should update todo with valid input', async () => {
      const existingTodo: TodoDto = {
        id: '1',
        title: 'Old Title',
        priority: 'low',
        description: 'Old Description',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      mockFindOneById.mockResolvedValue(existingTodo);

      const input: UpdateTodoDto = {
        title: 'New Title',
        priority: 'high',
      };

      const result = await todosService.update('1', input);

      expect(result.title).toBe('New Title');
      expect(result.priority).toBe('high');
      expect(result.description).toBe('Old Description');
      expect(result.updatedAt).not.toBe(existingTodo.updatedAt);
    });

    test('should throw error if id is empty', async () => {
      expect(async () => {
        await todosService.update('', { title: 'New Title' });
      }).toThrow('Todo ID is required');
    });

    test('should throw error for invalid priority', async () => {
      const existingTodo: TodoDto = {
        id: '1',
        title: 'Title',
        priority: 'low',
        description: '',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      mockFindOneById.mockResolvedValue(existingTodo);

      expect(async () => {
        await todosService.update('1', { priority: 'invalid' as any });
      }).toThrow('Invalid priority');
    });

    test('should throw error for invalid due date', async () => {
      const existingTodo: TodoDto = {
        id: '1',
        title: 'Title',
        priority: 'low',
        description: '',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      mockFindOneById.mockResolvedValue(existingTodo);

      expect(async () => {
        await todosService.update('1', { dueDate: 'invalid-date' });
      }).toThrow('Invalid due date format');
    });

    test('should trim title and description on update', async () => {
      const existingTodo: TodoDto = {
        id: '1',
        title: 'Old Title',
        priority: 'low',
        description: 'Old Description',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      mockFindOneById.mockResolvedValue(existingTodo);

      const result = await todosService.update('1', {
        title: '  New Title  ',
        description: '  New Description  ',
      });

      expect(result.title).toBe('New Title');
      expect(result.description).toBe('New Description');
    });

    test('should only update provided fields', async () => {
      const existingTodo: TodoDto = {
        id: '1',
        title: 'Old Title',
        priority: 'low',
        description: 'Old Description',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      mockFindOneById.mockResolvedValue(existingTodo);

      const result = await todosService.update('1', { priority: 'high' });

      expect(result.title).toBe('Old Title');
      expect(result.description).toBe('Old Description');
      expect(result.priority).toBe('high');
    });
  });

  describe('remove', () => {
    test('should delete todo by id', async () => {
      const existingTodo: TodoDto = {
        id: '1',
        title: 'Title',
        priority: 'low',
        description: '',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      mockFindOneById.mockResolvedValue(existingTodo);

      const result = await todosService.remove('1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Todo deleted successfully');
      expect(mockFindOneById).toHaveBeenCalledWith('1');
    });

    test('should throw error if id is empty', async () => {
      expect(async () => {
        await todosService.remove('');
      }).toThrow('Todo ID is required');
    });

    test('should throw error if id is only whitespace', async () => {
      expect(async () => {
        await todosService.remove('   ');
      }).toThrow('Todo ID is required');
    });
  });

  describe('findOverdueTasks', () => {
    test('should return overdue tasks', async () => {
      const mockTodos: TodoDto[] = [
        {
          id: '1',
          title: 'Overdue Todo',
          priority: 'high',
          description: 'Description',
          dueDate: '2025-01-01T00:00:00.000Z',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      mockFindOverdueTasks.mockResolvedValue(mockTodos);

      const result = await todosService.findOverdueTasks();

      expect(result).toEqual(mockTodos);
      expect(mockFindOverdueTasks).toHaveBeenCalled();
    });

    test('should return empty array if no overdue tasks', async () => {
      mockFindOverdueTasks.mockResolvedValue([]);

      const result = await todosService.findOverdueTasks();

      expect(result).toEqual([]);
    });
  });
});
