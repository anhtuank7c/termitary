import { t, type Static } from 'elysia';

// Elysia validation schema - single source of truth
export const updateTodoSchema = t.Object({
  title: t.Optional(t.String({ minLength: 1 })),
  description: t.Optional(t.String()),
  priority: t.Optional(t.Union([t.Literal('low'), t.Literal('medium'), t.Literal('high')])),
  dueDate: t.Optional(t.String({ format: 'date-time' })),
  completedAt: t.Optional(t.String({ format: 'date-time' })),
  assigneeId: t.Optional(t.String()),
});

// Infer TypeScript type from the schema
export type UpdateTodoDto = Static<typeof updateTodoSchema>;
