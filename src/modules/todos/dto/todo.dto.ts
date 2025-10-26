export interface TodoDto {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  description?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  creatorId: string;
  assigneeId?: string;
}
