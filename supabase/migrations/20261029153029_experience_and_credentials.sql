create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  role_title text not null,
  organization text not null,
  employment_type text not null default '',
  workplace_type text not null default '',
  location text not null default '',
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  description text not null default '',
  display_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint experiences_date_range_check check (end_date is null or end_date >= start_date),
  constraint experiences_current_end_date_check check (not is_current or end_date is null)
);

create table if not exists public.awards_certificates (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('award', 'certification')),
  title text not null,
  issuer text not null default '',
  description text not null default '',
  issued_on date,
  expires_on date,
  credential_id text not null default '',
  credential_url text not null default '',
  image_path text not null default '',
  display_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint awards_certificates_date_range_check check (expires_on is null or issued_on is null or expires_on >= issued_on)
);

create index if not exists experiences_public_order_idx
  on public.experiences (published, display_order, start_date desc);
create index if not exists awards_certificates_public_order_idx
  on public.awards_certificates (published, display_order, issued_on desc);

alter table public.experiences enable row level security;
alter table public.awards_certificates enable row level security;

create policy "Public can view published experiences" on public.experiences
  for select to anon, authenticated
  using (published or (select private.is_portfolio_admin()));
create policy "Admins manage experiences" on public.experiences
  for all to authenticated
  using ((select private.is_portfolio_admin()))
  with check ((select private.is_portfolio_admin()));

create policy "Public can view published awards and certificates" on public.awards_certificates
  for select to anon, authenticated
  using (published or (select private.is_portfolio_admin()));
create policy "Admins manage awards and certificates" on public.awards_certificates
  for all to authenticated
  using ((select private.is_portfolio_admin()))
  with check ((select private.is_portfolio_admin()));

grant select on public.experiences, public.awards_certificates to anon, authenticated;
grant insert, update, delete on public.experiences, public.awards_certificates to authenticated;