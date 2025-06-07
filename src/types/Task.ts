export interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  reminderMinutes: number;
  completed: boolean;
  createdAt: string;
  notified: boolean;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  originalDate?: string; // For tracking recurring task origins
}

export interface TaskFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  reminderMinutes: number;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
}