import { sql } from '../../infrastructure/adapters/database.adapter';
import { SortDirection } from '../../shared/validations/pagination.validation';
import { TodoDto } from './dto/todo.dto';
import { TodoEntity } from './entity/todo.entity';

function mapObject(row: TodoEntity) {
  return {
    id: row.id,
    title: row.title,
    priority: row.priority,
    description: row.description ?? '',
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as TodoDto;
}

export async function findAll(params: {
  limit: number;
  skip: number;
  sort: Record<string, SortDirection>[];
}): Promise<TodoDto[]> {
  const { limit, skip, sort = [] } = params;
  const rows = await sql`SELECT * FROM todos LIMIT ${limit} OFFSET ${skip}`;
  const todoList = rows.map((row: TodoEntity) => mapObject(row));
  console.log('Retrieved Todos:', todoList);
  return todoList;
}

export async function findOneById(id: string) {
  const rows = await sql`SELECT * FROM todos WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) {
    throw new Error('Record not found');
  }
  return mapObject(rows[0]);
}

export async function findOverdueTasks(): Promise<TodoDto[]> {
  const now = new Date().toISOString();
  const rows = await sql`
        SELECT * FROM todos
        WHERE dueDate IS NOT NULL
        AND dueDate < ${now}
        ORDER BY priority DESC, dueDate ASC
    `;
  return rows.map((row: TodoEntity) => mapObject(row));
}
