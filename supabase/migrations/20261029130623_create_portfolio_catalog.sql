-- Portfolio catalog schema. Visitors use the anon role; only UUIDs placed in
-- private.portfolio_admins can manage content.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table private.portfolio_admins enable row level security;

create or replace function private.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from private.portfolio_admins
    where user_id = (select auth.uid())
  );
$$;
revoke all on function private.is_portfolio_admin() from public, anon;
grant usage on schema private to anon, authenticated;
-- RLS expressions invoke this for public project reads; anon users resolve to false.
grant execute on function private.is_portfolio_admin() to anon, authenticated;

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$ select private.is_portfolio_admin(); $$;
revoke all on function public.is_portfolio_admin() from public, anon;
grant execute on function public.is_portfolio_admin() to authenticated;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null default '',
  headline text not null default '',
  bio text not null default '',
  avatar_url text,
  location text not null default '',
  email text not null default '',
  website_url text,
  social_links jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null default '',
  description text not null default '',
  project_url text,
  source_url text,
  featured boolean not null default false,
  published boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null unique,
  alt_text text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.technologies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('tool', 'language', 'framework', 'other')),
  unique (name, kind)
);

create table if not exists public.project_technologies (
  project_id uuid not null references public.projects(id) on delete cascade,
  technology_id uuid not null references public.technologies(id) on delete cascade,
  primary key (project_id, technology_id)
);

create table if not exists public.ui_settings (
  id integer primary key default 1 check (id = 1),
  background_color text not null default '#f6f4ef',
  surface_color text not null default '#ffffff',
  primary_color text not null default '#253c35',
  secondary_color text not null default '#bf6849',
  text_color text not null default '#222923',
  muted_color text not null default '#737a72',
  background_image_url text,
  header_font text not null default 'DM Serif Display',
  body_font text not null default 'DM Sans',
  header_text text not null default 'Selected work',
  body_text text not null default 'A collection of things made with care.',
  updated_at timestamptz not null default now()
);

insert into public.ui_settings (id) values (1) on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.technologies enable row level security;
alter table public.project_technologies enable row level security;
alter table public.ui_settings enable row level security;

create policy "Public can view portfolio profile" on public.profiles
  for select to anon, authenticated using (true);
create policy "Admins manage portfolio profile" on public.profiles
  for all to authenticated using ((select private.is_portfolio_admin()))
  with check ((select private.is_portfolio_admin()));

create policy "Public can view published projects" on public.projects
  for select to anon, authenticated using (published or (select private.is_portfolio_admin()));
create policy "Admins manage projects" on public.projects
  for all to authenticated using ((select private.is_portfolio_admin()))
  with check ((select private.is_portfolio_admin()));

create policy "Public can view images for published projects" on public.project_images
  for select to anon, authenticated using (
    exists (select 1 from public.projects p where p.id = project_id and (p.published or (select private.is_portfolio_admin())))
  );
create policy "Admins manage project images" on public.project_images
  for all to authenticated using ((select private.is_portfolio_admin()))
  with check ((select private.is_portfolio_admin()));

create policy "Public can view technologies" on public.technologies
  for select to anon, authenticated using (true);
create policy "Admins manage technologies" on public.technologies
  for all to authenticated using ((select private.is_portfolio_admin()))
  with check ((select private.is_portfolio_admin()));

create policy "Public can view project technology links" on public.project_technologies
  for select to anon, authenticated using (
    exists (select 1 from public.projects p where p.id = project_id and (p.published or (select private.is_portfolio_admin())))
  );
create policy "Admins manage project technology links" on public.project_technologies
  for all to authenticated using ((select private.is_portfolio_admin()))
  with check ((select private.is_portfolio_admin()));

create policy "Public can view UI settings" on public.ui_settings
  for select to anon, authenticated using (true);
create policy "Admins manage UI settings" on public.ui_settings
  for all to authenticated using ((select private.is_portfolio_admin()))
  with check ((select private.is_portfolio_admin()));

grant select on public.profiles, public.projects, public.project_images,
  public.technologies, public.project_technologies, public.ui_settings to anon, authenticated;
grant insert, update, delete on public.profiles, public.projects, public.project_images,
  public.technologies, public.project_technologies, public.ui_settings to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-images', 'portfolio-images', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view portfolio images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'portfolio-images');
create policy "Admins upload portfolio images" on storage.objects
  for insert to authenticated with check (bucket_id = 'portfolio-images' and (select private.is_portfolio_admin()));
create policy "Admins update portfolio images" on storage.objects
  for update to authenticated using (bucket_id = 'portfolio-images' and (select private.is_portfolio_admin()))
  with check (bucket_id = 'portfolio-images' and (select private.is_portfolio_admin()));
create policy "Admins delete portfolio images" on storage.objects
  for delete to authenticated using (bucket_id = 'portfolio-images' and (select private.is_portfolio_admin()));

-- After an owner account exists, run this in SQL Editor with that account's
-- exact email to grant the admin role. Do not grant admin from user metadata.
-- insert into private.portfolio_admins (user_id)
-- select id from auth.users where lower(email) = lower('you@example.com')
-- on conflict do nothing;
