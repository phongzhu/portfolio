create table if not exists public.portfolio_skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default '',
  proficiency text not null default '',
  description text not null default '',
  display_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text not null default '',
  field_of_study text not null default '',
  start_date date,
  end_date date,
  is_current boolean not null default false,
  description text not null default '',
  activities text not null default '',
  related_skills text[] not null default '{}',
  display_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint education_date_range_check check (start_date is null or end_date is null or end_date >= start_date),
  constraint education_current_end_date_check check (not is_current or end_date is null)
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  content text not null default '',
  media_paths text[] not null default '{}',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activities_content_or_media_check check (length(trim(content)) > 0 or cardinality(media_paths) > 0)
);

create index if not exists portfolio_skills_public_order_idx on public.portfolio_skills (published, display_order, name);
create index if not exists education_public_order_idx on public.education (published, display_order, start_date desc);
create index if not exists activities_public_feed_idx on public.activities (published, created_at desc);

alter table public.portfolio_skills enable row level security;
alter table public.education enable row level security;
alter table public.activities enable row level security;

create policy "Public can view published portfolio skills" on public.portfolio_skills
  for select to anon, authenticated
  using (published or (select private.is_portfolio_admin()));
create policy "Admins manage portfolio skills" on public.portfolio_skills
  for all to authenticated
  using ((select private.is_portfolio_admin()))
  with check ((select private.is_portfolio_admin()));

create policy "Public can view published education" on public.education
  for select to anon, authenticated
  using (published or (select private.is_portfolio_admin()));
create policy "Admins manage education" on public.education
  for all to authenticated
  using ((select private.is_portfolio_admin()))
  with check ((select private.is_portfolio_admin()));

create policy "Public can view published activities" on public.activities
  for select to anon, authenticated
  using (published or (select private.is_portfolio_admin()));
create policy "Admins manage activities" on public.activities
  for all to authenticated
  using ((select private.is_portfolio_admin()))
  with check ((select private.is_portfolio_admin()));

grant select on public.portfolio_skills, public.education, public.activities to anon, authenticated;
grant insert, update, delete on public.portfolio_skills, public.education, public.activities to authenticated;
