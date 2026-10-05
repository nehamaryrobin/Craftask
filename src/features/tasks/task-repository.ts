import type { SupabaseClient } from '@supabase/supabase-js';

import type { CreateTaskInput, TaskQuery, UpdateTaskInput } from './task-schema';

function toTaskInsert(input: CreateTaskInput, userId: string) {
  return {
    user_id: userId,
    name: input.name,
    description: input.description,
    scheduled_date: input.dateToComplete ?? new Date().toISOString().slice(0, 10),
    scheduled_time: input.scheduledTime,
    deadline: input.dateDeadline,
    matrix_quadrant: input.matrixQuadrant,
    recurrence_rule: input.isRecurring === false ? null : input.recurrenceRule,
    is_completed: input.isCompleted,
    location: input.location,
    project_id: input.projectId,
    parent_task_id: input.parentTaskId,
    sort_order: input.sortOrder,
  };
}

function toTaskUpdate(input: UpdateTaskInput) {
  return {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.dateToComplete !== undefined && { scheduled_date: input.dateToComplete }),
    ...(input.scheduledTime !== undefined && { scheduled_time: input.scheduledTime }),
    ...(input.dateDeadline !== undefined && { deadline: input.dateDeadline }),
    ...(input.matrixQuadrant !== undefined && { matrix_quadrant: input.matrixQuadrant }),
    ...((input.recurrenceRule !== undefined || input.isRecurring === false) && {
      recurrence_rule: input.isRecurring === false ? null : input.recurrenceRule,
    }),
    ...(input.isCompleted !== undefined && { is_completed: input.isCompleted }),
    ...(input.location !== undefined && { location: input.location }),
    ...(input.projectId !== undefined && { project_id: input.projectId }),
    ...(input.parentTaskId !== undefined && { parent_task_id: input.parentTaskId }),
    ...(input.sortOrder !== undefined && { sort_order: input.sortOrder }),
  };
}

export function listTasks(client: SupabaseClient, userId: string, filters: TaskQuery = {}) {
  let query = client
    .from('tasks')
    .select('*')
    .eq('user_id', userId);

  if (filters.projectId === 'none') query = query.is('project_id', null);
  else if (filters.projectId) query = query.eq('project_id', filters.projectId);

  if (filters.dateToComplete) query = query.eq('scheduled_date', filters.dateToComplete);
  if (filters.isCompleted !== undefined) query = query.eq('is_completed', filters.isCompleted);
  if (filters.matrixQuadrant) query = query.eq('matrix_quadrant', filters.matrixQuadrant);

  return query
    .order('is_completed', { ascending: true })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
}

export function findTask(client: SupabaseClient, userId: string, id: string) {
  return client.from('tasks').select('*').eq('user_id', userId).eq('id', id).maybeSingle();
}

export function createTask(
  client: SupabaseClient,
  userId: string,
  input: CreateTaskInput,
) {
  return client.from('tasks').insert(toTaskInsert(input, userId)).select('*').single();
}

export function updateTask(
  client: SupabaseClient,
  userId: string,
  id: string,
  input: UpdateTaskInput,
) {
  return client
    .from('tasks')
    .update(toTaskUpdate(input))
    .eq('user_id', userId)
    .eq('id', id)
    .select('*')
    .maybeSingle();
}

export function deleteTask(client: SupabaseClient, userId: string, id: string) {
  return client
    .from('tasks')
    .delete()
    .eq('user_id', userId)
    .eq('id', id)
    .select('id')
    .maybeSingle();
}
