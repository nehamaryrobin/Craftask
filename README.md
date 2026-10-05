# Craftask

A warm, focused productivity dashboard built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Lucide icons, and locally bundled Manrope.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000.

## Checks

```sh
npm run lint
npx tsc --noEmit
npm run build
npx playwright test
```

Browser checks expect the dev server on port 3000 and Google Chrome installed.
Authenticated browser checks additionally require `E2E_USER_EMAIL` and
`E2E_USER_PASSWORD`; public authentication checks run without them.

## Structure

- `src/app`: App Router entry point, metadata, global styles and theme.
- `src/components/layout`: Sidebar and header.
- `src/components/dashboard`: Dashboard, task list and dialog, summary cards, secondary view previews.
- `src/components/ui`: shadcn/ui primitives.
- `src/data`: Realistic mock tasks, habits and weekly activity.
- `src/types`: Shared domain types.
- `src/lib`: Shared utilities.
- `tests`: Desktop and mobile browser smoke checks.

## Task backend

The task API uses Supabase Auth and PostgreSQL row-level security.

1. Create a Supabase project and copy `.env.example` to `.env.local`.
2. Set the project URL and publishable key.
3. Apply the SQL files in `supabase/migrations` in timestamp order with the
   Supabase CLI or SQL editor.

For email confirmation, set the Supabase Auth site URL to
`http://localhost:3000` during local development and add
`http://localhost:3000/auth/callback` to the allowed redirect URLs. Set
`NEXT_PUBLIC_SITE_URL` to the deployed origin in production and allow its
`/auth/callback` URL as well.

Authenticated clients can use these JSON endpoints:

- `GET`/`POST /api/tasks`
- `GET`/`PATCH`/`DELETE /api/tasks/:id`
- `GET`/`POST /api/projects`
- `GET`/`PATCH`/`DELETE /api/projects/:id`
- `GET`/`POST /api/habits`
- `GET`/`PATCH`/`DELETE /api/habits/:id`
- `GET`/`POST /api/habits/:id/check-ins`
- `DELETE /api/habits/:id/check-ins/:date`

Task ownership is always derived from the authenticated session; `userId` is
never accepted from request bodies. A task can be attached to a project with
`projectId`, or kept outside projects with `projectId: null`. Deleting a project
keeps its tasks and sets their project to `null`.

`GET /api/tasks` accepts optional `projectId`, `dateToComplete`, `isCompleted`,
and `matrixQuadrant` query parameters. Use `projectId=none` for tasks that do
not belong to a project.

The task write shape is:

```json
{
  "name": "Get the tickets printed",
  "description": null,
  "dateToComplete": "2026-08-20",
  "scheduledTime": "10:00",
  "dateDeadline": "2026-08-23",
  "matrixQuadrant": "urgent_important",
  "isRecurring": false,
  "recurrenceRule": null,
  "isCompleted": false,
  "location": null,
  "projectId": "2fe9b7df-82f9-45cc-a2dd-ec8aa1a57d8b",
  "parentTaskId": null
}
```

The project write shape is:

```json
{
  "name": "Trip to Bali",
  "description": "Everything to finish before the flight",
  "color": "#F59E0B"
}
```

Valid matrix values are `urgent_important`, `important_not_urgent`,
`urgent_not_important`, and `not_urgent_not_important`. When `isRecurring` is
true, `recurrenceRule` is required. The API returns `isRecurring` as a value
generated from the stored recurrence rule.

Habits are stored separately from tasks because they continue indefinitely and
have a history of check-ins. A selected-days habit uses weekday numbers from
`0` (Sunday) through `6` (Saturday):

```json
{
  "name": "Practice LeetCode",
  "description": "Solve at least one problem",
  "frequency": "selected_days",
  "daysOfWeek": [1, 3, 5],
  "startDate": "2026-09-21",
  "isActive": true
}
```

Valid frequencies are `daily`, `weekly`, `monthly`, and `selected_days`.
Create a check-in with `{ "completedOn": "2026-09-21" }`. Check-in history
can be filtered with `from` and `to`, and deleting
`/api/habits/:id/check-ins/2026-09-21` reverses that completion.

Habit responses include `completedToday`, `isScheduledToday`, `currentStreak`,
`longestStreak`, and `totalCheckIns`. Pass `onDate=YYYY-MM-DD` when loading
habits so streaks are calculated using the user's local date; otherwise the
API uses the current UTC date. Daily and selected-day streaks count scheduled
days, while weekly and monthly streaks count successful calendar periods.

## Preview scope

Today is the primary dashboard. Add tasks, complete/reopen tasks, search with Cmd/Ctrl+K, check in habits, collapse navigation, and explore the additional mock views. State lasts for the current session and resets on reload. Weekly history is illustrative mock data. Planning, matrix, reports and settings screens are initial previews.

The dashboard still uses mock data until its client state is connected to the
task API. Drag-and-drop and Recharts are intentionally deferred.
