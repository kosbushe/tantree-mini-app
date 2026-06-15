create table if not exists public.daily_draws (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null,
  draw_date date not null,
  card_id integer not null check (card_id between 1 and 72),
  created_at timestamptz not null default now(),
  unique (telegram_id, draw_date)
);

create index if not exists idx_daily_draws_telegram_date
  on public.daily_draws (telegram_id, draw_date desc);

alter table public.daily_draws enable row level security;

create policy "daily_draws_select"
  on public.daily_draws
  for select
  using (true);

create policy "daily_draws_insert"
  on public.daily_draws
  for insert
  with check (true);
