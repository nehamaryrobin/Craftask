export type MatrixQuadrant = 'do-first' | 'schedule' | 'delegate' | 'let-go';

export type Task = {
  id: string;
  title: string;
  project: string;
  projectId: string | null;
  priority: 'high' | 'medium' | 'low';
  time?: string;
  repeat?: string;
  completed: boolean;
  due: string;
  scheduledDate: string | null;
  description?: string;
  reminder?: string;
  labels?: string[];
  deadline?: string;
  location?: string;
  attachments?: string[];
  matrixQuadrant?: MatrixQuadrant | null;
  completedAt?: string | null;
  dateCreated: string;
  sortOrder: number;
};

export type Project = { id: string; name: string; description: string | null; color: string | null };

export type Habit = {
  id: string;
  name: string;
  detail: string;
  streak: number;
  done: boolean;
  isScheduledToday: boolean;
  icon: 'book' | 'move' | 'journal';
};

export type TaskCreateInput = {
  name: string;
  description?: string | null;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  deadline?: string | null;
  matrixQuadrant?: MatrixQuadrant | null;
  recurrenceRule?: string | null;
  location?: string | null;
  projectId?: string | null;
};
export type View = 'Inbox' | 'Today' | 'Upcoming' | 'Eisenhower Matrix' | 'Weekly Plan' | 'Monthly Plan' | 'Habits' | 'Calendar' | 'Reports' | 'Settings';
