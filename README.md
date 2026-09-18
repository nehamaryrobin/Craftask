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

## Structure

- `src/app`: App Router entry point, metadata, global styles and theme.
- `src/components/layout`: Sidebar and header.
- `src/components/dashboard`: Dashboard, task list and dialog, summary cards, secondary view previews.
- `src/components/ui`: shadcn/ui primitives.
- `src/data`: Realistic mock tasks, habits and weekly activity.
- `src/types`: Shared domain types.
- `src/lib`: Shared utilities.
- `tests`: Desktop and mobile browser smoke checks.

## Preview scope

Today is the primary dashboard. Add tasks, complete/reopen tasks, search with Cmd/Ctrl+K, check in habits, collapse navigation, and explore the additional mock views. State lasts for the current session and resets on reload. Weekly history is illustrative mock data. Planning, matrix, reports and settings screens are initial previews.

Supabase, authentication, drag-and-drop, persistence and Recharts are intentionally deferred.
