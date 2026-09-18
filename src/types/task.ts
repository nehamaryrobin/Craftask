export type Task = {
  id: string;
  title: string;
  project: string;
  priority: 'high' | 'medium' | 'low';
  time?: string;
  repeat?: string;
  completed: boolean;
  due: string;
  description?: string;
  reminder?: string;
  labels?: string[];
  deadline?: string;
  location?: string;
  attachments?: string[];
};
export type View = 'Inbox' | 'Today' | 'Upcoming' | 'Eisenhower Matrix' | 'Weekly Plan' | 'Monthly Plan' | 'Habits' | 'Calendar' | 'Reports' | 'Settings';
