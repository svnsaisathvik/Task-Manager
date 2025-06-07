import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, Filter } from 'lucide-react';
import { Task, TaskFormData } from './types/Task';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { SearchBar } from './components/SearchBar';
import { ThemeToggle } from './components/ThemeToggle';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { requestNotificationPermission, showNotification } from './utils/notificationUtils';
import { isUpcoming } from './utils/dateUtils';
import { getNextRecurringDate, shouldCreateRecurringTask } from './utils/recurringUtils';

type FilterType = 'all' | 'pending' | 'completed' | 'overdue';

function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const { theme } = useTheme();

  // Request notification permission on app load
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Check for reminders and handle recurring tasks every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      tasks.forEach(task => {
        if (!task.completed && !task.notified) {
          const taskDateTime = new Date(`${task.date}T${task.time}`);
          const reminderTime = new Date(taskDateTime.getTime() - task.reminderMinutes * 60000);
          
          if (now >= reminderTime && now < taskDateTime) {
            const endTimeText = task.endTime ? ` until ${task.endTime}` : '';
            showNotification(
              'Task Reminder',
              `${task.title} starts in ${task.reminderMinutes} minutes${endTimeText}`,
              '/vite.svg'
            );
            
            // Mark as notified
            setTasks(prev => 
              prev.map(t => 
                t.id === task.id ? { ...t, notified: true } : t
              )
            );
          }
        }
      });

      // Handle recurring tasks
      const completedRecurringTasks = tasks.filter(task => 
        task.completed && task.recurring !== 'none' && shouldCreateRecurringTask(task)
      );

      if (completedRecurringTasks.length > 0) {
        setTasks(prev => {
          const newTasks = [...prev];
          
          completedRecurringTasks.forEach(task => {
            const nextDate = getNextRecurringDate(task.date, task.recurring as 'daily' | 'weekly' | 'monthly');
            
            // Check if next occurrence already exists
            const existsAlready = newTasks.some(t => 
              t.title === task.title && 
              t.date === nextDate && 
              t.time === task.time &&
              t.recurring === task.recurring
            );
            
            if (!existsAlready) {
              const newTask: Task = {
                ...task,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                date: nextDate,
                completed: false,
                notified: false,
                createdAt: new Date().toISOString(),
                originalDate: task.originalDate || task.date,
              };
              
              newTasks.push(newTask);
            }
          });
          
          return newTasks;
        });
      }
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Check immediately

    return () => clearInterval(interval);
  }, [tasks, setTasks]);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleCreateTask = useCallback((taskData: TaskFormData) => {
    const newTask: Task = {
      id: generateId(),
      ...taskData,
      completed: false,
      createdAt: new Date().toISOString(),
      notified: false,
    };

    setTasks(prev => [newTask, ...prev]);
    setIsFormOpen(false);
  }, [setTasks]);

  const handleEditTask = useCallback((taskData: TaskFormData) => {
    if (!editingTask) return;

    setTasks(prev =>
      prev.map(task =>
        task.id === editingTask.id
          ? { ...task, ...taskData, notified: false }
          : task
      )
    );
    setEditingTask(null);
    setIsFormOpen(false);
  }, [editingTask, setTasks]);

  const handleToggleComplete = useCallback((id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, [setTasks]);

  const handleDeleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, [setTasks]);

  const handleEditClick = useCallback((task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingTask(null);
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filterButtons = [
    { key: 'all' as FilterType, label: 'All', count: filteredTasks.length },
    { key: 'pending' as FilterType, label: 'Pending', count: filteredTasks.filter(t => !t.completed).length },
    { key: 'completed' as FilterType, label: 'Completed', count: filteredTasks.filter(t => t.completed).length },
    { key: 'overdue' as FilterType, label: 'Overdue', count: filteredTasks.filter(t => !t.completed && new Date(`${t.date}T${t.time}`) < new Date()).length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Tasks
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Stay organized and on track
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4 mb-6">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-gray-500 shrink-0" />
            {filterButtons.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  filter === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <TaskList
          tasks={filteredTasks}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEditClick}
          onDelete={handleDeleteTask}
          filter={filter}
        />

        {/* Task Form Modal */}
        <TaskForm
          isOpen={isFormOpen}
          onSubmit={editingTask ? handleEditTask : handleCreateTask}
          onCancel={handleCloseForm}
          editingTask={editingTask}
        />
      </div>
    </div>
  );
}

export default App;