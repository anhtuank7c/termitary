import { t } from 'elysia';
import { prioritySchema } from '../entities/todo.entity';

export const todoDtoSchema = t.Object({
  id: t.String(),
  title: t.String(),
  priority: prioritySchema,
  description: t.String(),
  dueDate: t.Nullable(t.String()),
  createdAt: t.String(),
  updatedAt: t.String(),
  completedAt: t.Nullable(t.String()),
  creatorId: t.String(),
  assigneeId: t.Nullable(t.String()),
});

export type TodoDto = typeof todoDtoSchema.static;
