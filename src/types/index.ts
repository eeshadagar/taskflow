export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  category: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}