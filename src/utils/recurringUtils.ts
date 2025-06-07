export function getNextRecurringDate(date: string, recurring: 'daily' | 'weekly' | 'monthly'): string {
  const currentDate = new Date(date);
  
  switch (recurring) {
    case 'daily':
      currentDate.setDate(currentDate.getDate() + 1);
      break;
    case 'weekly':
      currentDate.setDate(currentDate.getDate() + 7);
      break;
    case 'monthly':
      currentDate.setMonth(currentDate.getMonth() + 1);
      break;
  }
  
  return currentDate.toISOString().split('T')[0];
}

export function shouldCreateRecurringTask(task: any): boolean {
  if (task.recurring === 'none' || !task.completed) {
    return false;
  }
  
  const taskDate = new Date(task.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  taskDate.setHours(0, 0, 0, 0);
  
  // Only create next occurrence if the task date is today or in the past
  return taskDate <= today;
}