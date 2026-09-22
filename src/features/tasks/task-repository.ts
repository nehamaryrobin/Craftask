import type { SupabaseClient } from '@supabase/supabase-js';

import type { CreateTaskInput, TaskQuery, UpdateTaskInput } from './task-schema';

function toTaskInsert(input: CreateTaskInput, userId: string) {
  return {
    user_id: userId,
    name: input.name,
    description: input.description,
    scheduled_date: input.scheduledDate,
    scheduled_time: input.scheduledTime,
    deadline: input.deadline,
    matrix_quadrant: input.matrixQuadrant,
    recurrence_rule: input.isRecurring === false ? null : input.recurrenceRule,
    is_completed: input.isCompleted,
    location: input.location,
    project_id: input.projectId,
    parent_task_id: input.parentTaskId,
  };
}

function toTaskUpdate(input: UpdateTaskInput) {
  return {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.scheduledDate !== undefined && { scheduled_date: input.scheduledDate }),
    ...(input.scheduledTime !== undefined && { scheduled_time: input.scheduledTime }),
    ...(input.deadline !== undefined && { deadline: input.deadline }),
    ...(input.matrixQuadrant !== undefined && { matrix_quadrant: input.matrixQuadrant }),
    ...((input.recurrenceRule !== undefined || input.isRecurring === false) && {
      recurrence_rule: input.isRecurring === false ? null : input.recurrenceRule,
    }),
    ...(input.isCompleted !== undefined && { is_completed: input.isCompleted }),
    ...(input.location !== undefined && { location: input.location }),
    ...(input.projectId !== undefined && { project_id: input.projectId }),
    ...(input.parentTaskId !== undefined && { parent_task_id: input.parentTaskId }),
  };
}

export function listTasks(client: SupabaseClient, userId: string, filters: TaskQuery = {}) {
  let query = client
    .from('tasks')
    .select('*')
    .eq('user_id', userId);

  if (filters.projectId === 'none') query = query.is('project_id', null);
  else if (filters.projectId) query = query.eq('project_id', filters.projectId);

  if (filters.scheduledDate) query = query.eq('scheduled_date', filters.scheduledDate);
  if (filters.isCompleted !== undefined) query = query.eq('is_completed', filters.isCompleted);
  if (filters.matrixQuadrant) query = query.eq('matrix_quadrant', filters.matrixQuadrant);

  return query
    .order('is_completed', { ascending: true })
    .order('scheduled_date', { ascending: true, nullsFirst: false })
    .order('scheduled_time', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });
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
