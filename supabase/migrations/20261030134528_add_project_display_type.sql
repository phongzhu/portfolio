alter table public.projects
  add column if not exists display_type text not null default 'none'
  check (display_type in ('mobile', 'web', 'none'));
