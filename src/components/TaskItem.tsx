import React from 'react';
import { CheckCircle2, Circle, Clock, Edit3, Trash2, AlertCircle, Repeat } from 'lucide-react';
import { Task } from '../types/Task';
import { formatDate, formatTime, isOverdue, isUpcoming } from '../utils/dateUtils';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  const overdue = !task.completed && isOverdue(task.date, task.time);
  const upcoming = !task.completed && isUpcoming(task.date, task.time, task.reminderMinutes);

  const getRecurringLabel = (recurring: string) => {
    switch (recurring) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return null;
    }
  };

  const formatTimeRange = () => {
    const startTime = formatTime(task.time);
    if (task.endTime) {
      const endTime = formatTime(task.endTime);
      return `${startTime} - ${endTime}`;
    }
    return startTime;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 transition-all duration-200 hover:shadow-md ${
      task.completed 
        ? 'border-l-green-500 opacity-75' 
        : overdue 
        ? 'border-l-red-500' 
        : upcoming 
        ? 'border-l-amber-500' 
        : 'border-l-blue-500'
    }`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`mt-0.5 transition-colors duration-200 ${
            task.completed 
              ? 'text-green-600 hover:text-green-700' 
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className={`font-medium ${
                task.completed 
                  ? 'text-gray-500 dark:text-gray-400 line-through' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {task.title}
              </h3>
              {task.recurring !== 'none' && (
                <div className="flex items-center gap-1">
                  <Repeat className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                    {getRecurringLabel(task.recurring)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
              {overdue && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              {upcoming && (
                <Clock className="w-4 h-4 text-amber-500" />
              )}
              <button
                onClick={() => onEdit(task)}
                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className={`text-sm mt-1 ${
              task.completed 
                ? 'text-gray-400 dark:text-gray-500' 
                : 'text-gray-600 dark:text-gray-300'
            }`}>
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-4 mt-2 text-xs">
            <span className={`flex items-center gap-1 ${
              overdue 
                ? 'text-red-600 dark:text-red-400' 
                : upcoming 
                ? 'text-amber-600 dark:text-amber-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              <Clock className="w-3 h-3" />
              {formatDate(task.date)} at {formatTimeRange()}
            </span>
            
            <span className="text-gray-400 dark:text-gray-500">
              Remind {task.reminderMinutes}m before
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}