import { toProjectDto } from '@/features/projects/project-mapper';
import { createProject, listProjects } from '@/features/projects/project-repository';
import { createProjectSchema } from '@/features/projects/project-schema';
import {
  authenticatedClient,
  databaseError,
  parseJson,
  requestError,
} from '@/features/tasks/task-http';

export async function GET() {
  try {
    const auth = await authenticatedClient();
    if ('response' in auth) return auth.response;

    const { data, error } = await listProjects(auth.client, auth.user.id);
    if (error) return databaseError(error, 'project');

    return Response.json({ data: data.map(toProjectDto) });
  } catch (error) {
    return requestError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticatedClient();
    if ('response' in auth) return auth.response;

    const input = createProjectSchema.parse(await parseJson(request));
    const { data, error } = await createProject(auth.client, auth.user.id, input);
    if (error) return databaseError(error, 'project');

    return Response.json({ data: toProjectDto(data) }, { status: 201 });
  } catch (error) {
    return requestError(error);
  }
}

