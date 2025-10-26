import { t, type Static } from 'elysia';

// Elysia validation schema - single source of truth
export const updateCommentSchema = t.Object({
  author: t.Optional(t.String()),
  body: t.Optional(t.String({ minLength: 1 })),
});

// Infer TypeScript type from the schema
export type UpdateCommentDto = Static<typeof updateCommentSchema>;
