create type public.habit_frequency as enum (
  'daily',
  'weekly',
  'monthly',
  'selected_days'
);

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name varchar(255) not null check (char_length(trim(name)) between 1 and 255),
  description text,
  frequency public.habit_frequency not null,
  days_of_week smallint[],
  start_date date not null default current_date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, user_id),
  constraint habits_selected_days_valid check (
    (
      frequency = 'selected_days'
      and days_of_week is not null
      and cardinality(days_of_week) between 1 and 7
      and days_of_week <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]
    )
    or
    (
      frequency <> 'selected_days'
      and days_of_week is null
    )
  )
);

create table public.habit_check_ins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null,
  user_id uuid not null,
  completed_on date not null,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  constraint habit_check_ins_owner_fk
    foreign key (habit_id, user_id)
    references public.habits(id, user_id)
    on delete cascade,
  unique (habit_id, completed_on)
);

create trigger habits_set_updated_at
before update on public.habits
for each row execute function public.set_updated_at();

create index habits_user_active_idx
  on public.habits (user_id, is_active, created_at);
create index habit_check_ins_user_date_idx
  on public.habit_check_ins (user_id, completed_on desc);
create index habit_check_ins_habit_date_idx
  on public.habit_check_ins (habit_id, completed_on desc);

alter table public.habits enable row level security;
alter table public.habit_check_ins enable row level security;

create policy "Users can read their own habits"
on public.habits for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own habits"
on public.habits for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own habits"
on public.habits for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own habits"
on public.habits for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read their own habit check-ins"
on public.habit_check_ins for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own habit check-ins"
on public.habit_check_ins for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own habit check-ins"
on public.habit_check_ins for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own habit check-ins"
on public.habit_check_ins for delete
to authenticated
using ((select auth.uid()) = user_id);

