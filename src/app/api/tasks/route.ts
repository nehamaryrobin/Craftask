import { createTask, listTasks } from '@/features/tasks/task-repository';
import { createTaskSchema, taskQuerySchema } from '@/features/tasks/task-schema';
import { toTaskDto } from '@/features/tasks/task-mapper';
import {
  authenticatedClient,
  databaseError,
  parseJson,
  requestError,
} from '@/features/tasks/task-http';

export async function GET(request: Request) {
  try {
    const auth = await authenticatedClient();
    if ('response' in auth) return auth.response;

    const searchParams = Object.fromEntries(new URL(request.url).searchParams);
    const filters = taskQuerySchema.parse(searchParams);
    const { data, error } = await listTasks(auth.client, auth.user.id, filters);
    if (error) return databaseError(error);

    return Response.json({ data: data.map(toTaskDto) });
  } catch (error) {
    return requestError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticatedClient();
    if ('response' in auth) return auth.response;

    const input = createTaskSchema.parse(await parseJson(request));
    const { data, error } = await createTask(auth.client, auth.user.id, input);
    if (error) return databaseError(error);

    return Response.json({ data: toTaskDto(data) }, { status: 201 });
  } catch (error) {
    return requestError(error);
  }
}
