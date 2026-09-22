import { deleteHabitCheckIn, findHabit } from '@/features/habits/habit-repository';
import { habitIdSchema } from '@/features/habits/habit-schema';
import {
  authenticatedClient,
  databaseError,
  jsonError,
  requestError,
} from '@/features/tasks/task-http';
import { z } from 'zod';

type CheckInDateRouteContext = { params: Promise<{ id: string; date: string }> };

export async function DELETE(_request: Request, context: CheckInDateRouteContext) {
  try {
    const auth = await authenticatedClient();
    if ('response' in auth) return auth.response;

    const params = await context.params;
    const id = habitIdSchema.parse(params.id);
    const completedOn = z.string().date().parse(params.date);
    const { data: habit, error: habitError } = await findHabit(auth.client, auth.user.id, id);
    if (habitError) return databaseError(habitError, 'habit');
    if (!habit) return jsonError(404, 'NOT_FOUND', 'Habit not found');

    const { data, error } = await deleteHabitCheckIn(
      auth.client,
      auth.user.id,
      id,
      completedOn,
    );
    if (error) return databaseError(error, 'habit check-in');
    if (!data) return jsonError(404, 'NOT_FOUND', 'Habit check-in not found');

    return new Response(null, { status: 204 });
  } catch (error) {
    return requestError(error);
  }
}

