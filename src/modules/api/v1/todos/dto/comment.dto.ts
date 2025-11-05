import { t } from 'elysia';

export const commentDtoSchema = t.Object({
  id: t.String(),
  todoId: t.String(),
  author: t.String(),
  body: t.String(),
  createdAt: t.String(),
  updatedAt: t.String(),
});

export type CommentDto = typeof commentDtoSchema.static;
