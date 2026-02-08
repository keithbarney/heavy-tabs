create table public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  event_name text not null,
  user_id uuid references auth.users(id) on delete set null,
  project_id uuid,  -- no FK (avoids RLS conflicts on anonymous inserts)
  properties jsonb,
  created_at timestamptz default now()
);

alter table public.analytics_events enable row level security;

-- Anyone can insert (anonymous + authenticated)
create policy "Anyone can insert analytics events"
  on public.analytics_events for insert with check (true);

-- Users can only read their own events
create policy "Users can view own analytics events"
  on public.analytics_events for select using (auth.uid() = user_id);

-- Indexes for dashboard queries
create index analytics_events_project_id_idx on public.analytics_events(project_id);
create index analytics_events_user_id_idx on public.analytics_events(user_id);
create index analytics_events_created_at_idx on public.analytics_events(created_at desc);
