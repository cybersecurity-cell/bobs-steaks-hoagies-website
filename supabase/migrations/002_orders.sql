-- ============================================================
-- 002_orders.sql
-- Orders, order_items, and webhook audit log for Bob's S&H
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── orders ───────────────────────────────────────────────────
create table if not exists public.orders (
  id                   text        primary key default 'ORD-' || lower(encode(gen_random_bytes(6), 'hex')),
  customer_phone       text        not null,
  items                jsonb       not null default '[]',
  subtotal             numeric(10,2) not null,
  tax                  numeric(10,2) not null,
  total                numeric(10,2) not null,
  status               text        not null default 'pending'
                         check (status in ('pending','paid','in_progress','ready','completed','failed')),
  order_type           text        not null default 'pickup'
                         check (order_type in ('pickup','delivery')),
  special_note         text,

  -- Payment (pluggable — Square, Stripe, Clover, etc.)
  payment_provider     text,
  payment_external_id  text,
  payment_url          text,

  -- POS integration (Toast, Lightspeed, etc.)
  pos_provider         text,
  pos_external_id      text,
  pos_error            text,

  created_at           timestamptz not null default now(),
  paid_at              timestamptz
);

-- Index for common lookups
create index if not exists orders_customer_phone_idx on public.orders (customer_phone);
create index if not exists orders_status_idx         on public.orders (status);
create index if not exists orders_created_at_idx     on public.orders (created_at desc);

-- ── order_items ──────────────────────────────────────────────
-- Denormalised snapshot at time of order (price may change later)
create table if not exists public.order_items (
  id              bigint      generated always as identity primary key,
  order_id        text        not null references public.orders (id) on delete cascade,
  item_id         text        not null,
  item_name       text        not null,
  size            text,
  customizations  jsonb       default '{}',
  quantity        int         not null check (quantity > 0),
  unit_price      numeric(10,2) not null,
  line_total      numeric(10,2) generated always as (quantity * unit_price) stored
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- ── webhook_events ───────────────────────────────────────────
-- Audit log: every inbound webhook (payment or POS) is logged here
create table if not exists public.webhook_events (
  id           bigint      generated always as identity primary key,
  provider     text        not null,   -- 'square' | 'stripe' | 'paypal' | 'toast' | etc.
  event_type   text        not null,   -- provider-specific event name
  external_id  text        not null,   -- provider's unique event / object id
  order_id     text        references public.orders (id),
  payload      jsonb       not null,
  processed    boolean     not null default false,
  error        text,
  created_at   timestamptz not null default now()
);

create index if not exists webhook_events_external_id_idx on public.webhook_events (external_id);
create index if not exists webhook_events_order_id_idx    on public.webhook_events (order_id);

-- ── Row Level Security ───────────────────────────────────────
-- Orders are created and read by the backend (service role only).
-- No public access — the website never queries Supabase directly from the browser.

alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.webhook_events enable row level security;

-- Service role bypasses RLS by default in Supabase — nothing extra needed.
-- If you add authenticated kitchen staff, grant them read here:
--
--   create policy "kitchen_read_orders"
--     on public.orders for select
--     using (auth.role() = 'authenticated');

-- ── Kitchen queue view ───────────────────────────────────────
-- Convenience view for the kitchen display page (Phase 4).
create or replace view public.kitchen_queue as
  select
    o.id,
    o.status,
    o.order_type,
    o.customer_phone,
    o.items,
    o.special_note,
    o.created_at,
    o.paid_at
  from public.orders o
  where o.status in ('paid', 'in_progress', 'ready')
  order by o.created_at asc;
