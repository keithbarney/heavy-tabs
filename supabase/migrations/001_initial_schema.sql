-- Heavy Tabs Database Schema
-- Run this migration in your Supabase SQL Editor

-- 1. Profiles table (auto-created on signup)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Projects table (user's saved tabs)
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_name text not null default 'Untitled Project',
  bpm integer not null default 120,
  time_signature jsonb not null default '{"label": "4/4", "beats": 4, "noteValue": 4}'::jsonb,
  note_resolution jsonb not null default '{"label": "1/16", "perQuarter": 4}'::jsonb,
  project_key text not null default 'E',
  tunings jsonb not null default '{"guitar": "standard", "bass": "standard"}'::jsonb,
  string_counts jsonb not null default '{"guitar": 6, "bass": 4}'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  tab_data jsonb not null default '{}'::jsonb,
  local_id text, -- for migration mapping from localStorage
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.projects enable row level security;

-- Projects policies
create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Index for faster queries
create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_updated_at_idx on public.projects(updated_at desc);


-- 3. Shared links table (public sharing)
create table if not exists public.shared_links (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  slug text unique not null, -- 8-char URL-safe ID
  is_active boolean default true,
  allow_copy boolean default true,
  view_count integer default 0,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.shared_links enable row level security;

-- Shared links policies

-- Users can manage their own share links
create policy "Users can view own share links"
  on public.shared_links for select
  using (auth.uid() = user_id);

create policy "Users can insert own share links"
  on public.shared_links for insert
  with check (auth.uid() = user_id);

create policy "Users can update own share links"
  on public.shared_links for update
  using (auth.uid() = user_id);

create policy "Users can delete own share links"
  on public.shared_links for delete
  using (auth.uid() = user_id);

-- Anyone can view active share links (for public sharing)
create policy "Anyone can view active share links by slug"
  on public.shared_links for select
  using (is_active = true);

-- Index for faster slug lookups
create index if not exists shared_links_slug_idx on public.shared_links(slug);


-- 4. Policy for public project viewing via share links
-- Allow viewing projects that have active share links
create policy "Anyone can view projects with active share links"
  on public.projects for select
  using (
    exists (
      select 1 from public.shared_links
      where shared_links.project_id = projects.id
      and shared_links.is_active = true
    )
  );


-- 5. Updated_at trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_projects_updated_at
  before update on public.projects
  for each row execute procedure public.update_updated_at_column();
