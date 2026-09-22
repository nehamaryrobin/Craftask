import { ZodError } from 'zod';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export function jsonError(status: number, code: string, message: string, details?: unknown) {
  return Response.json({ error: { code, message, ...(details ? { details } : {}) } }, { status });
}

export async function authenticatedClient() {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.auth.getUser();

  if (error || !data.user) {
    return { response: jsonError(401, 'UNAUTHORIZED', 'Authentication required') } as const;
  }

  return { client, user: data.user } as const;
}

export async function parseJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new SyntaxError('Request body must be valid JSON');
  }
}

export function requestError(error: unknown) {
  if (error instanceof SyntaxError) {
    return jsonError(400, 'INVALID_JSON', error.message);
  }

  if (error instanceof ZodError) {
    return jsonError(422, 'VALIDATION_ERROR', 'Request validation failed', error.flatten());
  }

  console.error('Unexpected API error', error);
  return jsonError(500, 'INTERNAL_ERROR', 'An unexpected error occurred');
}

export function databaseError(
  error: { code?: string; message: string },
  resource: 'task' | 'project' | 'habit' | 'habit check-in' = 'task',
) {
  if (error.code === '23503') {
    return jsonError(422, 'INVALID_RELATION', 'A related resource does not exist');
  }

  if (error.code === '23514') {
    return jsonError(422, 'CONSTRAINT_VIOLATION', `The ${resource} violates a data constraint`);
  }

  if (error.code === '23505') {
    return jsonError(409, 'ALREADY_EXISTS', `The ${resource} already exists`);
  }

  console.error(`${resource} database error`, error);
  return jsonError(500, 'DATABASE_ERROR', `The ${resource} could not be saved`);
}
