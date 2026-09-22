import type { SupabaseClient } from '@supabase/supabase-js';

import type { CheckInQuery, CreateHabitInput, UpdateHabitInput } from './habit-schema';

function toHabitInsert(input: CreateHabitInput, userId: string) {
  return {
    user_id: userId,
    name: input.name,
    description: input.description,
    frequency: input.frequency,
    days_of_week: input.frequency === 'selected_days' ? input.daysOfWeek : null,
    start_date: input.startDate,
    is_active: input.isActive,
  };
}

function toHabitUpdate(input: UpdateHabitInput) {
  return {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.frequency !== undefined && { frequency: input.frequency }),
    ...(input.daysOfWeek !== undefined && { days_of_week: input.daysOfWeek }),
    ...(input.frequency !== undefined &&
      input.frequency !== 'selected_days' && { days_of_week: null }),
    ...(input.startDate !== undefined && { start_date: input.startDate }),
    ...(input.isActive !== undefined && { is_active: input.isActive }),
  };
}

export function listHabits(client: SupabaseClient, userId: string) {
  return client
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: true });
}

export function findHabit(client: SupabaseClient, userId: string, id: string) {
  return client.from('habits').select('*').eq('user_id', userId).eq('id', id).maybeSingle();
}

export function createHabit(
  client: SupabaseClient,
  userId: string,
  input: CreateHabitInput,
) {
  return client.from('habits').insert(toHabitInsert(input, userId)).select('*').single();
}

export function updateHabit(
  client: SupabaseClient,
  userId: string,
  id: string,
  input: UpdateHabitInput,
) {
  return client
    .from('habits')
    .update(toHabitUpdate(input))
    .eq('user_id', userId)
    .eq('id', id)
    .select('*')
    .maybeSingle();
}

export function deleteHabit(client: SupabaseClient, userId: string, id: string) {
  return client
    .from('habits')
    .delete()
    .eq('user_id', userId)
    .eq('id', id)
    .select('id')
    .maybeSingle();
}

export function listUserCheckIns(client: SupabaseClient, userId: string) {
  return client
    .from('habit_check_ins')
    .select('*')
    .eq('user_id', userId)
    .order('completed_on', { ascending: true });
}

export function listHabitCheckIns(
  client: SupabaseClient,
  userId: string,
  habitId: string,
  filters: CheckInQuery = {},
) {
  let query = client
    .from('habit_check_ins')
    .select('*')
    .eq('user_id', userId)
    .eq('habit_id', habitId);

  if (filters.from) query = query.gte('completed_on', filters.from);
  if (filters.to) query = query.lte('completed_on', filters.to);

  return query.order('completed_on', { ascending: true });
}

export function createHabitCheckIn(
  client: SupabaseClient,
  userId: string,
  habitId: string,
  completedOn: string,
) {
  return client
    .from('habit_check_ins')
    .insert({ user_id: userId, habit_id: habitId, completed_on: completedOn })
    .select('*')
    .single();
}

export function deleteHabitCheckIn(
  client: SupabaseClient,
  userId: string,
  habitId: string,
  completedOn: string,
) {
  return client
    .from('habit_check_ins')
    .delete()
    .eq('user_id', userId)
    .eq('habit_id', habitId)
    .eq('completed_on', completedOn)
    .select('id')
    .maybeSingle();
}

