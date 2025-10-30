export type Priority = 'low' | 'medium' | 'high';
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
