-- Wishlist table
create table if not exists wishlist_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  category      item_category not null,
  brand         text not null default '',
  priority      text not null default 'medium' check (priority in ('high','medium','low')),
  target_price  numeric(10,2),
  source_url    text,
  notes         text,
  created_at    timestamptz not null default now()
);

alter table wishlist_items enable row level security;

create policy "Users manage own wishlist"
  on wishlist_items for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
