-- AKNO — espace équipe partagé + buckets de données
-- Exécuter dans Supabase → SQL Editor

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Équipe AKNO',
  invite_code text not null unique,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index if not exists workspace_members_user_id_idx on public.workspace_members (user_id);

-- Table distincte de data_buckets (dashboard-keryan / FinPilot) qui utilise user_id
create table if not exists public.workspace_data_buckets (
  workspace_id uuid not null references public.workspaces on delete cascade,
  bucket_key text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (workspace_id, bucket_key)
);

create index if not exists workspace_data_buckets_workspace_id_idx on public.workspace_data_buckets (workspace_id);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_data_buckets enable row level security;

-- Helper : l'utilisateur est membre du workspace
create or replace function public.is_workspace_member(ws_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = ws_id and wm.user_id = auth.uid()
  );
$$;

-- Workspaces : voir ceux dont on est membre
create policy "Members read workspaces"
  on public.workspaces for select
  using (public.is_workspace_member(id));

create policy "Authenticated users create workspaces"
  on public.workspaces for insert
  with check (auth.uid() = created_by);

create policy "Owners update workspace"
  on public.workspaces for update
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = id and wm.user_id = auth.uid() and wm.role = 'owner'
    )
  );

-- Permettre la lecture du workspace via code d'invitation (sans être membre)
create policy "Anyone read workspace by invite code lookup"
  on public.workspaces for select
  using (auth.uid() is not null);

-- Membres
create policy "Users read own memberships"
  on public.workspace_members for select
  using (user_id = auth.uid() or public.is_workspace_member(workspace_id));

create policy "Users join workspace"
  on public.workspace_members for insert
  with check (user_id = auth.uid());

create policy "Owners remove members"
  on public.workspace_members for delete
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
        and wm.user_id = auth.uid()
        and wm.role = 'owner'
    )
  );

-- Data buckets partagés par équipe
create policy "Members read team buckets"
  on public.workspace_data_buckets for select
  using (public.is_workspace_member(workspace_id));

create policy "Members write team buckets"
  on public.workspace_data_buckets for insert
  with check (public.is_workspace_member(workspace_id));

create policy "Members update team buckets"
  on public.workspace_data_buckets for update
  using (public.is_workspace_member(workspace_id));

create policy "Members delete team buckets"
  on public.workspace_data_buckets for delete
  using (public.is_workspace_member(workspace_id));
