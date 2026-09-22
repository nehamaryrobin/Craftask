import { toHabitCheckInDto } from '@/features/habits/habit-mapper';
import {
  createHabitCheckIn,
  findHabit,
  listHabitCheckIns,
} from '@/features/habits/habit-repository';
import { checkInQuerySchema, checkInSchema, habitIdSchema } from '@/features/habits/habit-schema';
import { isHabitScheduledOnDate } from '@/features/habits/habit-streak';
import {
  authenticatedClient,
  databaseError,
  jsonError,
  parseJson,
  requestError,
} from '@/features/tasks/task-http';

type CheckInRouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: CheckInRouteContext) {
  try {
    const auth = await authenticatedClient();
    if ('response' in auth) return auth.response;

    const id = habitIdSchema.parse((await context.params).id);
    const filters = checkInQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const { data: habit, error: habitError } = await findHabit(auth.client, auth.user.id, id);
    if (habitError) return databaseError(habitError, 'habit');
    if (!habit) return jsonError(404, 'NOT_FOUND', 'Habit not found');

    const { data, error } = await listHabitCheckIns(
      auth.client,
      auth.user.id,
      id,
      filters,
    );
    if (error) return databaseError(error, 'habit check-in');

    return Response.json({ data: data.map(toHabitCheckInDto) });
  } catch (error) {
    return requestError(error);
  }
}

export async function POST(request: Request, context: CheckInRouteContext) {
  try {
    const auth = await authenticatedClient();
    if ('response' in auth) return auth.response;

    const id = habitIdSchema.parse((await context.params).id);
    const input = checkInSchema.parse(await parseJson(request));
    const { data: habit, error: habitError } = await findHabit(auth.client, auth.user.id, id);
    if (habitError) return databaseError(habitError, 'habit');
    if (!habit) return jsonError(404, 'NOT_FOUND', 'Habit not found');

    const isScheduled = isHabitScheduledOnDate(
      {
        frequency: habit.frequency,
        daysOfWeek: habit.days_of_week,
        startDate: habit.start_date,
      },
      input.completedOn,
    );
    if (!isScheduled) {
      return jsonError(422, 'NOT_SCHEDULED', 'The habit is not scheduled for this date');
    }

    const { data, error } = await createHabitCheckIn(
      auth.client,
      auth.user.id,
      id,
      input.completedOn,
    );
    if (error) return databaseError(error, 'habit check-in');

    return Response.json({ data: toHabitCheckInDto(data) }, { status: 201 });
  } catch (error) {
    return requestError(error);
  }
}

