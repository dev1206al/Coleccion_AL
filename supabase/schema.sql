-- ============================================================
-- COLECCIÓN AL — Schema
-- Ejecutar en Supabase > SQL Editor
-- ============================================================

-- Tipos enumerados
create type public.item_category as enum (
  'figures', 'headphones', 'vinyls', 'lego', 'perfumes'
);

create type public.item_status as enum ('owned', 'sold');

create type public.item_condition as enum (
  'mint', 'near_mint', 'good', 'fair'
);

create type public.wishlist_priority as enum ('high', 'medium', 'low');

-- ============================================================
-- Tabla: collection_items
-- ============================================================
create table public.collection_items (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  category        public.item_category not null,
  status          public.item_status not null default 'owned',
  condition       public.item_condition not null default 'mint',
  brand           text not null default '',
  subcategory     text not null default '',
  acquisition_date date,
  acquisition_price numeric(10, 2),
  estimated_value  numeric(10, 2),
  images          text[] not null default '{}',
  notes           text,
  extra           jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Índices útiles
create index collection_items_user_id_idx on public.collection_items(user_id);
create index collection_items_category_idx on public.collection_items(category);

-- Auto-actualiza updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger collection_items_updated_at
  before update on public.collection_items
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.collection_items enable row level security;

create policy "users see their own items"
  on public.collection_items for select
  using (auth.uid() = user_id);

create policy "users insert their own items"
  on public.collection_items for insert
  with check (auth.uid() = user_id);

create policy "users update their own items"
  on public.collection_items for update
  using (auth.uid() = user_id);

create policy "users delete their own items"
  on public.collection_items for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Tabla: wishlist_items
-- ============================================================
create table public.wishlist_items (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  category     public.item_category not null,
  brand        text not null default '',
  priority     public.wishlist_priority not null default 'medium',
  target_price numeric(10, 2),
  source_url   text,
  notes        text,
  created_at   timestamptz not null default now()
);

create index wishlist_items_user_id_idx on public.wishlist_items(user_id);

alter table public.wishlist_items enable row level security;

create policy "users see their own wishlist"
  on public.wishlist_items for select
  using (auth.uid() = user_id);

create policy "users insert their own wishlist"
  on public.wishlist_items for insert
  with check (auth.uid() = user_id);

create policy "users update their own wishlist"
  on public.wishlist_items for update
  using (auth.uid() = user_id);

create policy "users delete their own wishlist"
  on public.wishlist_items for delete
  using (auth.uid() = user_id);
