import { t, type Static } from 'elysia';

// Elysia validation schema - single source of truth
export const createCommentSchema = t.Object({
  todoId: t.String({ minLength: 1 }),
  author: t.String({ minLength: 1 }),
  body: t.String({ minLength: 1 }),
});

// Infer TypeScript type from the schema
export type CreateCommentDto = Static<typeof createCommentSchema>;
