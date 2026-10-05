import type { Task } from '@/types/task';
export const initialTasks: Task[] = [];
export const initialHabits = [
  { id: 'read', name: 'Read a little', detail: '20 minutes a day', streak: 12, done: false, icon: 'book' },
  { id: 'move', name: 'Move your body', detail: '30 minutes a day', streak: 8, done: false, icon: 'move' },
  { id: 'journal', name: 'Daily journaling', detail: 'Make space for your thoughts', streak: 5, done: true, icon: 'journal' },
];
export const weekProgress = [ { day: 'M', value: 6 }, { day: 'T', value: 8 }, { day: 'W', value: 5 }, { day: 'T', value: 2 }, { day: 'F', value: 0 }, { day: 'S', value: 0 }, { day: 'S', value: 0 } ];
