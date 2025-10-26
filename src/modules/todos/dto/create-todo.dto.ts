import { t, type Static } from 'elysia';

// Elysia validation schema - single source of truth
export const createTodoSchema = t.Object({
  title: t.String({ minLength: 1 }),
  description: t.Optional(t.String()),
  assignee: t.Optional(t.String()),
  priority: t.Optional(t.Union([t.Literal('low'), t.Literal('medium'), t.Literal('high')])),
  dueDate: t.Optional(t.String({ format: 'date-time' })),
});

// Infer TypeScript type from the schema
export type CreateTodoDto = Static<typeof createTodoSchema>;
