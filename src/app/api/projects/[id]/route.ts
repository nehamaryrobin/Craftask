import { toProjectDto } from '@/features/projects/project-mapper';
import {
  deleteProject,
  findProject,
  updateProject,
} from '@/features/projects/project-repository';
import { projectIdSchema, updateProjectSchema } from '@/features/projects/project-schema';
import {
  authenticatedClient,
  databaseError,
  jsonError,
  parseJson,
  requestError,
} from '@/features/tasks/task-http';

type ProjectRouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: ProjectRouteContext) {
  try {
    const auth = await authenticatedClient();
    if ('response' in auth) return auth.response;

    const id = projectIdSchema.parse((await context.params).id);
    const { data, error } = await findProject(auth.client, auth.user.id, id);
    if (error) return databaseError(error, 'project');
    if (!data) return jsonError(404, 'NOT_FOUND', 'Project not found');

    return Response.json({ data: toProjectDto(data) });
  } catch (error) {
    return requestError(error);
  }
}

export async function PATCH(request: Request, context: ProjectRouteContext) {
  try {
    const auth = await authenticatedClient();
    if ('response' in auth) return auth.response;

    const id = projectIdSchema.parse((await context.params).id);
    const input = updateProjectSchema.parse(await parseJson(request));
    const { data, error } = await updateProject(auth.client, auth.user.id, id, input);
    if (error) return databaseError(error, 'project');
    if (!data) return jsonError(404, 'NOT_FOUND', 'Project not found');

    return Response.json({ data: toProjectDto(data) });
  } catch (error) {
    return requestError(error);
  }
}

export async function DELETE(_request: Request, context: ProjectRouteContext) {
  try {
    const auth = await authenticatedClient();
    if ('response' in auth) return auth.response;

    const id = projectIdSchema.parse((await context.params).id);
    const { data, error } = await deleteProject(auth.client, auth.user.id, id);
    if (error) return databaseError(error, 'project');
    if (!data) return jsonError(404, 'NOT_FOUND', 'Project not found');

    return new Response(null, { status: 204 });
  } catch (error) {
    return requestError(error);
  }
}

