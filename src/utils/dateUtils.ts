export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}

export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

export function isOverdue(date: string, time: string): boolean {
  const taskDateTime = new Date(`${date}T${time}`);
  return taskDateTime < new Date();
}

export function isUpcoming(date: string, time: string, minutes: number): boolean {
  const taskDateTime = new Date(`${date}T${time}`);
  const now = new Date();
  const reminderTime = new Date(taskDateTime.getTime() - minutes * 60000);
  
  return now >= reminderTime && now < taskDateTime;
}