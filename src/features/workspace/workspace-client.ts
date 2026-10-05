import { addDays, dateKey, fromDateKey } from '@/lib/dates';
import type { Habit, MatrixQuadrant, Project, Task, TaskCreateInput } from '@/types/task';

type ApiTask = {
  id: string;
  name: string;
  description: string | null;
  dateToComplete: string | null;
  scheduledTime: string | null;
  dateDeadline: string | null;
  matrixQuadrant:
    | 'urgent_important'
    | 'important_not_urgent'
    | 'urgent_not_important'
    | 'not_urgent_not_important'
    | null;
  isRecurring: boolean;
  recurrenceRule: string | null;
  isCompleted: boolean;
  dateCompleted: string | null;
  dateCreated: string;
  location: string | null;
  projectId: string | null;
  sortOrder: number;
};

type ApiProject = Project;

type ApiHabit = {
  id: string;
  name: string;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'selected_days';
  currentStreak: number;
  completedToday: boolean;
  isScheduledToday: boolean;
};

type ApiResponse<T> = { data: T };

const apiMatrix: Record<MatrixQuadrant, NonNullable<ApiTask['matrixQuadrant']>> = {
  'do-first': 'urgent_important',
  schedule: 'important_not_urgent',
  delegate: 'urgent_not_important',
  'let-go': 'not_urgent_not_important',
};

const displayMatrix: Record<NonNullable<ApiTask['matrixQuadrant']>, MatrixQuadrant> = {
  urgent_important: 'do-first',
  important_not_urgent: 'schedule',
  urgent_not_important: 'delegate',
  not_urgent_not_important: 'let-go',
};

function priorityFromMatrix(matrix: ApiTask['matrixQuadrant']): Task['priority'] {
  if (matrix === 'urgent_important') return 'high';
  if (matrix === 'not_urgent_not_important' || !matrix) return 'low';
  return 'medium';
}

function dateDisplay(value: string | null) {
  if (!value) return 'inbox';
  const today = dateKey(new Date());
  if (value === today) return 'today';
  if (value === dateKey(addDays(new Date(), 1))) return 'tomorrow';
  return fromDateKey(value).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

function toTask(task: ApiTask, projects: ApiProject[]): Task {
  return {
    id: task.id,
    title: task.name,
    projectId: task.projectId,
    project: projects.find((project) => project.id === task.projectId)?.name ?? 'Inbox',
    priority: priorityFromMatrix(task.matrixQuadrant),
    time: task.scheduledTime ?? undefined,
    repeat: task.recurrenceRule ?? undefined,
    completed: task.isCompleted,
    completedAt: task.dateCompleted,
    due: dateDisplay(task.dateToComplete),
    scheduledDate: task.dateToComplete,
    description: task.description ?? undefined,
    deadline: task.dateDeadline ?? undefined,
    location: task.location ?? undefined,
    matrixQuadrant: task.matrixQuadrant ? displayMatrix[task.matrixQuadrant] : null,
    dateCreated: task.dateCreated,
    sortOrder: task.sortOrder,
  };
}

function toHabit(habit: ApiHabit, index: number): Habit {
  const icons: Habit['icon'][] = ['book', 'move', 'journal'];
  return {
    id: habit.id,
    name: habit.name,
    detail: habit.description ?? habit.frequency.replace('_', ' '),
    streak: habit.currentStreak,
    done: habit.completedToday,
    isScheduledToday: habit.isScheduledToday,
    icon: icons[index % icons.length],
  };
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error?.message ?? 'Something went wrong. Please try again.');
  }

  return body as T;
}

export async function loadWorkspace() {
  const today = dateKey(new Date());
  const [taskResponse, projectResponse, habitResponse] = await Promise.all([
    request<ApiResponse<ApiTask[]>>('/api/tasks'),
    request<ApiResponse<ApiProject[]>>('/api/projects'),
    request<ApiResponse<ApiHabit[]>>(`/api/habits?onDate=${today}`),
  ]);

  return {
    projects: projectResponse.data,
    tasks: taskResponse.data.map((task) => toTask(task, projectResponse.data)),
    habits: habitResponse.data.map(toHabit),
  };
}

export async function createWorkspaceTask(input: TaskCreateInput, projects: Project[]) {
  const response = await request<ApiResponse<ApiTask>>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      description: input.description ?? null,
      dateToComplete: input.scheduledDate ?? dateKey(new Date()),
      scheduledTime: input.scheduledTime ?? null,
      dateDeadline: input.deadline ?? null,
      matrixQuadrant: input.matrixQuadrant ? apiMatrix[input.matrixQuadrant] : null,
      isRecurring: Boolean(input.recurrenceRule),
      recurrenceRule: input.recurrenceRule ?? null,
      location: input.location ?? null,
      projectId: input.projectId ?? null,
    }),
  });

  return toTask(response.data, projects);
}

export async function updateWorkspaceTask(
  id: string,
  input: { isCompleted?: boolean; matrixQuadrant?: MatrixQuadrant | null; name?: string; sortOrder?: number },
  projects: Project[],
) {
  const response = await request<ApiResponse<ApiTask>>(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      ...(input.isCompleted !== undefined && { isCompleted: input.isCompleted }),
      ...(input.matrixQuadrant !== undefined && {
        matrixQuadrant: input.matrixQuadrant ? apiMatrix[input.matrixQuadrant] : null,
      }),
      ...(input.name !== undefined && { name: input.name }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
    }),
  });

  return toTask(response.data, projects);
}

export async function deleteWorkspaceTask(id: string) {
  await request(`/api/tasks/${id}`, { method: 'DELETE' });
}

export async function reorderWorkspaceTasks(ids: string[]) {
  await Promise.all(ids.map((id, index) => request(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ sortOrder: index }),
  })));
}

export async function toggleWorkspaceHabit(habit: Habit) {
  const completedOn = dateKey(new Date());
  const url = `/api/habits/${habit.id}/check-ins${habit.done ? `/${completedOn}` : ''}`;
  await request(url, habit.done ? { method: 'DELETE' } : {
    method: 'POST',
    body: JSON.stringify({ completedOn }),
  });
}
