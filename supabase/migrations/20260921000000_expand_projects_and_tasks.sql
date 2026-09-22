create type public.eisenhower_quadrant as enum (
  'urgent_important',
  'important_not_urgent',
  'urgent_not_important',
  'not_urgent_not_important'
);

alter table public.projects
  add column description text,
  add column color varchar(20);

alter table public.tasks
  drop column priority,
  alter column deadline type date using ((deadline at time zone 'UTC')::date),
  add column matrix_quadrant public.eisenhower_quadrant,
  add column recurrence_rule text,
  add column is_recurring boolean
    generated always as (recurrence_rule is not null) stored,
  add column location text,
  add constraint tasks_recurrence_rule_not_blank
    check (recurrence_rule is null or char_length(trim(recurrence_rule)) > 0);

drop type public.task_priority;

create index tasks_user_matrix_quadrant_idx
  on public.tasks (user_id, matrix_quadrant)
  where matrix_quadrant is not null;

