import { toHabitDto } from '@/features/habits/habit-mapper';
import {
  deleteHabit,
  findHabit,
  listHabitCheckIns,
  updateHabit,
} from '@/features/habits/habit-repository';
import { utcDateToday } from '@/features/habits/habit-response';
import {
  habitIdSchema,
  habitReferenceDateSchema,
  updateHabitSchema,
} from '@/features/habits/habit-schema';
import {
  authenticatedClient,
  databaseError,
  jsonError,
  parseJson,
  requestError,
} from '@/features/tasks/task-http';

type HabitRouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: HabitRouteContext) {
  try {
    const auth = await authenticatedClient();
    if ('response' in auth) return auth.response;

    const id = habitIdSchema.parse((await context.params).id);
    const query = habitReferenceDateSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const { data: habit, error: habitError } = await findHabit(auth.client, auth.user.id, id);
    if (habitError) return databaseError(habitError, 'habit');
    if (!habit) return jsonError(404, 'NOT_FOUND', 'Habit not found');

    const { data: checkIns, error: checkInError } = await listHabitCheckIns(
      auth.client,
      auth.user.id,
      id,
    );
    if (checkInError) return databaseError(checkInError, 'habit check-in');

    return Response.json({
      data: toHabitDto(
        habit,
        checkIns.map((checkIn) => checkIn.completed_on),
        query.onDate ?? utcDateToday(),
      ),
    });
  } catch (error) {
    return requestError(error);
  }
}

export async function PATCH(request: Request, context: HabitRouteContext) {
  try {
    const auth = await authenticatedClient();
    if ('response' in auth) return auth.response;

    const id = habitIdSchema.parse((await context.params).id);
    const input = updateHabitSchema.parse(await parseJson(request));
    const { data: habit, error: habitError } = await updateHabit(
      auth.client,
      auth.user.id,
      id,
      input,
    );
    if (habitError) return databaseError(habitError, 'habit');
    if (!habit) return jsonError(404, 'NOT_FOUND', 'Habit not found');

    const { data: checkIns, error: checkInError } = await listHabitCheckIns(
      auth.client,
      auth.user.id,
      id,
    );
    if (checkInError) return databaseError(checkInError, 'habit check-in');

    return Response.json({
      data: toHabitDto(
        habit,
        checkIns.map((checkIn) => checkIn.completed_on),
        utcDateToday(),
      ),
    });
  } catch (error) {
    return requestError(error);
  }
}

export async function DELETE(_request: Request, context: HabitRouteContext) {
  try {
    const auth = await authenticatedClient();
    if ('response' in auth) return auth.response;

    const id = habitIdSchema.parse((await context.params).id);
    const { data, error } = await deleteHabit(auth.client, auth.user.id, id);
    if (error) return databaseError(error, 'habit');
    if (!data) return jsonError(404, 'NOT_FOUND', 'Habit not found');

    return new Response(null, { status: 204 });
  } catch (error) {
    return requestError(error);
  }
}

