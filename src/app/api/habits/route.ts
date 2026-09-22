import { toHabitDto } from '@/features/habits/habit-mapper';
import {
  createHabit,
  listHabits,
  listUserCheckIns,
} from '@/features/habits/habit-repository';
import { habitsWithStats, utcDateToday } from '@/features/habits/habit-response';
import { createHabitSchema, habitReferenceDateSchema } from '@/features/habits/habit-schema';
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

    const query = habitReferenceDateSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const [{ data: habits, error: habitError }, { data: checkIns, error: checkInError }] =
      await Promise.all([
        listHabits(auth.client, auth.user.id),
        listUserCheckIns(auth.client, auth.user.id),
      ]);

    if (habitError) return databaseError(habitError, 'habit');
    if (checkInError) return databaseError(checkInError, 'habit check-in');

    return Response.json({
      data: habitsWithStats(habits, checkIns, query.onDate ?? utcDateToday()),
    });
  } catch (error) {
    return requestError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticatedClient();
    if ('response' in auth) return auth.response;

    const input = createHabitSchema.parse(await parseJson(request));
    const { data, error } = await createHabit(auth.client, auth.user.id, input);
    if (error) return databaseError(error, 'habit');

    return Response.json(
      { data: toHabitDto(data, [], utcDateToday()) },
      { status: 201 },
    );
  } catch (error) {
    return requestError(error);
  }
}

