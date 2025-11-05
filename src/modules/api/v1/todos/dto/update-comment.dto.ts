import { t } from 'elysia';

// Elysia validation schema - single source of truth
export const updateCommentSchema = t.Object({
  author: t.Optional(t.String()),
  body: t.Optional(t.String({ minLength: 1 })),
});

// Infer TypeScript type from the schema
export type UpdateCommentDto = typeof updateCommentSchema.static;
