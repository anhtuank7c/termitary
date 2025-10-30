import { Priority } from '../entity/todo.entity';

export interface TodoDto {
  id: string;
  title: string;
  priority: Priority;
  description?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  creatorId: string;
  assigneeId?: string;
}
