-- TANTREE: users and daily card draws

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id bigint primary key,
  username text,
  first_name text,
  last_name text,
  language_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.card_draws (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null references public.users (id) on delete cascade,
  card_id integer not null check (card_id between 1 and 72),
  drawn_at timestamptz not null default now()
);

create index if not exists idx_card_draws_user_drawn_at
  on public.card_draws (user_id, drawn_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;

create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();
