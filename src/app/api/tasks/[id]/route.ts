import { deleteTask, findTask, updateTask } from '@/features/tasks/task-repository';
import { taskIdSchema, updateTaskSchema } from '@/features/tasks/task-schema';
import { toTaskDto } from '@/features/tasks/task-mapper';
import {
  authenticatedClient,
  databaseError,
  jsonError,
  parseJson,
  requestError,
} from '@/features/tasks/task-http';

type TaskRouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: TaskRouteContext) {
  try {
    const auth = await authenticatedClient();
    if ('response' in auth) return auth.response;

    const id = taskIdSchema.parse((await context.params).id);
    const { data, error } = await findTask(auth.client, auth.user.id, id);
    if (error) return databaseError(error);
    if (!data) return jsonError(404, 'NOT_FOUND', 'Task not found');

    return Response.json({ data: toTaskDto(data) });
  } catch (error) {
    return requestError(error);
  }
}

export async function PATCH(request: Request, context: TaskRouteContext) {
  try {
    const auth = await authenticatedClient();
    if ('response' in auth) return auth.response;

    const id = taskIdSchema.parse((await context.params).id);
    const input = updateTaskSchema.parse(await parseJson(request));
    const { data, error } = await updateTask(auth.client, auth.user.id, id, input);
    if (error) return databaseError(error);
    if (!data) return jsonError(404, 'NOT_FOUND', 'Task not found');

    return Response.json({ data: toTaskDto(data) });
  } catch (error) {
    return requestError(error);
  }
}

export async function DELETE(_request: Request, context: TaskRouteContext) {
  try {
    const auth = await authenticatedClient();
    if ('response' in auth) return auth.response;

    const id = taskIdSchema.parse((await context.params).id);
    const { data, error } = await deleteTask(auth.client, auth.user.id, id);
    if (error) return databaseError(error);
    if (!data) return jsonError(404, 'NOT_FOUND', 'Task not found');

    return new Response(null, { status: 204 });
  } catch (error) {
    return requestError(error);
  }
}

