import React from 'react';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Task } from '../types/Task';
import { TaskItem } from './TaskItem';
import { isOverdue, isUpcoming } from '../utils/dateUtils';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  filter: 'all' | 'pending' | 'completed' | 'overdue';
}

export function TaskList({ tasks, onToggleComplete, onEdit, onDelete, filter }: TaskListProps) {
  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending':
        return !task.completed;
      case 'completed':
        return task.completed;
      case 'overdue':
        return !task.completed && isOverdue(task.date, task.time);
      default:
        return true;
    }
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    const aDateTime = new Date(`${a.date}T${a.time}`);
    const bDateTime = new Date(`${b.date}T${b.time}`);
    return aDateTime.getTime() - bDateTime.getTime();
  });

  const pendingCount = tasks.filter(t => !t.completed).length;
  const overdueCount = tasks.filter(t => !t.completed && isOverdue(t.date, t.time)).length;
  const upcomingCount = tasks.filter(t => !t.completed && isUpcoming(t.date, t.time, t.reminderMinutes)).length;

  if (sortedTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          {filter === 'all' ? (
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          ) : filter === 'overdue' ? (
            <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
          ) : (
            <Clock className="w-16 h-16 mx-auto mb-4" />
          )}
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          {filter === 'all' 
            ? "No tasks yet. Create your first task to get started!"
            : filter === 'completed'
            ? "No completed tasks yet."
            : filter === 'overdue'
            ? "No overdue tasks. Great job staying on track!"
            : "No pending tasks. You're all caught up!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{pendingCount}</div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Pending</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{upcomingCount}</div>
          <div className="text-sm text-amber-600 dark:text-amber-400">Upcoming</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{overdueCount}</div>
          <div className="text-sm text-red-600 dark:text-red-400">Overdue</div>
        </div>
      </div>

      <div className="space-y-3">
        {sortedTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}