create type public.task_priority as enum ('low', 'medium', 'high');

-- This minimal projects table makes the task migration runnable today. It can
-- be expanded when the Project model is implemented without changing task IDs.
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name varchar(255) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name varchar(255) not null check (char_length(trim(name)) between 1 and 255),
  description text,

  scheduled_date date,
  scheduled_time time,
  deadline timestamptz,

  priority public.task_priority,

  is_completed boolean not null default false,
  completed_at timestamptz,

  project_id uuid,
  parent_task_id uuid,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, user_id),
  constraint tasks_project_owner_fk
    foreign key (project_id, user_id)
    references public.projects(id, user_id)
    on delete set null (project_id),
  constraint tasks_parent_owner_fk
    foreign key (parent_task_id, user_id)
    references public.tasks(id, user_id)
    on delete set null (parent_task_id),
  constraint tasks_cannot_parent_themselves
    check (parent_task_id is null or parent_task_id <> id),
  constraint tasks_completion_timestamp_consistent
    check (
      (is_completed and completed_at is not null)
      or (not is_completed and completed_at is null)
    )
);

create index tasks_user_schedule_idx
  on public.tasks (user_id, scheduled_date, scheduled_time);
create index tasks_user_project_idx
  on public.tasks (user_id, project_id);
create index tasks_parent_task_idx
  on public.tasks (parent_task_id);
create index tasks_user_deadline_idx
  on public.tasks (user_id, deadline);
create index tasks_user_completion_idx
  on public.tasks (user_id, is_completed);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.sync_task_completed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_completed and (tg_op = 'INSERT' or not old.is_completed) then
    new.completed_at = coalesce(new.completed_at, now());
  elsif not new.is_completed then
    new.completed_at = null;
  end if;

  return new;
end;
$$;

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger tasks_sync_completed_at
before insert or update of is_completed on public.tasks
for each row execute function public.sync_task_completed_at();

alter table public.projects enable row level security;
alter table public.tasks enable row level security;

create policy "Users can read their own projects"
on public.projects for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own projects"
on public.projects for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own projects"
on public.projects for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own projects"
on public.projects for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read their own tasks"
on public.tasks for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own tasks"
on public.tasks for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own tasks"
on public.tasks for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own tasks"
on public.tasks for delete
to authenticated
using ((select auth.uid()) = user_id);
