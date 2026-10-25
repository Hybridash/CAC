-- Bio Bites on Supabase: game data keyed to Supabase Auth users.
-- Replaces server/src/db.ts. Sessions, identities and email_accounts are gone: Supabase Auth
-- owns email/password, Apple and Google sign-in. Clients may only READ their own rows; every
-- write goes through the API server with the service role key (it grants ATP and grades quizzes).

create table public.players (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  atp integer not null default 0 check (atp >= 0),
  nucleotides integer not null default 0 check (nucleotides >= 0),
  equipped_avatar text,
  display_name text not null default 'Explorer',
  streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_day date
);

create table public.concept_progress (
  user_id uuid not null references public.players(id) on delete cascade,
  concept_id text not null,
  interaction_done_at timestamptz,
  quiz_passed_at timestamptz,
  quiz_perfect boolean not null default false,
  best_score integer not null default 0,
  last_quiz_at timestamptz,
  last_quiz_reward_at timestamptz,
  completed_at timestamptz,
  primary key (user_id, concept_id)
);

create table public.inventory (
  user_id uuid not null references public.players(id) on delete cascade,
  avatar_id text not null,
  count integer not null default 1,
  acquired_at timestamptz not null default now(),
  primary key (user_id, avatar_id)
);

create table public.achievements (
  user_id uuid not null references public.players(id) on delete cascade,
  key text not null,
  awarded_at timestamptz not null default now(),
  primary key (user_id, key)
);

create table public.mystery_progress (
  user_id uuid not null references public.players(id) on delete cascade,
  mystery_id text not null,
  attempts integer not null default 0,
  solved_at timestamptz,
  primary key (user_id, mystery_id)
);

create table public.ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.players(id) on delete cascade,
  currency text not null check (currency in ('atp', 'nucleotides')),
  amount integer not null,
  reason text not null,
  ref text,
  created_at timestamptz not null default now()
);
create index ledger_user on public.ledger (user_id, created_at);

create table public.pack_openings (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.players(id) on delete cascade,
  tier text not null,
  results jsonb not null,
  created_at timestamptz not null default now()
);

-- Bio Bot daily limits (per player, and server-wide to cap AI spend). Server-only.
create table public.chat_usage (
  user_id uuid not null references public.players(id) on delete cascade,
  day date not null,
  count integer not null default 0,
  primary key (user_id, day)
);
create table public.chat_global (
  day date primary key,
  count integer not null default 0
);

-- Every new Supabase Auth user (email, Apple, Google, anonymous guest) gets a player row.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.players (id) values (new.id);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row level security: players read only their own data; nothing is writable from a client.
alter table public.players enable row level security;
alter table public.concept_progress enable row level security;
alter table public.inventory enable row level security;
alter table public.achievements enable row level security;
alter table public.mystery_progress enable row level security;
alter table public.ledger enable row level security;
alter table public.pack_openings enable row level security;
alter table public.chat_usage enable row level security;
alter table public.chat_global enable row level security;

create policy "read own player" on public.players for select to authenticated using (id = (select auth.uid()));
create policy "read own progress" on public.concept_progress for select to authenticated using (user_id = (select auth.uid()));
create policy "read own inventory" on public.inventory for select to authenticated using (user_id = (select auth.uid()));
create policy "read own achievements" on public.achievements for select to authenticated using (user_id = (select auth.uid()));
create policy "read own mysteries" on public.mystery_progress for select to authenticated using (user_id = (select auth.uid()));
create policy "read own ledger" on public.ledger for select to authenticated using (user_id = (select auth.uid()));
create policy "read own packs" on public.pack_openings for select to authenticated using (user_id = (select auth.uid()));
-- chat_usage and chat_global: no policies, so only the service role can touch them.
