/**
 * Date utility functions for task deadline management
 */

/**
 * Check if a date is today
 * @param date - The date to check
 * @returns True if the date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Check if a date is tomorrow
 * @param date - The date to check
 * @returns True if the date is tomorrow
 */
export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate()
  );
}

/**
 * Check if a date is within this week
 * @param date - The date to check
 * @returns True if the date is within this week
 */
export function isThisWeek(date: Date): boolean {
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return date >= now && date <= oneWeekFromNow;
}

/**
 * Check if a date is overdue (in the past)
 * @param date - The date to check
 * @returns True if the date is in the past
 */
export function isOverdue(date: Date): boolean {
  const now = new Date();
  return date < now;
}

/**
 * Get the start of the current week (Sunday)
 * @returns Date representing the start of the current week
 */
export function getStartOfWeek(): Date {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}

/**
 * Get the end of the current week (Saturday)
 * @returns Date representing the end of the current week
 */
export function getEndOfWeek(): Date {
  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
}

/**
 * Get the start of today
 * @returns Date representing the start of today
 */
export function getStartOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Get the end of today
 * @returns Date representing the end of today
 */
export function getEndOfToday(): Date {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
}

/**
 * Calculate days until a deadline
 * @param deadline - The deadline date
 * @returns Number of days until the deadline (negative if overdue)
 */
export function getDaysUntilDeadline(deadline: Date): number {
  const now = new Date();
  const timeDiff = deadline.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

/**
 * Format a date for human-readable display
 * @param date - The date to format
 * @returns Human-readable date string
 */
export function formatDateForDisplay(date: Date): string {
  if (isToday(date)) {
    return 'Today';
  }

  if (isTomorrow(date)) {
    return 'Tomorrow';
  }

  const daysUntil = getDaysUntilDeadline(date);

  if (daysUntil < 0) {
    const daysOverdue = Math.abs(daysUntil);
    return `${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue`;
  }

  if (daysUntil <= 7) {
    return `In ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;
  }

  return date.toLocaleDateString();
}

/**
 * Check if a deadline is urgent (due within 24 hours)
 * @param deadline - The deadline date
 * @returns True if the deadline is urgent
 */
export function isUrgent(deadline: Date): boolean {
  const now = new Date();
  const timeDiff = deadline.getTime() - now.getTime();
  const hoursUntil = timeDiff / (1000 * 60 * 60);
  return hoursUntil <= 24 && hoursUntil >= 0;
}

/**
 * Get tasks due within a specific time period
 * @param tasks - Array of tasks with deadlines
 * @param periodDays - Number of days from now
 * @returns Filtered array of tasks due within the period
 */
export function getTasksDueWithin(tasks: any[], periodDays: number): any[] {
  const now = new Date();
  const endDate = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

  return tasks.filter(task => {
    if (!task.deadline || task.completed) {
      return false;
    }
    const deadline = new Date(task.deadline);
    return deadline >= now && deadline <= endDate;
  });
}

/**
 * Get overdue tasks
 * @param tasks - Array of tasks with deadlines
 * @returns Filtered array of overdue tasks
 */
export function getOverdueTasks(tasks: any[]): any[] {
  const now = new Date();

  return tasks.filter(task => {
    if (!task.deadline || task.completed) {
      return false;
    }
    const deadline = new Date(task.deadline);
    return deadline < now;
  });
}

/**
 * Sort tasks by deadline (earliest first, no deadline last)
 * @param tasks - Array of tasks to sort
 * @returns Sorted array of tasks
 */
export function sortTasksByDeadline(tasks: any[]): any[] {
  return [...tasks].sort((a, b) => {
    // Tasks without deadlines go to the end
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;

    const deadlineA = new Date(a.deadline);
    const deadlineB = new Date(b.deadline);

    return deadlineA.getTime() - deadlineB.getTime();
  });
}

/**
 * Group tasks by their deadline status
 * @param tasks - Array of tasks to group
 * @returns Object with grouped tasks
 */
export function groupTasksByDeadlineStatus(tasks: any[]) {
  const now = new Date();

  return {
    overdue: tasks.filter(task => {
      if (!task.deadline || task.completed) return false;
      return new Date(task.deadline) < now;
    }),
    today: tasks.filter(task => {
      if (!task.deadline || task.completed) return false;
      return isToday(new Date(task.deadline));
    }),
    tomorrow: tasks.filter(task => {
      if (!task.deadline || task.completed) return false;
      return isTomorrow(new Date(task.deadline));
    }),
    thisWeek: tasks.filter(task => {
      if (!task.deadline || task.completed) return false;
      const deadline = new Date(task.deadline);
      return isThisWeek(deadline) && !isToday(deadline) && !isTomorrow(deadline);
    }),
    later: tasks.filter(task => {
      if (!task.deadline || task.completed) return false;
      const deadline = new Date(task.deadline);
      return !isThisWeek(deadline);
    }),
    noDeadline: tasks.filter(task => !task.deadline && !task.completed)
  };
}
