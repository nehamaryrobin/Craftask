alter table public.tasks
  add column sort_order double precision;

update public.tasks
set sort_order = extract(epoch from created_at) * 1000;

alter table public.tasks
  alter column sort_order set not null,
  alter column sort_order set default (extract(epoch from clock_timestamp()) * 1000);

create index tasks_user_sort_order_idx
  on public.tasks (user_id, sort_order);

