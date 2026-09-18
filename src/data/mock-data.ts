import type { Task } from '@/types/task';
export const initialTasks: Task[] = [
  { id: '1', title: 'Finish the Craftask dashboard wireframes', project: 'Craftask', priority: 'high', time: '10:00 AM', completed: false, due: 'today' },
  { id: '2', title: 'Study for the mathematics test', project: 'Personal growth', priority: 'high', time: '11:30 AM', completed: false, due: 'today' },
  { id: '3', title: 'Read 20 pages of Atomic Habits', project: 'Personal growth', priority: 'medium', completed: false, due: 'today' },
  { id: '4', title: 'Go for an evening walk', project: 'Wellbeing', priority: 'low', time: '5:30 PM', completed: false, due: 'today' },
  { id: '5', title: 'Plan meals for the rest of the week', project: 'Personal', priority: 'medium', completed: false, due: 'today' },
  { id: '6', title: 'Review this week’s priorities', project: 'Personal', priority: 'low', completed: true, due: 'today' },
  { id: '7', title: 'Morning journaling & a little reflection', project: 'Wellbeing', priority: 'low', completed: true, due: 'today' },
  { id: '8', title: 'Submit the design assignment', project: 'Academics', priority: 'high', completed: false, due: 'tomorrow' },
  { id: '9', title: 'Craftask project presentation', project: 'Craftask', priority: 'medium', completed: false, due: 'in 3 days' },
];
export const initialHabits = [
  { id: 'read', name: 'Read a little', detail: '20 minutes a day', streak: 12, done: false, icon: 'book' },
  { id: 'move', name: 'Move your body', detail: '30 minutes a day', streak: 8, done: false, icon: 'move' },
  { id: 'journal', name: 'Daily journaling', detail: 'Make space for your thoughts', streak: 5, done: true, icon: 'journal' },
];
export const weekProgress = [ { day: 'M', value: 6 }, { day: 'T', value: 8 }, { day: 'W', value: 5 }, { day: 'T', value: 2 }, { day: 'F', value: 0 }, { day: 'S', value: 0 }, { day: 'S', value: 0 } ];
