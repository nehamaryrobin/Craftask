import type { SupabaseClient } from '@supabase/supabase-js';

import type { CreateProjectInput, UpdateProjectInput } from './project-schema';

function toProjectInsert(input: CreateProjectInput, userId: string) {
  return {
    user_id: userId,
    name: input.name,
    description: input.description,
    color: input.color,
  };
}

function toProjectUpdate(input: UpdateProjectInput) {
  return {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.color !== undefined && { color: input.color }),
  };
}

export function listProjects(client: SupabaseClient, userId: string) {
  return client
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });
}

export function findProject(client: SupabaseClient, userId: string, id: string) {
  return client.from('projects').select('*').eq('user_id', userId).eq('id', id).maybeSingle();
}

export function createProject(
  client: SupabaseClient,
  userId: string,
  input: CreateProjectInput,
) {
  return client.from('projects').insert(toProjectInsert(input, userId)).select('*').single();
}

export function updateProject(
  client: SupabaseClient,
  userId: string,
  id: string,
  input: UpdateProjectInput,
) {
  return client
    .from('projects')
    .update(toProjectUpdate(input))
    .eq('user_id', userId)
    .eq('id', id)
    .select('*')
    .maybeSingle();
}

export function deleteProject(client: SupabaseClient, userId: string, id: string) {
  return client
    .from('projects')
    .delete()
    .eq('user_id', userId)
    .eq('id', id)
    .select('id')
    .maybeSingle();
}

