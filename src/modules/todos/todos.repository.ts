import { sql } from "../../infrastructure/adapters/database.adapter";

interface TodoRow {
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high';
    description?: string;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
}

interface TodoDto {
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high';
    description?: string;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
}

function mapObject(row: TodoRow) {
    return {
        id: row.id,
        title: row.title,
        priority: row.priority,
        description: row.description ?? '',
        dueDate: row.dueDate,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    } as TodoDto;
}

export async function findAll(params: { limit: number; skip: number, sort: Record<string, string>[] }): Promise<TodoDto[]> {
    const { limit, skip, sort = [] } = params;
    const rows = await sql`SELECT * FROM todos LIMIT ${limit} OFFSET ${skip}`;
    const todoList = rows.map((row: TodoRow) => mapObject(row));
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
    return rows.map((row: TodoRow) => mapObject(row));
}