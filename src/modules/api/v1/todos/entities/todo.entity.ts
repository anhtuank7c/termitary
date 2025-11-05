import { t } from 'elysia';

export const prioritySchema = t.Union([t.Literal('low'), t.Literal('medium'), t.Literal('high')]);

export type Priority = typeof prioritySchema.static;

export interface TodoEntity {
  id: string;
  title: string;
  priority: Priority;
  description?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  creator_id: string;
  assignee_id?: string;
}
