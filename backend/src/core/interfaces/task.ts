export interface Task {
  id: number;
  title: string;
  description?: string;
  skills?: string[];
  status: 'new' | 'in_progress' | 'completed';
  group_id?: number;
  dt_start?: Date;
  dt_end?: Date;
  priority: 'low' | 'medium' | 'high';
  created_at: Date;
  updated_at: Date;
}