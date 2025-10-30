import * as todosRepository from './todos.repository';
import type { TodoDto } from './dto/todo.dto';
import type { CreateTodoDto } from './dto/create-todo.dto';
import type { UpdateTodoDto } from './dto/update-todo.dto';
import {
  PaginationQueryDto,
  parseSortString,
} from '../../shared/validations/pagination.validation';

/**
 * Validate todo priority
 */
function validatePriority(priority?: string): 'low' | 'medium' | 'high' {
  const validPriorities = ['low', 'medium', 'high'];
  if (priority && !validPriorities.includes(priority)) {
    throw new Error(`Invalid priority: ${priority}. Must be one of: ${validPriorities.join(', ')}`);
  }
  return (priority as 'low' | 'medium' | 'high') || 'medium';
}

/**
 * Validate due date format (ISO 8601)
 */
function validateDueDate(dueDate?: string): void {
  if (dueDate) {
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid due date format. Must be a valid ISO 8601 date string');
    }
  }
}

/**
 * Find all todos with pagination and sorting
 */
export async function findAll(params: PaginationQueryDto = {}): Promise<TodoDto[]> {
  const { limit = 10, skip = 0, sort } = params;

  const sortFields = parseSortString(sort);
  console.log('Sort Fields:', sortFields);

  const todos = await todosRepository.findAll({ limit, skip, sort: sortFields });

  return todos;
}

/**
 * Find todo by ID
 */
export async function findOneById(id: string): Promise<TodoDto> {
  if (!id || id.trim() === '') {
    throw new Error('Todo ID is required');
  }

  const todo = await todosRepository.findOneById(id);
  return todo;
}

/**
 * Create a new todo
 */
export async function create(input: CreateTodoDto): Promise<TodoDto> {
  // Validate required fields
  if (!input.title || input.title.trim() === '') {
    throw new Error('Title is required');
  }

  // Validate priority if provided
  const priority = validatePriority(input.priority);

  // Validate due date if provided
  validateDueDate(input.dueDate);

  // Generate new todo with defaults
  const newTodo: TodoDto = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    description: input.description?.trim() || '',
    priority,
    dueDate: input.dueDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // In a real implementation, save to database using repository
  // For now, return the new todo object
  return newTodo;
}

/**
 * Update an existing todo
 */
export async function update(id: string, input: UpdateTodoDto): Promise<TodoDto> {
  if (!id || id.trim() === '') {
    throw new Error('Todo ID is required');
  }

  // Validate priority if provided
  if (input.priority) {
    validatePriority(input.priority);
  }

  // Validate due date if provided
  validateDueDate(input.dueDate);

  // Fetch existing todo
  const existingTodo = await todosRepository.findOneById(id);

  // Merge updates
  const updatedTodo: TodoDto = {
    ...existingTodo,
    ...(input.title !== undefined && { title: input.title.trim() }),
    ...(input.description !== undefined && { description: input.description.trim() }),
    ...(input.priority !== undefined && { priority: input.priority }),
    ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
    updatedAt: new Date().toISOString(),
  };

  // In a real implementation, save to database using repository
  return updatedTodo;
}

/**
 * Delete a todo by ID
 */
export async function remove(id: string): Promise<{ success: boolean; message: string }> {
  if (!id || id.trim() === '') {
    throw new Error('Todo ID is required');
  }

  // Verify todo exists before deletion
  await todosRepository.findOneById(id);

  // In a real implementation, delete from database using repository

  return {
    success: true,
    message: 'Todo deleted successfully',
  };
}

/**
 * Find overdue todos
 */
export async function findOverdueTasks(): Promise<TodoDto[]> {
  const todos = await todosRepository.findOverdueTasks();
  return todos;
}
